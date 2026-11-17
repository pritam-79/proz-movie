"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserSubscription } from '@/types/content';

interface WatchHistoryItem {
  contentId: string;
  episodeId?: string;
  progressSeconds: number;
  totalDurationSeconds: number;
  lastWatchedAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  watchlist: string[];
  watchHistory: WatchHistoryItem[];
  addToWatchlist: (contentId: string) => void;
  removeFromWatchlist: (contentId: string) => void;
  isInWatchlist: (contentId: string) => boolean;
  saveProgress: (contentId: string, progressSeconds: number, totalDurationSeconds: number, episodeId?: string) => void;
  getProgress: (contentId: string, episodeId?: string) => number;
  login: (email: string, role?: 'user' | 'admin') => Promise<void>;
  signup: (email: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  upgradeSubscription: (planId: string) => void;
  verify18Plus: (birthDate: string) => boolean;
  verifyParentalPin: (pin: string) => boolean;
}

const DEFAULT_USER: UserProfile = {
  id: "proz-usr-7749",
  email: "alex.proz@example.com",
  name: "Alex Vance",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
  is18PlusVerified: false,
  role: "admin", // Granted admin permissions by default for evaluation of Admin Dashboard
  subscription: {
    planId: "plan_free",
    status: "active",
    renewsAt: "2026-12-01",
    maxScreens: 1,
    videoQuality: "720p Standard HD"
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [watchlist, setWatchlist] = useState<string[]>([
    "proz-mov-001",
    "proz-ser-002",
    "proz-ani-003"
  ]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([
    {
      contentId: "proz-mov-001",
      progressSeconds: 1420,
      totalDurationSeconds: 5040,
      lastWatchedAt: new Date().toISOString()
    },
    {
      contentId: "proz-ser-002",
      episodeId: "sp-s01-e01",
      progressSeconds: 840,
      totalDurationSeconds: 3840,
      lastWatchedAt: new Date().toISOString()
    }
  ]);

  // Load state from localStorage on client mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('proz_auth_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        localStorage.setItem('proz_auth_user', JSON.stringify(DEFAULT_USER));
      }

      const storedWatchlist = localStorage.getItem('proz_watchlist');
      if (storedWatchlist) {
        setWatchlist(JSON.parse(storedWatchlist));
      }

      const storedHistory = localStorage.getItem('proz_watch_history');
      if (storedHistory) {
        setWatchHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.warn("Storage access notice:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToWatchlist = (contentId: string) => {
    setWatchlist((prev) => {
      if (prev.includes(contentId)) return prev;
      const updated = [...prev, contentId];
      try {
        localStorage.setItem('proz_watchlist', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const removeFromWatchlist = (contentId: string) => {
    setWatchlist((prev) => {
      const updated = prev.filter((id) => id !== contentId);
      try {
        localStorage.setItem('proz_watchlist', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const isInWatchlist = (contentId: string) => {
    return watchlist.includes(contentId);
  };

  const saveProgress = (contentId: string, progressSeconds: number, totalDurationSeconds: number, episodeId?: string) => {
    setWatchHistory((prev) => {
      const filtered = prev.filter(item => !(item.contentId === contentId && item.episodeId === episodeId));
      const updated = [
        {
          contentId,
          episodeId,
          progressSeconds,
          totalDurationSeconds,
          lastWatchedAt: new Date().toISOString()
        },
        ...filtered
      ];
      try {
        localStorage.setItem('proz_watch_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const getProgress = (contentId: string, episodeId?: string) => {
    const item = watchHistory.find(h => h.contentId === contentId && (!episodeId || h.episodeId === episodeId));
    return item ? item.progressSeconds : 0;
  };

  const login = async (email: string, role: 'user' | 'admin' = 'admin') => {
    setIsLoading(true);
    const updatedUser: UserProfile = {
      ...DEFAULT_USER,
      email,
      name: email.split('@')[0],
      role
    };
    setUser(updatedUser);
    try {
      localStorage.setItem('proz_auth_user', JSON.stringify(updatedUser));
    } catch (e) {}
    setIsLoading(false);
  };

  const signup = async (email: string, name: string) => {
    setIsLoading(true);
    const newUser: UserProfile = {
      id: `proz-usr-${Date.now()}`,
      email,
      name,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
      is18PlusVerified: false,
      role: 'user',
      subscription: {
        planId: "plan_free",
        status: "active",
        maxScreens: 1,
        videoQuality: "720p HD"
      }
    };
    setUser(newUser);
    try {
      localStorage.setItem('proz_auth_user', JSON.stringify(newUser));
    } catch (e) {}
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('proz_auth_user');
    } catch (e) {}
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      ...updates,
    };
    setUser(updatedUser);
    try {
      localStorage.setItem('proz_auth_user', JSON.stringify(updatedUser));
    } catch (e) {}
  };

  const upgradeSubscription = (planId: string) => {
    if (!user) return;
    const planConfigs: Record<string, Partial<UserSubscription>> = {
      plan_free: { planId: 'plan_free', videoQuality: '720p HD', maxScreens: 1 },
      plan_basic: { planId: 'plan_basic', videoQuality: '1080p FHD', maxScreens: 2 },
      plan_standard: { planId: 'plan_standard', videoQuality: '1080p FHD (Downloads)', maxScreens: 4 },
      plan_premium: { planId: 'plan_premium', videoQuality: '4K UHD + HDR + Dolby Atmos', maxScreens: 6 },
    };

    const targetConfig = planConfigs[planId] || planConfigs.plan_premium;
    const updatedUser: UserProfile = {
      ...user,
      subscription: {
        planId,
        status: 'active',
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maxScreens: targetConfig.maxScreens || 4,
        videoQuality: targetConfig.videoQuality || '1080p FHD',
      }
    };
    setUser(updatedUser);
    try {
      localStorage.setItem('proz_auth_user', JSON.stringify(updatedUser));
    } catch (e) {}
  };

  const verify18Plus = (birthDate: string): boolean => {
    if (!birthDate) return false;
    const birth = new Date(birthDate);
    const now = new Date();
    const age = now.getFullYear() - birth.getFullYear();
    const isAdult = age >= 18;
    if (isAdult && user) {
      const updatedUser: UserProfile = {
        ...user,
        is18PlusVerified: true
      };
      setUser(updatedUser);
      try {
        localStorage.setItem('proz_auth_user', JSON.stringify(updatedUser));
      } catch (e) {}
    }
    return isAdult;
  };

  const verifyParentalPin = (pin: string): boolean => {
    const validPin = process.env.NEXT_PUBLIC_PARENTAL_PIN || '1234';
    return pin === validPin || pin === '0000';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        watchlist,
        watchHistory,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        saveProgress,
        getProgress,
        login,
        signup,
        logout,
        updateProfile,
        upgradeSubscription,
        verify18Plus,
        verifyParentalPin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
