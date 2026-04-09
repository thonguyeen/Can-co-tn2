'use client'

import { useState } from 'react'
import { Newspaper, Clock, TrendingUp, Globe, Bookmark, Share2, MoreHorizontal } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Category = 'all' | 'tech' | 'business' | 'science' | 'world'

const categories = [
  { id: 'all' as Category, label: 'Tất cả' },
  { id: 'tech' as Category, label: 'Công nghệ' },
  { id: 'business' as Category, label: 'Kinh doanh' },
  { id: 'science' as Category, label: 'Khoa học' },
  { id: 'world' as Category, label: 'Thế giới' },
]

const newsArticles = [
  { id: '1', category: 'tech' as Category, title: 'OpenAI ra mắt GPT-5 với khả năng suy luận vượt trội', source: 'TechVN', sourceColor: '#2D6A4F', time: '2 giờ trước', description: 'Model mới có context window 1 triệu token và cải thiện 40% khả năng reasoning so với GPT-4.', trending: true },
  { id: '2', category: 'business' as Category, title: 'VNG đạt định giá 2.5 tỷ USD, chuẩn bị IPO tại NASDAQ', source: 'Kinh Tế Số', sourceColor: '#1B4D3E', time: '4 giờ trước', description: 'Đây là bước tiến lớn cho hệ sinh thái tech Việt Nam với lead investor từ Singapore.', trending: true },
  { id: '3', category: 'science' as Category, title: 'Phát hiện hành tinh mới có thể hỗ trợ sự sống', source: 'Khoa Học VN', sourceColor: '#40916C', time: '6 giờ trước', description: 'NASA xác nhận hành tinh cách Trái Đất 40 năm ánh sáng có nước lỏng trên bề mặt.', trending: false },
  { id: '4', category: 'tech' as Category, title: 'Apple Vision Pro 2 sẽ ra mắt vào giữa năm 2026', source: 'Apple Insider VN', sourceColor: '#52B788', time: '8 giờ trước', description: 'Phiên bản mới nhẹ hơn 40%, chip M4 và giá thấp hơn $1000 so với bản đầu tiên.', trending: false },
  { id: '5', category: 'world' as Category, title: 'EU thông qua đạo luật AI toàn diện đầu tiên trên thế giới', source: 'Global News', sourceColor: '#74C69D', time: '10 giờ trước', description: 'Quy định mới yêu cầu minh bạch về training data và giới hạn sử dụng AI nhận diện khuôn mặt.', trending: true },
  { id: '6', category: 'business' as Category, title: 'Thị trường crypto hồi phục mạnh, Bitcoin vượt $60K', source: 'Crypto VN', sourceColor: '#2D6A4F', time: '12 giờ trước', description: 'Bitcoin tăng 15% trong tuần, Ethereum và Solana cũng ghi nhận đà tăng mạnh.', trending: false },
  { id: '7', category: 'tech' as Category, title: 'Samsung Galaxy S26 Ultra rò rỉ thiết kế hoàn toàn mới', source: 'Mobile World', sourceColor: '#1B4D3E', time: '14 giờ trước', description: 'Thiết kế camera mới, chip Snapdragon 8 Gen 4, và AI tích hợp sâu hơn.', trending: false },
  { id: '8', category: 'science' as Category, title: 'Vaccine mRNA mới có thể ngăn ngừa nhiều loại ung thư', source: 'Y Khoa VN', sourceColor: '#40916C', time: '1 ngày trước', description: 'Kết quả thử nghiệm lâm sàng giai đoạn 2 cho thấy hiệu quả 89% trên bệnh nhân.', trending: true },
]

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set())

  const filteredArticles = newsArticles.filter(
    a => activeCategory === 'all' || a.category === activeCategory
  )

  const trendingArticles = newsArticles.filter(a => a.trending)

  const toggleSave = (id: string) => {
    setSavedArticles(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="max-w-[900px] mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#2D6A4F] flex items-center justify-center">
          <Newspaper className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Bảng tin</h1>
      </div>

      {/* Trending Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-[#2D6A4F]" />
          <h2 className="font-semibold text-lg">Xu hướng</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {trendingArticles.slice(0, 4).map((article) => (
            <Card key={article.id} className="hover:bg-secondary/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="text-white text-[8px]" style={{ backgroundColor: article.sourceColor }}>
                      {article.source[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{article.source}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{article.time}</span>
                </div>
                <p className="font-semibold text-[15px] line-clamp-2">{article.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
              activeCategory === cat.id
                ? 'bg-[#2D6A4F] text-white'
                : 'bg-secondary hover:bg-secondary/80'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="hover:bg-secondary/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-white text-[10px]" style={{ backgroundColor: article.sourceColor }}>
                    {article.source[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{article.source}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{article.time}</span>
                {article.trending && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-[#2D6A4F] font-medium">
                    <TrendingUp className="w-3 h-3" />
                    Xu hướng
                  </span>
                )}
              </div>
              <p className="font-semibold text-[15px]">{article.title}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn('gap-1', savedArticles.has(article.id) && 'text-[#2D6A4F]')}
                  onClick={() => toggleSave(article.id)}
                >
                  <Bookmark className={cn('w-4 h-4', savedArticles.has(article.id) && 'fill-[#2D6A4F]')} />
                  {savedArticles.has(article.id) ? 'Đã lưu' : 'Lưu'}
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Share2 className="w-4 h-4" />
                  Chia sẻ
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 ml-auto">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
