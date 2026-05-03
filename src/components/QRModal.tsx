import React from "react";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "react-qr-code";
import { X } from "lucide-react";

type QRModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function QRModal({ isOpen, onClose }: QRModalProps) {
  const origin = window.location.origin;
  const joinUrl = origin + '/join';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="pointer-events-auto w-full max-w-sm glass-card rounded-3xl p-8 shadow-2xl relative glow-teal"
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8 mt-2">
                 <h2 className="text-2xl font-bold text-white mb-2">Quick Join</h2>
                 <p className="text-sm text-[var(--color-text-secondary)]">
                   Scan to instantly join the Kolkata Tech Network. No sign-up required.
                 </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-inner mx-auto w-fit mb-6">
                <QRCode value={joinUrl} size={200} fgColor="#0A0A0B" />
              </div>
              
              <div className="text-center pt-4 border-t border-white/10">
                 <p className="text-xs text-[var(--color-text-secondary)]">Or visit directly:</p>
                 <a href={joinUrl} className="text-sm font-bold text-[#2DD4BF] hover:text-[#9D94FF] transition-colors">{joinUrl}</a>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
