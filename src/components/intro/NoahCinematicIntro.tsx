'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Radio } from 'lucide-react';

interface NoahCinematicIntroProps {
  onComplete: () => void;
}

export const NoahCinematicIntro: React.FC<NoahCinematicIntroProps> = ({ onComplete }) => {
  const [bootTextIndex, setBootTextIndex] = useState(0);
  const letters = ['N', 'O', 'A', 'H'];

  const bootMessages = [
    'INITIALIZING NATIONAL AWS NETWORK...',
    'ESTABLISHING SPATIAL CORRELATION MESH...',
    'CALIBRATING ANOMALY INTELLIGENCE ENGINE...',
    'NOAH ONLINE // LAUNCHING PORTAL'
  ];

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setBootTextIndex((prev) => (prev < bootMessages.length - 1 ? prev + 1 : prev));
    }, 450);

    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearInterval(msgInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F2C59] text-white overflow-hidden select-none"
    >
      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-5"
        >
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-white/40 shadow-lg">
            <Image
              src="/logo.png"
              alt="NOAH Logo"
              fill
              className="object-cover"
              priority
              sizes="80px"
            />
          </div>
        </motion.div>

        {/* Letter-by-Letter NOAH Reveal */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
          {letters.map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: 0.15 + index * 0.15,
                ease: 'easeOut'
              }}
              className="text-5xl sm:text-7xl font-bold tracking-wider text-white"
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Subtitle with Fade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.9 }}
          className="space-y-1 mb-6"
        >
          <p className="text-xs sm:text-sm tracking-wider text-sky-200 font-semibold uppercase">
            Networked Observation & Anomaly Intelligence
          </p>
          <p className="text-xs text-slate-300 font-sans">
            Making Weather Data Trustworthy.
          </p>
        </motion.div>

        {/* Telemetry Loading Bar & Live Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="w-64 sm:w-72 flex flex-col gap-2"
        >
          {/* Progress Bar */}
          <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.1, ease: 'easeInOut' }}
              className="h-full bg-sky-300"
            />
          </div>

          {/* Dynamic Technical Boot Feed */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-0.5">
            <span className="flex items-center gap-1.5 text-sky-200">
              <Radio className="w-3 h-3 text-sky-300" />
              {bootMessages[bootTextIndex]}
            </span>
            <span className="text-slate-400">IMD AWS</span>
          </div>
        </motion.div>

        {/* Skip button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.2 }}
          onClick={onComplete}
          className="mt-6 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          [ Skip ]
        </motion.button>
      </div>
    </motion.div>
  );
};
