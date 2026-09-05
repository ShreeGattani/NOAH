import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'critical' | 'warning' | 'healthy' | 'accent';
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  interactive = false,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-sm',
    elevated: 'bg-white border-slate-200 text-slate-800 shadow-md',
    critical: 'bg-red-50/70 border-red-200 text-slate-900 shadow-sm',
    warning: 'bg-amber-50/70 border-amber-200 text-slate-900 shadow-sm',
    healthy: 'bg-emerald-50/70 border-emerald-200 text-slate-900 shadow-sm',
    accent: 'bg-blue-50/70 border-blue-200 text-slate-900 shadow-sm'
  };

  return (
    <motion.div
      className={`
        relative rounded-lg border transition-all duration-150
        ${variantStyles[variant]}
        ${interactive ? 'cursor-pointer hover:shadow-md' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};
