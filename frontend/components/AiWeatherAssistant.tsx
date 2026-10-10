import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Shirt, 
  Compass, 
  Car, 
  HelpCircle, 
  RefreshCw,
  Loader2 
} from 'lucide-react';
import { FullWeatherData, AiBriefing } from '../types';
import { generateWeatherBriefing, askAuraMeteorologist } from '../services/geminiService';

interface AiWeatherAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  weather: FullWeatherData;
}

export const AiWeatherAssistant: React.FC<AiWeatherAssistantProps> = ({
  isOpen,
  onClose,
  weather,
}) => {
  const [briefing, setBriefing] = useState<AiBriefing | null>(null);
  const [isLoadingBriefing, setIsLoadingBriefing] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'aura'; text: string }>>([]);
  const [isAnswering, setIsAnswering] = useState(false);

  // Generate briefing upon first modal open
  useEffect(() => {
    if (isOpen && !briefing) {
      loadBriefing();
    }
  }, [isOpen, weather.location.name]);

  const loadBriefing = async () => {
    setIsLoadingBriefing(true);
    try {
      const res = await generateWeatherBriefing(weather);
      setBriefing(res);
    } finally {
      setIsLoadingBriefing(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || userQuery;
    if (!q.trim() || isAnswering) return;

    const userText = q.trim();
    setUserQuery('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsAnswering(true);

    try {
      const reply = await askAuraMeteorologist(userText, weather);
      setChatMessages(prev => [...prev, { sender: 'aura', text: reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'aura', text: 'Encountered an issue retrieving response. Please try again.' }]);
    } finally {
      setIsAnswering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Aura AI Meteorologist
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/30">
                  Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Personalized microclimate advisory for {weather.location.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Smart Briefing Highlights */}
          {isLoadingBriefing ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm text-slate-300 font-medium">
                Analyzing radar scans and synthesizing environmental advisory...
              </p>
            </div>
          ) : briefing ? (
            <div className="space-y-4">
              {/* Overview */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/20">
                <div className="flex items-center justify-between text-xs text-cyan-400 font-bold mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Chief Meteorologist Synthesis
                  </span>
                  <button 
                    onClick={loadBriefing}
                    className="text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {briefing.overview}
                </p>
              </div>

              {/* 3 Pillar Advice */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1.5">
                    <Shirt className="w-4 h-4" />
                    <span>What to Wear</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal">
                    {briefing.outfitRecommendation}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1.5">
                    <Compass className="w-4 h-4" />
                    <span>Outdoor Activities</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal">
                    {briefing.activityAdvice}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-1.5">
                    <Car className="w-4 h-4" />
                    <span>Commute Forecast</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal">
                    {briefing.commuteStatus}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Quick Query Suggestions */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ask Aura Any Question</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Will it rain during evening commute?",
                "Is today good for a 5k run?",
                "What's the best day this week for outdoor picnic?",
                "Do I need sunscreen today?",
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(suggestion)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 hover:text-cyan-300 transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Stream Area */}
          {chatMessages.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-cyan-600 text-white font-medium rounded-br-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-sm whitespace-pre-wrap'
                    }`}
                  >
                    {msg.sender === 'aura' && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 mb-1">
                        <Sparkles className="w-3 h-3" /> Aura AI
                      </div>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAnswering && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl p-3 text-xs flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Aura is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Query Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Ask anything about weather, outdoor plans, rain timing..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={!userQuery.trim() || isAnswering}
              className="p-2.5 rounded-2xl bg-cyan-500 text-white font-semibold hover:bg-cyan-400 disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
