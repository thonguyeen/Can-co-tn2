'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, Send, ThumbsUp, Smile, Image, Info, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { BottomNav } from '@/components/intent/BottomNav';

// CẦN & CÓ conversations with intent context
const conversations = [
  {
    id: 'c1',
    name: 'Anh Khoa',
    color: '#2D6A4F',
    intent: { type: 'CO' as const, title: 'Bán Vinhomes Q7 3.5 tỷ' },
    lastMessage: 'Dạ anh có thể xem nhà chiều nay được không?',
    time: '5 phút',
    unread: 2,
  },
  {
    id: 'c2',
    name: 'Hồng Nhung',
    color: '#1B4D3E',
    intent: { type: 'CAN' as const, title: 'Tìm studio Thủ Đức' },
    lastMessage: 'Cảm ơn bạn đã phản hồi nhanh!',
    time: '1 giờ',
    unread: 0,
  },
  {
    id: 'c3',
    name: 'Bác Hùng',
    color: '#40916C',
    intent: { type: 'CO' as const, title: 'Bán nhà phố Gò Vấp 5.2 tỷ' },
    lastMessage: 'Nhà có hẻm xe hơi rộng 6m bạn nhé',
    time: '3 giờ',
    unread: 1,
  },
  {
    id: 'c4',
    name: 'Thảo Vy',
    color: '#52B788',
    intent: { type: 'CO' as const, title: 'Cho thuê Masteri 2PN 18tr' },
    lastMessage: 'Hợp đồng tối thiểu 6 tháng ạ',
    time: '1 ngày',
    unread: 0,
  },
  { id: 'c5', name: 'Đặng Minh Đức', color: '#2D6A4F', intent: { type: 'CO' as const, title: 'Bán Sunrise City Q7 6.5 tỷ' }, lastMessage: 'Giá cuối 6.3 tỷ bạn, chốt nhanh giảm thêm', time: '2 giờ', unread: 1 },
  { id: 'c6', name: 'Phạm Hoàng Nam', color: '#1B4D3E', intent: { type: 'CAN' as const, title: 'Tìm nhà phố Bình Thạnh 4-6 tỷ' }, lastMessage: 'Mình có căn Nơ Trang Long, anh xem?', time: '5 giờ', unread: 0 },
  { id: 'c7', name: 'Trần Thanh Hằng', color: '#40916C', intent: { type: 'CO' as const, title: 'Bán Saigon Pearl 3PN 8.5 tỷ' }, lastMessage: 'Sổ hồng + công chứng sẵn sàng rồi ạ', time: '1 ngày', unread: 0 },
  { id: 'c8', name: 'Lê Quốc Bảo', color: '#52B788', intent: { type: 'CO' as const, title: 'Bán nhà Tân Bình 5.5 tỷ' }, lastMessage: 'Deal chốt rồi, cảm ơn bạn nhiều!', time: '2 ngày', unread: 0 },
  { id: 'c9', name: 'Nguyễn Thu Thủy', color: '#74C69D', intent: { type: 'CAN' as const, title: 'Thuê 1PN Bình Thạnh 6-10tr' }, lastMessage: 'Em dọn vào đầu tháng 4 được không?', time: '3 ngày', unread: 0 },
  { id: 'c10', name: 'Hồ Quang Minh', color: '#2D6A4F', intent: { type: 'CAN' as const, title: 'Tìm office Q1 cho startup' }, lastMessage: 'Phòng họp 8 người, phải có hệ thống AV', time: '4 ngày', unread: 0 },
  { id: 'c11', name: 'Võ Thị Hương', color: '#1B4D3E', intent: { type: 'CAN' as const, title: 'Thuê mặt bằng café Phú Nhuận' }, lastMessage: 'Mình sẽ đến xem chiều thứ 7 nha', time: '5 ngày', unread: 0 },
  { id: 'c12', name: 'Dương Thanh Sơn', color: '#40916C', intent: { type: 'CAN' as const, title: 'Đất nền Long An dưới 2 tỷ' }, lastMessage: 'Gửi mình sổ đỏ photo qua Zalo?', time: '1 tuần', unread: 0 },
  { id: 'c13', name: 'Phan Thị Mai', color: '#52B788', intent: { type: 'CAN' as const, title: 'Thuê căn hộ Phú Nhuận 2PN' }, lastMessage: 'Cảm ơn anh, em cần hỏi chồng đã', time: '1 tuần', unread: 0 },
  { id: 'c14', name: 'Đỗ Văn Hải', color: '#74C69D', intent: { type: 'CAN' as const, title: 'Nhà phố Gò Vấp 5-7 tỷ' }, lastMessage: 'Hẹn cuối tuần xem nhà nhé anh', time: '2 tuần', unread: 0 },
  { id: 'c15', name: 'Bùi Đức Trung', color: '#2D6A4F', intent: { type: 'CO' as const, title: 'Bán nhà Q3 mặt tiền 22 tỷ' }, lastMessage: 'Anh cần xem thêm giấy tờ pháp lý', time: '2 tuần', unread: 0 },
];

