import React from 'react';
import MarkdownMessage from '@/components/markdown';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`rounded-2xl px-4 py-2 max-w-[70%] mb-2 ${isUser ? 'ml-auto bg-blue-500 text-white w-fit' : 'mx-auto'}`}>
      {isUser ? message.content : <MarkdownMessage text={message.content} />}
    </div>
  );
};
