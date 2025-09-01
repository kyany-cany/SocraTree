import { useEffect, useState } from "react";
import { ChatMessage } from "../components/chatmessage";
import { ChatInput } from "../components/chatinput";
import { Sidebar } from "../components/sidebar";
import axios from "axios";
import type { Chat } from "@/types";
import { apiGetJson } from "@/lib/api";

type Message = {
    role: "user" | "assistant";
    content: string;
};

const dummyMessages: Message[] = [
    { role: "user", content: "こんにちは" },
    { role: "assistant", content: "こんにちは！今日はどのようなご用件でしょうか？" },
];

export const ChatPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentChat, setCurrentChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    const handleSend = async (text: string) => {
        setMessages((prev) => [...prev, { role: "user", content: text }]);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/chats`, { message: text });
            setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { role: "assistant", content: "エラーが発生しました" }]);
        }
    };

    useEffect(() => {
        if (currentChat) {
            (async () => {
                try {
                    // const list = await apiGetJson<Message[]>(`/chats/${currentChat.id}/messages`);
                    setMessages(dummyMessages);
                } finally {
                }
            })();
        } else {
            setMessages([]);
        }
    }, [currentChat]);

    return (
        <div className="flex h-full overflow-hidden">
            <Sidebar
                open={sidebarOpen}
                onToggle={() => setSidebarOpen((prev) => !prev)}
                setCurrentChat={setCurrentChat}
            />

            <main className="flex-1 flex flex-col overflow-hidden">
                {currentChat ? (
                    <>
                        {/* メッセージ一覧 */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {messages.map((msg, i) => (
                                <ChatMessage key={i} message={msg} />
                            ))}
                        </div>
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
        </div>
    );
};
