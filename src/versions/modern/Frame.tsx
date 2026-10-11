import { useEffect, useRef, useState } from 'react'
import { Icon, useOS, type FrameProps } from '../../core'

/**
 * Window frame shared by Windows 10 (square, 1px accent border) and Windows 11
 * (rounded, Mica title bar, snap layouts on the maximize button). Version CSS
 * styles `.mframe` differently under `.os-win10` / `.os-win11`.
 */

type Zone = readonly [x: number, y: number, w: number, h: number]

/** Snap layouts (fractions of the work area), as offered by Windows 11. */
const SNAP_LAYOUTS: readonly (readonly Zone[])[] = [
  [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]],
  [[0, 0, 2 / 3, 1], [2 / 3, 0, 1 / 3, 1]],
  [[0, 0, 1 / 3, 1], [1 / 3, 0, 1 / 3, 1], [2 / 3, 0, 1 / 3, 1]],
  [[0, 0, 0.5, 1], [0.5, 0, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]],
  [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]],
  [[0, 0, 0.25, 1], [0.25, 0, 0.5, 1], [0.75, 0, 0.25, 1]],
]

const pct = (v: number) => `${v * 100}%`

function SnapFlyout({ onPick }: { onPick: (z: Zone) => void }) {
  return (
    <div className="snap-flyout" data-no-drag>
      {SNAP_LAYOUTS.map((layout, i) => (
        <div key={i} className="snap-layout">
          {layout.map((z, j) => (
            <button
              key={j}
              className="snap-zone"
              aria-label={`Snap layout ${i + 1}, zone ${j + 1}`}
              style={{ left: pct(z[0]), top: pct(z[1]), width: pct(z[2]), height: pct(z[3]) }}
              onClick={() => onPick(z)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

const MinGlyph = () => <svg viewBox="0 0 10 10" width="10" height="10"><path d="M0 5.5h10" stroke="currentColor" /></svg>
const MaxGlyph = ({ restore }: { restore: boolean }) => restore
  ? <svg viewBox="0 0 10 10" width="10" height="10"><path d="M2.5 2.5V.5h7v7h-2M.5 2.5h7v7h-7z" fill="none" stroke="currentColor" /></svg>
  : <svg viewBox="0 0 10 10" width="10" height="10"><rect x=".5" y=".5" width="9" height="9" rx="1" fill="none" stroke="currentColor" /></svg>
const CloseGlyph = () => <svg viewBox="0 0 10 10" width="10" height="10"><path d="m.5.5 9 9m0-9-9 9" stroke="currentColor" /></svg>

export function ModernFrame({ win, active, dragHandle, onClose, onMinimize, onMaximize, children, snap = false }: FrameProps & { snap?: boolean }) {
  const os = useOS()
  const [snapOpen, setSnapOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const hover = (open: boolean, delay: number) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setSnapOpen(open), delay)
  }

  const snapTo = ([fx, fy, fw, fh]: Zone) => {
    const wa = os.workArea
    const W = window.innerWidth - wa.left - wa.right
    const H = window.innerHeight - wa.top - wa.bottom
    if (win.maximized) os.toggleMaximize(win.id)
    os.setBounds(win.id, { x: wa.left + Math.round(fx * W), y: wa.top + Math.round(fy * H), w: Math.round(fw * W), h: Math.round(fh * H) })
    os.focus(win.id)
    setSnapOpen(false)
  }

  return (
    <div className={`mframe${active ? ' active' : ''}${win.maximized ? ' maximized' : ''}`}>
      <div className="mframe-titlebar" {...dragHandle}>
        <Icon src={win.icon} size={16} className="mframe-icon" />
        <span className="mframe-title">{win.title}</span>
        <div className="mframe-caption">
          <button className="mframe-btn" title="Minimize" aria-label="Minimize" onClick={onMinimize}><MinGlyph /></button>
          <div
            className="mframe-max-wrap"
            onPointerEnter={() => snap && win.resizable && hover(true, 450)}
            onPointerLeave={() => snap && hover(false, 250)}
          >
            <button
              className="mframe-btn"
              title={win.maximized ? 'Restore Down' : 'Maximize'}
              aria-label={win.maximized ? 'Restore Down' : 'Maximize'}
              disabled={!win.resizable}
              onClick={() => { setSnapOpen(false); onMaximize() }}
            >
              <MaxGlyph restore={win.maximized} />
            </button>
            {snapOpen && <SnapFlyout onPick={snapTo} />}
          </div>
          <button className="mframe-btn close" title="Close" aria-label="Close" onClick={onClose}><CloseGlyph /></button>
        </div>
      </div>
      <div className="mframe-body">{children}</div>
    </div>
  )
}
