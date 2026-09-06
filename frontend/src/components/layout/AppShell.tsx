'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { X } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#E2EDF8] text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full z-30 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 flex flex-col bg-[#0F2C59] border-r border-[#091E3A]">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area with Sky Blue Meteorological Atmosphere */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#E2EDF8]">
        {/* Subtle Atmospheric Background Image Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <Image
            src="/landing_bg.png"
            alt="Meteorological Atmosphere Background"
            fill
            priority
            quality={90}
            className="object-cover object-center opacity-30"
          />
          {/* Atmospheric sky wash for high contrast and data clarity */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#E2EDF8]/80 via-[#EBF3FB]/85 to-[#DDE9F6]/90" />
        </div>

        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative z-10">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
