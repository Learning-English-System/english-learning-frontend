import React from 'react';
import { 
  Layers, 
  BookOpen, 
  Mic, 
  FileCheck2, 
  User, 
  Flame, 
  LogOut, 
  Sun, 
  Moon,
  Sparkles
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
    { 
      value: 'review', 
      label: 'Ôn tập', 
      icon: <Layers className="w-4 h-4" />, 
      badge: dueReviewsCount > 0 ? dueReviewsCount : undefined 
    },
    { 
      value: 'vocab', 
      label: 'Từ vựng', 
      icon: <BookOpen className="w-4 h-4" /> 
    },
    { 
      value: 'ai', 
      label: 'Luyện nói AI', 
      icon: <Mic className="w-4 h-4" /> 
    },
    { 
      value: 'test', 
      label: 'Kiểm tra', 
      icon: <FileCheck2 className="w-4 h-4" /> 
    },
    { 
      value: 'profile', 
      label: 'Tiến độ', 
      icon: <User className="w-4 h-4" /> 
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full neural-nav transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-none">
              Synapse
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Smart English
            </span>
          </div>
        </div>

        {/* Center: Clean Segment Control */}
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
          
          {/* Streak Pill - Chữ số to rõ ràng */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/50 text-xs font-semibold">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="text-sm font-bold">{streakDays}</span>
            <span className="text-xs font-medium">ngày</span>
          </div>

          {/* CEFR Level Badge */}
          {profile && (
            <Badge variant="cyan" size="sm" className="hidden sm:inline-flex font-semibold">
              {profile.targetCefrLevel || 'B2'}
            </Badge>
          )}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-lg"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="Đăng xuất"
            className="w-9 h-9 rounded-lg text-slate-500 hover:text-red-500"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

      </div>
    </header>
  );
};
