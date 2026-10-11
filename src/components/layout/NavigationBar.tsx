import React from 'react';
import { 
  Layers, 
  BookOpen, 
  Mic2, 
  FileText, 
  User, 
  Flame, 
  LogOut, 
  Sun, 
  Moon,
  Cpu
} from 'lucide-react';
import { SegmentControl, type SegmentOption } from '../ui/SegmentControl';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { LearnerProfile } from '../../services/api';

export type NavTab = 'review' | 'vocab' | 'ai' | 'test' | 'profile';

interface NavigationBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  profile: LearnerProfile | null;
  dueReviewsCount: number;
  streakDays?: number;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onTabChange,
  profile,
  dueReviewsCount,
  streakDays = 5,
  onLogout,
  isDark,
  onToggleTheme,
}) => {
  const navOptions: SegmentOption<NavTab>[] = [
    { value: 'review', label: 'Recall', icon: <Layers className="w-3.5 h-3.5" />, badge: dueReviewsCount > 0 ? dueReviewsCount : undefined },
    { value: 'vocab', label: 'Lexicon', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { value: 'ai', label: 'Neural Voice', icon: <Mic2 className="w-3.5 h-3.5" /> },
    { value: 'test', label: 'Assessments', icon: <FileText className="w-3.5 h-3.5" /> },
    { value: 'profile', label: 'Metrics', icon: <User className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full neural-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        
        {/* Modern Neural Identity */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#090a0c] text-white dark:bg-[#0e1013] flex items-center justify-center shadow-xs border border-black/10 dark:border-white/10">
            <Cpu className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
          </div>
          <div className="hidden sm:flex items-baseline gap-1.5 font-tech">
            <span className="font-bold text-sm tracking-tight text-[#090a0c] dark:text-[#f3f4f6]">
              SYNAPSE
            </span>
            <span className="text-[10px] font-mono tracking-widest text-cyan-600 dark:text-cyan-400 font-semibold">
              // NEURAL
            </span>
          </div>
        </div>

        {/* Center: Minimalist Segment Control */}
        <div className="overflow-x-auto no-scrollbar py-1">
          <SegmentControl
            options={navOptions}
            value={activeTab}
            onChange={onTabChange}
            pillId="main-nav-pill"
          />
        </div>

        {/* Right side stats & controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Neural Streak Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-mono font-medium">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{streakDays}d streak</span>
          </div>

          {/* CEFR Level Badge */}
          {profile && (
            <Badge variant="cyan" size="sm" className="hidden sm:inline-flex font-mono">
              CEFR {profile.targetCefrLevel || 'B2'}
            </Badge>
          )}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="Sign Out"
            className="w-8 h-8 hover:text-red-500"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>

      </div>
    </header>
  );
};
