import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// API Keys from environment
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY?.trim() || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() || '';

// WMO Weather code mapping to Korean descriptions and weather conditions
function mapWmoCode(code: number): {
  condition: string;
  description: string;
  icon: 'clear' | 'partly-cloudy' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';
} {
  switch (code) {
    case 0:
      return { condition: '맑음', description: '구름 없이 맑은 하늘', icon: 'clear' };
    case 1:
      return { condition: '대체로 맑음', description: '대체로 맑은 날씨', icon: 'partly-cloudy' };
    case 2:
      return { condition: '구름 조금', description: '구름이 조금 낀 하늘', icon: 'partly-cloudy' };
    case 3:
      return { condition: '흐림', description: '흐리고 구름 많음', icon: 'cloudy' };
    case 45:
    case 48:
      return { condition: '안개', description: '가시거리가 짧은 짙은 안개', icon: 'fog' };
    case 51:
    case 53:
    case 55:
      return { condition: '이슬비', description: '가볍게 내리는 이슬비', icon: 'drizzle' };
    case 56:
    case 57:
      return { condition: '어는 이슬비', description: '결빙성 이슬비 주의', icon: 'drizzle' };
    case 61:
      return { condition: '약한 비', description: '약한 비가 내림', icon: 'rain' };
    case 63:
      return { condition: '보통 비', description: '비가 내리는 중', icon: 'rain' };
    case 65:
      return { condition: '강한 비', description: '세찬 비가 내림', icon: 'rain' };
    case 66:
    case 67:
      return { condition: '진눈깨비', description: '비와 눈이 섞여 내림', icon: 'rain' };
    case 71:
      return { condition: '약한 눈', description: '송이눈이 조금 내림', icon: 'snow' };
    case 73:
      return { condition: '보통 눈', description: '눈이 내리는 중', icon: 'snow' };
    case 75:
      return { condition: '강한 눈', description: '함박눈 및 대설 주의', icon: 'snow' };
    case 77:
      return { condition: '싸락눈', description: '싸락눈이 흩날림', icon: 'snow' };
    case 80:
    case 81:
    case 82:
      return { condition: '소나기', description: '갑작스러운 소나기 주의', icon: 'rain' };
    case 85:
    case 86:
      return { condition: '눈보라/눈소나기', description: '강한 눈소나기', icon: 'snow' };
    case 95:
      return { condition: '뇌우', description: '천둥과 번개를 동반한 비', icon: 'thunderstorm' };
    case 96:
    case 99:
      return { condition: '우박 뇌우', description: '우박을 동반한 강한 뇌우', icon: 'thunderstorm' };
    default:
      return { condition: '맑음', description: '쾌적한 날씨', icon: 'clear' };
  }
}

// Convert OpenWeather icon to our unified icon set
function mapOpenWeatherIcon(iconCode: string): 'clear' | 'partly-cloudy' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm' {
  if (iconCode.startsWith('01')) return 'clear';
  if (iconCode.startsWith('02')) return 'partly-cloudy';
  if (iconCode.startsWith('03') || iconCode.startsWith('04')) return 'cloudy';
  if (iconCode.startsWith('09')) return 'drizzle';
  if (iconCode.startsWith('10')) return 'rain';
  if (iconCode.startsWith('11')) return 'thunderstorm';
  if (iconCode.startsWith('13')) return 'snow';
  if (iconCode.startsWith('50')) return 'fog';
  return 'clear';
}

// Popular locations for quick selection
const POPULAR_LOCATIONS = [
  { name: '서울', country: '대한민국', lat: 37.5665, lon: 126.9780 },
  { name: '부산', country: '대한민국', lat: 35.1796, lon: 129.0756 },
  { name: '제주', country: '대한민국', lat: 33.4996, lon: 126.5312 },
  { name: '인천', country: '대한민국', lat: 37.4563, lon: 126.7052 },
  { name: '대구', country: '대한민국', lat: 35.8714, lon: 128.6014 },
  { name: '대전', country: '대한민국', lat: 36.3504, lon: 127.3845 },
  { name: '광주', country: '대한민국', lat: 35.1595, lon: 126.8526 },
  { name: '강릉', country: '대한민국', lat: 37.7519, lon: 128.8761 },
  { name: '도쿄', country: '일본', lat: 35.6762, lon: 139.6503 },
  { name: '뉴욕', country: '미국', lat: 40.7128, lon: -74.0060 },
  { name: '파리', country: '프랑스', lat: 48.8566, lon: 2.3522 },
  { name: '런던', country: '영국', lat: 51.5074, lon: -0.1278 },
];