const chatMessages: Record<string, Array<{ id: string; sender: 'me' | 'them'; text: string; time: string }>> = {
  c1: [
    { id: 'm1', sender: 'them', text: 'Chào bạn! Mình thấy bạn đang tìm căn hộ 2PN Q7, mình đang bán Vinhomes Q7 đúng nhu cầu.', time: '14:20' },
    { id: 'm2', sender: 'me', text: 'Chào anh! Căn này tầng mấy vậy anh? View hướng nào ạ?', time: '14:22' },
    { id: 'm3', sender: 'them', text: 'Tầng 18, view sông Sài Gòn hướng Đông Nam. Sáng mát, chiều không bị nắng.', time: '14:23' },
    { id: 'm4', sender: 'me', text: 'Nghe hấp dẫn quá! Phí quản lý hàng tháng bao nhiêu ạ?', time: '14:25' },
    { id: 'm5', sender: 'them', text: 'Phí QL khoảng 800K/tháng cho 75m². Bao gồm hồ bơi, gym, bảo vệ 24/7.', time: '14:26' },
    { id: 'm6', sender: 'me', text: 'Ok anh, em muốn đến xem nhà trực tiếp được không?', time: '14:28' },
    { id: 'm7', sender: 'them', text: 'Dạ anh có thể xem nhà chiều nay được không?', time: '14:30' },
  ],
  c2: [
    { id: 'm1', sender: 'me', text: 'Chào bạn, mình có studio gần ĐH Bách Khoa, 6 triệu/tháng, nội thất đầy đủ.', time: '09:00' },
    { id: 'm2', sender: 'them', text: 'Ồ hay quá! Diện tích bao nhiêu m² vậy ạ?', time: '09:05' },
    { id: 'm3', sender: 'me', text: '30m², có ban công nhỏ, gần chợ và trạm xe buýt.', time: '09:07' },
    { id: 'm4', sender: 'them', text: 'Cảm ơn bạn đã phản hồi nhanh!', time: '09:10' },
  ],
  c3: [
    { id: 'm1', sender: 'me', text: 'Chào bác, cháu quan tâm nhà phố Gò Vấp. Hẻm xe hơi vào được không ạ?', time: '08:00' },
    { id: 'm2', sender: 'them', text: 'Chào cháu! Hẻm rộng 6m, ô tô đậu thoải mái.', time: '08:15' },
    { id: 'm3', sender: 'them', text: 'Nhà có hẻm xe hơi rộng 6m bạn nhé', time: '08:16' },
  ],
  c5: [
    { id: 'm1', sender: 'me', text: 'Chào anh Đức, em quan tâm Sunrise City 3PN ạ.', time: '10:00' },
    { id: 'm2', sender: 'them', text: 'Chào bạn! Căn này tầng 25, view sông + công viên, 100m². Anh gửi ảnh nhé.', time: '10:05' },
    { id: 'm3', sender: 'me', text: 'Dạ anh gửi đi ạ. Giá 6.5 tỷ có TL không?', time: '10:08' },
    { id: 'm4', sender: 'them', text: 'Giá cuối 6.3 tỷ bạn. Đã có sổ hồng, xác thực GPS rồi.', time: '10:12' },
    { id: 'm5', sender: 'me', text: 'Em cần bàn với gia đình, cuối tuần phản hồi ạ.', time: '10:15' },
    { id: 'm6', sender: 'them', text: 'OK bạn. Cuối tuần có thể đến xem nhà trực tiếp nha.', time: '10:18' },
    { id: 'm7', sender: 'me', text: 'Dạ em sẽ đến xem T7 sáng. Gửi em địa chỉ cụ thể.', time: '10:20' },
    { id: 'm8', sender: 'them', text: 'Sunrise City, Nguyễn Hữu Thọ, Q7. Block A tầng 25. Anh đón bạn ở sảnh.', time: '10:22' },
    { id: 'm9', sender: 'me', text: 'OK anh, T7 9h sáng em đến. Cảm ơn anh.', time: '10:25' },
    { id: 'm10', sender: 'them', text: 'Giá cuối 6.3 tỷ bạn, chốt nhanh giảm thêm', time: '10:30' },
  ],
  c6: [
    { id: 'm1', sender: 'them', text: 'Chào anh, em có căn nhà phố Nơ Trang Long 4x14m, 3 tầng. Giá 5.8 tỷ.', time: '14:00' },
    { id: 'm2', sender: 'me', text: 'Gửi em ảnh nhà và sổ hồng photo?', time: '14:15' },
    { id: 'm3', sender: 'them', text: 'Dạ em gửi qua đây. Sổ hồng riêng, chính chủ.', time: '14:20' },
    { id: 'm4', sender: 'me', text: 'OK, mình sẽ đến xem. Cuối tuần này được không?', time: '14:30' },
    { id: 'm5', sender: 'them', text: 'Mình có căn Nơ Trang Long, anh xem?', time: '14:35' },
  ],
  c7: [
    { id: 'm1', sender: 'me', text: 'Chị Hằng ơi, Saigon Pearl 3PN 8.5 tỷ còn không ạ?', time: '16:00' },
    { id: 'm2', sender: 'them', text: 'Còn bạn ơi. Tầng 20, view Bitexco, nội thất Châu Âu.', time: '16:10' },
    { id: 'm3', sender: 'me', text: 'Giá có TL không? Em thấy bên cạnh bán 7.8 tỷ.', time: '16:20' },
    { id: 'm4', sender: 'them', text: 'Căn 7.8 tỷ là 2PN bạn, căn mình 3PN 135m². Giá hợp lý lắm rồi.', time: '16:25' },
    { id: 'm5', sender: 'me', text: 'OK chị, để em sắp xếp đi xem. Giấy tờ sẵn chưa?', time: '16:30' },
    { id: 'm6', sender: 'them', text: 'Sổ hồng + công chứng sẵn sàng rồi ạ', time: '16:35' },
  ],
  c8: [
    { id: 'm1', sender: 'me', text: 'Anh Bảo, nhà Tân Bình 5.5 tỷ mình chốt nhé!', time: '09:00' },
    { id: 'm2', sender: 'them', text: 'OK bạn! Hẹn ký hợp đồng thứ 2 tới.', time: '09:05' },
    { id: 'm3', sender: 'me', text: 'Deal chốt rồi, cảm ơn anh rất nhiều! 🎉', time: '09:10' },
    { id: 'm4', sender: 'them', text: 'Deal chốt rồi, cảm ơn bạn nhiều!', time: '09:12' },
  ],
  c9: [
    { id: 'm1', sender: 'them', text: 'Chào anh, em tìm thuê 1PN Bình Thạnh, 6-10tr.', time: '11:00' },
    { id: 'm2', sender: 'me', text: 'Mình có căn Wilton Tower 1PN 50m², 9tr/tháng. Bạn xem?', time: '11:10' },
    { id: 'm3', sender: 'them', text: 'Ồ, Wilton Tower nội thất thế nào ạ?', time: '11:15' },
    { id: 'm4', sender: 'me', text: 'Full nội thất: điều hòa, tủ lạnh, máy giặt. Sẵn ở ngay.', time: '11:20' },
    { id: 'm5', sender: 'them', text: 'Em dọn vào đầu tháng 4 được không?', time: '11:25' },
  ],
};

