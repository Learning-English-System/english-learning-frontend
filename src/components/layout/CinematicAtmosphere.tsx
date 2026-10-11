import React from 'react';
import type { NavTab } from './NavigationBar';

interface CinematicAtmosphereProps {
  activeTab: NavTab;
  isDark: boolean;
}

export const CinematicAtmosphere: React.FC<CinematicAtmosphereProps> = ({ isDark }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Subtle architectural dot grid */}
      <div 
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
        style={{
          backgroundImage: `radial-gradient(var(--color-border) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Gentle center spotlight for reading comfort */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] pointer-events-none blur-3xl opacity-60 dark:opacity-30"
        style={{
          background: isDark 
            ? 'radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.05), transparent 70%)'
            : 'radial-gradient(ellipse at 50% 0%, rgba(180, 83, 9, 0.04), transparent 70%)'
        }}
      />
    </div>
  );
};
