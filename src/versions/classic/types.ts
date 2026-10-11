import type { ComponentType, CSSProperties } from 'react'
import type { AboutInfo, AppDef, FsSeed, OS } from '../../core'

/** Imperative shell commands available to Start menu items, desktop icons, dialogs, … */
export interface ShellCommands {
  openRun: () => void
  openShutDown: () => void
  /** Minimize every window (Quick Launch "Show Desktop"). */
  showDesktop: () => void
  restart: () => void
  logOff: () => void
  openMyComputer: () => void
  openPath: (path: string, title?: string) => void
}

export interface ShellCtx {
  os: OS
  shell: ShellCommands
  config: ClassicConfig
}

export type ShellAction = (ctx: ShellCtx) => void

/** A node in the Start menu / cascading menus. */
export interface CascadeItem {
  label?: string
  icon?: string
  separator?: boolean
  disabled?: boolean
  checked?: boolean
  /** Static children, or children computed at render time (e.g. Documents list). */
  children?: CascadeItem[] | ((ctx: ShellCtx) => CascadeItem[])
  action?: ShellAction
}

export interface QuickLaunchItem {
  id: string
  label: string
  icon: string
  action: ShellAction
}

export interface ClassicDesktopIcon {
  id: string
  label: string
  icon: string
  action: ShellAction
}

export interface SplashProps {
  onDone: () => void
}

export interface LogonProps {
  onDone: () => void
  onShutDown: () => void
}

export type ShutDownChoice = 'shutdown' | 'restart' | 'logoff' | 'standby' | 'dos'

export interface ShutDownOption {
  id: ShutDownChoice
  label: string
  /** Shown under the dropdown (dropdown style only). */
  description?: string
}

export interface DesktopBackground {
  /** Display name in Display Properties. */
  name: string
  /** CSS background shorthand (`null` = plain desktop colour). */
  css: string | null
}

export interface ClassicConfig {
  /** Version id; also the root class `os-<id>`. */
  id: string
  /** Start menu side banner, e.g. ["Windows", "95"]. Bold part, light part. */
  banner: [string, string]
  /** Optional CSS overrides for the banner (background etc.). */
  bannerStyle?: CSSProperties
  /** CSS custom properties applied to the root (`--desktop`, `--face`, `--title-active`, …). */
  theme: Record<`--${string}`, string>
  about: AboutInfo
  /** Use a module-level constant so the registry is stable. */
  apps: AppDef[]
  fsSeed: FsSeed
  documentsPath: string
  /** Folder whose contents also appear on the desktop. */
  desktopPath: string
  recyclePath: string
  /** Label for the root of the shell namespace. */
  myComputerLabel: string
  desktopIcons: ClassicDesktopIcon[]
  startMenu: CascadeItem[]
  quickLaunch?: QuickLaunchItem[]
  /** Extra items appended to the desktop right-click menu (above Properties). */
  desktopMenuExtra?: CascadeItem[]
  /** Desktop wallpapers offered in Display Properties. */
  backgrounds: DesktopBackground[]
  Splash: ComponentType<SplashProps>
  /** Optional logon step after boot (2000's Ctrl+Alt+Del). */
  Logon?: ComponentType<LogonProps>
  /** Apps opened automatically after logon (e.g. Welcome screen); a function is evaluated at each boot. */
  startupApps?: string[] | (() => string[])
  shutDown: {
    style: 'radios' | 'dropdown'
    prompt: string
    options: ShutDownOption[]
    /** 95 uses Yes / No. */
    okLabel?: string
    cancelLabel?: string
  }
  /** "It's now safe…": 9x = orange text on black, nt = dialog box. */
  safeStyle: '9x' | 'nt'
  /** Run dialog command aliases → app ids (merged over defaults). */
  runCommands?: Record<string, string>
  /** Show the volume icon in the tray. */
  trayVolume?: boolean
}
