class CreateConversations < ActiveRecord::Migration[8.0]
  def change
    create_table :conversations, id: :uuid do |t|
      t.string  :title,    null: false, default: "New chat"
      t.string  :status,   null: false, default: "active"
      t.string  :model
      t.boolean :archived, null: false, default: false
      t.integer :messages_count, default: 0, null: false
      t.timestamps
    end
    add_index :conversations, :status
    add_index :conversations, :archived
    add_index :conversations, :updated_at
  end
end
