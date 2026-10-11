import { useEffect, useState } from 'react'
import { Icon, useClickOutside, useClock, useOS } from '../../core'
import { CascadeMenu } from './CascadeMenu'
import { useClassic } from './context'
import { icons } from './icons'
import type { ShellCtx } from './types'

export const TASKBAR_HEIGHT = 28

const timeText = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
const dateText = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

function StartMenu({ ctx, onDone }: { ctx: ShellCtx; onDone: () => void }) {
  const { banner, bannerStyle } = ctx.config
  return (
    <CascadeMenu
      className="classic-startmenu"
      large
      items={ctx.config.startMenu}
      ctx={ctx}
      onDone={onDone}
      aside={
        <div className="classic-startmenu-banner" style={bannerStyle}>
          <span><b>{banner[0]}</b>{banner[1]}</span>
        </div>
      }
    />
  )
}

function Clock() {
  const os = useOS()
  const now = useClock(5000)
  return (
    <span className="classic-clock" title={dateText(now)} onDoubleClick={() => os.open('datetime')}>
      {timeText(now)}
    </span>
  )
}

function Volume() {
  const [open, setOpen] = useState(false)
  const [level, setLevel] = useState(70)
  const [muted, setMuted] = useState(false)
  const ref = useClickOutside<HTMLSpanElement>(open, () => setOpen(false))
  return (
    <span ref={ref} className="classic-tray-icon">
      <button type="button" className="classic-tray-btn" title="Volume" onClick={() => setOpen(o => !o)}>
        <Icon src={icons.speaker} size={16} className={muted ? 'muted' : ''} />
      </button>
      {open && (
        <div className="classic-volume-popup">
          <span>Volume</span>
          <input type="range" min={0} max={100} value={level} onChange={e => setLevel(Number(e.target.value))} aria-label="Volume" />
          <label><input type="checkbox" checked={muted} onChange={e => setMuted(e.target.checked)} /> Mute</label>
        </div>
      )}
    </span>
  )
}

/** Classic taskbar: Start button, optional Quick Launch, task buttons, tray with clock. */
export function Taskbar() {
  const os = useOS()
  const { config, shell } = useClassic()
  const [startOpen, setStartOpen] = useState(false)
  const startRef = useClickOutside<HTMLDivElement>(startOpen, () => setStartOpen(false))
  const ctx: ShellCtx = { os, shell, config }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && e.ctrlKey) { e.preventDefault(); setStartOpen(o => !o) }
      else if (e.key === 'Escape') setStartOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="classic-taskbar" style={{ height: TASKBAR_HEIGHT }} onContextMenu={e => e.preventDefault()}>
      <div ref={startRef} className="classic-start-wrap">
        <button
          type="button"
          className={`classic-start${startOpen ? ' pressed' : ''}`}
          onPointerDown={() => setStartOpen(o => !o)}
        >
          <Icon src={icons.flag} size={16} />
          <b>Start</b>
        </button>
        {startOpen && <StartMenu ctx={ctx} onDone={() => setStartOpen(false)} />}
      </div>

      {config.quickLaunch && (
        <div className="classic-quicklaunch">
          <span className="classic-grip" />
          {config.quickLaunch.map(q => (
            <button key={q.id} type="button" className="classic-ql-btn" title={q.label} onClick={() => q.action(ctx)}>
              <Icon src={q.icon} size={16} />
            </button>
          ))}
          <span className="classic-grip" />
        </div>
      )}

      <div className="classic-tasks">
        {os.windows.map(w => (
          <button
            key={w.id}
            type="button"
            className={`classic-task${os.activeId === w.id ? ' pressed' : ''}`}
            title={w.title}
            onClick={() => os.taskbarClick(w.id)}
          >
            <Icon src={w.icon} size={16} />
            <span>{w.title}</span>
          </button>
        ))}
      </div>

      <div className="classic-tray">
        {config.trayVolume && <Volume />}
        <Clock />
      </div>
    </div>
  )
}
