import React, { useState, useEffect, useCallback } from 'react';
import { 
  LocationData, 
  FullWeatherData, 
  TemperatureUnit 
} from './types';
import { fetchWeatherData, reverseGeocode } from './services/weatherApi';
import { Header } from './components/Header';
import { CurrentWeather } from './components/CurrentWeather';
import { HourlyForecastChart } from './components/HourlyForecastChart';
import { DailyForecast } from './components/DailyForecast';
import { WeatherMetricsGrid } from './components/WeatherMetricsGrid';
import { InteractiveRadarMap } from './components/InteractiveRadarMap';
import { AiWeatherAssistant } from './components/AiWeatherAssistant';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

const DEFAULT_LOCATION: LocationData = {
  id: 1,
  name: 'Tokyo',
  country: 'Japan',
  admin1: 'Tokyo',
  latitude: 35.6762,
  longitude: 139.6503,
  timezone: 'Asia/Tokyo',
};

const FAVORITES_STORAGE_KEY = 'atmosphere_ai_favorites_v1';
const UNIT_STORAGE_KEY = 'atmosphere_ai_unit_v1';

export default function App() {
  const [currentLocation, setCurrentLocation] = useState<LocationData>(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState<FullWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const [favorites, setFavorites] = useState<LocationData[]>([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Initialize saved favorites and unit from LocalStorage
  useEffect(() => {
    try {
      const savedUnit = localStorage.getItem(UNIT_STORAGE_KEY);
      if (savedUnit === 'fahrenheit' || savedUnit === 'celsius') {
        setUnit(savedUnit);
      }

      const savedFavs = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      } else {
        // Defaults
        setFavorites([
          DEFAULT_LOCATION,
          { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
          { name: 'New York', country: 'United States', admin1: 'NY', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
        ]);
      }
    } catch (e) {
      console.warn('Storage read error', e);
    }
  }, []);

  // Save favorites changes
  const saveFavorites = (newFavs: LocationData[]) => {
    setFavorites(newFavs);
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavs));
    } catch (e) {
      console.warn('Storage write error', e);
    }
  };

  const handleToggleFavorite = (loc: LocationData) => {
    const exists = favorites.some(
      f => f.name.toLowerCase() === loc.name.toLowerCase() && f.country === loc.country
    );
    if (exists) {
      saveFavorites(favorites.filter(
        f => !(f.name.toLowerCase() === loc.name.toLowerCase() && f.country === loc.country)
      ));
    } else {
      saveFavorites([...favorites, loc]);
    }
  };

  const isCurrentFavorite = favorites.some(
    f => f.name.toLowerCase() === currentLocation.name.toLowerCase() && f.country === currentLocation.country
  );

  const handleToggleUnit = () => {
    const nextUnit: TemperatureUnit = unit === 'celsius' ? 'fahrenheit' : 'celsius';
    setUnit(nextUnit);
    try {
      localStorage.setItem(UNIT_STORAGE_KEY, nextUnit);
    } catch (e) {
      console.warn('Unit storage error', e);
    }
  };

  // Weather Data loader
  const loadWeather = useCallback(async (loc: LocationData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(loc);
      setWeatherData(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to download updated forecast data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load weather when location updates
  useEffect(() => {
    loadWeather(currentLocation);
  }, [currentLocation, loadWeather]);

  // Geolocation trigger
  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const loc = await reverseGeocode(lat, lon);
          setCurrentLocation(loc);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied or timeout', err);
        setIsLocating(false);
        alert('Could not obtain device location. Please search for your city directly.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Navigation Bar */}
      <Header
        currentLocation={currentLocation}
        onSelectLocation={(loc) => setCurrentLocation(loc)}
        onUseGeolocation={handleUseGeolocation}
        isLocating={isLocating}
        unit={unit}
        onToggleUnit={handleToggleUnit}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={isCurrentFavorite}
        onOpenAiChat={() => setIsAiModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error ? (
          <div className="rounded-3xl bg-rose-500/10 border border-rose-500/30 p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Weather Feed Interruption</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => loadWeather(currentLocation)}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : isLoading && !weatherData ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Connecting to Meteorological Array</h3>
              <p className="text-xs text-slate-400 mt-1">Retrieving Doppler radar and atmospheric measurements...</p>
            </div>
          </div>
        ) : weatherData ? (
          <>
            {/* 1. Hero Current Weather Card */}
            <CurrentWeather
              weather={weatherData}
              unit={unit}
              onOpenAiBriefing={() => setIsAiModalOpen(true)}
            />

            {/* 2. Hourly Forecast Curve & Cards */}
            <HourlyForecastChart
              hourly={weatherData.hourly}
              unit={unit}
            />

            {/* 3. 10-Day Extended Forecast & Interactive Radar Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailyForecast
                daily={weatherData.daily}
                unit={unit}
              />
              <InteractiveRadarMap
                location={currentLocation}
                condition={weatherData.current.weatherText}
              />
            </div>

            {/* 4. Telemetry Metrics: Air Quality, Sun Arch, Wind Dynamics */}
            <WeatherMetricsGrid
              weather={weatherData}
            />
          </>
        ) : null}
      </main>

      {/* AI Meteorologist Dialog */}
      {weatherData && (
        <AiWeatherAssistant
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          weather={weatherData}
        />
      )}

      {/* Sleek Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950/60 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Atmosphere AI</span>
            <span>• Meteorological Intelligence & Precision Forecasting</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Open-Meteo & Gemini 2.5 Flash</span>
            <span>Updated {weatherData ? weatherData.updatedAt.toLocaleTimeString() : 'Live'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
