import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const CinematicIntro: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    'LEOSIS INITIALIZING UNIVERSE...',
    'LOADING 380,000 STELLAR CLUSTERS...',
    'SYNCHRONIZING KNOWLEDGE GRAPH...',
    'READY',
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 700);
    const timer2 = setTimeout(() => setStep(2), 1400);
    const timer3 = setTimeout(() => setStep(3), 2000);
    const timer4 = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 bg-[#05060d] flex flex-col items-center justify-center font-mono pointer-events-none"
      >
        {/* Glowing Center Logo Orb */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-amber-400 to-cyan-400 animate-spin-slow blur-[2px] opacity-80" />
          <div className="absolute w-8 h-8 rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,1)]" />
        </div>

        {/* Leosis Title */}
        <h1 className="text-xl font-bold tracking-[0.3em] text-white font-mono mb-2">
          LEOSIS OS
        </h1>

        {/* Progress Step Subtitle */}
        <div className="h-6 flex items-center justify-center">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="text-xs tracking-[0.2em] text-purple-300 font-semibold"
          >
            {steps[step]}
          </motion.p>
        </div>

        {/* Loading Bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${(step + 1) * 25}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-300"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