export default function MessengerPage() {
  const [selectedChat, setSelectedChat] = useState<string>('c1');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [localMessages, setLocalMessages] = useState(chatMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredConvs = conversations.filter((c) =>
    !searchQuery.trim() || c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const currentChat = conversations.find((c) => c.id === selectedChat);
  const currentMessages = localMessages[selectedChat] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, selectedChat]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    const newMsg = {
      id: `m${Date.now()}`,
      sender: 'me' as const,
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setLocalMessages((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMsg],
    }));
    setMessageInput('');
  };

  return (
    <div className="max-w-[1000px] mx-auto -mt-4 -mx-3">
      <div className="flex h-[calc(100vh-56px-56px)] md:h-[calc(100vh-56px)]">
        {/* Left — Conversation List */}
        <div
          className={cn(
            'w-[340px] border-r border-border flex flex-col shrink-0',
            'max-md:w-full',
            selectedChat && 'max-md:hidden',
          )}
        >
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-foreground">💬 Tin nhắn</h1>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm cuộc trò chuyện"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-none rounded-full h-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/50 transition-colors',
                  selectedChat === conv.id && 'bg-secondary/70',
                )}
              >
                <Avatar className="w-12 h-12 shrink-0">
                  <AvatarFallback className="text-white font-bold" style={{ backgroundColor: "var(--wm-primary)" }}>
                    {conv.name.split(' ').slice(-1)[0][0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className={cn('text-[15px] truncate', conv.unread > 0 ? 'font-bold' : 'font-medium')}>
                    {conv.name}
                  </p>
                  {/* Intent badge */}
                  <div className="flex items-center gap-1 mb-0.5">
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1 py-0.5 leading-none',
                        conv.intent.type === 'CAN'
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-emerald-500/15 text-emerald-400',
                      )}
                    >
                      {conv.intent.type === 'CAN' ? 'CẦN' : 'CÓ'}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate">{conv.intent.title}</span>
                  </div>
                  <p className={cn('text-sm truncate', conv.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                    {conv.lastMessage}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs text-muted-foreground">{conv.time}</span>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 bg-[var(--wm-primary)] text-white text-xs rounded-full flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right — Chat Area */}
        <div className={cn('flex-1 flex flex-col min-w-0', !selectedChat && 'max-md:hidden')}>
          {currentChat ? (
            <>
              {/* Chat Header with Intent Context */}
              <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                  <button className="md:hidden mr-1 text-muted-foreground" onClick={() => setSelectedChat('')}>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback className="text-white text-sm" style={{ backgroundColor: "var(--wm-primary)" }}>
                      {currentChat.name.split(' ').slice(-1)[0][0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-[15px] truncate">{currentChat.name}</p>
                    <Link
                      href="/demo/intent/i-002"
                      className="text-[10px] text-[var(--wm-primary)] hover:underline flex items-center gap-1 truncate"
                    >
                      📌 {currentChat.intent.title}
                    </Link>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-[var(--wm-primary)]">
                  <Info className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {currentMessages.map((msg) => (
                  <div key={msg.id} className={cn('flex', msg.sender === 'me' ? 'justify-end' : 'justify-start')}>
                    <div className={cn('flex items-end gap-2 max-w-[70%]', msg.sender === 'me' && 'flex-row-reverse')}>
                      {msg.sender === 'them' && (
                        <Avatar className="w-7 h-7 shrink-0">
                          <AvatarFallback className="text-white text-[10px]" style={{ backgroundColor: "var(--wm-primary)" }}>
                            {currentChat.name.split(' ').slice(-1)[0][0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div
                          className={cn(
                            'px-3 py-2 rounded-2xl text-[15px]',
                            msg.sender === 'me'
                              ? 'bg-[var(--wm-primary)] text-white rounded-br-sm'
                              : 'bg-secondary rounded-bl-sm',
                          )}
                        >
                          {msg.text}
                        </div>
                        <p className={cn('text-[10px] text-muted-foreground mt-0.5', msg.sender === 'me' ? 'text-right' : 'text-left')}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border flex items-center gap-2">
                <Button variant="ghost" size="icon" className="w-9 h-9 shrink-0 text-[var(--wm-primary)]">
                  <Image className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="w-9 h-9 shrink-0 text-[var(--wm-primary)]">
                  <Smile className="w-5 h-5" />
                </Button>
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 rounded-full bg-secondary border-none"
                />
                {messageInput.trim() ? (
                  <Button
                    size="icon"
                    className="w-9 h-9 rounded-full bg-[var(--wm-primary)] hover:opacity-90 shrink-0"
                    onClick={sendMessage}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="w-9 h-9 shrink-0 text-[var(--wm-primary)]">
                    <ThumbsUp className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
