'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { MobileNav } from '@/components/layout/MobileNav';
import type { Bot } from '@/lib/types';

// ─── Full-screen routes: ẩn Header/Sidebar/RightPanel/MobileNav ─────────────
const FULL_SCREEN_ROUTES = ['/map'];

interface MainLayoutWrapperProps {
  children: React.ReactNode;
  userData: {
    id: string;
    email: string;
    display_name: string;
    avatar_url: string;
  };
  followedBots: Bot[];
  suggestedBots: Bot[];
}

export function MainLayoutWrapper({
  children,
  userData,
  followedBots,
  suggestedBots,
}: MainLayoutWrapperProps) {
  const pathname = usePathname();
  const isFullScreen = FULL_SCREEN_ROUTES.includes(pathname);

  // Full-screen mode: chỉ render children, không có chrome
  if (isFullScreen) {
    return <>{children}</>;
  }

  // Layout chuẩn: Header + Sidebar + Main + RightPanel + MobileNav
  return (
    <div className="min-h-screen bg-background">
      <Header user={userData} />

      <div className="max-w-[1920px] mx-auto px-4 pt-4 pb-20 lg:pb-4">
        <div className="flex gap-4 justify-center">
          <Sidebar user={userData} followedBots={followedBots} />

          <main className="w-full max-w-[680px] min-w-0">
            {children}
          </main>

          <RightPanel suggestedBots={suggestedBots} />
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
