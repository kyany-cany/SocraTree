class CreateMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :messages, id: :uuid do |t|
      t.references :chat, null: false, type: :uuid, index: true
      t.integer :role,     null: false, default: 0 # 0:user,1:assistant,2:system,3:tool
      t.text    :content,  null: false
      t.jsonb   :metadata, null: false, default: {}
      t.integer :token_in
      t.integer :token_out
      t.integer :latency_ms
      t.text    :error_text
      t.timestamps
    end
    add_foreign_key :messages, :chats, on_delete: :cascade
    add_index :messages, [:chat_id, :created_at]
  end
end
