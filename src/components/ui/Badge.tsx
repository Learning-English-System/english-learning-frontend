import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray' | 'oxford' | 'amber' | 'sage' | 'stone' | 'cyan';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  className,
  ...props
}) => {
  const variants = {
    // Electric Synapse Cyan
    cyan: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
    blue: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
    oxford: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
    // Synapse Emerald
    green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    sage: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    // Cognitive Amber
    orange: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    // Purple
    purple: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    // Red
    red: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    // Neutral Carbon
    stone: "bg-black/[0.04] dark:bg-white/[0.06] text-stone-600 dark:text-stone-300 border-black/[0.08] dark:border-white/[0.08]",
    gray: "bg-black/[0.04] dark:bg-white/[0.06] text-stone-600 dark:text-stone-300 border-black/[0.08] dark:border-white/[0.08]",
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
