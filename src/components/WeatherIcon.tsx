import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
} from 'lucide-react';
import { WeatherIconType } from '../types/weather';

interface WeatherIconProps {
  icon: WeatherIconType;
  isDay?: boolean;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  icon,
  isDay = true,
  className = '',
  size = 28,
}) => {
  switch (icon) {
    case 'clear':
      return isDay ? (
        <Sun size={size} className={`text-amber-400 animate-pulse ${className}`} />
      ) : (
        <Moon size={size} className={`text-indigo-200 ${className}`} />
      );
    case 'partly-cloudy':
      return isDay ? (
        <CloudSun size={size} className={`text-amber-300 ${className}`} />
      ) : (
        <CloudMoon size={size} className={`text-indigo-300 ${className}`} />
      );
    case 'cloudy':
      return <Cloud size={size} className={`text-slate-300 ${className}`} />;
    case 'fog':
      return <CloudFog size={size} className={`text-slate-300 ${className}`} />;
    case 'drizzle':
      return <CloudDrizzle size={size} className={`text-sky-300 ${className}`} />;
    case 'rain':
      return <CloudRain size={size} className={`text-blue-400 ${className}`} />;
    case 'snow':
      return <CloudSnow size={size} className={`text-cyan-200 ${className}`} />;
    case 'thunderstorm':
      return <CloudLightning size={size} className={`text-amber-300 ${className}`} />;
    default:
      return <Sun size={size} className={`text-amber-400 ${className}`} />;
  }
};
