import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'secondary', size = 'md', icon, children, disabled, ...props }, ref) => {
    
    const baseStyles = "relative inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg overflow-hidden";
    
    const sizeStyles = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-6 py-3 gap-2.5"
    };

    const variantStyles = {
      primary: "bg-white/10 border border-stellaris-primary/50 text-white shadow-[0_0_15px_rgba(157,123,255,0.3)] hover:shadow-[0_0_25px_rgba(157,123,255,0.5)] hover:bg-white/15",
      secondary: "glass hover:bg-white/10 text-stellaris-text hover:text-white",
      ghost: "bg-transparent hover:bg-white/5 text-stellaris-text hover:text-white border border-transparent",
      danger: "bg-red-500/10 border border-red-500/30 text-red-200 hover:bg-red-500/20 hover:border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]"
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        disabled={disabled}
        {...props}
      >
        {variant === 'primary' && (
          <div className="absolute inset-0 bg-gradient-to-r from-stellaris-primary/20 to-stellaris-accent/20 opacity-0 hover:opacity-100 transition-opacity" />
        )}
        {icon && <span className="relative z-10 flex-shrink-0">{icon}</span>}
        {children && <span className="relative z-10">{children as React.ReactNode}</span>}
      </motion.button>
    );
  }
);
GlassButton.displayName = 'GlassButton';
