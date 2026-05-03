import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Users, Map, Search, QrCode } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import QRModal from "./QRModal";
import AuthUI from "./AuthUI";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const location = useLocation();
  const [isQrOpen, setIsQrOpen] = useState(false);

  const links = [
    { name: "Home", path: "/", icon: Heart },
    { name: "Find Mentor", path: "/mentor", icon: Search },
    { name: "Community", path: "/community", icon: Users },
    { name: "Network", path: "/network", icon: Map },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl">🕊️</span>
              <div className="flex flex-col">
                 <span className="text-lg font-bold bg-gradient-to-r from-[#9D94FF] to-[#2DD4BF] bg-clip-text text-transparent leading-none">
                   Kiran's Corner
                 </span>
                 <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mt-0.5">Memorial Hackathon</span>
              </div>
            </div>

            <div className="hidden sm:flex sm:items-center sm:space-x-8">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 text-sm font-bold transition-all border-b-2 h-16",
                      isActive
                        ? "text-[#9D94FF] border-[#9D94FF] text-glow-purple"
                        : "text-[var(--color-text-secondary)] border-transparent hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsQrOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/10"
              >
                <QrCode className="w-4 h-4" />
                Invite QR
              </button>
              
              <div className="flex items-center border-l border-white/10 pl-4 ml-2">
                <AuthUI />
              </div>
            </div>
          </div>
        </div>
      </nav>
      <QRModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </>
  );
}
