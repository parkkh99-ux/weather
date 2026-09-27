import React, { useEffect, useRef } from 'react';
import { WeatherIconType } from '../types/weather';
import { getBackgroundTheme } from '../utils/weatherUtils';

interface WeatherBackgroundProps {
  condition: string;
  icon: WeatherIconType;
  isDay: boolean;
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({
  condition,
  icon,
  isDay,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = getBackgroundTheme(condition, icon, isDay);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle setup
    const count = theme.particleType === 'rain' ? 120 : theme.particleType === 'snow' ? 70 : theme.particleType === 'stars' ? 80 : 0;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed:
        theme.particleType === 'rain'
          ? Math.random() * 8 + 12
          : theme.particleType === 'snow'
          ? Math.random() * 1.5 + 0.8
          : Math.random() * 0.2 + 0.05,
      length: theme.particleType === 'rain' ? Math.random() * 20 + 15 : Math.random() * 3 + 1,
      size: theme.particleType === 'snow' ? Math.random() * 3.5 + 1.5 : Math.random() * 2 + 1,
      opacity: Math.random() * 0.7 + 0.2,
      drift: theme.particleType === 'snow' ? (Math.random() - 0.5) * 0.8 : -1.5,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (theme.particleType === 'rain') {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (const p of particles) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.drift, p.y + p.length);
          p.y += p.speed;
          p.x += p.drift;
          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        }
        ctx.stroke();
      } else if (theme.particleType === 'snow') {
        ctx.fillStyle = 'rgba(240, 249, 255, 0.75)';
        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          p.y += p.speed;
          p.x += Math.sin(p.y * 0.01) * 0.5 + p.drift;
          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        }
      } else if (theme.particleType === 'stars') {
        for (const p of particles) {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * (0.6 + Math.sin(Date.now() * 0.002 * p.speed) * 0.4)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [theme.particleType]);

  return (
    <div className={`fixed inset-0 -z-10 bg-gradient-to-br ${theme.gradient} transition-colors duration-1000 overflow-hidden`}>
      {/* Ambient background glow effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[40rem] h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-80" />
    </div>
  );
};
