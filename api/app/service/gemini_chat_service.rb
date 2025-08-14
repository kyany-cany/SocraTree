# app/services/gemini_chat_service.rb
class GeminiChatService
  def self.call!(conversation:, latest_user_message:)
    gemini = GeminiClient.new

    # 履歴をテキスト化（最小）
    prompt = conversation.messages.map do |m|
      role =
        case m.role
        when "user" then "user"
        when "assistant" then "assistant"
        else "system"
        end
      "#{role}: #{m.content}"
    end.join("\n")

    t0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)

    # ---- ここを実際のAPI呼び出しに合わせて調整 ----
    # 例: GeminiClient#chat は直近ユーザ発話のみを受け取るなら latest_user_message.content を渡す
    # 履歴対応メソッドがあるなら prompt を渡す
    response_text = gemini.chat(prompt) # or gemini.chat(latest_user_message.content)
    # ----------------------------------------------

    token_in  = estimate_tokens(prompt)            # ダミー。計測できるなら実測値を
    token_out = estimate_tokens(response_text)     # 同上
    latency_ms = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - t0) * 1000).to_i

    { content: response_text, token_in:, token_out:, latency_ms:, model: "gemini" }
  end

  # 簡易トークン見積り（後で実測に差し替え）
  def self.estimate_tokens(text)
    (text.to_s.length / 4.0).ceil
  end
end
