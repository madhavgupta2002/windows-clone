import { useState } from 'react'
import { useClock } from '../../core'
import {
  APP_ICONS, Flyout, Glyph, MonthCalendar, NotificationList, Slider, formatLongDate, formatTime, useModern, useOpenSettings,
  type GlyphName, type QuickKey,
} from '../modern'

type Action = { label: string; glyph: GlyphName } & ({ key: QuickKey } | { run: 'settings' | 'snip' })

const ACTIONS: Action[] = [
  { key: 'tablet', label: 'Tablet mode', glyph: 'tablet' },
  { key: 'wifi', label: 'Network', glyph: 'wifi' },
  { run: 'settings', label: 'All settings', glyph: 'gear' },
  { key: 'airplane', label: 'Airplane mode', glyph: 'airplane' },
  { key: 'location', label: 'Location', glyph: 'location' },
  { key: 'focus', label: 'Focus assist', glyph: 'moon' },
  { key: 'nightLight', label: 'Night light', glyph: 'sun' },
  { key: 'bluetooth', label: 'Bluetooth', glyph: 'bluetooth' },
  { key: 'vpn', label: 'VPN', glyph: 'vpn' },
  { key: 'project', label: 'Project', glyph: 'project' },
  { key: 'hotspot', label: 'Mobile hotspot', glyph: 'phone' },
  { run: 'snip', label: 'Screen snip', glyph: 'snip' },
]

/** Windows 10 Action Center: notifications on top, quick action tiles + brightness below. */
export function ActionCenter10({ onClose }: { onClose: () => void }) {
  const m = useModern()
  const openSettings = useOpenSettings()
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? ACTIONS : ACTIONS.slice(0, 4)

  const run = (a: Action) => {
    if ('key' in a) { m.toggleQuick(a.key); return }
    onClose()
    if (a.run === 'settings') openSettings('home')
    else m.notify({ app: 'Snip & Sketch', icon: APP_ICONS.photo, title: 'Snip saved to clipboard', body: 'Select here to mark up and share the image.' })
  }

  return (
    <Flyout className="action10" label="Action center">
      <div className="action10-head">
        <button className="action10-link" onClick={() => { onClose(); openSettings('system/notifications') }}>Manage notifications</button>
      </div>
      <div className="action10-notices">
        <NotificationList emptyText="No new notifications" />
      </div>
      {m.notices.length > 0 && (
        <div className="action10-clear"><button className="action10-link" onClick={m.clearNotices}>Clear all notifications</button></div>
      )}
      <div className="action10-bottom">
        <button className="action10-link action10-expand" onClick={() => setExpanded(e => !e)}>{expanded ? 'Collapse' : 'Expand'}</button>
        <div className="action10-grid">
          {shown.map(a => {
            const on = 'key' in a && m.quick[a.key]
            const label = 'key' in a && a.key === 'wifi' && on ? 'HomeNetwork' : a.label
            return (
              <button key={a.label} className={`action10-tile${on ? ' on' : ''}`} aria-pressed={on} onClick={() => run(a)}>
                <Glyph name={a.glyph} size={16} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
        <div className="action10-slider"><Glyph name="sun" size={16} /><Slider label="Brightness" min={30} max={100} value={m.brightness} onChange={m.setBrightness} /></div>
      </div>
    </Flyout>
  )
}

/** Clock + calendar flyout. */
export function Calendar10() {
  const now = useClock(1000)
  return (
    <Flyout className="cal10" label="Date and time">
      <div className="cal10-time">{formatTime(now, true)}</div>
      <div className="cal10-date">{formatLongDate(now)}</div>
      <MonthCalendar today={now} />
      <div className="cal10-agenda">
        <b>Today</b>
        <span>No events</span>
        <button className="action10-link">+ Add an event or reminder</button>
      </div>
    </Flyout>
  )
}
