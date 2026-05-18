'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { S2T } from './s2t-map'

interface LangCtx {
  traditional: boolean
  toggle: () => void
  convert: (text: string) => string
}

const ctx = createContext<LangCtx>({ traditional: false, toggle: () => {}, convert: (t) => t })

export function LangProvider({ children }: { children: ReactNode }) {
  const [traditional, setTraditional] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('yuyu-traditional')
    if (saved === 'true') setTraditional(true)
  }, [])

  const toggle = () => {
    setTraditional(prev => {
      const next = !prev
      localStorage.setItem('yuyu-traditional', String(next))
      return next
    })
  }

  const convert = (text: string) => {
    if (!traditional) return text
    return text.replace(/[一-鿿]/g, c => S2T[c] || c)
  }

  return <ctx.Provider value={{ traditional, toggle, convert }}>{children}</ctx.Provider>
}

export const useLang = () => useContext(ctx)
