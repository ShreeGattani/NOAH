'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Radio, MapPin } from 'lucide-react';

const TYPEWRITER_WORDS = [
  'Trustworthy.',
  'Accurate.',
  'Reliable.',
  'Actionable.',
];

function TypewriterHeadline() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullWord = TYPEWRITER_WORDS[wordIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayText.length < currentFullWord.length) {
        timer = setTimeout(() => {
          setDisplayText(currentFullWord.slice(0, displayText.length + 1));
        }, 90);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 45);
      } else {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % TYPEWRITER_WORDS.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, wordIndex]);

  return (
    <span className="text-blue-600 inline-flex items-center">
      <span>{displayText || '\u00A0'}</span>
      <span className="inline-block w-[3px] sm:w-[4px] md:w-[5px] h-[0.85em] bg-blue-600 ml-1.5 rounded-xs animate-typewriter-cursor align-middle" />
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen text-slate-900 flex flex-col justify-between relative overflow-hidden bg-[#E2EDF8]">
        {/* User-Uploaded Meteorological Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <Image
            src="/landing_bg.png"
            alt="Global Meteorological Observation Satellite & AWS Network"
            fill
            priority
            quality={95}
            className="object-cover object-center"
          />
          {/* Subtle atmospheric gradients for depth and contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-900/10 via-transparent to-[#071322]/60" />
        </div>

        {/* Top Navigation - Seamless Transparent on Background */}
        <header className="relative z-10 bg-transparent w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11">
                <Image
                  src="/noah_emblem.png"
                  alt="Noah's Ark Logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="44px"
                />
              </div>
              <span className="font-space-grotesk font-semibold text-2xl text-[#0B2144] tracking-tight">Noah&apos;s Ark</span>
            </div>

            <Link
              href="/dashboard"
              className="text-xs font-bold px-4 py-2 rounded-md bg-[#0F2C59] hover:bg-[#091D3C] text-white transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 flex-1 flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 font-sans leading-tight text-[#0B2144]">
              Making Weather Data <br className="hidden sm:inline" />
              <TypewriterHeadline />
            </h1>

            <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto font-sans mb-10 leading-relaxed font-medium">
              Real-time monitoring and anomaly intelligence platform for meteorological networks.
              Instantly differentiate genuine regional weather fronts from isolated sensor hardware faults.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-7 py-3 rounded-md bg-[#0F2C59] hover:bg-[#091D3C] text-white font-bold text-sm tracking-wide transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4 text-white" />
                <span>Enter Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/stations"
                className="w-full sm:w-auto px-6 py-3 rounded-md bg-white/70 hover:bg-white/95 border border-slate-300/80 text-slate-800 font-semibold text-sm transition-colors flex items-center justify-center gap-2 backdrop-blur-md shadow-xs"
              >
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Explore 12 AWS Stations</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Official Footer - Seamless on Background */}
        <footer className="relative z-10 bg-transparent py-4 text-center text-xs text-slate-300/80 font-mono">
          <div className="max-w-7xl mx-auto px-4">
            Noah&apos;s Ark &bull; Real-Time AWS Quality Control &bull; Meteorological Intelligence Grid
          </div>
        </footer>
    </div>
  );
}
