import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  frosted?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  frosted = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        frosted ? "apple-glass" : "bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08]",
        "shadow-apple-md",
        hoverEffect && "hover:shadow-apple-lg hover:scale-[1.008] cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
