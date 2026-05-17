'use client'

import { LearningMode } from '@/lib/types'

interface ModeSwitchProps {
  mode: LearningMode
  onModeChange: (mode: LearningMode) => void
}

export function ModeSwitch({ mode, onModeChange }: ModeSwitchProps) {
  return (
    <div className="flex bg-white/5 rounded-lg p-1">
      <button
        onClick={() => onModeChange('lyrics')}
        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
          mode === 'lyrics'
            ? 'bg-primary text-black'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        逐句学习
      </button>
      <button
        onClick={() => onModeChange('vocabulary')}
        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
          mode === 'vocabulary'
            ? 'bg-primary text-black'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        词汇学习
      </button>
    </div>
  )
}
