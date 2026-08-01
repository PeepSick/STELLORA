import { useEffect } from 'react';
import { useStellarisStore } from '@/store';

export const useKeyboard = () => {
  const { isSearchOpen, toggleSearch, setSearchOpen, selectNode, isFullscreen, setFullscreen } = useStellarisStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to toggle search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSearch();
      }

      // Escape to close things
      if (e.key === 'Escape') {
        if (isSearchOpen) {
          setSearchOpen(false);
        } else {
          selectNode(null);
        }
      }

      // F11 to toggle fullscreen handled by browser, but we can hook into state if needed
      if (e.key === 'F11') {
        setFullscreen(!isFullscreen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, toggleSearch, setSearchOpen, selectNode, isFullscreen, setFullscreen]);
};
