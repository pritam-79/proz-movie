"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Smartphone, Monitor, Tv, ArrowLeft, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ActiveDevice {
  id: string;
  name: string;
  type: 'browser' | 'mobile' | 'smart_tv';
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function DeviceManagementPage() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<ActiveDevice[]>([
    {
      id: "dev-01",
      name: "Chrome on Windows 11 (Current Session)",
      type: "browser",
      location: "San Jose, CA • 192.168.1.45",
      lastActive: "Active Now",
      isCurrent: true,
    },
    {
      id: "dev-02",
      name: "PROZ Mobile App (iPhone 16 Pro)",
      type: "mobile",
      location: "San Jose, CA • 5G Network",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
    {
      id: "dev-03",
      name: "Samsung OLED 4K (Living Room)",
      type: "smart_tv",
      location: "Home Wi-Fi",
      lastActive: "Yesterday at 9:40 PM",
      isCurrent: false,
    },
  ]);

  const [revokedId, setRevokedId] = useState<string | null>(null);

  const handleRevoke = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    setRevokedId(id);
    setTimeout(() => setRevokedId(null), 3000);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-proz-purple" />;
      case 'smart_tv':
        return <Tv className="w-5 h-5 text-amber-400" />;
      default:
        return <Monitor className="w-5 h-5 text-proz-cyan" />;
    }
  };

  const maxAllowedScreens = user?.subscription?.maxScreens || 4;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button & Title */}
      <div className="space-y-4">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs text-proz-grey hover:text-proz-cyan transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Account</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-proz-border/40 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-proz-white tracking-tight flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-proz-cyan" />
              <span>Registered Devices</span>
            </h1>
            <p className="text-xs sm:text-sm text-proz-grey mt-1">
              Manage authorized devices with streaming access to your subscription
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl glass-card border border-proz-border/50 text-right">
            <span className="text-[10px] uppercase font-bold text-proz-grey block">Simultaneous Screens</span>
            <span className="text-sm font-bold text-proz-cyan">
              {devices.length} of {maxAllowedScreens} In Use
            </span>
          </div>
        </div>
      </div>

      {revokedId && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Device session successfully revoked and signed out.</span>
        </div>
      )}

      {/* Device List */}
      <div className="space-y-3">
        {devices.map((device) => (
          <div
            key={device.id}
            className="p-5 rounded-2xl glass-card border border-proz-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-proz-navy/80 border border-proz-border/40 shrink-0">
                {getDeviceIcon(device.type)}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-proz-white">{device.name}</h4>
                  {device.isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-proz-cyan/20 text-proz-cyan border border-proz-cyan/30">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-proz-grey">{device.location}</p>
                <p className="text-[11px] text-proz-grey/80">Last stream: {device.lastActive}</p>
              </div>
            </div>

            {!device.isCurrent && (
              <button
                onClick={() => handleRevoke(device.id)}
                className="px-4 py-2 rounded-xl glass-button-secondary text-xs text-rose-400 hover:bg-rose-950/20 hover:border-rose-500/40 transition-all flex items-center gap-1.5 self-start sm:self-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Security Info */}
      <div className="p-6 rounded-3xl glass-card border border-proz-border/50 flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-proz-cyan shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-proz-white">Security & Screen Limiting</h4>
          <p className="text-xs text-proz-grey leading-relaxed">
            PROZ MOVIE monitors concurrent playback sessions in real time via signed HMAC tokens. If your account exceeds {maxAllowedScreens} simultaneous streams, older idle playback sessions are gracefully paused.
          </p>
        </div>
      </div>

    </div>
  );
}
