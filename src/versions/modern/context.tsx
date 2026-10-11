import { createContext, useCallback, useContext, useMemo, useState, type ComponentType, type CSSProperties } from 'react'
import { usePref } from '../../core'
import { APP_ICONS } from './icons'

/**
 * Shared state for the "modern" shells (Windows 10 and 11): theme, accent, wallpaper,
 * quick-setting toggles, notifications and power state. Each shell creates it with
 * `useModernShell()` and exposes it with <ModernContext.Provider>, so shared apps
 * (Settings, Store) and flyouts can read / change it.
 */

export type Variant = 'win10' | 'win11'
export type Theme = 'light' | 'dark'
export type PowerAction = 'sleep' | 'shutdown' | 'restart' | 'signout'
export type QuickKey =
  | 'wifi' | 'bluetooth' | 'airplane' | 'batterySaver' | 'nightLight' | 'accessibility'
  | 'location' | 'focus' | 'tablet' | 'vpn' | 'hotspot' | 'project'

export interface WallpaperDef {
  id: string
  name: string
  /** Renders the wallpaper filling its (positioned) parent. Also used for Settings thumbnails. */
  Component: ComponentType
}

export interface Notice {
  id: string
  app: string
  icon: string
  title: string
  body: string
  time: number
}

export interface ModernShell {
  variant: Variant
  userName: string
  theme: Theme
  setTheme: (t: Theme) => void
  accent: string
  setAccent: (c: string) => void
  accents: readonly string[]
  wallpaper: WallpaperDef
  wallpapers: readonly WallpaperDef[]
  setWallpaper: (id: string) => void
  transparency: boolean
  setTransparency: (on: boolean) => void
  brightness: number
  setBrightness: (v: number) => void
  volume: number
  setVolume: (v: number) => void
  quick: Record<QuickKey, boolean>
  toggleQuick: (k: QuickKey) => void
  notices: Notice[]
  notify: (n: Omit<Notice, 'id' | 'time'>) => void
  dismiss: (id: string) => void
  clearNotices: () => void
  power: PowerAction | null
  setPower: (a: PowerAction | null) => void
  /** Last page requested via `navigateSettings` (the Settings window follows it). */
  settingsNav: { page: string; nonce: number } | null
  navigateSettings: (page: string) => void
}

export const ModernContext = createContext<ModernShell | null>(null)

export function useModern(): ModernShell {
  const m = useContext(ModernContext)
  if (!m) throw new Error('useModern must be used inside a modern (Win10/11) shell')
  return m
}

export interface ModernConfig {
  variant: Variant
  wallpapers: readonly WallpaperDef[]
  accents: readonly string[]
  defaultAccent: string
  defaultTheme: Theme
}

const QUICK_DEFAULTS: Record<QuickKey, boolean> = {
  wifi: true, bluetooth: true, airplane: false, batterySaver: false, nightLight: false, accessibility: false,
  location: true, focus: false, tablet: false, vpn: false, hotspot: false, project: false,
}

let noticeCounter = 0
const minutesAgo = (m: number) => Date.now() - m * 60_000

export function useModernShell(cfg: ModernConfig): ModernShell {
  const { variant, wallpapers, accents } = cfg
  const [theme, setTheme] = usePref<Theme>(`${variant}.theme`, cfg.defaultTheme)
  const [accent, setAccent] = usePref<string>(`${variant}.accent`, cfg.defaultAccent)
  const [wallpaperId, setWallpaper] = usePref<string>(`${variant}.wallpaper`, wallpapers[0].id)
  const [transparency, setTransparency] = usePref<boolean>(`${variant}.transparency`, true)
  const [brightness, setBrightness] = useState(100)
  const [volume, setVolume] = useState(70)
  const [quick, setQuick] = useState(QUICK_DEFAULTS)
  const [power, setPower] = useState<PowerAction | null>(null)
  const [settingsNav, setSettingsNav] = useState<{ page: string; nonce: number } | null>(null)
  const navigateSettings = useCallback((page: string) => setSettingsNav(n => ({ page, nonce: (n?.nonce ?? 0) + 1 })), [])
  const [notices, setNotices] = useState<Notice[]>(() => [
    { id: 'n1', app: 'Windows Security', icon: APP_ICONS.settings, title: 'Virus & threat protection', body: 'No current threats. Your device was scanned and no threats were found.', time: minutesAgo(12) },
    { id: 'n2', app: 'Mail', icon: APP_ICONS.mail, title: 'Welcome to Windows', body: `Your ${variant === 'win11' ? 'Windows 11' : 'Windows 10'} desktop is ready. Try the Start menu and Settings.`, time: minutesAgo(48) },
  ])

  const toggleQuick = useCallback((k: QuickKey) => setQuick(q => ({ ...q, [k]: !q[k] })), [])
  const notify = useCallback((n: Omit<Notice, 'id' | 'time'>) => {
    setNotices(list => [{ ...n, id: `n${++noticeCounter}-${Date.now()}`, time: Date.now() }, ...list])
  }, [])
  const dismiss = useCallback((id: string) => setNotices(list => list.filter(n => n.id !== id)), [])
  const clearNotices = useCallback(() => setNotices([]), [])

  const wallpaper = wallpapers.find(w => w.id === wallpaperId) ?? wallpapers[0]

  return useMemo<ModernShell>(() => ({
    variant, userName: 'User', theme, setTheme, accent, setAccent, accents,
    wallpaper, wallpapers, setWallpaper, transparency, setTransparency,
    brightness, setBrightness, volume, setVolume, quick, toggleQuick,
    notices, notify, dismiss, clearNotices, power, setPower, settingsNav, navigateSettings,
  }), [settingsNav, navigateSettings, variant, theme, setTheme, accent, setAccent, accents, wallpaper, wallpapers, setWallpaper, transparency,
    setTransparency, brightness, volume, quick, toggleQuick, notices, notify, dismiss, clearNotices, power])
}

/** className + CSS variables for the shell root (`.os-root`). */
export function modernRootProps(m: ModernShell): { className: string; style: CSSProperties } {
  const cls = [
    'os-root', 'os-modern', `os-${m.variant}`, `theme-${m.theme}`,
    m.transparency ? 'transparency-on' : 'transparency-off',
  ]
  return { className: cls.join(' '), style: { '--accent': m.accent } as CSSProperties }
}
