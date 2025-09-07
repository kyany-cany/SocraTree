import { ChevronLeft, ChevronRight, MessageSquare, Settings } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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

  return (
    <aside
      style={{ width: open ? '16rem' : '2.5rem' }}
      className="h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out overflow-hidden relative"
    >
      {/* トグルボタン */}
      <Button size="icon" variant="secondary" onClick={onToggle} className="absolute top-4 right-1">
        {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {open && (
        <div className="mt-14">
          <div className="px-4">
            <h2 className="text-xl font-bold mb-4">メニュー</h2>
          </div>
          <Separator />
          <ScrollArea className="h-[calc(100vh-6rem)] px-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 mb-1"
              onClick={() => onNewChat()}
            >
              <MessageSquare className="h-4 w-4" /> チャット
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={signOut}>
              <Settings className="h-4 w-4" /> ログアウト
            </Button>
            <div className="px-2 pb-4 space-y-1">
              {chats.map((c) => (
                <ChatListItem
                  key={c.id}
                  chat={c}
                  isActive={currentChatId === c.id}
                  onClick={onChatClick}
                  onDelete={onChatDelete}
                />
              ))}
              {chats.length === 0 && (
                <div className="text-xs text-muted-foreground px-2 py-3">
                  チャットはまだありません
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </aside>
  );
};
