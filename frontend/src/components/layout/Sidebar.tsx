'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Radio,
  AlertTriangle,
  BarChart3,
  Settings,
  ShieldCheck,
  Cpu,
  Waves
} from 'lucide-react';
import { useDemo } from '@/context/DemoContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const { anomalies } = useDemo();
  const activeAnomalyCount = anomalies.filter(a => a.status === 'ACTIVE').length;

  const navItems = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'Stations',
      href: '/stations',
      icon: Radio,
      badge: null
    },
    {
      name: 'Anomalies',
      href: '/anomalies',
      icon: AlertTriangle,
      badge: activeAnomalyCount > 0 ? `${activeAnomalyCount}` : null,
      badgeColor: 'bg-red-600 text-white font-bold'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      badge: null
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 h-full bg-[#0F2C59] border-r border-[#091E3A] flex flex-col justify-between shrink-0 select-none z-30 text-white">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onCloseMobile}>
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/20 shadow-md">
              <Image
                src="/logo.png"
                alt="NOAH Logo"
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-wider text-white">NOAH</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-900 border border-sky-600 text-sky-200 font-semibold">
                  IMD MET
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans tracking-tight">
                Network Intelligence
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'bg-white/15 text-white font-semibold border-l-4 border-sky-400 pl-2.5 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/10 border-l-4 border-transparent pl-2.5'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-sky-300' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Footprint */}
      <div className="p-4 border-t border-white/10 bg-[#091E3A]/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-300 font-bold">
            Telemetry Feed
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              API Gateway
            </span>
            <span className="text-[10px] text-emerald-300 font-mono">200 OK</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-300" />
              ML Engine
            </span>
            <span className="text-[10px] text-sky-300 font-mono">ONLINE</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-sky-300" />
              WebSocket
            </span>
            <span className="text-[10px] text-sky-300 font-mono">LIVE (12ms)</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
