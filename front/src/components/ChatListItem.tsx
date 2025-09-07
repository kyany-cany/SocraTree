import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Chat } from '@/types';

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: (chatId: string) => void;
  onDelete: (chatId: string) => void;
}

export function ChatListItem({ chat, isActive, onClick, onDelete }: ChatListItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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

      {isHovered && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-70 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(chat.id);
          }}
          aria-label={`チャットを削除: ${chat.title}`}
          title="チャットを削除"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
