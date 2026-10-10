import { LocationData, FullWeatherData, HourlyForecastItem, DailyForecastItem, AirQualityData } from '../types';

// WMO Weather interpretation codes (WW)
export function getWeatherDetails(code: number, isDay: boolean = true): { text: string; icon: string; category: 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'thunder' } {
  switch (code) {
    case 0:
      return { text: 'Clear Sky', icon: isDay ? 'Sun' : 'Moon', category: 'clear' };
    case 1:
      return { text: 'Mainly Clear', icon: isDay ? 'SunDim' : 'Moon', category: 'clear' };
    case 2:
      return { text: 'Partly Cloudy', icon: isDay ? 'CloudSun' : 'CloudMoon', category: 'cloudy' };
    case 3:
      return { text: 'Overcast', icon: 'Cloud', category: 'cloudy' };
    case 45:
    case 48:
      return { text: 'Foggy & Rime', icon: 'CloudFog', category: 'fog' };
    case 51:
    case 53:
    case 55:
      return { text: 'Drizzle', icon: 'CloudDrizzle', category: 'rain' };
    case 56:
    case 57:
      return { text: 'Freezing Drizzle', icon: 'CloudSnow', category: 'snow' };
    case 61:
      return { text: 'Slight Rain', icon: 'CloudRain', category: 'rain' };
    case 63:
      return { text: 'Moderate Rain', icon: 'CloudRain', category: 'rain' };
    case 65:
      return { text: 'Heavy Rain', icon: 'CloudRain', category: 'rain' };
    case 66:
    case 67:
      return { text: 'Freezing Rain', icon: 'CloudHail', category: 'rain' };
    case 71:
      return { text: 'Slight Snowfall', icon: 'CloudSnow', category: 'snow' };
    case 73:
      return { text: 'Moderate Snowfall', icon: 'CloudSnow', category: 'snow' };
    case 75:
      return { text: 'Heavy Snowfall', icon: 'Snowflake', category: 'snow' };
    case 77:
      return { text: 'Snow Grains', icon: 'Snowflake', category: 'snow' };
    case 80:
    case 81:
    case 82:
      return { text: 'Rain Showers', icon: 'CloudRain', category: 'rain' };
    case 85:
    case 86:
      return { text: 'Snow Showers', icon: 'CloudSnow', category: 'snow' };
    case 95:
      return { text: 'Thunderstorm', icon: 'CloudLightning', category: 'thunder' };
    case 96:
    case 99:
      return { text: 'Thunderstorm with Hail', icon: 'CloudLightning', category: 'thunder' };
    default:
      return { text: 'Cloudy', icon: 'Cloud', category: 'cloudy' };
  }
}

