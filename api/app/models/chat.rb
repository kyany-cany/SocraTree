class Chat < ApplicationRecord
  belongs_to :user, inverse_of: :chats
  has_many :messages, -> { order(created_at: :asc) }, dependent: :destroy
end
