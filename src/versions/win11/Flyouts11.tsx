import {
  Flyout, Glyph, MonthCalendar, NotificationList, Slider, formatLongDate, useModern, useOpenSettings,
  type GlyphName, type QuickKey,
} from '../modern'

const TILES: { key: QuickKey; label: string; on?: string; glyph: GlyphName }[] = [
  { key: 'wifi', label: 'Wi-Fi', on: 'HomeNetwork', glyph: 'wifi' },
  { key: 'bluetooth', label: 'Bluetooth', glyph: 'bluetooth' },
  { key: 'airplane', label: 'Airplane mode', glyph: 'airplane' },
  { key: 'batterySaver', label: 'Battery saver', glyph: 'leaf' },
  { key: 'nightLight', label: 'Night light', glyph: 'moon' },
  { key: 'accessibility', label: 'Accessibility', glyph: 'accessibility' },
]

export function QuickSettings11({ onClose }: { onClose: () => void }) {
  const m = useModern()
  const openSettings = useOpenSettings()
  return (
    <Flyout className="quick11" label="Quick settings">
      <div className="quick11-body">
        <div className="quick11-grid">
          {TILES.map(t => {
            const on = m.quick[t.key]
            return (
              <div key={t.key} className="quick11-item">
                <button className={`quick11-toggle${on ? ' on' : ''}`} aria-pressed={on} title={t.label} onClick={() => m.toggleQuick(t.key)}>
                  <Glyph name={t.glyph} size={18} />
                </button>
                <span>{on && t.on ? t.on : t.label}</span>
              </div>
            )
          })}
        </div>
        <div className="quick11-slider"><Glyph name="sun" size={18} /><Slider label="Brightness" min={30} max={100} value={m.brightness} onChange={m.setBrightness} /></div>
        <div className="quick11-slider"><Glyph name="volume" size={18} /><Slider label="Volume" value={m.volume} onChange={m.setVolume} /></div>
      </div>
      <div className="quick11-footer">
        <span className="quick11-battery"><Glyph name="battery" size={16} /> 87%</span>
        <button className="quick11-gear" title="All settings" aria-label="All settings" onClick={() => { onClose(); openSettings('home') }}>
          <Glyph name="gear" size={16} />
        </button>
      </div>
    </Flyout>
  )
}

export function Calendar11({ now }: { now: Date }) {
  const m = useModern()
  return (
    <div className="cal11-stack">
      <Flyout className="notif11" label="Notifications">
        <div className="notif11-head">
          <strong>Notifications</strong>
          {m.notices.length > 0 && <button onClick={m.clearNotices}>Clear all</button>}
        </div>
        <NotificationList />
      </Flyout>
      <Flyout className="cal11" label="Calendar">
        <div className="cal11-date">{formatLongDate(now)}</div>
        <MonthCalendar today={now} />
        <div className="cal11-focus">
          <span>Focus</span>
          <button className={`btn${m.quick.focus ? ' primary' : ''}`} onClick={() => m.toggleQuick('focus')}>
            {m.quick.focus ? 'End session' : <><Glyph name="focus" size={14} /> Focus</>}
          </button>
        </div>
      </Flyout>
    </div>
  )
}
