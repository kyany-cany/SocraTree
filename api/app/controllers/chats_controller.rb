class ChatsController < BaseController
  def index
    render json: current_user.chats.where(archived: false).order(updated_at: :desc)
                   .limit(50).select(:id,:title,:updated_at)
  end

  def destroy
    @chat = current_user.chats.find(params[:id])
    @chat.destroy
    head :no_content
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Chat not found' }, status: :not_found
  end

  def archive
    @chat = current_user.chats.find(params[:id])
    return render json: { error: 'Already archived' }, status: :conflict if @chat.archived?
    
    @chat.update!(archived: true)
    render json: { id: @chat.id, archived: true, archived_at: Time.current }
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Chat not found' }, status: :not_found
  end

  def restore
    @chat = current_user.chats.find(params[:id])
    return render json: { error: 'Not archived' }, status: :conflict unless @chat.archived?
    
    @chat.update!(archived: false)
    render json: { id: @chat.id, archived: false, restored_at: Time.current }
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Chat not found' }, status: :not_found
  end
end