// Helper: Open-Meteo Weather Fetcher
async function fetchOpenMeteoWeather(lat: number, lon: number, cityName?: string) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,visibility,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
  
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;

  const [weatherRes, aqiRes] = await Promise.all([
    fetch(weatherUrl),
    fetch(aqiUrl).catch(() => null),
  ]);

  if (!weatherRes.ok) {
    throw new Error(`Open-Meteo returned status ${weatherRes.status}`);
  }

  const wData = await weatherRes.json();
  const aqiData = aqiRes && aqiRes.ok ? await aqiRes.json() : null;

  const currentWmo = mapWmoCode(wData.current.weather_code);
  const currentHourIndex = new Date().getHours();

  // Hourly forecast for next 24 hours
  const hourly = [];
  const hourlyTimes = wData.hourly.time || [];
  const startIndex = Math.max(0, hourlyTimes.findIndex((t: string) => new Date(t).getTime() >= Date.now() - 3600000));
  const sliceStart = startIndex >= 0 ? startIndex : 0;
  
  for (let i = sliceStart; i < Math.min(sliceStart + 24, hourlyTimes.length); i++) {
    const wInfo = mapWmoCode(wData.hourly.weather_code[i]);
    hourly.push({
      time: hourlyTimes[i],
      temp: Math.round(wData.hourly.temperature_2m[i]),
      apparentTemp: Math.round(wData.hourly.apparent_temperature[i]),
      precipitationProb: wData.hourly.precipitation_probability[i] ?? 0,
      precipitation: wData.hourly.precipitation[i] ?? 0,
      condition: wInfo.condition,
      icon: wInfo.icon,
      humidity: wData.hourly.relative_humidity_2m[i],
      windSpeed: Math.round(wData.hourly.wind_speed_10m[i] * 10) / 10,
      uvIndex: wData.hourly.uv_index ? wData.hourly.uv_index[i] : 0,
    });
  }

  // Daily forecast for next 7 days
  const daily = [];
  const dailyTimes = wData.daily.time || [];
  for (let i = 0; i < Math.min(7, dailyTimes.length); i++) {
    const wInfo = mapWmoCode(wData.daily.weather_code[i]);
    daily.push({
      date: dailyTimes[i],
      maxTemp: Math.round(wData.daily.temperature_2m_max[i]),
      minTemp: Math.round(wData.daily.temperature_2m_min[i]),
      precipitationProb: wData.daily.precipitation_probability_max[i] ?? 0,
      precipitationSum: wData.daily.precipitation_sum[i] ?? 0,
      sunrise: wData.daily.sunrise[i],
      sunset: wData.daily.sunset[i],
      uvIndexMax: wData.daily.uv_index_max ? Math.round(wData.daily.uv_index_max[i]) : 5,
      condition: wInfo.condition,
      icon: wInfo.icon,
    });
  }

  // Air Quality calculation
  const pm25 = aqiData?.current?.pm2_5 ?? 15;
  const pm10 = aqiData?.current?.pm10 ?? 32;
  const aqiValue = aqiData?.current?.us_aqi ?? Math.round(pm25 * 3);

  let aqiGrade = '좋음';
  let aqiColor = '#10b981'; // emerald
  if (aqiValue > 150 || pm25 > 50) {
    aqiGrade = '매우 나쁨';
    aqiColor = '#ef4444'; // red
  } else if (aqiValue > 100 || pm25 > 35) {
    aqiGrade = '나쁨';
    aqiColor = '#f97316'; // orange
  } else if (aqiValue > 50 || pm25 > 15) {
    aqiGrade = '보통';
    aqiColor = '#eab308'; // yellow
  }

  return {
    provider: 'Open-Meteo',
    hasApiKey: Boolean(OPENWEATHER_API_KEY),
    city: cityName || '현재 위치',
    lat,
    lon,
    current: {
      temp: Math.round(wData.current.temperature_2m),
      apparentTemp: Math.round(wData.current.apparent_temperature),
      tempMax: daily[0]?.maxTemp ?? Math.round(wData.current.temperature_2m),
      tempMin: daily[0]?.minTemp ?? Math.round(wData.current.temperature_2m),
      humidity: wData.current.relative_humidity_2m,
      pressure: Math.round(wData.current.surface_pressure || wData.current.pressure_msl),
      windSpeed: Math.round(wData.current.wind_speed_10m * 10) / 10,
      windDirection: wData.current.wind_direction_10m,
      windGusts: Math.round(wData.current.wind_gusts_10m * 10) / 10,
      precipitation: wData.current.precipitation,
      cloudCover: wData.current.cloud_cover,
      isDay: Boolean(wData.current.is_day),
      condition: currentWmo.condition,
      description: currentWmo.description,
      icon: currentWmo.icon,
      uvIndex: daily[0]?.uvIndexMax ?? 4,
      visibility: Math.round((wData.hourly.visibility?.[currentHourIndex] || 10000) / 1000), // in km
      sunrise: daily[0]?.sunrise || '06:30',
      sunset: daily[0]?.sunset || '18:45',
    },
    airQuality: {
      aqi: aqiValue,
      grade: aqiGrade,
      color: aqiColor,
      pm25: Math.round(pm25),
      pm10: Math.round(pm10),
      ozone: aqiData?.current?.ozone ? Math.round(aqiData.current.ozone) : 40,
      no2: aqiData?.current?.nitrogen_dioxide ? Math.round(aqiData.current.nitrogen_dioxide) : 20,
    },
    hourly,
    daily,
    timestamp: new Date().toISOString(),
  };
}

