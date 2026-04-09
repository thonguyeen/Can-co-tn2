'use client';

import { useState, useEffect } from 'react';
import { X, Handshake } from 'lucide-react';

const STORAGE_KEY = 'canco-onboarding-dismissed';

export function OnboardingBanner() {
  const [isDismissed, setIsDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    setIsDismissed(dismissed === 'true');
  }, []);

  const dismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (isDismissed) return null;

  return (
    <div className="wm-panel mb-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-[var(--wm-primary)] to-emerald-500" />

      <button
        onClick={dismiss}
        className="absolute top-2 right-2 p-1 hover:bg-[var(--wm-surface-hover)] transition-colors z-10"
      >
        <X className="w-4 h-4 text-[var(--wm-text-muted)]" />
      </button>

      <div className="p-4 pt-5">
        <div className="flex items-center gap-2 mb-2">
          <Handshake className="w-5 h-5 text-[var(--wm-primary)]" />
          <h2 className="text-base font-bold text-[var(--wm-text)]">Chào mừng đến CẦN & CÓ</h2>
        </div>

        <p className="text-sm text-[var(--wm-text-secondary)] mb-3 leading-relaxed">
          Mạng xã hội nhu cầu. Đăng thứ bạn <strong className="text-red-500">CẦN</strong> hoặc{' '}
          <strong className="text-emerald-500">CÓ</strong>. AI tự động kết nối cung và cầu.
        </p>

        <div className="space-y-1.5 mb-4 text-xs text-[var(--wm-text-dim)]">
          <div className="flex items-start gap-2">
            <span className="text-[var(--wm-text-muted)] font-mono">1.</span>
            <span>Đăng nhu cầu bằng ngôn ngữ tự nhiên</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[var(--wm-text-muted)] font-mono">2.</span>
            <span>AI tự động phân tích và tìm người phù hợp</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[var(--wm-text-muted)] font-mono">3.</span>
            <span>Chat trực tiếp, không qua trung gian</span>
          </div>
        </div>

        <button
          onClick={dismiss}
          className="w-full py-2 text-xs font-semibold text-[var(--wm-primary)] border border-[var(--wm-primary)] hover:bg-[color-mix(in_srgb,var(--wm-primary)_5%,transparent)] transition-colors"
        >
          Đã hiểu, bắt đầu
        </button>
      </div>
    </div>
  );
}
