'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

// Removed AI_RESPONSES array since we are using real API

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: 'Xin chào! Tôi là **NHA.AI** 🏠\n\nTrợ lý thông minh của CẦN & CÓ. Hỏi tôi về giá nhà, xu hướng BĐS, hoặc tìm kiếm nhanh nhé!',
  timestamp: new Date(),
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 100);
  }, []);



  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    scrollToBottom();

    // Call real API
    const fetchAiResponse = async () => {
      try {
        // We pass the conversation context so the AI knows what we are talking about
        // Since we just updated state, we can use the latest messages directly
        const currentMessages = [...messages, userMsg];
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: currentMessages })
        });
        
        const data = await res.json();
        const responseText = data.success ? data.data.text : "Xin lỗi, tổng đài AI đang bận. Bạn thử lại sau nhé! 😅";
        
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: responseText,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (error) {
        setMessages((prev) => [...prev, {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: "Xin lỗi, hiện mạng đang chậm. Bạn thử liên lạc lại sau nhé! 😅",
          timestamp: new Date(),
        }]);
      } finally {
        setIsTyping(false);
        scrollToBottom();
      }
    };
    
    fetchAiResponse();
  }, [messages, scrollToBottom]);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const addUnread = useCallback(() => {
    setUnreadCount((prev) => prev + 1);
  }, []);

  return {
    messages,
    isTyping,
    unreadCount,
    sendMessage,
    clearUnread,
    addUnread,
    scrollRef,
    scrollToBottom,
  };
}
