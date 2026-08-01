import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassSliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
  className?: string;
}

export const GlassSlider: React.FC<GlassSliderProps> = ({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = (v) => v.toString(),
  className
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <div className="flex justify-between items-center text-xs text-stellaris-muted">
        <span className="font-medium tracking-wide">{label}</span>
        <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10 text-stellaris-text">
          {formatValue(value)}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        {/* Track Background */}
        <div className="absolute w-full h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
          {/* Active Track Fill */}
          <div 
            className="absolute h-full bg-gradient-to-r from-stellaris-primary to-stellaris-accent opacity-80"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Native Range Input overlaying the visual track */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="custom-range-slider absolute w-full h-full opacity-0 cursor-pointer z-10"
          style={{ opacity: 0.01 }} // Keeping it almost invisible but clickable, thumb styled in CSS
        />
        
        {/* Visual Thumb (controlled by value) */}
        <motion.div
          className="absolute w-4 h-4 bg-stellaris-primary rounded-full shadow-[0_0_10px_rgba(157,123,255,0.8)] border-2 border-white pointer-events-none z-0"
          style={{ left: `calc(${percentage}% - 8px)` }}
          layoutId={`slider-thumb-${label}`}
        />
      </div>
    </div>
  );
};
