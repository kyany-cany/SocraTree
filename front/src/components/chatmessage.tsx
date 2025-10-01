import React from 'react';
import MarkdownMessage from '@/components/markdown';
import { Button } from '@/components/ui/button';
import { RotateCw, Loader2, GitBranch, GitGraph } from 'lucide-react';
import { BRANCH_BUTTON_SELECTED_CLASS } from '@/constants/styles';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  branched_chat_ids?: string[];
};

export const ChatMessage: React.FC<{
  message: Message;
  onReload?: () => void;
  isReloading?: boolean;
  onBranch?: () => void;
  isBranching?: boolean;
  isBranchSelected?: boolean;
  onNavigateToBranch?: (chatId: string) => void;
}> = ({ message, onReload, isReloading = false, onBranch, isBranching = false, isBranchSelected = false, onNavigateToBranch }) => {
  const isUser = message.role === 'user';
  const hasBranchedChats = message.branched_chat_ids && message.branched_chat_ids.length > 0;

  return (
    <div className="mb-2">
      {isReloading ? (
        <div className="rounded-2xl px-4 py-2 w-full flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>再生成中...</span>
        </div>
      ) : (
        <div
          className={`rounded-2xl px-4 py-2 ${isUser ? 'max-w-[70%] ml-auto bg-primary text-primary-foreground w-fit' : 'w-full text-left'
            }`}
        >
          {isUser ? message.content : <MarkdownMessage text={message.content} />}
        </div>
      )}
      {!isUser && (onReload || onBranch || hasBranchedChats) && !isReloading && !isBranching && (
        <div className="w-full mt-2 flex gap-1">
          {onReload && (
            <Button variant="ghost" size="sm" onClick={onReload} className="h-8 px-3">
              <RotateCw className="h-4 w-4" />
            </Button>
          )}
          {onBranch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBranch}
              className={isBranchSelected ? `h-8 px-3 ${BRANCH_BUTTON_SELECTED_CLASS}` : 'h-8 px-3'}
            >
              <GitBranch className="h-4 w-4" />
            </Button>
          )}
          {hasBranchedChats && onNavigateToBranch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToBranch(message.branched_chat_ids![0])}
              className="h-8 px-3"
              title={`${message.branched_chat_ids!.length}個のブランチに移動`}
            >
              <GitGraph className="h-4 w-4" />
              {message.branched_chat_ids!.length > 1 && (
                <span className="ml-1 text-xs">{message.branched_chat_ids!.length}</span>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
