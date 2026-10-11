import React, { useEffect, useRef } from 'react';
import type { NavTab } from './NavigationBar';

interface CinematicAtmosphereProps {
  activeTab: NavTab;
  isDark: boolean;
}

export const CinematicAtmosphere: React.FC<CinematicAtmosphereProps> = ({ isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Neural Synapse Nodes
    const nodeCount = Math.min(Math.floor((width * height) / 32000), 45);
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 1,
      pulse: Math.random() * Math.PI,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const nodeColor = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.25)';
      const connectionColor = isDark ? '0, 240, 255' : '2, 132, 199'; // Electric Cyan Synapse

      // Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        n1.x += n1.vx;
        n1.y += n1.vy;
        n1.pulse += 0.02;

        if (n1.x < 0 || n1.x > width) n1.vx *= -1;
        if (n1.y < 0 || n1.y > height) n1.vy *= -1;

        // Draw synaptic connection lines between nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 140;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (isDark ? 0.12 : 0.08);
            ctx.strokeStyle = `rgba(${connectionColor}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }

        // Draw node
        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(n1.x, n1.y, n1.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isDark]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Precision Neural Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-70 dark:opacity-80"
      />

      {/* Modern Hairline Engineering Grid */}
      <div 
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.15]"
        style={{
          backgroundImage: `linear-gradient(to right, var(--border-hairline) 1px, transparent 1px), linear-gradient(to bottom, var(--border-hairline) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Subtle Top Cognitive Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[280px] bg-gradient-to-b from-cyan-500/[0.04] dark:from-cyan-400/[0.04] to-transparent blur-3xl pointer-events-none" />
    </div>
  );
};
