"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Film,
  Import,
  Server,
  Shield,
  Users,
  BarChart2,
  Settings,
  Menu,
  X,
  Lock,
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  RefreshCw,
  Eye,
  Home,
  TrendingUp,
  DollarSign,
  Activity,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Zap,
  Tv,
} from 'lucide-react';
import { brandConfig } from '@/config/brand.config';
import { getAllChannels } from '@/lib/data/channelsData';
import { Channel } from '@/types/channel';

// ─── Types ───────────────────────────────────────────────────────────────────

type AdminSection =
  | 'dashboard'
  | 'content'
  | 'channels'
  | 'imports'
  | 'providers'
  | 'licenses'
  | 'users'
  | 'analytics'
  | 'settings';

interface StatsData {
  totalContent: number;
  activeUsers: number;
  activeSubscriptions: number;
  totalEpisodes: number;
  pendingImports: number;
  revenue: number;
}

interface ContentItem {
  id: string;
  title: string;
  type: string;
  category: string;
  status: 'published' | 'draft';
  release_year: number;
  created_at: string;
}

interface ImportJob {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'failed';
  created_at: string;
  provider_id?: string;
}

interface Provider {
  id: string;
  name: string;
  type: string;
  base_url: string;
  is_active: boolean;
  last_sync_at?: string;
  sync_status?: string;
  error_count?: number;
}

interface License {
  id: string;
  content_title: string;
  rights_holder: string;
  expiry_date: string;
  territories: string[];
  is_active: boolean;
  streaming_permitted: boolean;
  licence_ref: string;
}

// ─── Glass Input style ───────────────────────────────────────────────────────
const glassInput =
  'w-full px-4 py-2.5 bg-[#080B12]/60 border border-[#334155]/60 rounded-xl text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6]/60 focus:ring-1 focus:ring-[#8B5CF6]/30';

