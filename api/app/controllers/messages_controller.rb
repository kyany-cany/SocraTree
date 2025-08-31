class MessagesController < ApplicationController
  before_action :set_conversation

  # GET /api/conversations/:conversation_id/messages?limit=50&before=2025-08-15T00:00:00Z
  def index
    scope = @conversation.messages # Conversation側の has_many に order(:created_at) が付与済み
    scope = scope.where("created_at < ?", Time.iso8601(params[:before])) if params[:before].present?
    scope = scope.limit(limit_param)

    render json: scope.as_json(only: [:id, :role, :content, :metadata, :token_in, :token_out, :latency_ms, :error_text, :created_at])
  end

  # POST /api/conversations/:conversation_id/messages
  # body: { "message": "こんにちは", "metadata": {...} }
  def create
    user_msg = nil
    assistant_msg = nil

    ActiveRecord::Base.transaction do
      start = Process.clock_gettime(Process::CLOCK_MONOTONIC)

      # 1) ユーザー発話を保存（ログ）
      user_msg = @conversation.messages.create!(
        role: :user,
        content: message_param,
        metadata: metadata_param
      )

      # 2) Gemini呼び出し（サービスへ委譲）
      llm_result = GeminiChatService.call!(
        conversation: @conversation,
        latest_user_message: user_msg
      )
      # 期待フォーマット:
      # { content: "返答", token_in: 123, token_out: 456, latency_ms: 789, model: "gemini-xxx" }

      # 3) アシスタント返答を保存（ログ）
      assistant_msg = @conversation.messages.create!(
        role: :assistant,
        content: llm_result[:content],
        token_in: llm_result[:token_in],
        token_out: llm_result[:token_out],
        latency_ms: llm_result[:latency_ms],
        metadata: { model: llm_result[:model] }
      )

      # （任意）往復の合計時間をメタに入れる
      total_ms = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000).to_i
      assistant_msg.update_column(:metadata, assistant_msg.metadata.merge(total_ms: total_ms))
    end

    render json: {
      user: user_msg.slice(:id, :role, :content, :created_at),
      assistant: assistant_msg.slice(:id, :role, :content, :token_in, :token_out, :latency_ms, :created_at)
    }, status: :created
  rescue => e
    Rails.logger.error(e.full_message)

    # 失敗も履歴に残す
    @conversation.messages.create!(
      role: :system,
      content: "エラーが発生しました",
      error_text: e.message,
      metadata: { kind: "llm_error" }
    )

    render json: { error: "LLM error", detail: e.message }, status: :bad_gateway
  end

  private

  def set_conversation
    @conversation = Conversation.find(params[:conversation_id])
  end

  def message_param
    params.require(:message)
  end

  def metadata_param
    params[:metadata].is_a?(Hash) ? params[:metadata] : {}
  end

  def limit_param
    (params[:limit] || 50).to_i.clamp(1, 200)
  end
end  