import { useState } from "react";
import { ChatMessage } from "../components/chatmessage";
import { ChatInput } from "../components/chatinput";
import { Sidebar } from "../components/sidebar";
import axios from "axios";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export const ChatPage = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

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

    return (
        <div className="flex h-full overflow-hidden">
            <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((prev) => !prev)} />

            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                    {messages.map((msg, i) => (
                        <ChatMessage key={i} message={msg} />
                    ))}
                </div>
                <ChatInput onSend={handleSend} />
            </main>
        </div>
    );
};
