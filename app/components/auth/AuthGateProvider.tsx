'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { AuthGateModal } from '@/components/auth/AuthGateModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthGateContextValue {
    /** Thực hiện action nếu đã login, hiện popup nếu chưa */
    requireAuth: (action: () => void) => void;
    /** true nếu chưa đăng nhập */
    isGuest: boolean;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthGateProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isGuest = status !== 'loading' && !session;

    const requireAuth = useCallback(
        (action: () => void) => {
            if (session) {
                // Đã login → thực hiện action bình thường
                action();
            } else {
                // Chưa login → hiện modal
                setIsModalOpen(true);
            }
        },
        [session]
    );

    return (
        <AuthGateContext.Provider value={{ requireAuth, isGuest }}>
            {children}
            <AuthGateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </AuthGateContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuthGate(): AuthGateContextValue {
    const ctx = useContext(AuthGateContext);
    if (!ctx) {
        throw new Error('useAuthGate must be used inside <AuthGateProvider>');
    }
    return ctx;
}
