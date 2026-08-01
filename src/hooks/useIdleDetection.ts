import { useEffect, useRef } from 'react';
import { useStellarisStore } from '@/store';

const IDLE_TIMEOUT_MS = 30000; // 30 seconds

export const useIdleDetection = () => {
  const { setIdle } = useStellarisStore();
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleActivity = () => {
      setIdle(false);
      
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        setIdle(true);
      }, IDLE_TIMEOUT_MS);
    };

    // Initial setup
    handleActivity();

    // Listen to activity events
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('wheel', handleActivity);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('wheel', handleActivity);
    };
  }, [setIdle]);
};
