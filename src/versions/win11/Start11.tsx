import { useEffect, useMemo, useRef, useState } from 'react'
import { baseName, useFS, useOS } from '../../core'
import {
  APP_ICONS, DOCUMENTS_DIR, Flyout, Glyph, PICTURES_DIR, PowerMenu, RECYCLE_BIN, iconForPath, recentDocuments, timeAgo,
  useLaunchables, useModern, useOpenSettings, type Launchable,
} from '../modern'

/** Pinned tiles: [label, icon, action] built from the shell's apps. */
function usePinned(): Launchable[] {
  const os = useOS()
  const openSettings = useOpenSettings()
  return useMemo(() => {
    const app = (id: string, label?: string): Launchable | null => {
      const a = os.apps[id]
      return a ? { key: `pin:${id}`, label: label ?? a.title, icon: a.icon ?? APP_ICONS.doc, kind: 'App', open: () => os.open(id) } : null
    }
    const list: (Launchable | null)[] = [
      app('browser', 'Edge'), app('notepad'), app('explorer'), app('settings'), app('store'), app('calculator'),
      app('paint'),
      { key: 'pin:pc', label: 'This PC', icon: APP_ICONS.pc, kind: 'App', open: () => os.open('explorer', { path: '' }) },
      { key: 'pin:bin', label: 'Recycle Bin', icon: APP_ICONS.bin, kind: 'App', open: () => os.open('explorer', { path: RECYCLE_BIN }) },
      { key: 'pin:docs', label: 'Documents', icon: APP_ICONS.folder, kind: 'Folder', open: () => os.open('explorer', { path: DOCUMENTS_DIR }) },
      { key: 'pin:pics', label: 'Pictures', icon: APP_ICONS.photo, kind: 'Folder', open: () => os.open('explorer', { path: PICTURES_DIR }) },
      { key: 'pin:personalize', label: 'Personalization', icon: APP_ICONS.settings, kind: 'Settings', open: () => openSettings('personalization') },
      app('about', 'winver'),
    ]
    return list.filter((l): l is Launchable => l !== null)
  }, [os, openSettings])
}

