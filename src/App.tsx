import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MentorFind from "./pages/MentorFind";
import Community from "./pages/Community";
import NetworkMap from "./pages/NetworkMap";
import QuickJoin from "./pages/QuickJoin";

export default function App() {
  const location = useLocation();
  const isJoinPage = location.pathname === '/join';

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans selection:bg-[#9D94FF]/30">
      {!isJoinPage && <Navbar />}
      <main className={isJoinPage ? "w-full" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mentor" element={<MentorFind />} />
          <Route path="/community" element={<Community />} />
          <Route path="/network" element={<NetworkMap />} />
          <Route path="/join" element={<QuickJoin />} />
        </Routes>
      </main>
    </div>
  );
}
