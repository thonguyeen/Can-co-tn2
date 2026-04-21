'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthGateProvider } from '@/components/auth/AuthGateProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthGateProvider>
        {children}
      </AuthGateProvider>
    </SessionProvider>
  )
}
