import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Bar,
  ComposedChart
} from 'recharts';
import { HourlyForecastItem, TemperatureUnit } from '../types';
import { WeatherIcon } from './WeatherIcon';
import { Clock, Droplet, Wind } from 'lucide-react';

interface HourlyForecastChartProps {
  hourly: HourlyForecastItem[];
  unit: TemperatureUnit;
}

export const HourlyForecastChart: React.FC<HourlyForecastChartProps> = ({ hourly, unit }) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'cards'>('chart');

  const convert = (celsius: number) => {
    return unit === 'celsius' ? celsius : Math.round((celsius * 9) / 5 + 32);
  };

  const chartData = hourly.slice(0, 18).map((item) => ({
    time: item.displayTime,
    temp: convert(item.temperature),
    rainProb: item.precipitationProbability,
    precip: item.precipitation,
    wind: item.windSpeed,
    icon: item.weatherIcon,
  }));

  const minTemp = Math.min(...chartData.map(d => d.temp)) - 2;
  const maxTemp = Math.max(...chartData.map(d => d.temp)) + 2;

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Hourly Atmosphere (Next 24 Hours)
          </h3>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'chart'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Trend Curve
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'cards'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hourly Cards
          </button>
        </div>
      </div>

      {activeTab === 'chart' ? (
        <div className="mt-4">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis 
                  domain={[minTemp, maxTemp]} 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `${val}°`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950/95 border border-slate-700/90 rounded-2xl p-3 shadow-xl text-xs space-y-1">
                          <div className="font-bold text-white flex items-center justify-between gap-3">
                            <span>{data.time}</span>
                            <span className="text-cyan-400 text-sm font-mono">{data.temp}°{unit === 'celsius' ? 'C' : 'F'}</span>
                          </div>
                          <div className="text-slate-300 flex items-center gap-1.5 pt-1">
                            <Droplet className="w-3.5 h-3.5 text-blue-400" />
                            <span>Rain probability: <strong>{data.rainProb}%</strong></span>
                          </div>
                          <div className="text-slate-300 flex items-center gap-1.5">
                            <Wind className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Wind speed: <strong>{data.wind} km/h</strong></span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#06b6d4" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#tempGradient)" 
                />
                <Bar 
                  dataKey="rainProb" 
                  fill="#38bdf8" 
                  opacity={0.3} 
                  radius={[4, 4, 0, 0]} 
                  barSize={12}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-cyan-400 rounded-full" /> Temperature Curve
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-sky-400/50 rounded-sm" /> Precipitation Probability (%)
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-3 pt-1 scroll-smooth">
          {hourly.slice(0, 24).map((h, i) => (
            <div
              key={i}
              className={`shrink-0 w-24 p-3 rounded-2xl flex flex-col items-center justify-between text-center transition-all ${
                i === 0
                  ? 'bg-cyan-500/10 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950/60 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-semibold text-slate-300">
                {h.displayTime}
              </span>

              <div className="my-2">
                <WeatherIcon name={h.weatherIcon} className="w-7 h-7" />
              </div>

              <span className="text-base font-bold text-white font-mono">
                {convert(h.temperature)}°
              </span>

              <div className="mt-2 flex items-center gap-1 text-[11px] text-sky-400 font-medium">
                <Droplet className="w-3 h-3" />
                <span>{h.precipitationProbability}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
