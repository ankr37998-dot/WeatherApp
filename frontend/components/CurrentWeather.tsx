import React from 'react';
import { 
  FullWeatherData, 
  TemperatureUnit 
} from '../types';
import { WeatherIcon } from './WeatherIcon';
import { 
  ArrowUp, 
  ArrowDown, 
  Wind, 
  Droplets, 
  Eye, 
  Sun, 
  CloudRain, 
  Gauge, 
  Sparkles,
  Compass
} from 'lucide-react';

interface CurrentWeatherProps {
  weather: FullWeatherData;
  unit: TemperatureUnit;
  onOpenAiBriefing: () => void;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  weather,
  unit,
  onOpenAiBriefing,
}) => {
  const { current, daily, location } = weather;
  const today = daily[0];

  const convertTemp = (celsius: number): number => {
    return unit === 'celsius' ? celsius : Math.round((celsius * 9) / 5 + 32);
  };

  const getWindDirectionLabel = (deg: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 shadow-2xl p-6 sm:p-8 backdrop-blur-2xl">
      {/* Ambient background glow matching condition */}
      <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 ${
        current.weatherText.toLowerCase().includes('sun') || current.weatherText.toLowerCase().includes('clear')
          ? 'bg-amber-400'
          : current.weatherText.toLowerCase().includes('rain')
          ? 'bg-cyan-500'
          : current.weatherText.toLowerCase().includes('thunder')
          ? 'bg-yellow-500'
          : 'bg-blue-600'
      }`} />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left Column: Big Temperature & Condition */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${current.isDay ? 'bg-amber-400 animate-ping' : 'bg-indigo-400'}`} />
              {current.isDay ? 'Daytime' : 'Nighttime'} • Live Telemetry
            </span>

            <button
              onClick={onOpenAiBriefing}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Briefing</span>
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-4 sm:gap-6">
            <div className="flex items-start">
              <span className="text-6xl sm:text-8xl font-extrabold tracking-tighter text-white font-mono">
                {convertTemp(current.temperature)}
              </span>
              <span className="text-3xl sm:text-4xl font-semibold text-cyan-400 ml-1 mt-1">
                °{unit === 'celsius' ? 'C' : 'F'}
              </span>
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <WeatherIcon name={current.weatherIcon} className="w-10 h-10 sm:w-12 sm:h-12" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {current.weatherText}
                </h2>
              </div>
              <p className="text-sm text-slate-400 mt-1 font-medium">
                Feels like <strong className="text-slate-200">{convertTemp(current.apparentTemperature)}°{unit === 'celsius' ? 'C' : 'F'}</strong>
                {today && (
                  <span className="ml-3 inline-flex items-center gap-2">
                    <span className="inline-flex items-center text-rose-400">
                      <ArrowUp className="w-3 h-3 mr-0.5" />
                      {convertTemp(today.tempMax)}°
                    </span>
                    <span className="inline-flex items-center text-sky-400">
                      <ArrowDown className="w-3 h-3 mr-0.5" />
                      {convertTemp(today.tempMin)}°
                    </span>
                  </span>
                )}
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
            Currently in <strong className="text-slate-200">{location.name}</strong> with {current.cloudCover}% cloud cover and {current.humidity}% humidity. Wind is flowing from the {getWindDirectionLabel(current.windDirection)} at {current.windSpeed} km/h.
          </p>
        </div>

        {/* Right Column: Key Vital Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          {/* Wind */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Wind Speed</span>
              <Wind className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold text-white font-mono">
                {current.windSpeed} <span className="text-xs font-normal text-slate-400">km/h</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Compass className="w-3 h-3 text-cyan-400" />
                {getWindDirectionLabel(current.windDirection)} ({current.windDirection}°)
              </div>
            </div>
          </div>

          {/* Humidity */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Humidity</span>
              <Droplets className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold text-white font-mono">
                {current.humidity}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {current.humidity > 65 ? 'Humid atmosphere' : 'Comfortable dew point'}
              </div>
            </div>
          </div>

          {/* UV Index */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>UV Index</span>
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold text-white font-mono">
                {current.uvIndex} <span className="text-xs font-normal text-slate-400">/ 11</span>
              </div>
              <div className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                {current.uvIndex <= 2 ? 'Low exposure' : current.uvIndex <= 5 ? 'Moderate' : 'High protection needed'}
              </div>
            </div>
          </div>

          {/* Precipitation */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Precipitation</span>
              <CloudRain className="w-4 h-4 text-teal-400" />
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold text-white font-mono">
                {current.precipitation} <span className="text-xs font-normal text-slate-400">mm</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Chance: {today?.precipitationProbability ?? 0}%
              </div>
            </div>
          </div>

          {/* Pressure */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Pressure</span>
              <Gauge className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold text-white font-mono">
                {current.pressure} <span className="text-xs font-normal text-slate-400">hPa</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {current.pressure >= 1013 ? 'High Barometer' : 'Low Barometer'}
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Visibility</span>
              <Eye className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold text-white font-mono">
                {(current.visibility / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-400">km</span>
              </div>
              <div className="text-[11px] text-emerald-400/90 font-medium mt-0.5">
                {current.visibility >= 9000 ? 'Crystal clear' : 'Hazy / mist'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
