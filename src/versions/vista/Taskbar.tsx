import { useRef, useState, type KeyboardEvent } from 'react'
import { Icon, useClickOutside, useClock, useFS, useOS, type FileSystem } from '../../core'
import { FLAG_SVG, ICONS } from '../nt6shared/icons'
import { runCommand, trayTime } from '../nt6shared/shared'
import { DOCS, RECYCLE_DIR, USER_HOME } from './data'

export type PowerAction = 'shutdown' | 'restart' | 'logoff' | 'lock' | 'switch' | 'sleep'

interface Entry {
  label: string
  icon: string
  run: () => void
  hint?: string
}

/** Every file under `dir`, depth-first (for Start Search). */
function walkFiles(fs: FileSystem, dir: string, out: { name: string; path: string }[] = []) {
  if (!fs.isDir(dir)) return out
  for (const n of fs.list(dir)) {
    if (n.type === 'dir') walkFiles(fs, n.path, out)
    else out.push({ name: n.name, path: n.path })
  }
  return out
}

function StartMenu({ onClose, onPower, onToggleSidebar }: { onClose: () => void; onPower: (a: PowerAction) => void; onToggleSidebar: () => void }) {
  const os = useOS()
  const fs = useFS()
  const [query, setQuery] = useState('')
  const [all, setAll] = useState(false)
  const [hot, setHot] = useState(0)
  const [hoverIcon, setHoverIcon] = useState<string | null>(null)
  const [powerMenu, setPowerMenu] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const go = (fn: () => void) => () => { fn(); onClose() }
  const app = (id: string, args?: Record<string, unknown>) => () => os.open(id, args)

  const pinned: Entry[] = [
    { label: 'Internet Explorer', hint: 'Internet', icon: ICONS.ie, run: app('browser') },
    { label: 'Windows Mail', hint: 'E-mail', icon: ICONS.textfile, run: () => os.alert('Windows Mail', 'No e-mail account has been set up yet.', 'info') },
  ]
  const recent: Entry[] = [
    { label: 'Welcome Center', icon: ICONS.welcome, run: app('vista-welcome') },
    { label: 'Notepad', icon: ICONS.notepad, run: app('notepad') },
    { label: 'Paint', icon: ICONS.paint, run: app('paint') },
    { label: 'Calculator', icon: ICONS.calculator, run: app('calculator') },
    { label: 'Minesweeper', icon: ICONS.mine, run: app('minesweeper') },
    { label: 'Windows Explorer', icon: ICONS.folder, run: app('explorer', { path: DOCS }) },
  ]
  const programs: Entry[] = [
    ...pinned, ...recent,
    { label: 'Control Panel', icon: ICONS.controlPanel, run: app('vista-cpanel') },
    { label: 'Personalization', icon: ICONS.display, run: app('vista-personalize') },
    { label: 'Windows Sidebar', icon: ICONS.display, run: onToggleSidebar },
    { label: 'Recycle Bin', icon: ICONS.recycle, run: app('explorer', { path: RECYCLE_DIR, title: 'Recycle Bin' }) },
    { label: 'About Windows (winver)', icon: ICONS.computer, run: app('about') },
  ].sort((a, b) => a.label.localeCompare(b.label))

  const q = query.trim().toLowerCase()
  const results = (() => {
    if (!q) return null
    const progs = programs.filter(p => p.label.toLowerCase().includes(q) || p.hint?.toLowerCase().includes(q))
    const files = walkFiles(fs, USER_HOME)
      .filter(f => f.name.toLowerCase().includes(q))
      .slice(0, 6)
      .map<Entry>(f => ({ label: f.name, icon: ICONS.textfile, run: () => os.openPath(f.path) }))
    return { progs, files, flat: [...progs, ...files] }
  })()

  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { e.preventDefault(); if (query) setQuery(''); else onClose() }
    if (!results) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHot(h => Math.min(h + 1, results.flat.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHot(h => Math.max(h - 1, 0)) }
    if (e.key === 'Enter') {
      e.preventDefault()
      const pick = results.flat[hot]
      if (pick) go(pick.run)()
      else if (runCommand(os, query, { control: 'vista-cpanel' })) onClose()
    }
  }

  const row = (it: Entry, i?: number) => (
    <button
      key={it.label}
      className={`vista-sm-item${i !== undefined && i === hot ? ' hot' : ''}`}
      onClick={go(it.run)}
      onPointerEnter={() => i !== undefined && setHot(i)}
    >
      <Icon src={it.icon} size={i === undefined ? 32 : 16} />
      <span>{it.label}{it.hint && i === undefined && <small>{it.hint}</small>}</span>
    </button>
  )

  const places: Entry[] = [
    { label: 'Documents', icon: ICONS.documents, run: app('explorer', { path: DOCS }) },
    { label: 'Pictures', icon: ICONS.pictures, run: app('explorer', { path: `${USER_HOME}/Pictures` }) },
    { label: 'Music', icon: ICONS.music, run: app('explorer', { path: `${USER_HOME}/Music` }) },
    { label: 'Games', icon: ICONS.cards, run: app('minesweeper') },
    { label: 'Computer', icon: ICONS.computer, run: app('explorer', { path: '' }) },
    { label: 'Network', icon: ICONS.network, run: () => os.alert('Network', 'Network discovery is turned off.', 'warning') },
    { label: 'Control Panel', icon: ICONS.controlPanel, run: app('vista-cpanel') },
    { label: 'Help and Support', icon: ICONS.help, run: () => os.alert('Windows Help and Support', 'Help and Support is not available in this simulation.', 'info') },
  ]

  let index = 0
  return (
    <div className="vista-startmenu" onContextMenu={e => e.preventDefault()}>
      <div className="vista-sm-pic"><Icon src={hoverIcon ?? ICONS.user} size={48} /></div>
      <div className="vista-sm-left">
        <div className="vista-sm-list">
          {results ? (
            <>
              {results.progs.length > 0 && <div className="vista-sm-group">Programs</div>}
              {results.progs.map(p => row(p, index++))}
              {results.files.length > 0 && <div className="vista-sm-group">Files</div>}
              {results.files.map(f => row(f, index++))}
              {results.flat.length === 0 && <div className="vista-sm-empty">No items match your search.<br /><small>Press Enter to run “{query}”.</small></div>}
              <div className="vista-sm-grow" />
              <button className="vista-sm-item vista-sm-searchall" onClick={go(() => os.open('explorer', { path: USER_HOME }))}>
                <Icon src={ICONS.search} size={16} /><span>Search the computer</span>
              </button>
            </>
          ) : all ? (
            <>
              {programs.map(p => row(p, -1))}
              <div className="vista-sm-grow" />
            </>
          ) : (
            <>
              {pinned.map(p => row(p))}
              <div className="vista-sm-sep" />
              {recent.map(p => row(p))}
              <div className="vista-sm-grow" />
            </>
          )}
        </div>
        {!results && (
          <button className="vista-sm-all" onClick={() => { setAll(a => !a); searchRef.current?.focus() }}>
            {all ? <><span className="vista-sm-arrow back">◀</span> Back</> : <><span className="vista-sm-arrow">▶</span> All Programs</>}
          </button>
        )}
        <div className="vista-sm-search">
          <input
            ref={searchRef}
            autoFocus
            placeholder="Start Search"
            value={query}
            onChange={e => { setQuery(e.target.value); setHot(0) }}
            onKeyDown={onSearchKey}
            aria-label="Start Search"
          />
          <Icon src={ICONS.search} size={16} />
        </div>
      </div>
      <div className="vista-sm-right">
        <div className="vista-sm-user">User</div>
        {places.map((p, i) => (
          <button
            key={p.label}
            className={`vista-sm-place${i === 4 || i === 6 ? ' gap' : ''}`}
            onClick={go(p.run)}
            onPointerEnter={() => setHoverIcon(p.icon)}
            onPointerLeave={() => setHoverIcon(null)}
          >{p.label}</button>
        ))}
        <div className="vista-sm-grow" />
        <div className="vista-sm-power">
          <button className="vista-power-btn" title="Shut down" onClick={go(() => onPower('shutdown'))}>
            <svg viewBox="0 0 16 16"><path d="M5 4.2a5 5 0 1 0 6 0" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /><path d="M8 2v6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
          <button className="vista-lock-btn" title="Lock this computer" onClick={go(() => onPower('lock'))}>
            <Icon src={ICONS.lock} size={16} />
          </button>
          <div className="vista-power-more">
            <button className="vista-arrow-btn" onClick={() => setPowerMenu(o => !o)} aria-label="More options">▶</button>
            {powerMenu && (
              <div className="menu-dropdown vista-power-menu">
                {([['switch', 'Switch User'], ['logoff', 'Log Off'], ['lock', 'Lock'], null, ['restart', 'Restart'], ['sleep', 'Sleep'], ['shutdown', 'Shut Down']] as const).map((it, i) =>
                  it === null ? <div key={i} className="menu-separator" /> : (
                    <div key={it[0]} className="menu-item" onClick={go(() => onPower(it[0]))}>
                      <span className="menu-check" /><span className="menu-label">{it[1]}</span>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Taskbar({ onPower, sidebar, onToggleSidebar }: { onPower: (a: PowerAction) => void; sidebar: boolean; onToggleSidebar: () => void }) {
  const os = useOS()
  const now = useClock(10_000)
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false))

  return (
    <div className="vista-taskbar" onContextMenu={e => e.preventDefault()}>
      <div className="vista-start-wrap" ref={ref}>
        <button className={`vista-orb${open ? ' pressed' : ''}`} onClick={() => setOpen(o => !o)} aria-label="Start">
          <img src={FLAG_SVG} alt="" />
        </button>
        {open && <StartMenu onClose={() => setOpen(false)} onPower={onPower} onToggleSidebar={onToggleSidebar} />}
      </div>
      <div className="vista-quicklaunch">
        <button title="Show desktop" onClick={() => os.windows.forEach(w => os.minimize(w.id))}><Icon src={ICONS.display} size={16} /></button>
        <button title="Internet Explorer" onClick={() => os.open('browser')}><Icon src={ICONS.ie} size={16} /></button>
      </div>
      <div className="vista-tasks">
        {os.windows.map(w => (
          <button key={w.id} className={`vista-task${w.id === os.activeId ? ' active' : ''}`} onClick={() => os.taskbarClick(w.id)} title={w.title}>
            <Icon src={w.icon} size={16} /><span>{w.title}</span>
          </button>
        ))}
      </div>
      <div className="vista-tray">
        <button className={`vista-tray-btn${sidebar ? ' on' : ''}`} title="Windows Sidebar" onClick={onToggleSidebar}><Icon src={ICONS.display} size={16} /></button>
        <Icon src={ICONS.network} size={16} />
        <Icon src={ICONS.speaker} size={16} />
        <span className="vista-clock" title={now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}>{trayTime(now)}</span>
      </div>
    </div>
  )
}
