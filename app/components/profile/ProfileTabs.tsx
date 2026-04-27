'use client'

import { useState, useEffect } from 'react'
import { FileText, Bookmark, Trophy, Clock } from 'lucide-react'
import { SocialPostCard } from '@/components/intent/SocialPostCard'
import type { MockIntent } from '@/lib/mock/intents'

interface Intent {
    id: string
    type: string
    title?: string
    district?: string
    ward?: string
    city?: string
    price?: string
    status?: string
    createdAt: string
    viewCount?: number
}

interface ProfileTabsProps {
    userId: string
    activeIntentsCount: number
}

const TABS = [
    { id: 'intents', label: 'Tin đang bán', icon: FileText },
    { id: 'saved', label: 'Đã lưu', icon: Bookmark },
    { id: 'history', label: 'Đã chốt', icon: Clock },
    { id: 'achievements', label: 'Thành tích', icon: Trophy },
]

function IntentCard({ intent }: { intent: Intent }) {
    const typeLabel = intent.type === 'CO' ? 'CÓ' : 'CẦN'
    const typeColor = intent.type === 'CO'
        ? 'bg-green-50 text-green-700'
        : 'bg-blue-50 text-blue-700'

    const priceDisplay = intent.price
        ? Number(intent.price).toLocaleString('vi-VN') + ' đ'
        : 'Thương lượng'

    const location = [intent.ward, intent.district, intent.city]
        .filter(Boolean).join(', ')

    return (
        <div className="flex gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            {/* Placeholder image */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <FileText size={24} className="text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${typeColor}`}>
                        {typeLabel}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0">
                        <Clock size={10} className="inline mr-1" />
                        {new Date(intent.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">
                    {intent.title || 'Tin đăng bất động sản'}
                </h3>
                {location && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{location}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-black text-indigo-600">{priceDisplay}</span>
                    {intent.viewCount != null && (
                        <span className="text-[11px] text-slate-400">{intent.viewCount} lượt xem</span>
                    )}
                </div>
            </div>
        </div>
    )
}

function EmptyState({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Icon size={28} className="text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-700">{title}</h3>
            <p className="text-sm text-slate-400 max-w-xs">{desc}</p>
        </div>
    )
}

export function ProfileTabs({ userId, activeIntentsCount }: ProfileTabsProps) {
    const [activeTab, setActiveTab] = useState('intents')
    const [intents, setIntents] = useState<Intent[] | null>(null)
    const [savedIntents, setSavedIntents] = useState<MockIntent[] | null>(null)
    const [loadingSaved, setLoadingSaved] = useState(false)
    const [loading, setLoading] = useState(false)

    const fetchIntents = async () => {
        if (loading) return
        setLoading(true)
        try {
            const res = await fetch(`/api/intents?userId=${userId}&limit=20`)
            const data = await res.json()
            setIntents(data.intents ?? data ?? [])
        } catch {
            setIntents([])
        } finally {
            setLoading(false)
        }
    }

    const fetchSaved = async () => {
        if (loadingSaved || savedIntents !== null) return
        setLoadingSaved(true)
        try {
            const res = await fetch('/api/intents/saved?full=true')
            const data = await res.json()
            setSavedIntents(data.intents ?? [])
        } catch {
            setSavedIntents([])
        } finally {
            setLoadingSaved(false)
        }
    }

    // Auto-load intents on mount (initial tab is 'intents')
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchIntents() }, [])

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId)
        if (tabId === 'intents' && intents === null) fetchIntents()
        if (tabId === 'saved') fetchSaved()
    }

    return (
        <div>
            {/* Tab Header */}
            <div className="border-b border-slate-200 mb-4">
                <div className="flex gap-1 overflow-x-auto no-scrollbar -mb-px">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 shrink-0 transition-colors ${activeTab === tab.id
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            <tab.icon size={15} />
                            {tab.label}
                            {tab.id === 'intents' && activeIntentsCount > 0 && (
                                <span className="ml-1 text-[11px] bg-indigo-100 text-indigo-600 font-bold px-1.5 py-0.5 rounded-full">
                                    {activeIntentsCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {/* Tin đang bán */}
                {activeTab === 'intents' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {loading && (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
                            ))
                        )}
                        {!loading && intents && intents.length === 0 && (
                            <div className="col-span-2">
                                <EmptyState
                                    icon={FileText}
                                    title="Chưa có tin đăng nào"
                                    desc="Đăng tin ngay để kết nối với người mua/thuê phù hợp!"
                                />
                            </div>
                        )}
                        {!loading && intents && intents.map(intent => (
                            <IntentCard key={intent.id} intent={intent} />
                        ))}
                        {intents === null && !loading && (
                            <div className="col-span-2">
                                <EmptyState icon={FileText} title="Đang tải..." desc="" />
                            </div>
                        )}
                    </div>
                )}

                {/* Đã lưu */}
                {activeTab === 'saved' && (
                    <div>
                        {loadingSaved && (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
                                ))}
                            </div>
                        )}
                        {!loadingSaved && savedIntents && savedIntents.length === 0 && (
                            <EmptyState
                                icon={Bookmark}
                                title="Chưa lưu tin nào"
                                desc="Bấm 🔖 vào bài đăng để lưu lại xem sau."
                            />
                        )}
                        {!loadingSaved && savedIntents && savedIntents.length > 0 && (
                            <div className="space-y-3">
                                {savedIntents.map((intent) => (
                                    <SocialPostCard
                                        key={intent.id}
                                        intent={intent}
                                        compact
                                        basePath=""
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Đã chốt */}
                {activeTab === 'history' && (
                    <EmptyState
                        icon={Clock}
                        title="Chưa có giao dịch đã chốt"
                        desc="Lịch sử giao dịch thành công của bạn sẽ xuất hiện ở đây."
                    />
                )}

                {/* Thành tích */}
                {activeTab === 'achievements' && (
                    <EmptyState
                        icon={Trophy}
                        title="Đang tích lũy thành tích"
                        desc="Tương tác thêm để mở khóa các huy hiệu đặc biệt!"
                    />
                )}
            </div>
        </div>
    )
}
