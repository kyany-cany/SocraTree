class ChatsController < BaseController
  def index
    render json: current_user.chats.order(updated_at: :desc)
                   .limit(50).select(:id,:title,:updated_at)
  end
end