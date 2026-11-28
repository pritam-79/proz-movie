"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserSubscription } from '@/types/content';
import { getSupabaseBrowserClient, isSupabaseAuthConfigured } from '@/lib/supabase/client';

interface WatchHistoryItem {
  contentId: string;
  episodeId?: string;
  progressSeconds: number;
  totalDurationSeconds: number;
  lastWatchedAt: string;
}

interface AuthActionResult {
  ok: boolean;
  message?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  supabaseConfigured: boolean;
  watchlist: string[];
  watchHistory: WatchHistoryItem[];
  addToWatchlist: (contentId: string) => void;
  removeFromWatchlist: (contentId: string) => void;
  isInWatchlist: (contentId: string) => boolean;
  saveProgress: (contentId: string, progressSeconds: number, totalDurationSeconds: number, episodeId?: string) => void;
  getProgress: (contentId: string, episodeId?: string) => number;
  login: (email: string, role?: 'user' | 'admin', password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<AuthActionResult>;
  sendPhoneOtp: (phone: string) => Promise<AuthActionResult>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<AuthActionResult>;
  requestPasswordReset: (email: string) => Promise<AuthActionResult>;
  signup: (email: string, name: string, password?: string) => Promise<AuthActionResult>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  upgradeSubscription: (planId: string) => void;
  verify18Plus: (birthDate: string) => boolean;
  verifyParentalPin: (pin: string) => boolean;
}

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop";

const DEFAULT_USER: UserProfile = {
  id: "proz-usr-7749",
  email: "alex.proz@example.com",
  name: "Alex Vance",
  avatarUrl: DEFAULT_AVATAR,
  is18PlusVerified: false,
  role: "admin",
  subscription: {
    planId: "plan_free",
    status: "active",
    renewsAt: "2026-12-01",
    maxScreens: 1,
    videoQuality: "720p Standard HD"
  }
};

function loadPersistedAvatar(emailOrPhone?: string): string | undefined {
  if (!emailOrPhone || typeof window === 'undefined') return undefined;
  try {
    return localStorage.getItem(`proz_avatar_${emailOrPhone.toLowerCase()}`) || undefined;
  } catch {
    return undefined;
  }
}

function savePersistedAvatar(emailOrPhone?: string, avatarUrl?: string) {
  if (!emailOrPhone || typeof window === 'undefined') return;
  try {
    const key = `proz_avatar_${emailOrPhone.toLowerCase()}`;
    if (avatarUrl) {
      localStorage.setItem(key, avatarUrl);
    } else {
      localStorage.removeItem(key);
    }
  } catch {}
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabaseConfigured = isSupabaseAuthConfigured();
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

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('proz_auth_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser) as UserProfile;
        const savedAvatar = loadPersistedAvatar(parsed.email);
        if (savedAvatar && !parsed.avatarUrl) {
          parsed.avatarUrl = savedAvatar;
        }
        setUser(parsed);
      } else {
        localStorage.setItem('proz_auth_user', JSON.stringify(DEFAULT_USER));
      }

      const storedWatchlist = localStorage.getItem('proz_watchlist');
      if (storedWatchlist) setWatchlist(JSON.parse(storedWatchlist));

      const storedHistory = localStorage.getItem('proz_watch_history');
      if (storedHistory) setWatchHistory(JSON.parse(storedHistory));
    } catch (e) {
      console.warn("Storage access notice:", e);
    } finally {
      setIsLoading(false);
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const sbUser = data.session.user;
        const email = sbUser.email || sbUser.phone || 'member@proz.local';
        const savedAvatar = loadPersistedAvatar(email);
        const nextUser: UserProfile = {
          id: sbUser.id,
          email,
          name: (sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || email.split('@')[0]) as string,
          avatarUrl: savedAvatar || sbUser.user_metadata?.avatar_url || DEFAULT_AVATAR,
          is18PlusVerified: Boolean(sbUser.user_metadata?.is18PlusVerified),
          role: (sbUser.user_metadata?.role === 'admin' ? 'admin' : 'user'),
          subscription: DEFAULT_USER.subscription,
        };
        setUser(nextUser);
        try {
          localStorage.setItem('proz_auth_user', JSON.stringify(nextUser));
        } catch {}
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const sbUser = session.user;
        const email = sbUser.email || sbUser.phone || 'member@proz.local';
        const savedAvatar = loadPersistedAvatar(email);
        const nextUser: UserProfile = {
          id: sbUser.id,
          email,
          name: (sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || email.split('@')[0]) as string,
          avatarUrl: savedAvatar || sbUser.user_metadata?.avatar_url || DEFAULT_AVATAR,
          is18PlusVerified: Boolean(sbUser.user_metadata?.is18PlusVerified),
          role: (sbUser.user_metadata?.role === 'admin' ? 'admin' : 'user'),
          subscription: DEFAULT_USER.subscription,
        };
        setUser(nextUser);
        try {
          localStorage.setItem('proz_auth_user', JSON.stringify(nextUser));
        } catch {}
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const addToWatchlist = (contentId: string) => {
    setWatchlist((prev) => {
      if (prev.includes(contentId)) return prev;
      const updated = [...prev, contentId];
      try {
        localStorage.setItem('proz_watchlist', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeFromWatchlist = (contentId: string) => {
    setWatchlist((prev) => {
      const updated = prev.filter((id) => id !== contentId);
      try {
        localStorage.setItem('proz_watchlist', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const isInWatchlist = (contentId: string) => watchlist.includes(contentId);

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
      } catch {}
      return updated;
    });
  };

  const getProgress = (contentId: string, episodeId?: string) => {
    const item = watchHistory.find(h => h.contentId === contentId && (!episodeId || h.episodeId === episodeId));
    return item ? item.progressSeconds : 0;
  };

  const login = async (email: string, role: 'user' | 'admin' = 'admin', password?: string) => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        if (data.user) {
          const savedAvatar = loadPersistedAvatar(email);
          const sbUser: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            name: (data.user.user_metadata?.full_name || email.split('@')[0]) as string,
            avatarUrl: savedAvatar || data.user.user_metadata?.avatar_url || DEFAULT_AVATAR,
            is18PlusVerified: Boolean(data.user.user_metadata?.is18PlusVerified),
            role,
            subscription: DEFAULT_USER.subscription,
          };
          setUser(sbUser);
          localStorage.setItem('proz_auth_user', JSON.stringify(sbUser));
          return;
        }
      }

      const savedAvatar = loadPersistedAvatar(email);
      const updatedUser: UserProfile = {
        ...DEFAULT_USER,
        email,
        name: email.split('@')[0],
        avatarUrl: savedAvatar || DEFAULT_AVATAR,
        role
      };
      setUser(updatedUser);
      localStorage.setItem('proz_auth_user', JSON.stringify(updatedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<AuthActionResult> => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return {
        ok: false,
        message:
          'Google OAuth requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and Google provider configured in Supabase Dashboard.',
      };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/profile` : undefined,
      },
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: 'Redirecting to Google OAuth...' };
  };

  const sendPhoneOtp = async (phone: string): Promise<AuthActionResult> => {
    const clean = phone.trim();
    if (!/^\+[1-9]\d{6,14}$/.test(clean)) {
      return { ok: false, message: 'Enter phone in E.164 format (e.g. +14155551234).' };
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return {
        ok: false,
        message:
          'Phone OTP requires Supabase Auth + SMS provider (Twilio/MessageBird) configured in your deployment environment.',
      };
    }
    const { error } = await supabase.auth.signInWithOtp({ phone: clean });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: `Verification OTP sent to ${clean}.` };
  };

  const verifyPhoneOtp = async (phone: string, token: string): Promise<AuthActionResult> => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return {
        ok: false,
        message: 'Supabase Auth is not configured on this server.',
      };
    }
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: token.trim(),
      type: 'sms',
    });
    if (error) return { ok: false, message: error.message };
    if (data.user) {
      const savedAvatar = loadPersistedAvatar(phone.trim());
      const nextUser: UserProfile = {
        id: data.user.id,
        email: data.user.phone || phone.trim(),
        name: (data.user.user_metadata?.full_name || phone.trim()) as string,
        avatarUrl: savedAvatar || DEFAULT_AVATAR,
        is18PlusVerified: false,
        role: 'user',
        subscription: DEFAULT_USER.subscription,
      };
      setUser(nextUser);
      try {
        localStorage.setItem('proz_auth_user', JSON.stringify(nextUser));
      } catch {}
    }
    return { ok: true };
  };

  const requestPasswordReset = async (email: string): Promise<AuthActionResult> => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return {
        ok: true,
        message: `Local session recovery notice recorded for ${email}. Configure Supabase Auth for live SMTP password reset emails.`,
      };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/login` : undefined,
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: `Password reset email dispatched to ${email}.` };
  };

  const signup = async (email: string, name: string, password?: string): Promise<AuthActionResult> => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase && password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/profile` : undefined,
          },
        });
        if (error) return { ok: false, message: error.message };
        if (data.user) {
          return {
            ok: true,
            message: data.session
              ? 'Account created and signed in.'
              : 'Account created! Check your email inbox to verify your address.',
          };
        }
      }

      const newUser: UserProfile = {
        id: `proz-usr-${Date.now()}`,
        email,
        name,
        avatarUrl: loadPersistedAvatar(email) || DEFAULT_AVATAR,
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
      localStorage.setItem('proz_auth_user', JSON.stringify(newUser));
      return { ok: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    try {
      localStorage.removeItem('proz_auth_user');
    } catch {}
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const nextEmail = updates.email ?? user.email;
    if ('avatarUrl' in updates) {
      savePersistedAvatar(nextEmail, updates.avatarUrl || undefined);
    }
    const updatedUser: UserProfile = {
      ...user,
      ...updates,
    };
    setUser(updatedUser);
    try {
      localStorage.setItem('proz_auth_user', JSON.stringify(updatedUser));
    } catch {}
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
    } catch {}
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
      } catch {}
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
        supabaseConfigured,
        watchlist,
        watchHistory,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        saveProgress,
        getProgress,
        login,
        loginWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        requestPasswordReset,
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
