import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[13px] font-medium text-[#86868b] dark:text-[#a1a1a6] mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-[#86868b] pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.12]",
            "px-3.5 py-2.5 text-[15px] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b]/60",
            "focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] focus:bg-white dark:focus:bg-black/50",
            "transition-all duration-200",
            icon && "pl-10",
            error && "border-[#ff3b30] focus:ring-[#ff3b30]/30 focus:border-[#ff3b30]",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-[#ff3b30] font-medium animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
