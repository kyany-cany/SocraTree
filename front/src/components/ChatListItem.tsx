import { Archive, ChevronDown, ChevronRight, MoreVertical, Trash2 } from 'lucide-react';
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
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  depth?: number;
}

export function ChatListItem({ chat, isActive, onClick, onDelete, hasChildren = false, isExpanded = false, onToggle, depth = 0 }: ChatListItemProps) {
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

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle?.();
  };

  const indentClass = depth > 0 ? 'pl-4' : '';

  return (
    <div className={`group relative ${indentClass}`}>
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={`w-full justify-start pr-10 overflow-hidden ${
          isActive ? 'bg-accent text-accent-foreground' : ''
        } ${hasChildren ? 'pl-8' : ''}`}
        onClick={() => onClick(chat.id)}
        title={chat.title}
        aria-label={`チャット: ${chat.title}`}
      >
        <span className="truncate">{chat.title || '（無題）'}</span>
      </Button>

      {hasChildren && onToggle && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-50 hover:opacity-100 z-10"
          onClick={handleToggle}
          aria-label={isExpanded ? 'チャットを折りたたむ' : 'チャットを展開'}
        >
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>
      )}

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
