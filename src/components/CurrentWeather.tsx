import React from 'react';
import { Star, RefreshCw, ArrowUp, ArrowDown, ShieldCheck, Sparkles } from 'lucide-react';
import { WeatherResponse } from '../types/weather';
import { formatTemp, formatTempWithUnit } from '../utils/weatherUtils';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherProps {
  weather: WeatherResponse;
  unit: 'C' | 'F';
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenStatusModal: () => void;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  weather,
  unit,
  isFavorite,
  onToggleFavorite,
  onRefresh,
  isRefreshing,
  onOpenStatusModal,
}) => {
  const { current, city, provider, hasApiKey, timestamp } = weather;

  const updatedTimeStr = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 shadow-2xl text-white">
      {/* Top Header: City & Controls */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
              {city}
            </h1>
            <button
              onClick={onToggleFavorite}
              title={isFavorite ? '즐겨찾기에서 제거' : '즐겨찾기에 추가'}
              className="p-1.5 rounded-lg text-white/70 hover:text-amber-300 hover:bg-white/10 transition-all cursor-pointer"
            >
              <Star
                size={20}
                className={isFavorite ? 'fill-amber-400 text-amber-400' : 'text-white/70'}
              />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-white/70">
            <span>{updatedTimeStr} 기준</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
              <span>새로고침</span>
            </button>
          </div>
        </div>

        {/* API Provider Status Indicator */}
        <button
          onClick={onOpenStatusModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white/90 backdrop-blur-md transition-all cursor-pointer group"
          title="기상청 및 API 연동 현황 확인"
        >
          <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400' : 'bg-sky-400'} animate-pulse`} />
          <span className="font-medium group-hover:text-white">
            {hasApiKey ? 'OpenWeather API 연동' : '글로벌 기상 관측망'}
          </span>
          <ShieldCheck size={13} className="text-white/60 group-hover:text-white" />
        </button>
      </div>

      {/* Main Temperature & Visuals */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-baseline gap-4">
          <span className="text-6xl sm:text-8xl font-extralight tracking-tighter text-white drop-shadow-md">
            {formatTemp(current.temp, unit)}
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-lg sm:text-xl font-medium text-white/90">
              {current.condition}
            </span>
            <span className="text-xs sm:text-sm text-white/70">
              체감 {formatTempWithUnit(current.apparentTemp, unit)}
            </span>
          </div>
        </div>

        {/* Right side Icon & High/Low details */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
            <WeatherIcon icon={current.icon} isDay={current.isDay} size={48} />
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-white/80">
            <span className="flex items-center gap-0.5 text-rose-300">
              <ArrowUp size={14} />
              최고 {formatTemp(current.tempMax, unit)}
            </span>
            <span className="text-white/30">|</span>
            <span className="flex items-center gap-0.5 text-sky-300">
              <ArrowDown size={14} />
              최저 {formatTemp(current.tempMin, unit)}
            </span>
          </div>
        </div>
      </div>

      {/* Weather Brief Description Strip */}
      <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-white/80">
        <p className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-300 shrink-0" />
          <span>{current.description}</span>
        </p>
        <div className="flex items-center gap-3 text-white/70 text-xs">
          <span>습도 {current.humidity}%</span>
          <span>·</span>
          <span>바람 {current.windSpeed}m/s</span>
          <span>·</span>
          <span>강수량 {current.precipitation}mm</span>
        </div>
      </div>
    </div>
  );
};
