'use client';

import React from 'react';
import { DemoProvider } from '@/context/DemoContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <DemoProvider>{children}</DemoProvider>;
}
