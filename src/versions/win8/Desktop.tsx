import { useRef, useState, type RefObject } from 'react'
import { DesktopIcons, Icon, useClock, useOS, type FrameProps } from '../../core'
import { Glyph } from './Glyph'
import { glyphUri } from './icons'
import { useOutside } from './useOutside'

/** Flat Windows 8 frame: square corners, solid accent border, centred title, wide red close. */
export function Win8Frame({ win, active, dragHandle, onClose, onMinimize, onMaximize, children }: FrameProps) {
  return (
    <div className={`w8-frame${active ? ' active' : ''}${win.maximized ? ' maximized' : ''}`}>
      <div className="w8-titlebar" {...dragHandle}>
        <Icon src={win.icon} className="w8-title-icon" />
        <span className="w8-title">{win.title}</span>
        <div className="w8-controls">
          <button aria-label="Minimize" title="Minimize" onClick={onMinimize}><svg viewBox="0 0 10 10"><path d="M1 7h8" /></svg></button>
          {win.resizable && (
            <button aria-label="Maximize" title={win.maximized ? 'Restore Down' : 'Maximize'} onClick={onMaximize}>
              {win.maximized
                ? <svg viewBox="0 0 10 10"><path d="M3 1h6v6H7M1 3h6v6H1z" /></svg>
                : <svg viewBox="0 0 10 10"><path d="M1 1h8v8H1z" /></svg>}
            </button>
          )}
          <button className="close" aria-label="Close" title="Close" onClick={onClose}><svg viewBox="0 0 10 10"><path d="M1 1l8 8M9 1 1 9" /></svg></button>
        </div>
      </div>
      <div className="w8-content">{children}</div>
    </div>
  )
}

const PINNED = ['browser', 'explorer']

interface TaskbarProps {
  startButton: boolean
  onStart: () => void
}

/** Desktop taskbar. 8.1 adds the Start button back; Windows 8 relies on the bottom-left hot corner. */
export function Taskbar({ startButton, onStart }: TaskbarProps) {
  const os = useOS()
  const [cal, setCal] = useState(false)
  const clockRef = useRef<HTMLButtonElement>(null)
  const now = useClock(1000)
  const snapshot = useRef<string[] | null>(null)

  const groups: { appId: string; ids: string[] }[] = PINNED.filter(id => os.apps[id]).map(appId => ({ appId, ids: [] }))
  for (const w of os.windows) {
    let g = groups.find(x => x.appId === w.appId)
    if (!g) { g = { appId: w.appId, ids: [] }; groups.push(g) }
    g.ids.push(w.id)
  }

  const showDesktop = () => {
    if (snapshot.current) { snapshot.current.forEach(id => os.focus(id)); snapshot.current = null; return }
    const vis = os.windows.filter(w => !w.minimized).sort((a, b) => a.z - b.z).map(w => w.id)
    vis.forEach(id => os.minimize(id))
    snapshot.current = vis.length ? vis : null
  }

  return (
    <div className="w8-taskbar" onContextMenu={e => e.preventDefault()}>
      {startButton && (
        <button className="w8-startbtn" aria-label="Start" title="Start" onClick={onStart}><Glyph name="flag" /></button>
      )}
      <div className="w8-tasks">
        {groups.map(g => {
          const app = os.apps[g.appId]
          const active = g.ids.includes(os.activeId ?? '')
          const win = os.windows.find(w => w.id === g.ids[0])
          return (
            <button
              key={g.appId}
              className={`w8-task${g.ids.length ? ' running' : ''}${active ? ' active' : ''}`}
              title={win?.title ?? app?.title}
              onClick={() => {
                if (!g.ids.length) { os.open(g.appId); return }
                // Cycle through this app's windows; minimize when the last focused is clicked again.
                const idx = g.ids.indexOf(os.activeId ?? '')
                if (idx < 0) os.focus(g.ids[0])
                else if (g.ids.length === 1) os.taskbarClick(g.ids[0])
                else os.focus(g.ids[(idx + 1) % g.ids.length])
              }}
            >
              <Icon src={win?.icon ?? app?.icon} size={24} />
              {g.ids.length > 1 && <span className="count">{g.ids.length}</span>}
            </button>
          )
        })}
      </div>
      <div className="w8-tray">
        <span className="w8-tray-ico" title="Show hidden icons">▴</span>
        <span className="w8-tray-ico" title="Internet access"><Glyph name="network" /></span>
        <span className="w8-tray-ico" title="Speakers"><Glyph name="volume" /></span>
        <button ref={clockRef} className="w8-clock" onClick={() => setCal(c => !c)}>
          {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}<br />
          {now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' })}
        </button>
        <button className="w8-show-desktop" title="Show desktop" aria-label="Show desktop" onClick={showDesktop} />
      </div>
      {cal && <CalendarFlyout now={now} anchor={clockRef} onClose={() => setCal(false)} />}
    </div>
  )
}

function CalendarFlyout({ now, anchor, onClose }: { now: Date; anchor: RefObject<HTMLElement | null>; onClose: () => void }) {
  const ref = useOutside<HTMLDivElement>(onClose, [anchor])
  const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay()
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return (
    <div className="w8-calflyout" ref={ref}>
      <div className="big">{now.toLocaleTimeString()}</div>
      <div className="w8-link">{now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
      <div className="grid">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <b key={d}>{d}</b>)}
        {Array.from({ length: first }, (_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: days }, (_, i) => <span key={i} className={i + 1 === now.getDate() ? 'today' : ''}>{i + 1}</span>)}
      </div>
    </div>
  )
}

export function DesktopSurface({ computerName, wallpaper }: { computerName: string; wallpaper: string }) {
  const os = useOS()
  return (
    <div className="w8-desktop" style={{ background: wallpaper }} onPointerDown={e => e.target === e.currentTarget && os.blur()}>
      <DesktopIcons
        className="w8-icons"
        icons={[
          { id: 'recycle', label: 'Recycle Bin', icon: glyphUri('recycle', '#fff', '#5a6f80'), onOpen: () => os.open('explorer', { path: 'C:/$Recycle.Bin' }) },
          { id: 'pc', label: computerName, icon: glyphUri('computer', '#fff', '#1b6ec2'), onOpen: () => os.open('explorer', { path: '' }) },
        ]}
      />
    </div>
  )
}
