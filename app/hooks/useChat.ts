'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
  fromHistory?: boolean;       // Loaded from DB (style differently)
  hasMarketContext?: boolean;  // AI answered with real market data
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: 'Xin chào! Tôi là **NHA.AI** 🏠\n\nTrợ lý thông minh của CẦN & CÓ. Hỏi tôi về giá nhà, xu hướng BĐS, hoặc tìm kiếm nhanh nhé!',
  timestamp: new Date(),
};

interface UseChatOptions {
  activeCategory?: string;  // Context from parent tab
}

export function useChat(options?: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  // Use ref to always have latest messages in async callbacks (avoids stale closure)
  const messagesRef = useRef<ChatMessage[]>([WELCOME_MESSAGE]);

  const syncMessages = useCallback((updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setMessages((prev) => {
      const next = updater(prev);
      messagesRef.current = next;
      return next;
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 100);
  }, []);

  // ── Load chat history on mount ──────────────────────────────
  useEffect(() => {
    // Skip if dev tools double-invoke
    if (hasLoadedHistory) return;

    const loadHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await fetch('/api/chat/history?limit=30');
        if (!res.ok) {
          // 401 = not logged in → silent, expected
          if (res.status !== 401) {
            console.warn('[useChat] History load failed:', res.status);
          }
          return;
        }

        const data = await res.json();
        if (!data.success || !data.data.messages.length) return;

        const historyMsgs: ChatMessage[] = data.data.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          text: m.text,
          timestamp: new Date(m.createdAt),
          fromHistory: true,
          hasMarketContext: m.hasMarketContext,
        }));

        // Prepend history before welcome message
        syncMessages(() => [...historyMsgs, WELCOME_MESSAGE]);
        scrollToBottom();
      } catch {
        // Network error — silent, don't break chat
      } finally {
        setIsLoadingHistory(false);
        setHasLoadedHistory(true);
      }
    };

    loadHistory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send a message ──────────────────────────────────────────
  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: text.trim(),
        timestamp: new Date(),
      };

      syncMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      scrollToBottom();

      const fetchAiResponse = async () => {
        try {
          // Use ref to get latest messages (no stale closure issue)
          const currentMessages = messagesRef.current
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role, text: m.text }));

          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: currentMessages,
              activeCategory: options?.activeCategory || 'real_estate',
            }),
          });

          const data = await res.json();

          if (!data.success && data.quotaExceeded) {
            // Quota hit — show friendly message
            syncMessages((prev) => [
              ...prev,
              {
                id: `bot-${Date.now()}`,
                role: 'bot',
                text: data.error,
                timestamp: new Date(),
              },
            ]);
            return;
          }

          const responseText = data.success
            ? data.data.text
            : 'Xin lỗi, tổng đài AI đang bận. Bạn thử lại sau nhé! 😅';

          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            role: 'bot',
            text: responseText,
            timestamp: new Date(),
            hasMarketContext: data.data?.hasMarketContext ?? false,
          };

          syncMessages((prev) => [...prev, botMsg]);
          setUnreadCount((c) => c + 1);
        } catch {
          syncMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              role: 'bot',
              text: 'Xin lỗi, hiện mạng đang chậm. Bạn thử lại sau nhé! 😅',
              timestamp: new Date(),
            },
          ]);
        } finally {
          setIsTyping(false);
          scrollToBottom();
        }
      };

      fetchAiResponse();
    },
    [options?.activeCategory, syncMessages, scrollToBottom]
  );

  const clearUnread = useCallback(() => setUnreadCount(0), []);
  const addUnread = useCallback(() => setUnreadCount((c) => c + 1), []);

  return {
    messages,
    isTyping,
    isLoadingHistory,
    unreadCount,
    sendMessage,
    clearUnread,
    addUnread,
    scrollRef,
    scrollToBottom,
  };
}
