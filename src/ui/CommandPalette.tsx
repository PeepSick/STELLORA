import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Clock, ArrowRight, X } from 'lucide-react';
import { useStellarisStore } from '@/store';
import { fuzzySearch, getRecentSearches, saveRecentSearch } from '@/utils/fuzzySearch';
import { StellarisNode, SearchResult } from '@/types';

export const CommandPalette: React.FC = () => {
  const { isSearchOpen, setSearchOpen, nodes, searchIndex, selectNode, focusOnNode } = useStellarisStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setRecentSearches(getRecentSearches());
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = fuzzySearch(query, [...nodes, ...searchIndex]);
      setResults(searchResults);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query, nodes, searchIndex]);

  const closeSearch = () => {
    setSearchOpen(false);
  };

  const handleSelect = (item: SearchResult | string) => {
    if (typeof item === 'string') {
      // Clicked a recent search
      setQuery(item);
      return;
    }
    
    // Clicked a node result
    saveRecentSearch(query);
    closeSearch();
    selectNode(item.node.id);
    focusOnNode(item.node.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeSearch();
      return;
    }

    const maxIndex = query ? results.length - 1 : recentSearches.length - 1;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (query && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (!query && recentSearches[selectedIndex]) {
        handleSelect(recentSearches[selectedIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl glass-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
          >
            {/* Input Header */}
            <div className="flex items-center px-4 py-4 border-b border-white/10 gap-3">
              <Search className="text-stellaris-primary" size={20} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search nodes, commands, or agents..."
                className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-stellaris-muted"
              />
              <button 
                onClick={closeSearch}
                className="p-1.5 rounded-lg hover:bg-white/10 text-stellaris-muted hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Results Area */}
            <div className="overflow-y-auto p-2 flex-1 min-h-[100px]">
              {!query && recentSearches.length > 0 && (
                <div className="py-2">
                  <div className="px-3 pb-2 text-xs font-semibold text-stellaris-muted uppercase tracking-wider">
                    Recent Searches
                  </div>
                  {recentSearches.map((term, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelect(term)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                        selectedIndex === idx ? 'bg-white/10 text-white' : 'text-stellaris-muted hover:bg-white/5'
                      }`}
                    >
                      <Clock size={16} />
                      <span className="flex-1">{term}</span>
                    </div>
                  ))}
                </div>
              )}

              {query && results.length > 0 && (
                <div className="py-2">
                  <div className="px-3 pb-2 text-xs font-semibold text-stellaris-muted uppercase tracking-wider">
                    Nodes
                  </div>
                  {results.map((result, idx) => (
                    <div
                      key={result.node.id}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${
                        selectedIndex === idx 
                          ? 'bg-gradient-to-r from-stellaris-primary/20 to-transparent border-l-2 border-stellaris-primary text-white shadow-[inset_0_0_20px_rgba(157,123,255,0.1)]' 
                          : 'border-l-2 border-transparent text-stellaris-text hover:bg-white/5'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 shrink-0" style={{ borderColor: result.node.color + '40' }}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: result.node.color, boxShadow: `0 0 10px ${result.node.color}` }} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium truncate">{result.node.title}</div>
                        <div className="text-xs text-stellaris-muted truncate">{result.node.description || result.node.type}</div>
                      </div>
                      <div className="text-xs bg-white/5 px-2 py-1 rounded text-stellaris-muted shrink-0">
                        Score: {Math.round(result.score * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {query && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-stellaris-muted">
                  <Search size={32} className="mb-4 opacity-50" />
                  <p>No results found for "{query}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-stellaris-muted bg-white/5">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1.5 rounded font-mono">↑</kbd> <kbd className="bg-white/10 px-1.5 rounded font-mono">↓</kbd> to navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1.5 rounded font-mono">Enter</kbd> to select</span>
                <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1.5 rounded font-mono">Esc</kbd> to close</span>
              </div>
              <div className="flex items-center gap-1">
                <Command size={14} /> Stellaris OS
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
