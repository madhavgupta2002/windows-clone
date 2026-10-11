import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useClock, useFS, useOS } from '../../core'
import {
  APP_ICONS, DOCUMENTS_DIR, Flyout, Glyph, PICTURES_DIR, PowerMenu, recentDocuments, useLaunchables, useModern, useOpenSettings,
  type GlyphName, type Launchable,
} from '../modern'

type TileSize = 'small' | 'medium' | 'wide' | 'large'

interface Tile {
  key: string
  label: string
  size: TileSize
  icon?: string
  /** Live tile content (replaces the plain icon). */
  live?: 'calendar' | 'weather' | 'news' | 'photos'
  open: () => void
}

const HEADLINES = [
  'Scientists map the deepest ocean trench in record detail',
  'Local team clinches championship in overtime thriller',
  'New study finds coffee drinkers live longer',
  'Markets rally as tech shares climb',
]

function LiveTile({ tile }: { tile: Tile }) {
  const now = useClock(60_000)
  const [flip, setFlip] = useState(0)
  useEffect(() => {
    if (tile.live !== 'news' && tile.live !== 'photos') return
    const t = setInterval(() => setFlip(f => f + 1), 5000)
    return () => clearInterval(t)
  }, [tile.live])

  switch (tile.live) {
    case 'calendar':
      return (
        <div className="tile10-live tile10-calendar">
          <span>{now.toLocaleDateString('en-US', { weekday: 'long' })}</span>
          <b>{now.getDate()}</b>
        </div>
      )
    case 'weather':
      return (
        <div className="tile10-live tile10-weather">
          <img src={APP_ICONS.weather} alt="" />
          <div><b>72°</b><span>Mostly sunny</span><small>Seattle</small></div>
        </div>
      )
    case 'news':
      return (
        <div className="tile10-live tile10-news" key={flip}>
          <p>{HEADLINES[flip % HEADLINES.length]}</p>
        </div>
      )
    case 'photos':
      return <div className="tile10-live tile10-photos" style={{ '--hue': `${(flip * 70) % 360}deg` } as CSSProperties} />
    default:
      return null
  }
}

