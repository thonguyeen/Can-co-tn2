'use client'

import { useState } from 'react'
import { Users, Globe, Lock, ThumbsUp, MessageCircle, Share2, Image, Video, Smile, MoreHorizontal, UserPlus, Bell, Search } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { MOCK_USER } from '@/lib/mock/data'

const groupData: Record<string, { name: string; color: string; members: string; privacy: string; description: string }> = {
  '1': { name: 'AI News Vietnam', color: '#2D6A4F', members: '12.5K', privacy: 'Công khai', description: 'Cộng đồng chia sẻ tin tức và kiến thức về AI tại Việt Nam' },
  '2': { name: 'Tech Enthusiasts', color: '#40916C', members: '8.2K', privacy: 'Công khai', description: 'Nhóm dành cho những người đam mê công nghệ' },
  '3': { name: 'Startup Community', color: '#52B788', members: '5.6K', privacy: 'Riêng tư', description: 'Cộng đồng khởi nghiệp, chia sẻ kinh nghiệm và kết nối' },
  '4': { name: 'Facebot Developers', color: '#74C69D', members: '3.4K', privacy: 'Công khai', description: 'Nhóm phát triển ứng dụng trên nền tảng Facebot' },
}

const groupPosts = [
  { id: '1', author: 'Nguyễn Minh Khoa', authorColor: '#2D6A4F', content: 'Có ai đang nghiên cứu về LLM fine-tuning không? Mình đang gặp vấn đề với LORA adapter trên model 7B. Đã thử nhiều learning rate nhưng loss không giảm. 🤔', time: '2 giờ trước', likes: 45, comments: 23 },
  { id: '2', author: 'Trần Thị Hoa', authorColor: '#40916C', content: '🎉 Chia sẻ với mọi người: Team mình vừa publish paper tại NeurIPS 2025! Chủ đề về efficient attention mechanism cho mobile devices. Link paper trong comment nhé!', time: '5 giờ trước', likes: 189, comments: 67 },
  { id: '3', author: 'Lê Đức Thành', authorColor: '#52B788', content: 'Tổng hợp tài liệu học AI/ML cho người mới bắt đầu:\n\n1. Fast.ai Course (miễn phí)\n2. Andrew Ng - Machine Learning Specialization\n3. Hugging Face NLP Course\n4. Papers With Code\n\nAi có tài liệu hay thì share thêm nhé! 📚', time: '8 giờ trước', likes: 312, comments: 89 },
  { id: '4', author: 'Phạm Văn Tuấn', authorColor: '#74C69D', content: 'Mọi người thấy Claude vs GPT-4 cái nào tốt hơn cho code generation? Mình đang evaluate cho project mới, cần model có khả năng reasoning tốt và ít hallucination.', time: '1 ngày trước', likes: 67, comments: 45 },
]

const members = [
  { id: '1', name: 'Nguyễn Minh Khoa', role: 'Admin', color: '#2D6A4F' },
  { id: '2', name: 'Trần Thị Hoa', role: 'Moderator', color: '#40916C' },
  { id: '3', name: 'Lê Đức Thành', role: 'Thành viên', color: '#52B788' },
  { id: '4', name: 'Phạm Văn Tuấn', role: 'Thành viên', color: '#74C69D' },
  { id: '5', name: 'Hoàng Thị Mai', role: 'Thành viên', color: '#2D6A4F' },
]

export default function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const [joined, setJoined] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  // Use a default group if id not found
  const group = groupData['1']

  return (
    <div className="max-w-[900px] mx-auto -mt-4">
      {/* Cover */}
      <div className="h-[200px] rounded-b-lg" style={{ backgroundColor: group.color, opacity: 0.8 }} />

      {/* Group Header */}
      <div className="px-4 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold mt-4">{group.name}</h1>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          {group.privacy === 'Công khai' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          <span>{group.privacy}</span>
          <span>·</span>
          <Users className="w-4 h-4" />
          <span>{group.members} thành viên</span>
        </div>
        <p className="text-[15px] text-muted-foreground mt-2">{group.description}</p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            className={cn(
              'gap-2',
              joined ? 'bg-secondary text-foreground hover:bg-secondary/80' : 'bg-[#2D6A4F] hover:bg-[#1B4D3E]'
            )}
            onClick={() => setJoined(!joined)}
          >
            {joined ? (
              <>
                <Users className="w-4 h-4" />
                Đã tham gia
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Tham gia nhóm
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setNotifications(!notifications)}
          >
            <Bell className={cn('w-4 h-4', notifications && 'text-[#2D6A4F]')} />
          </Button>
          <Button variant="secondary" className="gap-2 ml-auto">
            <UserPlus className="w-4 h-4" />
            Mời
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-4 py-4 px-4">
        {/* Main - Posts */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Create Post */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-[#1B4D3E] text-white">
                    {MOCK_USER.display_name?.[0] || 'D'}
                  </AvatarFallback>
                </Avatar>
                <button className="flex-1 h-10 px-4 rounded-full bg-secondary hover:bg-secondary/80 text-left text-muted-foreground text-[15px] transition-colors">
                  Viết gì đó cho nhóm...
                </button>
              </div>
              <div className="h-px bg-border my-3" />
              <div className="flex items-center">
                <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground">
                  <Image className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Ảnh/Video</span>
                </Button>
                <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground">
                  <Video className="w-5 h-5 text-red-500" />
                  <span className="text-sm">Video</span>
                </Button>
                <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground">
                  <Smile className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">Cảm xúc</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          {groupPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-white" style={{ backgroundColor: post.authorColor }}>
                        {post.author.split(' ').slice(-1)[0][0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-[15px]">{post.author}</p>
                      <p className="text-xs text-muted-foreground">{post.time}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                <p className="mt-3 text-[15px] whitespace-pre-line">{post.content}</p>

                {/* Engagement */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full bg-[#2D6A4F] flex items-center justify-center">
                      <ThumbsUp className="w-3 h-3 text-white" />
                    </div>
                    <span>{likedPosts.has(post.id) ? post.likes + 1 : post.likes}</span>
                  </div>
                  <span>{post.comments} bình luận</span>
                </div>

                {/* Actions */}
                <div className="flex items-center mt-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    className={cn('flex-1 gap-2', likedPosts.has(post.id) && 'text-[#2D6A4F]')}
                    onClick={() => setLikedPosts(prev => {
                      const next = new Set(prev)
                      if (next.has(post.id)) next.delete(post.id)
                      else next.add(post.id)
                      return next
                    })}
                  >
                    <ThumbsUp className={cn('w-5 h-5', likedPosts.has(post.id) && 'fill-[#2D6A4F]')} />
                    <span className="text-[15px]">Thích</span>
                  </Button>
                  <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-[15px]">Bình luận</span>
                  </Button>
                  <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground">
                    <Share2 className="w-5 h-5" />
                    <span className="text-[15px]">Chia sẻ</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right Sidebar - Members */}
        <div className="w-[280px] shrink-0 hidden lg:block">
          <Card className="sticky top-20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Thành viên</h3>
                <span className="text-sm text-muted-foreground">{group.members}</span>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Tìm thành viên" className="h-8 text-sm pl-8" />
              </div>

              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-secondary/50">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="text-white text-sm" style={{ backgroundColor: member.color }}>
                        {member.name.split(' ').slice(-1)[0][0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="ghost" className="w-full mt-2 text-[#2D6A4F] text-sm">
                Xem tất cả
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
