class GeminiService
  def self.call!(chat:, latest_user_message:, additional_context_messages: [])
    gemini = GeminiClient.new

    # 1) 履歴は常に時系列で取得（アーカイブされていないメッセージのみ）
    messages = chat.messages.where(archived_at: nil).order(:created_at)

    # 追加のコンテキストメッセージがある場合は先頭に挿入
    messages = additional_context_messages + messages.to_a if additional_context_messages.any?

    # 2) system はまとめて systemInstruction に
    system_text = messages
                    .select { |m| m.role.to_s == "system" }
                    .map { |m| m.content.to_s }
                    .join("\n\n")
    system_instruction = system_text.present? ? { parts: [{ text: system_text }] } : nil

    # 3) 履歴を contents へ正規化（assistant -> model）
    contents =
      messages.filter_map do |m|
        case m.role.to_s
        when "user"
          { role: "user",  parts: [{ text: m.content.to_s }] }
        when "assistant"
          { role: "model", parts: [{ text: m.content.to_s }] }
        else
          # "system" は contents に含めない（上で systemInstruction に格納）
          nil
        end
      end

    # 4) リクエスト body は Hash のまま組み立て、最後に必要なら to_json
    req = { contents: contents }
    req[:systemInstruction] = system_instruction if system_instruction

    t0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    response_text = gemini.chat(req.to_json) 
    latency_ms = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - t0) * 1000).to_i

    { content: response_text, latency_ms: latency_ms, model: "gemini" }
  end

  def self.estimate_tokens(text)
    (text.to_s.length / 4.0).ceil
  end

  # タイトル生成用のメソッド
  def self.generate_title(user_message:)
    gemini = GeminiClient.new

    prompt = {
      systemInstruction: {
        parts: [{
          text: "あなたはチャットのタイトルを生成するアシスタントです。ユーザーのメッセージから、簡潔で分かりやすいタイトルを生成してください。タイトルは30文字以内で、メッセージの主題を端的に表現してください。タイトルのみを出力し、余計な説明は不要です。"
        }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: "次のメッセージからタイトルを生成してください:\n\n#{user_message}" }]
        }
      ]
    }

    title = gemini.chat(prompt.to_json).strip
    # タイトルが長すぎる場合は切り詰める
    title.length > 60 ? title[0, 60] : title
  rescue => e
    Rails.logger.error("タイトル生成エラー: #{e.message}")
    # エラー時はユーザーメッセージの先頭を使用
    user_message.to_s.strip[0, 60]
  end
end
