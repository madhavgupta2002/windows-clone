import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Icon, MenuBar, useOS, usePref, type AppProps, type Menu, type MenuItem, type OS } from '../../core'
import { W16, useWin16 } from '../win16/context'
import { ConfirmDialog, PromptDialog } from '../win16/Dialog'
import { runProgram } from '../win16/dos'
import { ControlMenu } from '../win16/Frame'
import { ICONS } from '../win16/icons'
import { cascadeRects, tileRects, trackPointer, type Rect } from '../win16/layout'

/** A program item: launches an app, opens a document, or shows a message. */
interface PmItem {
  label: string
  icon: string
  run: (os: OS) => void
}

const say = (title: string, text: string) => (os: OS) => os.alert(title, text, 'info')

const ITEMS: Record<string, PmItem> = {
  winfile: { label: 'File Manager', icon: ICONS.filemgr, run: os => { os.open('explorer', { path: 'C:' }) } },
  control: { label: 'Control Panel', icon: ICONS.control, run: os => { os.open('w3-control') } },
  dos: { label: 'MS-DOS Prompt', icon: ICONS.dos, run: os => { os.open(W16.dosprompt) } },
  setup: {
    label: 'Windows Setup', icon: ICONS.setup,
    run: say('Windows Setup', 'Display: VGA\nKeyboard: Enhanced 101 or 102 key US and Non US keyboards\nMouse: Microsoft, or IBM PS/2\nNetwork: No Network Installed'),
  },
  readme: { label: 'Read Me', icon: ICONS.readme, run: os => os.openPath('C:/WINDOWS/README.TXT') },
  paintbrush: { label: 'Paintbrush', icon: ICONS.paint, run: os => { os.open('paint') } },
  notepad: { label: 'Notepad', icon: ICONS.notepad, run: os => { os.open('notepad') } },
  write: { label: 'Write', icon: ICONS.write, run: os => { os.open('notepad', { title: 'Write - (Untitled)' }) } },
  calculator: { label: 'Calculator', icon: ICONS.calculator, run: os => { os.open('calculator') } },
  clock: { label: 'Clock', icon: ICONS.clock, run: os => { os.open(W16.clock) } },
  terminal: { label: 'Terminal', icon: ICONS.exe, run: say('Terminal', 'No modem was detected on COM1:.') },
  minesweeper: { label: 'Minesweeper', icon: ICONS.minesweeper, run: os => { os.open('minesweeper') } },
  reversi: { label: 'Reversi', icon: ICONS.reversi, run: os => { os.open(W16.reversi) } },
}

interface Group extends Rect {
  id: string
  title: string
  items: string[]
  minimized: boolean
}

interface PmState {
  /** Back-to-front z order. */
  groups: Group[]
  maximized: string | null
  minimizeOnUse: boolean
  autoArrange: boolean
  saveSettings: boolean
}

const DEFAULT_STATE: PmState = {
  groups: [
    { id: 'startup', title: 'StartUp', items: [], minimized: true, x: 20, y: 20, w: 260, h: 110 },
    { id: 'games', title: 'Games', items: ['minesweeper', 'reversi'], minimized: false, x: 14, y: 196, w: 220, h: 110 },
    { id: 'accessories', title: 'Accessories', items: ['write', 'paintbrush', 'terminal', 'notepad', 'calculator', 'clock'], minimized: false, x: 250, y: 110, w: 330, h: 150 },
    { id: 'main', title: 'Main', items: ['winfile', 'control', 'dos', 'setup', 'readme'], minimized: false, x: 8, y: 8, w: 340, h: 150 },
  ],
  maximized: null,
  minimizeOnUse: false,
  autoArrange: true,
  saveSettings: true,
}

const ICON_SLOT = 78
const ICON_ROW = 64

