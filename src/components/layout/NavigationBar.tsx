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
  Moon 
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
    { value: 'review', label: 'Review', icon: <Layers className="w-3.5 h-3.5" />, badge: dueReviewsCount > 0 ? dueReviewsCount : undefined },
    { value: 'vocab', label: 'Lexicon', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { value: 'ai', label: 'Tutor & Voice', icon: <Mic2 className="w-3.5 h-3.5" /> },
    { value: 'test', label: 'Assessments', icon: <FileText className="w-3.5 h-3.5" /> },
    { value: 'profile', label: 'Identity', icon: <User className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full craft-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        
        {/* Bespoke Heritage Brand Mark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#121316] text-[#faf9f5] dark:bg-[#f4f3f0] dark:text-[#121316] flex items-center justify-center font-serif text-base font-bold shadow-xs select-none border border-black/10 dark:border-white/10">
            Æ
          </div>
          <div className="hidden sm:flex items-baseline gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-[#121316] dark:text-[#f4f3f0]">
              Lexicon
            </span>
            <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] text-stone-600 dark:text-stone-400 border border-black/[0.06] dark:border-white/[0.08]">
              STUDIO
            </span>
          </div>
        </div>

        {/* Center: Tactile Segment Control */}
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
          
          {/* Streak Amber Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#b45309]/10 text-[#b45309] dark:text-[#f59e0b] border border-[#b45309]/20 text-xs font-medium">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{streakDays}d streak</span>
          </div>

          {/* CEFR Level Badge */}
          {profile && (
            <Badge variant="oxford" size="sm" className="hidden sm:inline-flex font-mono">
              {profile.targetCefrLevel || 'B2'}
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
            className="w-8 h-8 hover:text-[#b91c1c]"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>

      </div>
    </header>
  );
};
