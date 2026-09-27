import React from 'react';
import { Calendar, Droplets } from 'lucide-react';
import { DailyItem } from '../types/weather';
import { formatDayLabel, formatTemp } from '../utils/weatherUtils';
import { WeatherIcon } from './WeatherIcon';

interface DailyForecastProps {
  daily: DailyItem[];
  unit: 'C' | 'F';
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily, unit }) => {
  // Find global min and max across all 7 days for the relative bar
  const allMins = daily.map((d) => d.minTemp);
  const allMaxs = daily.map((d) => d.maxTemp);
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const totalRange = Math.max(1, globalMax - globalMin);

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-xl text-white">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-white/15">
        <Calendar size={18} className="text-sky-300" />
        <h2 className="text-base sm:text-lg font-semibold text-white">
          주간 날씨 예보 (7일)
        </h2>
      </div>

      {/* Daily list */}
      <div className="mt-3 divide-y divide-white/10">
        {daily.map((item, idx) => {
          const { day, date } = formatDayLabel(item.date, idx);

          // Calculate bar offsets
          const leftPercent = Math.max(0, ((item.minTemp - globalMin) / totalRange) * 100);
          const barWidthPercent = Math.max(
            8,
            ((item.maxTemp - item.minTemp) / totalRange) * 100
          );

          return (
            <div
              key={item.date}
              className="py-3 sm:py-3.5 flex items-center justify-between gap-3 text-sm hover:bg-white/5 px-2 rounded-xl transition-colors"
            >
              {/* Day & Date */}
              <div className="w-24 shrink-0 flex items-center gap-2">
                <span className={`font-medium ${idx === 0 ? 'text-sky-300 font-semibold' : 'text-white/90'}`}>
                  {day}
                </span>
                <span className="text-xs text-white/40">{date}</span>
              </div>

              {/* Weather Condition & Icon */}
              <div className="flex items-center gap-2 w-32 shrink-0">
                <WeatherIcon icon={item.icon} size={20} />
                <span className="text-xs sm:text-sm text-white/80 truncate">
                  {item.condition}
                </span>
              </div>

              {/* Precipitation Chance */}
              <div className="w-14 shrink-0 text-center">
                {item.precipitationProb > 0 ? (
                  <span className="inline-flex items-center gap-0.5 text-xs text-sky-300">
                    <Droplets size={11} className="fill-sky-300" />
                    {item.precipitationProb}%
                  </span>
                ) : (
                  <span className="text-xs text-white/30">-</span>
                )}
              </div>

              {/* Temperature Bar & Values */}
              <div className="flex items-center gap-3 flex-1 max-w-[200px] justify-end">
                <span className="text-xs sm:text-sm text-white/60 w-8 text-right font-medium">
                  {formatTemp(item.minTemp, unit)}
                </span>

                {/* Relative temp gradient bar */}
                <div className="relative flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-300 to-rose-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${barWidthPercent}%`,
                    }}
                  />
                </div>

                <span className="text-xs sm:text-sm text-white font-medium w-8 text-right">
                  {formatTemp(item.maxTemp, unit)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
