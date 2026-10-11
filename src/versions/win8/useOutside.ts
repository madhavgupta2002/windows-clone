import { useEffect, useRef, type RefObject } from 'react'

/**
 * Like core useClickOutside, but pointer-downs inside any of `ignore` (e.g. the button that
 * toggles the popup) don't count as outside — so the toggle button can close it itself.
 */
export function useOutside<T extends HTMLElement>(onOutside: () => void, ignore: RefObject<HTMLElement | null>[] = []) {
  const ref = useRef<T>(null)
  const cb = useRef(onOutside)
  cb.current = onOutside
  const ign = useRef(ignore)
  ign.current = ignore
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      const t = e.target as Node
      if (ref.current?.contains(t)) return
      if (ign.current.some(r => r.current?.contains(t))) return
      cb.current()
    }
    const id = setTimeout(() => window.addEventListener('pointerdown', handler), 0)
    return () => { clearTimeout(id); window.removeEventListener('pointerdown', handler) }
  }, [])
  return ref
}
