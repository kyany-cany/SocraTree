class Chat < ApplicationRecord
  belongs_to :user, inverse_of: :chats
  has_many :messages, -> { order(created_at: :asc) }, dependent: :destroy
  belongs_to :branched_from_message, class_name: 'Message', optional: true
end
