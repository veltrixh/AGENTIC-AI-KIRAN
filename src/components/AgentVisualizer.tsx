import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2, Circle, Terminal } from 'lucide-react';

type AgentVisualizerProps = {
  steps: { step: string; message: string; details?: any }[];
  status: "idle" | "running" | "complete" | "error";
};

const PIPELINE_STEPS = [
  "Extracting",
  "Searching",
  "Drafting",
  "Complete"
];

export default function AgentVisualizer({ steps, status }: AgentVisualizerProps) {
  // Determine current active pipeline step
  const currentStepName = steps.length > 0 ? steps[steps.length - 1].step : "Init";
  
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Animated Pipeline Nodes */}
      <div className="glass-card p-6 rounded-xl relative glow-purple">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-[#9D94FF] animate-spin" />
          Agentic Pipeline Running...
        </h3>
        
        <div className="relative flex justify-between items-center mb-8 px-4">
          <div className="absolute left-4 right-4 top-1/2 -z-10 h-0.5 bg-white/10 -translate-y-1/2"></div>
          
          {PIPELINE_STEPS.map((stepDef) => {
            const hasPassed = steps.some(s => s.step === stepDef) || status === "complete";
            const isActive = currentStepName === stepDef && status === "running";
            
            return (
              <div key={stepDef} className="relative flex flex-col items-center gap-2">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isActive ? 1.2 : 1 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-[#0A0A0B] ${hasPassed ? 'border-[#2DD4BF] text-[#2DD4BF] shadow-[0_0_10px_rgba(45,212,191,0.5)]' : isActive ? 'border-[#9D94FF] text-[#9D94FF] shadow-[0_0_10px_rgba(157,148,255,0.5)]' : 'border-white/20 text-white/20'}`}
                >
                  {hasPassed ? <CheckCircle2 className="w-5 h-5" /> : isActive ? <Circle className="w-4 h-4 fill-current animate-pulse" /> : <div className="w-2 h-2 rounded-full bg-white/20"></div>}
                </motion.div>
                <span className={`text-xs font-semibold ${hasPassed ? 'text-[#2DD4BF]' : isActive ? 'text-[#9D94FF]' : 'text-[var(--color-text-secondary)]'}`}>
                  {stepDef}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Terminal Logs */}
        <div className="bg-[#0A0A0B]/80 rounded-lg p-4 overflow-hidden shadow-inner border border-white/5">
          <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
            <Terminal className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <span className="text-xs font-mono text-[var(--color-text-secondary)] uppercase tracking-widest">Agent Logs</span>
          </div>
          
          <div className="h-40 overflow-y-auto font-mono text-sm space-y-2 scroller pr-2">
            <AnimatePresence initial={false}>
              {steps.map((log, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[var(--color-text-primary)]"
                >
                  <span className="text-[#2DD4BF] mr-2">➜</span>
                  <span className="text-[#9D94FF] mr-2 font-semibold">[{log.step}]</span>
                  <span>{log.message}</span>
                  {log.details && (
                    <motion.pre 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-1 ml-6 p-2 bg-black/50 text-[var(--color-text-secondary)] text-xs rounded border border-white/5 break-words whitespace-pre-wrap"
                    >
                      {JSON.stringify(log.details, null, 2)}
                    </motion.pre>
                  )}
                </motion.div>
              ))}
              {status === "running" && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-[var(--color-text-secondary)]"
                >
                  <span className="text-[#2DD4BF] mr-2">➜</span>
                  <span className="animate-pulse">_</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
