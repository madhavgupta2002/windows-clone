import { useState } from 'react'
import { useClock, useOS } from '../../core'
import {
  Glyph, ShowDesktopButton, TaskButtons, WinLogo, formatShortDate, formatTime, useModern,
} from '../modern'
import { Calendar11, QuickSettings11 } from './Flyouts11'
import { Search11, StartMenu11 } from './Start11'

export type Fly = 'start' | 'search' | 'quick' | 'calendar' | null

const PINNED = ['browser', 'explorer', 'store'] as const

/** Centered Windows 11 taskbar + its flyouts. */
export function Taskbar11({ fly, setFly, onTaskView, onLock }: {
  fly: Fly
  setFly: (f: Fly) => void
  onTaskView: () => void
  onLock: () => void
}) {
  const os = useOS()
  const m = useModern()
  const now = useClock(5000)
  const [query, setQuery] = useState('')
  const toggle = (f: Exclude<Fly, null>) => setFly(fly === f ? null : f)
  const close = () => setFly(null)

  return (
    <>
      {fly === 'start' && (
        <StartMenu11 onClose={close} onLock={onLock} onSearch={q => { setQuery(q); setFly('search') }} />
      )}
      {fly === 'search' && <Search11 query={query} setQuery={setQuery} onClose={close} />}
      {fly === 'quick' && <QuickSettings11 onClose={close} />}
      {fly === 'calendar' && <Calendar11 now={now} />}

      <div className="tb11 acrylic" onPointerDown={e => e.target === e.currentTarget && os.blur()}>
        <div className="tb11-center">
          <button className={`m-taskbtn tb11-start${fly === 'start' ? ' pressed' : ''}`} data-flyout-toggle title="Start" aria-label="Start" onClick={() => toggle('start')}>
            <WinLogo size={20} />
          </button>
          <button className={`m-taskbtn${fly === 'search' ? ' pressed' : ''}`} data-flyout-toggle title="Search" aria-label="Search"
            onClick={() => { setQuery(''); toggle('search') }}>
            <Glyph name="search" size={20} />
          </button>
          <button className="m-taskbtn" title="Task View" aria-label="Task View" onClick={onTaskView}>
            <Glyph name="taskview" size={22} />
          </button>
          <TaskButtons pinned={PINNED} />
        </div>
        <div className="tb11-tray">
          <button className="tb11-traybtn" title="Show hidden icons" aria-label="Show hidden icons"><Glyph name="chevronUp" size={14} /></button>
          <button className={`tb11-traybtn tb11-quick${fly === 'quick' ? ' pressed' : ''}`} data-flyout-toggle title="Quick settings" onClick={() => toggle('quick')}>
            {m.quick.airplane ? <Glyph name="airplane" size={16} /> : <Glyph name="wifi" size={16} />}
            <Glyph name="volume" size={16} />
            <Glyph name="battery" size={16} />
          </button>
          <button className={`tb11-traybtn tb11-clock${fly === 'calendar' ? ' pressed' : ''}`} data-flyout-toggle title={now.toLocaleDateString('en-US', { dateStyle: 'full' })} onClick={() => toggle('calendar')}>
            <span><span>{formatTime(now)}</span><span>{formatShortDate(now)}</span></span>
            {m.notices.length > 0 && <span className="tb11-badge">{m.notices.length}</span>}
            {m.quick.focus && <Glyph name="moon" size={14} />}
          </button>
          <ShowDesktopButton />
        </div>
      </div>
    </>
  )
}
