class CreateChatRelationships < ActiveRecord::Migration[8.0]
  def change
    create_table :chat_relationships, id: :uuid do |t|
      t.uuid :parent_chat_id, null: false
      t.uuid :child_chat_id, null: false
      t.uuid :branched_from_message_id
      t.integer :depth, default: 0, null: false
      t.timestamps
    end

    add_foreign_key :chat_relationships, :chats, column: :parent_chat_id, on_delete: :cascade
    add_foreign_key :chat_relationships, :chats, column: :child_chat_id, on_delete: :cascade
    add_foreign_key :chat_relationships, :messages, column: :branched_from_message_id, on_delete: :nullify

    add_index :chat_relationships, :parent_chat_id
    add_index :chat_relationships, :child_chat_id
    add_index :chat_relationships, [:parent_chat_id, :child_chat_id], unique: true, name: 'index_chat_rels_on_parent_and_child'
    add_index :chat_relationships, :depth

    # 既存のbranched_from_message_idカラムと外部キーを削除
    remove_foreign_key :chats, column: :branched_from_message_id if foreign_key_exists?(:chats, column: :branched_from_message_id)
    remove_index :chats, :branched_from_message_id if index_exists?(:chats, :branched_from_message_id)
    remove_column :chats, :branched_from_message_id, :uuid
  end
end
