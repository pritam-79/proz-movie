"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  User,
  Crown,
  Smartphone,
  Check,
  ExternalLink,
  Camera,
  LogOut,
  Flame,
  Trash2,
  Upload,
  ZoomIn,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [rawSelectedImg, setRawSelectedImg] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState<number>(1);
  const [previewCropped, setPreviewCropped] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Render square-cropped 256x256 JPEG preview whenever source image or zoom changes
  useEffect(() => {
    if (!rawSelectedImg) {
      setPreviewCropped(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const size = 256;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const minSide = Math.min(img.width, img.height);
      const cropSide = minSide / cropZoom;
      const sx = (img.width - cropSide) / 2;
      const sy = (img.height - cropSide) / 2;
      ctx.drawImage(img, sx, sy, cropSide, cropSide, 0, 0, size, size);
      setPreviewCropped(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = rawSelectedImg;
  }, [rawSelectedImg, cropZoom]);

  if (!user) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-4 pt-28 bg-proz-midnight text-proz-white">
        <div className="w-16 h-16 rounded-full bg-proz-elevated border border-proz-border flex items-center justify-center text-proz-grey">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-proz-white">Sign In Required</h2>
        <p className="text-xs text-proz-grey max-w-sm">
          Please sign in to access your profile preferences and saved content.
        </p>
        <Link href="/auth/login" className="px-6 py-2.5 rounded-full glass-button-primary text-xs font-bold transition">
          Sign In
        </Link>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaveError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setSaveError('Unsupported image format. Please choose JPG, PNG, or WebP.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setSaveError('Image exceeds 5 MB limit. Please select a smaller photograph.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCropZoom(1);
        setRawSelectedImg(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCroppedPhoto = () => {
    if (!previewCropped) return;
    setAvatarUrl(previewCropped);
    updateProfile({ avatarUrl: previewCropped });
    setRawSelectedImg(null);
    setPreviewCropped(null);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleRemovePhoto = () => {
    setRawSelectedImg(null);
    setPreviewCropped(null);
    setAvatarUrl('');
    updateProfile({ avatarUrl: '' });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSaveError('Name cannot be empty.');
      return;
    }
    setSaveError('');
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      avatarUrl: previewCropped || avatarUrl.trim(),
    });
    setRawSelectedImg(null);
    setPreviewCropped(null);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const activeDisplayAvatar = previewCropped || avatarUrl;

  return (
    <div className="min-h-screen bg-proz-midnight text-proz-white pt-10 sm:pt-14 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Title Banner */}
        <div className="border-b border-proz-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-proz-white tracking-tight flex items-center gap-3">
              <User className="w-7 h-7 text-proz-cyan" />
              <span>User Profile</span>
            </h1>
            <p className="text-xs sm:text-sm text-proz-grey mt-1">
              Upload, crop &amp; save your profile photograph and manage account details.
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column Profile Card & Photo Uploader */}
          <div className="p-6 rounded-3xl cinema-card text-center space-y-4 h-fit">
            <div className="relative w-28 h-28 mx-auto">
              {activeDisplayAvatar ? (
                <img
                  src={activeDisplayAvatar}
                  alt={name || user.name}
                  className="w-full h-full rounded-full object-cover ring-4 ring-proz-purple/50"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-proz-elevated border-2 border-proz-border flex items-center justify-center text-proz-grey">
                  <User className="w-10 h-10" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-proz-purple text-white keep-white ring-2 ring-proz-midnight hover:scale-105 transition"
                title="Upload or Replace Photo"
                aria-label="Upload or Replace Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-proz-elevated hover:bg-proz-purple/20 border border-proz-border text-xs font-semibold text-proz-white flex items-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5 text-proz-cyan" />
                <span>{avatarUrl ? 'Replace Photo' : 'Upload Photo'}</span>
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-400 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {/* Crop & Resize Preview */}
            {previewCropped && (
              <div className="p-3 rounded-2xl bg-proz-elevated/80 border border-proz-purple/40 space-y-2.5 text-left">
                <div className="flex items-center justify-between text-[11px] font-bold text-proz-purple">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5" /> Crop &amp; Resize (256×256)
                  </span>
                  <span>{cropZoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={2}
                  step={0.1}
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleApplyCroppedPhoto}
                    className="flex-1 py-1.5 rounded-lg glass-button-primary text-xs font-bold"
                  >
                    Save Cropped Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRawSelectedImg(null);
                      setPreviewCropped(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-proz-navy border border-proz-border text-xs text-proz-grey"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-base font-bold text-proz-white">{name || user.name}</h3>
              <p className="text-xs text-proz-grey">{email || user.email}</p>
            </div>

            <div className="p-3 rounded-2xl bg-proz-elevated/60 border border-proz-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-proz-grey">Membership Tier</span>
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-proz-cyan">
                <Crown className="w-4 h-4 fill-current" />
                <span>
                  {user.subscription?.planId ? user.subscription.planId.replace('plan_', '').toUpperCase() + ' VIP' : 'FREE'}
                </span>
              </div>
              <p className="text-[11px] text-proz-cyan">{user.subscription?.videoQuality || '1080p FHD'}</p>
            </div>

            <div className="pt-2">
              <Link
                href="/subscription"
                className="block w-full py-2.5 rounded-xl glass-button-primary text-xs font-bold shadow-purple-glow transition text-center"
              >
                Manage Subscription
              </Link>
            </div>
          </div>

          {/* Right Columns: Edit Form & Quick Links */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl cinema-card space-y-5">
              <h3 className="text-base font-bold text-proz-white">Edit Profile Details</h3>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-proz-grey">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-proz-grey">Email Address / Phone</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email or phone"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-proz-grey">Avatar Image URL (Optional)</label>
                  <input
                    type="url"
                    value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder={avatarUrl.startsWith('data:') ? 'Using uploaded cropped photo' : 'https://images.example.com/avatar.jpg'}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                {saveError && <p className="text-xs text-rose-400 font-semibold">{saveError}</p>}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl glass-button-primary text-xs font-bold shadow-purple-glow transition"
                  >
                    Save Changes
                  </button>
                  {isSaved && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Profile saved &amp; persisted!
                    </span>
                  )}
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/account/devices"
                className="p-4 rounded-3xl cinema-card hover:border-proz-cyan/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-proz-cyan/15 border border-proz-cyan/30 text-proz-cyan">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-proz-white">Devices</h4>
                    <p className="text-[11px] text-proz-grey">Sessions</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-proz-grey group-hover:text-proz-cyan" />
              </Link>

              <Link
                href="/settings"
                className="p-4 rounded-3xl cinema-card hover:border-proz-purple/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-proz-purple/15 border border-proz-purple/30 text-proz-purple">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-proz-white">Settings</h4>
                    <p className="text-[11px] text-proz-grey">Theme &amp; Health</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-proz-grey group-hover:text-proz-purple" />
              </Link>

              <Link
                href="/restricted"
                className="p-4 rounded-3xl cinema-card hover:border-rose-500/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-2xl border ${
                      user.is18PlusVerified
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-proz-white">18+ Zone</h4>
                    <p className="text-[11px] text-proz-grey">
                      {user.is18PlusVerified ? 'Verified' : 'Age Locked'}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-proz-grey group-hover:text-rose-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
