import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useFS, useOS, type FileSystem, type FsNode } from '../../core'
import { iconForNode } from './Desktop'
import { ICONS } from './icons'
import { PROGRAMS, type Program } from './programs'
import { PATHS } from './shell'
import { useOutside } from './useOutside'

export type PowerAction = 'shutdown' | 'restart' | 'sleep' | 'logoff'

interface Props {
  onClose: () => void
  onPower: (a: PowerAction) => void
  /** The Start orb (clicks on it are not "outside"; it toggles the menu itself). */
  orb: RefObject<HTMLElement | null>
}

/** Every file under `dir` (depth-first), skipping the Recycle Bin. */
function walk(fs: FileSystem, dir: string, out: FsNode[] = []): FsNode[] {
  for (const n of fs.list(dir)) {
    if (n.path === PATHS.recycle) continue
    out.push(n)
    if (n.type === 'dir') walk(fs, n.path, out)
  }
  return out
}

const PLACES: { label: string; path?: string; app?: string; icon: string }[] = [
  { label: 'Documents', path: PATHS.documents, icon: ICONS.folder },
  { label: 'Pictures', path: PATHS.pictures, icon: ICONS.image },
  { label: 'Music', path: PATHS.music, icon: ICONS.folder },
  { label: 'Downloads', path: PATHS.downloads, icon: ICONS.folder },
  { label: 'Computer', path: PATHS.computer, icon: ICONS.computer },
  { label: 'Control Panel', app: 'personalize', icon: ICONS.settings },
  { label: 'Help and Support', app: 'help', icon: ICONS.help },
]

export function StartMenu({ onClose, onPower, orb }: Props) {
  const os = useOS()
  const fs = useFS()
  const [query, setQuery] = useState('')
  const [allPrograms, setAllPrograms] = useState(false)
  const [picture, setPicture] = useState<string>(ICONS.user)
  const [powerMenu, setPowerMenu] = useState(false)
  const search = useRef<HTMLInputElement>(null)
  const ref = useOutside<HTMLDivElement>(onClose, [orb])

  useEffect(() => { search.current?.focus() }, [])

  const launch = (appId: string, args?: Record<string, unknown>) => { onClose(); os.open(appId, args) }
  const q = query.trim().toLowerCase()

  const programs = useMemo(() => {
    if (q) return PROGRAMS.filter(p => `${p.name} ${p.keywords}`.toLowerCase().includes(q))
    if (allPrograms) return [...PROGRAMS].sort((a, b) => a.name.localeCompare(b.name))
    return PROGRAMS.filter(p => p.frequent)
  }, [q, allPrograms])

  const files = useMemo(
    () => (q ? walk(fs, 'C:').filter(n => n.name.toLowerCase().includes(q)).slice(0, 10) : []),
    [fs, q, fs.getVersion()], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const firstResult = (): (() => void) | null => {
    if (programs[0]) { const p = programs[0]; return () => launch(p.id) }
    if (files[0]) { const f = files[0]; return () => { onClose(); os.openPath(f.path) } }
    return null
  }

  const programButton = (p: Program) => (
    <button key={p.id} className="w7-prog" onClick={() => launch(p.id)} onPointerEnter={() => setPicture(p.icon)}>
      <img src={p.icon} alt="" /><span>{p.name}</span>
    </button>
  )

  const renderAll = () => {
    const loose = programs.filter(p => !p.folder)
    const folders = ['Accessories', 'Games', 'Maintenance'] as const
    return (
      <>
        {loose.map(p => (
          <button key={p.id} className="w7-prog small" onClick={() => launch(p.id)}><img src={p.icon} alt="" /><span>{p.name}</span></button>
        ))}
        {folders.map(f => <ProgramFolder key={f} name={f} programs={programs.filter(p => p.folder === f)} onLaunch={launch} />)}
      </>
    )
  }

  return (
    <div className="w7-start" ref={ref} onContextMenu={e => e.preventDefault()}>
      <div className="w7-start-left">
        <div className="w7-start-programs">
          {q ? (
            <>
              {programs.length > 0 && <div className="w7-start-heading">Programs ({programs.length})</div>}
              {programs.map(p => (
                <button key={p.id} className="w7-prog small" onClick={() => launch(p.id)}><img src={p.icon} alt="" /><span>{p.name}</span></button>
              ))}
              {files.length > 0 && <div className="w7-start-heading">Files ({files.length})</div>}
              {files.map(f => (
                <button key={f.path} className="w7-prog small" title={f.path} onClick={() => { onClose(); os.openPath(f.path) }}>
                  <img src={iconForNode(f)} alt="" /><span>{f.name}</span>
                </button>
              ))}
              {!programs.length && !files.length && <div className="w7-start-empty">No items match your search.</div>}
            </>
          ) : allPrograms ? renderAll() : programs.map(programButton)}
        </div>
        {!q && (
          <button className="w7-all-programs" onClick={() => setAllPrograms(a => !a)}>
            <span className="arrow">{allPrograms ? '◂' : '▸'}</span>{allPrograms ? 'Back' : 'All Programs'}
          </button>
        )}
        <div className="w7-start-search">
          <input
            ref={search}
            type="search"
            placeholder="Search programs and files"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); firstResult()?.() }
              if (e.key === 'Escape') onClose()
            }}
          />
          <span className="w7-search-glass">⌕</span>
        </div>
      </div>
      <div className="w7-start-right" onPointerLeave={() => setPicture(ICONS.user)}>
        <div className="w7-avatar"><img src={picture} alt="" /></div>
        <button className="w7-place user" onClick={() => launch('explorer', { path: 'C:/Users/User' })} onPointerEnter={() => setPicture(ICONS.user)}>User</button>
        {PLACES.map((pl, i) => (
          <div key={pl.label}>
            {(i === 4 || i === 5) && <div className="w7-place-sep" />}
            <button
              className="w7-place"
              onPointerEnter={() => setPicture(pl.icon)}
              onClick={() => (pl.app ? launch(pl.app) : launch('explorer', { path: pl.path }))}
            >{pl.label}</button>
          </div>
        ))}
        <div className="w7-shutdown">
          <button className="w7-shutdown-btn" onClick={() => onPower('shutdown')}>Shut down</button>
          <button className={`w7-shutdown-arrow${powerMenu ? ' open' : ''}`} aria-label="Shut down options" onClick={() => setPowerMenu(m => !m)}>▸</button>
          {powerMenu && (
            <div className="context-menu w7-power-menu">
              <div className="menu-dropdown">
                {([['Switch user', 'logoff'], ['Log off', 'logoff'], ['Lock', 'logoff'], null, ['Restart', 'restart'], ['Sleep', 'sleep']] as const).map((entry, i) =>
                  entry === null ? <div key={i} className="menu-separator" /> : (
                    <div key={entry[0]} className="menu-item" onClick={() => onPower(entry[1])}>
                      <span className="menu-check" /><span className="menu-label">{entry[0]}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProgramFolder({ name, programs, onLaunch }: { name: string; programs: Program[]; onLaunch: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  if (!programs.length) return null
  return (
    <>
      <button className="w7-prog small folder" onClick={() => setOpen(o => !o)}>
        <img src={ICONS.folder} alt="" /><span>{name}</span>
      </button>
      {open && programs.map(p => (
        <button key={p.id} className="w7-prog small nested" onClick={() => onLaunch(p.id)}><img src={p.icon} alt="" /><span>{p.name}</span></button>
      ))}
    </>
  )
}
