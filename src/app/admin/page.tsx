"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Film, 
  Tv, 
  Users, 
  DollarSign, 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Search,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import { ContentItem } from '@/types/content';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'content' | 'licenses' | 'users' | 'audit'>('analytics');
  const [contentList, setContentList] = useState<ContentItem[]>(MOCK_CONTENT);
  const [searchFilter, setSearchFilter] = useState('');
  
  // New Movie Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('hollywood');
  const [newType, setNewType] = useState<'movie' | 'series'>('movie');
  const [newSynopsis, setNewSynopsis] = useState('');
  const [newYear, setNewYear] = useState(2025);
  const [newPosterUrl, setNewPosterUrl] = useState('');
  const [newStreamUrl, setNewStreamUrl] = useState('');
  const [is18Plus, setIs18Plus] = useState(false);

  // Guard: Admin role required
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-proz-white">Restricted Administrator Area</h2>
        <p className="text-xs text-proz-grey max-w-sm">
          You must be authenticated with an authorized administrator credential to access this management console.
        </p>
        <Link href="/auth/login" className="px-6 py-2.5 rounded-full glass-button-primary text-xs font-bold">
          Sign In as Administrator
        </Link>
      </div>
    );
  }

  const handleDeleteContent = (id: string) => {
    setContentList(prev => prev.filter(c => c.id !== id));
  };

  const handleCreateContent = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ContentItem = {
      id: `proz-adm-${Date.now()}`,
      title: newTitle,
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: newType,
      category: newCategory as any,
      synopsis: newSynopsis,
      releaseYear: Number(newYear),
      runtimeMinutes: 95,
      maturityRating: is18Plus ? '18+' : 'PG-13',
      genres: ['Action', 'Thriller'],
      languages: ['English', 'Hindi'],
      ratingScore: 9.0,
      ratingCount: 1,
      posterUrl: newPosterUrl || "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800",
      backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920",
      streamUrl: newStreamUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      isFeatured: false,
      isTrending: true,
      isOriginal: true,
      isRestricted18Plus: is18Plus,
      cast: [{ name: "Alex Star", character: "Lead" }],
      crew: [{ name: "Director John", role: "Director" }],
      subtitles: [{ id: "sub-1", label: "English", lang: "en", url: "/sub.vtt" }],
      audioTracks: [{ id: "aud-1", label: "English 5.1", lang: "en", codec: "AAC" }],
      license: {
        licensor: "PROZ Original Studios",
        expiryDate: "2035-12-31",
        territories: ["GLOBAL"]
      }
    };

    setContentList([created, ...contentList]);
    setShowAddModal(false);
    setNewTitle('');
    setNewSynopsis('');
  };

  const filteredCatalog = contentList.filter(c => 
    c.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-proz-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-proz-white tracking-tight">
              PROZ Master Admin Console
            </h1>
          </div>
          <p className="text-xs text-proz-grey mt-1">
            Real-time catalog distribution, digital rights licensing, and streaming analytics
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-card border border-proz-border/50 overflow-x-auto no-scrollbar">
          {[
            { id: 'analytics', label: 'Analytics' },
            { id: 'content', label: 'Catalog Manager' },
            { id: 'licenses', label: 'Rights & Licenses' },
            { id: 'users', label: 'Subscriptions' },
            { id: 'audit', label: 'Audit Logs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-proz-midnight font-bold shadow-sm'
                  : 'text-proz-grey hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: ANALYTICS OVERVIEW */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-3xl glass-card border border-proz-border/50 space-y-1">
              <div className="flex items-center justify-between text-proz-cyan">
                <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-proz-white">$482,910</p>
              <p className="text-[11px] text-emerald-400 font-medium">+18.4% this month</p>
            </div>

            <div className="p-5 rounded-3xl glass-card border border-proz-border/50 space-y-1">
              <div className="flex items-center justify-between text-proz-purple">
                <span className="text-xs font-bold uppercase tracking-wider">Subscribers</span>
                <Users className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-proz-white">41,280</p>
              <p className="text-[11px] text-emerald-400 font-medium">92.4% retention</p>
            </div>

            <div className="p-5 rounded-3xl glass-card border border-proz-border/50 space-y-1">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-xs font-bold uppercase tracking-wider">Movies & Shows</span>
                <Film className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-proz-white">{contentList.length}</p>
              <p className="text-[11px] text-proz-grey">Active licensed assets</p>
            </div>

            <div className="p-5 rounded-3xl glass-card border border-proz-border/50 space-y-1">
              <div className="flex items-center justify-between text-sky-400">
                <span className="text-xs font-bold uppercase tracking-wider">Streams / 24h</span>
                <Activity className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-proz-white">184,520</p>
              <p className="text-[11px] text-proz-cyan font-mono">0.02% buffer latency</p>
            </div>

          </div>

          {/* Real-time Streaming Activity Chart Card */}
          <div className="p-6 rounded-3xl glass-card border border-proz-border/50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-proz-white">
                Live Playback Performance & CDN Ingestion
              </h3>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold">
                Healthy • 99.98% Uptime
              </span>
            </div>

            <div className="h-44 w-full bg-proz-midnight/80 rounded-2xl border border-proz-border/30 p-4 flex items-end justify-between gap-2">
              {[40, 65, 82, 55, 90, 75, 100, 85, 95, 110, 80, 120].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-proz-purple to-proz-cyan transition-all duration-500 hover:brightness-125"
                    style={{ height: `${(val / 120) * 100}%` }}
                  />
                  <span className="text-[9px] text-proz-grey">{i + 1}h</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: CONTENT CATALOG MANAGER */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-proz-cyan absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search catalog titles..."
                className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full glass-button-primary text-xs font-bold shadow-cyan-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Content</span>
            </button>
          </div>

          {/* Content Table */}
          <div className="rounded-3xl glass-card border border-proz-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-proz-grey">
                <thead className="bg-proz-navy/70 border-b border-proz-border/40 text-[11px] font-bold uppercase text-proz-white tracking-wider">
                  <tr>
                    <th className="p-4">Title & Artwork</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Year</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-proz-border/30">
                  {filteredCatalog.map((item) => (
                    <tr key={item.id} className="hover:bg-proz-navy/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.posterUrl}
                            alt={item.title}
                            className="w-10 h-14 rounded-lg object-cover ring-1 ring-proz-border"
                          />
                          <div>
                            <span className="font-bold text-proz-white text-sm block">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-proz-cyan font-mono">
                              ID: {item.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize px-2 py-0.5 rounded glass-pill font-semibold">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-4 capitalize">
                        {item.category.replace('_', ' ')}
                      </td>
                      <td className="p-4 font-mono">{item.releaseYear}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-400">
                          ★ {item.ratingScore}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/title/${item.id}`}
                            className="p-1.5 rounded-lg glass-card hover:text-proz-cyan"
                            title="View Public Page"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteContent(item.id)}
                            className="p-1.5 rounded-lg glass-card text-rose-400 hover:bg-rose-950/30"
                            title="Delete Title"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: LICENSES & TERRITORIES */}
      {activeTab === 'licenses' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-proz-border/50 space-y-4">
            <h3 className="text-base font-bold text-proz-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-proz-cyan" />
              <span>Digital Distribution Contracts & Territorial Windows</span>
            </h3>

            <div className="space-y-3">
              {contentList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-proz-navy/70 border border-proz-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-sm text-proz-white">{item.title}</h4>
                    <p className="text-proz-grey mt-0.5">Licensor: {item.license.licensor}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-proz-grey">
                    <span className="px-2 py-1 rounded bg-proz-midnight border border-proz-border/40 text-proz-cyan font-mono">
                      Territories: {item.license.territories.join(', ')}
                    </span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Valid through {item.license.expiryDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: USERS & SUBSCRIPTIONS */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-proz-border/50 space-y-4">
            <h3 className="text-base font-bold text-proz-white flex items-center gap-2">
              <Users className="w-5 h-5 text-proz-purple" />
              <span>Subscriber Management & Gateway Health</span>
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { name: "Alex Vance", email: "alex.proz@example.com", plan: "PREMIUM VIP", date: "Renews Dec 2026", status: "Active" },
                { name: "Sophia Miller", email: "sophia.m@gmail.com", plan: "STANDARD", date: "Renews Nov 2026", status: "Active" },
                { name: "Jin Woo Park", email: "park.jw@seoul.kr", plan: "PREMIUM VIP", date: "Renews Jan 2027", status: "Active" },
                { name: "Liam O'Connor", email: "liam.oc@dublin.ie", plan: "BASIC", date: "Renews Dec 2026", status: "Active" },
              ].map((sub, i) => (
                <div key={i} className="p-4 rounded-2xl bg-proz-navy/70 border border-proz-border/40 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-proz-white">{sub.name}</h4>
                    <p className="text-proz-grey">{sub.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded font-bold bg-proz-purple/20 text-proz-cyan text-[11px]">
                      {sub.plan}
                    </span>
                    <span className="text-proz-grey hidden sm:inline">{sub.date}</span>
                    <span className="text-emerald-400 font-semibold">{sub.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-proz-border/50 space-y-4">
            <h3 className="text-base font-bold text-proz-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" />
              <span>Security, Playback Sessions & Compliance Audit Logs</span>
            </h3>

            <div className="space-y-2 text-xs font-mono text-proz-grey">
              {[
                `[${new Date().toISOString()}] PLAYBACK_TOKEN_ISSUED: User 'alex.proz' authorized for 'proz-mov-001' (Quality: 4K UHD)`,
                `[${new Date(Date.now() - 120000).toISOString()}] DRM_KEY_VALIDATED: Widevine Session verified via /api/playback/authorize`,
                `[${new Date(Date.now() - 360000).toISOString()}] PAYMENT_WEBHOOK_ACK: Stripe transaction tx_9921 succeeded for Plan PREMIUM`,
                `[${new Date(Date.now() - 720000).toISOString()}] 18_PLUS_GATEWAY: Age confirmation verified via DOB declaration`,
                `[${new Date(Date.now() - 1500000).toISOString()}] DEVICE_SYNCHRONIZED: New Chrome Windows 11 session registered`,
              ].map((log, i) => (
                <div key={i} className="p-3 rounded-xl bg-proz-midnight/80 border border-proz-border/30 text-proz-white/90">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-proz-midnight/80 backdrop-blur-xl animate-in fade-in">
          <div className="max-w-xl w-full p-6 sm:p-8 rounded-3xl glass-card border border-proz-border/60 shadow-glass-lg space-y-5 max-h-[85vh] overflow-y-auto no-scrollbar">
            
            <div className="flex items-center justify-between border-b border-proz-border/40 pb-3">
              <h3 className="text-lg font-bold text-proz-white">
                Add Licensed Content to Catalog
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-proz-grey hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContent} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-proz-grey">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Cyber Horizon 2099"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-proz-grey">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input bg-proz-navy text-white"
                  >
                    <option value="movie">Movie</option>
                    <option value="series">Series</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-proz-grey">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input bg-proz-navy text-white"
                  >
                    <option value="hollywood">Hollywood</option>
                    <option value="bollywood">Bollywood</option>
                    <option value="south_indian">South Indian</option>
                    <option value="bengali">Bengali</option>
                    <option value="international">International</option>
                    <option value="anime">Anime</option>
                    <option value="k_drama">K-Drama</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-proz-grey">Synopsis</label>
                <textarea
                  required
                  rows={3}
                  value={newSynopsis}
                  onChange={(e) => setNewSynopsis(e.target.value)}
                  placeholder="Enter synopsis..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-proz-grey">Release Year</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is18Plus"
                    checked={is18Plus}
                    onChange={(e) => setIs18Plus(e.target.checked)}
                    className="rounded accent-rose-500"
                  />
                  <label htmlFor="is18Plus" className="font-semibold text-rose-400">
                    18+ Restricted Adult
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-proz-grey">Poster Image URL</label>
                <input
                  type="url"
                  value={newPosterUrl}
                  onChange={(e) => setNewPosterUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-proz-grey">Master HLS / Video Stream URL</label>
                <input
                  type="url"
                  value={newStreamUrl}
                  onChange={(e) => setNewStreamUrl(e.target.value)}
                  placeholder="https://.../manifest.m3u8 or .mp4"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full glass-button-primary font-bold shadow-cyan-glow"
              >
                Publish to PROZ MOVIE Catalog
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
