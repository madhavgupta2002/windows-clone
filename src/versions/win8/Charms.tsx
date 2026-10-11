import { useEffect, useRef, useState } from 'react'
import { useClock, usePref } from '../../core'
import type { Palette } from './config'
import { Glyph } from './Glyph'
import { PaletteSwatches } from './ModernApp'
import { ALL_TILES } from './StartScreen'
import type { TileDef } from './tiles'

export type Pane = 'search' | 'share' | 'devices' | 'settings'
export type PowerChoice = 'sleep' | 'shutdown' | 'restart'

interface Props {
  /** Charm pane opened from elsewhere (e.g. 8.1 Start search button). */
  pane: Pane | null
  setPane: (p: Pane | null) => void
  context: string
  onStart: () => void
  onLaunch: (t: TileDef) => void
  onPower: (p: PowerChoice) => void
  palettes: Palette[]
  palette: Palette
  onPalette: (p: Palette) => void
  prefKey: string
  brightness: number
  setBrightness: (b: number) => void
}

const CHARMS: { id: Pane | 'start'; label: string; glyph: string }[] = [
  { id: 'search', label: 'Search', glyph: 'search' },
  { id: 'share', label: 'Share', glyph: 'share' },
  { id: 'start', label: 'Start', glyph: 'flag' },
  { id: 'devices', label: 'Devices', glyph: 'devices' },
  { id: 'settings', label: 'Settings', glyph: 'settings' },
]

/** Right-edge charms bar (appears from the top/bottom-right hot corners) plus its panes. */
export function Charms({ pane, setPane, context, onStart, onLaunch, onPower, palettes, palette, onPalette, prefKey, brightness, setBrightness }: Props) {
  const [state, setState] = useState<'hidden' | 'peek' | 'active'>('hidden')
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const now = useClock(1000)

  const show = (s: 'peek' | 'active') => { clearTimeout(hideTimer.current); setState(s) }
  const scheduleHide = () => { clearTimeout(hideTimer.current); hideTimer.current = setTimeout(() => setState('hidden'), 450) }

  // Windows+C toggles charms.
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.metaKey && e.key.toLowerCase() === 'c') { e.preventDefault(); setState(s => (s === 'active' ? 'hidden' : 'active')) } }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const pick = (id: Pane | 'start') => {
    setState('hidden')
    if (id === 'start') { setPane(null); onStart() } else setPane(id)
  }

  return (
    <>
      <div className="w8-hot w8-hot-tr" onPointerEnter={() => state === 'hidden' && show('peek')} onPointerLeave={scheduleHide} />
      <div className="w8-hot w8-hot-br" onPointerEnter={() => state === 'hidden' && show('peek')} onPointerLeave={scheduleHide} />
      <div
        className={`w8-charms ${state}`}
        onPointerEnter={() => show('active')}
        onPointerLeave={scheduleHide}
      >
        {CHARMS.map(c => (
          <button key={c.id} className={`w8-charm${c.id === 'start' ? ' start' : ''}`} onClick={() => pick(c.id)}>
            <Glyph name={c.glyph} /><span>{c.label}</span>
          </button>
        ))}
      </div>
      {state === 'active' && (
        <div className="w8-charm-clock">
          <div className="status"><Glyph name="network" /><Glyph name="volume" /></div>
          <div className="time">{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '')}</div>
          <div className="date">{now.toLocaleDateString([], { weekday: 'long' })}<br />{now.toLocaleDateString([], { month: 'long', day: 'numeric' })}</div>
        </div>
      )}
      {pane && (
        <>
          <div className="w8-pane-shield" onPointerDown={() => setPane(null)} />
          <aside className={`w8-pane w8-pane-${pane}`}>
            {pane === 'search' && <SearchPane onLaunch={t => { setPane(null); onLaunch(t) }} />}
            {pane === 'share' && <><h2>Share</h2><p className="dim">There's nothing to share from {context}.</p></>}
            {pane === 'devices' && <><h2>Devices</h2><p className="dim">You don't have any devices that can receive content from {context}.</p></>}
            {pane === 'settings' && (
              <SettingsPane context={context} onPower={p => { setPane(null); onPower(p) }}
                palettes={palettes} palette={palette} onPalette={onPalette} prefKey={prefKey}
                brightness={brightness} setBrightness={setBrightness}
                onPcSettings={() => { setPane(null); onLaunch({ id: 'settings', label: 'PC settings', size: 'small', color: '', glyph: 'settings', launch: { kind: 'modern', id: 'settings' } }) }} />
            )}
          </aside>
        </>
      )}
    </>
  )
}

