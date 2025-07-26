class Api::ChatsController < ApplicationController
    def create
        message = params[:message]
        gemini = GeminiClient.new
        response_text = gemini.chat(message)
        render json: { reply: response_text }
    end
end