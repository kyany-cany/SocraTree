import { useState } from "react";

export const ChatInput: React.FC<{ onSend: (text: string) => void }> = ({
    onSend,
}) => {
    const [text, setText] = useState("");

    const send = () => {
        if (!text.trim()) return;
        onSend(text);
        setText("");
    };

    return (
        <div className="p-4 flex gap-2 border-t bg-white">
            <input
                className="flex-1 border rounded px-3 py-2"
                placeholder="メッセージを入力"
                value={text}
                onChange={(e) => setText(e.target.value)}
                // onKeyDown={(e) => e.key === "Enter" && send()}
                // onKeyDown={(e) => e.key === "Enter" && send()}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                        send();
                    }
                }}
            />
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={send}
            >
                送信
            </button>
        </div>
    );
};
