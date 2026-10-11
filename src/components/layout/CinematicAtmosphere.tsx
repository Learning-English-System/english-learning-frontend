import React from 'react';
import type { NavTab } from './NavigationBar';

interface CinematicAtmosphereProps {
  activeTab: NavTab;
  isDark: boolean;
}

export const CinematicAtmosphere: React.FC<CinematicAtmosphereProps> = ({ isDark }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Soft Ambient Light Orbs - Refined, serene, zero clutter */}
      <div 
        className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full blur-[120px] transition-opacity duration-1000 ${
          isDark 
            ? 'bg-gradient-to-b from-indigo-900/20 via-sky-900/10 to-transparent opacity-60' 
            : 'bg-gradient-to-b from-indigo-100/70 via-sky-100/40 to-transparent opacity-80'
        }`}
      />
      <div 
        className={`absolute top-1/3 -right-20 w-[500px] h-[500px] rounded-full blur-[140px] transition-opacity duration-1000 ${
          isDark 
            ? 'bg-emerald-950/15 opacity-40' 
            : 'bg-emerald-50/60 opacity-70'
        }`}
      />
    </div>
  );
};
