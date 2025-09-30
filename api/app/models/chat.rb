class Chat < ApplicationRecord
  belongs_to :user, inverse_of: :chats
  has_many :messages, -> { order(created_at: :asc) }, dependent: :destroy
  belongs_to :branched_from_message, class_name: 'Message', optional: true

  # 親チャットを取得（branched_from_messageの所属するチャット）
  def parent_chat
    return nil unless branched_from_message
    branched_from_message.chat
  end

  # 子チャット（このチャットのメッセージから分岐したチャット）を取得
  def child_chats
    message_ids = messages.pluck(:id)
    Chat.where(branched_from_message_id: message_ids)
  end
end
