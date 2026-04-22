'use client'

import { useState } from 'react'
import { Camera, ShieldCheck, Pencil, X, Check, Loader2 } from 'lucide-react'

interface ProfileHeaderProps {
    displayName: string
    avatarUrl: string | null
    initials: string
    tierLabel: string
    isVerified: boolean
    points: number
    level: number
    streak: number
    phone: string | null
}

export function ProfileHeader({
    displayName: initialDisplayName,
    avatarUrl,
    initials,
    tierLabel,
    isVerified,
    points,
    level,
    streak,
    phone: initialPhone,
}: ProfileHeaderProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [displayName, setDisplayName] = useState(initialDisplayName)
    const [phone, setPhone] = useState(initialPhone ?? '')
    const [draftName, setDraftName] = useState(initialDisplayName)
    const [draftPhone, setDraftPhone] = useState(initialPhone ?? '')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleEdit = () => {
        setDraftName(displayName)
        setDraftPhone(phone)
        setError(null)
        setIsEditing(true)
    }

    const handleCancel = () => {
        setIsEditing(false)
        setError(null)
    }

    const handleSave = async () => {
        if (!draftName.trim()) {
            setError('Tên hiển thị không được để trống')
            return
        }
        setSaving(true)
        setError(null)
        try {
            const res = await fetch('/api/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    displayName: draftName.trim(),
                    phone: draftPhone.trim() || null,
                }),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data?.error ?? 'Lưu thất bại')
            }
            setDisplayName(draftName.trim())
            setPhone(draftPhone.trim())
            setIsEditing(false)
        } catch (err: any) {
            setError(err.message ?? 'Có lỗi xảy ra, thử lại nhé')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="bg-white border-b border-slate-100">
            <div className="max-w-3xl mx-auto px-4 md:px-6">

                {/* Avatar row */}
                <div className="flex items-end justify-between -mt-12 md:-mt-14 pb-4">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-indigo-100">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-indigo-600 text-4xl font-black">
                                    {initials}
                                </div>
                            )}
                        </div>
                        {/* Camera overlay (future upload) */}
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera size={20} className="text-white" />
                        </div>
                    </div>

                    {/* Edit / Save / Cancel buttons (desktop) */}
                    <div className="hidden md:flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    <X size={15} /> Huỷ
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
                                >
                                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                    Lưu
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleEdit}
                                className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                <Pencil size={14} /> Chỉnh sửa hồ sơ
                            </button>
                        )}
                    </div>
                </div>

                {/* Name + info */}
                <div className="pb-5">
                    {isEditing ? (
                        /* ── Inline Edit Form ── */
                        <div className="space-y-3 mb-4 max-w-sm">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Tên hiển thị</label>
                                <input
                                    type="text"
                                    value={draftName}
                                    onChange={e => setDraftName(e.target.value)}
                                    placeholder="Nhập tên hiển thị..."
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={draftPhone}
                                    onChange={e => setDraftPhone(e.target.value)}
                                    placeholder="0901 234 567"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                />
                            </div>
                            {error && (
                                <p className="text-sm text-red-500 font-medium">{error}</p>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900">{displayName}</h1>
                            {isVerified && (
                                <ShieldCheck size={20} className="text-blue-500 shrink-0" />
                            )}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">{tierLabel}</span>
                        {isVerified && (
                            <span className="text-xs font-bold bg-green-50 text-green-700 px-3 py-1 rounded-full">
                                ✓ Đã xác minh
                            </span>
                        )}
                        {!isEditing && phone && (
                            <span className="text-xs text-slate-500">📞 {phone}</span>
                        )}
                    </div>

                    {/* Stats chips */}
                    <div className="flex flex-wrap gap-3 mt-4">
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2">
                            <span className="text-amber-500 text-lg">🪙</span>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wide">Xu tích lũy</p>
                                <p className="text-lg font-black text-amber-600 leading-none">{points.toLocaleString('vi')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-2">
                            <span className="text-indigo-500 text-lg">⚡</span>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-indigo-500 tracking-wide">Cấp độ</p>
                                <p className="text-lg font-black text-indigo-600 leading-none">Lv.{level}</p>
                            </div>
                        </div>
                        {streak > 0 && (
                            <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-2">
                                <span className="text-orange-500 text-lg">🔥</span>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-orange-500 tracking-wide">Streak</p>
                                    <p className="text-lg font-black text-orange-600 leading-none">{streak} ngày</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Edit / Save / Cancel buttons (mobile) */}
                    <div className="mt-4 flex md:hidden items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    <X size={15} /> Huỷ
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
                                >
                                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                    Lưu
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleEdit}
                                className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                <Pencil size={14} /> Chỉnh sửa hồ sơ
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
