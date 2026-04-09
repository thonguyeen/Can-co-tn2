import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CẦN & CÓ Demo — Xem thử mạng xã hội nhu cầu',
  description: 'Đăng thứ bạn cần hoặc có. AI tự động kết nối cung và cầu.',
};

export default function CanCoDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No DemoHeader here — parent /demo/layout.tsx already renders it.
  // Just apply WorldMonitor light theme to the content area.
  return (
    <div>
      <div className="max-w-2xl mx-auto px-3 py-4">
        {children}
      </div>
    </div>
  );
}
