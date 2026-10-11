import { useEffect } from 'react'
import { Icon } from '../../core'
import { FLAG_SVG, ICONS } from '../nt6shared/icons'

function useTimeout(fn: () => void, ms: number) {
  useEffect(() => {
    const t = setTimeout(fn, ms)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

/** Black boot screen: glowing "pearl" orb above the green scrolling progress bar. Click to skip. */
export function BootScreen({ onDone }: { onDone: () => void }) {
  useTimeout(onDone, 4500)
  return (
    <div className="vista-boot" onClick={onDone}>
      <div className="vista-pearl"><img src={FLAG_SVG} alt="" /></div>
      <div className="vista-boot-bar"><i /></div>
      <div className="vista-boot-copy">© Microsoft Corporation</div>
    </div>
  )
}

export type LogonStatus = 'pick' | 'welcome' | 'logoff' | 'shutdown' | 'restart' | 'locked'

const MESSAGES: Record<Exclude<LogonStatus, 'pick' | 'locked'>, string> = {
  welcome: 'Welcome',
  logoff: 'Logging off...',
  shutdown: 'Shutting down...',
  restart: 'Restarting...',
}

/** Logon screen (user tile) and the transient Welcome / Shutting down states. */
export function LogonScreen({ status, onLogin, onShutDown }: { status: LogonStatus; onLogin: () => void; onShutDown: () => void }) {
  return (
    <div className="vista-logon">
      <div className="vista-logon-center">
        {status === 'pick' || status === 'locked' ? (
          <button className="vista-user-tile" onClick={onLogin} autoFocus>
            <span className="vista-user-frame"><Icon src={ICONS.user} size={96} /></span>
            <span className="vista-user-name">User</span>
            {status === 'locked' && <span className="vista-user-sub">Locked</span>}
          </button>
        ) : (
          <div className="vista-logon-msg"><span className="vista-spinner" />{MESSAGES[status]}</div>
        )}
      </div>
      <div className="vista-logon-brand">
        <img src={FLAG_SVG} alt="" /><span>Windows Vista<sup>™</sup></span><small>Ultimate</small>
      </div>
      {(status === 'pick' || status === 'locked') && (
        <button className="vista-logon-power" onClick={onShutDown} title="Shut down"><Icon src={ICONS.power} size={26} /></button>
      )}
    </div>
  )
}

export function Delay({ ms, onDone }: { ms: number; onDone: () => void }) {
  useTimeout(onDone, ms)
  return null
}
