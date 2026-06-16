'use client';

import { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  hideHeader?: boolean;
}

export default function MobileLayout({ 
  children, 
  showBottomNav = true,
  hideHeader = false 
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-white/5 flex flex-col">
      {!hideHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-white/10/60 safe-area-top">
          <div className="mx-auto max-w-lg flex items-center justify-between px-4 h-12">
            <h1 className="text-lg font-semibold text-white">Missed You</h1>
          </div>
        </header>
      )}
      
      <main className={`flex-1 ${!hideHeader ? 'pt-12' : ''} ${showBottomNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      
      {showBottomNav && <BottomNav />}
    </div>
  );
}
