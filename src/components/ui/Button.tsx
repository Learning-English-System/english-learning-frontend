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
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg select-none transition-all duration-150 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500";

  const variants = {
    // High-contrast modern monochrome
    primary: "bg-[#090a0c] text-white hover:bg-[#1b1e24] dark:bg-[#f3f4f6] dark:text-[#090a0c] dark:hover:bg-white font-medium shadow-xs active:translate-y-[0.5px]",
    // Clean carbon surface with hairline border
    secondary: "bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-inherit border border-black/[0.08] dark:border-white/[0.08] active:translate-y-[0.5px]",
    // Electric Synapse Cyan Accent
    accent: "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-xs active:translate-y-[0.5px]",
    outline: "border border-black/[0.12] dark:border-white/[0.14] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-inherit",
    ghost: "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-stone-500 hover:text-stone-900 dark:hover:text-stone-100",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 active:translate-y-[0.5px]",
    pill: "rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-inherit border border-black/[0.08] dark:border-white/[0.08]",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5 font-medium",
    md: "text-sm px-3.5 py-2 gap-2",
    lg: "text-sm px-4.5 py-2.5 gap-2.5 font-medium",
    icon: "p-2 w-8 h-8 rounded-lg",
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
