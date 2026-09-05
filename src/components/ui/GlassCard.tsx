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
    default: 'bg-[#0D1826]/85 border-[#1B2B3D] text-slate-100 hover:border-[#2D4560]',
    elevated: 'bg-[#101D2D]/90 border-[#2D4560] text-slate-100 shadow-xl shadow-black/40',
    critical: 'bg-[#180F16]/90 border-red-500/40 text-slate-100 shadow-lg shadow-red-950/20',
    warning: 'bg-[#1A180E]/90 border-amber-500/40 text-slate-100 shadow-lg shadow-amber-950/20',
    healthy: 'bg-[#0A1A17]/90 border-emerald-500/30 text-slate-100 shadow-lg shadow-emerald-950/20',
    accent: 'bg-[#091B2A]/90 border-cyan-500/40 text-slate-100 shadow-lg shadow-cyan-950/30'
  };

  return (
    <motion.div
      className={`
        relative rounded-xl border backdrop-blur-md transition-all duration-200
        ${variantStyles[variant]}
        ${interactive ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-cyan-500/10' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Subtle corner technical markers */}
      <div className="pointer-events-none absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-sm opacity-60" />
      <div className="pointer-events-none absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-cyan-500/40 rounded-br-sm opacity-60" />
      {children}
    </motion.div>
  );
};
