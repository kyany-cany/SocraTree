import { useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/chats`,
        { message }
      );
      setReply(response.data.reply || "返答がありません");
    } catch (error) {
      console.error(error);
      setReply("エラーが発生しました");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>MetaChat</h1>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={message}
          placeholder="メッセージを入力"
          onChange={(e) => setMessage(e.target.value)}
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button onClick={handleSend} style={{ padding: "0.5rem 1rem" }}>
          送信
        </button>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <label>レスポンス:</label>
        <div
          style={{
            padding: "1rem",
            border: "1px solid #ccc",
            minHeight: "4rem",
            marginTop: "0.5rem",
          }}
        >
          {reply}
        </div>
      </div>
    </div>
  );
}

export default App;
