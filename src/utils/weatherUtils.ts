import { WeatherIconType } from '../types/weather';

export function formatTemp(tempC: number, unit: 'C' | 'F'): string {
  if (unit === 'F') {
    const f = Math.round((tempC * 9) / 5 + 32);
    return `${f}°`;
  }
  return `${Math.round(tempC)}°`;
}

export function formatTempWithUnit(tempC: number, unit: 'C' | 'F'): string {
  if (unit === 'F') {
    const f = Math.round((tempC * 9) / 5 + 32);
    return `${f}°F`;
  }
  return `${Math.round(tempC)}°C`;
}

export function getWindDirection(deg: number): string {
  const directions = ['북풍', '북동풍', '동풍', '남동풍', '남풍', '남서풍', '서풍', '북서풍'];
  const index = Math.round(((deg % 360) / 45)) % 8;
  return directions[index];
}

export function getUvCategory(uv: number): { text: string; color: string; advice: string } {
  if (uv <= 2) {
    return { text: '낮음', color: 'text-emerald-400', advice: '자외선 위험이 낮아 안심하고 외출 가능합니다.' };
  } else if (uv <= 5) {
    return { text: '보통', color: 'text-amber-400', advice: '한낮 외출 시 자외선 차단제와 모자를 착용하세요.' };
  } else if (uv <= 7) {
    return { text: '높음', color: 'text-orange-400', advice: '햇볕이 강합니다. 외출 시 양산이나 선글라스를 권장합니다.' };
  } else if (uv <= 10) {
    return { text: '매우 높음', color: 'text-red-400', advice: '햇볕 노출을 최소화하고 그늘에 머무르세요.' };
  }
  return { text: '위험', color: 'text-purple-400', advice: '가급적 한낮 야외 외출을 자제하세요.' };
}

export function formatHour(timeStr: string): string {
  try {
    const date = new Date(timeStr);
    const hours = date.getHours();
    if (hours === 0) return '오전 12시';
    if (hours === 12) return '오후 12시';
    return hours > 12 ? `오후 ${hours - 12}시` : `오전 ${hours}시`;
  } catch {
    return timeStr;
  }
}

export function formatDayLabel(dateStr: string, index: number): { day: string; date: string } {
  if (index === 0) {
    return { day: '오늘', date: formatDateShort(dateStr) };
  }
  if (index === 1) {
    return { day: '내일', date: formatDateShort(dateStr) };
  }
  try {
    const d = new Date(dateStr);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    return { day: `${dayNames[d.getDay()]}요일`, date: formatDateShort(dateStr) };
  } catch {
    return { day: dateStr, date: '' };
  }
}

function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}.${d.getDate()}`;
  } catch {
    return '';
  }
}

export function getBackgroundTheme(condition: string, icon: WeatherIconType, isDay: boolean): {
  gradient: string;
  particleType: 'none' | 'rain' | 'snow' | 'clouds' | 'stars';
} {
  if (!isDay) {
    if (icon === 'rain' || icon === 'drizzle') {
      return { gradient: 'from-slate-950 via-indigo-950 to-slate-900', particleType: 'rain' };
    }
    if (icon === 'snow') {
      return { gradient: 'from-slate-950 via-slate-900 to-indigo-950', particleType: 'snow' };
    }
    if (icon === 'thunderstorm') {
      return { gradient: 'from-purple-950 via-slate-950 to-indigo-950', particleType: 'rain' };
    }
    return { gradient: 'from-slate-950 via-indigo-950 to-sky-950', particleType: 'stars' };
  }

  // Daytime
  switch (icon) {
    case 'rain':
    case 'drizzle':
      return { gradient: 'from-slate-800 via-sky-900 to-slate-900', particleType: 'rain' };
    case 'thunderstorm':
      return { gradient: 'from-slate-900 via-purple-950 to-slate-800', particleType: 'rain' };
    case 'snow':
      return { gradient: 'from-slate-700 via-blue-900 to-indigo-950', particleType: 'snow' };
    case 'fog':
      return { gradient: 'from-slate-700 via-slate-800 to-zinc-900', particleType: 'clouds' };
    case 'cloudy':
      return { gradient: 'from-slate-700 via-blue-950 to-slate-900', particleType: 'clouds' };
    case 'partly-cloudy':
      return { gradient: 'from-sky-700 via-blue-900 to-slate-900', particleType: 'clouds' };
    case 'clear':
    default:
      return { gradient: 'from-sky-600 via-blue-800 to-indigo-950', particleType: 'none' };
  }
}
