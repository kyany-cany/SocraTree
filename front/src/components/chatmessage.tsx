type Message = {
    role: "user" | "assistant";
    content: string;
};

export const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === "user";
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
            <div
                className={`rounded-2xl px-4 py-2 max-w-[70%] ${isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                    }`}
            >
                {message.content}
            </div>
        </div>
    );
};
