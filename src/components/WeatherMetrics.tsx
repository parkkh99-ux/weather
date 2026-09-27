import React from 'react';
import {
  Compass,
  Droplets,
  Sun,
  Eye,
  Gauge,
  CloudRain,
  Wind,
} from 'lucide-react';
import { CurrentWeatherData } from '../types/weather';
import { getUvCategory, getWindDirection } from '../utils/weatherUtils';

interface WeatherMetricsProps {
  current: CurrentWeatherData;
}

export const WeatherMetrics: React.FC<WeatherMetricsProps> = ({ current }) => {
  const uvInfo = getUvCategory(current.uvIndex);
  const windDirName = getWindDirection(current.windDirection);

  const metricCards = [
    {
      title: '바람 & 풍향',
      icon: <Wind size={18} className="text-sky-300" />,
      value: `${current.windSpeed} m/s`,
      subValue: `${windDirName} (${current.windDirection}°)`,
      extra: `순간 돌풍 ${current.windGusts} m/s`,
    },
    {
      title: '습도',
      icon: <Droplets size={18} className="text-cyan-300" />,
      value: `${current.humidity}%`,
      subValue: current.humidity > 70 ? '습한 환경' : current.humidity < 35 ? '건조한 상태' : '쾌적한 습도',
      extra: `기압 ${current.pressure} hPa`,
    },
    {
      title: '자외선 지수 (UV)',
      icon: <Sun size={18} className="text-amber-300" />,
      value: `${current.uvIndex}`,
      subValue: uvInfo.text,
      badgeColor: uvInfo.color,
      extra: uvInfo.advice,
    },
    {
      title: '가시거리',
      icon: <Eye size={18} className="text-emerald-300" />,
      value: `${current.visibility} km`,
      subValue: current.visibility >= 10 ? '시야 매우 양호' : current.visibility >= 5 ? '시야 보통' : '안개/먼지 주의',
      extra: `구름량 ${current.cloudCover}%`,
    },
    {
      title: '대기압',
      icon: <Gauge size={18} className="text-purple-300" />,
      value: `${current.pressure} hPa`,
      subValue: current.pressure > 1013 ? '고기압 영향권' : '저기압 영향권',
      extra: '표준 해수면 기압 1013 hPa',
    },
    {
      title: '강수 정보',
      icon: <CloudRain size={18} className="text-blue-300" />,
      value: `${current.precipitation} mm`,
      subValue: current.precipitation > 0 ? '현재 강수 감지' : '현재 비 없음',
      extra: current.cloudCover > 80 ? '하늘이 잔뜩 흐림' : current.cloudCover > 40 ? '구름 다소 있음' : '맑은 하늘',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
      {metricCards.map((m, idx) => (
        <div
          key={idx}
          className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 shadow-xl text-white flex flex-col justify-between hover:bg-white/15 transition-all"
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs text-white/70 font-medium">{m.title}</span>
            <div className="p-1.5 rounded-xl bg-white/10">{m.icon}</div>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                {m.value}
              </span>
              {m.subValue && (
                <span className={`text-xs font-semibold ${m.badgeColor || 'text-white/80'}`}>
                  {m.subValue}
                </span>
              )}
            </div>
          </div>

          <p className="text-[11px] text-white/50 border-t border-white/10 pt-2 line-clamp-1">
            {m.extra}
          </p>
        </div>
      ))}
    </div>
  );
};
