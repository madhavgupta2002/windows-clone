import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Icon, OSProvider, usePref, useOS, WindowLayer, type AboutInfo, type AppDef, type FsSeed, type WorkArea } from '../../core'
import { BootScreen, DosScreen } from './BootScreen'
import { W16, Win16Ctx, type DesktopPrefs, type Variant, type Win16Context } from './context'
import { Win16Frame } from './Frame'
import { tileRects } from './layout'
import { DEFAULT_SCHEME, patternImage, SCHEMES, schemeVars } from './palette'
import './win16.css'

export interface Win16ShellProps {
  variant: Variant
  about: AboutInfo
  /** Stable array (module constant). */
  apps: AppDef[]
  fsSeed: FsSeed
  /** MS-DOS Executive or Program Manager: opened at boot, closing it ends the session. */
  shellApp: string
  /** Initial bounds of the shell window (ignored when tiling). */
  shellBounds?: (screenW: number, screenH: number) => { x: number; y: number; w: number; h: number }
  /** Extra apps opened at boot, e.g. the 1.0 Clock sitting in the icon area. */
  startup?: { app: string; minimized?: boolean }[]
  /** Windows 1.0: windows are tiled automatically and icons live in a strip at the bottom. */
  tiled?: boolean
}

/** Bottom icon area height in 1.0 (zoomed windows stop above it). */
export const ICON_AREA = 64

const NO_INSETS: WorkArea = { top: 0, right: 0, bottom: 0, left: 0 }
const TILED_INSETS: WorkArea = { top: 0, right: 0, bottom: ICON_AREA, left: 0 }
const FILE_ASSOC = { exe: W16.run, com: W16.run, pif: W16.run, wri: 'notepad', sys: 'notepad', doc: 'notepad' }

type Phase = 'boot' | 'desktop' | 'exiting'

/** Shared shell for Windows 1.0, 2.0 and 3.1. */
export function Win16Shell(props: Win16ShellProps) {
  const { variant, about, apps, fsSeed, tiled } = props
  const [phase, setPhase] = useState<Phase>('boot')
  const booted = useCallback(() => setPhase(p => (p === 'boot' ? 'desktop' : p)), [])

  return (
    <OSProvider
      versionId={variant} about={about} apps={apps} fsSeed={fsSeed} documentsPath="C:/WINDOWS"
      workArea={tiled ? TILED_INSETS : NO_INSETS} fileAssociations={FILE_ASSOC}
    >
      <div className={`os-root os-win16 os-${variant}`}>
        {phase === 'boot' && <BootScreen variant={variant} onDone={booted} />}
        {phase === 'desktop' && <Desktop {...props} onShutdown={() => setPhase('exiting')} />}
        {phase === 'exiting' && <ExitScreen />}
      </div>
    </OSProvider>
  )
}

/** After End Session: back at the DOS prompt for a moment, then the launcher. */
function ExitScreen() {
  const os = useOS()
  useEffect(() => {
    const t = setTimeout(os.exit, 900)
    return () => clearTimeout(t)
  }, [os.exit])
  return <div className="w16-boot"><DosScreen lines={['']} typed="" /></div>
}

function Desktop(props: Win16ShellProps & { onShutdown: () => void }) {
  const { variant, shellApp, shellBounds, startup, tiled, onShutdown } = props
  const os = useOS()
  const schemes = SCHEMES[variant]
  const [prefs, setPrefsState] = usePref<DesktopPrefs>(`${variant}.desktop`, { scheme: DEFAULT_SCHEME[variant], desktopColor: null, pattern: '(None)' })
  const scheme = schemes[prefs.scheme] ?? schemes[DEFAULT_SCHEME[variant]]

  const ctx = useMemo<Win16Context>(() => ({
    variant,
    shellApp,
    prefs,
    setPrefs: p => setPrefsState(prev => ({ ...prev, ...p })),
    requestExit: () => { os.open(W16.exit) },
    shutdown: onShutdown,
  }), [variant, shellApp, prefs, setPrefsState, os, onShutdown])

  // Open the shell (and any startup apps) once. The ref survives StrictMode's double effects.
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    const id = os.open(shellApp)
    if (id && shellBounds && !tiled) os.setBounds(id, shellBounds(window.innerWidth, window.innerHeight))
    for (const s of startup ?? []) {
      const sid = os.open(s.app)
      if (sid && s.minimized) os.minimize(sid)
    }
    if (id) os.focus(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useTiling(!!tiled)

  // 16-bit Windows always has an active window: when the focused one closes or is minimized,
  // activate the topmost remaining one.
  const { activeId, windows, focus } = os
  useEffect(() => {
    if (activeId) return
    const top = windows.filter(w => !w.minimized && w.appId !== W16.run).sort((a, b) => b.z - a.z)[0]
    if (top) focus(top.id)
  }, [activeId, windows, focus])

  // Ctrl+Esc → Task List (where the version has one).
  useEffect(() => {
    if (!os.apps[W16.tasklist]) return
    const onKey = (e: KeyboardEvent) => { if (e.ctrlKey && e.key === 'Escape') { e.preventDefault(); os.open(W16.tasklist) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [os])

  const pattern = patternImage(prefs.pattern)
  const style: CSSProperties = { ...schemeVars(scheme, prefs) }
  return (
    <Win16Ctx.Provider value={ctx}>
      <div className="w16-screen" style={style}>
        <div
          className="w16-desktop"
          style={pattern ? { backgroundImage: pattern } : undefined}
          onDoubleClick={e => e.target === e.currentTarget && os.apps[W16.tasklist] && os.open(W16.tasklist)}
        />
        <MinimizedIcons strip={!!tiled} />
        <WindowLayer Frame={Win16Frame} />
      </div>
    </Win16Ctx.Provider>
  )
}

/**
 * Windows 1.0 tiling: whenever the set of open, sizable windows changes, lay them out in
 * columns above the icon area. Users can still drag / zoom afterwards.
 */
function useTiling(enabled: boolean) {
  const os = useOS()
  const tiled = os.windows.filter(w => !w.minimized && !w.maximized && w.resizable && w.appId !== W16.run)
  const key = tiled.map(w => w.id).join(',')
  const osRef = useRef(os)
  osRef.current = os
  const [size, setSize] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const onResize = () => setSize(s => s + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [enabled])

  useEffect(() => {
    if (!enabled || !key) return
    const { workArea: wa, setBounds } = osRef.current
    const area = { x: wa.left, y: wa.top, w: window.innerWidth - wa.left - wa.right, h: window.innerHeight - wa.top - wa.bottom }
    const ids = key.split(',')
    tileRects(ids.length, area).forEach((r, i) => setBounds(ids[i], r))
  }, [enabled, key, size])
}

/** Minimized windows: a bottom strip in 1.0, icons on the desktop in 2.0 / 3.1. */
function MinimizedIcons({ strip }: { strip: boolean }) {
  const os = useOS()
  const [selected, setSelected] = useState<string | null>(null)
  const icons = os.windows.filter(w => w.minimized)
  return (
    <div className={strip ? 'w16-iconarea' : 'w16-desktop-icons'} onPointerDown={e => e.target === e.currentTarget && setSelected(null)}>
      {icons.map(w => (
        <div
          key={w.id}
          className={`w16-minicon${selected === w.id ? ' selected' : ''}`}
          onPointerDown={() => setSelected(w.id)}
          onDoubleClick={() => { setSelected(null); os.focus(w.id) }}
          title={w.title}
        >
          <Icon src={w.icon} size={32} />
          <span className="w16-minicon-label">{w.title}</span>
        </div>
      ))}
    </div>
  )
}
