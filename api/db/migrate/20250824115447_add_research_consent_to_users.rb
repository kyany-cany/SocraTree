class AddResearchConsentToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :research_consent, :boolean
    add_column :users, :research_consent_at, :datetime
    add_column :users, :research_consent_version, :string
    add_index :users, :research_consent
  end
end
