class Message < ApplicationRecord
  belongs_to :chat, touch: true, inverse_of: :messages
  has_many :branched_chats, class_name: 'Chat', foreign_key: :branched_from_message_id, dependent: :nullify
  enum :role, { user: 0, assistant: 1, system: 2, tool: 3 }, prefix: true
  validates :content, presence: true
end
