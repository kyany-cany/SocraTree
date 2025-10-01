class Message < ApplicationRecord
  belongs_to :chat, touch: true, inverse_of: :messages
  has_many :branched_relationships, class_name: 'ChatRelationship', foreign_key: :branched_from_message_id, dependent: :nullify
  enum :role, { user: 0, assistant: 1, system: 2, tool: 3 }, prefix: true
  validates :content, presence: true

  # 便利メソッド: このメッセージから分岐したチャットを取得
  def branched_chats
    Chat.joins(:parent_relationships)
        .where(chat_relationships: { branched_from_message_id: id })
  end
end