function SearchPane({ onLaunch }: { onLaunch: (t: TileDef) => void }) {
  const [q, setQ] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  const results = ALL_TILES.filter(t => !q.trim() || t.label.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <>
      <h2>Search</h2>
      <div className="w8-search-box">
        <input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder="Everywhere"
          onKeyDown={e => { if (e.key === 'Enter' && results[0]) onLaunch(results[0]) }} />
        <Glyph name="search" />
      </div>
      <div className="w8-search-results">
        {results.map(t => (
          <button key={t.id} className="w8-app-entry" onClick={() => onLaunch(t)}>
            <span className="ico" style={{ background: t.color }}><Glyph name={t.glyph} /></span><span>{t.label}</span>
          </button>
        ))}
        {!results.length && <p className="dim">No results for “{q}”.</p>}
      </div>
    </>
  )
}

function SettingsPane({ context, onPower, onPcSettings, palettes, palette, onPalette, prefKey, brightness, setBrightness }: {
  context: string; onPower: (p: PowerChoice) => void; onPcSettings: () => void
  palettes: Palette[]; palette: Palette; onPalette: (p: Palette) => void; prefKey: string
  brightness: number; setBrightness: (b: number) => void
}) {
  const [sub, setSub] = useState<null | 'personalize' | 'power' | 'volume'>(null)
  const [volume, setVolume] = usePref(`${prefKey}.volume`, 60)

  const quick: { id: string; label: string; glyph: string; onClick: () => void }[] = [
    { id: 'net', label: 'Network', glyph: 'network', onClick: () => setSub(null) },
    { id: 'vol', label: String(volume), glyph: 'volume', onClick: () => setSub(s => (s === 'volume' ? null : 'volume')) },
    { id: 'bri', label: `${brightness}%`, glyph: 'brightness', onClick: () => setBrightness(brightness >= 100 ? 40 : brightness + 20) },
    { id: 'notif', label: 'Notifications', glyph: 'bell', onClick: () => setSub(null) },
    { id: 'power', label: 'Power', glyph: 'power', onClick: () => setSub(s => (s === 'power' ? null : 'power')) },
    { id: 'kbd', label: 'Keyboard', glyph: 'keyboard', onClick: () => setSub(null) },
  ]

  return (
    <>
      <h2>Settings</h2>
      <div className="w8-pane-context">{context}</div>
      {sub === 'personalize' ? (
        <div className="w8-pane-section">
          <button className="w8-link" onClick={() => setSub(null)}>‹ Personalize</button>
          <p className="dim">Background and accent colour</p>
          <PaletteSwatches palettes={palettes} palette={palette} onPalette={onPalette} />
        </div>
      ) : (
        <div className="w8-pane-links">
          <button onClick={() => setSub('personalize')}>Personalize</button>
          <button onClick={onPcSettings}>Tiles</button>
          <button onClick={onPcSettings}>Help</button>
        </div>
      )}
      <div className="w8-pane-bottom">
        {sub === 'power' && (
          <div className="w8-power-menu">
            <button onClick={() => onPower('sleep')}>Sleep</button>
            <button onClick={() => onPower('shutdown')}>Shut down</button>
            <button onClick={() => onPower('restart')}>Restart</button>
          </div>
        )}
        {sub === 'volume' && (
          <div className="w8-power-menu">
            <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(Number(e.target.value))} aria-label="Volume" />
          </div>
        )}
        <div className="w8-quick">
          {quick.map(q => (
            <button key={q.id} className="w8-quick-btn" onClick={q.onClick}><Glyph name={q.glyph} /><span>{q.label}</span></button>
          ))}
        </div>
        <button className="w8-pcsettings-link" onClick={onPcSettings}>Change PC settings</button>
      </div>
    </>
  )
}
