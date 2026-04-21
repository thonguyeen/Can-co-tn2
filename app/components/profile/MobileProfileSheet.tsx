'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { X, FileText, Heart, Settings, LogOut, ChevronRight, Coins, Star } from 'lucide-react'
import Link from 'next/link'

interface MobileProfileSheetProps {
    open: boolean
    onClose: () => void
}

interface UserStats {
    totalPoints: number
    currentLevel: number
    currentStreak: number
}

export function MobileProfileSheet({ open, onClose }: MobileProfileSheetProps) {
    const { data: session, status } = useSession()
    const [stats, setStats] = useState<UserStats | null>(null)
    const startYRef = useRef<number>(0)

    // Fetch stats when opening
    useEffect(() => {
        if (!open || !session?.user) return
        const userId = (session.user as any).id
        if (!userId) return

        fetch(`/api/users/${userId}/stats`)
            .then(r => r.json())
            .then(data => setStats(data))
            .catch(() => setStats(null))
    }, [open, session])

    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    // Prevent body scroll when sheet is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [open])

    const user = session?.user as { id?: string; name?: string | null; email?: string | null; image?: string | null } | undefined
    const displayName = user?.name || 'Người dùng'
    const initials = displayName.charAt(0).toUpperCase()

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Bottom Sheet */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Trang cá nhân"
                className={`fixed bottom-0 inset-x-0 max-h-[88vh] bg-white rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.15)] z-50 flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-y-0' : 'translate-y-full'
                    }`}
                onTouchStart={e => { startYRef.current = e.touches[0].clientY }}
                onTouchEnd={e => {
                    const dy = e.changedTouches[0].clientY - startYRef.current
                    if (dy > 60) onClose()
                }}
            >
                {/* Handle + close */}
                <div className="flex items-center justify-center pt-3 pb-1 relative shrink-0">
                    <div className="w-10 h-1 bg-slate-200 rounded-full" />
                    <button
                        onClick={onClose}
                        className="absolute right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                        aria-label="Đóng"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto overscroll-contain pb-8">
                    {/* ── Guest State ── */}
                    {status === 'unauthenticated' && (
                        <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
                            <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center">
                                <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-slate-800">Chào mừng cạnh Cần & Có!</h3>
                                <p className="text-sm text-slate-500 mt-1">Đăng nhập để quản lý tin đăng và xem thông tin của bạn.</p>
                            </div>
                            <Link
                                href="/login"
                                onClick={onClose}
                                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                            >
                                Đăng nhập / Đăng ký
                            </Link>
                        </div>
                    )}

                    {/* ── Loading ── */}
                    {status === 'loading' && (
                        <div className="px-5 py-6 space-y-4 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-24" />
                                    <div className="h-3 bg-slate-200 rounded w-16" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Authenticated ── */}
                    {status === 'authenticated' && user && (
                        <div className="px-5 pt-4 pb-6 space-y-5">
                            {/* User Header */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-100 shrink-0">
                                    {user.image ? (
                                        <img src={user.image} alt={displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                                            {initials}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg font-bold text-slate-800 truncate">{displayName}</h2>
                                    <Link
                                        href="/profile"
                                        onClick={onClose}
                                        className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full hover:bg-indigo-100 transition-colors"
                                    >
                                        Xem trang cá nhân →
                                    </Link>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            {stats && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                                            <Coins size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-amber-600 font-bold uppercase tracking-wide">Ví xu</p>
                                            <p className="text-lg font-black text-amber-500 leading-tight">
                                                {(stats.totalPoints ?? 0).toLocaleString('vi')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                                            <Star size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-wide">Cấp độ</p>
                                            <p className="text-lg font-black text-indigo-500 leading-tight">
                                                Lv.{stats.currentLevel ?? 1}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Menu */}
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2">Quản lý</p>

                                <Link
                                    href="/my-intents"
                                    onClick={onClose}
                                    className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 text-slate-700 font-semibold text-sm">
                                        <span className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                            <FileText size={15} />
                                        </span>
                                        Tin đăng của tôi
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300" />
                                </Link>

                                <Link
                                    href="/saved"
                                    onClick={onClose}
                                    className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 text-slate-700 font-semibold text-sm">
                                        <span className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-pink-50 text-pink-600">
                                            <Heart size={15} />
                                        </span>
                                        Đã lưu
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300" />
                                </Link>

                                <Link
                                    href="/profile"
                                    onClick={onClose}
                                    className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 text-slate-700 font-semibold text-sm">
                                        <span className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                            <Settings size={15} />
                                        </span>
                                        Cài đặt tài khoản
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300" />
                                </Link>
                            </div>

                            {/* Logout */}
                            <div className="pt-2 border-t border-slate-100">
                                <button
                                    onClick={() => { onClose(); signOut({ callbackUrl: '/' }) }}
                                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-red-50 transition-colors text-red-600 font-bold text-sm cursor-pointer"
                                >
                                    <span className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-red-50">
                                        <LogOut size={15} />
                                    </span>
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
