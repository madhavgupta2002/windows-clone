import { useEffect, useMemo, useState } from 'react'
import { Icon, useClickOutside, useClock, useOS, type WinState } from '../../core'
import { FLAG_SVG, ICONS } from '../nt6shared/icons'
import { trayTime } from '../nt6shared/shared'
import { balloonText, DOCS, RECYCLE_DIR } from './data'

/* ------------------------------ Start menu ------------------------------ */

interface ProgItem {
  label: string
  icon: string
  sub?: string
  bold?: boolean
  action?: () => void
  children?: ProgItem[]
}

/** Cascading All Programs flyout. */
function Flyout({ items, onDone }: { items: ProgItem[]; onDone: () => void }) {
  const [hover, setHover] = useState<number | null>(null)
  return (
    <div className="xp-flyout">
      {items.map((it, i) => (
        <div
          key={it.label}
          className={`xp-flyout-item${hover === i ? ' hot' : ''}`}
          onPointerEnter={() => setHover(i)}
          onClick={() => { if (it.action) { it.action(); onDone() } }}
        >
          <Icon src={it.icon} size={16} />
          <span>{it.label}</span>
          {it.children && <span className="xp-flyout-arrow">▶</span>}
          {it.children && hover === i && <Flyout items={it.children} onDone={onDone} />}
        </div>
      ))}
    </div>
  )
}

function StartMenu({ onClose, onLogOff, onTurnOff }: { onClose: () => void; onLogOff: () => void; onTurnOff: () => void }) {
  const os = useOS()
  const [allPrograms, setAllPrograms] = useState(false)
  const app = (id: string, args?: Record<string, unknown>) => () => os.open(id, args)
  const run = (fn: () => void) => () => { fn(); onClose() }

  const pinned: ProgItem[] = [
    { label: 'Internet', sub: 'Internet Explorer', icon: ICONS.ie, bold: true, action: app('browser') },
    { label: 'E-mail', sub: 'Outlook Express', icon: ICONS.textfile, bold: true, action: () => os.alert('Outlook Express', 'Outlook Express could not be started because no e-mail account is set up.', 'warning') },
  ]
  const frequent: ProgItem[] = [
    { label: 'Notepad', icon: ICONS.notepad, action: app('notepad') },
    { label: 'Paint', icon: ICONS.paint, action: app('paint') },
    { label: 'Calculator', icon: ICONS.calculator, action: app('calculator') },
    { label: 'Minesweeper', icon: ICONS.mine, action: app('minesweeper') },
    { label: 'Windows Explorer', icon: ICONS.folder, action: app('explorer', { path: DOCS }) },
  ]
  const programs: ProgItem[] = [
    { label: 'Accessories', icon: ICONS.folder, children: [
      { label: 'Calculator', icon: ICONS.calculator, action: app('calculator') },
      { label: 'Notepad', icon: ICONS.notepad, action: app('notepad') },
      { label: 'Paint', icon: ICONS.paint, action: app('paint') },
      { label: 'Run...', icon: ICONS.run, action: app('xp-run') },
      { label: 'Windows Explorer', icon: ICONS.folder, action: app('explorer', { path: DOCS }) },
    ] },
    { label: 'Games', icon: ICONS.folder, children: [{ label: 'Minesweeper', icon: ICONS.mine, action: app('minesweeper') }] },
    { label: 'Startup', icon: ICONS.folder, children: [{ label: '(Empty)', icon: '' }] },
    { label: 'Internet Explorer', icon: ICONS.ie, action: app('browser') },
    { label: 'Windows Media Player', icon: ICONS.music, action: () => os.alert('Windows Media Player', 'Windows Media Player cannot play this file.', 'error') },
  ]
  const places: ProgItem[] = [
    { label: 'My Documents', icon: ICONS.documents, bold: true, action: app('explorer', { path: DOCS }) },
    { label: 'My Pictures', icon: ICONS.pictures, bold: true, action: app('explorer', { path: `${DOCS}/My Pictures` }) },
    { label: 'My Music', icon: ICONS.music, bold: true, action: app('explorer', { path: `${DOCS}/My Music` }) },
    { label: 'My Computer', icon: ICONS.computer, bold: true, action: app('explorer', { path: '' }) },
  ]
  const system: ProgItem[] = [
    { label: 'Control Panel', icon: ICONS.controlPanel, action: app('xp-cpanel') },
    { label: 'Display Properties', icon: ICONS.display, action: app('xp-display') },
    { label: 'Help and Support', icon: ICONS.help, action: () => os.alert('Help and Support Center', 'Help and Support is not available in this simulation.', 'info') },
    { label: 'Search', icon: ICONS.search, action: app('explorer', { path: 'C:' }) },
    { label: 'Run...', icon: ICONS.run, action: app('xp-run') },
  ]

  const row = (it: ProgItem, size: number) => (
    <button key={it.label} className={`xp-sm-item${it.bold ? ' bold' : ''}`} onClick={it.action && run(it.action)}>
      <Icon src={it.icon} size={size} />
      <span>{it.label}{it.sub && <small>{it.sub}</small>}</span>
    </button>
  )

  return (
    <div className="xp-startmenu" onContextMenu={e => e.preventDefault()}>
      <div className="xp-sm-head"><Icon src={ICONS.user} size={42} className="xp-sm-pic" /><span>User</span></div>
      <div className="xp-sm-body">
        <div className="xp-sm-left">
          {pinned.map(it => row(it, 32))}
          <div className="xp-sm-sep" />
          {frequent.map(it => row(it, 32))}
          <div className="xp-sm-grow" />
          <div className="xp-sm-sep" />
          <div className="xp-sm-all" onPointerEnter={() => setAllPrograms(true)} onPointerLeave={() => setAllPrograms(false)} onClick={() => setAllPrograms(true)}>
            <span>All Programs</span><span className="xp-sm-all-arrow">▶</span>
            {allPrograms && <Flyout items={programs} onDone={onClose} />}
          </div>
        </div>
        <div className="xp-sm-right">
          {places.map(it => row(it, 24))}
          <div className="xp-sm-sep blue" />
          {system.map(it => row(it, 24))}
        </div>
      </div>
      <div className="xp-sm-foot">
        <button onClick={run(onLogOff)}><Icon src={ICONS.logoff} size={22} />Log Off</button>
        <button onClick={run(onTurnOff)}><Icon src={ICONS.power} size={22} />Turn Off Computer</button>
      </div>
    </div>
  )
}