/** Program Manager: MDI client with program group windows. Closing it exits Windows. */
export function ProgramManager({ winId }: AppProps) {
  const os = useOS()
  const { requestExit } = useWin16()
  const [saved, setSaved] = usePref<PmState>('win3.progman', DEFAULT_STATE)
  // When "Save Settings on Exit" is off, changes live only for this session.
  const [state, setState] = useState<PmState>(saved)
  const [selected, setSelected] = useState<Record<string, string | undefined>>({})
  const [dialog, setDialog] = useState<'new' | 'delete' | 'run' | null>(null)
  const [runMin, setRunMin] = useState(false)
  const clientRef = useRef<HTMLDivElement>(null)
  const [client, setClient] = useState({ w: 600, h: 360 })

  useEffect(() => { if (state.saveSettings) setSaved(state) }, [state, setSaved])
  useEffect(() => {
    const el = clientRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setClient({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const groups = state.groups
  const visible = groups.filter(g => !g.minimized)
  const active = groups[groups.length - 1]
  const update = (fn: (s: PmState) => PmState) => setState(fn)
  const patchGroup = (id: string, p: Partial<Group>) => update(s => ({ ...s, groups: s.groups.map(g => (g.id === id ? { ...g, ...p } : g)) }))
  const raise = (id: string, p: Partial<Group> = {}) => update(s => {
    const g = s.groups.find(x => x.id === id)
    return g ? { ...s, groups: [...s.groups.filter(x => x.id !== id), { ...g, ...p }] } : s
  })
  const minimizeGroup = (id: string) => update(s => ({
    ...s,
    maximized: s.maximized === id ? null : s.maximized,
    // Minimized groups drop to the back so the next open group becomes active.
    groups: [{ ...s.groups.find(g => g.id === id)!, minimized: true }, ...s.groups.filter(g => g.id !== id)],
  }))
  const toggleMax = (id: string) => { update(s => ({ ...s, maximized: s.maximized === id ? null : id })); raise(id, { minimized: false }) }

  useEffect(() => {
    const max = groups.find(g => g.id === state.maximized && !g.minimized)
    os.setTitle(winId, max ? `Program Manager - [${max.title}]` : 'Program Manager')
  }, [state.maximized, groups]) // eslint-disable-line react-hooks/exhaustive-deps

  const launch = (key: string) => {
    ITEMS[key]?.run(os)
    if (state.minimizeOnUse) os.minimize(winId)
  }

  const arrange = (rects: Rect[]) => update(s => {
    const order = s.groups.filter(g => !g.minimized).map(g => g.id)
    return { ...s, maximized: null, groups: s.groups.map(g => { const i = order.indexOf(g.id); return i < 0 ? g : { ...g, ...rects[i] } }) }
  })
  const area = { x: 0, y: 0, w: client.w, h: Math.max(120, client.h - (groups.some(g => g.minimized) ? ICON_ROW : 0)) }

  const toggle = (k: 'minimizeOnUse' | 'autoArrange' | 'saveSettings') => update(s => ({ ...s, [k]: !s[k] }))
  const openSelected = () => {
    const key = active && !active.minimized ? selected[active.id] : undefined
    if (key) launch(key)
    else if (active?.minimized) raise(active.id, { minimized: false })
  }

  const menus: Menu[] = [
    {
      label: 'File',
      items: [
        { label: 'New...', onClick: () => setDialog('new') },
        { label: 'Open', shortcut: 'Enter', onClick: openSelected },
        { label: 'Move...', shortcut: 'F7', disabled: true },
        { label: 'Copy...', shortcut: 'F8', disabled: true },
        { label: 'Delete', shortcut: 'Del', disabled: !active, onClick: () => setDialog('delete') },
        { label: 'Properties...', shortcut: 'Alt+Enter', disabled: true },
        { separator: true },
        { label: 'Run...', onClick: () => setDialog('run') },
        { separator: true },
        { label: 'Exit Windows...', onClick: requestExit },
      ],
    },
    {
      label: 'Options',
      items: [
        { label: 'Auto Arrange', checked: state.autoArrange, onClick: () => toggle('autoArrange') },
        { label: 'Minimize on Use', checked: state.minimizeOnUse, onClick: () => toggle('minimizeOnUse') },
        { label: 'Save Settings on Exit', checked: state.saveSettings, onClick: () => toggle('saveSettings') },
      ],
    },
    {
      label: 'Window',
      items: [
        { label: 'Cascade', shortcut: 'Shift+F5', onClick: () => arrange(cascadeRects(visible.length, area, 24)) },
        { label: 'Tile', shortcut: 'Shift+F4', onClick: () => arrange(tileRects(visible.length, area)) },
        { label: 'Arrange Icons' }, // group icons are always arranged along the bottom
        { separator: true },
        ...[...groups].sort((a, b) => a.title.localeCompare(b.title)).map<MenuItem>((g, i) => ({
          label: `${i + 1} ${g.title}`, checked: g.id === active?.id, onClick: () => raise(g.id, { minimized: false }),
        })),
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'Contents', onClick: () => os.alert('Program Manager Help', 'Double-click a program-item icon to start an application. Use the Window menu to arrange group windows.', 'info') },
        { label: 'Search for Help on...', disabled: true },
        { label: 'How to Use Help', disabled: true },
        { separator: true },
        { label: 'Windows Tutorial', disabled: true },
        { separator: true },
        { label: 'About Program Manager...', onClick: () => { os.open('about') } },
      ],
    },
  ]

  const minimized = groups.filter(g => g.minimized)

  return (
    <div
      className="app app-w3-progman"
      tabIndex={-1}
      onKeyDown={e => {
        if (dialog) return
        if (e.key === 'Enter') openSelected()
        else if (e.key === 'Delete' && active) setDialog('delete')
      }}
    >
      <MenuBar menus={menus} />
      <div className="pm-client" ref={clientRef} onPointerDown={e => e.target === e.currentTarget && setSelected({})}>
        {groups.map(g => !g.minimized && (
          <GroupWindow
            key={g.id}
            group={g}
            z={groups.indexOf(g) + 1}
            active={g === active}
            maximized={state.maximized === g.id}
            client={client}
            selected={selected[g.id]}
            onSelect={key => setSelected(s => ({ ...s, [g.id]: key }))}
            onActivate={() => g !== active && raise(g.id)}
            onMove={r => patchGroup(g.id, r)}
            onMinimize={() => minimizeGroup(g.id)}
            onMaximize={() => toggleMax(g.id)}
            onLaunch={launch}
          />
        ))}
        {minimized.map((g, i) => {
          const perRow = Math.max(1, Math.floor(client.w / ICON_SLOT))
          return (
            <div
              key={g.id}
              className={`pm-group-icon${g === active ? ' selected' : ''}`}
              style={{ left: (i % perRow) * ICON_SLOT + 4, top: client.h - ICON_ROW * (Math.floor(i / perRow) + 1) + 4, zIndex: groups.length + 1 }}
              onPointerDown={() => raise(g.id)}
              onDoubleClick={() => raise(g.id, { minimized: false })}
            >
              <Icon src={ICONS.group} size={32} />
              <span>{g.title}</span>
            </div>
          )
        })}
      </div>

      {dialog === 'new' && (
        <PromptDialog title="Program Group Properties" label="Description:" onCancel={() => setDialog(null)} onOk={v => {
          const title = v.trim()
          setDialog(null)
          if (!title) return
          const id = `g${Date.now()}`
          update(s => ({ ...s, maximized: null, groups: [...s.groups, { id, title, items: [], minimized: false, x: 30 + s.groups.length * 12, y: 30 + s.groups.length * 12, w: 300, h: 140 }] }))
        }} />
      )}
      {dialog === 'delete' && active && (
        <ConfirmDialog title="Delete" text={`Are you sure you want to delete the group '${active.title}'?`} onCancel={() => setDialog(null)} onOk={() => {
          setDialog(null)
          update(s => ({ ...s, groups: s.groups.filter(g => g.id !== active.id) }))
        }} />
      )}
      {dialog === 'run' && (
        <PromptDialog
          title="Run" label="Command Line:"
          extra={<label className="w16-check"><input type="checkbox" checked={runMin} onChange={e => setRunMin(e.target.checked)} /> Run Minimized</label>}
          onCancel={() => setDialog(null)}
          onOk={v => {
            setDialog(null)
            const id = runProgram(os, v)
            if (id && runMin) os.minimize(id)
          }}
        />
      )}
    </div>
  )
}

interface GroupWindowProps {
  group: Group
  z: number
  active: boolean
  maximized: boolean
  client: { w: number; h: number }
  selected?: string
  onSelect: (key: string) => void
  onActivate: () => void
  onMove: (r: Rect) => void
  onMinimize: () => void
  onMaximize: () => void
  onLaunch: (key: string) => void
}

/** A program group: a child window inside Program Manager's client area. */
function GroupWindow(p: GroupWindowProps) {
  const { group: g } = p

  const drag = (e: ReactPointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button, [data-no-drag]')) return
    p.onActivate()
    if (p.maximized) return
    const { x, y, w, h } = g
    trackPointer(e, (dx, dy) => p.onMove({
      x: Math.min(Math.max(x + dx, 40 - w), p.client.w - 40),
      y: Math.min(Math.max(y + dy, 0), p.client.h - 20),
      w, h,
    }))
  }
  const resize = (e: ReactPointerEvent) => {
    e.stopPropagation()
    p.onActivate()
    const { x, y, w, h } = g
    trackPointer(e, (dx, dy) => p.onMove({ x, y, w: Math.max(140, w + dx), h: Math.max(70, h + dy) }))
  }

  const items: MenuItem[] = [
    { label: 'Restore', disabled: !p.maximized, onClick: p.onMaximize },
    { label: 'Move', disabled: true },
    { label: 'Size', disabled: true },
    { label: 'Minimize', onClick: p.onMinimize },
    { label: 'Maximize', disabled: p.maximized, onClick: p.onMaximize },
    { separator: true },
    { label: 'Close', shortcut: 'Ctrl+F4', onClick: p.onMinimize },
    { label: 'Next', shortcut: 'Ctrl+F6', disabled: true },
  ]

  const style = p.maximized
    ? { left: 0, top: 0, right: 0, bottom: 0, zIndex: p.z }
    : { left: g.x, top: g.y, width: g.w, height: g.h, zIndex: p.z }

  return (
    <div
      className={`w16-frame pm-group sizable${p.active ? ' active' : ''}${p.maximized ? ' maximized' : ''}`}
      style={{ position: 'absolute', ...style }}
      onPointerDownCapture={p.onActivate}
    >
      <div className="w16-inner">
        <div className="w16-titlebar" onPointerDown={drag} onDoubleClick={p.onMaximize}>
          <ControlMenu items={items} />
          <span className="w16-title">{g.title}</span>
          <button className="w16-btn w16-min" onClick={p.onMinimize} aria-label="Minimize">
            <svg viewBox="0 0 11 11" width="11" height="11" aria-hidden><path d="M1 3h9L5.5 7.5z" /></svg>
          </button>
          <button className="w16-btn w16-max" onClick={p.onMaximize} aria-label={p.maximized ? 'Restore' : 'Maximize'}>
            <svg viewBox="0 0 11 11" width="11" height="11" aria-hidden>
              {p.maximized ? <><path d="M1 5h9L5.5 1z" /><path d="M1 6h9L5.5 10z" /></> : <path d="M1 7.5h9L5.5 3z" />}
            </svg>
          </button>
        </div>
        <div className="w16-body pm-items" onPointerDown={e => e.target === e.currentTarget && p.onSelect('')}>
          {g.items.filter(k => ITEMS[k]).map(k => (
            <div
              key={k}
              className={`pm-item${p.selected === k ? ' selected' : ''}`}
              onPointerDown={() => p.onSelect(k)}
              onDoubleClick={() => p.onLaunch(k)}
            >
              <Icon src={ITEMS[k].icon} size={32} />
              <span>{ITEMS[k].label}</span>
            </div>
          ))}
        </div>
      </div>
      {!p.maximized && <div className="pm-resize" onPointerDown={resize} />}
    </div>
  )
}
