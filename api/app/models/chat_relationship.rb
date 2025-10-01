class ChatRelationship < ApplicationRecord
  belongs_to :parent_chat, class_name: 'Chat'
  belongs_to :child_chat, class_name: 'Chat'
  belongs_to :branched_from_message, class_name: 'Message', optional: true

  validates :parent_chat_id, presence: true
  validates :child_chat_id, presence: true
  validates :child_chat_id, uniqueness: { scope: :parent_chat_id }
  validates :depth, numericality: { greater_than_or_equal_to: 0 }

  validate :prevent_self_reference
  validate :prevent_circular_reference
  validate :check_max_depth

  before_validation :calculate_depth, on: :create

  MAX_DEPTH = 10

  private

  def prevent_self_reference
    if parent_chat_id == child_chat_id
      errors.add(:child_chat_id, "cannot be the same as parent chat")
    end
  end

  def prevent_circular_reference
    return if parent_chat_id.blank? || child_chat_id.blank?
    return if parent_chat_id == child_chat_id

    # 親チャットの祖先に子チャットが含まれていないかチェック
    ancestor_ids = get_ancestor_ids(parent_chat_id)
    if ancestor_ids.include?(child_chat_id)
      errors.add(:child_chat_id, "creates circular reference")
    end
  end

  def check_max_depth
    if depth && depth > MAX_DEPTH
      errors.add(:depth, "exceeds maximum depth of #{MAX_DEPTH}")
    end
  end

  def calculate_depth
    return if parent_chat_id.blank?

    parent_depth = ChatRelationship
                    .where(child_chat_id: parent_chat_id)
                    .maximum(:depth)

    self.depth = (parent_depth || 0) + 1
  end

  # 祖先のIDを再帰的に取得
  def get_ancestor_ids(chat_id, visited = Set.new)
    return visited if visited.include?(chat_id)
    visited.add(chat_id)

    parent_ids = ChatRelationship
                  .where(child_chat_id: chat_id)
                  .pluck(:parent_chat_id)

    parent_ids.each do |parent_id|
      get_ancestor_ids(parent_id, visited)
    end

    visited
  end
end
