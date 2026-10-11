import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { useModern } from './context'

/** Fluent toggle switch. `label` defaults to On / Off (Win10 shows it, Win11 too). */
export function Toggle({ checked, onChange, label, showState = true }: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  showState?: boolean
}) {
  return (
    <label className={`m-toggle${checked ? ' on' : ''}`} onClick={e => e.stopPropagation()}>
      {showState && <span className="m-toggle-state">{checked ? 'On' : 'Off'}</span>}
      <input type="checkbox" role="switch" checked={checked} aria-label={label} onChange={e => onChange(e.target.checked)} />
      <span className="m-toggle-track"><span className="m-toggle-thumb" /></span>
    </label>
  )
}

export function Slider({ value, onChange, min = 0, max = 100, label }: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  label: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <input
      className="m-slider"
      type="range"
      min={min}
      max={max}
      value={value}
      aria-label={label}
      style={{ '--fill': `${pct}%` } as CSSProperties}
      onChange={e => onChange(Number(e.target.value))}
    />
  )
}

/**
 * Closes the open flyout on pointerdown outside any `.m-flyout` / `[data-flyout-toggle]`
 * element, and on Escape.
 */
export function useFlyoutDismiss(open: boolean, close: () => void) {
  const cb = useRef(close)
  cb.current = close
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null
      if (t && !t.closest('.m-flyout, [data-flyout-toggle], .context-menu')) cb.current()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cb.current() }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])
}

/** Acrylic flyout panel. Positioning comes from `className` in the version CSS. */
export function Flyout({ className, children, label }: { className: string; children: ReactNode; label: string }) {
  return (
    <div className={`m-flyout acrylic ${className}`} role="dialog" aria-label={label}>
      {children}
    </div>
  )
}

/** Brightness veil and night-light tint over the whole screen (driven by quick settings). */
export function DisplayFilters() {
  const m = useModern()
  return (
    <>
      <div className="m-nightlight" style={{ opacity: m.quick.nightLight ? 1 : 0 }} />
      <div className="m-brightness" style={{ opacity: (100 - m.brightness) / 100 * 0.7 }} />
    </>
  )
}

export function formatTime(d: Date, seconds = false) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', ...(seconds ? { second: '2-digit' } : {}) })
}

export function formatShortDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
}

export function formatLongDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function timeAgo(t: number) {
  const mins = Math.round((Date.now() - t) / 60_000)
  if (mins < 1) return 'Now'
  if (mins < 60) return `${mins}m ago`
  return formatTime(new Date(t))
}
