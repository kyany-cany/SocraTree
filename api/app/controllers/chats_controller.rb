class ChatsController < BaseController
  def index
    chats = current_user.chats
                        .where(archived: false)
                        .order(updated_at: :desc)
                        .limit(50)
                        .includes(:parent_relationships, :child_relationships)

    # 各チャットに親子関係情報を追加
    chats_with_relations = chats.map do |chat|
      parent_chat_id = chat.parent_relationships.first&.parent_chat_id
      child_chat_ids = chat.child_relationships.map(&:child_chat_id)

      {
        id: chat.id,
        title: chat.title,
        updated_at: chat.updated_at,
        created_at: chat.created_at,
        parent_chat_id: parent_chat_id,
        children: child_chat_ids
      }
    end

    render json: chats_with_relations
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