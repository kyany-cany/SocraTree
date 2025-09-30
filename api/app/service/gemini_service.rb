class GeminiService
  def self.call!(chat:, latest_user_message:)
    gemini = GeminiClient.new

    # 1) 履歴は常に時系列で取得（アーカイブされていないメッセージのみ）
    messages = chat.messages.where(archived_at: nil).order(:created_at)

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
end
