import type { Chat } from '@/types';
import { ChatListItem } from './ChatListItem';

interface ChatTreeProps {
  chat: Chat;
  chatMap: Map<string, Chat>;
  currentChatId: string | null;
  expandedChats: Set<string>;
  onChatClick: (chatId: string) => void;
  onChatDelete: (chatId: string) => void;
  onToggleExpanded: (chatId: string) => void;
  depth?: number;
}

export function ChatTree({
  chat,
  chatMap,
  currentChatId,
  expandedChats,
  onChatClick,
  onChatDelete,
  onToggleExpanded,
  depth = 0,
}: ChatTreeProps) {
  // 子チャットを取得
  const childChats = chat.children
    ?.map((childId) => chatMap.get(childId))
    .filter((c): c is Chat => c !== undefined) || [];

  const hasChildren = childChats.length > 0;

  // 孫がいるかどうかをチェック（子が1つでも子を持っていればtrue）
  const hasGrandchildren = childChats.some(
    (childChat) => childChat.children && childChat.children.length > 0
  );

  const isExpanded = expandedChats.has(chat.id);

  return (
    <div>
      {/* 現在のチャット */}
      <ChatListItem
        chat={chat}
        isActive={currentChatId === chat.id}
        onClick={onChatClick}
        onDelete={onChatDelete}
        hasChildren={hasChildren}
        hasGrandchildren={hasGrandchildren}
        isExpanded={isExpanded}
        onToggle={() => onToggleExpanded(chat.id)}
        depth={depth}
      />

      {/* 子チャット（再帰的にレンダリング） */}
      {isExpanded &&
        childChats.map((childChat) => (
          <ChatTree
            key={childChat.id}
            chat={childChat}
            chatMap={chatMap}
            currentChatId={currentChatId}
            expandedChats={expandedChats}
            onChatClick={onChatClick}
            onChatDelete={onChatDelete}
            onToggleExpanded={onToggleExpanded}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}
