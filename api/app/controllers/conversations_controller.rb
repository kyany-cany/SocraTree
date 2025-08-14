# app/controllers/api/conversations_controller.rb
class ConversationsController < ApplicationController
  def create
    conv = Conversation.create!(title: params[:title].presence || "New chat")
    render json: { id: conv.id, title: conv.title, status: conv.status }, status: :created
  end

  def show
    conv = Conversation.find(params[:id])
    render json: {
      id: conv.id,
      title: conv.title,
      status: conv.status,
      messages_count: conv.messages.count,
      updated_at: conv.updated_at
    }
  end
end
