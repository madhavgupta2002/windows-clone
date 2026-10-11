import { createContext, useContext } from 'react'
import type { ClassicConfig, ShellCommands, ShellCtx } from './types'

export interface ClassicContextValue {
  config: ClassicConfig
  shell: ShellCommands
  /** Index into config.backgrounds. */
  background: number
  setBackground: (index: number) => void
}

export const ClassicContext = createContext<ClassicContextValue | null>(null)

export function useClassic(): ClassicContextValue {
  const ctx = useContext(ClassicContext)
  if (!ctx) throw new Error('useClassic must be used inside the classic shell')
  return ctx
}

export type { ShellCtx }
