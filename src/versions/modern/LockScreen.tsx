import { useEffect, useState } from 'react'
import { useClock } from '../../core'
import { useModern } from './context'
import { APP_ICONS, Glyph } from './icons'
import { formatTime } from './ui'

/**
 * Lock screen → sign-in screen. Any click / key reveals the sign-in panel;
 * "Sign in" (no password) unlocks. Clock placement differs per version (CSS).
 */
export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const m = useModern()
  const now = useClock(1000)
  const [signin, setSignin] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!signin) setSignin(true)
      else if (e.key === 'Enter') unlock()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const unlock = () => {
    setLeaving(true)
    setTimeout(onUnlock, 350)
  }

  const time = formatTime(now).replace(/\s?[AP]M$/, '')
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className={`m-lock${signin ? ' signin' : ''}${leaving ? ' leaving' : ''}`} onClick={() => setSignin(true)}>
      <div className="m-lock-wallpaper"><m.wallpaper.Component /></div>
      {!signin && (
        <div className="m-lock-clock">
          <div className="m-lock-time">{time}</div>
          <div className="m-lock-date">{date}</div>
        </div>
      )}
      {signin && (
        <div className="m-lock-signin" onClick={e => e.stopPropagation()}>
          <img className="m-lock-avatar" src={APP_ICONS.user} alt="" />
          <div className="m-lock-name">{m.userName}</div>
          <button className="m-lock-button" autoFocus onClick={unlock}>Sign in</button>
        </div>
      )}
      <div className="m-lock-status">
        <Glyph name="wifi" size={18} />
        <Glyph name="battery" size={18} />
        {signin && <button className="m-lock-power" title="Shut down" onClick={e => { e.stopPropagation(); m.setPower('shutdown') }}><Glyph name="power" size={18} /></button>}
      </div>
    </div>
  )
}
