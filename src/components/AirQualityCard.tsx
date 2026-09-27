import React from 'react';
import { Wind, ShieldAlert, Sparkles } from 'lucide-react';
import { AirQualityData } from '../types/weather';

interface AirQualityCardProps {
  airQuality: AirQualityData;
}

export const AirQualityCard: React.FC<AirQualityCardProps> = ({ airQuality }) => {
  const { aqi, grade, color, pm25, pm10, ozone } = airQuality;

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/15">
        <div className="flex items-center gap-2">
          <Wind size={18} className="text-emerald-300" />
          <h3 className="text-sm font-semibold text-white">대기질 및 미세먼지</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span>{grade}</span>
        </div>
      </div>

      <div className="mt-4">
        {/* Main AQI Score */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-light tracking-tight">{aqi}</span>
            <span className="text-xs text-white/50 ml-1.5 font-normal">AQI 지수</span>
          </div>
          <span className="text-xs text-white/70">
            {pm25 <= 15 ? '환기 및 외출 권장' : pm25 <= 35 ? '보통 수준의 대기' : '마스크 착용 권장'}
          </span>
        </div>

        {/* Multi-step progress bar */}
        <div className="mt-3 w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
          <div className="h-full bg-emerald-400 w-1/4" title="좋음 (0-50)" />
          <div className="h-full bg-amber-400 w-1/4" title="보통 (51-100)" />
          <div className="h-full bg-orange-400 w-1/4" title="나쁨 (101-150)" />
          <div className="h-full bg-rose-500 w-1/4" title="매우나쁨 (151+)" />
        </div>

        {/* Detailed Pollutants Breakdown */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
          <div className="bg-white/5 rounded-xl p-2.5">
            <span className="text-[11px] text-white/60 block">초미세먼지</span>
            <span className="text-sm font-bold mt-0.5 block">{pm25}</span>
            <span className="text-[10px] text-white/40">µg/m³</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5">
            <span className="text-[11px] text-white/60 block">미세먼지</span>
            <span className="text-sm font-bold mt-0.5 block">{pm10}</span>
            <span className="text-[10px] text-white/40">µg/m³</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5">
            <span className="text-[11px] text-white/60 block">오존 (O₃)</span>
            <span className="text-sm font-bold mt-0.5 block">{ozone}</span>
            <span className="text-[10px] text-white/40">µg/m³</span>
          </div>
        </div>
      </div>
    </div>
  );
};
