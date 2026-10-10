export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type SpeedUnit = 'kmh' | 'mph';

export interface LocationData {
  id?: number | string;
  name: string;
  country: string;
  admin1?: string; // State or province
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface CurrentWeatherMetrics {
  temperature: number;
  apparentTemperature: number;
  isDay: boolean;
  weatherCode: number;
  weatherText: string;
  weatherIcon: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  precipitation: number;
  pressure: number;
  cloudCover: number;
  uvIndex: number;
  visibility: number; // in meters
}

export interface HourlyForecastItem {
  time: string; // ISO string
  displayTime: string; // "14:00" or "2 PM"
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  weatherIcon: string;
  windSpeed: number;
  uvIndex: number;
}

export interface DailyForecastItem {
  date: string;
  dayOfWeek: string;
  weatherCode: number;
  weatherText: string;
  weatherIcon: string;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  precipitationSum: number;
  uvIndexMax: number;
  windSpeedMax: number;
  sunrise: string;
  sunset: string;
}

export interface AirQualityData {
  usAqi: number;
  europeanAqi: number;
  pm2_5: number;
  pm10: number;
  ozone: number;
  nitrogenDioxide: number;
  qualityLabel: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  colorClass: string;
}

export interface FullWeatherData {
  location: LocationData;
  current: CurrentWeatherMetrics;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  airQuality?: AirQualityData;
  updatedAt: Date;
}

export interface AiBriefing {
  overview: string;
  outfitRecommendation: string;
  activityAdvice: string;
  commuteStatus: string;
  generatedAt: string;
}
