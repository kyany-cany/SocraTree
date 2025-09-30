class MessagesController < BaseController
  before_action :set_chat_for_index,  only: :index
  before_action :set_chat_for_create, only: :create
  before_action :set_chat_for_reload, only: :reload
  before_action :set_chat_for_branch, only: :branch

  # GET /chats/:chat_id/messages?limit=50&before=...
  def index
    scope = @chat.messages.where(archived_at: nil).order(:created_at)

    if params[:before].present?
      begin
        t = Time.iso8601(params[:before])
        scope = scope.where("created_at < ?", t)
      rescue ArgumentError
        return render json: { error: "invalid 'before' timestamp" }, status: :bad_request  # ❹
      end
    end

    scope = scope.limit(limit_param)
    render json: scope.as_json(
      only: [:id, :role, :content, :metadata, :token_in, :token_out, :latency_ms, :error_text, :created_at]
    )
  end

  def create
    # 1) ユーザー発話は DB に確定（短いTx）
    user_msg = nil
    is_new_chat = @chat.title.blank? || @chat.title == "New chat"

    ActiveRecord::Base.transaction do
      user_msg = @chat.messages.create!(
        role: :user,
        content: message_param,
        metadata: metadata_param
      )
      # 新規チャットの場合は一時的なタイトルを設定
      if is_new_chat
        @chat.update_columns(title: "生成中...", updated_at: Time.current)
      end
    end

    # 2) LLM 呼び出しは Tx の外（❶）
    llm = GeminiService.call!(chat: @chat, latest_user_message: user_msg)
    assistant_msg = nil

    # 3) アシスタント発話を保存（短いTx）
    start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    ActiveRecord::Base.transaction do
      assistant_msg = @chat.messages.create!(
        role: :assistant,
        content:   llm[:content],
        token_in:  llm[:token_in],
        token_out: llm[:token_out],
        latency_ms: llm[:latency_ms],
        metadata: { model: llm[:model] }
      )
      total_ms = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000).to_i
      assistant_msg.update_column(:metadata, assistant_msg.metadata.merge(total_ms: total_ms))
    end

    # 4) 新規チャットの場合はタイトルを生成
    if is_new_chat
      generated_title = GeminiService.generate_title(user_message: user_msg.content)
      @chat.update_columns(title: generated_title, updated_at: Time.current)
    end

    # ❺ 初回作成時に Location を付ける（任意）
    response.set_header("Location", api_chat_url(@chat)) if request.path == "/api/messages"

    render json: {
      chat:      { id: @chat.id, title: @chat.title, updated_at: @chat.updated_at },
      user_msg:   { id: user_msg.id, created_at: user_msg.created_at, updated_at: user_msg.updated_at },
      assistant_msg: { id: assistant_msg.id, role: assistant_msg.role, content: assistant_msg.content, created_at: assistant_msg.created_at },
      metrics:   { token_in: assistant_msg.token_in, token_out: assistant_msg.token_out, latency_ms: assistant_msg.latency_ms }
    }, status: :created

  rescue => e
    Rails.logger.error(e.full_message)
    begin
      @chat&.messages&.create!(
        role: :system,
        content: "エラーが発生しました",
        error_text: e.message,
        metadata: { kind: "llm_error" }
      )
    rescue StandardError
    end
    render json: { error: "LLM error", detail: e.message }, status: :bad_gateway
  end

  # POST /chats/:chat_id/messages/:id/reload
  def reload
    message = @chat.messages.find(params[:id])

    unless message.role == "assistant"
      return render json: { error: "Only assistant messages can be reloaded" }, status: :bad_request
    end

    # 直前のユーザーメッセージを探す
    user_msg = @chat.messages
                    .where(archived_at: nil)
                    .where(role: :user)
                    .where("created_at < ?", message.created_at)
                    .order(created_at: :desc)
                    .first

    unless user_msg
      return render json: { error: "No user message found before this assistant message" }, status: :bad_request
    end

    # 元のアシスタントメッセージをアーカイブ
    message.update!(archived_at: Time.current)

    # LLM 呼び出し
    llm = GeminiService.call!(chat: @chat, latest_user_message: user_msg)

    # 新しいアシスタント発話を保存
    start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    new_assistant_msg = nil
    ActiveRecord::Base.transaction do
      new_assistant_msg = @chat.messages.create!(
        role: :assistant,
        content:   llm[:content],
        token_in:  llm[:token_in],
        token_out: llm[:token_out],
        latency_ms: llm[:latency_ms],
        metadata: { model: llm[:model] }
      )
      total_ms = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000).to_i
      new_assistant_msg.update_column(:metadata, new_assistant_msg.metadata.merge(total_ms: total_ms))
    end

    render json: {
      chat: { id: @chat.id, title: @chat.title, updated_at: @chat.updated_at },
      assistant_msg: {
        id: new_assistant_msg.id,
        role: new_assistant_msg.role,
        content: new_assistant_msg.content,
        created_at: new_assistant_msg.created_at
      },
      metrics: { token_in: new_assistant_msg.token_in, token_out: new_assistant_msg.token_out, latency_ms: new_assistant_msg.latency_ms }
    }, status: :created

  rescue => e
    Rails.logger.error(e.full_message)
    begin
      @chat&.messages&.create!(
        role: :system,
        content: "エラーが発生しました",
        error_text: e.message,
        metadata: { kind: "llm_error" }
      )
    rescue StandardError
    end
    render json: { error: "LLM error", detail: e.message }, status: :bad_gateway
  end

  # POST /chats/:chat_id/messages/:id/branch
  def branch
    message = @chat.messages.find(params[:id])
    user_content = params.require(:content)

    unless message.role == "assistant"
      return render json: { error: "Only assistant messages can be branched" }, status: :bad_request
    end

    # ユーザーメッセージの内容からタイトルを生成
    generated_title = GeminiService.generate_title(user_message: user_content)

    # 直前のuserメッセージを取得（コンテキスト用、保存はしない）
    previous_user_msg = @chat.messages
                             .where(archived_at: nil)
                             .where(role: :user)
                             .where("created_at < ?", message.created_at)
                             .order(created_at: :desc)
                             .first

    # コンテキストメッセージを配列で保持（LLMに渡すが保存しない）
    context_messages = []
    context_messages << previous_user_msg if previous_user_msg
    context_messages << message  # 選択されたassistantメッセージ

    # 新しいチャットを作成
    new_chat = nil
    user_msg = nil
    assistant_msg = nil

    ActiveRecord::Base.transaction do
      new_chat = current_user.chats.create!(
        title: generated_title,
        branched_from_message_id: message.id
      )

      # 新しいユーザーメッセージのみを作成
      user_msg = new_chat.messages.create!(
        role: :user,
        content: user_content,
        metadata: {}
      )
    end

    # LLM 呼び出し（コンテキストメッセージを追加で渡す）
    llm = GeminiService.call!(
      chat: new_chat,
      latest_user_message: user_msg,
      additional_context_messages: context_messages
    )

    # アシスタント発話を保存
    start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    ActiveRecord::Base.transaction do
      assistant_msg = new_chat.messages.create!(
        role: :assistant,
        content:   llm[:content],
        token_in:  llm[:token_in],
        token_out: llm[:token_out],
        latency_ms: llm[:latency_ms],
        metadata: { model: llm[:model] }
      )
      total_ms = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000).to_i
      assistant_msg.update_column(:metadata, assistant_msg.metadata.merge(total_ms: total_ms))
    end

    render json: {
      chat: { id: new_chat.id, title: new_chat.title, created_at: new_chat.created_at, updated_at: new_chat.updated_at },
      messages: [
        user_msg.as_json(only: [:id, :role, :content, :metadata, :created_at, :updated_at]),
        assistant_msg.as_json(only: [:id, :role, :content, :metadata, :token_in, :token_out, :latency_ms, :created_at, :updated_at])
      ]
    }, status: :created

  rescue => e
    Rails.logger.error(e.full_message)
    begin
      new_chat&.messages&.create!(
        role: :system,
        content: "エラーが発生しました",
        error_text: e.message,
        metadata: { kind: "llm_error" }
      )
    rescue StandardError
    end
    render json: { error: "Branch creation failed", detail: e.message }, status: :internal_server_error
  end

  private

  def set_chat_for_index
    @chat = current_user.chats.find(params.require(:chat_id))
  end

  def set_chat_for_create
    @chat = params[:chat_id].present? ?
              current_user.chats.find(params[:chat_id]) :
              current_user.chats.create!(title: params[:title].presence || "New chat")
  end

  def set_chat_for_reload
    @chat = current_user.chats.find(params.require(:chat_id))
  end

  def set_chat_for_branch
    @chat = current_user.chats.find(params.require(:chat_id))
  end

  def message_param
    params.require(:content)
  end

  def metadata_param
    params[:metadata].is_a?(ActionController::Parameters) ?
      params[:metadata].to_unsafe_h :
      (params[:metadata] || {})
  end

  def limit_param
    n = params[:limit].to_i
    n = 50 if n <= 0
    [n, 200].min
  end
end
