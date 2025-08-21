module V2
    class ConversationsController < BaseController
      def create
        conv = Conversation.create!(title: params[:title].presence || "New chat")
        render json: { id: conv.id, title: conv.title }, status: :created
      end
  
      def show
        conv = Conversation.find(params[:id])
        render json: {
          id: conv.id,
          title: conv.title,
          updated_at: conv.updated_at
        }
      end
    end
end
  