const glassSelect =
  'w-full px-4 py-2.5 bg-[#080B12]/80 border border-[#334155]/60 rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]/60 focus:ring-1 focus:ring-[#8B5CF6]/30';

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: AdminSection; label: string; Icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'content', label: 'Content', Icon: Film },
  { id: 'channels', label: 'Channels', Icon: Tv },
  { id: 'imports', label: 'Import Jobs', Icon: Import },
  { id: 'providers', label: 'Providers', Icon: Server },
  { id: 'licenses', label: 'Licenses', Icon: Shield },
  { id: 'users', label: 'Users', Icon: Users },
  { id: 'analytics', label: 'Analytics', Icon: BarChart2 },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string; Icon: React.ElementType }> = {
    published:  { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', label: 'Published', Icon: CheckCircle2 },
    draft:      { cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30',      label: 'Draft',     Icon: Clock },
    pending:    { cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',   label: 'Pending',   Icon: Clock },
    processing: { cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30',         label: 'Processing',Icon: RefreshCw },
    approved:   { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',label: 'Approved',  Icon: CheckCircle2 },
    rejected:   { cls: 'bg-red-500/15 text-red-400 border-red-500/30',            label: 'Rejected',  Icon: XCircle },
    failed:     { cls: 'bg-red-500/15 text-red-400 border-red-500/30',            label: 'Failed',    Icon: XCircle },
    active:     { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',label: 'Active',    Icon: CheckCircle2 },
    inactive:   { cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30',      label: 'Inactive',  Icon: XCircle },
  };
  const cfg = map[status] ?? map.draft;
  const { cls, label, Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${cls}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_STATS: StatsData = {
  totalContent: 248,
  activeUsers: 41280,
  activeSubscriptions: 38200,
  totalEpisodes: 3842,
  pendingImports: 7,
  revenue: 482910,
};

const MOCK_CONTENT: ContentItem[] = [
  { id: 'c-001', title: 'Cyber Horizon 2099', type: 'movie', category: 'hollywood', status: 'published', release_year: 2024, created_at: '2026-10-01' },
  { id: 'c-002', title: 'Sakura Protocol', type: 'anime', category: 'anime_series', status: 'published', release_year: 2025, created_at: '2026-10-10' },
  { id: 'c-003', title: 'Dark Neon', type: 'series', category: 'k_drama', status: 'draft', release_year: 2026, created_at: '2026-11-01' },
  { id: 'c-004', title: 'Mithila Chronicles', type: 'movie', category: 'bollywood', status: 'published', release_year: 2025, created_at: '2026-09-15' },
  { id: 'c-005', title: 'Ghost Protocol S2', type: 'series', category: 'hollywood', status: 'draft', release_year: 2026, created_at: '2026-11-05' },
];

const MOCK_IMPORTS: ImportJob[] = [
  { id: 'imp-001', title: 'Dune: Part Three', status: 'pending', created_at: '2026-11-13T12:00:00Z' },
  { id: 'imp-002', title: 'Jujutsu Kaisen S4', status: 'approved', created_at: '2026-11-12T09:30:00Z' },
  { id: 'imp-003', title: 'Dark Web Chronicles', status: 'failed', created_at: '2026-11-11T18:00:00Z' },
  { id: 'imp-004', title: 'The Void', status: 'pending', created_at: '2026-11-13T15:00:00Z' },
];

const MOCK_PROVIDERS: Provider[] = [
  { id: 'prov-001', name: 'TMDB Official', type: 'tmdb', base_url: 'https://api.themoviedb.org/3', is_active: true, last_sync_at: '2026-11-13T10:00:00Z', sync_status: 'idle', error_count: 0 },
  { id: 'prov-002', name: 'Manual Studio Feed', type: 'manual', base_url: 'https://studio.prozmovie.com', is_active: true, last_sync_at: '2026-11-12T08:00:00Z', sync_status: 'idle', error_count: 2 },
  { id: 'prov-003', name: 'Anime DB', type: 'anime_db', base_url: 'https://api.anilist.co', is_active: false, sync_status: 'error', error_count: 12 },
];

const MOCK_LICENSES: License[] = [
  { id: 'lic-001', content_title: 'Cyber Horizon 2099', rights_holder: 'Universal Studios', expiry_date: '2027-06-30', territories: ['IN', 'US', 'GB'], is_active: true, streaming_permitted: true, licence_ref: 'LIC-UNI-001' },
  { id: 'lic-002', content_title: 'Sakura Protocol', rights_holder: 'Toho Animation', expiry_date: '2026-12-15', territories: ['*'], is_active: true, streaming_permitted: true, licence_ref: 'LIC-TOH-002' },
  { id: 'lic-003', content_title: 'Mithila Chronicles', rights_holder: 'Yash Raj Films', expiry_date: '2026-11-25', territories: ['IN'], is_active: true, streaming_permitted: true, licence_ref: 'LIC-YRF-003' },
  { id: 'lic-004', content_title: 'Ghost Protocol S2', rights_holder: 'Paramount+', expiry_date: '2025-08-01', territories: ['US'], is_active: false, streaming_permitted: false, licence_ref: 'LIC-PAR-004' },
];

// ─── AddContentModal ───────────────────────────────────────────────────────────
function AddContentModal({ onClose, onSave }: { onClose: () => void; onSave: (item: ContentItem) => void }) {
  const [form, setForm] = useState({
    title: '', original_title: '', type: 'movie', category: 'hollywood',
    description: '', release_year: 2025, runtime: 90, language: 'en',
    age_rating: 'PG-13', is_adult: false, is_featured: false,
    poster_url: '', backdrop_url: '', tags: '',
  });
  const [loading, setLoading] = useState(false);

  const categoryOptions: Record<string, string[]> = {
    movie: ['hollywood', 'bollywood', 'south_indian', 'bengali', 'international', 'documentary', 'animation', 'family', 'kids'],
    series: ['hollywood', 'bollywood', 'south_indian', 'bengali', 'international'],
    anime: ['anime_series', 'anime_movie'],
    drama: ['k_drama', 'c_drama', 'j_drama', 'thai_drama', 'short_drama'],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      onSave(data.content ?? {
        id: `c-${Date.now()}`, title: form.title, type: form.type,
        category: form.category, status: 'draft', release_year: form.release_year, created_at: new Date().toISOString(),
      });
    } catch {
      // fallback mock save
      onSave({
        id: `c-${Date.now()}`, title: form.title, type: form.type,
        category: form.category, status: 'draft', release_year: form.release_year, created_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B12]/80 backdrop-blur-xl">
      <div className="max-w-2xl w-full rounded-3xl bg-[#111827]/90 border border-[#334155]/60 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#334155]/40 bg-[#111827]/95 backdrop-blur-sm rounded-t-3xl">
          <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#8B5CF6]" /> Add Content
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#334155]/40 text-[#94A3B8] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[#94A3B8] font-medium text-xs">Title <span className="text-red-400">*</span></label>
              <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Cyber Horizon 2099" className={glassInput} />
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] font-medium text-xs">Original Title</label>
              <input value={form.original_title} onChange={e => set('original_title', e.target.value)} placeholder="Native / romanized title" className={glassInput} />
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] font-medium text-xs">Content Type</label>
              <select value={form.type} onChange={e => { set('type', e.target.value); set('category', (categoryOptions[e.target.value] ?? [])[0] ?? 'hollywood'); }} className={glassSelect}>
                {['movie', 'series', 'anime', 'drama'].map(t => <option key={t} value={t} className="bg-[#111827]">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] font-medium text-xs">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className={glassSelect}>
                {(categoryOptions[form.type] ?? []).map(c => <option key={c} value={c} className="bg-[#111827]">{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] font-medium text-xs">Language</label>
              <select value={form.language} onChange={e => set('language', e.target.value)} className={glassSelect}>
                {[['en','English'],['hi','Hindi'],['ko','Korean'],['ja','Japanese'],['zh','Chinese'],['ta','Tamil'],['te','Telugu'],['bn','Bengali']].map(([v, l]) =>
                  <option key={v} value={v} className="bg-[#111827]">{l}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[#94A3B8] font-medium text-xs">Description</label>
              <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Plot synopsis..." className={`${glassInput} resize-none`} />
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] font-medium text-xs">Release Year</label>
              <input type="number" min={1900} max={2030} value={form.release_year} onChange={e => set('release_year', Number(e.target.value))} className={glassInput} />
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] font-medium text-xs">Runtime (minutes)</label>
              <input type="number" min={1} value={form.runtime} onChange={e => set('runtime', Number(e.target.value))} className={glassInput} />
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] font-medium text-xs">Age Rating</label>
              <select value={form.age_rating} onChange={e => set('age_rating', e.target.value)} className={glassSelect}>
                {['G', 'PG', 'PG-13', 'R', 'TV-14', 'TV-MA', '18+'].map(r => <option key={r} value={r} className="bg-[#111827]">{r}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] font-medium text-xs">Tags (comma-separated)</label>
              <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="action, sci-fi, thriller" className={glassInput} />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[#94A3B8] font-medium text-xs">Poster URL</label>
              <input type="url" value={form.poster_url} onChange={e => set('poster_url', e.target.value)} placeholder="https://..." className={glassInput} />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[#94A3B8] font-medium text-xs">Backdrop URL</label>
              <input type="url" value={form.backdrop_url} onChange={e => set('backdrop_url', e.target.value)} placeholder="https://..." className={glassInput} />
            </div>
            <div className="sm:col-span-2 flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="w-4 h-4 accent-[#8B5CF6] rounded" />
                <span className="text-[#94A3B8] text-xs font-medium">Is Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_adult} onChange={e => set('is_adult', e.target.checked)} className="w-4 h-4 accent-red-500 rounded" />
                <span className="text-red-400 text-xs font-medium">18+ Adult Content ⚠️</span>
              </label>
            </div>
            {form.is_adult && (
              <div className="sm:col-span-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                ⚠️ This content is marked as adult-only. It will only be visible to age-verified users in permitted territories.
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#334155]/60 text-[#94A3B8] hover:text-white hover:border-[#334155] transition-colors text-sm font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold transition-colors disabled:opacity-50 text-sm">
              {loading ? 'Saving...' : 'Publish Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── ContentManager ────────────────────────────────────────────────────────────
function ContentManager() {
  const [items, setItems] = useState<ContentItem[]>(MOCK_CONTENT);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const PER_PAGE = 10;

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content');
      if (res.ok) { const d = await res.json(); setItems(d.content ?? MOCK_CONTENT); }
    } catch { /* use mock */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const filtered = items.filter(i =>
    (i.title.toLowerCase().includes(search.toLowerCase())) &&
    (typeFilter === 'all' || i.type === typeFilter) &&
    (catFilter === 'all' || i.category === catFilter)
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this content item?')) return;
    setItems(prev => prev.filter(i => i.id !== id));
    try { await fetch(`/api/admin/content/${id}`, { method: 'DELETE' }); } catch { /* noop */ }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search content..." className={`${glassInput} pl-10`} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-2.5 bg-[#080B12]/60 border border-[#334155]/60 rounded-xl text-[#F8FAFC] focus:outline-none text-sm">
          <option value="all" className="bg-[#111827]">All Types</option>
          {['movie', 'series', 'anime', 'drama'].map(t => <option key={t} value={t} className="bg-[#111827]">{t}</option>)}
        </select>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-sm transition-colors whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Content
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#111827]/60 border border-[#334155]/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]/40 bg-[#080B12]/40">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider hidden sm:table-cell">Year</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/20">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[#94A3B8] text-sm">Loading...</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[#94A3B8] text-sm">No content found.</td></tr>
              ) : paged.map(item => (
                <tr key={item.id} className="hover:bg-[#334155]/10 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-[#F8FAFC]">{item.title}</p>
                      <p className="text-[11px] text-[#94A3B8] font-mono">{item.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="capitalize px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 text-xs font-medium">{item.type}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-[#94A3B8] text-xs capitalize">{item.category.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 hidden sm:table-cell text-[#94A3B8] font-mono text-xs">{item.release_year}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/title/${item.id}`} className="p-1.5 rounded-lg bg-[#334155]/30 hover:bg-[#334155]/60 text-[#94A3B8] hover:text-[#22D3EE] transition-colors" title="View on site">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button className="p-1.5 rounded-lg bg-[#334155]/30 hover:bg-[#334155]/60 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors" title="Edit">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg bg-[#334155]/30 hover:bg-red-500/20 text-[#94A3B8] hover:text-red-400 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#334155]/40">
            <span className="text-xs text-[#94A3B8]">{filtered.length} items</span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg bg-[#334155]/30 disabled:opacity-40 hover:bg-[#334155]/60 text-[#94A3B8] transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-[#F8FAFC] font-medium">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg bg-[#334155]/30 disabled:opacity-40 hover:bg-[#334155]/60 text-[#94A3B8] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showAdd && <AddContentModal onClose={() => setShowAdd(false)} onSave={item => { setItems(p => [item, ...p]); setShowAdd(false); }} />}
    </div>
  );
}

// ─── ChannelManager ─────────────────────────────────────────────────────────────
function ChannelManager() {
  const [channels, setChannels] = useState<Channel[]>(() => getAllChannels());
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Indian OTT');
  const [formDesc, setFormDesc] = useState('');
  const [formSubs, setFormSubs] = useState('500K');
  const [formRating, setFormRating] = useState(4.8);
  const [formColor, setFormColor] = useState('#E11D48');

  const PER_PAGE = 12;

  const filtered = channels.filter((c) =>
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())) &&
    (catFilter === 'all' || c.category.toLowerCase() === catFilter.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to remove this channel?')) return;
    setChannels((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleFeatured = (id: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, featured: !c.featured } : c))
    );
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormCategory('Indian OTT');
    setFormDesc('');
    setFormSubs('250K');
    setFormRating(4.8);
    setFormColor('#E11D48');
    setShowAdd(true);
  };

  const handleOpenEdit = (channel: Channel) => {
    setEditingChannel(channel);
    setFormName(channel.name);
    setFormCategory(channel.category);
    setFormDesc(channel.description);
    setFormSubs(channel.subscribers || '250K');
    setFormRating(channel.rating || 4.8);
    setFormColor(channel.color || '#E11D48');
  };

  const handleSaveChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingChannel) {
      setChannels((prev) =>
        prev.map((c) =>
          c.id === editingChannel.id
            ? {
                ...c,
                name: formName,
                category: formCategory,
                description: formDesc,
                subscribers: formSubs,
                rating: Number(formRating),
                color: formColor,
              }
            : c
        )
      );
      setEditingChannel(null);
    } else {
      const slug = formName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const newChan: Channel = {
        id: slug,
        name: formName,
        slug: slug,
        category: formCategory,
        description: formDesc || `Official channel for ${formName}.`,
        logo: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=200&auto=format&fit=crop&q=60',
        contentCount: 25,
        subscribers: formSubs,
        rating: Number(formRating),
        color: formColor,
        featured: false,
      };
      setChannels((prev) => [newChan, ...prev]);
      setShowAdd(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search channels..."
            className={`${glassInput} pl-10`}
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => {
            setCatFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 bg-[#080B12]/60 border border-[#334155]/60 rounded-xl text-[#F8FAFC] focus:outline-none text-sm"
        >
          <option value="all" className="bg-[#111827]">
            All Categories ({channels.length})
          </option>
          {[
            'Indian OTT',
            'Web Series',
            '18+ Exclusive',
            'Regional',
            'Drama',
            'Comedy',
            'International',
          ].map((c) => (
            <option key={c} value={c} className="bg-[#111827]">
              {c}
            </option>
          ))}
        </select>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm transition-colors whitespace-nowrap shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Channel
        </button>
      </div>

      {/* Stats Counter */}
      <div className="flex items-center justify-between text-xs text-[#94A3B8] px-1">
        <span>
          Showing {paged.length} of {filtered.length} channels
        </span>
        <span>Directory Total: {channels.length} studios</span>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {paged.map((channel) => {
          const initials = channel.name
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();

          return (
            <div
              key={channel.id}
              className="p-4 rounded-xl bg-[#111827]/60 border border-[#334155]/40 hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                {/* Circular Avatar Preview */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-zinc-700 shadow-md"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${
                      channel.color || '#991B1B'
                    }ee, #0B0E14 85%)`,
                  }}
                >
                  <span className="font-extrabold text-white text-xs drop-shadow">
                    {initials}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-[#F8FAFC] truncate">
                      {channel.name}
                    </h4>
                    {channel.featured && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                        FEATURED
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-rose-400 font-medium">
                    {channel.category}
                  </span>
                  <p className="text-xs text-[#94A3B8] line-clamp-1 mt-0.5">
                    {channel.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#334155]/40 text-xs text-[#94A3B8]">
                <span>{channel.subscribers || '1.2M'} subs</span>
                <span>{channel.contentCount} titles</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFeatured(channel.id)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      channel.featured
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-[#334155]/30 text-zinc-400 border-transparent hover:text-white'
                    }`}
                    title="Toggle featured"
                  >
                    ★
                  </button>
                  <button
                    onClick={() => handleOpenEdit(channel)}
                    className="p-1.5 rounded-lg bg-[#334155]/30 hover:bg-[#334155]/60 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                    title="Edit Channel"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(channel.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Delete Channel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-[#94A3B8]">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg bg-[#334155]/30 disabled:opacity-40 hover:bg-[#334155]/60 text-[#94A3B8] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#F8FAFC] font-medium">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg bg-[#334155]/30 disabled:opacity-40 hover:bg-[#334155]/60 text-[#94A3B8] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Channel Modal */}
      {(showAdd || editingChannel) && (
        <div className="fixed inset-0 z-50 bg-[#080B12]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-[#334155]/60 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#334155]/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tv className="w-4 h-4 text-rose-500" />
                {editingChannel ? 'Edit Channel' : 'Add New Channel'}
              </h3>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setEditingChannel(null);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveChannel} className="space-y-3 text-xs">
              <div>
                <label className="text-[#94A3B8] block mb-1 font-semibold">
                  Channel Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Star Movies, Red Prime"
                  className={glassInput}
                />
              </div>

              <div>
                <label className="text-[#94A3B8] block mb-1 font-semibold">
                  Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className={glassSelect}
                >
                  {[
                    'Indian OTT',
                    'Web Series',
                    '18+ Exclusive',
                    'Regional',
                    'Drama',
                    'Comedy',
                    'International',
                  ].map((cat) => (
                    <option key={cat} value={cat} className="bg-[#111827]">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#94A3B8] block mb-1 font-semibold">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Channel description..."
                  className={glassInput}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94A3B8] block mb-1 font-semibold">
                    Subscribers
                  </label>
                  <input
                    type="text"
                    value={formSubs}
                    onChange={(e) => setFormSubs(e.target.value)}
                    placeholder="e.g. 1.2M"
                    className={glassInput}
                  />
                </div>
                <div>
                  <label className="text-[#94A3B8] block mb-1 font-semibold">
                    Rating (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={formRating}
                    onChange={(e) => setFormRating(Number(e.target.value))}
                    className={glassInput}
                  />
                </div>
              </div>

              <div>
                <label className="text-[#94A3B8] block mb-1 font-semibold">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-10 h-8 rounded bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-zinc-300">{formColor}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#334155]/40 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    setEditingChannel(null);
                  }}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md"
                >
                  {editingChannel ? 'Save Changes' : 'Create Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ImportManager ─────────────────────────────────────────────────────────────
function ImportManager() {
  const [jobs, setJobs] = useState<ImportJob[]>(MOCK_IMPORTS);
  const [providers, setProviders] = useState<Provider[]>(MOCK_PROVIDERS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ provider_id: '', external_id: '', title: '', raw_data: '' });

  useEffect(() => {
    fetch('/api/admin/import').then(r => r.ok ? r.json() : null).then(d => { if (d?.jobs) setJobs(d.jobs); }).catch(() => {});
    fetch('/api/admin/providers').then(r => r.ok ? r.json() : null).then(d => { if (d?.providers) setProviders(d.providers); }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await res.json();
      setJobs(p => [d.job ?? { id: `imp-${Date.now()}`, title: form.title || form.external_id, status: 'pending', created_at: new Date().toISOString() }, ...p]);
    } catch {
      setJobs(p => [{ id: `imp-${Date.now()}`, title: form.title || form.external_id, status: 'pending', created_at: new Date().toISOString() }, ...p]);
    }
    setShowForm(false);
    setForm({ provider_id: '', external_id: '', title: '', raw_data: '' });
  };

  const handleReview = async (id: string, action: 'approved' | 'rejected') => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: action } : j));
    try { await fetch(`/api/admin/import/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: action }) }); } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-[#F8FAFC]">Import Jobs</h3>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-sm transition-colors">
          <Plus className="w-4 h-4" /> New Import Job
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-[#111827]/60 border border-[#334155]/40 space-y-3">
          <h4 className="font-semibold text-[#F8FAFC] text-sm">New Import Job</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[#94A3B8] text-xs font-medium">Provider</label>
              <select value={form.provider_id} onChange={e => setForm(f => ({ ...f, provider_id: e.target.value }))} className={glassSelect}>
                <option value="" className="bg-[#111827]">Select provider...</option>
                {providers.map(p => <option key={p.id} value={p.id} className="bg-[#111827]">{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] text-xs font-medium">Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Content title" className={glassInput} />
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] text-xs font-medium">External ID</label>
              <input value={form.external_id} onChange={e => setForm(f => ({ ...f, external_id: e.target.value }))} placeholder="TMDB ID, IMDB ID..." className={glassInput} />
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] text-xs font-medium">Raw Metadata (JSON)</label>
              <textarea rows={3} value={form.raw_data} onChange={e => setForm(f => ({ ...f, raw_data: e.target.value }))} placeholder='{"key": "value"}' className={`${glassInput} resize-none font-mono text-xs`} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-[#334155]/60 text-[#94A3B8] text-sm hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-sm transition-colors">Submit</button>
          </div>
        </form>
      )}

      <div className="rounded-2xl bg-[#111827]/60 border border-[#334155]/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]/40 bg-[#080B12]/40">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider hidden sm:table-cell">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/20">
              {jobs.map(job => (
                <tr key={job.id} className="hover:bg-[#334155]/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-[#94A3B8]">{job.id}</td>
                  <td className="px-4 py-3 text-[#F8FAFC] font-medium">{job.title}</td>
                  <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                  <td className="px-4 py-3 hidden sm:table-cell text-xs text-[#94A3B8]">{new Date(job.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {job.status === 'pending' && (
                        <>
                          <button onClick={() => handleReview(job.id, 'approved')} className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold transition-colors border border-emerald-500/30">Approve</button>
                          <button onClick={() => handleReview(job.id, 'rejected')} className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-semibold transition-colors border border-red-500/30">Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ProviderManager ───────────────────────────────────────────────────────────
function ProviderManager() {
  const [providers, setProviders] = useState<Provider[]>(MOCK_PROVIDERS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'tmdb', base_url: '', is_active: true });

  useEffect(() => {
    fetch('/api/admin/providers').then(r => r.ok ? r.json() : null).then(d => { if (d?.providers) setProviders(d.providers); }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/providers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await res.json();
      setProviders(p => [d.provider ?? { id: `prov-${Date.now()}`, ...form, error_count: 0, sync_status: 'idle' }, ...p]);
    } catch {
      setProviders(p => [{ id: `prov-${Date.now()}`, ...form, error_count: 0, sync_status: 'idle' }, ...p]);
    }
    setShowForm(false);
  };

  const toggleActive = (id: string) => setProviders(prev => prev.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-[#F8FAFC]">Metadata Providers</h3>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-sm transition-colors">
          <Plus className="w-4 h-4" /> Register Provider
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-[#111827]/60 border border-[#334155]/40 space-y-3">
          <h4 className="font-semibold text-[#F8FAFC] text-sm">Register New Provider</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[#94A3B8] text-xs font-medium">Name</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Provider name" className={glassInput} />
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] text-xs font-medium">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={glassSelect}>
                {['tmdb', 'manual', 'studio_feed', 'distributor', 'anime_db'].map(t => <option key={t} value={t} className="bg-[#111827]">{t}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[#94A3B8] text-xs font-medium">Base URL</label>
              <input type="url" value={form.base_url} onChange={e => setForm(f => ({ ...f, base_url: e.target.value }))} placeholder="https://api.example.com" className={glassInput} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-[#8B5CF6]" />
              <span className="text-[#94A3B8] text-xs font-medium">Active</span>
            </label>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-[#334155]/60 text-[#94A3B8] text-sm hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-sm transition-colors">Register</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map(prov => (
          <div key={prov.id} className="p-5 rounded-2xl bg-[#111827]/60 border border-[#334155]/40 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-[#F8FAFC]">{prov.name}</h4>
                <p className="text-xs text-[#94A3B8] mt-0.5 font-mono">{prov.base_url}</p>
              </div>
              <button onClick={() => toggleActive(prov.id)} className="text-[#94A3B8] hover:text-[#8B5CF6] transition-colors">
                {prov.is_active ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 text-[11px] font-medium">{prov.type}</span>
              <StatusBadge status={prov.is_active ? 'active' : 'inactive'} />
              {(prov.error_count ?? 0) > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[11px] font-medium">{prov.error_count} errors</span>
              )}
            </div>
            {prov.last_sync_at && (
              <p className="text-[11px] text-[#94A3B8]">Last sync: {new Date(prov.last_sync_at).toLocaleString()}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LicenseManager ───────────────────────────────────────────────────────────
function LicenseManager() {
  const [licenses, setLicenses] = useState<License[]>(MOCK_LICENSES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ content_title: '', rights_holder: '', licence_ref: '', start_date: '', expiry_date: '', territories: '', streaming_permitted: true });

  useEffect(() => {
    fetch('/api/admin/licenses').then(r => r.ok ? r.json() : null).then(d => { if (d?.licenses) setLicenses(d.licenses); }).catch(() => {});
  }, []);

  const today = new Date();
  const thirtyDays = new Date(today.getTime() + 30 * 86400000);

  const getExpireStatus = (lic: License) => {
    const exp = new Date(lic.expiry_date);
    if (exp < today) return 'expired';
    if (exp < thirtyDays) return 'expiring';
    return 'ok';
  };

  const expiring = licenses.filter(l => getExpireStatus(l) === 'expiring');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLic: License = {
      id: `lic-${Date.now()}`,
      content_title: form.content_title,
      rights_holder: form.rights_holder,
      licence_ref: form.licence_ref,
      expiry_date: form.expiry_date,
      territories: form.territories.split(',').map(s => s.trim()),
      is_active: true,
      streaming_permitted: form.streaming_permitted,
    };
    setLicenses(p => [newLic, ...p]);
    try { await fetch('/api/admin/licenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); } catch {}
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {expiring.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
          <p className="text-yellow-400 text-sm font-medium">
            {expiring.length} license{expiring.length > 1 ? 's' : ''} expiring within 30 days. Renew promptly to avoid interruption.
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-[#F8FAFC]">Content Licenses</h3>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-sm transition-colors">
          <Plus className="w-4 h-4" /> Add License
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-[#111827]/60 border border-[#334155]/40 space-y-3">
          <h4 className="font-semibold text-[#F8FAFC] text-sm">Add License</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[#94A3B8] text-xs font-medium">Content Title</label>
              <input required value={form.content_title} onChange={e => setForm(f => ({ ...f, content_title: e.target.value }))} className={glassInput} />
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] text-xs font-medium">Rights Holder</label>
              <input required value={form.rights_holder} onChange={e => setForm(f => ({ ...f, rights_holder: e.target.value }))} className={glassInput} />
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] text-xs font-medium">License Ref</label>
              <input value={form.licence_ref} onChange={e => setForm(f => ({ ...f, licence_ref: e.target.value }))} className={glassInput} />
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] text-xs font-medium">Territories (comma-sep)</label>
              <input value={form.territories} onChange={e => setForm(f => ({ ...f, territories: e.target.value }))} placeholder="IN, US, GB  or  *" className={glassInput} />
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] text-xs font-medium">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className={glassInput} />
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] text-xs font-medium">Expiry Date</label>
              <input type="date" required value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} className={glassInput} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.streaming_permitted} onChange={e => setForm(f => ({ ...f, streaming_permitted: e.target.checked }))} className="w-4 h-4 accent-[#8B5CF6]" />
              <span className="text-[#94A3B8] text-xs font-medium">Streaming Permitted</span>
            </label>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-[#334155]/60 text-[#94A3B8] text-sm hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-sm transition-colors">Add License</button>
          </div>
        </form>
      )}

      <div className="rounded-2xl bg-[#111827]/60 border border-[#334155]/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]/40 bg-[#080B12]/40">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Content</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider hidden md:table-cell">Rights Holder</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider hidden sm:table-cell">Territories</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/20">
              {licenses.map(lic => {
                const expStatus = getExpireStatus(lic);
                const rowCls = expStatus === 'expired' ? 'border-l-2 border-red-500 bg-red-500/5' : expStatus === 'expiring' ? 'border-l-2 border-yellow-500 bg-yellow-500/5' : '';
                return (
                  <tr key={lic.id} className={`hover:bg-[#334155]/10 transition-colors ${rowCls}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#F8FAFC]">{lic.content_title}</p>
                      <p className="text-[11px] text-[#94A3B8] font-mono">{lic.licence_ref}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-[#94A3B8] text-xs">{lic.rights_holder}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono ${expStatus === 'expired' ? 'text-red-400' : expStatus === 'expiring' ? 'text-yellow-400' : 'text-[#94A3B8]'}`}>
                          {lic.expiry_date}
                        </span>
                        {expStatus === 'expired' && <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">EXPIRED</span>}
                        {expStatus === 'expiring' && <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[10px] font-bold">SOON</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-[#94A3B8] font-mono">{lic.territories.join(', ')}</td>
                    <td className="px-4 py-3"><StatusBadge status={lic.is_active ? 'active' : 'inactive'} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── UserManager ──────────────────────────────────────────────────────────────
function UserManager() {
  const mockUsers = [
    { email: 'alex.proz@example.com', plan: 'PREMIUM', status: 'Active', joined: '2026-01-15' },
    { email: 'sophia.m@gmail.com', plan: 'STANDARD', status: 'Active', joined: '2026-03-22' },
    { email: 'park.jw@seoul.kr', plan: 'PREMIUM', status: 'Active', joined: '2026-05-10' },
    { email: 'liam.oc@dublin.ie', plan: 'BASIC', status: 'Active', joined: '2026-07-04' },
    { email: 'ananya.r@india.in', plan: 'FREE', status: 'Inactive', joined: '2026-09-18' },
  ];
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30">
        <p className="text-[#8B5CF6] text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Connect Supabase to view live user data. Showing mock structure below.
        </p>
      </div>
      <div className="rounded-2xl bg-[#111827]/60 border border-[#334155]/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]/40 bg-[#080B12]/40">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider hidden sm:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/20">
              {mockUsers.map((u, i) => (
                <tr key={i} className="hover:bg-[#334155]/10 transition-colors">
                  <td className="px-4 py-3 text-[#F8FAFC] font-medium">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 text-[11px] font-semibold">{u.plan}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={u.status.toLowerCase()} /></td>
                  <td className="px-4 py-3 hidden sm:table-cell text-xs text-[#94A3B8] font-mono">{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── AnalyticsDashboard ───────────────────────────────────────────────────────
function AnalyticsDashboard() {
  const playbackData = [65, 82, 55, 90, 75, 100, 88];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const topContent = [
    { title: 'Cyber Horizon 2099', pct: 92 },
    { title: 'Sakura Protocol', pct: 78 },
    { title: 'Mithila Chronicles', pct: 65 },
    { title: 'Dark Neon', pct: 54 },
    { title: 'Ghost Protocol S2', pct: 42 },
  ];
  const plans = [
    { name: 'PREMIUM', pct: 48, color: 'bg-[#8B5CF6]' },
    { name: 'STANDARD', pct: 29, color: 'bg-[#22D3EE]' },
    { name: 'BASIC', pct: 15, color: 'bg-emerald-500' },
    { name: 'FREE', pct: 8, color: 'bg-[#94A3B8]' },
  ];

  return (
    <div className="space-y-6">
      {/* Playback Activity */}
      <div className="p-5 rounded-2xl bg-[#111827]/60 border border-[#334155]/40 space-y-4">
        <h4 className="font-bold text-[#F8FAFC] text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-[#22D3EE]" /> Playback Activity — Last 7 Days</h4>
        <div className="flex items-end gap-2 h-32">
          {playbackData.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-lg bg-gradient-to-t from-[#8B5CF6] to-[#22D3EE] transition-all" style={{ height: `${v}%` }} />
              <span className="text-[10px] text-[#94A3B8]">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Content */}
      <div className="p-5 rounded-2xl bg-[#111827]/60 border border-[#334155]/40 space-y-4">
        <h4 className="font-bold text-[#F8FAFC] text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#8B5CF6]" /> Top Content</h4>
        <div className="space-y-3">
          {topContent.map((c, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#F8FAFC] font-medium">{c.title}</span>
                <span className="text-[#94A3B8]">{c.pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#334155]/40 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]" style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Breakdown */}
      <div className="p-5 rounded-2xl bg-[#111827]/60 border border-[#334155]/40 space-y-4">
        <h4 className="font-bold text-[#F8FAFC] text-sm flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400" /> Subscription Breakdown</h4>
        <div className="space-y-3">
          {plans.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-20 text-xs text-[#94A3B8] font-semibold">{p.name}</span>
              <div className="flex-1 h-3 rounded-full bg-[#334155]/40 overflow-hidden">
                <div className={`h-full rounded-full ${p.color} transition-all`} style={{ width: `${p.pct}%` }} />
              </div>
              <span className="w-10 text-xs text-[#F8FAFC] text-right font-mono">{p.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DashboardOverview ─────────────────────────────────────────────────────────
function DashboardOverview({ onNavigate }: { onNavigate: (s: AdminSection) => void }) {
  const [stats, setStats] = useState<StatsData>(MOCK_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.ok ? res.json() : null)
      .then(d => {
        if (d) {
          setStats(prev => ({
            ...prev,
            ...d,
            ...(d.stats || {}),
            totalContent: d.totalContent ?? prev.totalContent,
            activeUsers: d.activeUsers ?? prev.activeUsers,
            activeSubscriptions: d.activeSubscriptions ?? prev.activeSubscriptions,
            totalEpisodes: d.totalEpisodes ?? prev.totalEpisodes,
            pendingImports: d.pendingImports ?? prev.pendingImports,
            revenue: d.revenue ?? prev.revenue,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Content', value: stats.totalContent.toLocaleString(), icon: Film, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/20' },
    { label: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: Users, color: 'text-[#22D3EE]', bg: 'bg-[#22D3EE]/10', border: 'border-[#22D3EE]/20' },
    { label: 'Subscriptions', value: stats.activeSubscriptions.toLocaleString(), icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Total Episodes', value: stats.totalEpisodes.toLocaleString(), icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { label: 'Pending Imports', value: stats.pendingImports.toString(), icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', badge: stats.pendingImports > 0, section: 'imports' as AdminSection },
    { label: 'Revenue', value: `$${(stats.revenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            onClick={() => card.section && onNavigate(card.section)}
            className={`p-5 rounded-2xl bg-[#111827]/60 border ${card.border} space-y-3 ${card.section ? 'cursor-pointer hover:bg-[#111827]/80 transition-colors' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl ${card.bg} ${card.border} border flex items-center justify-center`}>
                <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
              </div>
              {card.badge && (
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold border border-yellow-500/30 animate-pulse">!</span>
              )}
            </div>
            <div>
              <p className={`text-2xl font-black ${loading ? 'opacity-30' : ''} text-[#F8FAFC]`}>{loading ? '...' : card.value}</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="p-5 rounded-2xl bg-[#111827]/60 border border-[#334155]/40 space-y-4">
        <h4 className="font-bold text-[#F8FAFC] text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#22D3EE]" /> Recent Activity
        </h4>
        <div className="space-y-2">
          {[
            { icon: Film, color: 'text-[#8B5CF6]', msg: 'New content "Sakura Protocol" published', time: '2 min ago' },
            { icon: Import, color: 'text-yellow-400', msg: '7 import jobs pending review', time: '15 min ago' },
            { icon: Shield, color: 'text-emerald-400', msg: 'License for "Mithila Chronicles" updated', time: '1h ago' },
            { icon: Users, color: 'text-[#22D3EE]', msg: '124 new users joined today', time: '3h ago' },
            { icon: AlertTriangle, color: 'text-yellow-400', msg: '"Sakura Protocol" license expiring in 32 days', time: '6h ago' },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-[#334155]/20 last:border-0">
              <div className="w-7 h-7 rounded-lg bg-[#334155]/30 flex items-center justify-center shrink-0">
                <a.icon className={`w-3.5 h-3.5 ${a.color}`} />
              </div>
              <p className="flex-1 text-xs text-[#94A3B8]">{a.msg}</p>
              <span className="text-[11px] text-[#334155] font-mono whitespace-nowrap">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<{ email: string; role: string } | null>(null);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setIsAuthenticated(true);
        setAdminUser(data.user);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Invalid administrator credentials');
        setLoginLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setAdminUser(data.user);
      setLoginLoading(false);
    } catch (err) {
      setLoginError('Authentication network error. Please try again.');
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  const sectionTitles: Record<AdminSection, string> = {
    dashboard: 'Dashboard',
    content: 'Content Management',
    channels: 'Channel Directory & Studio Management',
    imports: 'Import Jobs',
    providers: 'Metadata Providers',
    licenses: 'Licenses & Rights',
    users: 'Users',
    analytics: 'Analytics',
    settings: 'Settings',
  };

  const navigate = (s: AdminSection) => { setActiveSection(s); setSidebarOpen(false); };

  // Checking session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#080B12] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#334155]/40 border-t-[#22D3EE] animate-spin" />
        <p className="text-sm font-semibold text-[#94A3B8]">Validating administrator session...</p>
      </div>
    );
  }

  // Not authenticated: render Secure Admin Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080B12] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#8B5CF6]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#22D3EE]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#111827]/90 backdrop-blur-2xl border border-[#334155]/60 rounded-3xl p-8 shadow-[0_16px_48px_rgba(0,0,0,0.6)] relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#22D3EE] shadow-[0_0_24px_rgba(34,211,238,0.2)]">
              <Lock className="w-7 h-7 text-[#22D3EE]" />
            </div>
            <p className="text-xs uppercase font-extrabold tracking-widest text-[#8B5CF6] pt-2">
              PROZ MOVIE Console
            </p>
            <h1 className="text-2xl font-black text-[#F8FAFC]">
              Administrator Login
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Restricted management console. Sign in with your master credentials.
            </p>
          </div>

          {loginError && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94A3B8]">Administrator Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@prozmovie.com"
                className={glassInput}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94A3B8]">Admin Access Key / Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className={glassInput}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white text-sm font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_28px_rgba(34,211,238,0.5)] transition-all disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In to Console'}
            </button>
          </form>

          <div className="pt-4 border-t border-[#334155]/40 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" /> Return to PROZ MOVIE public site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B12] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-[#080B12]/80 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 z-30
        bg-[#080B12]/95 backdrop-blur-xl border-r border-[#334155]/40
        flex flex-col shrink-0
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-[#334155]/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#8B5CF6] font-bold uppercase tracking-widest">Admin Console</p>
              <h1 className="text-lg font-black text-[#F8FAFC] leading-tight">{brandConfig.name}</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-[#334155]/40 text-[#94A3B8]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  active
                    ? 'bg-[#8B5CF6]/20 text-[#F8FAFC] border border-[#8B5CF6]/40'
                    : 'text-[#94A3B8] hover:bg-[#334155]/30 hover:text-[#F8FAFC]'
                }`}
              >
                {active && <span className="absolute left-0 w-1 h-6 bg-[#8B5CF6] rounded-r-full" />}
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#8B5CF6]' : ''}`} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#334155]/40 space-y-2">
          {adminUser && (
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="text-[#94A3B8] truncate max-w-[130px] font-mono text-[11px]">{adminUser.email}</span>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 font-semibold text-[11px] hover:underline"
              >
                Sign Out
              </button>
            </div>
          )}
          <Link href="/" className="flex items-center gap-2 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
            <ArrowRight className="w-3.5 h-3.5" /> Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center gap-3 px-5 py-3.5 bg-[#080B12]/90 backdrop-blur-xl border-b border-[#334155]/40">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-[#334155]/40 text-[#94A3B8] hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-base font-bold text-[#F8FAFC]">{sectionTitles[activeSection]}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Section content */}
        <main className="flex-1 p-5 md:p-6">
          {activeSection === 'dashboard' && <DashboardOverview onNavigate={navigate} />}
          {activeSection === 'content' && <ContentManager />}
          {activeSection === 'channels' && <ChannelManager />}
          {activeSection === 'imports' && <ImportManager />}
          {activeSection === 'providers' && <ProviderManager />}
          {activeSection === 'licenses' && <LicenseManager />}
          {activeSection === 'users' && <UserManager />}
          {activeSection === 'analytics' && <AnalyticsDashboard />}
          {activeSection === 'settings' && (
            <div className="p-5 rounded-2xl bg-[#111827]/60 border border-[#334155]/40 text-center py-16">
              <Settings className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#F8FAFC]">Settings</h3>
              <p className="text-[#94A3B8] text-sm mt-1">Platform configuration coming soon.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
