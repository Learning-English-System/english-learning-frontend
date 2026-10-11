import React, { useEffect, useRef } from 'react';
import type { NavTab } from './NavigationBar';

interface CinematicAtmosphereProps {
  activeTab: NavTab;
  isDark: boolean;
}

// Color palettes for each tab representing Apple product identities
const TAB_PALETTES: Record<NavTab, { primary: string; secondary: string; accent: string }> = {
  review: {
    primary: 'rgba(0, 113, 227, 0.22)',   // Apple Blue
    secondary: 'rgba(88, 86, 214, 0.18)', // Indigo
    accent: 'rgba(0, 199, 190, 0.15)',    // Cyan
  },
  vocab: {
    primary: 'rgba(52, 199, 89, 0.20)',   // Apple Emerald
    secondary: 'rgba(0, 113, 227, 0.16)', // Deep Azure
    accent: 'rgba(48, 209, 88, 0.12)',    // Mint
  },
  ai: {
    primary: 'rgba(175, 82, 222, 0.25)',  // Apple Siri Purple
    secondary: 'rgba(255, 45, 85, 0.18)', // Rose
    accent: 'rgba(88, 86, 214, 0.20)',    // Hologram Violet
  },
  test: {
    primary: 'rgba(255, 149, 0, 0.20)',   // Amber Gold
    secondary: 'rgba(255, 59, 48, 0.15)', // Coral
    accent: 'rgba(0, 113, 227, 0.15)',    // Sapphire
  },
  profile: {
    primary: 'rgba(0, 113, 227, 0.18)',   // Royal Blue
    secondary: 'rgba(52, 199, 89, 0.16)', // Emerald
    accent: 'rgba(255, 149, 0, 0.14)',    // Gold
  },
};

export const CinematicAtmosphere: React.FC<CinematicAtmosphereProps> = ({ activeTab, isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Dynamic floating luminous orbs
    const orbs = [
      { x: width * 0.25, y: height * 0.3, r: 350, vx: 0.25, vy: 0.15, phase: 0 },
      { x: width * 0.75, y: height * 0.4, r: 400, vx: -0.2, vy: 0.22, phase: 2 },
      { x: width * 0.5, y: height * 0.75, r: 450, vx: 0.18, vy: -0.25, phase: 4 },
    ];

    let t = 0;

    const render = () => {
      t += 0.008;
      ctx.clearRect(0, 0, width, height);

      const palette = TAB_PALETTES[activeTab] || TAB_PALETTES.review;
      const colors = [palette.primary, palette.secondary, palette.accent];

      // Render ultra-smooth gradient orbs with composite blending
      orbs.forEach((orb, i) => {
        orb.x += Math.sin(t + orb.phase) * orb.vx * 1.5;
        orb.y += Math.cos(t + orb.phase) * orb.vy * 1.5;

        const grad = ctx.createRadialGradient(
          orb.x,
          orb.y,
          orb.r * 0.05,
          orb.x,
          orb.y,
          orb.r
        );
        grad.addColorStop(0, colors[i % colors.length]);
        grad.addColorStop(0.6, colors[(i + 1) % colors.length].replace(/[\d\.]+\)$/, '0.08)'));
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeTab, isDark]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000">
      {/* Dynamic Fluid Canvas Atmosphere */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full filter blur-[80px] opacity-70 dark:opacity-85"
      />

      {/* Cinematic Vignette & Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.045] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.8) 100%)`,
        }}
      />

      {/* Subtle Apple Keynote Spotlight from top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[300px] bg-gradient-to-b from-white/10 dark:from-white/[0.05] to-transparent blur-3xl pointer-events-none" />
    </div>
  );
};
