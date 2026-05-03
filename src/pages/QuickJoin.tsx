import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export default function QuickJoin() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    teach: "",
    learn: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/community/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teach: formData.teach.split(',').map(s => s.trim()).filter(Boolean),
          learn: formData.learn.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/network';
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
           initial={{ scale: 0.5, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ type: "spring", stiffness: 300, damping: 20 }}
           className="w-24 h-24 bg-[#2DD4BF]/20 rounded-full flex items-center justify-center mb-8 glow-teal"
        >
          <CheckCircle2 className="w-12 h-12 text-[#2DD4BF]" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to the Network, {formData.name.split(' ')[0]}!</h1>
        <p className="text-[var(--color-text-secondary)]">Connecting you to the constellation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col p-6 max-w-md mx-auto">
      <div className="mt-8 mb-12">
         <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-[#9D94FF]" />
            <span className="text-xl font-bold bg-gradient-to-r from-[#9D94FF] to-[#2DD4BF] bg-clip-text text-transparent">Kiran's Corner</span>
         </div>
         <h1 className="text-3xl font-bold text-white">Join the Circle</h1>
         <p className="text-[var(--color-text-secondary)] mt-2">Connect instantly with Kolkata's builders.</p>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-[#9D94FF] glow-purple' : 'bg-white/10'}`} />
        ))}
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-white mb-2">What's your name?</label>
                <input
                  type="text"
                  autoFocus
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#9D94FF] transition-colors"
                  placeholder="e.g. Aditi Sharma"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Current Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#9D94FF] transition-colors"
                  placeholder="e.g. Frontend Dev, Student..."
                />
              </div>
              <button 
                onClick={nextStep}
                disabled={!formData.name || !formData.role}
                className="w-full bg-[#9D94FF] text-[#0A0A0B] font-bold py-4 rounded-xl mt-8 flex justify-center items-center gap-2 hover:bg-[#b0a8ff] transition-colors disabled:opacity-50"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-white mb-2">What can you teach?</label>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">List up to 3 skills, separated by commas.</p>
                <input
                  type="text"
                  autoFocus
                  value={formData.teach}
                  onChange={e => setFormData({...formData, teach: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#2DD4BF] transition-colors"
                  placeholder="e.g. React, UX Design, Python"
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={prevStep} className="px-6 py-4 rounded-xl bg-white/5 text-white border border-white/10 font-bold">Back</button>
                <button 
                  onClick={nextStep}
                  disabled={!formData.teach}
                  className="flex-1 bg-[#2DD4BF] text-[#0A0A0B] font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-[#46dfcb] transition-colors disabled:opacity-50 glow-teal"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-white mb-2">What do you want to learn?</label>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">List up to 3 topics, separated by commas.</p>
                <input
                  type="text"
                  autoFocus
                  value={formData.learn}
                  onChange={e => setFormData({...formData, learn: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#9D94FF] transition-colors"
                  placeholder="e.g. Machine Learning, System Design"
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={prevStep} className="px-6 py-4 rounded-xl bg-white/5 text-white border border-white/10 font-bold">Back</button>
                <button 
                  onClick={handleSubmit}
                  disabled={!formData.learn || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-[#9D94FF] to-[#2DD4BF] text-[#0A0A0B] font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 glow-purple"
                >
                  {isSubmitting ? "Joining..." : "Join Network"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
