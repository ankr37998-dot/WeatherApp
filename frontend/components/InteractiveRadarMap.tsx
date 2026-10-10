import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Layers, Radio, Wind, CloudRain, Sun } from 'lucide-react';
import { LocationData } from '../types';

interface InteractiveRadarMapProps {
  location: LocationData;
  condition: string;
}

export const InteractiveRadarMap: React.FC<InteractiveRadarMapProps> = ({ location, condition }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [layer, setLayer] = useState<'radar' | 'wind' | 'clouds'>('radar');
  const [timeOffset, setTimeOffset] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    const particles: Array<{ x: number; y: number; speed: number; size: number; alpha: number }> = [];

    // Seed radar storm blobs
    const blobs = [
      { x: canvas.width * 0.45, y: canvas.height * 0.42, r: 45, intensity: 'heavy' },
      { x: canvas.width * 0.60, y: canvas.height * 0.55, r: 35, intensity: 'moderate' },
      { x: canvas.width * 0.35, y: canvas.height * 0.65, r: 25, intensity: 'light' },
    ];

    // Initialize wind particles
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 1 + Math.random() * 2,
        size: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.6,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Radar rings & crosshairs
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;

      [40, 80, 120, 160].forEach((r) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Axis lines
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, canvas.height);
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();

      if (layer === 'radar') {
        // Draw precipitation echo blobs
        blobs.forEach((blob) => {
          const grad = ctx.createRadialGradient(blob.x, blob.y, 4, blob.x, blob.y, blob.r);
          grad.addColorStop(0, 'rgba(6, 182, 212, 0.75)');
          grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.45)');
          grad.addColorStop(1, 'rgba(16, 185, 129, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Rotating radar beam sweep
        if (isPlaying) {
          angle += 0.025;
        }

        ctx.save();
        ctx.translate(centerX, centerY);
        const sweepGrad = ctx.createConicGradient(angle, 0, 0);
        sweepGrad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
        sweepGrad.addColorStop(0.12, 'rgba(6, 182, 212, 0.0)');
        sweepGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

        ctx.fillStyle = sweepGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 170, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (layer === 'wind') {
        // Flowing wind stream traces
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;

        particles.forEach((p) => {
          ctx.strokeStyle = `rgba(56, 189, 248, ${p.alpha})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speed * 4, p.y + p.speed * 2);
          ctx.stroke();

          if (isPlaying) {
            p.x += p.speed * 1.5;
            p.y += p.speed * 0.8;
            if (p.x > canvas.width) p.x = 0;
            if (p.y > canvas.height) p.y = 0;
          }
        });
      } else {
        // Cloud density layer
        const cloudGrad = ctx.createRadialGradient(centerX - 30, centerY - 20, 10, centerX, centerY, 150);
        cloudGrad.addColorStop(0, 'rgba(148, 163, 184, 0.4)');
        cloudGrad.addColorStop(0.7, 'rgba(71, 85, 105, 0.25)');
        cloudGrad.addColorStop(1, 'rgba(30, 41, 59, 0)');

        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center pin for location
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, layer]);

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-5 backdrop-blur-xl shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Atmospheric Radar & Satellite
            </h3>
            <span className="text-xs text-slate-400">
              Live Doppler sweep centered on {location.name}
            </span>
          </div>
        </div>

        {/* Layer Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setLayer('radar')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              layer === 'radar' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Precipitation</span>
          </button>
          <button
            onClick={() => setLayer('wind')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              layer === 'wind' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind Vectors</span>
          </button>
          <button
            onClick={() => setLayer('clouds')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              layer === 'clouds' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Clouds</span>
          </button>
        </div>
      </div>

      {/* Radar Canvas Viewport */}
      <div className="relative mt-4 bg-slate-950 rounded-2xl border border-slate-800/90 overflow-hidden flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          width={480}
          height={260}
          className="w-full max-w-xl h-64 object-contain"
        />

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] flex items-center gap-3">
          <span className="text-slate-400">Intensity:</span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Light
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Moderate
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Heavy
          </span>
        </div>

        {/* Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title={isPlaying ? 'Pause radar' : 'Play radar'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
