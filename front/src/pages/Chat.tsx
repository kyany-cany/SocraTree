import { useState } from "react";
import axios from "axios";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, newMessage]);
        setInput("");

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/chats`, { message: input });
            setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { role: "assistant", content: "エラーが発生しました" }]);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {/* メッセージ表示 */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: "flex",
                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                            marginBottom: "0.5rem"
                        }}
                    >
                        <div
                            style={{
                                maxWidth: "60%",
                                padding: "0.5rem 1rem",
                                borderRadius: "1rem",
                                background: msg.role === "user" ? "#007bff" : "#e5e5ea",
                                color: msg.role === "user" ? "#fff" : "#000"
                            }}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* 入力欄 */}
            <div style={{ display: "flex", padding: "0.5rem", borderTop: "1px solid #ccc" }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="メッセージを入力"
                    style={{ flex: 1, marginRight: "0.5rem" }}
                />
                <button onClick={handleSend}>送信</button>
            </div>
        </div>
    );
}
