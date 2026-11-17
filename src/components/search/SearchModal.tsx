"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, Star, Film, Tv, Play, ArrowRight } from 'lucide-react';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import { ContentItem } from '@/types/content';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ContentItem[]>([]);

  const TRENDING_TAGS = [
    "Cyberpunk", 
    "Seoul Protocol", 
    "Tears of Steel", 
    "Dragon Vanguard", 
    "K-Drama", 
    "Action", 
    "Anime"
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const filtered = MOCK_CONTENT.filter(item => {
      const titleMatch = item.title?.toLowerCase().includes(q);
      const synopsisMatch = (item.synopsis || item.description || '')?.toLowerCase().includes(q);
      const genresMatch = Array.isArray(item.genres) && item.genres.some(g => (typeof g === 'string' ? g : g.name)?.toLowerCase().includes(q));
      const castMatch = Array.isArray(item.cast) && item.cast.some(c => c.name?.toLowerCase().includes(q));
      return Boolean(titleMatch || synopsisMatch || genresMatch || castMatch);
    }).slice(0, 6);

    setResults(filtered);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-proz-midnight/80 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Backdrop Click */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Modal Container */}
      <div className="w-full max-w-2xl rounded-3xl glass-card border border-proz-border/60 shadow-glass-lg overflow-hidden flex flex-col">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-proz-border/50">
          <Search className="w-5 h-5 text-proz-cyan shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                onClose();
                router.push(`/search?q=${encodeURIComponent(query)}`);
              }
            }}
            placeholder="Search movies, series, anime, actors, genres..."
            className="w-full bg-transparent text-base text-proz-white placeholder-proz-grey focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-proz-grey hover:text-proz-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded-lg bg-proz-navy/70 border border-proz-border/50 text-proz-grey hover:text-proz-white transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 max-h-[60vh] overflow-y-auto no-scrollbar space-y-4">
          
          {/* Trending Pills */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-proz-grey mb-2.5">
              Trending Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1 rounded-full text-xs font-medium glass-pill text-proz-grey hover:text-proz-cyan hover:border-proz-cyan/40 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          {query.trim() && (
            <div className="space-y-2 pt-2 border-t border-proz-border/40">
              <div className="flex items-center justify-between text-xs text-proz-grey px-1">
                <span>Matching Titles ({results.length})</span>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="text-proz-cyan hover:underline flex items-center gap-1"
                >
                  See all results <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {results.length > 0 ? (
                results.map((item) => (
                  <Link
                    key={item.id}
                    href={`/title/${item.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-proz-navy/60 transition-colors group"
                  >
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-12 h-16 object-cover rounded-xl shrink-0 ring-1 ring-proz-border/50 group-hover:ring-proz-cyan/50"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-proz-white group-hover:text-proz-cyan transition-colors truncate">
                          {item.title}
                        </span>
                        {item.type === 'movie' ? (
                          <Film className="w-3.5 h-3.5 text-proz-grey shrink-0" />
                        ) : (
                          <Tv className="w-3.5 h-3.5 text-proz-purple shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-proz-grey line-clamp-1">{item.synopsis || item.description || ''}</p>
                      <div className="flex items-center gap-3 text-[11px] text-proz-grey mt-1">
                        <span>{item.releaseYear || item.release_year || ''}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {item.ratingScore || item.rating_avg || 'N/A'}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{(item.category || item.content_type || 'Movie').replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-full glass-button-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-3.5 h-3.5 text-proz-cyan fill-proz-cyan" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-proz-grey">No titles found for &quot;{query}&quot;</p>
                  <p className="text-xs text-proz-grey/60 mt-1">Try searching by genre, actor or category</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SearchModal;
