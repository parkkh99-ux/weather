export type WeatherIconType =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunderstorm';

export interface HourlyItem {
  time: string;
  temp: number;
  apparentTemp: number;
  precipitationProb: number;
  precipitation: number;
  condition: string;
  icon: WeatherIconType;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
}

export interface DailyItem {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitationProb: number;
  precipitationSum: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  condition: string;
  icon: WeatherIconType;
}

export interface AirQualityData {
  aqi: number;
  grade: string;
  color: string;
  pm25: number;
  pm10: number;
  ozone: number;
  no2: number;
}

export interface CurrentWeatherData {
  temp: number;
  apparentTemp: number;
  tempMax: number;
  tempMin: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  precipitation: number;
  cloudCover: number;
  isDay: boolean;
  condition: string;
  description: string;
  icon: WeatherIconType;
  uvIndex: number;
  visibility: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherResponse {
  provider: 'OpenWeather' | 'Open-Meteo';
  hasApiKey: boolean;
  city: string;
  lat: number;
  lon: number;
  current: CurrentWeatherData;
  airQuality: AirQualityData;
  hourly: HourlyItem[];
  daily: DailyItem[];
  timestamp: string;
}

export interface LocationItem {
  id?: string;
  name: string;
  country: string;
  countryCode?: string;
  admin1?: string;
  lat: number;
  lon: number;
}

export interface AiBriefingData {
  headline: string;
  clothingAdvice: string;
  umbrellaAdvice: string;
  outdoorIndex: number;
  outdoorComment: string;
  laundryIndex: number;
  laundryComment: string;
  healthTip: string;
  source: string;
}
