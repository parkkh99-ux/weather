import React, { useRef } from 'react';
import { Clock, Droplets, ChevronLeft, ChevronRight } from 'lucide-react';
import { HourlyItem } from '../types/weather';
import { formatHour, formatTemp } from '../utils/weatherUtils';
import { WeatherIcon } from './WeatherIcon';

interface HourlyForecastProps {
  hourly: HourlyItem[];
  unit: 'C' | 'F';
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly, unit }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = dir === 'left' ? -260 : 260;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/15">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-sky-300" />
          <h2 className="text-base sm:text-lg font-semibold text-white">
            시간대별 날씨 예보 (24시간)
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleScroll('left')}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
            aria-label="이전 시간"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
            aria-label="다음 시간"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Hourly Scroll List */}
      <div
        ref={scrollRef}
        className="mt-4 flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {hourly.map((item, idx) => {
          const isNow = idx === 0;
          return (
            <div
              key={item.time}
              className={`shrink-0 flex flex-col items-center justify-between py-3.5 px-3 rounded-2xl transition-all duration-200 snap-start min-w-[76px] ${
                isNow
                  ? 'bg-sky-500/25 border border-sky-400/40 shadow-lg ring-1 ring-sky-300/30'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              {/* Time Label */}
              <span className={`text-xs font-medium ${isNow ? 'text-sky-200 font-semibold' : 'text-white/70'}`}>
                {isNow ? '지금' : formatHour(item.time)}
              </span>

              {/* Weather Icon */}
              <div className="my-2 p-1.5 rounded-xl bg-white/5">
                <WeatherIcon icon={item.icon} size={24} />
              </div>

              {/* Temperature */}
              <span className="text-base font-semibold text-white tracking-tight">
                {formatTemp(item.temp, unit)}
              </span>

              {/* Precipitation Chance */}
              <div className="mt-2 flex items-center gap-0.5 text-[11px] font-medium">
                {item.precipitationProb > 0 ? (
                  <span className="text-sky-300 flex items-center gap-0.5">
                    <Droplets size={10} className="fill-sky-300" />
                    {item.precipitationProb}%
                  </span>
                ) : (
                  <span className="text-white/30">-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
