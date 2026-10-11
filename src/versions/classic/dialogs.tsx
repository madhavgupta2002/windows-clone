import { useState, type ReactNode } from 'react'
import { Icon, useClock, useOS, usePref, type AppDef, type AppProps, type FileSystem } from '../../core'
import { useClassic } from './context'
import { icons } from './icons'

/* ---------------------------------------------------------------- Run */

const DEFAULT_RUN: Record<string, string> = {
  notepad: 'notepad',
  calc: 'calculator',
  winmine: 'minesweeper',
  mspaint: 'paint',
  pbrush: 'paint',
  explorer: 'explorer',
  iexplore: 'browser',
  winver: 'about',
}

/** Case-insensitive lookup of a DOS-style path in the virtual FS. */
export function resolvePath(fs: FileSystem, input: string): string | null {
  const parts = input.replace(/\\/g, '/').replace(/\/+$/, '').split('/').filter(Boolean)
  if (!parts.length) return null
  let cur = fs.roots().find(r => r.toLowerCase() === parts[0].toLowerCase())
  for (const part of parts.slice(1)) {
    if (!cur) return null
    cur = fs.list(cur).find(n => n.name.toLowerCase() === part.toLowerCase())?.path
  }
  return cur ?? null
}

function RunDialog({ winId }: AppProps) {
  const os = useOS()
  const { config } = useClassic()
  const [history, setHistory] = usePref<string[]>(`${config.id}.runHistory`, [])
  const [value, setValue] = useState(history[0] ?? '')

  const execute = (cmd: string) => {
    const commands = { ...DEFAULT_RUN, ...config.runCommands }
    const [head, ...rest] = cmd.split(/\s+/)
    const name = head.toLowerCase().replace(/\.(exe|com)$/, '')
    const arg = rest.join(' ')
    if (/^(https?:\/\/|www\.)/i.test(cmd)) { os.open('browser', { url: cmd }); return }
    if (commands[name] && os.apps[commands[name]]) {
      const argPath = arg ? resolvePath(os.fs, arg) : null
      os.open(commands[name], argPath ? { path: argPath } : {})
      return
    }
    const path = resolvePath(os.fs, cmd)
    if (path) { os.openPath(path); return }
    os.alert(
      cmd,
      `Cannot find the file '${cmd}' (or one of its components). Make sure the path and filename are correct and that all required libraries are available.`,
      'error',
    )
  }

  const submit = () => {
    const cmd = value.trim()
    if (!cmd) return
    setHistory([cmd, ...history.filter(h => h !== cmd)].slice(0, 12))
    os.close(winId)
    execute(cmd)
  }

  return (
    <form className="app classic-dialog classic-run" onSubmit={e => { e.preventDefault(); submit() }}>
      <div className="classic-run-top">
        <Icon src={icons.run} size={32} />
        <p>Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.</p>
      </div>
      <label className="classic-run-field">
        <span><u>O</u>pen:</span>
        <input className="field" autoFocus list={`${winId}-history`} value={value} onChange={e => setValue(e.target.value)} />
        <datalist id={`${winId}-history`}>{history.map(h => <option key={h} value={h} />)}</datalist>
      </label>
      <div className="classic-dialog-buttons">
        <button type="submit" className="btn default">OK</button>
        <button type="button" className="btn" onClick={() => os.close(winId)}>Cancel</button>
        <button type="button" className="btn" onClick={() => os.open('explorer', { path: 'C:' })}><u>B</u>rowse...</button>
      </div>
    </form>
  )
}

/* ---------------------------------------------------------------- Tabs + dialog chrome */

export function Tabs({ tabs, children }: { tabs: string[]; children: (tab: number) => ReactNode }) {
  const [tab, setTab] = useState(0)
  return (
    <div className="classic-tabs">
      <div className="classic-tab-strip" role="tablist">
        {tabs.map((t, i) => (
          <button key={t} type="button" role="tab" aria-selected={tab === i} className={`classic-tab${tab === i ? ' selected' : ''}`} onClick={() => setTab(i)}>
            {t}
          </button>
        ))}
      </div>
      <div className="classic-tab-page">{children(tab)}</div>
    </div>
  )
}

function DialogButtons({ winId, onOk, apply }: { winId: string; onOk?: () => void; apply?: () => void }) {
  const os = useOS()
  return (
    <div className="classic-dialog-buttons">
      <button type="button" className="btn default" onClick={() => { onOk?.(); os.close(winId) }}>OK</button>
      <button type="button" className="btn" onClick={() => os.close(winId)}>Cancel</button>
      {apply && <button type="button" className="btn" onClick={apply}><u>A</u>pply</button>}
    </div>
  )
}

