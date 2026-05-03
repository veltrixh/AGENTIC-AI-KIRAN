import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, CheckCircle2, AlertCircle, Copy, Check, ChevronRight } from "lucide-react";
import AgentVisualizer from "../components/AgentVisualizer";

type AgentStep = {
  step: string;
  message: string;
  details?: any;
};

type Match = {
  mentor: {
    name: string;
    roles: string[];
    bio: string;
    teach: string[];
    avatar: string;
  };
  roadmap: { week: number; plan: string }[];
  draftMessage: string;
};

export default function MentorFind() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "complete" | "error">("idle");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!input.trim()) return;
    
    setStatus("running");
    setSteps([]);
    setMatches([]);

    try {
      const response = await fetch("/api/agent/mentor-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Split by double newline because it's an SSE stream
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.substring(6); // Remove "data: " prefix
            if (!dataStr.trim()) continue;
            
            try {
              const data = JSON.parse(dataStr);
              
              if (data.step === "Complete") {
                setMatches(data.matches);
                setStatus("complete");
              } else if (data.step === "Error" || data.step === "error") {
                setStatus("error");
                setSteps(prev => [...prev, { step: "Error", message: data.message }]);
              } else {
                setSteps(prev => [...prev, data]);
              }
            } catch (e) {
              console.error("Failed to parse SSE JSON:", e, dataStr);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 min-h-[70vh]">
      <div className="text-center space-y-4 pt-4 relative z-10">
        <h1 className="text-4xl font-bold tracking-tight text-white">Find Your Mentor</h1>
        <p className="text-lg text-[var(--color-text-secondary)]">Autonomous agentic pairing honoring Kiran's legacy of connection.</p>
      </div>

      <AnimatePresence mode="wait">
        {/* STATE A: INPUT */}
        {status === "idle" && (
          <motion.div 
            key="input-state"
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto glass-card p-8 rounded-2xl relative glow-purple z-10"
          >
            <label className="block font-medium text-white mb-4 text-center">
              Describe your skills, level, and what you want to learn.
            </label>
            <div className="relative">
              <textarea
                className="w-full min-h-[160px] p-5 rounded-xl border border-white/10 bg-[#0A0A0B]/50 focus:bg-[#0A0A0B]/80 focus:border-[#9D94FF] focus:ring-4 focus:ring-[#9D94FF]/20 resize-none outline-none transition-all placeholder:text-[var(--color-text-secondary)] text-white text-lg disabled:opacity-50"
                placeholder="I've been working mostly with frontend frameworks like React, but I'm looking to dive deeper into backend architecture, specifically LangGraph and FastAPI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={handleSearch}
                disabled={!input.trim()}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#9D94FF] text-[#0A0A0B] text-lg font-bold rounded-xl hover:bg-[#b0a8ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-purple active:scale-95 w-full sm:w-auto"
              >
                Find My Mentor
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STATE B: RUNNING VISUALIZER */}
        {status === "running" && (
          <motion.div 
            key="running-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-8 relative z-10"
          >
            <AgentVisualizer steps={steps} status={status} />
          </motion.div>
        )}

        {/* STATE C: RESULTS */}
        {status === "complete" && (
          <motion.div 
            key="results-state"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8 relative z-10"
          >
            <div className="flex justify-between items-center bg-[#2DD4BF]/10 text-[#2DD4BF] px-6 py-4 rounded-xl border border-[#2DD4BF]/20">
              <span className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" /> 
                Mentorship Matches Found
              </span>
              <button 
                onClick={() => { setStatus("idle"); setInput(""); }} 
                className="text-sm font-medium underline text-white hover:text-[var(--color-text-secondary)] transition-colors"
              >
                Start New Search
              </button>
            </div>

            {matches.length === 0 ? (
              <div className="text-center py-12 px-6 glass-card rounded-2xl glow-purple">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No exactly matching mentors found.</h3>
                <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">Try broadening your learning goals, or explore the community directory directly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {matches.map((match, idx) => (
                  <div key={idx} className="glass-card rounded-2xl overflow-hidden glow-teal">
                    
                    {/* Mentor Profile Header */}
                    <div className="p-6 border-b border-white/10 bg-[#0A0A0B]/50 flex items-center gap-5">
                      <img src={match.mentor.avatar} alt={match.mentor.name} className="w-20 h-20 rounded-full bg-white/5 shadow-sm ring-4 ring-white/10" />
                      <div>
                        <h3 className="text-xl font-bold text-white text-glow-teal">{match.mentor.name}</h3>
                        <div className="font-bold text-[#9D94FF] text-sm mt-1">{match.mentor.roles.join(" • ")}</div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {match.mentor.teach.slice(0, 3).map(skill => (
                            <span key={skill} className="px-2 py-0.5 bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] text-xs font-bold rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-8">
                      {/* 4 Week Roadmap */}
                      <div>
                        <h4 className="font-bold text-white mb-4 pb-2 border-b border-white/10">4-Week Learning Roadmap</h4>
                        <div className="space-y-4">
                          {match.roadmap && match.roadmap.length > 0 ? match.roadmap.map((rm, i) => (
                            <div key={i} className="flex gap-4">
                              <div className="flex flex-col items-center select-none pt-1">
                                <span className="w-8 h-8 rounded-full bg-[#0A0A0B] border border-white/20 flex items-center justify-center text-xs font-bold text-[#9D94FF]">W{rm.week}</span>
                                {i !== match.roadmap.length - 1 && <div className="w-0.5 h-full bg-white/10 mt-2"></div>}
                              </div>
                              <p className="text-sm text-white leading-relaxed pt-1.5">{rm.plan}</p>
                            </div>
                          )) : (
                            <p className="text-sm text-[var(--color-text-secondary)] italic">Roadmap generation minimal.</p>
                          )}
                        </div>
                      </div>

                      {/* Outreach Message */}
                      <div className="bg-[#0A0A0B]/50 rounded-xl p-5 border border-white/5 relative group transition-all hover:bg-[#0A0A0B]/80">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-white text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#2DD4BF]"></span>
                            Suggested Outreach Message
                          </h4>
                          <button 
                            onClick={() => copyToClipboard(match.draftMessage, idx)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-[var(--color-text-secondary)] hover:text-white hover:bg-white/10 transition shadow-sm active:scale-95"
                          >
                            {copiedIndex === idx ? (
                              <><Check className="w-3.5 h-3.5 text-green-400" /> Copied!</>
                            ) : (
                              <><Copy className="w-3.5 h-3.5" /> Copy Message</>
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">
                          {match.draftMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* STATE D: ERROR */}
        {status === "error" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto bg-red-950/30 p-8 rounded-2xl border border-red-500/30 text-center relative z-10"
          >
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-200 mb-2">Connection Interrupted</h3>
            <p className="text-red-300/80 mb-6">There was a problem communicating with the Agent backend. Please check server logs.</p>
            <button 
              onClick={() => setStatus("idle")} 
              className="px-6 py-3 bg-red-900/50 text-white font-bold rounded-xl border border-red-500/50 shadow-sm hover:bg-red-800/50 transition active:scale-95 glow-purple"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

