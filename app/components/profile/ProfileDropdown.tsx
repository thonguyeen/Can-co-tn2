'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { User, FileText, Heart, Gift, LogOut, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface ProfileDropdownProps {
    onOpenProfile?: () => void  // optional callback for mobile sheet or profile page
}

export function ProfileDropdown({ onOpenProfile }: ProfileDropdownProps) {
    const { data: session, status } = useSession()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // ── Guest State ──────────────────────────────────────────────
    if (status === 'unauthenticated' || !session?.user) {
        return (
            <Link
                href="/login"
                className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
                Đăng nhập
            </Link>
        )
    }

    const user = session.user as { id?: string; name?: string | null; email?: string | null; image?: string | null }
    const displayName = user.name || 'Người dùng'
    const initials = displayName.charAt(0).toUpperCase()

    // ── Loading ──────────────────────────────────────────────────
    if (status === 'loading') {
        return (
            <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse" />
        )
    }

    // ── Authenticated ─────────────────────────────────────────────
    return (
        <div className="relative" ref={ref}>
            {/* Avatar button */}
            <button
                onClick={() => setOpen(prev => !prev)}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all cursor-pointer"
                aria-label="Mở menu tài khoản"
                aria-expanded={open}
            >
                {user.image ? (
                    <img src={user.image} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-sm font-bold">
                        {initials}
                    </div>
                )}
            </button>

            {/* Dropdown Menu */}
            {open && (
                <div
                    className="absolute top-11 right-0 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.18)] border border-slate-100 overflow-hidden z-[60]"
                    role="menu"
                >
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/60">
                        <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    {/* Menu items */}
                    <div className="p-1.5 space-y-0.5">
                        <button
                            role="menuitem"
                            onClick={() => { setOpen(false); onOpenProfile?.() }}
                            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                        >
                            <span className="flex items-center gap-3"><User size={16} /> Hồ sơ của tôi</span>
                            <ChevronRight size={14} className="text-slate-300" />
                        </button>

                        <Link
                            role="menuitem"
                            href="/my-intents"
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        >
                            <span className="flex items-center gap-3"><FileText size={16} /> Tin đăng của tôi</span>
                            <ChevronRight size={14} className="text-slate-300" />
                        </Link>

                        <Link
                            role="menuitem"
                            href="/saved"
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        >
                            <span className="flex items-center gap-3"><Heart size={16} /> Đã lưu</span>
                            <ChevronRight size={14} className="text-slate-300" />
                        </Link>

                        <Link
                            role="menuitem"
                            href="/rewards"
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        >
                            <span className="flex items-center gap-3"><Gift size={16} /> Giới thiệu bạn bè</span>
                            <ChevronRight size={14} className="text-slate-300" />
                        </Link>
                    </div>

                    {/* Logout */}
                    <div className="p-1.5 border-t border-slate-100">
                        <button
                            role="menuitem"
                            onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }) }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        >
                            <LogOut size={16} /> Đăng xuất
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
