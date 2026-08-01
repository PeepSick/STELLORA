import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const GlassCheckbox: React.FC<GlassCheckboxProps> = ({
  label,
  checked,
  onChange,
  className
}) => {
  return (
    <label className={cn("flex items-center gap-3 cursor-pointer group select-none", className)}>
      <div className="relative flex items-center justify-center w-5 h-5">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <motion.div
          className={cn(
            "absolute inset-0 rounded border transition-colors",
            checked ? "bg-stellaris-primary/20 border-stellaris-primary shadow-[0_0_10px_rgba(157,123,255,0.5)]" : "glass group-hover:border-white/30"
          )}
          initial={false}
          animate={{
            scale: checked ? [1, 0.9, 1] : 1,
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative z-10 text-white"
        >
          <Check size={14} strokeWidth={3} />
        </motion.div>
      </div>
      <span className={cn(
        "text-sm transition-colors",
        checked ? "text-stellaris-text" : "text-stellaris-muted group-hover:text-stellaris-text"
      )}>
        {label}
      </span>
    </label>
  );
};
