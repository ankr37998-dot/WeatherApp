import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Bookmark, 
  BookmarkCheck, 
  Thermometer, 
  Sparkles,
  Loader2,
  X
} from 'lucide-react';
import { LocationData, TemperatureUnit } from '../types';
import { searchLocations } from '../services/weatherApi';

interface HeaderProps {
  currentLocation: LocationData;
  onSelectLocation: (loc: LocationData) => void;
  onUseGeolocation: () => void;
  isLocating: boolean;
  unit: TemperatureUnit;
  onToggleUnit: () => void;
  favorites: LocationData[];
  onToggleFavorite: (loc: LocationData) => void;
  isFavorite: boolean;
  onOpenAiChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onSelectLocation,
  onUseGeolocation,
  isLocating,
  unit,
  onToggleUnit,
  favorites,
  onToggleFavorite,
  isFavorite,
  onOpenAiChat,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFavoritesMenu, setShowFavoritesMenu] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const found = await searchLocations(query);
        setResults(found);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowFavoritesMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: LocationData) => {
    onSelectLocation(loc);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Location Title */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-xl">
              🌤️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1">
                  Atmosphere <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/30">AI</span>
                </h1>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-medium text-slate-200 truncate max-w-[180px] sm:max-w-[260px]">
                  {currentLocation.name}{currentLocation.admin1 ? `, ${currentLocation.admin1}` : ''}
                </span>
                <span className="text-slate-500">({currentLocation.country})</span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Mobile) */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => onToggleFavorite(currentLocation)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400"
              title="Save to favorites"
            >
              {isFavorite ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button
              onClick={onToggleUnit}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200"
            >
              °{unit === 'celsius' ? 'C' : 'F'}
            </button>
          </div>
        </div>

        {/* Search Bar with Autocomplete */}
        <div ref={searchContainerRef} className="relative w-full md:max-w-md">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search city, capital, or region (e.g., Tokyo, Zurich)..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-10 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
            />
            {query ? (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 p-1 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : isSearching ? (
              <Loader2 className="absolute right-3.5 w-4 h-4 text-cyan-400 animate-spin" />
            ) : null}
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800/50">
              {results.length > 0 ? (
                results.map((loc, i) => (
                  <button
                    key={`${loc.latitude}-${loc.longitude}-${i}`}
                    onClick={() => handleSelect(loc)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-800/60 flex items-center justify-between text-sm transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                      <div>
                        <span className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {loc.name}
                        </span>
                        {loc.admin1 && <span className="text-xs text-slate-400 ml-1.5">({loc.admin1})</span>}
                        <span className="text-xs text-slate-500 ml-1.5 font-normal">{loc.country}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {loc.latitude.toFixed(1)}°, {loc.longitude.toFixed(1)}°
                    </span>
                  </button>
                ))
              ) : query.length >= 2 && !isSearching ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching cities found. Try another city name.
                </div>
              ) : (
                <div className="p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Popular Metropolises
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {[
                      { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
                      { name: 'New York', country: 'United States', admin1: 'NY', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
                      { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
                      { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
                    ].map((loc) => (
                      <button
                        key={loc.name}
                        onClick={() => handleSelect(loc)}
                        className="px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        {loc.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Tools: Geolocation, Favorites, Units, AI Aura */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Current GPS button */}
          <button
            onClick={onUseGeolocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 text-xs font-semibold transition-all disabled:opacity-50"
            title="Locate my position"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>Current GPS</span>
          </button>

          {/* Favorite Toggle for this city */}
          <button
            onClick={() => onToggleFavorite(currentLocation)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
              isFavorite
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-400 hover:border-slate-700'
            }`}
            title={isFavorite ? 'Saved in favorites' : 'Add to favorites'}
          >
            {isFavorite ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
            <span>{isFavorite ? 'Saved' : 'Save'}</span>
          </button>

          {/* Favorites List Modal / Dropdown */}
          {favorites.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowFavoritesMenu(!showFavoritesMenu)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Bookmarks</span>
                <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-cyan-400">
                  {favorites.length}
                </span>
              </button>

              {showFavoritesMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 mb-1">
                    Saved Locations
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {favorites.map((fav, i) => (
                      <button
                        key={`${fav.name}-${i}`}
                        onClick={() => {
                          onSelectLocation(fav);
                          setShowFavoritesMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors group"
                      >
                        <div className="truncate">
                          <div className="font-semibold group-hover:text-cyan-300">{fav.name}</div>
                          <div className="text-[10px] text-slate-400">{fav.country}</div>
                        </div>
                        <MapPin className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Unit Switcher */}
          <button
            onClick={onToggleUnit}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 transition-all hover:bg-slate-800/80"
            title="Switch Celsius / Fahrenheit"
          >
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            <span>°{unit === 'celsius' ? 'C' : 'F'}</span>
          </button>

          {/* AI Aura Button */}
          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Ask Aura AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
