class AddArchivedAtToMessages < ActiveRecord::Migration[8.0]
  def change
    add_column :messages, :archived_at, :datetime
    add_index :messages, :archived_at
  end
end