/* ---------------------------------------------------------------- Date/Time */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function AnalogClock({ now }: { now: Date }) {
  const h = (now.getHours() % 12) * 30 + now.getMinutes() / 2
  const m = now.getMinutes() * 6
  const s = now.getSeconds() * 6
  return (
    <svg viewBox="-50 -50 100 100" className="classic-analog">
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-2} y={-44} width={4} height={4} fill={i % 3 ? '#008080' : '#000080'} transform={`rotate(${i * 30})`} />
      ))}
      <path d="M-3 0L0 -24L3 0L0 4z" fill="#008080" stroke="#000" transform={`rotate(${h})`} />
      <path d="M-2 0L0 -36L2 0L0 4z" fill="#008080" stroke="#000" transform={`rotate(${m})`} />
      <path d="M0 4V-38" stroke="#000" transform={`rotate(${s})`} />
    </svg>
  )
}

function DateTimeDialog({ winId }: AppProps) {
  const now = useClock(1000)
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const today = now.getFullYear() === year && now.getMonth() === month ? now.getDate() : -1
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <div className="app classic-dialog classic-datetime">
      <Tabs tabs={['Date & Time', 'Time Zone']}>
        {tab =>
          tab === 0 ? (
            <div className="classic-datetime-page">
              <fieldset className="classic-group">
                <legend>Date</legend>
                <div className="classic-row">
                  <select className="field" value={month} onChange={e => setMonth(Number(e.target.value))}>
                    {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                  </select>
                  <input className="field" type="number" value={year} onChange={e => setYear(Number(e.target.value) || year)} style={{ width: 64 }} />
                </div>
                <div className="classic-calendar sunken">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <b key={i}>{d}</b>)}
                  {Array.from({ length: first }, (_, i) => <span key={`e${i}`} />)}
                  {Array.from({ length: days }, (_, i) => (
                    <span key={i} className={i + 1 === today ? 'today' : ''}>{i + 1}</span>
                  ))}
                </div>
              </fieldset>
              <fieldset className="classic-group">
                <legend>Time</legend>
                <AnalogClock now={now} />
                <div className="field classic-time-text">{now.toLocaleTimeString('en-US')}</div>
              </fieldset>
            </div>
          ) : (
            <div className="classic-datetime-page">
              <p>Current time zone: <b>{tz}</b></p>
            </div>
          )
        }
      </Tabs>
      <DialogButtons winId={winId} apply={() => undefined} />
    </div>
  )
}

/* ---------------------------------------------------------------- Display Properties */

function DisplayDialog({ winId }: AppProps) {
  const { config, background, setBackground } = useClassic()
  const [choice, setChoice] = useState(background)
  const css = config.backgrounds[choice]?.css
  return (
    <div className="app classic-dialog classic-display">
      <Tabs tabs={['Background', 'Screen Saver', 'Appearance', 'Settings']}>
        {tab =>
          tab === 0 ? (
            <div className="classic-display-page">
              <div className="classic-monitor">
                <div className="classic-monitor-screen" style={{ background: css ?? 'var(--desktop)' }} />
              </div>
              <fieldset className="classic-group">
                <legend>Wallpaper</legend>
                <div className="listview sunken classic-display-list">
                  {config.backgrounds.map((b, i) => (
                    <div key={b.name} className={`listview-item${choice === i ? ' selected' : ''}`} onClick={() => setChoice(i)}>
                      {b.name}
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          ) : (
            <div className="classic-display-page center">
              <Icon src={icons.display} size={32} />
              <p>These settings are not available in this recreation.</p>
            </div>
          )
        }
      </Tabs>
      <DialogButtons winId={winId} onOk={() => setBackground(choice)} apply={() => setBackground(choice)} />
    </div>
  )
}

/** Shell dialogs shared by every classic version (opened with os.open(id)). */
export const SHELL_APPS: AppDef[] = [
  { id: 'run', title: 'Run', icon: icons.run, component: RunDialog, width: 360, height: 168, resizable: false, single: true },
  { id: 'datetime', title: 'Date/Time Properties', icon: icons.clock, component: DateTimeDialog, width: 420, height: 330, resizable: false, single: true },
  { id: 'display', title: 'Display Properties', icon: icons.display, component: DisplayDialog, width: 400, height: 440, resizable: false, single: true },
]
