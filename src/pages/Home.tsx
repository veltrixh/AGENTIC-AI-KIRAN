import { motion } from "motion/react";
import { ArrowRight, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";
import Hero3D from "../components/Hero3D";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] text-center w-full">
      <Hero3D />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-3xl space-y-8 mt-16 w-full"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9D94FF]/10 text-[#9D94FF] text-sm font-medium mb-4 glow-purple border border-[#9D94FF]/20">
          <HeartHandshake className="w-4 h-4" />
          Kolkata Tech Community
        </div>
        
        <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed font-medium">
          An autonomous mentorship platform designed to connect you with the right peers and guides. In loving memory of Kiran Mishra 🕊️.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            to="/mentor"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#2DD4BF] text-[#0A0A0B] font-bold hover:bg-[#46dfcb] transition-all glow-teal active:scale-95"
          >
            Find a Mentor
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/community"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all active:scale-95"
          >
            Explore Community
          </Link>
        </div>

        <div className="pt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-white/10">
          <Stat value="200+" label="Community Members" />
          <Stat value="45" label="Mentors Available" />
          <Stat value="120+" label="Connections Made" />
        </div>

        <div className="pt-16 pb-12 max-w-2xl mx-auto text-left w-full">
          <h3 className="text-xl font-bold text-white mb-6 text-center">Tribute Wall</h3>
          <div className="glass-card p-6 rounded-2xl relative glow-purple">
            <p className="text-[var(--color-text-secondary)] italic mb-6">"Kiran was the glue of the dev community. She taught me React when I was completely lost. This platform is the perfect way to honor her legacy."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white">R</div>
              <div>
                <div className="text-sm font-bold text-white">Rohan</div>
                <div className="text-xs text-[#9D94FF]">Left 2 hours ago</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ value, label }: { value: string, label: string }) {
  return (
    <div className="space-y-2">
      <div className="text-4xl font-extrabold bg-gradient-to-r from-[#9D94FF] to-[#2DD4BF] bg-clip-text text-transparent drop-shadow-lg">{value}</div>
      <div className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">{label}</div>
    </div>
  );
}
