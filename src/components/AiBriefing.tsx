import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Shirt,
  Umbrella,
  Activity,
  SunMedium,
  HeartHandshake,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { AiBriefingData, WeatherResponse } from '../types/weather';

interface AiBriefingProps {
  weather: WeatherResponse;
}

export const AiBriefing: React.FC<AiBriefingProps> = ({ weather }) => {
  const [briefing, setBriefing] = useState<AiBriefingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBriefing = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: weather.city,
          temp: weather.current.temp,
          apparentTemp: weather.current.apparentTemp,
          condition: weather.current.condition,
          humidity: weather.current.humidity,
          windSpeed: weather.current.windSpeed,
          precipitationProb: weather.hourly[0]?.precipitationProb || 0,
          aqi: weather.airQuality.aqi,
          pm25: weather.airQuality.pm25,
        }),
      });

      if (!res.ok) throw new Error('AI 브리핑 응답 실패');
      const data = await res.json();
      setBriefing(data);
    } catch (err: any) {
      console.error(err);
      setError('AI 브리핑을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [weather.city, weather.current.temp, weather.current.condition]);

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-7 shadow-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/15">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-400/30 to-purple-500/30 border border-white/20">
            <Sparkles size={18} className="text-amber-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white">
              AI 스마트 기상 캐스터 & 코디
            </h2>
            <p className="text-xs text-white/60">
              {briefing?.source ? `${briefing.source} 기반 맞춤 가이드` : '실시간 기상 분석'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchBriefing}
          disabled={loading}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white/80 hover:text-white cursor-pointer disabled:opacity-50"
          title="AI 브리핑 새로 생성"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin text-amber-300" />
          ) : (
            <RefreshCw size={16} />
          )}
        </button>
      </div>

      {loading && !briefing ? (
        <div className="py-10 flex flex-col items-center justify-center gap-3">
          <Loader2 size={28} className="animate-spin text-amber-300" />
          <p className="text-sm text-white/70">
            기상 데이터를 종합 분석하여 맞춤 옷차림과 생활 팁을 계산하고 있습니다...
          </p>
        </div>
      ) : briefing ? (
        <div className="mt-4 space-y-4">
          {/* Main Headline */}
          <div className="p-3.5 rounded-2xl bg-amber-400/15 border border-amber-300/30 text-amber-100 text-sm font-medium leading-relaxed">
            💡 {briefing.headline}
          </div>

          {/* Grid Cards for Clothing & Umbrella */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Clothing Advice */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-300 shrink-0">
                <Shirt size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                  추천 옷차림 & 패션
                </h4>
                <p className="text-sm text-white/90 leading-snug">
                  {briefing.clothingAdvice}
                </p>
              </div>
            </div>

            {/* Umbrella Guide */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
                <Umbrella size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  우산 & 외출 준비
                </h4>
                <p className="text-sm text-white/90 leading-snug">
                  {briefing.umbrellaAdvice}
                </p>
              </div>
            </div>
          </div>

          {/* Indices & Health tips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Outdoor Activity */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-white/70 mb-1">
                <span className="flex items-center gap-1">
                  <Activity size={13} className="text-emerald-400" />
                  야외활동 지수
                </span>
                <span className="font-bold text-emerald-300">
                  {briefing.outdoorIndex}점
                </span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, briefing.outdoorIndex)}%` }}
                />
              </div>
              <p className="text-xs text-white/80 truncate">
                {briefing.outdoorComment}
              </p>
            </div>

            {/* Laundry Drying */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-white/70 mb-1">
                <span className="flex items-center gap-1">
                  <SunMedium size={13} className="text-amber-400" />
                  빨래 지수
                </span>
                <span className="font-bold text-amber-300">
                  {briefing.laundryIndex}점
                </span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, briefing.laundryIndex)}%` }}
                />
              </div>
              <p className="text-xs text-white/80 truncate">
                {briefing.laundryComment}
              </p>
            </div>

            {/* Health & Caution */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center gap-1 text-xs text-rose-300 mb-1">
                <HeartHandshake size={13} />
                <span>건강 & 생활 케어</span>
              </div>
              <p className="text-xs text-white/90 leading-tight">
                {briefing.healthTip}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-sm text-white/60">
          {error || '브리핑 정보를 불러올 수 없습니다.'}
        </div>
      )}
    </div>
  );
};
