import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { VisualMode, VisualModeContextType } from '../types';
import soundManager from '../utils/soundManager';

const VisualModeContext = createContext<VisualModeContextType | null>(null);

const STORAGE_KEY = 'elix_visual_mode';

interface VisualModeProviderProps {
  children: ReactNode;
}

export const VisualModeProvider: React.FC<VisualModeProviderProps> = ({ children }) => {
  // Always default to 'normal' for first-time visitors, or read from localStorage if present
  const [mode, setModeState] = useState<VisualMode>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'ultra' || saved === 'normal') {
          return saved;
        }
      }
    } catch {
      // Fallback
    }
    return 'normal';
  });

  const [isLoaderActive, setIsLoaderActive] = useState<boolean>(false);
  const [loaderLabel, setLoaderLabel] = useState<string>('INITIALIZING ULTRA EXPERIENCE // 2026-LIVE');
  const loaderTimeoutRef = useRef<number | null>(null);

  // Sync DOM attributes whenever mode changes
  useEffect(() => {
    try {
      const root = document.documentElement;
      root.setAttribute('data-visual-mode', mode);
      root.classList.toggle('mode-ultra', mode === 'ultra');
      root.classList.toggle('mode-normal', mode === 'normal');
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (err) {
      console.warn('Could not persist visual mode:', err);
    }
  }, [mode]);

  const triggerCinematicLoader = useCallback((durationMs: number = 850, label: string = 'INITIALIZING ULTRA EXPERIENCE // 2026-LIVE') => {
    if (loaderTimeoutRef.current) {
      window.clearTimeout(loaderTimeoutRef.current);
    }
    setLoaderLabel(label);
    setIsLoaderActive(true);

    loaderTimeoutRef.current = window.setTimeout(() => {
      setIsLoaderActive(false);
      loaderTimeoutRef.current = null;
    }, durationMs);
  }, []);

  const setMode = useCallback((newMode: VisualMode) => {
    if (newMode === mode) return;

    soundManager.playModeSwitch(newMode === 'ultra');

    if (newMode === 'ultra') {
      triggerCinematicLoader(900, 'ACTIVATING ULTRA GRAPHICS // 2026-LIVE');
    }

    setModeState(newMode);
  }, [mode, triggerCinematicLoader]);

  const toggleMode = useCallback(() => {
    const nextMode: VisualMode = mode === 'normal' ? 'ultra' : 'normal';
    setMode(nextMode);
  }, [mode, setMode]);

  const value: VisualModeContextType = {
    mode,
    isUltra: mode === 'ultra',
    setMode,
    toggleMode,
    triggerCinematicLoader,
    isLoaderActive,
    loaderLabel,
  };

  return (
    <VisualModeContext.Provider value={value}>
      {children}
    </VisualModeContext.Provider>
  );
};

export const useVisualMode = (): VisualModeContextType => {
  const context = useContext(VisualModeContext);
  if (!context) {
    throw new Error('useVisualMode must be used within a VisualModeProvider');
  }
  return context;
};

export default VisualModeContext;

