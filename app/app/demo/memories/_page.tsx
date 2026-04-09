'use client'

import { useState } from 'react'
import { Clock, ChevronLeft, ChevronRight, Share2, ThumbsUp, MessageCircle, Globe } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MOCK_USER } from '@/lib/mock/data'

const memories = [
  {
    id: '1',
    yearsAgo: 1,
    date: '24 tháng 1, 2025',
    content: 'Hôm nay được thăng chức rồi! Cảm ơn mọi người đã ủng hộ suốt thời gian qua. 🎉',
    likes: 156,
    comments: 42,
  },
  {
    id: '2',
    yearsAgo: 2,
    date: '24 tháng 1, 2024',
    content: 'Chuyến du lịch Đà Lạt tuyệt vời quá! Thời tiết mát mẻ, hoa nở khắp nơi. Nhất định sẽ quay lại. 🌸🏔️',
    likes: 234,
    comments: 67,
  },
  {
    id: '3',
    yearsAgo: 3,
    date: '24 tháng 1, 2023',
    content: 'Vừa hoàn thành khóa học Machine Learning trên Coursera! 3 tháng cố gắng cuối cùng cũng có kết quả. 📚🤖',
    likes: 89,
    comments: 23,
  },
  {
    id: '4',
    yearsAgo: 5,
    date: '24 tháng 1, 2021',
    content: 'Ngày đầu tiên đi làm ở công ty mới. Hồi hộp nhưng rất phấn khích! Chương mới bắt đầu. 💼✨',
    likes: 312,
    comments: 95,
  },
]

export default function MemoriesPage() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % memories.length)
  }

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length)
  }

  const currentMemory = memories[currentIndex]

  return (
    <div className="max-w-[700px] mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#2D6A4F] flex items-center justify-center">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Kỷ niệm</h1>
          <p className="text-sm text-muted-foreground">Nhìn lại những khoảnh khắc bạn đã chia sẻ</p>
        </div>
      </div>

      {/* Featured Memory */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-[#1B4D3E] to-[#2D6A4F] p-6 text-white">
          <p className="text-sm opacity-80">Ngày này</p>
          <p className="text-3xl font-bold">{currentMemory.yearsAgo} năm trước</p>
          <p className="text-sm opacity-80 mt-1">{currentMemory.date}</p>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-[#1B4D3E] text-white">
                {MOCK_USER.display_name?.[0] || 'D'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-[15px]">{MOCK_USER.display_name}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{currentMemory.date}</span>
                <span>·</span>
                <Globe className="w-3 h-3" />
              </div>
              <p className="mt-3 text-[15px]">{currentMemory.content}</p>
            </div>
          </div>

          {/* Engagement */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-[#2D6A4F] flex items-center justify-center">
                <ThumbsUp className="w-3 h-3 text-white" />
              </div>
              <span>{currentMemory.likes}</span>
            </div>
            <span>{currentMemory.comments} bình luận</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground">
              <Share2 className="w-4 h-4" />
              Chia sẻ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="secondary" size="sm" onClick={goPrev} className="gap-1">
          <ChevronLeft className="w-4 h-4" />
          Trước
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {memories.length} kỷ niệm
        </span>
        <Button variant="secondary" size="sm" onClick={goNext} className="gap-1">
          Sau
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* All Memories List */}
      <h2 className="text-lg font-semibold mb-4">Tất cả kỷ niệm ngày hôm nay</h2>
      <div className="space-y-3">
        {memories.map((memory, index) => (
          <Card
            key={memory.id}
            className={`cursor-pointer transition-colors ${index === currentIndex ? 'ring-2 ring-[#2D6A4F]' : 'hover:bg-secondary/50'}`}
            onClick={() => setCurrentIndex(index)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center shrink-0">
                <span className="text-[#2D6A4F] font-bold text-sm">{memory.yearsAgo} năm</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">{memory.date}</p>
                <p className="text-[15px] truncate">{memory.content}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
