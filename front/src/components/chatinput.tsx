import { useState } from 'react';
import { GitBranch } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BRANCH_BUTTON_SELECTED_CLASS } from '@/constants/styles';

export const ChatInput: React.FC<{
  onSend: (text: string) => void;
  onBranch?: () => void;
  isBranchSelected?: boolean;
}> = ({ onSend, onBranch, isBranchSelected = false }) => {
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <div className="p-2 m-4 flex flex-col gap-2 bg-muted w-[70%] mx-auto rounded-2xl">
      <Textarea
        className="resize-none border-none focus:ring-0 focus-visible:ring-0 shadow-none"
        placeholder="メッセージを入力"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;

          if (e.key === 'Enter') {
            if (e.shiftKey) {
              return;
            }
            e.preventDefault();
            send();
          }
        }}
      />
      <div className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBranch}
          {...(isBranchSelected && { className: BRANCH_BUTTON_SELECTED_CLASS })}
        >
          <GitBranch className="h-4 w-4 mr-1" />
          分岐
        </Button>
        <Button
          className="ml-auto"
          variant="default"
          onClick={send}
        >
          送信
        </Button>
      </div>
    </div>
  );
};
