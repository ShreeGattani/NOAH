'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Radio, MapPin, Activity } from 'lucide-react';
import { NoahCinematicIntro } from '@/components/intro/NoahCinematicIntro';
import { AnimatePresence, motion } from 'framer-motion';

export default function LandingPage() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {/* Letter-by-Letter Cinematic Intro Overlay */}
      <AnimatePresence>
        {showIntro && (
          <NoahCinematicIntro onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {/* Main Landing View */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between"
      >
        {/* Top Government-Style Header Bar */}
        <header className="bg-white border-b border-slate-200 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                <Image
                  src="/logo.png"
                  alt="NOAH Logo"
                  fill
                  className="object-cover"
                  priority
                  sizes="44px"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl text-slate-900 tracking-wide">NOAH</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800">
                    IMD AWS PORTAL
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-sans">
                  Networked Observation & Anomaly Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                SYSTEM OPERATIONAL
              </span>
              <Link
                href="/dashboard"
                className="text-xs font-bold px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Banner in Deep IMD Navy */}
        <section className="bg-[#0F2C59] text-white py-16 sm:py-20 px-4 sm:px-6 border-b border-[#091E3A]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-sky-200 mb-6 font-medium">
              <Activity className="w-3.5 h-3.5 text-sky-300" />
              <span>Automatic Weather Station (AWS) Real-Time Quality Control</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 font-sans leading-tight">
              Making Weather Data <span className="text-sky-300">Trustworthy.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto font-sans mb-8 leading-relaxed">
              Real-time monitoring and anomaly intelligence platform for meteorological networks.
              Instantly differentiate genuine regional weather fronts from isolated sensor hardware faults.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-7 py-3 rounded-md bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-sm tracking-wide transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4 text-slate-950" />
                <span>Enter Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/stations"
                className="w-full sm:w-auto px-6 py-3 rounded-md bg-white/10 hover:bg-white/15 border border-white/25 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4 text-sky-300" />
                <span>Explore 12 AWS Stations</span>
              </Link>
            </div>
          </div>
        </section>



        {/* Official Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            NOAH Platform &bull; Networked Observation & Anomaly Intelligence &bull; IMD-Aligned Meteorological System
          </div>
        </footer>
      </motion.div>
    </>
  );
}