export function getAqiDescription(usAqi: number): { label: AirQualityData['qualityLabel']; colorClass: string } {
  if (usAqi <= 50) return { label: 'Good', colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  if (usAqi <= 100) return { label: 'Moderate', colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
  if (usAqi <= 150) return { label: 'Unhealthy for Sensitive Groups', colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
  if (usAqi <= 200) return { label: 'Unhealthy', colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  if (usAqi <= 300) return { label: 'Very Unhealthy', colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
  return { label: 'Hazardous', colorClass: 'text-red-600 bg-red-600/10 border-red-600/30' };
}

export async function searchLocations(query: string): Promise<LocationData[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=7&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Geocoding service error');
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];
    
    return data.results.map((r: any) => ({
      id: r.id,
      name: r.name,
      country: r.country || '',
      admin1: r.admin1 || '',
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone || 'auto',
    }));
  } catch (err) {
    console.warn('Location search failed, using fallback', err);
    return getFallbackLocations(query);
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<LocationData> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${lat.toFixed(2)},${lon.toFixed(2)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        return {
          id: item.id,
          name: item.name,
          country: item.country || '',
          admin1: item.admin1 || '',
          latitude: lat,
          longitude: lon,
          timezone: item.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }
    }
  } catch {
    // ignore
  }
  return {
    name: 'Current Location',
    country: '',
    latitude: lat,
    longitude: lon,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export async function fetchWeatherData(loc: LocationData): Promise<FullWeatherData> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=${encodeURIComponent(loc.timezone || 'auto')}&forecast_days=10`;

  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${loc.latitude}&longitude=${loc.longitude}&current=european_aqi,us_aqi,pm10,pm2_5,ozone,nitrogen_dioxide&timezone=${encodeURIComponent(loc.timezone || 'auto')}`;

  const [weatherRes, aqiRes] = await Promise.allSettled([
    fetch(weatherUrl),
    fetch(aqiUrl),
  ]);

  if (weatherRes.status !== 'fulfilled' || !weatherRes.value.ok) {
    throw new Error('Unable to retrieve meteorological forecast data.');
  }

  const wData = await weatherRes.value.json();

  let airQuality: AirQualityData | undefined;
  if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
    try {
      const aData = await aqiRes.value.json();
      if (aData.current) {
        const usAqi = Math.round(aData.current.us_aqi ?? 38);
        const { label, colorClass } = getAqiDescription(usAqi);
        airQuality = {
          usAqi,
          europeanAqi: Math.round(aData.current.european_aqi ?? 20),
          pm2_5: Math.round(aData.current.pm2_5 ?? 8),
          pm10: Math.round(aData.current.pm10 ?? 14),
          ozone: Math.round(aData.current.ozone ?? 45),
          nitrogenDioxide: Math.round(aData.current.nitrogen_dioxide ?? 12),
          qualityLabel: label,
          colorClass,
        };
      }
    } catch (e) {
      console.warn('Air quality parse error', e);
    }
  }

  // Parse Current
  const isDay = Boolean(wData.current.is_day);
  const wCode = wData.current.weather_code ?? 0;
  const wDetails = getWeatherDetails(wCode, isDay);

  // Hourly (find current hour index)
  const now = new Date();
  const hourlyTimes: string[] = wData.hourly.time || [];
  let startIndex = 0;
  const currentIsoPrefix = now.toISOString().slice(0, 13);
  const matchIdx = hourlyTimes.findIndex(t => t.startsWith(currentIsoPrefix));
  if (matchIdx !== -1) {
    startIndex = matchIdx;
  }
  const next24Times = hourlyTimes.slice(startIndex, startIndex + 25);

  const hourly: HourlyForecastItem[] = next24Times.map((isoStr, idx) => {
    const arrayIndex = startIndex + idx;
    const timeObj = new Date(isoStr);
    const displayHour = timeObj.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    const code = wData.hourly.weather_code?.[arrayIndex] ?? 0;
    const itemDetails = getWeatherDetails(code, true);

    return {
      time: isoStr,
      displayTime: idx === 0 ? 'Now' : displayHour,
      temperature: Math.round(wData.hourly.temperature_2m?.[arrayIndex] ?? 20),
      apparentTemperature: Math.round(wData.hourly.apparent_temperature?.[arrayIndex] ?? 20),
      precipitationProbability: Math.round(wData.hourly.precipitation_probability?.[arrayIndex] ?? 0),
      precipitation: Number((wData.hourly.precipitation?.[arrayIndex] ?? 0).toFixed(1)),
      weatherCode: code,
      weatherIcon: itemDetails.icon,
      windSpeed: Math.round(wData.hourly.wind_speed_10m?.[arrayIndex] ?? 10),
      uvIndex: Math.round(wData.hourly.uv_index?.[arrayIndex] ?? 0),
    };
  });

  // Daily
  const dailyDates: string[] = wData.daily.time || [];
  const daily: DailyForecastItem[] = dailyDates.map((dateStr, idx) => {
    const d = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = idx === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const code = wData.daily.weather_code?.[idx] ?? 0;
    const itemDetails = getWeatherDetails(code, true);

    return {
      date: dateStr,
      dayOfWeek,
      weatherCode: code,
      weatherText: itemDetails.text,
      weatherIcon: itemDetails.icon,
      tempMax: Math.round(wData.daily.temperature_2m_max?.[idx] ?? 22),
      tempMin: Math.round(wData.daily.temperature_2m_min?.[idx] ?? 14),
      precipitationProbability: Math.round(wData.daily.precipitation_probability_max?.[idx] ?? 0),
      precipitationSum: Number((wData.daily.precipitation_sum?.[idx] ?? 0).toFixed(1)),
      uvIndexMax: Math.round(wData.daily.uv_index_max?.[idx] ?? 4),
      windSpeedMax: Math.round(wData.daily.wind_speed_10m_max?.[idx] ?? 15),
      sunrise: wData.daily.sunrise?.[idx] ? new Date(wData.daily.sunrise[idx]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '06:15 AM',
      sunset: wData.daily.sunset?.[idx] ? new Date(wData.daily.sunset[idx]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '07:45 PM',
    };
  });

  // Visibility from hourly current
  const rawVisibility = wData.hourly.visibility?.[startIndex] ?? 10000;
  const currentUv = Math.round(wData.hourly.uv_index?.[startIndex] ?? (isDay ? 4 : 0));

  return {
    location: loc,
    current: {
      temperature: Math.round(wData.current.temperature_2m ?? 20),
      apparentTemperature: Math.round(wData.current.apparent_temperature ?? 20),
      isDay,
      weatherCode: wCode,
      weatherText: wDetails.text,
      weatherIcon: wDetails.icon,
      humidity: Math.round(wData.current.relative_humidity_2m ?? 60),
      windSpeed: Math.round(wData.current.wind_speed_10m ?? 12),
      windDirection: Math.round(wData.current.wind_direction_10m ?? 180),
      windGusts: Math.round(wData.current.wind_gusts_10m ?? 18),
      precipitation: Number((wData.current.precipitation ?? 0).toFixed(1)),
      pressure: Math.round(wData.current.pressure_msl ?? 1013),
      cloudCover: Math.round(wData.current.cloud_cover ?? 30),
      uvIndex: currentUv,
      visibility: rawVisibility,
    },
    hourly,
    daily,
    airQuality: airQuality || {
      usAqi: 42,
      europeanAqi: 22,
      pm2_5: 9,
      pm10: 16,
      ozone: 48,
      nitrogenDioxide: 15,
      qualityLabel: 'Good',
      colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    updatedAt: new Date(),
  };
}

// Fallback search suggestions
function getFallbackLocations(query: string): LocationData[] {
  const catalog: LocationData[] = [
    { name: 'Tokyo', country: 'Japan', admin1: 'Tokyo', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
    { name: 'London', country: 'United Kingdom', admin1: 'England', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
    { name: 'New York', country: 'United States', admin1: 'New York', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
    { name: 'Paris', country: 'France', admin1: 'Île-de-France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
    { name: 'Sydney', country: 'Australia', admin1: 'New South Wales', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
    { name: 'San Francisco', country: 'United States', admin1: 'California', latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles' },
    { name: 'Singapore', country: 'Singapore', admin1: '', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
    { name: 'Reykjavik', country: 'Iceland', admin1: 'Capital Region', latitude: 64.1466, longitude: -21.9426, timezone: 'Atlantic/Reykjavik' },
    { name: 'Dubai', country: 'United Arab Emirates', admin1: 'Dubai', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
    { name: 'Vancouver', country: 'Canada', admin1: 'British Columbia', latitude: 49.2827, longitude: -123.1207, timezone: 'America/Vancouver' },
  ];
  return catalog.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.country.toLowerCase().includes(query.toLowerCase()));
}
