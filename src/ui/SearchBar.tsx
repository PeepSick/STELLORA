import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useStellarisStore } from '@/store';

const PLACEHOLDERS = [
  'Search memories...',
  'Search agents...',
  'Search projects...',
  'Search knowledge base...',
  'Type a command...'
];

export const SearchBar: React.FC = () => {
  const { isSearchOpen, setSearchOpen } = useStellarisStore();
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const openSearch = () => {
    setSearchOpen(true);
  };

  if (isSearchOpen) return null; // Hide when modal is open

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-40"
    >
      <div 
        onClick={openSearch}
        className="glass rounded-2xl w-[480px] h-12 flex items-center px-4 cursor-pointer hover:bg-white/10 transition-colors group border-white/20 shadow-lg hover:shadow-[0_0_20px_rgba(157,123,255,0.2)]"
      >
        {/* Animated Orb */}
        <div className="relative w-6 h-6 mr-3 flex-shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,_#A88BFF,_transparent_70%)] animate-[spin-slow_4s_linear_infinite]" />
          <Search size={16} className="text-white relative z-10" />
        </div>

        {/* Rotating Placeholder */}
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={placeholderIdx}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute text-sm text-stellaris-muted group-hover:text-stellaris-text"
            >
              {PLACEHOLDERS[placeholderIdx]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Kbd Badge */}
        <div className="flex-shrink-0 ml-3">
          <kbd className="hidden sm:inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-mono text-stellaris-muted">
            <span className="text-[10px]">Ctrl</span>K
          </kbd>
        </div>
      </div>
    </motion.div>
  );
};
