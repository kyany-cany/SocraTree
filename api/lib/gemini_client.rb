require 'faraday'
require 'json'

class GeminiClient
  ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

  def initialize
    @api_key = ENV['GEMINI_API_KEY']
  end

  def chat(body)
    response = Faraday.post(ENDPOINT) do |req|
      req.headers['Content-Type'] = 'application/json'
      req.headers['X-goog-api-key'] = @api_key
      req.body = body
    end

    parsed = JSON.parse(response.body)
    parsed.dig('candidates', 0, 'content', 'parts', 0, 'text') || '返答が取得できませんでした。'
  end
end
