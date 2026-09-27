import React from 'react';
import { Sunrise, Sunset } from 'lucide-react';

interface SunCycleCardProps {
  sunrise: string;
  sunset: string;
}

export const SunCycleCard: React.FC<SunCycleCardProps> = ({ sunrise, sunset }) => {
  // Format sunrise / sunset to cleanly readable times
  const cleanTime = (timeStr: string) => {
    try {
      if (timeStr.includes('T')) {
        const d = new Date(timeStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  const sunriseTime = cleanTime(sunrise);
  const sunsetTime = cleanTime(sunset);

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/15">
        <div className="flex items-center gap-2">
          <Sunrise size={18} className="text-amber-300" />
          <h3 className="text-sm font-semibold text-white">일출 및 일몰</h3>
        </div>
        <span className="text-xs text-white/60">태양 일조 주기</span>
      </div>

      <div className="mt-5 flex items-center justify-around">
        {/* Sunrise */}
        <div className="flex flex-col items-center">
          <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-300 mb-2">
            <Sunrise size={26} />
          </div>
          <span className="text-xs text-white/60">일출</span>
          <span className="text-lg font-bold text-white mt-0.5">{sunriseTime}</span>
        </div>

        {/* Daylight Arc Visual */}
        <div className="flex flex-col items-center px-2">
          <div className="relative w-28 h-14 border-t-2 border-dashed border-amber-300/40 rounded-t-full flex items-center justify-center">
            <div className="w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-pulse" />
          </div>
          <span className="text-[11px] text-white/50 mt-1">낮 시간 대략 12시간</span>
        </div>

        {/* Sunset */}
        <div className="flex flex-col items-center">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 mb-2">
            <Sunset size={26} />
          </div>
          <span className="text-xs text-white/60">일몰</span>
          <span className="text-lg font-bold text-white mt-0.5">{sunsetTime}</span>
        </div>
      </div>
    </div>
  );
};
