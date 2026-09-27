/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  CloudSun,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { WeatherResponse, LocationItem } from './types/weather';
import { WeatherBackground } from './components/WeatherBackground';
import { SearchBar } from './components/SearchBar';
import { CurrentWeather } from './components/CurrentWeather';
import { AiBriefing } from './components/AiBriefing';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { AirQualityCard } from './components/AirQualityCard';
import { SunCycleCard } from './components/SunCycleCard';
import { WeatherMetrics } from './components/WeatherMetrics';
import { FavoriteLocations } from './components/FavoriteLocations';
import { ApiStatusModal } from './components/ApiStatusModal';

const DEFAULT_FAVORITES: LocationItem[] = [
  { name: '서울', country: '대한민국', lat: 37.5665, lon: 126.9780 },
  { name: '부산', country: '대한민국', lat: 35.1796, lon: 129.0756 },
  { name: '제주', country: '대한민국', lat: 33.4996, lon: 126.5312 },
  { name: '강릉', country: '대한민국', lat: 37.7519, lon: 128.8761 },
  { name: '도쿄', country: '일본', lat: 35.6762, lon: 139.6503 },
  { name: '뉴욕', country: '미국', lat: 40.7128, lon: -74.0060 },
];

export default function App() {
  const [currentLoc, setCurrentLoc] = useState<LocationItem>({
    name: '서울',
    country: '대한민국',
    lat: 37.5665,
    lon: 126.9780,
  });

  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);

  // Favorites state saved to localStorage
  const [favorites, setFavorites] = useState<LocationItem[]>(() => {
    try {
      const saved = localStorage.getItem('skycast_favorites');
      return saved ? JSON.parse(saved) : DEFAULT_FAVORITES;
    } catch {
      return DEFAULT_FAVORITES;
    }
  });

  const saveFavorites = (newFavs: LocationItem[]) => {
    setFavorites(newFavs);
    try {
      localStorage.setItem('skycast_favorites', JSON.stringify(newFavs));
    } catch (e) {
      console.error(e);
    }
  };

  const isFavorite = favorites.some((f) => f.name === currentLoc.name);

  const toggleFavorite = () => {
    if (isFavorite) {
      saveFavorites(favorites.filter((f) => f.name !== currentLoc.name));
    } else {
      saveFavorites([...favorites, currentLoc]);
    }
  };

  const removeFavorite = (name: string) => {
    saveFavorites(favorites.filter((f) => f.name !== name));
  };

  // Fetch weather data
  const loadWeather = useCallback(async (loc: LocationItem, refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const url = `/api/weather?lat=${loc.lat}&lon=${loc.lon}&city=${encodeURIComponent(loc.name)}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`기상 서버 응답 오류 (상태 코드 ${res.status})`);
      }
      const data: WeatherResponse = await res.json();
      setWeather(data);
    } catch (err: any) {
      console.error('Weather load error:', err);
      setError(err.message || '날씨 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(currentLoc);
  }, [currentLoc, loadWeather]);

  // GPS Geolocation handler
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저는 위치 정보 조회를 지원하지 않습니다.');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLoadingLocation(false);
        const newLoc: LocationItem = {
          name: '내 현재 위치',
          country: '대한민국',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setCurrentLoc(newLoc);
      },
      (err) => {
        setIsLoadingLocation(false);
        console.warn('Geolocation error:', err);
        // Fallback to Seoul
        setCurrentLoc({
          name: '서울',
          country: '대한민국',
          lat: 37.5665,
          lon: 126.9780,
        });
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col antialiased selection:bg-sky-400 selection:text-slate-950">
      {/* Dynamic atmospheric background */}
      {weather ? (
        <WeatherBackground
          condition={weather.current.condition}
          icon={weather.current.icon}
          isDay={weather.current.isDay}
        />
      ) : (
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-950" />
      )}

      {/* Main Top Navigation Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/30 border-b border-white/10 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <button
              onClick={() =>
                setCurrentLoc({
                  name: '서울',
                  country: '대한민국',
                  lat: 37.5665,
                  lon: 126.9780,
                })
              }
              className="flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <div className="p-2 rounded-2xl bg-sky-500/20 border border-sky-400/30 group-hover:scale-105 transition-transform">
                <CloudSun size={22} className="text-sky-300" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  SkyCast
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-300 bg-sky-500/20 px-1.5 py-0.5 rounded-md border border-sky-400/30">
                    Weather API
                  </span>
                </span>
                <span className="text-[11px] text-white/50 block">
                  실시간 고정밀 기상 정보망
                </span>
              </div>
            </button>

            {/* Mobile Controls */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="flex items-center p-1 rounded-xl bg-white/10 border border-white/15">
                <button
                  onClick={() => setUnit('C')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    unit === 'C'
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  °C
                </button>
                <button
                  onClick={() => setUnit('F')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    unit === 'F'
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  °F
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:flex-1 md:max-w-md">
            <SearchBar
              onSelectLocation={(loc) => setCurrentLoc(loc)}
              onCurrentLocationClick={handleCurrentLocation}
              isLoadingLocation={isLoadingLocation}
            />
          </div>

          {/* Desktop Right Controls: Unit switch & API status button */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center p-1 rounded-xl bg-white/10 border border-white/15">
              <button
                onClick={() => setUnit('C')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  unit === 'C'
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setUnit('F')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  unit === 'F'
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                °F
              </button>
            </div>

            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white/90 transition-all cursor-pointer"
              title="API 키 및 기상망 정보"
            >
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>API 시스템</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Favorites bar */}
        <FavoriteLocations
          favorites={favorites}
          currentCity={currentLoc.name}
          onSelect={(loc) => setCurrentLoc(loc)}
          onRemove={removeFavorite}
        />

        {/* Loading State */}
        {loading && !weather && (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-3 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
            <div className="text-center">
              <h3 className="text-base font-semibold text-white">
                {currentLoc.name}의 실시간 기상 데이터를 수신하고 있습니다...
              </h3>
              <p className="text-xs text-white/50 mt-1">
                기상 위성 레이더 및 고해상도 예보 모델 분석 중
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-3xl bg-rose-500/15 border border-rose-500/30 p-6 sm:p-8 text-center max-w-lg mx-auto">
            <div className="inline-flex p-3 rounded-2xl bg-rose-500/20 text-rose-300 mb-3">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">날씨 정보를 가져오지 못했습니다</h3>
            <p className="text-xs text-rose-200/80 mb-4">{error}</p>
            <button
              onClick={() => loadWeather(currentLoc)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold text-white transition-all cursor-pointer"
            >
              <RotateCw size={15} />
              <span>다시 시도</span>
            </button>
          </div>
        )}

        {/* Weather Dashboard */}
        {weather && (
          <div className="space-y-6">
            {/* Top Grid: Hero Current Weather + AI Weather & Outfit Stylist */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Hero Card */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <CurrentWeather
                  weather={weather}
                  unit={unit}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                  onRefresh={() => loadWeather(currentLoc, true)}
                  isRefreshing={isRefreshing}
                  onOpenStatusModal={() => setIsStatusModalOpen(true)}
                />
              </div>

              {/* Right: AI Smart Briefing */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <AiBriefing weather={weather} />
              </div>
            </div>

            {/* 24-Hour Forecast */}
            <HourlyForecast hourly={weather.hourly} unit={unit} />

            {/* 7-Day Forecast & Air Quality / Sunrise Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 7-Day Forecast */}
              <div className="lg:col-span-7">
                <DailyForecast daily={weather.daily} unit={unit} />
              </div>

              {/* Side Cards: Air Quality & Sun Cycle */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <AirQualityCard airQuality={weather.airQuality} />
                <SunCycleCard
                  sunrise={weather.current.sunrise}
                  sunset={weather.current.sunset}
                />
              </div>
            </div>

            {/* Detailed Meteorological Metrics Grid */}
            <div>
              <div className="flex items-center gap-2 mb-3.5">
                <Sparkles size={16} className="text-sky-300" />
                <h3 className="text-sm font-semibold text-white/90">
                  정밀 기상 지표 종합
                </h3>
              </div>
              <WeatherMetrics current={weather.current} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-6 px-4 text-center text-xs text-white/50 backdrop-blur-md bg-slate-950/20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white/60">
            <span>SkyCast Weather</span>
            <span aria-hidden="true">·</span>
            <span>고해상도 기상 예측 모델</span>
            <span aria-hidden="true">·</span>
            <span>Gemini AI 캐스터</span>
          </div>
          <div className="text-[11px] text-white/40">
            실시간 기상청(KMA), ECMWF, NOAA 및 OpenWeather 통합 기상 레이더 반영
          </div>
        </div>
      </footer>

      {/* API Status Modal */}
      {weather && (
        <ApiStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          weather={weather}
        />
      )}
    </div>
  );
}
