import React from 'react';
import { Star, MapPin, X } from 'lucide-react';
import { LocationItem } from '../types/weather';

interface FavoriteLocationsProps {
  favorites: LocationItem[];
  currentCity: string;
  onSelect: (loc: LocationItem) => void;
  onRemove: (name: string) => void;
}

export const FavoriteLocations: React.FC<FavoriteLocationsProps> = ({
  favorites,
  currentCity,
  onSelect,
  onRemove,
}) => {
  if (favorites.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
      <div className="flex items-center gap-1.5 text-xs text-amber-300/80 shrink-0 font-medium pl-1 pr-2">
        <Star size={13} className="fill-amber-400 text-amber-400" />
        <span>관심 지역:</span>
      </div>

      {favorites.map((fav) => {
        const isCurrent = fav.name === currentCity;
        return (
          <div
            key={fav.name}
            className={`group shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
              isCurrent
                ? 'bg-sky-400/25 border border-sky-300/50 text-white font-semibold shadow-sm'
                : 'bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white'
            }`}
          >
            <button
              onClick={() => onSelect(fav)}
              className="flex items-center gap-1 text-left cursor-pointer"
            >
              <MapPin size={12} className={isCurrent ? 'text-sky-300' : 'text-white/50'} />
              <span>{fav.name}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(fav.name);
              }}
              title="삭제"
              className="opacity-60 hover:opacity-100 text-white hover:text-rose-300 ml-1 transition-opacity cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
