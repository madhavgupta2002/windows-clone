import { useEffect } from 'react'
import { useOS } from '../../core'
import { useModern, type PowerAction } from './context'
import { Glyph, type GlyphName } from './icons'

const LABEL: Record<PowerAction, string> = {
  shutdown: 'Shutting down',
  restart: 'Restarting',
  signout: 'Signing out',
  sleep: '',
}

/** Spinning dots ("Windows is working") indicator. */
export function Spinner() {
  return <span className="m-spinner" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <i key={i} />)}</span>
}

/**
 * Full-screen power transition. Shut down → os.exit() (back to the launcher);
 * restart / sign out → close all windows and call onResume; sleep → black until clicked.
 */
export function PowerScreen({ onResume }: { onResume?: (from: PowerAction) => void }) {
  const os = useOS()
  const m = useModern()
  const { power, setPower } = m

  useEffect(() => {
    if (!power || power === 'sleep') return
    const t = setTimeout(() => {
      if (power === 'shutdown') { os.exit(); return }
      os.closeAll()
      setPower(null)
      onResume?.(power)
    }, power === 'signout' ? 1200 : 2200)
    return () => clearTimeout(t)
  }, [power]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!power) return null
  if (power === 'sleep') {
    return (
      <div className="m-power sleep" onClick={() => { setPower(null); onResume?.('sleep') }}>
        <span className="m-power-hint">Click anywhere to wake</span>
      </div>
    )
  }
  return (
    <div className="m-power">
      <Spinner />
      <span>{LABEL[power]}</span>
    </div>
  )
}

/** Sleep / Shut down / Restart popup used by both Start menus. */
export function PowerMenu({ className = '', onDone }: { className?: string; onDone: () => void }) {
  const { setPower } = useModern()
  const items: [PowerAction, string, GlyphName][] = [['sleep', 'Sleep', 'sleep'], ['shutdown', 'Shut down', 'power'], ['restart', 'Restart', 'restart']]
  return (
    <div className={`m-powermenu m-flyout ${className}`} role="menu">
      {items.map(([a, label, g]) => (
        <button key={a} role="menuitem" onClick={() => { onDone(); setPower(a) }}>
          <Glyph name={g} size={16} /> {label}
        </button>
      ))}
    </div>
  )
}
