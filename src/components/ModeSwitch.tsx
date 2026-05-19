'use client'

import { LearningMode } from '@/lib/types'
import { useLang } from '@/lib/use-traditional'

interface ModeSwitchProps {
  mode: LearningMode
  onModeChange: (mode: LearningMode) => void
}

export function ModeSwitch({ mode, onModeChange }: ModeSwitchProps) {
  const { convert } = useLang()
  return (
    <div className="flex bg-white/[0.03] border border-primary/10 rounded-lg p-1">
      <button
        onClick={() => onModeChange('lyrics')}
        className={`px-6 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
          mode === 'lyrics'
            ? 'bg-primary text-cream'
            : 'text-cream-muted hover:text-cream'
        }`}
      >
        {convert('逐句学习')}
      </button>
      <button
        onClick={() => onModeChange('vocabulary')}
        className={`px-6 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
          mode === 'vocabulary'
            ? 'bg-primary text-cream'
            : 'text-cream-muted hover:text-cream'
        }`}
      >
        {convert('词汇学习')}
      </button>
    </div>
  )
}
