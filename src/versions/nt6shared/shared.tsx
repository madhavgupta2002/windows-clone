import { createContext, useContext, type ComponentType } from 'react'
import { Icon, useOS, type AppProps, type OS } from '../../core'

/* ---------- Wallpaper preference shared between the shell and its settings app ---------- */

export interface Wallpaper {
  id: string
  name: string
  /** CSS `background` value. */
  css: string
}

export interface WallpaperState {
  wallpapers: Wallpaper[]
  wallpaper: string
  setWallpaper: (id: string) => void
}

export const WallpaperContext = createContext<WallpaperState | null>(null)

export function useWallpaper(): WallpaperState & { current: Wallpaper } {
  const ctx = useContext(WallpaperContext)
  if (!ctx) throw new Error('useWallpaper must be used inside <WallpaperContext.Provider>')
  const current = ctx.wallpapers.find(w => w.id === ctx.wallpaper) ?? ctx.wallpapers[0]
  return { ...ctx, current }
}

/* ---------- Run / search command resolution ---------- */

/** Classic executable names → app ids. */
export const RUN_ALIASES: Record<string, string> = {
  notepad: 'notepad',
  calc: 'calculator',
  mspaint: 'paint',
  pbrush: 'paint',
  winmine: 'minesweeper',
  iexplore: 'browser',
  explorer: 'explorer',
  winver: 'about',
}

/**
 * Run a command typed into Run… / Start Search. Returns false if nothing matched
 * (after showing the standard "cannot find" message).
 */
export function runCommand(os: OS, input: string, aliases: Record<string, string> = {}): boolean {
  const cmd = input.trim()
  if (!cmd) return false
  const key = cmd.toLowerCase().replace(/\.exe$/, '')
  const appId = aliases[key] ?? RUN_ALIASES[key] ?? (os.apps[key] ? key : undefined)
  if (appId && os.apps[appId]) { os.open(appId); return true }
  if (/^(https?:\/\/|www\.)/i.test(cmd)) { os.open('browser', { url: cmd }); return true }
  const path = cmd.replace(/\\/g, '/').replace(/\/$/, '')
  const match = [path, path.toUpperCase()].find(p => os.fs.exists(p))
  if (match) { os.openPath(match); return true }
  os.alert(cmd, `Windows cannot find '${cmd}'. Make sure you typed the name correctly, and then try again.`, 'error')
  return false
}

/* ---------- Simple Control Panel (icon grid of applets) ---------- */

export interface Applet {
  id: string
  label: string
  icon: string
  description: string
  run: (os: OS) => void
}

/** Builds a Control Panel app component from a list of applets. */
export function makeControlPanel(applets: Applet[], heading: string) {
  return function ControlPanel(_props: AppProps) {
    const os = useOS()
    return (
      <div className="app app-cpanel">
        <div className="cpanel-side">
          <div className="cpanel-side-title">Control Panel</div>
          <div className="cpanel-side-link">Switch to Classic View</div>
          <div className="cpanel-side-title">See Also</div>
          <div className="cpanel-side-link" onClick={() => os.open('browser')}>Windows Update</div>
          <div className="cpanel-side-link" onClick={() => os.open('about')}>About Windows</div>
        </div>
        <div className="cpanel-main">
          <h2 className="cpanel-heading">{heading}</h2>
          <div className="cpanel-grid">
            {applets.map(a => (
              <button key={a.id} className="cpanel-applet" onClick={() => a.run(os)} title={a.description}>
                <Icon src={a.icon} size={32} />
                <span>
                  <b>{a.label}</b>
                  <small>{a.description}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }
}

/** Formats a time like the NT tray clock: "3:07 PM". */
export const trayTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

/** Wraps an app component so it receives version-specific default args (icons, labels, home page...). */
export function withDefaultArgs(Component: ComponentType<AppProps>, defaults: Record<string, unknown>) {
  return function WithDefaults(props: AppProps) {
    return <Component {...props} args={{ ...defaults, ...props.args }} />
  }
}
