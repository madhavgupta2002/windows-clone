import { useEffect, useRef, useState } from 'react'

/** Current time, refreshed every `intervalMs`. */
export function useClock(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

/** Calls `onOutside` on pointerdown outside the returned ref while `active`. */
export function useClickOutside<T extends HTMLElement>(active: boolean, onOutside: () => void) {
  const ref = useRef<T>(null)
  const cb = useRef(onOutside)
  cb.current = onOutside
  useEffect(() => {
    if (!active) return
    const handler = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb.current()
    }
    // Defer so the click that opened the popup doesn't close it.
    const t = setTimeout(() => window.addEventListener('pointerdown', handler), 0)
    return () => { clearTimeout(t); window.removeEventListener('pointerdown', handler) }
  }, [active])
  return ref
}

/** Persisted per-version preference (wallpaper, theme, ...). */
export function usePref<T>(key: string, initial: T) {
  const storageKey = `winclone.pref.${key}`
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch { return initial }
  })
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(value)) } catch { /* quota */ }
  }, [storageKey, value])
  return [value, setValue] as const
}
