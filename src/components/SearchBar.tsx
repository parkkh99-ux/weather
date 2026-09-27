import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X, Navigation } from 'lucide-react';
import { LocationItem } from '../types/weather';

interface SearchBarProps {
  onSelectLocation: (loc: LocationItem) => void;
  onCurrentLocationClick: () => void;
  isLoadingLocation: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectLocation,
  onCurrentLocationClick,
  isLoadingLocation,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search results debounced
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (loc: LocationItem) => {
    onSelectLocation(loc);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2.5 shadow-lg focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/20 transition-all">
        <Search size={18} className="text-white/60 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="도시 또는 지역 검색 (예: 서울, 제주, Busan, Tokyo)"
          className="w-full bg-transparent text-sm text-white placeholder-white/50 focus:outline-none"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}

        {isSearching ? (
          <Loader2 size={16} className="text-sky-300 animate-spin shrink-0" />
        ) : (
          <button
            onClick={onCurrentLocationClick}
            disabled={isLoadingLocation}
            title="현재 GPS 위치로 날씨 찾기"
            className="flex items-center gap-1.5 text-xs text-sky-200 hover:text-white bg-white/10 hover:bg-white/20 active:scale-95 px-2.5 py-1 rounded-lg border border-white/15 transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isLoadingLocation ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Navigation size={13} className="text-sky-300" />
            )}
            <span>내 위치</span>
          </button>
        )}
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl py-2 z-50 max-h-72 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase text-white/40">
            검색 결과
          </div>
          {results.map((loc, idx) => (
            <button
              key={`${loc.name}-${loc.lat}-${idx}`}
              onClick={() => handleSelect(loc)}
              className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center justify-between transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 truncate">
                <MapPin size={15} className="text-sky-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="text-sm font-medium text-white group-hover:text-sky-200 truncate">
                  {loc.name}
                </span>
                {loc.admin1 && (
                  <span className="text-xs text-white/50 truncate">
                    {loc.admin1}
                  </span>
                )}
              </div>
              <span className="text-xs text-white/40 shrink-0 ml-2">
                {loc.country}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
