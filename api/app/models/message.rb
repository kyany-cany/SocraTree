class Message < ApplicationRecord
  belongs_to :chat, touch: true, inverse_of: :messages
  enum :role, { user: 0, assistant: 1, system: 2, tool: 3 }, prefix: true
  validates :content, presence: true
end
