import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useClock } from '../../core'
import { Glyph } from './Glyph'

/** Lock screen: big clock; click, press a key, or drag it up to dismiss. */
export function LockScreen({ background, onUnlock }: { background: string; onUnlock: () => void }) {
  const now = useClock(1000)
  const [dy, setDy] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const drag = useRef<{ y: number; moved: boolean } | null>(null)

  const dismiss = () => {
    if (leaving) return
    setLeaving(true)
    setTimeout(onUnlock, 380)
  }

  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (!e.metaKey) dismiss() }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { y: e.clientY, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: ReactPointerEvent) => {
    if (!drag.current) return
    const d = Math.min(0, e.clientY - drag.current.y)
    if (d < -5) drag.current.moved = true
    setDy(d)
  }
  const onUp = () => {
    const moved = drag.current?.moved
    drag.current = null
    if (!moved || dy < -window.innerHeight * 0.2) dismiss()
    else setDy(0)
  }

  return (
    <div
      className={`w8-lock${leaving ? ' leaving' : ''}${drag.current ? ' dragging' : ''}`}
      style={{ background, transform: leaving ? undefined : `translateY(${dy}px)` }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
    >
      <div className="w8-lock-clock">
        <div className="time">{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '')}</div>
        <div className="date">{now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        <div className="status"><Glyph name="network" /><Glyph name="mail" /><span>3</span></div>
      </div>
      <div className="w8-lock-hint">Click or drag up to unlock</div>
    </div>
  )
}
