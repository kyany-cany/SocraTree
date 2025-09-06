class AddUserToChats < ActiveRecord::Migration[8.0]
  def change
    add_reference :chats, :user, null: false, foreign_key: true, type: :uuid
    add_index :chats, [:user_id, :updated_at]
  end
end
