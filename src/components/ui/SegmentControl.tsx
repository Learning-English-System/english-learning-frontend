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
        "inline-flex items-center p-0.5 rounded-lg select-none",
        "bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08]",
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
              "relative px-3 py-1 text-xs font-medium rounded-md transition-colors duration-150 select-none",
              "flex items-center gap-1.5 z-10",
              isActive
                ? "text-[#121316] dark:text-[#f4f3f0] font-semibold"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
            )}
          >
            {isActive && (
              <motion.div
                layoutId={pillId}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                className="absolute inset-0 bg-white dark:bg-[#1a1b20] rounded-md shadow-xs border border-black/[0.06] dark:border-white/[0.08] -z-10"
              />
            )}
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
            {option.badge !== undefined && (
              <span
                className={cn(
                  "ml-0.5 px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold",
                  isActive
                    ? "bg-[#121316] text-[#faf9f5] dark:bg-[#f4f3f0] dark:text-[#121316]"
                    : "bg-black/[0.08] dark:bg-white/[0.1] text-stone-600 dark:text-stone-400"
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
