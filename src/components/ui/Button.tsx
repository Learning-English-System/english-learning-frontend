import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'outline' | 'pill';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg select-none transition-all duration-150 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400";

  const variants = {
    // Solid deep ink with top highlight line (Linear / Stripe style)
    primary: "bg-[#121316] text-[#faf9f5] hover:bg-[#202227] dark:bg-[#f4f3f0] dark:text-[#121316] dark:hover:bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)] active:translate-y-[0.5px]",
    // Warm stone surface with subtle micro-border
    secondary: "bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-inherit border border-black/[0.08] dark:border-white/[0.1] active:translate-y-[0.5px]",
    // Warm Cognac / Amber accent
    accent: "bg-[#b45309] hover:bg-[#92400e] text-white shadow-sm active:translate-y-[0.5px]",
    outline: "border border-black/[0.14] dark:border-white/[0.18] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-inherit",
    ghost: "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100",
    danger: "bg-[#b91c1c] hover:bg-[#991b1b] text-white shadow-sm active:translate-y-[0.5px]",
    pill: "rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-inherit border border-black/[0.08] dark:border-white/[0.1]",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5 font-medium",
    md: "text-sm px-3.5 py-2 gap-2",
    lg: "text-[15px] px-5 py-2.5 gap-2.5",
    icon: "p-2 w-8 h-8 rounded-md",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
