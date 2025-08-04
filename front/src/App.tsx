import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ChatPage } from "./pages/Chat";

export default function App() {
  return (
    <ChatPage />
    // <Router>
    //   <nav>
    //     <Link to="/">Home</Link> | <Link to="/chat">Chat</Link>
    //   </nav>
    //   <Routes>
    //     <Route path="/" element={<h1>Home Page</h1>} />
    //     <Route path="/chat" element={<ChatPage />} />
    //   </Routes>
    // </Router>
  );
}
