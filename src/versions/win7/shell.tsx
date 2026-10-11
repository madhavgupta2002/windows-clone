import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { baseName, joinPath, useOS, usePref, type FileSystem } from '../../core'

/** Well-known paths in the Windows 7 virtual file system. */
export const USER = 'C:/Users/User'
export const PATHS = {
  desktop: `${USER}/Desktop`,
  documents: `${USER}/Documents`,
  pictures: `${USER}/Pictures`,
  music: `${USER}/Music`,
  downloads: `${USER}/Downloads`,
  /** The core Explorer's drive list. */
  computer: '',
  recycle: 'C:/$Recycle.Bin',
} as const

export const THEMES = {
  blue: { name: 'Windows 7', colors: '#062b66, #1597cb' },
  nature: { name: 'Nature', colors: '#073e45, #55ad77' },
  sunset: { name: 'Sunset', colors: '#351c55, #d77f83' },
  graphite: { name: 'Graphite', colors: '#151e30, #647d95' },
} as const
export type ThemeId = keyof typeof THEMES

export const ICON_SIZES = {
  large: { width: 104, height: 106, icon: 60 },
  medium: { width: 86, height: 88, icon: 44 },
  small: { width: 76, height: 72, icon: 32 },
} as const
export type IconSize = keyof typeof ICON_SIZES

export interface Point { x: number; y: number }

export interface Toast { id: number; text: string }

export interface Win7 {
  theme: ThemeId
  setTheme: (t: ThemeId) => void
  iconSize: IconSize
  setIconSize: (s: IconSize) => void
  /** Saved desktop icon positions, keyed by desktop item id. */
  positions: Record<string, Point>
  setPositions: (update: (p: Record<string, Point>) => Record<string, Point>) => void
  /** Forget positions so icons re-flow in the given order. */
  arrange: (order: string[]) => void
  /** Explicit icon order used for auto-layout (after Sort by). */
  order: string[]
  toast: (text: string) => void
  /** Currently visible toasts (render with <Toasts />). */
  toasts: Toast[]
  /** Move a file / folder into the Recycle Bin (remembering where it came from). */
  recycle: (path: string) => void
  restoreAll: () => void
  emptyRecycleBin: () => void
}

const Ctx = createContext<Win7 | null>(null)

export function useWin7(): Win7 {
  const v = useContext(Ctx)
  if (!v) throw new Error('useWin7 must be used inside <Win7Provider>')
  return v
}

function moveTo(fs: FileSystem, from: string, dir: string) {
  const to = joinPath(dir, fs.uniqueName(dir, baseName(from)))
  fs.rename(from, to)
  return to
}

export function Win7Provider({ children }: { children: ReactNode }) {
  const os = useOS()
  const [theme, setTheme] = usePref<ThemeId>('win7.theme', 'blue')
  const [iconSize, setIconSize] = usePref<IconSize>('win7.iconSize', 'medium')
  const [positions, setPositionsState] = usePref<Record<string, Point>>('win7.iconPositions', {})
  const [order, setOrder] = usePref<string[]>('win7.iconOrder', [])
  const [origins, setOrigins] = usePref<Record<string, string>>('win7.recycleOrigins', {})
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)

  const toast = useCallback((text: string) => {
    const id = ++toastId.current
    setToasts(t => [...t.slice(-2), { id, text }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3400)
  }, [])

  const value = useMemo<Win7>(() => ({
    theme: THEMES[theme] ? theme : 'blue',
    setTheme,
    iconSize: ICON_SIZES[iconSize] ? iconSize : 'medium',
    setIconSize: s => { setIconSize(s); setPositionsState({}) },
    positions,
    setPositions: update => setPositionsState(update),
    order,
    arrange: o => { setOrder(o); setPositionsState({}) },
    toast,
    toasts,
    recycle: path => {
      if (!os.fs.exists(path)) return
      if (!os.fs.exists(PATHS.recycle)) os.fs.mkdir(PATHS.recycle)
      const to = moveTo(os.fs, path, PATHS.recycle)
      setOrigins(o => ({ ...o, [to]: path }))
    },
    restoreAll: () => {
      for (const node of os.fs.list(PATHS.recycle)) {
        const origin = origins[node.path] ?? joinPath(PATHS.desktop, node.name)
        const dir = origin.slice(0, origin.lastIndexOf('/'))
        if (!os.fs.isDir(dir)) os.fs.mkdir(dir)
        moveTo(os.fs, node.path, dir)
      }
      setOrigins({})
    },
    emptyRecycleBin: () => {
      for (const node of os.fs.list(PATHS.recycle)) os.fs.remove(node.path)
      setOrigins({})
    },
  }), [theme, setTheme, iconSize, setIconSize, positions, setPositionsState, order, setOrder, origins, setOrigins, toast, toasts, os.fs])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function Toasts() {
  const { toasts } = useWin7()
  return (
    <div className="w7-toasts" aria-live="polite">
      {toasts.map(t => <div key={t.id} className="w7-toast">{t.text}</div>)}
    </div>
  )
}
