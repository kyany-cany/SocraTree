import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ChatPage } from "./pages/Chat";
import SignIn from "./pages/sign_in";

export default function App() {
  return (
    <Router>
      <nav>
        <Link to="/sign_in">Sign In</Link> | <Link to="/chat">Chat</Link>
      </nav>
      <Routes>
        <Route path="/sign_in" element={<SignIn />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}
