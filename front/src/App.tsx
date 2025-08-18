import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ChatPage } from "./pages/Chat";
import SignIn from "./pages/sign_in";

export default function App() {
  const [me, setMe] = useState<{ id: number; email: string } | null | undefined>(undefined);
  if (me === undefined) {
    return <div className="p-6">読み込み中...</div>;
  }
  else if (me === null) {
    return (
      <SignIn
        setMe={setMe}
      />
    );
  }
  else {
    return (
      <ChatPage />
    )
  }
}
