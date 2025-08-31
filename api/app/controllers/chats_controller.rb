class ChatsController < BaseController
  def create
    chat = Chat.create!(title: params[:title].presence || "New chat")
    render json: { id: chat.id, title: chat.title }, status: :created
  end

  def show
    chat = Chat.find(params[:id])
    render json: {
      id: chat.id,
      title: chat.title,
      updated_at: chat.updated_at
    }
  end
end