import type { ComponentType, PointerEvent as ReactPointerEvent, ReactNode } from 'react'

/** Props every app component receives. */
export interface AppProps {
  winId: string
  args: Record<string, unknown>
}

/**
 * An app the window manager can open. Core apps live in `core/apps`; a version
 * can relabel them (title/icon) or add its own version-specific apps.
 */
export interface AppDef {
  id: string
  title: string
  /** Image URL / data URI, or a short emoji/text fallback. */
  icon?: string
  component: ComponentType<AppProps>
  width?: number
  height?: number
  resizable?: boolean
  /** Only one window of this app at a time (re-focuses the existing one). */
  single?: boolean
}

export interface WinState {
  id: string
  appId: string
  title: string
  icon?: string
  args: Record<string, unknown>
  x: number
  y: number
  w: number
  h: number
  z: number
  minimized: boolean
  maximized: boolean
  resizable: boolean
}

/** Props a version's window frame (title bar + borders) receives. */
export interface FrameProps {
  win: WinState
  active: boolean
  /** Spread onto the title bar element to make it the drag handle. */
  dragHandle: {
    onPointerDown: (e: ReactPointerEvent) => void
    onDoubleClick: () => void
  }
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  children: ReactNode
}

/** Insets (px) the taskbar / menu bar take from the screen; maximized windows fill the rest. */
export interface WorkArea {
  top: number
  right: number
  bottom: number
  left: number
}

/** Text shown by the shared About / winver dialog. */
export interface AboutInfo {
  product: string
  version: string
  copyright?: string
  extra?: string
}

export interface FsSeed {
  [path: string]: string | null // string = file content, null = directory
}

export interface VersionMeta {
  id: string
  name: string
  year: number
  /** Short description for the launcher card. */
  tagline: string
  /** CSS background for the launcher card. */
  preview: string
  load: () => Promise<{ default: ComponentType }>
}
