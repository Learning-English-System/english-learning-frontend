import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  className,
  ...props
}) => {
  const variants = {
    blue: "bg-[#0071e3]/10 text-[#0071e3] dark:bg-[#2997ff]/15 dark:text-[#2997ff] border-[#0071e3]/20",
    green: "bg-[#34c759]/10 text-[#34c759] dark:bg-[#30d158]/15 dark:text-[#30d158] border-[#34c759]/20",
    orange: "bg-[#ff9500]/10 text-[#ff9500] dark:bg-[#ff9f0a]/15 dark:text-[#ff9f0a] border-[#ff9500]/20",
    purple: "bg-[#af52de]/10 text-[#af52de] dark:bg-[#bf5af2]/15 dark:text-[#bf5af2] border-[#af52de]/20",
    red: "bg-[#ff3b30]/10 text-[#ff3b30] dark:bg-[#ff453a]/15 dark:text-[#ff453a] border-[#ff3b30]/20",
    gray: "bg-black/[0.05] text-[#86868b] dark:bg-white/[0.08] dark:text-[#a1a1a6] border-black/[0.06] dark:border-white/[0.08]",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 tracking-tight font-semibold",
    md: "text-xs px-2.5 py-1 tracking-tight font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-medium select-none",
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
