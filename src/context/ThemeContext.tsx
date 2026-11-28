'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemePreference = 'dark' | 'light' | 'system';

interface ThemeContextType {
  preference: ThemePreference;
  resolvedTheme: 'dark' | 'light';
  setTheme: (pref: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_THEME_KEY = 'proz_theme_preference_v1';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  const applyResolved = useCallback((pref: ThemePreference) => {
    if (typeof window === 'undefined') return;
    let next: 'dark' | 'light' = 'dark';
    if (pref === 'light') next = 'light';
    else if (pref === 'system') {
      next = window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    setResolvedTheme(next);
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(next);
    root.style.colorScheme = next;
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY) as ThemePreference | null;
      const initial = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'dark';
      setPreference(initial);
      applyResolved(initial);
    } catch {
      applyResolved('dark');
    }
  }, [applyResolved]);

  useEffect(() => {
    if (preference !== 'system' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => applyResolved('system');
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, [preference, applyResolved]);

  const setTheme = useCallback(
    (pref: ThemePreference) => {
      setPreference(pref);
      applyResolved(pref);
      try {
        localStorage.setItem(STORAGE_THEME_KEY, pref);
      } catch {}
    },
    [applyResolved]
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      preference: 'dark' as ThemePreference,
      resolvedTheme: 'dark' as const,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
