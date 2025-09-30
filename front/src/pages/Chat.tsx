import { useEffect, useRef, useState } from 'react';

import { ChatDeleteDialog } from '@/components/ChatDeleteDialog';
import { ChatInput } from '@/components/chatinput';
import { ChatMessage } from '@/components/chatmessage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sidebar } from '@/components/sidebar';
import { apiPostJson, deleteChat } from '@/lib/api';
import type { Chat, Message, MessageResponse } from '@/types';

export const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const isSendingRef = useRef<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [reloadingMessageIndex, setReloadingMessageIndex] = useState<number | null>(null);

  // 削除ダイアログの状態
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    chatId: string | null;
    chatTitle: string;
  }>({
    open: false,
    chatId: null,
    chatTitle: '',
  });
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  // 自動スクロール: messagesが更新されたら最下部へ
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (isSendingRef.current) return;
    isSendingRef.current = true;
    const existingChatId = currentChatId;

    // 新規なら一時IDを作成
    let chatTempId = existingChatId;
    if (!existingChatId) {
      chatTempId = crypto.randomUUID();
      const tempChat: Chat = { id: chatTempId, title: 'New Chat', created_at: '', updated_at: '' };
      setChats((prev) => [tempChat, ...prev]);
      setCurrentChatId(chatTempId);
    }

    const tempMessageId = crypto.randomUUID();
    const userMessage: Message = {
      role: 'user',
      content: text,
      id: tempMessageId,
      created_at: '',
      updated_at: '',
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const url = currentChatId ? `/chats/${currentChatId}/messages` : '/messages';
      const res = await apiPostJson<MessageResponse>(url, { content: text });
      console.log(res);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempMessageId
            ? {
                role: 'user',
                content: text,
                id: res.user_msg.id,
                created_at: res.user_msg.created_at,
                updated_at: res.user_msg.updated_at,
              }
            : m
        )
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: res.assistant_msg.content,
        id: res.assistant_msg.id,
        created_at: res.assistant_msg.created_at,
        updated_at: res.assistant_msg.updated_at,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (chatTempId !== res.chat.id) {
        setChats((prev) => prev.map((c) => (c.id === chatTempId ? res.chat : c)));
        setCurrentChatId(res.chat.id);
      } else {
        setChats((prev) =>
          prev.map((c) => (c.id === chatTempId ? { ...c, updated_at: res.chat.updated_at } : c))
        );
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'エラーが発生しました',
          created_at: '',
          updated_at: '',
        },
      ]);
    } finally {
      isSendingRef.current = false;
    }
  };

  const handleChatDelete = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (!chat) return;

    setDeleteDialog({
      open: true,
      chatId: chatId,
      chatTitle: chat.title || '（無題）',
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.chatId) return;

    setDeletingChatId(deleteDialog.chatId);
    const chatToDelete = deleteDialog.chatId;

    // 楽観的UI更新
    const originalChats = chats;
    setChats((prev) => prev.filter((chat) => chat.id !== chatToDelete));

    // 現在のチャットが削除対象の場合は画面をクリア
    if (currentChatId === chatToDelete) {
      setCurrentChatId(null);
      setMessages([]);
    }

    try {
      await deleteChat(chatToDelete);
      console.log('Chat deleted successfully');
    } catch (error) {
      console.error('Failed to delete chat:', error);
      // エラー時はロールバック
      setChats(originalChats);
      if (currentChatId === chatToDelete) {
        setCurrentChatId(chatToDelete);
        // 必要に応じてメッセージも復元
      }
      alert('チャットの削除に失敗しました');
    } finally {
      setDeletingChatId(null);
      setDeleteDialog({ open: false, chatId: null, chatTitle: '' });
    }
  };

  const handleReload = async (messageIndex: number) => {
    if (isSendingRef.current || !currentChatId) return;

    // メッセージペアを探す（userメッセージとassistantメッセージ）
    if (messageIndex < 1) return;

    const userMessage = messages[messageIndex - 1];
    if (userMessage.role !== 'user') return;

    isSendingRef.current = true;
    setReloadingMessageIndex(messageIndex);

    try {
      const res = await apiPostJson<MessageResponse>(`/chats/${currentChatId}/messages`, {
        content: userMessage.content
      });

      // 新しいassistantメッセージで置き換え
      const newAssistantMessage: Message = {
        role: 'assistant',
        content: res.assistant_msg.content,
        id: res.assistant_msg.id,
        created_at: res.assistant_msg.created_at,
        updated_at: res.assistant_msg.updated_at,
      };

      setMessages((prev) => [...prev.slice(0, messageIndex), newAssistantMessage, ...prev.slice(messageIndex + 1)]);

      // チャット情報を更新
      setChats((prev) =>
        prev.map((c) => (c.id === currentChatId ? { ...c, updated_at: res.chat.updated_at } : c))
      );
    } catch (e) {
      console.error(e);
      alert('メッセージの再読み込みに失敗しました');
    } finally {
      isSendingRef.current = false;
      setReloadingMessageIndex(null);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        chats={chats}
        setChats={setChats}
        setCurrentChatId={setCurrentChatId}
        setMessages={setMessages}
        currentChatId={currentChatId}
        onChatDelete={handleChatDelete}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {currentChatId ? (
          <>
            {/* メッセージ一覧 */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 h-0 p-4">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onReload={msg.role === 'assistant' ? () => handleReload(index) : undefined}
                  isReloading={reloadingMessageIndex === index}
                />
              ))}
            </ScrollArea>
            {/* 入力欄 */}
            <div className="border-t">
              <ChatInput onSend={handleSend} />
            </div>
          </>
        ) : (
          // currentChat が null のとき中央に入力欄
          <div className="flex-1 grid place-items-center p-4">
            <div className="w-full max-w-2xl">
              <div className="text-center text-sm text-muted-foreground mb-3">
                左のリストからチャットを選ぶか、新しく入力して開始してください
              </div>
              <ChatInput onSend={handleSend} />
            </div>
          </div>
        )}
      </main>

      <ChatDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        chatTitle={deleteDialog.chatTitle}
        onConfirm={handleDeleteConfirm}
        isDeleting={deletingChatId !== null}
      />
    </div>
  );
};
