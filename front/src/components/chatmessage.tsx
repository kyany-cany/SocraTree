import React from 'react';
import MarkdownMessage from '@/components/markdown';
import { Button } from '@/components/ui/button';
import { RotateCw, Loader2, GitBranch } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const BRANCH_BUTTON_SELECTED_CLASS = 'bg-branch text-branch-foreground hover:!bg-branch-hover';

export const ChatMessage: React.FC<{
  message: Message;
  onReload?: () => void;
  isReloading?: boolean;
  onBranch?: () => void;
  isBranching?: boolean;
  isBranchSelected?: boolean;
}> = ({ message, onReload, isReloading = false, onBranch, isBranching = false, isBranchSelected = false }) => {
  const isUser = message.role === 'user';

  return (
    <div className="mb-2">
      {isReloading ? (
        <div className="rounded-2xl px-4 py-2 w-full flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>再生成中...</span>
        </div>
      ) : (
        <div
          className={`rounded-2xl px-4 py-2 ${isUser ? 'ml-auto bg-primary text-primary-foreground w-fit' : 'w-full text-left'
            }`}
        >
          {isUser ? message.content : <MarkdownMessage text={message.content} />}
        </div>
      )}
      {!isUser && (onReload || onBranch) && !isReloading && !isBranching && (
        <div className="w-full mt-2 flex gap-2">
          {onReload && (
            <Button variant="ghost" size="sm" onClick={onReload} className="h-8 px-3">
              <RotateCw className="h-4 w-4 mr-1" />
            </Button>
          )}
          {onBranch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBranch}
              className={`h-8 px-3 ${isBranchSelected ? BRANCH_BUTTON_SELECTED_CLASS : ''}`}
            >
              <GitBranch className="h-4 w-4 mr-1" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
