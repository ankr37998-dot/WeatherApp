import React, { useState } from 'react';
import { DailyForecastItem, TemperatureUnit } from '../types';
import { WeatherIcon } from './WeatherIcon';
import { Calendar, Droplets, Wind, Sun, ChevronDown, ChevronUp } from 'lucide-react';

interface DailyForecastProps {
  daily: DailyForecastItem[];
  unit: TemperatureUnit;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily, unit }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const convert = (celsius: number) => {
    return unit === 'celsius' ? celsius : Math.round((celsius * 9) / 5 + 32);
  };

  // Find absolute max and min for proportional bar rendering
  const allMax = Math.max(...daily.map(d => convert(d.tempMax)));
  const allMin = Math.min(...daily.map(d => convert(d.tempMin)));
  const totalRange = allMax - allMin || 1;

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            10-Day Extended Forecast
          </h3>
        </div>
        <span className="text-xs text-slate-400">Daily Trajectory</span>
      </div>

      <div className="mt-4 space-y-2.5">
        {daily.map((day, idx) => {
          const min = convert(day.tempMin);
          const max = convert(day.tempMax);
          const leftPercent = ((min - allMin) / totalRange) * 100;
          const widthPercent = Math.max(((max - min) / totalRange) * 100, 10);
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={day.date}
              className="rounded-2xl bg-slate-950/50 border border-slate-800/60 overflow-hidden transition-all hover:border-slate-700/80"
            >
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full p-3.5 flex items-center justify-between text-left gap-3 focus:outline-none"
              >
                {/* Day & Condition */}
                <div className="w-28 sm:w-36 shrink-0">
                  <div className="text-sm font-bold text-white">
                    {idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : day.dayOfWeek}
                  </div>
                  <div className="text-xs text-slate-400 truncate max-w-[120px] sm:max-w-none">
                    {day.weatherText}
                  </div>
                </div>

                {/* Weather Icon & Rain % */}
                <div className="flex items-center gap-2.5 w-24 shrink-0">
                  <WeatherIcon name={day.weatherIcon} className="w-6 h-6" />
                  {day.precipitationProbability > 0 ? (
                    <span className="text-xs font-semibold text-cyan-400 flex items-center gap-0.5">
                      <Droplets className="w-3 h-3" />
                      {day.precipitationProbability}%
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">0%</span>
                  )}
                </div>

                {/* Min / Max Temp Bar */}
                <div className="flex-1 hidden sm:flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold text-slate-400 w-8 text-right">
                    {min}°
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-800 relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-400 to-amber-400"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-white w-8">
                    {max}°
                  </span>
                </div>

                {/* Mobile compact range */}
                <div className="sm:hidden text-right font-mono text-xs">
                  <span className="text-white font-bold">{max}°</span>
                  <span className="text-slate-500 ml-1.5">{min}°</span>
                </div>

                <div className="text-slate-500 hover:text-slate-300">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 bg-slate-900/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-400" /> UV Index
                    </span>
                    <span className="text-sm font-bold text-white font-mono mt-1 block">
                      {day.uvIndexMax} / 11
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-cyan-400" /> Max Wind
                    </span>
                    <span className="text-sm font-bold text-white font-mono mt-1 block">
                      {day.windSpeedMax} km/h
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" /> Total Rain
                    </span>
                    <span className="text-sm font-bold text-white font-mono mt-1 block">
                      {day.precipitationSum} mm
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400">Sunrise / Sunset</span>
                    <span className="text-[11px] font-semibold text-slate-200 mt-1 block truncate">
                      🌅 {day.sunrise} • 🌇 {day.sunset}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
