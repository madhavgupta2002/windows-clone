import { useRef, useState } from 'react'
import { useClock, useOS } from '../../core'
import { Glyph, ShowDesktopButton, TaskButtons, WinLogo, formatShortDate, formatTime, useModern } from '../modern'
import { ActionCenter10, Calendar10 } from './Panels10'
import { Search10, StartMenu10 } from './Start10'

export type Fly10 = 'start' | 'search' | 'action' | 'calendar' | null

const PINNED = ['browser', 'explorer', 'store'] as const

/** Left-aligned Windows 10 taskbar with search box, Cortana and Task View. */
export function Taskbar10({ fly, setFly, onTaskView, onLock }: {
  fly: Fly10
  setFly: (f: Fly10) => void
  onTaskView: () => void
  onLock: () => void
}) {
  const os = useOS()
  const m = useModern()
  const now = useClock(5000)
  const [query, setQuery] = useState('')
  const [cortana, setCortana] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const toggle = (f: Exclude<Fly10, null>) => setFly(fly === f ? null : f)
  const close = () => { setFly(null); setQuery('') }

  const openSearch = (q: string, asCortana = false) => {
    setQuery(q)
    setCortana(asCortana)
    setFly('search')
    setTimeout(() => input.current?.focus(), 0)
  }

  return (
    <>
      {fly === 'start' && <StartMenu10 onClose={close} onLock={onLock} onSearch={q => openSearch(q)} onCalendar={() => setFly('calendar')} />}
      {fly === 'search' && <Search10 query={query} cortana={cortana} onClose={close} onQuery={setQuery} />}
      {fly === 'action' && <ActionCenter10 onClose={close} />}
      {fly === 'calendar' && <Calendar10 />}

      <div className="tb10 acrylic" onPointerDown={e => e.target === e.currentTarget && os.blur()}>
        <button className={`tb10-start${fly === 'start' ? ' pressed' : ''}`} data-flyout-toggle title="Start" aria-label="Start" onClick={() => toggle('start')}>
          <WinLogo size={16} />
        </button>
        <label className={`tb10-search${fly === 'search' ? ' active' : ''}`} data-flyout-toggle>
          <Glyph name="search" size={15} />
          <input
            ref={input}
            value={fly === 'search' ? query : ''}
            placeholder="Type here to search"
            onFocus={() => fly !== 'search' && openSearch('')}
            onChange={e => openSearch(e.target.value, cortana)}
            onKeyDown={e => { if (e.key === 'Escape') { close(); input.current?.blur() } }}
          />
        </label>
        <button className="tb10-btn" data-flyout-toggle title="Talk to Cortana" aria-label="Cortana" onClick={() => (fly === 'search' && cortana ? close() : openSearch('', true))}>
          <Glyph name="cortana" size={18} />
        </button>
        <button className="tb10-btn" title="Task View" aria-label="Task View" onClick={onTaskView}>
          <Glyph name="taskview" size={20} />
        </button>
        <div className="tb10-apps"><TaskButtons pinned={PINNED} /></div>

        <div className="tb10-tray">
          <button className="tb10-traybtn" title="Show hidden icons"><Glyph name="chevronUp" size={14} /></button>
          <button className="tb10-traybtn" title={m.quick.airplane ? 'Airplane mode' : m.quick.wifi ? 'HomeNetwork\nInternet access' : 'Not connected'} onClick={() => toggle('action')} data-flyout-toggle>
            <Glyph name={m.quick.airplane ? 'airplane' : 'wifi'} size={16} />
          </button>
          <button className="tb10-traybtn" title={`Speakers: ${m.volume}%`}><Glyph name="volume" size={16} /></button>
          <span className="tb10-lang" title="English (United States)">ENG</span>
          <button className={`tb10-traybtn tb10-clock${fly === 'calendar' ? ' pressed' : ''}`} data-flyout-toggle title={now.toLocaleDateString('en-US', { dateStyle: 'full' })} onClick={() => toggle('calendar')}>
            <span>{formatTime(now)}</span>
            <span>{formatShortDate(now)}</span>
          </button>
          <button className={`tb10-traybtn tb10-action${fly === 'action' ? ' pressed' : ''}`} data-flyout-toggle title="Action center" aria-label="Action center" onClick={() => toggle('action')}>
            <Glyph name="message" size={18} />
            {m.notices.length > 0 && <span className="tb10-badge">{m.notices.length}</span>}
          </button>
          <ShowDesktopButton />
        </div>
      </div>
    </>
  )
}
