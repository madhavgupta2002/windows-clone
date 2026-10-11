import { useEffect, useRef } from 'react'
import { useOS } from '../os'

/** Read a string arg, falling back to `fallback` when missing or not a string. */
export function argStr(args: Record<string, unknown>, key: string): string | undefined
export function argStr(args: Record<string, unknown>, key: string, fallback: string): string
export function argStr(args: Record<string, unknown>, key: string, fallback?: string) {
  const v = args[key]
  return typeof v === 'string' ? v : fallback
}

/**
 * Keep the window title in sync with `title`. Only dispatches when the title
 * actually differs, so it is safe to call on every render.
 */
export function useWindowTitle(winId: string, title: string) {
  const os = useOS()
  const current = os.windows.find(w => w.id === winId)?.title
  const setTitle = useRef(os.setTitle)
  setTitle.current = os.setTitle
  useEffect(() => {
    if (current !== undefined && current !== title) setTitle.current(winId, title)
  }, [winId, title, current])
}

/** The registered title of an app (versions may relabel core apps). */
export function useAppTitle(appId: string, fallback: string) {
  return useOS().apps[appId]?.title ?? fallback
}

/** Is `winId` the focused window? Handy for global keyboard handlers. */
export function useIsActive(winId: string) {
  return useOS().activeId === winId
}

/** Subscribe to window keydown while `active`; ignores events typed into text fields unless `inFields`. */
export function useKeyDown(active: boolean, handler: (e: KeyboardEvent) => void, inFields = false) {
  const cb = useRef(handler)
  cb.current = handler
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (!inFields && t && t.closest('input, textarea, select, [contenteditable]')) return
      cb.current(e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, inFields])
}

/** Ask the user a question with the shared message box; resolves the clicked button label via callback. */
export function useAsk() {
  const os = useOS()
  return (title: string, text: string, buttons: string[], onButton: (label: string) => void, icon: 'info' | 'warning' | 'error' | 'question' = 'question') =>
    os.open('msgbox', { title, text, icon, buttons, onButton })
}
