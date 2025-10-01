class Chat < ApplicationRecord
  belongs_to :user, inverse_of: :chats
  has_many :messages, -> { order(created_at: :asc) }, dependent: :destroy

  # 親側のリレーション（このチャットが子の場合）
  has_many :parent_relationships,
           class_name: 'ChatRelationship',
           foreign_key: :child_chat_id,
           dependent: :destroy,
           inverse_of: :child_chat

  has_many :parent_chats,
           through: :parent_relationships,
           source: :parent_chat

  # 子側のリレーション（このチャットが親の場合）
  has_many :child_relationships,
           class_name: 'ChatRelationship',
           foreign_key: :parent_chat_id,
           dependent: :destroy,
           inverse_of: :parent_chat

  has_many :child_chats,
           through: :child_relationships,
           source: :child_chat

  # 便利メソッド: 親チャットを取得（通常は1つのみ）
  def parent_chat
    parent_chats.first
  end

  # 現在のチャットの深さを取得
  def depth
    parent_relationships.first&.depth || 0
  end

  # 全祖先を取得（WITH RECURSIVE使用）
  def ancestors
    return Chat.none if id.blank?

    Chat.find_by_sql([<<-SQL, id])
      WITH RECURSIVE ancestors AS (
        SELECT parent_chat_id, child_chat_id, depth
        FROM chat_relationships
        WHERE child_chat_id = ?

        UNION ALL

        SELECT r.parent_chat_id, r.child_chat_id, r.depth
        FROM chat_relationships r
        INNER JOIN ancestors a ON r.child_chat_id = a.parent_chat_id
      )
      SELECT DISTINCT chats.*
      FROM ancestors
      INNER JOIN chats ON chats.id = ancestors.parent_chat_id
      ORDER BY chats.created_at ASC
    SQL
  end

  # 全子孫を取得（WITH RECURSIVE使用）
  def descendants
    return Chat.none if id.blank?

    Chat.find_by_sql([<<-SQL, id])
      WITH RECURSIVE descendants AS (
        SELECT parent_chat_id, child_chat_id, depth
        FROM chat_relationships
        WHERE parent_chat_id = ?

        UNION ALL

        SELECT r.parent_chat_id, r.child_chat_id, r.depth
        FROM chat_relationships r
        INNER JOIN descendants d ON r.parent_chat_id = d.child_chat_id
      )
      SELECT DISTINCT chats.*
      FROM descendants
      INNER JOIN chats ON chats.id = descendants.child_chat_id
      ORDER BY chats.created_at ASC
    SQL
  end

  # 分岐元のメッセージを取得（便利メソッド）
  def branched_from_message
    parent_relationships.first&.branched_from_message
  end
end
