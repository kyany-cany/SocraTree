import { Archive, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { archiveChat } from '@/lib/api';
import type { Chat } from '@/types';

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: (chatId: string) => void;
  onDelete: (chatId: string) => void;
}

export function ChatListItem({ chat, isActive, onClick, onDelete }: ChatListItemProps) {
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsArchiving(true);

    try {
      await archiveChat(chat.id);
      console.log('Chat archived successfully');
      // TODO: チャットリストから削除するか、アーカイブ済みマークを付ける
    } catch (error) {
      console.error('Failed to archive chat:', error);
      alert('チャットのアーカイブに失敗しました');
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="group relative">
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={`w-full justify-start truncate pr-8 ${
          isActive ? 'bg-accent text-accent-foreground' : ''
        }`}
        onClick={() => onClick(chat.id)}
        title={chat.title}
        aria-label={`チャット: ${chat.title}`}
      >
        <span className="truncate">{chat.title || '（無題）'}</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-70 hover:opacity-100"
            aria-label={`チャットメニュー: ${chat.title}`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={handleArchive}
            disabled={isArchiving}
          >
            <Archive className="mr-2 h-4 w-4" />
            {isArchiving ? 'アーカイブ中...' : 'アーカイブ'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(chat.id);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
