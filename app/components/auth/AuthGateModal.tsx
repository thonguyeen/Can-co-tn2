'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X, Home, MapPin, Heart } from 'lucide-react';

// ─── Props ────────────────────────────────────────────────────────────────────

interface AuthGateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AuthGateModal({ isOpen, onClose }: AuthGateModalProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Đóng modal khi nhấn Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // Chặn scroll khi modal mở
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const redirectParam = `?redirect=${encodeURIComponent(pathname)}`;

    const handleLogin = () => {
        onClose();
        router.push(`/login${redirectParam}`);
    };

    const handleRegister = () => {
        onClose();
        router.push(`/register${redirectParam}`);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-gate-title"
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            >
                <div className="relative w-full max-w-sm bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-2xl shadow-violet-900/30 overflow-hidden">

                    {/* Violet glow accent */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        aria-label="Đóng"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Content */}
                    <div className="p-8 flex flex-col items-center text-center gap-6">

                        {/* Logo / Icon */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
                                    <Home className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-lg font-bold text-white tracking-tight">Cần &amp; Có</span>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="flex flex-col gap-2">
                            <h2 id="auth-gate-title" className="text-xl font-bold text-white">
                                Đăng nhập để tiếp tục
                            </h2>
                            <p className="text-sm text-white/50 leading-relaxed">
                                Tính năng này dành cho thành viên. <br />
                                Tham gia miễn phí để Thích, Lưu và nhắn tin!
                            </p>
                        </div>

                        {/* Benefit pills */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {[
                                { icon: Heart, label: 'Thích & match' },
                                { icon: MapPin, label: 'Xem bản đồ đầy đủ' },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                                    <Icon className="w-3 h-3 text-violet-400" />
                                    <span className="text-xs text-white/60">{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="w-full flex flex-col gap-3">
                            <button
                                onClick={handleLogin}
                                className="w-full py-3 px-6 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-violet-600/30 active:scale-[0.98]"
                            >
                                🔐 Đăng nhập
                            </button>
                            <button
                                onClick={handleRegister}
                                className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 active:scale-[0.98]"
                            >
                                📝 Tạo tài khoản mới
                            </button>
                        </div>

                        {/* Continue as guest */}
                        <button
                            onClick={onClose}
                            className="text-xs text-white/30 hover:text-white/50 transition-colors underline underline-offset-2"
                        >
                            Xem tiếp không đăng nhập →
                        </button>

                    </div>
                </div>
            </div>
        </>
    );
}
