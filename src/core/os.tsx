import { createContext, useCallback, useContext, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { FileSystem, useFsVersion } from './fs'
import type { AboutInfo, AppDef, FsSeed, WinState, WorkArea } from './types'

/**
 * OS context: window manager + file system + app registry for one Windows version.
 * Every version Shell renders inside <OSProvider>.
 */

type Action =
  | { type: 'open'; win: WinState }
  | { type: 'close'; id: string }
  | { type: 'focus'; id: string; z: number }
  | { type: 'minimize'; id: string }
  | { type: 'toggleMax'; id: string }
  | { type: 'bounds'; id: string; x: number; y: number; w: number; h: number }
  | { type: 'title'; id: string; title: string }
  | { type: 'closeAll' }

function reducer(state: WinState[], a: Action): WinState[] {
  const patch = (id: string, p: Partial<WinState>) => state.map(w => (w.id === id ? { ...w, ...p } : w))
  switch (a.type) {
    case 'open': return [...state, a.win]
    case 'close': return state.filter(w => w.id !== a.id)
    case 'focus': return patch(a.id, { z: a.z, minimized: false })
    case 'minimize': return patch(a.id, { minimized: true })
    case 'toggleMax': return state.map(w => (w.id === a.id ? { ...w, maximized: !w.maximized } : w))
    case 'bounds': return patch(a.id, { x: a.x, y: a.y, w: a.w, h: a.h })
    case 'title': return patch(a.id, { title: a.title })
    case 'closeAll': return []
  }
}

export interface OS {
  versionId: string
  about: AboutInfo
  apps: Record<string, AppDef>
  fs: FileSystem
  fsSeed: FsSeed
  /** Default folder for Explorer / Save dialogs, e.g. "C:/My Documents". */
  documentsPath: string
  workArea: WorkArea
  windows: WinState[]
  /** Id of the focused, non-minimized window (or null when the desktop has focus). */
  activeId: string | null
  open: (appId: string, args?: Record<string, unknown>) => string | null
  close: (id: string) => void
  focus: (id: string) => void
  minimize: (id: string) => void
  toggleMaximize: (id: string) => void
  setBounds: (id: string, b: { x: number; y: number; w: number; h: number }) => void
  setTitle: (id: string, title: string) => void
  closeAll: () => void
  /** Clicking a taskbar button: focus, or minimize if already focused. */
  taskbarClick: (id: string) => void
  /** Clears focus (desktop click). */
  blur: () => void
  /** Convenience: opens the shared message box. */
  alert: (title: string, text: string, icon?: 'info' | 'warning' | 'error' | 'question') => void
  /** Opens a file with the right app based on extension (txt → notepad, dir → explorer, …). */
  openPath: (path: string) => void
  /** Leave the version and go back to the launcher. */
  exit: () => void
}

const OSContext = createContext<OS | null>(null)

export function useOS(): OS {
  const os = useContext(OSContext)
  if (!os) throw new Error('useOS must be used inside <OSProvider>')
  return os
}

/** Like useOS but also re-renders on file system changes. */
export function useFS() {
  const os = useOS()
  useFsVersion(os.fs)
  return os.fs
}

export interface OSProviderProps {
  versionId: string
  about: AboutInfo
  apps: AppDef[]
  fsSeed: FsSeed
  documentsPath: string
  workArea: WorkArea
  /** Map extension → app id, merged over defaults (txt/ini/log → notepad, bmp → paint). */
  fileAssociations?: Record<string, string>
  children: ReactNode
}

let winCounter = 0

export function OSProvider(props: OSProviderProps) {
  const { versionId, about, fsSeed, documentsPath, workArea, children } = props
  const [windows, dispatch] = useReducer(reducer, [])
  const [focused, setFocused] = useState<string | null>(null)
  const zTop = useRef(10)
  const fs = useMemo(() => new FileSystem(`winclone.fs.${versionId}`, fsSeed), [versionId]) // eslint-disable-line react-hooks/exhaustive-deps
  const apps = useMemo(() => Object.fromEntries(props.apps.map(a => [a.id, a])), [props.apps])
  const windowsRef = useRef(windows)
  windowsRef.current = windows
  const assoc = useMemo(
    () => ({ txt: 'notepad', ini: 'notepad', log: 'notepad', bat: 'notepad', md: 'notepad', bmp: 'paint', ...props.fileAssociations }),
    [props.fileAssociations],
  )

  const focus = useCallback((id: string) => {
    zTop.current += 1
    dispatch({ type: 'focus', id, z: zTop.current })
    setFocused(id)
  }, [])

  const open = useCallback((appId: string, args: Record<string, unknown> = {}) => {
    const app = apps[appId]
    if (!app) { console.warn(`[${versionId}] unknown app "${appId}"`); return null }
    if (app.single) {
      const existing = windowsRef.current.find(w => w.appId === appId)
      if (existing) { focus(existing.id); return existing.id }
    }
    const id = `w${++winCounter}`
    const screenW = window.innerWidth - workArea.left - workArea.right
    const screenH = window.innerHeight - workArea.top - workArea.bottom
    const w = Math.min(app.width ?? 520, screenW)
    const h = Math.min(app.height ?? 380, screenH)
    const cascade = (windowsRef.current.length % 8) * 26
    zTop.current += 1
    dispatch({
      type: 'open',
      win: {
        id, appId, args,
        title: (args.title as string) ?? app.title,
        icon: app.icon,
        x: workArea.left + Math.max(0, Math.min(40 + cascade + (screenW - w) / 4, screenW - w)),
        y: workArea.top + Math.max(0, Math.min(30 + cascade + (screenH - h) / 5, screenH - h)),
        w, h, z: zTop.current,
        minimized: false, maximized: false,
        resizable: app.resizable !== false,
      },
    })
    setFocused(id)
    return id
  }, [apps, focus, versionId, workArea])

  const close = useCallback((id: string) => {
    dispatch({ type: 'close', id })
    setFocused(f => (f === id ? null : f))
  }, [])

  const minimize = useCallback((id: string) => {
    dispatch({ type: 'minimize', id })
    setFocused(f => (f === id ? null : f))
  }, [])

  const os: OS = useMemo(() => {
    const visible = windows.filter(w => !w.minimized)
    const activeId = focused && visible.some(w => w.id === focused) ? focused : null
    return {
      versionId, about, apps, fs, fsSeed, documentsPath, workArea, windows, activeId,
      open, close, focus, minimize,
      toggleMaximize: id => dispatch({ type: 'toggleMax', id }),
      setBounds: (id, b) => dispatch({ type: 'bounds', id, ...b }),
      setTitle: (id, title) => dispatch({ type: 'title', id, title }),
      closeAll: () => { dispatch({ type: 'closeAll' }); setFocused(null) },
      taskbarClick: id => {
        const w = windows.find(x => x.id === id)
        if (!w) return
        if (activeId === id) minimize(id)
        else focus(id)
      },
      blur: () => setFocused(null),
      alert: (title, text, icon = 'info') => { open('msgbox', { title, text, icon }) },
      openPath: path => {
        if (fs.isDir(path)) { open('explorer', { path }); return }
        const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase()
        const appId = assoc[ext as keyof typeof assoc]
        if (appId && apps[appId]) open(appId, { path })
        else open('msgbox', { title: path.slice(path.lastIndexOf('/') + 1), text: 'There is no program associated with this file.', icon: 'warning' })
      },
      exit: () => { location.hash = '' },
    }
  }, [versionId, about, apps, fs, fsSeed, documentsPath, workArea, windows, focused, open, close, focus, minimize, assoc])

  return <OSContext.Provider value={os}>{children}</OSContext.Provider>
}
