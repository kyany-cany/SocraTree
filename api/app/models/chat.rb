class Chat < ApplicationRecord
  has_many :messages, -> { order(created_at: :asc) }, dependent: :destroy
end
