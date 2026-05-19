'use client'

import { useLang } from '@/lib/use-traditional'

export function LangToggle() {
  const { traditional, toggle } = useLang()
  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-cream text-sm rounded-lg transition-colors backdrop-blur-sm cursor-pointer"
    >
      {traditional ? '简' : '繁'}
    </button>
  )
}
