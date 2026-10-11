import React from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  Bot, 
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
    { value: 'review', label: 'SRS Review', icon: <Sparkles className="w-4 h-4" />, badge: dueReviewsCount > 0 ? dueReviewsCount : undefined },
    { value: 'vocab', label: 'Vocabulary', icon: <BookOpen className="w-4 h-4" /> },
    { value: 'ai', label: 'AI Tutor', icon: <Bot className="w-4 h-4" /> },
    { value: 'test', label: 'Assessments', icon: <FileText className="w-4 h-4" /> },
    { value: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full apple-glass border-b border-black/[0.06] dark:border-white/[0.08] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0071e3] to-[#5856d6] flex items-center justify-center text-white shadow-apple-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <span className="font-semibold text-[17px] tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              English Master
            </span>
            <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] dark:text-[#2997ff] font-medium">
              Pro
            </span>
          </div>
        </div>

        {/* Center: Apple Segmented Control */}
        <div className="overflow-x-auto no-scrollbar py-1">
          <SegmentControl
            options={navOptions}
            value={activeTab}
            onChange={onTabChange}
            pillId="main-nav-pill"
          />
        </div>

        {/* Right side stats & controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Streak Flame Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff9500]/10 text-[#ff9500] border border-[#ff9500]/20 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{streakDays} Days</span>
          </div>

          {/* CEFR Level Badge */}
          {profile && (
            <Badge variant="blue" size="sm" className="hidden sm:inline-flex">
              {profile.targetCefrLevel || 'B2'}
            </Badge>
          )}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="rounded-full w-8 h-8 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="Sign Out"
            className="rounded-full w-8 h-8 text-[#86868b] hover:text-[#ff3b30]"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

      </div>
    </header>
  );
};
