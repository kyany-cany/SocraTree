import React from 'react';
import MarkdownMessage from '@/components/markdown';
import { Button } from '@/components/ui/button';
import { RotateCw, Loader2 } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export const ChatMessage: React.FC<{
  message: Message;
  onReload?: () => void;
  isReloading?: boolean;
}> = ({ message, onReload, isReloading = false }) => {
  const isUser = message.role === 'user';

  return (
    <div className="mb-2">
      {isReloading ? (
        <div className="rounded-2xl px-4 py-2 max-w-[70%] mx-auto flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>再生成中...</span>
        </div>
      ) : (
        <div className={`rounded-2xl px-4 py-2 max-w-[70%] ${isUser ? 'ml-auto bg-primary text-primary-foreground w-fit' : 'mx-auto'}`}>
          {isUser ? message.content : <MarkdownMessage text={message.content} />}
        </div>
      )}
      {!isUser && onReload && !isReloading && (
        <div className="max-w-[70%] mx-auto mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReload}
            className="h-8 px-3"
          >
            <RotateCw className="h-4 w-4 mr-1" />
          </Button>
        </div>
      )}
    </div>
  );
};
