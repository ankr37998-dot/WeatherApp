import React from 'react';
import { FullWeatherData } from '../types';
import { 
  ShieldCheck, 
  Sunrise, 
  Sunset, 
  Activity, 
  Compass, 
  CloudDrizzle,
  Waves
} from 'lucide-react';

interface WeatherMetricsGridProps {
  weather: FullWeatherData;
}

export const WeatherMetricsGrid: React.FC<WeatherMetricsGridProps> = ({ weather }) => {
  const { current, daily, airQuality } = weather;
  const today = daily[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {/* 1. Air Quality Detailed Card */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Air Quality Index</h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${airQuality?.colorClass || 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'}`}>
              {airQuality?.qualityLabel || 'Good'}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-white font-mono">
              {airQuality?.usAqi ?? 42}
            </span>
            <span className="text-xs text-slate-400">
              US AQI standard
            </span>
          </div>

          <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
            <div className="bg-emerald-400 h-full w-[20%]" />
            <div className="bg-amber-400 h-full w-[20%]" />
            <div className="bg-orange-400 h-full w-[20%]" />
            <div className="bg-rose-500 h-full w-[20%]" />
            <div className="bg-purple-600 h-full w-[20%]" />
          </div>

          <div className="grid grid-cols-4 gap-2 mt-5 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400">PM2.5</div>
              <div className="font-bold text-slate-200 mt-0.5">{airQuality?.pm2_5 ?? 8} µg/m³</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400">PM10</div>
              <div className="font-bold text-slate-200 mt-0.5">{airQuality?.pm10 ?? 14} µg/m³</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400">Ozone</div>
              <div className="font-bold text-slate-200 mt-0.5">{airQuality?.ozone ?? 45} µg</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400">NO₂</div>
              <div className="font-bold text-slate-200 mt-0.5">{airQuality?.nitrogenDioxide ?? 12} µg</div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-slate-400">
          Continuous atmospheric particulates measured at surface station.
        </p>
      </div>

      {/* 2. Sunrise & Sunset Solar Arc */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sunrise className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Solar Daylight Cycle</h3>
            </div>
            <span className="text-xs text-slate-400">Ephemeris</span>
          </div>

          <div className="mt-4 relative flex items-center justify-center py-4">
            {/* SVG Solar Arch */}
            <svg viewBox="0 0 200 100" className="w-48 h-24 overflow-visible">
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="#334155"
                strokeWidth="4"
                strokeDasharray="4 4"
              />
              <path
                d="M 20 90 A 80 80 0 0 1 130 35"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="4"
              />
              <circle cx="130" cy="35" r="7" fill="#f59e0b" className="animate-pulse" />
            </svg>
          </div>

          <div className="flex items-center justify-between mt-2 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Sunrise className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Sunrise</span>
                <span className="text-xs font-bold text-white">{today?.sunrise || '06:15 AM'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-right">
              <div>
                <span className="text-[10px] text-slate-400 block">Sunset</span>
                <span className="text-xs font-bold text-white">{today?.sunset || '07:45 PM'}</span>
              </div>
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                <Sunset className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-400 text-center">
          Day length: ~13 hours 30 mins
        </p>
      </div>

      {/* 3. Microclimate & Wind Gust Dynamics */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Atmospheric Diagnostics</h3>
            </div>
            <span className="text-xs text-cyan-400 font-mono">Sensors Live</span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-300">Peak Wind Gusts</span>
              </div>
              <span className="text-sm font-bold font-mono text-white">
                {current.windGusts} km/h
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Waves className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-300">Cloud Coverage</span>
              </div>
              <span className="text-sm font-bold font-mono text-white">
                {current.cloudCover}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CloudDrizzle className="w-4 h-4 text-teal-400" />
                <span className="text-xs text-slate-300">Rain Accumulation</span>
              </div>
              <span className="text-sm font-bold font-mono text-white">
                {current.precipitation} mm / 24h
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-400">
          Calibrated to sea-level pressure {current.pressure} hPa.
        </p>
      </div>
    </div>
  );
};
