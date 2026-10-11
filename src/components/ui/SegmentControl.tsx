import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface SegmentControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  pillId?: string;
}

export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  className,
  pillId = 'segmented-pill'
}: SegmentControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center p-1 rounded-full",
        "bg-black/[0.05] dark:bg-white/[0.08] backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.06]",
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors duration-200 select-none",
              "flex items-center gap-1.5 z-10",
              isActive
                ? "text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold"
                : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
            )}
          >
            {isActive && (
              <motion.div
                layoutId={pillId}
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-white dark:bg-[#2c2c2e] rounded-full shadow-apple-sm border border-black/[0.04] dark:border-white/[0.08] -z-10"
              />
            )}
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
            {option.badge !== undefined && (
              <span
                className={cn(
                  "ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                  isActive
                    ? "bg-[#0071e3] text-white"
                    : "bg-black/[0.08] dark:bg-white/[0.1] text-[#86868b]"
                )}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