export function StartMenu11({ onClose, onSearch, onLock }: { onClose: () => void; onSearch: (q: string) => void; onLock: () => void }) {
  const os = useOS()
  const fs = useFS()
  const m = useModern()
  const pinned = usePinned()
  const { apps } = useLaunchables()
  const openSettings = useOpenSettings()
  const [view, setView] = useState<'pinned' | 'all'>('pinned')
  const [popup, setPopup] = useState<'power' | 'user' | null>(null)
  const launch = (l: { open: () => void }) => { onClose(); l.open() }

  const recommended = (() => {
    const docs = recentDocuments(fs, 6).map(d => ({
      key: d.path, label: baseName(d.path), icon: iconForPath(fs, d.path), sub: timeAgo(d.modified), open: () => os.openPath(d.path),
    }))
    const fill = [
      { key: 'r:explorer', label: 'File Explorer', icon: APP_ICONS.folder, sub: 'Recently added', open: () => os.open('explorer') },
      { key: 'r:calc', label: 'Calculator', icon: APP_ICONS.calculator, sub: 'Recently added', open: () => os.open('calculator') },
    ]
    return [...docs, ...fill].slice(0, 6)
  })()

  // Grouped alphabetical list for "All apps".
  const groups = useMemo(() => {
    const map = new Map<string, Launchable[]>()
    for (const a of apps) {
      const letter = /[a-z]/i.test(a.label[0]) ? a.label[0].toUpperCase() : '#'
      map.set(letter, [...(map.get(letter) ?? []), a])
    }
    return [...map.entries()]
  }, [apps])

  return (
    <Flyout className="start11" label="Start">
      <div className="start11-main">
        <label className="start11-search">
          <Glyph name="search" size={16} />
          <input autoFocus placeholder="Search for apps, settings, and documents" onChange={e => onSearch(e.target.value)} />
        </label>

        {view === 'pinned' ? (
          <>
            <div className="start11-heading">
              <strong>Pinned</strong>
              <button className="start11-small" onClick={() => setView('all')}>All apps <Glyph name="chevron" size={10} /></button>
            </div>
            <div className="start11-pinned">
              {pinned.map(p => (
                <button key={p.key} className="start11-pin" onClick={() => launch(p)}>
                  <img src={p.icon} alt="" /><span>{p.label}</span>
                </button>
              ))}
            </div>
            <div className="start11-heading">
              <strong>Recommended</strong>
              <button className="start11-small" onClick={() => launch({ open: () => os.open('explorer', { path: DOCUMENTS_DIR }) })}>More <Glyph name="chevron" size={10} /></button>
            </div>
            <div className="start11-recommended">
              {recommended.map(r => (
                <button key={r.key} className="start11-rec" onClick={() => launch(r)}>
                  <img src={r.icon} alt="" />
                  <span>{r.label}<small>{r.sub}</small></span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="start11-heading">
              <strong>All apps</strong>
              <button className="start11-small" onClick={() => setView('pinned')}><Glyph name="back" size={10} /> Back</button>
            </div>
            <div className="start11-all">
              {groups.map(([letter, list]) => (
                <div key={letter}>
                  <div className="start11-letter">{letter}</div>
                  {list.map(a => (
                    <button key={a.key} className="start11-allitem" onClick={() => launch(a)}>
                      <img src={a.icon} alt="" /><span>{a.label}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="start11-footer">
        <div className="start11-popwrap">
          <button className="start11-user" onClick={() => setPopup(popup === 'user' ? null : 'user')}>
            <img src={APP_ICONS.user} alt="" /><span>{m.userName}</span>
          </button>
          {popup === 'user' && (
            <div className="m-powermenu m-flyout start11-usermenu" role="menu">
              <button role="menuitem" onClick={() => { onClose(); openSettings('accounts/info') }}><Glyph name="gear" size={16} /> Change account settings</button>
              <button role="menuitem" onClick={onLock}><Glyph name="lock" size={16} /> Lock</button>
              <button role="menuitem" onClick={() => { onClose(); m.setPower('signout') }}><Glyph name="person" size={16} /> Sign out</button>
            </div>
          )}
        </div>
        <div className="start11-popwrap">
          <button className="start11-power" title="Power" aria-label="Power" onClick={() => setPopup(popup === 'power' ? null : 'power')}>
            <Glyph name="power" size={18} />
          </button>
          {popup === 'power' && <PowerMenu className="start11-powermenu" onDone={onClose} />}
        </div>
      </div>
    </Flyout>
  )
}

const CHIPS = ['All', 'Apps', 'Documents', 'Settings', 'Web'] as const
type Chip = (typeof CHIPS)[number]

export function Search11({ query, setQuery, onClose }: { query: string; setQuery: (q: string) => void; onClose: () => void }) {
  const os = useOS()
  const { apps, search } = useLaunchables()
  const [chip, setChip] = useState<Chip>('All')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const el = input.current
    if (!el) return
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
  }, [])

  const webSearch: Launchable | null = query.trim() ? {
    key: 'web', label: query.trim(), icon: APP_ICONS.edge, kind: 'App', subtitle: 'See web results',
    open: () => os.open('browser', { url: `https://www.bing.com/search?q=${encodeURIComponent(query.trim())}` }),
  } : null

  const kindFor: Record<Chip, Launchable['kind'][] | null> = { All: null, Apps: ['App'], Documents: ['Document', 'Folder'], Settings: ['Settings'], Web: [] }
  const allowed = kindFor[chip]
  const results = query.trim()
    ? [...search(query).filter(r => !allowed || allowed.includes(r.kind)), ...(webSearch && (chip === 'All' || chip === 'Web') ? [webSearch] : [])]
    : []
  const best = results[0]
  const launch = (l: Launchable) => { onClose(); l.open() }

  return (
    <Flyout className="search11" label="Search">
      <label className="start11-search search11-box">
        <Glyph name="search" size={16} />
        <input
          ref={input}
          value={query}
          placeholder="Search for apps, settings, and documents"
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && best) launch(best) }}
        />
      </label>
      <div className="search11-chips">
        {CHIPS.map(c => <button key={c} className={chip === c ? 'active' : ''} onClick={() => setChip(c)}>{c}</button>)}
      </div>

      {!query.trim() ? (
        <div className="search11-empty">
          <strong>Top apps</strong>
          <div className="search11-top">
            {apps.slice(0, 8).map(a => (
              <button key={a.key} className="start11-pin" onClick={() => launch(a)}><img src={a.icon} alt="" /><span>{a.label}</span></button>
            ))}
          </div>
          <strong>Quick searches</strong>
          <div className="search11-quick">
            {['Weather', 'Top news', 'Today in history', 'New movies'].map(q => (
              <button key={q} onClick={() => setQuery(q)}><Glyph name="search" size={12} /> {q}</button>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="search11-none">No results found for “{query}”</div>
      ) : (
        <div className="search11-results">
          <div className="search11-list">
            <strong>Best match</strong>
            {results.slice(0, 9).map((r, i) => (
              <button key={r.key} className={`search11-result${i === 0 ? ' best' : ''}`} onClick={() => launch(r)}>
                <img src={r.icon} alt="" />
                <span>{r.label}<small>{r.key === 'web' ? 'Search the web' : r.kind}</small></span>
              </button>
            ))}
          </div>
          {best && (
            <div className="search11-preview">
              <img src={best.icon} alt="" />
              <b>{best.label}</b>
              <small>{best.subtitle ?? best.kind}</small>
              <button className="btn primary" onClick={() => launch(best)}>Open</button>
            </div>
          )}
        </div>
      )}
    </Flyout>
  )
}
