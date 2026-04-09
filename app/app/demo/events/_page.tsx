'use client'

import { useState } from 'react'
import { Calendar, MapPin, Clock, Users, Star, Check } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Tab = 'upcoming' | 'past' | 'interested'

const upcomingEvents = [
  { id: '1', title: 'AI & Machine Learning Meetup', date: 'Thứ 7, 25 tháng 1', time: '14:00 - 17:00', location: 'WeWork Bitexco, TP.HCM', attendees: 156, color: '#2D6A4F', interested: 320 },
  { id: '2', title: 'React Conf Vietnam 2026', date: 'Thứ 2, 3 tháng 2', time: '09:00 - 18:00', location: 'GEM Center, Quận 1', attendees: 450, color: '#1B4D3E', interested: 890 },
  { id: '3', title: 'Startup Pitch Night', date: 'Thứ 6, 7 tháng 2', time: '18:30 - 21:00', location: 'Dreamplex, Quận 3', attendees: 80, color: '#40916C', interested: 210 },
  { id: '4', title: 'Workshop: Thiết kế UI với Figma', date: 'Thứ 7, 15 tháng 2', time: '09:00 - 12:00', location: 'Online - Zoom', attendees: 200, color: '#52B788', interested: 560 },
  { id: '5', title: 'Tech Talk: Microservices at Scale', date: 'Thứ 4, 19 tháng 2', time: '19:00 - 21:00', location: 'Toong Coworking, Hà Nội', attendees: 95, color: '#74C69D', interested: 180 },
]

const pastEvents = [
  { id: 'p1', title: 'Year End Party - Tech Community', date: 'Thứ 7, 28 tháng 12, 2025', location: 'Riverside Palace, Quận 4', attendees: 300, color: '#2D6A4F' },
  { id: 'p2', title: 'Hackathon: Build with AI', date: 'Thứ 7-CN, 14-15 tháng 12, 2025', location: 'FPT Tower, Quận 7', attendees: 120, color: '#1B4D3E' },
  { id: 'p3', title: 'DevOps Day Vietnam', date: 'Thứ 6, 6 tháng 12, 2025', location: 'Adora Center, Quận Tân Bình', attendees: 250, color: '#40916C' },
]

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')
  const [joinedEvents, setJoinedEvents] = useState<Set<string>>(new Set())
  const [interestedEvents, setInterestedEvents] = useState<Set<string>>(new Set())

  const tabs = [
    { id: 'upcoming' as Tab, label: 'Sắp diễn ra' },
    { id: 'interested' as Tab, label: 'Quan tâm' },
    { id: 'past' as Tab, label: 'Đã qua' },
  ]

  const toggleJoin = (id: string) => {
    setJoinedEvents(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleInterested = (id: string) => {
    setInterestedEvents(prev => {
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
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Sự kiện</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-full text-[15px] font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-[#2D6A4F] text-white'
                : 'bg-secondary hover:bg-secondary/80'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upcoming Events */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:bg-secondary/50 transition-colors">
              <CardContent className="p-0 flex">
                <div className="w-[100px] shrink-0 flex flex-col items-center justify-center p-4" style={{ backgroundColor: event.color }}>
                  <span className="text-white/80 text-xs">{event.date.split(',')[0]}</span>
                  <span className="text-white text-2xl font-bold">{event.date.match(/\d+(?= tháng)/)?.[0]}</span>
                  <span className="text-white/80 text-xs">Th{event.date.match(/tháng (\d+)/)?.[1]}</span>
                </div>
                <div className="flex-1 p-4">
                  <p className="font-semibold text-[15px]">{event.title}</p>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{event.date} · {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span>{event.attendees} người tham gia · {event.interested} quan tâm</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className={cn(
                        'gap-1',
                        joinedEvents.has(event.id)
                          ? 'bg-secondary text-foreground hover:bg-secondary/80'
                          : 'bg-[#2D6A4F] hover:bg-[#1B4D3E]'
                      )}
                      onClick={() => toggleJoin(event.id)}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {joinedEvents.has(event.id) ? 'Đã tham gia' : 'Tham gia'}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1"
                      onClick={() => toggleInterested(event.id)}
                    >
                      <Star className={cn('w-3.5 h-3.5', interestedEvents.has(event.id) && 'fill-yellow-500 text-yellow-500')} />
                      Quan tâm
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Interested Events */}
      {activeTab === 'interested' && (
        <div>
          {interestedEvents.size === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>Bạn chưa quan tâm sự kiện nào</p>
                <p className="text-sm mt-1">Đánh dấu quan tâm ở tab &ldquo;Sắp diễn ra&rdquo; để lưu tại đây</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.filter(e => interestedEvents.has(e.id)).map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="text-white font-bold" style={{ backgroundColor: event.color }}>
                        {event.date.match(/\d+(?= tháng)/)?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px]">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.date} · {event.time}</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Past Events */}
      {activeTab === 'past' && (
        <div className="space-y-3">
          {pastEvents.map((event) => (
            <Card key={event.id} className="opacity-80">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="text-white font-bold" style={{ backgroundColor: event.color }}>
                    {event.date.match(/\d+(?=-| tháng)/)?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[15px]">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.date}</p>
                  <p className="text-sm text-muted-foreground">{event.location} · {event.attendees} người đã tham gia</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
