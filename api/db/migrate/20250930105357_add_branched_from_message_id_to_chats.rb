class AddBranchedFromMessageIdToChats < ActiveRecord::Migration[8.0]
  def change
    add_column :chats, :branched_from_message_id, :uuid
    add_foreign_key :chats, :messages, column: :branched_from_message_id
    add_index :chats, :branched_from_message_id
  end
end
