class CreateChats < ActiveRecord::Migration[8.0]
  def change
    create_table :chats, id: :uuid do |t|
      t.string  :title,    null: false, default: "New chat"
      t.string  :status,   null: false, default: "active"
      t.string  :model
      t.boolean :archived, null: false, default: false
      t.timestamps
    end
    add_index :chats, :status
    add_index :chats, :archived
    add_index :chats, :updated_at
  end
end
