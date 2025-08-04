import { useState } from "react";
import { Button } from "@/components/ui/button";

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
                onKeyDown={(e) => {
                    if (e.nativeEvent.isComposing) return;

                    if (e.key === "Enter") {
                        if (e.shiftKey) {
                            return;
                        }
                        e.preventDefault();
                        send();
                    }
                }}
            />
            <Button
                // className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={send}
            >
                送信
            </Button>
        </div>
    );
};
