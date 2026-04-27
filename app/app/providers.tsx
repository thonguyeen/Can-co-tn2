'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthGateProvider } from '@/components/auth/AuthGateProvider'
import { SavedProvider } from '@/lib/saved-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthGateProvider>
        <SavedProvider>
          {children}
        </SavedProvider>
      </AuthGateProvider>
    </SessionProvider>
  )
}
