import { useEffect } from 'react'
import { Icon } from '../../core'
import { FLAG_SVG, ICONS } from '../nt6shared/icons'

/** Calls `fn` once after `ms`. */
function useTimeout(fn: () => void, ms: number) {
  useEffect(() => {
    const t = setTimeout(fn, ms)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`xp-logo${dark ? ' dark' : ''}`}>
      <img src={FLAG_SVG} alt="" />
      <div>
        <small>Microsoft<sup>®</sup></small>
        <span>Windows<sup>xp</sup></span>
      </div>
    </div>
  )
}

/** Black boot screen with the scrolling three-block progress bar. Click to skip. */
export function BootScreen({ onDone }: { onDone: () => void }) {
  useTimeout(onDone, 4200)
  return (
    <div className="xp-boot" onClick={onDone}>
      <Logo />
      <div className="xp-boot-bar"><div className="xp-boot-blocks"><i /><i /><i /></div></div>
      <div className="xp-boot-foot"><span>Copyright © Microsoft Corporation</span><b>Microsoft<sup>®</sup></b></div>
    </div>
  )
}

/** Blue Welcome screen: user tiles on the right, Turn off button bottom-left. */
export function WelcomeScreen({ status, onLogin, onTurnOff }: { status: 'pick' | 'loading' | 'shutdown' | 'logoff'; onLogin: () => void; onTurnOff: () => void }) {
  const message = { pick: '', loading: 'welcome', shutdown: 'Windows is shutting down...', logoff: 'Logging off...' }[status]
  return (
    <div className="xp-welcome">
      <div className="xp-welcome-top" />
      <div className="xp-welcome-mid">
        {status === 'pick' ? (
          <>
            <div className="xp-welcome-left">
              <Logo dark />
              <p>To begin, click your user name</p>
            </div>
            <div className="xp-welcome-divider" />
            <div className="xp-welcome-right">
              <button className="xp-user-tile" onClick={onLogin} autoFocus>
                <Icon src={ICONS.user} size={48} />
                <span>User</span>
              </button>
            </div>
          </>
        ) : (
          <div className={`xp-welcome-message${status === 'loading' ? ' big' : ''}`}>{message}</div>
        )}
      </div>
      <div className="xp-welcome-bottom">
        {status === 'pick' && (
          <>
            <button className="xp-welcome-off" onClick={onTurnOff}><Icon src={ICONS.power} size={24} /> Turn off computer</button>
            <p>After you log on, you can add or change accounts.<br />Just go to Control Panel and click User Accounts.</p>
          </>
        )}
      </div>
    </div>
  )
}

/** Delays and then runs `onDone`; used for the transient "welcome" / "shutting down" states. */
export function Delay({ ms, onDone }: { ms: number; onDone: () => void }) {
  useTimeout(onDone, ms)
  return null
}

export interface ExitChoice {
  label: string
  icon: string
  onClick: () => void
}

/** Grey-out-the-screen dialog used for Turn Off Computer and Log Off Windows. */
export function ExitDialog({ title, choices, onCancel }: { title: string; choices: ExitChoice[]; onCancel: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])
  return (
    <div className="xp-exit-overlay">
      <div className="xp-exit" role="dialog" aria-label={title}>
        <div className="xp-exit-head"><span>{title}</span><img src={FLAG_SVG} alt="" /></div>
        <div className="xp-exit-body">
          {choices.map(c => (
            <button key={c.label} className="xp-exit-choice" onClick={c.onClick}>
              <Icon src={c.icon} size={34} />
              <span>{c.label}</span>
            </button>
          ))}
        </div>
        <div className="xp-exit-foot"><button className="btn" onClick={onCancel} autoFocus>Cancel</button></div>
      </div>
    </div>
  )
}
