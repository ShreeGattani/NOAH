'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  precision?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  precision = 0,
  suffix = '',
  prefix = '',
  className = ''
}) => {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) =>
    precision > 0
      ? `${prefix}${current.toFixed(precision)}${suffix}`
      : `${prefix}${Math.round(current).toLocaleString()}${suffix}`
  );

  const [formatted, setFormatted] = useState<string>(
    `${prefix}${value.toFixed(precision)}${suffix}`
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return display.on('change', (latest) => {
      setFormatted(latest);
    });
  }, [display]);

  return <motion.span className={className}>{formatted}</motion.span>;
};
