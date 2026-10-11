import { useState } from 'react'
import { Glyph } from './icons'

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/** Month grid with up/down navigation, today highlighted (6 rows, like Windows). */
export function MonthCalendar({ today }: { today: Date }) {
  const [offset, setOffset] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const first = new Date(today.getFullYear(), today.getMonth() + offset, 1)
  const start = new Date(first)
  start.setDate(1 - first.getDay())
  const cells = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  const todayKey = key(today)

  return (
    <div className="m-calendar">
      <div className="m-calendar-head">
        <button className="m-calendar-title" onClick={() => setOffset(0)} title="Go to today">
          {first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </button>
        <span className="m-calendar-nav">
          <button aria-label="Previous month" onClick={() => setOffset(o => o - 1)}><Glyph name="chevronUp" size={14} /></button>
          <button aria-label="Next month" onClick={() => setOffset(o => o + 1)}><Glyph name="chevronDown" size={14} /></button>
        </span>
      </div>
      <div className="m-calendar-grid">
        {DAY_NAMES.map(d => <span key={d} className="m-calendar-dow">{d}</span>)}
        {cells.map(d => {
          const k = key(d)
          const cls = [
            'm-calendar-day',
            d.getMonth() !== first.getMonth() ? 'dim' : '',
            k === todayKey ? 'today' : '',
            k === selected ? 'selected' : '',
          ].filter(Boolean).join(' ')
          return <button key={k} className={cls} onClick={() => setSelected(k)}>{d.getDate()}</button>
        })}
      </div>
    </div>
  )
}
