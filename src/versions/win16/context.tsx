import { createContext, useContext } from 'react'

/** The three 16-bit versions that share this folder. */
export type Variant = 'win1' | 'win2' | 'win3'

/** Persisted desktop look (Control Panel in 3.1; fixed defaults in 1.0 / 2.0). */
export interface DesktopPrefs {
  /** Colour scheme name (key of the variant's scheme table). */
  scheme: string
  /** Overrides the scheme's desktop colour when set. */
  desktopColor: string | null
  /** Desktop pattern name (key of PATTERNS) or "(None)". */
  pattern: string
}

export interface Win16Context {
  variant: Variant
  /** App id of the shell (MS-DOS Executive / Program Manager); closing it ends the session. */
  shellApp: string
  prefs: DesktopPrefs
  setPrefs: (p: Partial<DesktopPrefs>) => void
  /** Ask the user to confirm ending the session (opens the exit dialog). */
  requestExit: () => void
  /** Confirmed: show the DOS prompt briefly, then leave to the launcher. */
  shutdown: () => void
}

export const Win16Ctx = createContext<Win16Context | null>(null)

export function useWin16(): Win16Context {
  const ctx = useContext(Win16Ctx)
  if (!ctx) throw new Error('useWin16 must be used inside <Win16Shell>')
  return ctx
}

/** App ids that render as dialogs (no minimize / maximize boxes). */
export const DIALOG_APPS = new Set(['msgbox', 'about', 'w16-exit', 'w16-tasklist', 'w3-cp-color', 'w3-cp-desktop', 'w3-cp-datetime'])

/** Ids of the shared win16 apps, so versions and shell code agree. */
export const W16 = {
  exit: 'w16-exit',
  run: 'w16-run',
  dosexec: 'w16-dosexec',
  dosprompt: 'w16-dosprompt',
  clock: 'w16-clock',
  reversi: 'w16-reversi',
  tasklist: 'w16-tasklist',
} as const
