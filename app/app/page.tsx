'use client';

import React, { useState, useCallback } from 'react';
import SidebarDesktop from '@/components/layout/SidebarDesktop';
import BottomNavMobile from '@/components/layout/BottomNavMobile';

// Tabs
import FeedTab from '@/components/tabs/FeedTab';
import MapRadarTab from '@/components/tabs/MapRadarTab';
import SwipeMatchTab from '@/components/tabs/SwipeMatchTab';
import ChatOATab from '@/components/tabs/ChatOATab';
import MiniAppsTab from '@/components/tabs/MiniAppsTab';

// Global
import GlobalChatbot from '@/components/chat/GlobalChatbot';

export default function SuperAppContainer() {
  const [activeTab, setActiveTab] = useState('swipe');
  const [matchedIntentId, setMatchedIntentId] = useState<string | null>(null);

  const handleNavigateToChat = useCallback((intentId: string) => {
    setMatchedIntentId(intentId);
    setActiveTab('chat');
  }, []);

  return (
    <div className="w-full h-screen flex bg-gray-50 overflow-hidden font-sans text-gray-900">
      
      {/* Cột trái: Desktop Sidebar */}
      <SidebarDesktop activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Rút ruột Component: Container Tabs chính */}
      <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden pb-[70px] md:pb-0">
        {activeTab === 'home' && <FeedTab />}
        {activeTab === 'map' && <MapRadarTab />}
        {activeTab === 'swipe' && <SwipeMatchTab onNavigateToChat={handleNavigateToChat} />}
        {activeTab === 'chat' && <ChatOATab matchedIntentId={matchedIntentId} />}
        {activeTab === 'apps' && <MiniAppsTab />}
      </main>

      {/* Cột dưới: Mobile Bottom Nav */}
      <BottomNavMobile activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 🤖 Global Chatbot FAB — hiện ở mọi tab */}
      <GlobalChatbot />
      
    </div>
  );
}
