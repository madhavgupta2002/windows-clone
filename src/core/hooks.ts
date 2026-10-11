import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type SetStateAction } from 'react'

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

const prefListeners = new Map<string, Set<() => void>>()
const prefCache = new Map<string, unknown>()

function readPref<T>(storageKey: string, initial: T): T {
  if (prefCache.has(storageKey)) return prefCache.get(storageKey) as T
  let value = initial
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw !== null) value = JSON.parse(raw) as T
  } catch { /* corrupt — use initial */ }
  prefCache.set(storageKey, value)
  return value
}

/**
 * Persisted preference (wallpaper, theme, ...). Every component using the same key
 * shares one value and re-renders when any of them sets it.
 */
export function usePref<T>(key: string, initial: T) {
  const storageKey = `winclone.pref.${key}`
  const subscribe = useCallback((l: () => void) => {
    const set = prefListeners.get(storageKey) ?? new Set()
    set.add(l)
    prefListeners.set(storageKey, set)
    return () => { set.delete(l) }
  }, [storageKey])
  const value = useSyncExternalStore(subscribe, () => readPref(storageKey, initial))
  const setValue = useCallback((next: SetStateAction<T>) => {
    const prev = readPref(storageKey, initial)
    const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
    if (Object.is(resolved, prev)) return
    prefCache.set(storageKey, resolved)
    try { localStorage.setItem(storageKey, JSON.stringify(resolved)) } catch { /* quota */ }
    prefListeners.get(storageKey)?.forEach(l => l())
  }, [storageKey]) // eslint-disable-line react-hooks/exhaustive-deps
  return [value, setValue] as const
}
