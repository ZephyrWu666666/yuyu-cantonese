'use client'

import { LangProvider } from '@/lib/use-traditional'
import { LangToggle } from './LangToggle'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <LangToggle />
      {children}
    </LangProvider>
  )
}