// Helper: OpenWeatherMap Weather Fetcher
async function fetchOpenWeatherMap(lat: number, lon: number, cityName?: string) {
  if (!OPENWEATHER_API_KEY) {
    return fetchOpenMeteoWeather(lat, lon, cityName);
  }

  try {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=kr&appid=${OPENWEATHER_API_KEY}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=kr&appid=${OPENWEATHER_API_KEY}`;
    const pollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;

    const [currRes, foreRes, pollRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl),
      fetch(pollutionUrl).catch(() => null),
    ]);

    if (!currRes.ok || !foreRes.ok) {
      console.warn('OpenWeatherMap API request failed, falling back to Open-Meteo');
      return fetchOpenMeteoWeather(lat, lon, cityName);
    }

    const currData = await currRes.json();
    const foreData = await foreRes.json();
    const pollData = pollRes && pollRes.ok ? await pollRes.json() : null;

    const weatherMain = currData.weather?.[0] || {};
    const icon = mapOpenWeatherIcon(weatherMain.icon || '01d');

    // Build hourly (from 3-hour forecasts)
    const hourly = (foreData.list || []).slice(0, 8).map((item: any) => ({
      time: item.dt_txt,
      temp: Math.round(item.main.temp),
      apparentTemp: Math.round(item.main.feels_like),
      precipitationProb: Math.round((item.pop || 0) * 100),
      precipitation: item.rain ? (item.rain['3h'] || 0) : 0,
      condition: item.weather?.[0]?.main || '맑음',
      icon: mapOpenWeatherIcon(item.weather?.[0]?.icon || '01d'),
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed * 10) / 10,
      uvIndex: 4,
    }));

    // Group forecast list into days for 5-7 day forecast
    const dailyMap = new Map<string, any>();
    for (const item of foreData.list || []) {
      const dateKey = item.dt_txt.split(' ')[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          temps: [item.main.temp],
          pop: [item.pop || 0],
          weather: item.weather?.[0],
          icon: item.weather?.[0]?.icon,
        });
      } else {
        const d = dailyMap.get(dateKey);
        d.temps.push(item.main.temp);
        d.pop.push(item.pop || 0);
      }
    }

    const daily = Array.from(dailyMap.values()).slice(0, 7).map((d: any) => ({
      date: d.date,
      maxTemp: Math.round(Math.max(...d.temps)),
      minTemp: Math.round(Math.min(...d.temps)),
      precipitationProb: Math.round(Math.max(...d.pop) * 100),
      precipitationSum: 0,
      sunrise: new Date(currData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      sunset: new Date(currData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      uvIndexMax: 5,
      condition: d.weather?.description || '맑음',
      icon: mapOpenWeatherIcon(d.icon || '01d'),
    }));

    // Air quality
    const aqiIndex = pollData?.list?.[0]?.main?.aqi || 2;
    const pm25 = pollData?.list?.[0]?.components?.pm2_5 || 18;
    const pm10 = pollData?.list?.[0]?.components?.pm10 || 35;
    const grades = ['좋음', '보통', '나쁨', '매우 나쁨', '위험'];
    const colors = ['#10b981', '#eab308', '#f97316', '#ef4444', '#7f1d1d'];
    const gradeIdx = Math.min(Math.max(0, aqiIndex - 1), 4);

    return {
      provider: 'OpenWeather',
      hasApiKey: true,
      city: cityName || currData.name || '현재 위치',
      lat,
      lon,
      current: {
        temp: Math.round(currData.main.temp),
        apparentTemp: Math.round(currData.main.feels_like),
        tempMax: Math.round(currData.main.temp_max),
        tempMin: Math.round(currData.main.temp_min),
        humidity: currData.main.humidity,
        pressure: currData.main.pressure,
        windSpeed: Math.round(currData.wind.speed * 10) / 10,
        windDirection: currData.wind.deg || 0,
        windGusts: Math.round((currData.wind.gust || currData.wind.speed * 1.3) * 10) / 10,
        precipitation: currData.rain ? (currData.rain['1h'] || 0) : 0,
        cloudCover: currData.clouds?.all || 0,
        isDay: (currData.dt > currData.sys.sunrise && currData.dt < currData.sys.sunset),
        condition: weatherMain.description || '맑음',
        description: weatherMain.description || '쾌적한 날씨',
        icon,
        uvIndex: 5,
        visibility: Math.round((currData.visibility || 10000) / 1000),
        sunrise: new Date(currData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        sunset: new Date(currData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      },
      airQuality: {
        aqi: aqiIndex * 25,
        grade: grades[gradeIdx],
        color: colors[gradeIdx],
        pm25: Math.round(pm25),
        pm10: Math.round(pm10),
        ozone: Math.round(pollData?.list?.[0]?.components?.o3 || 45),
        no2: Math.round(pollData?.list?.[0]?.components?.no2 || 22),
      },
      hourly,
      daily,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error fetching OpenWeatherMap:', err);
    return fetchOpenMeteoWeather(lat, lon, cityName);
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Status route: checks configured API services
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    openWeatherApiKeyConfigured: Boolean(OPENWEATHER_API_KEY),
    geminiApiKeyConfigured: Boolean(GEMINI_API_KEY),
    activeProvider: OPENWEATHER_API_KEY ? 'OpenWeather API' : '글로벌 실시간 기상망 (Open-Meteo & KMA)',
  });
});

// 2. Weather route
app.get('/api/weather', async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : 37.5665;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : 126.9780;
    const city = (req.query.city as string) || (lat === 37.5665 ? '서울' : '현재 위치');

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: '유효한 위도(lat)와 경도(lon)가 필요합니다.' });
    }

    const data = OPENWEATHER_API_KEY
      ? await fetchOpenWeatherMap(lat, lon, city)
      : await fetchOpenMeteoWeather(lat, lon, city);

    return res.json(data);
  } catch (error: any) {
    console.error('Error handling /api/weather:', error);
    return res.status(500).json({ error: '날씨 데이터를 불러오는데 실패했습니다.', details: error.message });
  }
});

// 3. Search & Geocoding route
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string)?.trim();
    if (!query) {
      return res.json({ results: POPULAR_LOCATIONS });
    }

    // Try Open-Meteo Geocoding
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=ko&format=json`;
    const geoRes = await fetch(geoUrl);
    
    if (!geoRes.ok) {
      // Fallback filter on popular locations
      const filtered = POPULAR_LOCATIONS.filter(loc => 
        loc.name.toLowerCase().includes(query.toLowerCase()) || 
        loc.country.toLowerCase().includes(query.toLowerCase())
      );
      return res.json({ results: filtered });
    }

    const geoData = await geoRes.json();
    const results = (geoData.results || []).map((item: any) => ({
      name: item.name,
      country: item.country || '',
      countryCode: item.country_code || '',
      admin1: item.admin1 || '',
      lat: item.latitude,
      lon: item.longitude,
    }));

    return res.json({ results });
  } catch (error: any) {
    console.error('Error in /api/search:', error);
    return res.json({ results: POPULAR_LOCATIONS });
  }
});

