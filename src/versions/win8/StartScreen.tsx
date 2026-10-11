import { useEffect, useRef, useState, type WheelEvent } from 'react'
import { Glyph } from './Glyph'
import { TILE_GROUPS, Tile, type TileDef } from './tiles'

/** Every launchable entry, alphabetically (All apps view + Search charm). */
const ABOUT_TILE: TileDef = { id: 'about', label: 'About Windows', size: 'small', color: '#4a4a4a', glyph: 'help', launch: { kind: 'app', app: 'about' } }
export const ALL_TILES: TileDef[] = [...TILE_GROUPS.flatMap(g => g.tiles).filter(t => t.id !== 'clock'), ABOUT_TILE]
  .sort((a, b) => a.label.localeCompare(b.label))

interface Props {
  visible: boolean
  allAppsArrow: boolean
  userName: string
  onLaunch: (t: TileDef) => void
  onPower: () => void
  onSearch: () => void
}

/** Full-screen Start: horizontally scrolling tile groups; 8.1 adds the All apps view. */
export function StartScreen({ visible, allAppsArrow, userName, onLaunch, onPower, onSearch }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const [apps, setApps] = useState(false)
  const [arrow, setArrow] = useState(false)
  const hideArrow = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => { if (!visible) setApps(false) }, [visible])

  // Vertical wheel scrolls the tile canvas horizontally, like Windows 8.
  const onWheel = (e: WheelEvent) => {
    const el = scroller.current
    if (el && Math.abs(e.deltaY) > Math.abs(e.deltaX)) el.scrollLeft += e.deltaY
  }

  return (
    <div
      className={`w8-start${visible ? ' visible' : ''}${apps ? ' show-apps' : ''}`}
      onPointerMove={() => {
        if (!allAppsArrow) return
        setArrow(true)
        clearTimeout(hideArrow.current)
        hideArrow.current = setTimeout(() => setArrow(false), 2500)
      }}
      onContextMenu={e => e.preventDefault()}
    >
      <div className="w8-start-page">
        <header className="w8-start-head">
          <h1>Start</h1>
          <div className="w8-start-user">
            <span className="name">{userName}</span>
            <span className="pic"><Glyph name="user" /></span>
            {allAppsArrow && (
              <>
                <button className="w8-round" aria-label="Power" title="Power" onClick={onPower}><Glyph name="power" /></button>
                <button className="w8-round" aria-label="Search" title="Search" onClick={onSearch}><Glyph name="search" /></button>
              </>
            )}
          </div>
        </header>
        <div className="w8-tiles-scroll" ref={scroller} onWheel={onWheel}>
          <div className="w8-groups">
            {TILE_GROUPS.map((g, gi) => (
              <section key={g.name} className="w8-group">
                <h2>{g.name}</h2>
                <div className="w8-group-grid">
                  {g.tiles.map((t, ti) => <Tile key={t.id} tile={t} seed={gi * 5 + ti} onLaunch={onLaunch} />)}
                </div>
              </section>
            ))}
          </div>
        </div>
        {allAppsArrow && (
          <button className={`w8-apps-arrow${arrow ? ' show' : ''}`} aria-label="All apps" title="All apps" onClick={() => setApps(true)}>
            <Glyph name="down" />
          </button>
        )}
      </div>

      {allAppsArrow && (
        <div className="w8-apps-page">
          <header className="w8-start-head">
            <h1>Apps <small>by name</small></h1>
          </header>
          <div className="w8-apps-list">
            {ALL_TILES.map(t => (
              <button key={t.id} className="w8-app-entry" onClick={() => onLaunch(t)}>
                <span className="ico" style={{ background: t.color }}><Glyph name={t.glyph} /></span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
          <button className="w8-apps-arrow show up" aria-label="Back to Start" onClick={() => setApps(false)}><Glyph name="up" /></button>
        </div>
      )}
    </div>
  )
}
