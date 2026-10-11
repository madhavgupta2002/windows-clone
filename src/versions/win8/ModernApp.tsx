import { useState, type ReactNode } from 'react'
import { useClock } from '../../core'
import type { Palette } from './config'
import { EVENTS, MAIL, MUSIC, NEWS, PHOTOS, STORE_APPS, WEATHER } from './content'
import { Glyph } from './Glyph'

export type ModernId = 'weather' | 'news' | 'photos' | 'mail' | 'calendar' | 'store' | 'music' | 'settings'

export const MODERN_META: Record<ModernId, { title: string; color: string; glyph: string }> = {
  weather: { title: 'Weather', color: '#1e73be', glyph: 'weather' },
  news: { title: 'News', color: '#9c1b31', glyph: 'news' },
  photos: { title: 'Photos', color: '#00818a', glyph: 'photos' },
  mail: { title: 'Mail', color: '#0072c6', glyph: 'mail' },
  calendar: { title: 'Calendar', color: '#7e3878', glyph: 'calendar' },
  store: { title: 'Store', color: '#00a300', glyph: 'store' },
  music: { title: 'Music', color: '#e44d26', glyph: 'music' },
  settings: { title: 'PC settings', color: '#4a4a4a', glyph: 'settings' },
}

interface Props {
  id: ModernId
  onClose: () => void
  palettes: Palette[]
  palette: Palette
  onPalette: (p: Palette) => void
}

/** Full-screen "Modern UI" app. Point at the top edge for the title bar with a close button. */
export function ModernApp({ id, onClose, palettes, palette, onPalette }: Props) {
  const meta = MODERN_META[id]
  const body: Record<ModernId, () => ReactNode> = {
    weather: () => <Weather />,
    news: () => <News />,
    photos: () => <Photos />,
    mail: () => <Mail />,
    calendar: () => <CalendarApp />,
    store: () => <Store />,
    music: () => <Music />,
    settings: () => <PcSettings palettes={palettes} palette={palette} onPalette={onPalette} />,
  }
  return (
    <div className={`w8-modern w8-modern-${id}`} style={{ ['--app-color' as string]: meta.color }}>
      <div className="w8-modern-hot" />
      <div className="w8-modern-titlebar">
        <span className="w8-modern-titleicon"><Glyph name={meta.glyph} /></span>
        <span>{meta.title}</span>
        <button className="w8-modern-close" aria-label="Close app" onClick={onClose}>✕</button>
      </div>
      <div className="w8-modern-head">
        <button className="w8-modern-back" aria-label="Back to Start" onClick={onClose}><Glyph name="back" /></button>
        <h1>{meta.title}</h1>
      </div>
      <div className="w8-modern-body">{body[id]()}</div>
    </div>
  )
}