// 4. AI Weather Briefing & Outfit recommendations
app.post('/api/ai-briefing', async (req: Request, res: Response) => {
  const { city, temp, apparentTemp, condition, humidity, windSpeed, precipitationProb, aqi, pm25 } = req.body;

  // Fallback rule-based generator
  const getRuleBasedBriefing = () => {
    let clothing = '';
    let outer = '';
    const t = Number(temp);

    if (t >= 28) {
      clothing = '민소매, 반팔, 얇은 린넨 셔츠, 반바지';
      outer = '자외선 차단용 얇은 셔츠나 모자';
    } else if (t >= 23) {
      clothing = '반팔, 얇은 셔츠, 얇은 면바지, 슬랙스';
      outer = '실내 에어컨 대비 얇은 카디건';
    } else if (t >= 20) {
      clothing = '블라우스, 긴팔 티셔츠, 슬랙스, 청바지';
      outer = '가벼운 가디건 또는 얇은 자켓';
    } else if (t >= 17) {
      clothing = '니트, 맨투맨, 셔츠 레이어드';
      outer = '가디건, 자켓, 바람막이';
    } else if (t >= 12) {
      clothing = '도톰한 맨투맨, 니트, 기모 청바지';
      outer = '자켓, 트렌치코트, 야상';
    } else if (t >= 9) {
      clothing = '히트텍, 두꺼운 니트, 청바지';
      outer = '트렌치코트, 가죽자켓, 숏패딩';
    } else if (t >= 5) {
      clothing = '내의, 기모 의류, 도톰한 바지';
      outer = '울코트, 패딩 조끼, 숏패딩';
    } else {
      clothing = '방한 내의, 두꺼운 기모 의류';
      outer = '롱패딩, 두꺼운 코트, 목도리, 장갑';
    }

    const needsUmbrella = Number(precipitationProb) > 40 || condition?.includes('비') || condition?.includes('눈');
    const outdoorScore = Number(aqi) > 100 ? 40 : (Number(precipitationProb) > 50 ? 50 : 85);
    const laundryScore = Number(humidity) > 75 || needsUmbrella ? 35 : (Number(temp) > 15 ? 90 : 70);

    return {
      headline: `${city}의 현재 기온은 ${temp}°C(체감 ${apparentTemp}°C)이며 ${condition} 날씨입니다.`,
      clothingAdvice: `${clothing}. ${outer ? `외투로는 ${outer}을(를) 추천합니다.` : ''}`,
      umbrellaAdvice: needsUmbrella ? '강수 확률이 높으니 외출 시 우산을 꼭 챙기세요!' : '비 소식이 적어 우산 없이 가볍게 외출하셔도 좋습니다.',
      outdoorIndex: outdoorScore,
      outdoorComment: outdoorScore >= 70 ? '산책 및 야외 운동하기 좋은 쾌적한 날씨입니다.' : '실내 위주의 활동을 권장합니다.',
      laundryIndex: laundryScore,
      laundryComment: laundryScore >= 70 ? '빨래가 뽀송뽀송하게 잘 마르는 좋은 날씨입니다.' : '습도가 높거나 비 예보가 있어 실내 건조기를 추천합니다.',
      healthTip: Number(pm25) > 35 ? '미세먼지 수치가 다소 높으니 마스크를 착용하세요.' : '충분한 수분 섭취와 함께 기분 좋은 하루 보내세요!',
      source: 'SkyCast AI Rule Engine',
    };
  };

  if (!GEMINI_API_KEY) {
    return res.json(getRuleBasedBriefing());
  }

  try {
    const ai = new GoogleGenAI();
    const prompt = `당신은 센스 있고 친절한 전문 기상 캐스터 및 스타일리스트입니다.
다음 도시의 현재 기상 데이터를 바탕으로 사용자에게 최적의 일상 가이드를 JSON 형식으로 작성해주세요.

[기상 데이터]
- 도시: ${city}
- 기온: ${temp}°C (체감 온도: ${apparentTemp}°C)
- 날씨 상태: ${condition}
- 습도: ${humidity}%
- 풍속: ${windSpeed} m/s
- 강수 확률: ${precipitationProb}%
- 미세먼지 수치(PM2.5): ${pm25} µg/m³ (AQI: ${aqi})

다음 JSON 스키마를 엄격히 준수하여 응답하세요 (순수 JSON 문자열만 반환):
{
  "headline": "한 줄 요약 (예: 큰 일교차에 주의하고 따뜻한 겉옷을 챙기세요!)",
  "clothingAdvice": "상의, 하의, 추천 외투 및 패션 팁",
  "umbrellaAdvice": "우산 소지 여부 가이드 (예: 오후에 비 소식이 있으니 접이식 우산 필수)",
  "outdoorIndex": 85 (0~100 사이 숫자),
  "outdoorComment": "야외활동/운동 조언 한마디",
  "laundryIndex": 90 (0~100 사이 숫자),
  "laundryComment": "빨래 및 실외 건조 조언 한마디",
  "healthTip": "환기, 미세먼지, 자외선, 감기 예방 등 건강 꿀팁",
  "source": "Gemini 3.8 Flash AI"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini AI briefing error, falling back to rule engine:', error);
    return res.json(getRuleBasedBriefing());
  }
});

// ----------------------------------------------------
// Production / Dev Vite Middlewares
// ----------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SkyCast Weather server running on http://0.0.0.0:${port}`);
    console.log(`OpenWeather API Key configured: ${Boolean(OPENWEATHER_API_KEY)}`);
    console.log(`Gemini API Key configured: ${Boolean(GEMINI_API_KEY)}`);
  });
}

startServer();
