import { useEffect, useState, type ReactNode } from 'react'
import { useClock } from '../../core'
import { EVENTS, MAIL, NEWS, PHOTOS, WEATHER } from './content'
import { Glyph } from './Glyph'
import type { ModernId } from './ModernApp'

export type TileSize = 'small' | 'medium' | 'wide' | 'large'
export type Launch = { kind: 'app'; app: string } | { kind: 'modern'; id: ModernId } | { kind: 'desktop' }

export interface TileDef {
  id: string
  label: string
  size: TileSize
  color: string
  glyph: string
  launch: Launch
  /** Live content faces, cycled with a slide animation. */
  live?: 'weather' | 'news' | 'mail' | 'photos' | 'clock' | 'calendar' | 'desktop'
}

export const TILE_GROUPS: { name: string; tiles: TileDef[] }[] = [
  {
    name: 'Everyday',
    tiles: [
      { id: 'mail', label: 'Mail', size: 'wide', color: '#0072c6', glyph: 'mail', launch: { kind: 'modern', id: 'mail' }, live: 'mail' },
      { id: 'calendar', label: 'Calendar', size: 'medium', color: '#7e3878', glyph: 'calendar', launch: { kind: 'modern', id: 'calendar' }, live: 'calendar' },
      { id: 'ie', label: 'Internet Explorer', size: 'medium', color: '#2672ec', glyph: 'ie', launch: { kind: 'app', app: 'browser' } },
      { id: 'photos', label: 'Photos', size: 'wide', color: '#00818a', glyph: 'photos', launch: { kind: 'modern', id: 'photos' }, live: 'photos' },
      { id: 'store', label: 'Store', size: 'medium', color: '#00a300', glyph: 'store', launch: { kind: 'modern', id: 'store' } },
      { id: 'clock', label: 'Alarms', size: 'medium', color: '#5133ab', glyph: 'calendar', launch: { kind: 'modern', id: 'calendar' }, live: 'clock' },
      { id: 'weather', label: 'Weather', size: 'wide', color: '#1e73be', glyph: 'weather', launch: { kind: 'modern', id: 'weather' }, live: 'weather' },
      { id: 'desktop', label: 'Desktop', size: 'wide', color: '#2d89ef', glyph: 'desktop', launch: { kind: 'desktop' }, live: 'desktop' },
    ],
  },
  {
    name: 'News & entertainment',
    tiles: [
      { id: 'news', label: 'News', size: 'large', color: '#9c1b31', glyph: 'news', launch: { kind: 'modern', id: 'news' }, live: 'news' },
      { id: 'music', label: 'Music', size: 'medium', color: '#e44d26', glyph: 'music', launch: { kind: 'modern', id: 'music' } },
      { id: 'mines', label: 'Minesweeper', size: 'medium', color: '#107c10', glyph: 'mines', launch: { kind: 'app', app: 'minesweeper' } },
    ],
  },
  {
    name: 'Desktop apps',
    tiles: [
      { id: 'explorer', label: 'File Explorer', size: 'medium', color: '#e3a21a', glyph: 'folder', launch: { kind: 'app', app: 'explorer' } },
      { id: 'notepad', label: 'Notepad', size: 'small', color: '#2b5797', glyph: 'notepad', launch: { kind: 'app', app: 'notepad' } },
      { id: 'calc', label: 'Calculator', size: 'small', color: '#603cba', glyph: 'calc', launch: { kind: 'app', app: 'calculator' } },
      { id: 'paint', label: 'Paint', size: 'small', color: '#da532c', glyph: 'paint', launch: { kind: 'app', app: 'paint' } },
      { id: 'settings', label: 'PC settings', size: 'small', color: '#4a4a4a', glyph: 'settings', launch: { kind: 'modern', id: 'settings' } },
    ],
  },
]

/** Cycles faces every few seconds (staggered by `seed`) with a vertical slide. */
function LiveFaces({ faces, seed }: { faces: ReactNode[]; seed: number }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    const start = setTimeout(() => {
      setI(x => (x + 1) % faces.length)
      interval = setInterval(() => setI(x => (x + 1) % faces.length), 5200 + (seed % 3) * 900)
    }, 1800 + seed * 700)
    return () => { clearTimeout(start); clearInterval(interval) }
  }, [faces.length, seed])
  return (
    <div className="w8-live">
      {faces.map((f, k) => (
        <div key={k} className={`w8-face${k === i ? ' current' : k === (i + faces.length - 1) % faces.length ? ' prev' : ''}`}>{f}</div>
      ))}
    </div>
  )
}

function ClockFace() {
  const now = useClock(1000)
  return (
    <div className="w8-face-clock">
      <div className="t">{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
      <div className="d">{now.toLocaleDateString([], { weekday: 'long' })}</div>
    </div>
  )
}

function CalendarFace() {
  const now = useClock(60000)
  return (
    <div className="w8-face-cal">
      <div className="n">{now.getDate()}</div>
      <div className="d">{now.toLocaleDateString([], { weekday: 'long' })}</div>
    </div>
  )
}

function liveFaces(t: TileDef): ReactNode[] | null {
  switch (t.live) {
    case 'weather':
      return [
        <div className="w8-face-weather"><div className="temp">{WEATHER.now.temp}°</div><div><b>{WEATHER.city}</b><br />{WEATHER.now.cond}<br />{WEATHER.now.hi}°/{WEATHER.now.lo}°</div></div>,
        <div className="w8-face-forecast">{WEATHER.forecast.slice(0, 3).map(f => <div key={f.day}><b>{f.day}</b> {f.icon} {f.hi}°/{f.lo}° <span>{f.cond}</span></div>)}</div>,
      ]
    case 'news':
      return NEWS.slice(0, 3).map((n, i) => (
        <div className="w8-face-photo" style={{ background: PHOTOS[(i + 1) % PHOTOS.length].bg }}><div className="caption">{n.title}</div></div>
      ))
    case 'mail':
      return MAIL.slice(0, 3).map(m => (
        <div className="w8-face-text"><b>{m.from}</b><span>{m.subject}</span><span className="dim">{m.body}</span></div>
      ))
    case 'photos':
      return PHOTOS.map(p => <div className="w8-face-photo" style={{ background: p.bg }} />)
    case 'clock':
      return [<ClockFace />, <div className="w8-face-text"><b>Next alarm</b><span>7:00 AM</span><span className="dim">Weekdays</span></div>]
    case 'calendar':
      return [<CalendarFace />, ...EVENTS.slice(0, 2).map(e => <div className="w8-face-text"><b>{e.title}</b><span>{e.time}</span></div>)]
    case 'desktop':
      return [<div className="w8-face-desktop" />]
    default:
      return null
  }
}

export function Tile({ tile, seed, onLaunch }: { tile: TileDef; seed: number; onLaunch: (t: TileDef) => void }) {
  const faces = liveFaces(tile)
  const showLabel = tile.size !== 'small'
  return (
    <button
      className={`w8-tile ${tile.size}${faces ? ' is-live' : ''}`}
      style={{ background: tile.color }}
      onClick={() => onLaunch(tile)}
      title={tile.label}
    >
      {faces && faces.length > 1 ? <LiveFaces faces={[<div className="w8-face-logo"><Glyph name={tile.glyph} /></div>, ...faces]} seed={seed} />
        : faces ? <div className="w8-live"><div className="w8-face current">{faces[0]}</div></div>
          : <span className="w8-tile-icon"><Glyph name={tile.glyph} /></span>}
      {showLabel && <span className="w8-tile-label">{tile.label}</span>}
    </button>
  )
}
