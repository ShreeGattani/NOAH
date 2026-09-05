'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Radio,
  AlertTriangle,
  BarChart3,
  Settings,
  Activity,
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
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/40'
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
    <aside className="w-64 h-full bg-[#08111D] border-r border-[#1B2B3D] flex flex-col justify-between shrink-0 select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-[#1B2B3D]/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onCloseMobile}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow flex items-center justify-center">
              <div className="w-full h-full bg-[#08111D] rounded-[7px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-lg tracking-wider text-white">NOAH</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight">
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
                  flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                  ${
                    isActive
                      ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0D1826] border border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Footprint */}
      <div className="p-4 border-t border-[#1B2B3D]/80 bg-[#050B14]/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            System Status
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              API Connected
            </span>
            <span className="text-[10px] text-emerald-400">200 OK</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              ML Engine
            </span>
            <span className="text-[10px] text-cyan-400">ONLINE</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              WebSocket
            </span>
            <span className="text-[10px] text-cyan-400">LIVE (12ms)</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