/* ------------------------------ Task buttons ------------------------------ */

/** One button per app; several windows of the same app collapse into a group with a popup list. */
function TaskGroup({ wins }: { wins: WinState[] }) {
  const os = useOS()
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false))
  const first = wins[0]
  const active = wins.some(w => w.id === os.activeId)
  if (wins.length === 1) {
    return (
      <button className={`xp-task${active ? ' active' : ''}`} onClick={() => os.taskbarClick(first.id)} title={first.title}>
        <Icon src={first.icon} size={16} /><span>{first.title}</span>
      </button>
    )
  }
  const appTitle = os.apps[first.appId]?.title ?? first.title
  return (
    <div className="xp-task-group" ref={ref}>
      <button className={`xp-task${active || open ? ' active' : ''}`} onClick={() => setOpen(o => !o)} title={appTitle}>
        <Icon src={first.icon} size={16} /><span><b>{wins.length}</b> {appTitle}</span><span className="xp-task-caret">▾</span>
      </button>
      {open && (
        <div className="xp-task-popup menu-dropdown">
          {wins.map(w => (
            <div key={w.id} className="menu-item" onClick={() => { os.focus(w.id); setOpen(false) }}>
              <span className="menu-check"><Icon src={w.icon} size={16} /></span><span className="menu-label">{w.title}</span>
            </div>
          ))}
          <div className="menu-separator" />
          <div className="menu-item" onClick={() => { wins.forEach(w => os.minimize(w.id)); setOpen(false) }}><span className="menu-check" /><span className="menu-label">Minimize Group</span></div>
          <div className="menu-item" onClick={() => { wins.forEach(w => os.close(w.id)); setOpen(false) }}><span className="menu-check" /><span className="menu-label">Close Group</span></div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------ Taskbar ------------------------------ */

export function Taskbar({ onLogOff, onTurnOff }: { onLogOff: () => void; onTurnOff: () => void }) {
  const os = useOS()
  const now = useClock(10_000)
  const [startOpen, setStartOpen] = useState(false)
  const [balloon, setBalloon] = useState(true)
  const startRef = useClickOutside<HTMLDivElement>(startOpen, () => setStartOpen(false))

  useEffect(() => {
    const t = setTimeout(() => setBalloon(false), 14_000)
    return () => clearTimeout(t)
  }, [])

  const groups = useMemo(() => {
    const map = new Map<string, WinState[]>()
    for (const w of os.windows) map.set(w.appId, [...(map.get(w.appId) ?? []), w])
    return [...map.values()]
  }, [os.windows])

  return (
    <div className="xp-taskbar" onContextMenu={e => e.preventDefault()}>
      <div className="xp-start-wrap" ref={startRef}>
        <button className={`xp-start${startOpen ? ' pressed' : ''}`} onClick={() => setStartOpen(o => !o)}>
          <img src={FLAG_SVG} alt="" /><i>start</i>
        </button>
        {startOpen && <StartMenu onClose={() => setStartOpen(false)} onLogOff={onLogOff} onTurnOff={onTurnOff} />}
      </div>
      <div className="xp-quicklaunch">
        <button title="Show Desktop" onClick={() => os.windows.forEach(w => os.minimize(w.id))}><Icon src={ICONS.display} size={16} /></button>
        <button title="Launch Internet Explorer Browser" onClick={() => os.open('browser')}><Icon src={ICONS.ie} size={16} /></button>
        <button title="Recycle Bin" onClick={() => os.open('explorer', { path: RECYCLE_DIR, title: 'Recycle Bin' })}><Icon src={ICONS.recycle} size={16} /></button>
      </div>
      <div className="xp-tasks">
        {groups.map(g => <TaskGroup key={g[0].appId} wins={g} />)}
      </div>
      <div className="xp-tray">
        <Icon src={ICONS.shield} size={16} className="xp-tray-icon" />
        <Icon src={ICONS.speaker} size={16} className="xp-tray-icon" />
        <span className="xp-clock" title={now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}>{trayTime(now)}</span>
        {balloon && (
          <div className="xp-balloon" onClick={() => { setBalloon(false); os.alert(balloonText.title, 'The Windows XP tour is not installed on this computer.', 'info') }}>
            <button className="xp-balloon-x" aria-label="Close" onClick={e => { e.stopPropagation(); setBalloon(false) }}>×</button>
            <b><Icon src={ICONS.info} size={16} /> {balloonText.title}</b>
            <p>{balloonText.text}</p>
          </div>
        )}
      </div>
    </div>
  )
}
