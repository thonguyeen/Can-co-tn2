import { DemoHeader } from '@/components/layout/DemoHeader'
import { DemoLeftSidebar } from '@/components/layout/DemoLeftSidebar'
import { DemoRightSidebar } from '@/components/layout/DemoRightSidebar'
import { MOCK_USER } from '@/lib/mock/data'
import { SavedProvider } from '@/lib/saved-context'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CẦN & CÓ — Mạng xã hội nhu cầu',
  description: 'Đăng thứ bạn cần hoặc có. AI tự động kết nối cung và cầu. Chat trực tiếp, không qua trung gian.',
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userData = {
    id: MOCK_USER.id,
    email: MOCK_USER.email,
    display_name: MOCK_USER.display_name,
    avatar_url: MOCK_USER.avatar_url,
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DemoHeader user={userData} />

      <div className="flex w-full">
        {/* Left Sidebar */}
        <DemoLeftSidebar user={userData} />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-2xl mx-auto px-3 py-4">
            <SavedProvider>
              {children}
            </SavedProvider>
          </div>
        </main>

        {/* Right Sidebar */}
        <DemoRightSidebar />
      </div>
    </div>
  )
}
