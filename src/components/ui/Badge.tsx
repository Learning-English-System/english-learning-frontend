import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray' | 'oxford' | 'amber' | 'sage' | 'stone';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'oxford',
  size = 'md',
  className,
  ...props
}) => {
  const variants = {
    // Heritage Oxford Navy
    oxford: "bg-[#1a365d]/10 text-[#1a365d] dark:bg-[#38bdf8]/15 dark:text-[#38bdf8] border-[#1a365d]/20",
    blue: "bg-[#1a365d]/10 text-[#1a365d] dark:bg-[#38bdf8]/15 dark:text-[#38bdf8] border-[#1a365d]/20",
    // Forest Sage
    sage: "bg-[#15803d]/10 text-[#15803d] dark:bg-[#4ade80]/15 dark:text-[#4ade80] border-[#15803d]/20",
    green: "bg-[#15803d]/10 text-[#15803d] dark:bg-[#4ade80]/15 dark:text-[#4ade80] border-[#15803d]/20",
    // Warm Cognac / Amber
    amber: "bg-[#b45309]/10 text-[#b45309] dark:bg-[#f59e0b]/15 dark:text-[#f59e0b] border-[#b45309]/20",
    orange: "bg-[#b45309]/10 text-[#b45309] dark:bg-[#f59e0b]/15 dark:text-[#f59e0b] border-[#b45309]/20",
    // Muted Plum / Velvet
    purple: "bg-[#581c87]/10 text-[#581c87] dark:bg-[#c084fc]/15 dark:text-[#c084fc] border-[#581c87]/20",
    // Warm Terracotta Rust
    red: "bg-[#b91c1c]/10 text-[#b91c1c] dark:bg-[#f87171]/15 dark:text-[#f87171] border-[#b91c1c]/20",
    // Neutral Stone
    stone: "bg-black/[0.04] text-stone-700 dark:bg-white/[0.07] dark:text-stone-300 border-black/[0.08] dark:border-white/[0.1]",
    gray: "bg-black/[0.04] text-stone-700 dark:bg-white/[0.07] dark:text-stone-300 border-black/[0.08] dark:border-white/[0.1]",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 font-medium rounded-md",
    md: "text-xs px-2.5 py-1 font-medium rounded-md",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center border select-none transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