export function StartMenu10({ onClose, onSearch, onLock, onCalendar }: {
  onClose: () => void
  onSearch: (q: string) => void
  onLock: () => void
  onCalendar: () => void
}) {
  const os = useOS()
  const fs = useFS()
  const m = useModern()
  const { apps } = useLaunchables()
  const openSettings = useOpenSettings()
  const [expanded, setExpanded] = useState(false)
  const [popup, setPopup] = useState<'power' | 'user' | null>(null)
  const launch = (l: { open: () => void }) => { onClose(); l.open() }

  // Typing while Start is open goes to search, like the real thing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); onSearch(e.key) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSearch])

  const groups = useMemo(() => {
    const map = new Map<string, Launchable[]>()
    for (const a of apps) {
      const letter = /[a-z]/i.test(a.label[0]) ? a.label[0].toUpperCase() : '#'
      map.set(letter, [...(map.get(letter) ?? []), a])
    }
    return [...map.entries()]
  }, [apps])

  const app = (id: string, size: TileSize, label?: string): Tile[] => {
    const a = os.apps[id]
    return a ? [{ key: id, label: label ?? a.title, size, icon: a.icon, open: () => os.open(id) }] : []
  }
  const web = (q: string) => () => os.open('browser', { url: `https://www.bing.com/search?q=${encodeURIComponent(q)}` })
  const tileGroups: { name: string; tiles: Tile[] }[] = [
    {
      name: 'Productivity',
      tiles: [
        { key: 'cal', label: 'Calendar', size: 'wide', live: 'calendar', open: onCalendar },
        ...app('browser', 'medium'),
        { key: 'photos', label: 'Photos', size: 'medium', live: 'photos', open: () => os.open('explorer', { path: PICTURES_DIR }) },
        ...app('explorer', 'medium'),
        ...app('notepad', 'small'), ...app('calculator', 'small'), ...app('paint', 'small'), ...app('settings', 'small'),
      ],
    },
    {
      name: 'Explore',
      tiles: [
        ...app('store', 'wide'),
        { key: 'weather', label: 'Weather', size: 'medium', live: 'weather', open: web('weather') },
        { key: 'news', label: 'News', size: 'medium', live: 'news', open: web('news') },
      ],
    },
  ]

  const rail: [GlyphName, string, () => void][] = [
    ['documents', 'Documents', () => launch({ open: () => os.open('explorer', { path: DOCUMENTS_DIR }) })],
    ['pictures', 'Pictures', () => launch({ open: () => os.open('explorer', { path: PICTURES_DIR }) })],
    ['gear', 'Settings', () => launch({ open: () => openSettings('home') })],
  ]
  const recent = recentDocuments(fs, 3)

  return (
    <Flyout className="start10" label="Start">
      <div className={`start10-rail${expanded ? ' expanded' : ''}`}>
        <button className="start10-railbtn" title="Expand" onClick={() => setExpanded(e => !e)}><Glyph name="menu" size={16} /><span>START</span></button>
        <div className="start10-railspacer" />
        <div className="start10-popwrap">
          <button className="start10-railbtn" title={m.userName} onClick={() => setPopup(popup === 'user' ? null : 'user')}>
            <img src={APP_ICONS.user} alt="" /><span>{m.userName}</span>
          </button>
          {popup === 'user' && (
            <div className="m-powermenu m-flyout start10-pop" role="menu">
              <button role="menuitem" onClick={() => launch({ open: () => openSettings('accounts/info') })}>Change account settings</button>
              <button role="menuitem" onClick={onLock}>Lock</button>
              <button role="menuitem" onClick={() => { onClose(); m.setPower('signout') }}>Sign out</button>
            </div>
          )}
        </div>
        {rail.map(([g, label, fn]) => (
          <button key={label} className="start10-railbtn" title={label} onClick={fn}><Glyph name={g} size={16} /><span>{label}</span></button>
        ))}
        <div className="start10-popwrap">
          <button className="start10-railbtn" title="Power" onClick={() => setPopup(popup === 'power' ? null : 'power')}><Glyph name="power" size={16} /><span>Power</span></button>
          {popup === 'power' && <PowerMenu className="start10-pop" onDone={onClose} />}
        </div>
      </div>

      <div className="start10-list">
        {recent.length > 0 && <div className="start10-letter plain">Recently added</div>}
        {recent.map(r => (
          <button key={r.path} className="start10-item" onClick={() => launch({ open: () => os.openPath(r.path) })}>
            <span className="start10-itemicon"><img src={APP_ICONS.doc} alt="" /></span>{r.path.slice(r.path.lastIndexOf('/') + 1)}
          </button>
        ))}
        {groups.map(([letter, list]) => (
          <div key={letter}>
            <div className="start10-letter">{letter}</div>
            {list.map(a => (
              <button key={a.key} className="start10-item" onClick={() => launch(a)}>
                <span className="start10-itemicon"><img src={a.icon} alt="" /></span>{a.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="start10-tiles">
        {tileGroups.map(g => (
          <section key={g.name}>
            <h3>{g.name}</h3>
            <div className="start10-tilegrid">
              {g.tiles.map(t => (
                <button key={t.key} className={`tile10 ${t.size}${t.live ? ' live' : ''}`} onClick={() => launch(t)} title={t.label}>
                  {t.live ? <LiveTile tile={t} /> : <img src={t.icon} alt="" />}
                  {t.size !== 'small' && <span className="tile10-label">{t.label}</span>}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Flyout>
  )
}

export function Search10({ query, cortana, onClose, onQuery }: {
  query: string
  cortana: boolean
  onClose: () => void
  onQuery: (q: string) => void
}) {
  const os = useOS()
  const { userName } = useModern()
  const { apps, search } = useLaunchables()
  const launch = (l: Launchable) => { onClose(); l.open() }
  const q = query.trim()
  const results = q ? search(q) : []
  const web: Launchable | null = q ? {
    key: 'web', label: `${q} - See web results`, icon: APP_ICONS.edge, kind: 'App',
    open: () => os.open('browser', { url: `https://www.bing.com/search?q=${encodeURIComponent(q)}` }),
  } : null
  const best = results[0] ?? web

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' && best) launch(best) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const byKind = (k: Launchable['kind'][]) => results.slice(1).filter(r => k.includes(r.kind)).slice(0, 4)
  const sections: [string, Launchable[]][] = [
    ['Apps', byKind(['App'])], ['Settings', byKind(['Settings'])], ['Documents', byKind(['Document', 'Folder'])],
  ]

  return (
    <Flyout className="search10" label="Search">
      <div className="search10-tabs">
        {['All', 'Apps', 'Documents', 'Web', 'More ▾'].map((t, i) => <span key={t} className={i === 0 ? 'active' : ''}>{t}</span>)}
      </div>
      {!q ? (
        <div className="search10-home">
          {cortana && (
            <div className="search10-cortana">
              <span className="search10-ring" />
              <div><b>{greeting}, {userName}.</b><small>Ask me anything — or type to search apps, settings and files.</small></div>
            </div>
          )}
          <h4>Top apps</h4>
          <div className="search10-top">
            {apps.slice(0, 6).map(a => (
              <button key={a.key} onClick={() => launch(a)}><img src={a.icon} alt="" /><span>{a.label}</span></button>
            ))}
          </div>
          <h4>Quick searches</h4>
          <div className="search10-quick">
            {['Weather today', 'Top news', 'Today in history'].map(s => (
              <button key={s} onClick={() => onQuery(s)}><Glyph name="search" size={14} /> {s}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="search10-results">
          <div className="search10-list">
            {best && (
              <>
                <h4>Best match</h4>
                <button className="search10-result best" onClick={() => launch(best)}>
                  <img src={best.icon} alt="" /><span><b>{best.label}</b><small>{best.key === 'web' ? 'Search the web' : best.kind}</small></span>
                </button>
              </>
            )}
            {sections.filter(([, list]) => list.length).map(([name, list]) => (
              <div key={name}>
                <h4>{name}</h4>
                {list.map(r => (
                  <button key={r.key} className="search10-result" onClick={() => launch(r)}>
                    <img src={r.icon} alt="" /><span>{r.label}</span>
                  </button>
                ))}
              </div>
            ))}
            {web && results.length > 0 && (
              <>
                <h4>Search the web</h4>
                <button className="search10-result" onClick={() => launch(web)}><Glyph name="search" size={16} /><span>{web.label}</span></button>
              </>
            )}
          </div>
          {best && (
            <div className="search10-preview">
              <img src={best.icon} alt="" />
              <b>{best.label}</b>
              <small>{best.subtitle ?? best.kind}</small>
              <button className="search10-open" onClick={() => launch(best)}><Glyph name="chevron" size={12} /> Open</button>
            </div>
          )}
        </div>
      )}
    </Flyout>
  )
}
