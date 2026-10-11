import { useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { Icon, useOS, type FrameProps } from '../../core'

type Snap = 'left' | 'right' | 'max'

/** Size a window had before it was snapped, so dragging it away restores it. */
const preSnap = new Map<string, { w: number; h: number }>()

const EDGE = 3

function snapZone(x: number, y: number): Snap | null {
  if (y <= EDGE) return 'max'
  if (x <= EDGE) return 'left'
  if (x >= window.innerWidth - EDGE - 1) return 'right'
  return null
}

/**
 * Aero glass window frame. Implements its own title-bar drag so it can offer Aero Snap:
 * drag to the top edge to maximize, to the left/right edge to fill half the screen,
 * and drag a maximized/snapped window away to restore its previous size.
 */
export function Win7Frame({ win, active, dragHandle, onClose, onMinimize, onMaximize, children }: FrameProps) {
  const os = useOS()
  const [preview, setPreview] = useState<Snap | null>(null)
  const wa = os.workArea

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button, input, [data-no-drag]')) return
    e.preventDefault()
    os.focus(win.id)
    const sx = e.clientX, sy = e.clientY
    const restore = win.maximized ? { w: win.w, h: win.h } : preSnap.get(win.id)
    // Where inside the window the pointer grabbed it (as a fraction of width when restoring).
    const ratio = win.maximized
      ? (sx - wa.left) / Math.max(1, window.innerWidth - wa.left - wa.right)
      : (sx - win.x) / Math.max(1, win.w)
    let w = win.w, h = win.h, offX = sx - win.x, offY = sy - win.y
    let started = false
    let zone: Snap | null = null

    const move = (ev: PointerEvent) => {
      if (!started) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return
        started = true
        document.body.style.userSelect = 'none'
        if (restore) {
          preSnap.delete(win.id)
          if (win.maximized) os.toggleMaximize(win.id)
          w = restore.w; h = restore.h
          offX = w * ratio
          offY = win.maximized ? 14 : offY
        }
      }
      const x = Math.min(Math.max(ev.clientX - offX, wa.left - w + 60), window.innerWidth - 60)
      const y = Math.min(Math.max(ev.clientY - offY, wa.top), window.innerHeight - wa.bottom - 20)
      os.setBounds(win.id, { x, y, w, h })
      if (win.resizable) {
        const z = snapZone(ev.clientX, ev.clientY)
        if (z !== zone) { zone = z; setPreview(z) }
      }
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      document.body.style.userSelect = ''
      setPreview(null)
      if (!zone) return
      if (zone === 'max') { os.toggleMaximize(win.id); return }
      preSnap.set(win.id, { w, h })
      const half = Math.floor((window.innerWidth - wa.left - wa.right) / 2)
      os.setBounds(win.id, {
        x: zone === 'left' ? wa.left : wa.left + half, y: wa.top,
        w: half, h: window.innerHeight - wa.top - wa.bottom,
      })
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div className={`w7-frame${active ? ' active' : ''}${win.maximized ? ' maximized' : ''}`}>
      <div className="w7-titlebar" onPointerDown={onPointerDown} onDoubleClick={dragHandle.onDoubleClick}>
        <Icon src={win.icon} className="w7-title-icon" />
        <span className="w7-title">{win.title}</span>
        <div className="w7-controls">
          <button title="Minimize" aria-label="Minimize" onClick={onMinimize}>
            <svg viewBox="0 0 10 10"><rect x="1.5" y="6" width="7" height="2.2" /></svg>
          </button>
          {win.resizable && (
            <button title={win.maximized ? 'Restore Down' : 'Maximize'} aria-label="Maximize" onClick={onMaximize}>
              {win.maximized
                ? <svg viewBox="0 0 10 10"><path d="M3.5 1.5h5v4h-5zM1.5 4.5h5v4h-5z" fill="none" strokeWidth="1.3" /></svg>
                : <svg viewBox="0 0 10 10"><rect x="1.5" y="1.5" width="7" height="7" fill="none" strokeWidth="1.6" /></svg>}
            </button>
          )}
          <button className="close" title="Close" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 10 10"><path d="M2 2l6 6M8 2 2 8" strokeWidth="1.9" /></svg>
          </button>
        </div>
      </div>
      <div className="w7-content">{children}</div>
      {preview && createPortal(<SnapPreview zone={preview} />, document.querySelector('.os-win7') ?? document.body)}
    </div>
  )
}

function SnapPreview({ zone }: { zone: Snap }) {
  const { workArea: wa } = useOS()
  const style: CSSProperties = {
    top: wa.top + 4, bottom: wa.bottom + 4,
    left: zone === 'right' ? '50%' : wa.left + 4,
    right: zone === 'left' ? '50%' : wa.right + 4,
  }
  return <div className="w7-snap-preview" style={style} />
}