function Weather() {
  const w = WEATHER
  return (
    <div className="w8-weather">
      <div className="w8-weather-now">
        <div className="big">{w.now.temp}°</div>
        <div>
          <div className="city">{w.city}</div>
          <div>{w.now.cond}</div>
          <div className="dim">Hi {w.now.hi}° / Lo {w.now.lo}°</div>
        </div>
        <div className="icon">{w.now.icon}</div>
      </div>
      <div className="w8-forecast">
        {w.forecast.map(f => (
          <div key={f.day} className="w8-forecast-day">
            <div>{f.day}</div><div className="icon">{f.icon}</div><div className="hi">{f.hi}°</div><div className="dim">{f.lo}°</div><div className="dim small">{f.cond}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function News() {
  const [open, setOpen] = useState<number | null>(null)
  if (open !== null) {
    const n = NEWS[open]
    return (
      <article className="w8-article">
        <button className="w8-link" onClick={() => setOpen(null)}>‹ All stories</button>
        <div className="cat">{n.cat}</div>
        <h2>{n.title}</h2>
        <p>{n.body}</p>
        <p className="dim">This is offline sample content.</p>
      </article>
    )
  }
  return (
    <div className="w8-news-grid">
      {NEWS.map((n, i) => (
        <button key={n.title} className={`w8-news-card${i === 0 ? ' hero' : ''}`} onClick={() => setOpen(i)} style={{ background: PHOTOS[i % PHOTOS.length].bg }}>
          <span className="cat">{n.cat}</span><span className="title">{n.title}</span>
        </button>
      ))}
    </div>
  )
}

function Photos() {
  const [open, setOpen] = useState<number | null>(null)
  if (open !== null) {
    return (
      <div className="w8-photo-view" style={{ background: PHOTOS[open].bg }} onClick={() => setOpen((open + 1) % PHOTOS.length)}>
        <span className="w8-photo-caption">{PHOTOS[open].name} — click for next, <button className="w8-link" onClick={e => { e.stopPropagation(); setOpen(null) }}>back to library</button></span>
      </div>
    )
  }
  return (
    <div className="w8-photo-grid">
      {PHOTOS.map((p, i) => (
        <button key={p.name} className="w8-photo" style={{ background: p.bg }} onClick={() => setOpen(i)}><span>{p.name}</span></button>
      ))}
    </div>
  )
}

function Mail() {
  const [sel, setSel] = useState(0)
  return (
    <div className="w8-mail">
      <div className="w8-mail-list">
        <div className="w8-mail-folder">Inbox <span className="dim">Outlook</span></div>
        {MAIL.map((m, i) => (
          <button key={m.subject} className={`w8-mail-item${i === sel ? ' selected' : ''}`} onClick={() => setSel(i)}>
            <b>{m.from}</b><span>{m.subject}</span><span className="dim">{m.time}</span>
          </button>
        ))}
      </div>
      <div className="w8-mail-read">
        <h2>{MAIL[sel].subject}</h2>
        <div className="dim">{MAIL[sel].from} · {MAIL[sel].time}</div>
        <p>{MAIL[sel].body}</p>
      </div>
    </div>
  )
}

function CalendarApp() {
  const now = useClock(60000)
  const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay()
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)] as (number | null)[]
  return (
    <div className="w8-calendar">
      <h2>{now.toLocaleDateString([], { month: 'long', year: 'numeric' })}</h2>
      <div className="w8-cal-grid">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <div key={d} className="dn">{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} className={`cell${d === now.getDate() ? ' today' : ''}`}>
            {d}
            {d === now.getDate() && EVENTS.map(e => <div key={e.title} className="ev">{e.time} {e.title}</div>)}
          </div>
        ))}
      </div>
    </div>
  )
}

function Store() {
  const [installed, setInstalled] = useState<string[]>([])
  return (
    <div className="w8-store">
      <h2>Spotlight</h2>
      <div className="w8-store-grid">
        {STORE_APPS.map(a => (
          <div key={a.name} className="w8-store-app">
            <div className="tile" style={{ background: a.color }}>{a.name[0]}</div>
            <div><b>{a.name}</b><div className="dim">{a.cat}</div><div className="stars">{a.rating}</div>
              <button className="w8-btn" disabled={installed.includes(a.name)} onClick={() => setInstalled(i => [...i, a.name])}>
                {installed.includes(a.name) ? 'Installed' : 'Free · Install'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Music() {
  const [playing, setPlaying] = useState<number | null>(null)
  return (
    <div className="w8-music">
      {MUSIC.map((t, i) => (
        <button key={t.title} className={`w8-track${playing === i ? ' playing' : ''}`} onClick={() => setPlaying(p => (p === i ? null : i))}>
          <span className="play">{playing === i ? '❚❚' : '▶'}</span><b>{t.title}</b><span className="dim">{t.artist}</span><span className="dim">{t.len}</span>
        </button>
      ))}
      {playing !== null && <div className="w8-nowplaying">Now playing: {MUSIC[playing].title} — {MUSIC[playing].artist} <span className="eq"><i /><i /><i /><i /></span></div>}
    </div>
  )
}

export function PaletteSwatches({ palettes, palette, onPalette }: { palettes: Palette[]; palette: Palette; onPalette: (p: Palette) => void }) {
  return (
    <div className="w8-swatches">
      {palettes.map(p => (
        <button
          key={p.id}
          className={`w8-swatch${p.id === palette.id ? ' active' : ''}`}
          style={{ background: `linear-gradient(135deg, ${p.bg} 50%, ${p.accent} 50%)` }}
          aria-label={p.id}
          title={p.id}
          onClick={() => onPalette(p)}
        />
      ))}
    </div>
  )
}

function PcSettings(props: { palettes: Palette[]; palette: Palette; onPalette: (p: Palette) => void }) {
  return (
    <div className="w8-pcsettings">
      <h2>Personalize</h2>
      <p>Choose your Start background and accent colour.</p>
      <PaletteSwatches {...props} />
      <h2>Lock screen</h2>
      <p className="dim">Your lock screen shows the time, date and quick status.</p>
    </div>
  )
}
