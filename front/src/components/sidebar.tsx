import { ChevronLeft, ChevronRight, MessageSquare, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { apiGetJson } from '@/lib/api';
import { useAuth } from '@/lib/auth-hooks';
import type { Chat, Message } from '@/types';

import { ChatListItem } from './ChatListItem';

type SidebarProps = {
  open: boolean;
  onToggle: () => void;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentChatId: string | null;
  onChatDelete: (chatId: string) => void;
};

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onToggle,
  chats,
  setChats,
  setCurrentChatId,
  setMessages,
  currentChatId,
  onChatDelete,
}) => {
  const { signOut } = useAuth();
  const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const list = await apiGetJson<Chat[]>('/chats');
        // 更新日時で新しい順に並べておく
        list.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
        setChats(list);
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      }
    })();
  }, [setChats]);

  // currentChatIdが変更された時、その親を展開する
  useEffect(() => {
    if (currentChatId) {
      const currentChat = chats.find((c) => c.id === currentChatId);
      if (currentChat?.parent_chat_id) {
        setExpandedChats((prev) => {
          const next = new Set(prev);
          next.add(currentChat.parent_chat_id!);
          return next;
        });
      }
    }
  }, [currentChatId, chats]);

  function onNewChat() {
    setCurrentChatId(null);
    setMessages([]);
  }

  function onChatClick(id: string) {
    setCurrentChatId(id);
    (async () => {
      try {
        const list = await apiGetJson<Message[]>(`/chats/${id}/messages`);
        setMessages(list);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    })();
  }

  function toggleExpanded(chatId: string) {
    setExpandedChats((prev) => {
      const next = new Set(prev);
      if (next.has(chatId)) {
        next.delete(chatId);
      } else {
        next.add(chatId);
      }
      return next;
    });
  }

  // 親チャットのみを抽出
  const parentChats = chats.filter((chat) => !chat.parent_chat_id);

  return (
    <Collapsible open={open} onOpenChange={onToggle} asChild>
      <aside
        data-state={open ? 'open' : 'closed'}
        className="h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out overflow-hidden relative data-[state=open]:w-64 data-[state=closed]:w-10"
      >
        {/* トグルボタン */}
        <CollapsibleTrigger asChild>
          <Toggle
            size="icon"
            pressed={open}
            className="absolute top-4 right-1 z-10 bg-secondary hover:bg-secondary/80 data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
            aria-label="サイドバーを開閉"
          >
            {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Toggle>
        </CollapsibleTrigger>

        <CollapsibleContent className="h-full" forceMount>
          <div
            className="mt-14 transition-opacity duration-300 data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
            data-state={open ? 'open' : 'closed'}
          >
            {/* <div className="px-4">
              <h2 className="text-xl font-bold mb-4">メニュー</h2>
            </div> */}
            <div className="px-2 mb-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 mb-1"
                onClick={() => onNewChat()}
              >
                <MessageSquare className="h-4 w-4" /> New Chat
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={signOut}>
                <Settings className="h-4 w-4" /> Log out
              </Button>
            </div>
            <Separator />
            <ScrollArea className="h-[calc(100vh-6rem)] px-2 mt-2">
              <div className="px-2 pb-4 space-y-1">
                {parentChats.map((parentChat) => {
                  const childChats = parentChat.children
                    ?.map((childId) => chats.find((c) => c.id === childId))
                    .filter((c): c is Chat => c !== undefined) || [];
                  const hasChildren = childChats.length > 0;
                  const isExpanded = expandedChats.has(parentChat.id);

                  return (
                    <div key={parentChat.id}>
                      {/* 親チャット */}
                      <ChatListItem
                        chat={parentChat}
                        isActive={currentChatId === parentChat.id}
                        onClick={onChatClick}
                        onDelete={onChatDelete}
                        hasChildren={hasChildren}
                        isExpanded={isExpanded}
                        onToggle={() => toggleExpanded(parentChat.id)}
                        depth={0}
                      />
                      {/* 子チャット */}
                      {isExpanded && childChats.map((childChat) => (
                        <ChatListItem
                          key={childChat.id}
                          chat={childChat}
                          isActive={currentChatId === childChat.id}
                          onClick={onChatClick}
                          onDelete={onChatDelete}
                          depth={1}
                        />
                      ))}
                    </div>
                  );
                })}
                {chats.length === 0 && (
                  <div className="text-xs text-muted-foreground px-2 py-3">
                    チャットはまだありません
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CollapsibleContent>
      </aside>
    </Collapsible>
  );
};
