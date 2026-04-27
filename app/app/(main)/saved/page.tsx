import { Bookmark } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { IntentCard } from '@/components/intent/IntentCard'
import { EmptyState } from '@/components/shared/EmptyState'
import type { MockIntent } from '@/lib/mock/intents'

export default async function SavedPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user) {
    return null
  }

  const userId = (user as any).id

  // Lấy danh sách intent đã lưu
  const savedIntents = await prisma.$queryRaw<any[]>`
    SELECT
      i.*,
      COALESCE(json_agg(img ORDER BY img.display_order) FILTER (WHERE img.id IS NOT NULL), '[]') AS images
    FROM intent_saves s
    JOIN intents i ON i.id = s.intent_id
    LEFT JOIN intent_images img ON img.intent_id = i.id
    WHERE s.user_id = ${userId}::uuid
    GROUP BY i.id
    ORDER BY s.created_at DESC
  `

  // Map DB row → MockIntent shape (IntentCard expects this interface)
  const intents: MockIntent[] = (savedIntents || []).map((row) => ({
    id: row.id,
    user_id: row.user_id ?? '',
    type: row.type as 'CAN' | 'CO',
    raw_text: row.raw_text ?? '',
    title: row.title ?? '',
    parsed_data: row.parsed_data ?? {},
    category: row.category ?? 'real_estate',
    subcategory: row.subcategory ?? null,
    price: row.price ? Number(row.price) : null,
    price_min: row.price_min ? Number(row.price_min) : null,
    price_max: row.price_max ? Number(row.price_max) : null,
    address: row.address ?? null,
    district: row.district ?? null,
    ward: row.ward ?? null,
    city: row.city ?? 'Hồ Chí Minh',
    lat: row.lat ? Number(row.lat) : null,
    lng: row.lng ? Number(row.lng) : null,
    trust_score: row.trust_score ?? 1,
    verification_level: row.verification_level ?? 'none',
    comment_count: row.comment_count ?? 0,
    match_count: row.match_count ?? 0,
    view_count: row.view_count ?? 0,
    reactions: { interested: 0, fair_price: 0, hot: 0 },
    status: row.status ?? 'active',
    expires_at: row.expires_at ?? null,
    created_at: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at ?? ''),
    updated_at: row.updated_at instanceof Date
      ? row.updated_at.toISOString()
      : String(row.updated_at ?? ''),
    images: Array.isArray(row.images)
      ? row.images.map((img: any) => ({ id: img.id, url: img.url, display_order: img.display_order ?? 0 }))
      : [],
    is_bot: row.is_bot ?? false,
    user: {
      id: row.user_id ?? '',
      name: row.user_name ?? 'Người dùng',
      avatar_url: null,
      trust_score: row.trust_score ?? 1,
      verification_level: row.verification_level ?? 'none',
    },
    bot_comment: null,
    bot_comments: [],
    latest_comment: null,
  }))

  return (
    <div className="pb-8 pt-4">
      <div className="mb-6 px-1">
        <div className="flex items-center gap-2 mb-2">
          <Bookmark className="w-4 h-4 text-amber-500 fill-current" />
          <span className="text-xs font-bold text-amber-500 tracking-widest uppercase">Đã lưu</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bài viết đã lưu</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          {intents.length > 0
            ? `${intents.length} bài đang được lưu`
            : 'Các tin Cần & Có bạn đã bấm lưu để xem lại sau'}
        </p>
      </div>

      {intents.length > 0 ? (
        <div className="space-y-3">
          {intents.map((intent) => (
            <IntentCard
              key={intent.id}
              intent={intent}
              compact
              basePath="/post"
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="Chưa có bài viết đã lưu"
          description="Nhấn nút 'Lưu' trên các tin Cần & Có để lưu lại xem sau."
          action={{
            label: 'Khám phá tin đăng',
            href: '/',
          }}
        />
      )}
    </div>
  )
}
