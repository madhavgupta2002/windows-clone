import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { useClock, useOS, usePref, type WinState } from '../../core'
import { ICONS } from './icons'
import { W7ContextMenu, type W7MenuItem } from './Menu'
import { StartMenu, type PowerAction } from './StartMenu'
import { useWin7 } from './shell'
import { useOutside } from './useOutside'

type Flyout = 'calendar' | 'volume' | 'network' | 'action' | 'hidden' | null

const DEFAULT_PINNED = ['browser', 'explorer', 'notepad']

interface Props {
  onPower: (a: PowerAction) => void
  onPeek: (on: boolean) => void
}

/** The superbar: Start orb, pinned + running program buttons, notification area, show desktop. */
export function Taskbar({ onPower, onPeek }: Props) {
  const os = useOS()
  const w7 = useWin7()
  const [startOpen, setStartOpen] = useState(false)
  const [flyout, setFlyout] = useState<Flyout>(null)
  const [pinned, setPinned] = usePref<string[]>('win7.pinned', DEFAULT_PINNED)
  const [menu, setMenu] = useState<{ x: number; y: number; items: W7MenuItem[] } | null>(null)
  const [thumbs, setThumbs] = useState<{ appId: string; left: number } | null>(null)
  const thumbTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const peekTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const snapshot = useRef<string[] | null>(null)
  const orb = useRef<HTMLButtonElement>(null)
  const tray = useRef<HTMLDivElement>(null)
  const [volume, setVolume] = usePref('win7.volume', 70)
  const [muted, setMuted] = usePref('win7.muted', false)

  const toggleStart = useCallback(() => { setFlyout(null); setStartOpen(o => !o) }, [])

  // Keyboard: Ctrl+Esc / Windows key toggles Start; Alt+F4 closes; Win+D shows desktop.
  useEffect(() => {
    let metaAlone = false
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Meta') { metaAlone = true; return }
      metaAlone = false
      if (e.ctrlKey && e.key === 'Escape') { e.preventDefault(); toggleStart() }
      else if (e.key === 'Escape') { setStartOpen(false); setFlyout(null) }
      else if (e.altKey && e.key === 'F4' && os.activeId) { e.preventDefault(); os.close(os.activeId) }
    }
    const up = (e: KeyboardEvent) => { if (e.key === 'Meta' && metaAlone) toggleStart(); metaAlone = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [os, toggleStart])

  // A window opening or gaining focus cancels "show desktop".
  useEffect(() => { if (os.activeId) snapshot.current = null }, [os.activeId])

  const showDesktop = () => {
    setStartOpen(false); setFlyout(null); onPeek(false)
    if (snapshot.current) {
      const ids = snapshot.current
      snapshot.current = null
      const order = os.windows.filter(w => ids.includes(w.id)).sort((a, b) => a.z - b.z)
      order.forEach(w => os.focus(w.id))
      return
    }
    const visible = os.windows.filter(w => !w.minimized)
    if (!visible.length) return
    visible.forEach(w => os.minimize(w.id))
    snapshot.current = visible.map(w => w.id)
  }

  // Groups: pinned programs first, then running programs in launch order.
  const groups: { appId: string; wins: WinState[] }[] = []
  for (const id of pinned) if (os.apps[id]) groups.push({ appId: id, wins: [] })
  for (const w of os.windows) {
    if (w.appId === 'msgbox') continue
    let g = groups.find(x => x.appId === w.appId)
    if (!g) { g = { appId: w.appId, wins: [] }; groups.push(g) }
    g.wins.push(w)
  }
  // Message boxes get their own buttons (they are separate dialogs).
  for (const w of os.windows) if (w.appId === 'msgbox') groups.push({ appId: `msgbox:${w.id}`, wins: [w] })

  const groupClick = (g: { appId: string; wins: WinState[] }, el: HTMLElement) => {
    setStartOpen(false); setFlyout(null)
    if (!g.wins.length) { os.open(g.appId); return }
    if (g.wins.length === 1) { os.taskbarClick(g.wins[0].id); return }
    const r = el.getBoundingClientRect()
    setThumbs(t => (t?.appId === g.appId ? null : { appId: g.appId, left: r.left + r.width / 2 }))
  }

  const jumpList = (g: { appId: string; wins: WinState[] }, x: number) => {
    const app = os.apps[g.appId]
    const isPinned = pinned.includes(g.appId)
    const items: W7MenuItem[] = []
    if (app) {
      items.push(
        { label: app.title, bold: true, onClick: () => os.open(g.appId) },
        { label: isPinned ? 'Unpin this program from taskbar' : 'Pin this program to taskbar',
          onClick: () => setPinned(p => (isPinned ? p.filter(id => id !== g.appId) : [...p, g.appId])) },
      )
    }
    if (g.wins.length) items.push({ label: g.wins.length > 1 ? 'Close all windows' : 'Close window', onClick: () => g.wins.forEach(w => os.close(w.id)) })
    setMenu({ x, y: window.innerHeight - 42 - items.length * 28 - 10, items })
  }

  return (
    <>
      <div className="w7-taskbar" onContextMenu={e => e.preventDefault()}>
        <button ref={orb} className={`w7-orb${startOpen ? ' open' : ''}`} title="Start" aria-label="Start" onClick={toggleStart}>
          <img src={ICONS.windows} alt="" />
        </button>
        <div className="w7-tasks">
          {groups.map(g => {
            const app = os.apps[g.appId] ?? os.apps.msgbox
            const icon = g.wins[0]?.icon ?? app?.icon
            const active = g.wins.some(w => w.id === os.activeId)
            const title = g.wins.length === 1 ? g.wins[0].title : app?.title
            return (
              <button
                key={g.appId}
                className={`w7-task${g.wins.length ? ' running' : ''}${active ? ' active' : ''}${g.wins.length > 1 ? ' stacked' : ''}`}
                title={title}
                onClick={e => groupClick(g, e.currentTarget)}
                onContextMenu={e => { e.preventDefault(); jumpList(g, e.clientX) }}
                onPointerEnter={e => {
                  if (!g.wins.length) return
                  const r = e.currentTarget.getBoundingClientRect()
                  clearTimeout(thumbTimer.current)
                  thumbTimer.current = setTimeout(() => setThumbs({ appId: g.appId, left: r.left + r.width / 2 }), 450)
                }}
                onPointerLeave={() => { clearTimeout(thumbTimer.current); thumbTimer.current = setTimeout(() => setThumbs(null), 400) }}
              >
                {icon && (icon.length <= 3 ? <span className="w7-task-glyph">{icon}</span> : <img src={icon} alt="" />)}
              </button>
            )
          })}
        </div>
        <div className="w7-tray" ref={tray}>
          <button className="w7-tray-btn" title="Show hidden icons" onClick={() => setFlyout(f => (f === 'hidden' ? null : 'hidden'))}>▴</button>
          <button className="w7-tray-btn" title="Action Center" onClick={() => setFlyout(f => (f === 'action' ? null : 'action'))}><img src={ICONS.flag} alt="" /></button>
          <button className="w7-tray-btn" title="Network: Internet access" onClick={() => setFlyout(f => (f === 'network' ? null : 'network'))}><img src={ICONS.network} alt="" /></button>
          <button className="w7-tray-btn" title={`Speakers: ${muted ? 'Muted' : `${volume}%`}`} onClick={() => setFlyout(f => (f === 'volume' ? null : 'volume'))}>
            <img src={muted ? ICONS.mute : ICONS.volume} alt="" />
          </button>
          <ClockButton onClick={() => setFlyout(f => (f === 'calendar' ? null : 'calendar'))} />
        </div>
        <button
          className="w7-show-desktop"
          title="Show desktop"
          aria-label="Show desktop"
          onClick={showDesktop}
          onPointerEnter={() => { peekTimer.current = setTimeout(() => onPeek(true), 500) }}
          onPointerLeave={() => { clearTimeout(peekTimer.current); onPeek(false) }}
        />
      </div>

      {startOpen && <StartMenu onClose={() => setStartOpen(false)} onPower={a => { setStartOpen(false); onPower(a) }} orb={orb} />}
      {flyout && (
        <TrayFlyout kind={flyout} tray={tray} onClose={() => setFlyout(null)} onToast={w7.toast}
          volume={{ volume, muted, setVolume: v => { setVolume(v); setMuted(false) }, toggleMute: () => setMuted(m => !m) }} />
      )}
      {thumbs && (
        <Thumbnails
          wins={groups.find(g => g.appId === thumbs.appId)?.wins ?? []}
          left={thumbs.left}
          onEnter={() => clearTimeout(thumbTimer.current)}
          onLeave={() => { thumbTimer.current = setTimeout(() => setThumbs(null), 300) }}
          onPick={id => { setThumbs(null); os.focus(id) }}
          onCloseWin={id => os.close(id)}
          onPeek={onPeek}
        />
      )}
      {menu && <W7ContextMenu {...menu} onClose={() => setMenu(null)} />}
    </>
  )
}

function Thumbnails({ wins, left, onEnter, onLeave, onPick, onCloseWin, onPeek }: {
  wins: WinState[]; left: number
  onEnter: () => void; onLeave: () => void
  onPick: (id: string) => void; onCloseWin: (id: string) => void; onPeek: (on: boolean) => void
}) {
  if (!wins.length) return null
  const width = wins.length * 168 + 12
  return (
    <div
      className="w7-thumbs"
      style={{ left: Math.max(4, Math.min(left - width / 2, window.innerWidth - width - 4)) }}
      onPointerEnter={onEnter}
      onPointerLeave={() => { onPeek(false); onLeave() }}
    >
      {wins.map(w => (
        <div key={w.id} className="w7-thumb" onClick={() => { onPeek(false); onPick(w.id) }}>
          <div className="w7-thumb-head">
            {w.icon && w.icon.length > 3 && <img src={w.icon} alt="" />}
            <span>{w.title}</span>
            <button aria-label="Close" onClick={e => { e.stopPropagation(); onCloseWin(w.id) }}>×</button>
          </div>
          <div className="w7-thumb-body">
            {w.icon && w.icon.length > 3 ? <img src={w.icon} alt="" /> : <span>{w.icon}</span>}
            {w.minimized && <em>Minimized</em>}
          </div>
        </div>
      ))}
    </div>
  )
}

function ClockButton({ onClick }: { onClick: () => void }) {
  const now = useClock(1000)
  return (
    <button className="w7-clock" onClick={onClick} title={now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}>
      {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}<br />
      {now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' })}
    </button>
  )
}

interface VolumeState { volume: number; muted: boolean; setVolume: (v: number) => void; toggleMute: () => void }

function TrayFlyout({ kind, tray, onClose, onToast, volume }: {
  kind: Exclude<Flyout, null>; tray: RefObject<HTMLElement | null>
  onClose: () => void; onToast: (t: string) => void; volume: VolumeState
}) {
  const ref = useOutside<HTMLDivElement>(onClose, [tray])
  return (
    <div ref={ref} className={`w7-flyout w7-flyout-${kind}`}>
      {kind === 'calendar' && <CalendarFlyout />}
      {kind === 'volume' && <VolumeFlyout {...volume} />}
      {kind === 'network' && (
        <div className="w7-net">
          <div className="w7-fly-title">Currently connected to:</div>
          <div className="w7-net-row"><img src={ICONS.network} alt="" /><div><b>Network</b><br />Internet access</div></div>
          <div className="w7-fly-section">Wireless Network Connection</div>
          {['HomeNetwork', 'CoffeeShop_Free', 'NETGEAR-5G'].map((n, i) => (
            <button key={n} className="w7-net-ap" onClick={() => onToast(i === 0 ? `Already connected to ${n}.` : `Unable to connect to ${n}.`)}>
              <span>{n}</span><span className="bars">{'▮'.repeat(4 - i)}</span>
            </button>
          ))}
          <div className="w7-fly-link">Open Network and Sharing Center</div>
        </div>
      )}
      {kind === 'action' && (
        <div>
          <div className="w7-fly-title">No current issues detected</div>
          <p className="w7-fly-text">Windows has checked your computer and found nothing that needs your attention.</p>
          <div className="w7-fly-link">Open Action Center</div>
        </div>
      )}
      {kind === 'hidden' && (
        <div className="w7-hidden-icons">
          <span title="Safely Remove Hardware">⏏</span><span title="Windows Update">⟳</span><span title="Bluetooth Devices">ᛒ</span>
          <div className="w7-fly-link">Customize...</div>
        </div>
      )}
    </div>
  )
}

function VolumeFlyout({ volume, muted, setVolume, toggleMute }: VolumeState) {
  return (
    <div className="w7-volume">
      <input
        type="range" min={0} max={100} value={muted ? 0 : volume}
        aria-label="Volume"
        onChange={e => setVolume(Number(e.target.value))}
      />
      <div className="w7-volume-val">{muted ? 0 : volume}</div>
      <button className={`w7-mute${muted ? ' on' : ''}`} onClick={toggleMute} title={muted ? 'Unmute Speakers' : 'Mute Speakers'}>
        <img src={muted ? ICONS.mute : ICONS.volume} alt="" />
      </button>
      <div className="w7-fly-link">Mixer</div>
    </div>
  )
}

function CalendarFlyout() {
  const now = useClock(1000)
  const [offset, setOffset] = useState(0)
  const view = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const first = view.getDay()
  const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
  const prevDays = new Date(view.getFullYear(), view.getMonth(), 0).getDate()
  const cells: { d: number; muted: boolean; today: boolean }[] = []
  for (let i = first - 1; i >= 0; i--) cells.push({ d: prevDays - i, muted: true, today: false })
  for (let d = 1; d <= days; d++) cells.push({ d, muted: false, today: offset === 0 && d === now.getDate() })
  while (cells.length < 42) cells.push({ d: cells.length - first - days + 1, muted: true, today: false })
  return (
    <div className="w7-cal">
      <div className="w7-cal-date">{now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
      <div className="w7-cal-body">
        <div className="w7-cal-month">
          <div className="w7-cal-nav">
            <button onClick={() => setOffset(o => o - 1)} aria-label="Previous month">◂</button>
            <span>{view.toLocaleDateString([], { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => setOffset(o => o + 1)} aria-label="Next month">▸</button>
          </div>
          <div className="w7-cal-grid">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d} className="dn">{d}</span>)}
            {cells.map((c, i) => <span key={i} className={`${c.muted ? 'muted' : ''}${c.today ? ' today' : ''}`}>{c.d}</span>)}
          </div>
        </div>
        <AnalogClock now={now} />
      </div>
      <div className="w7-cal-time">{now.toLocaleTimeString()}</div>
      <div className="w7-fly-link">Change date and time settings...</div>
    </div>
  )
}

function AnalogClock({ now }: { now: Date }) {
  const s = now.getSeconds(), m = now.getMinutes() + s / 60, h = (now.getHours() % 12) + m / 60
  const hand = (deg: number, len: number, w: number, color: string) => (
    <line x1="50" y1="50" x2={50 + len * Math.sin((deg * Math.PI) / 180)} y2={50 - len * Math.cos((deg * Math.PI) / 180)}
      stroke={color} strokeWidth={w} strokeLinecap="round" />
  )
  return (
    <svg className="w7-analog" viewBox="0 0 100 100" aria-hidden>
      <defs>
        <radialGradient id="w7-clockface" cx=".4" cy=".35"><stop stopColor="#fff" /><stop offset="1" stopColor="#c9dbe9" /></radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#w7-clockface)" stroke="#7a95aa" strokeWidth="3" />
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={50 + 38 * Math.sin((i * Math.PI) / 6)} cy={50 - 38 * Math.cos((i * Math.PI) / 6)} r={i % 3 ? 1.3 : 2.4} fill="#456" />
      ))}
      {hand(h * 30, 22, 4, '#234')}
      {hand(m * 6, 32, 3, '#234')}
      {hand(s * 6, 36, 1.2, '#c33')}
      <circle cx="50" cy="50" r="3" fill="#234" />
    </svg>
  )
}
