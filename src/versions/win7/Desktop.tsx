import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { extOf, joinPath, parentOf, useFS, useOS, type FsNode } from '../../core'
import { ICONS } from './icons'
import { W7ContextMenu, type W7MenuItem } from './Menu'
import { ICON_SIZES, PATHS, useWin7, type IconSize, type Point } from './shell'

interface Item {
  id: string
  label: string
  icon: string
  /** File system path for real files; undefined for Computer. */
  path?: string
  system?: boolean
  type: 'system' | 'dir' | 'file'
}

const BAD_NAME = /[\\/:*?"<>|]/

export function iconForNode(node: Pick<FsNode, 'type' | 'path'>): string {
  if (node.type === 'dir') return ICONS.folder
  const ext = extOf(node.path)
  if (['bmp', 'png', 'jpg', 'gif'].includes(ext)) return ICONS.image
  return ICONS.text
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max))

/** Desktop surface: freely positioned icons, rubber-band selection, context menu, inline rename. */
export function Desktop() {
  const os = useOS()
  const fs = useFS()
  const w7 = useWin7()
  const size = ICON_SIZES[w7.iconSize]
  const root = useRef<HTMLDivElement>(null)
  const [area, setArea] = useState({ w: window.innerWidth, h: window.innerHeight - 40 })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [band, setBand] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [menu, setMenu] = useState<{ x: number; y: number; items: W7MenuItem[] } | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [drag, setDrag] = useState<Record<string, Point> | null>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ro = new ResizeObserver(() => setArea({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const fsVersion = fs.getVersion()
  const recycleFull = fs.exists(PATHS.recycle) && fs.list(PATHS.recycle).length > 0
  const items: Item[] = useMemo(() => {
    const sys: Item[] = [
      { id: 'sys:computer', label: 'Computer', icon: ICONS.computer, system: true, type: 'system' },
      { id: 'sys:recycle', label: 'Recycle Bin', icon: recycleFull ? ICONS.recycleFull : ICONS.recycle, path: PATHS.recycle, system: true, type: 'system' },
    ]
    const files: Item[] = fs.exists(PATHS.desktop)
      ? fs.list(PATHS.desktop).map(n => ({ id: n.path, label: n.name, icon: iconForNode(n), path: n.path, type: n.type }))
      : []
    const all = [...sys, ...files]
    const rank = (id: string) => { const i = w7.order.indexOf(id); return i < 0 ? Number.MAX_SAFE_INTEGER : i }
    return all.sort((a, b) => rank(a.id) - rank(b.id))
  }, [fs, fsVersion, recycleFull, w7.order]) // eslint-disable-line react-hooks/exhaustive-deps

  // Resolve positions: saved ones first, then fill free grid slots column by column.
  const layout = useMemo(() => {
    const rows = Math.max(1, Math.floor((area.h - 10) / size.height))
    const out: Record<string, Point> = {}
    const taken: Point[] = []
    const overlaps = (p: Point) => taken.some(o => Math.abs(o.x - p.x) < size.width && Math.abs(o.y - p.y) < size.height)
    for (const it of items) {
      const saved = w7.positions[it.id]
      if (saved) {
        const p = { x: clamp(saved.x, 0, Math.max(0, area.w - size.width)), y: clamp(saved.y, 0, Math.max(0, area.h - size.height)) }
        out[it.id] = p
        taken.push(p)
      }
    }
    let slot = 0
    for (const it of items) {
      if (out[it.id]) continue
      let p: Point
      do {
        p = { x: 6 + Math.floor(slot / rows) * size.width, y: 7 + (slot % rows) * size.height }
        slot++
      } while (overlaps(p) && slot < items.length + 400)
      out[it.id] = p
      taken.push(p)
    }
    return out
  }, [items, w7.positions, area, size])

  const posOf = (id: string) => drag?.[id] ?? layout[id]

  const open = (it: Item) => {
    if (it.id === 'sys:computer') os.open('explorer', { path: PATHS.computer })
    else if (it.id === 'sys:recycle') {
      if (!fs.exists(PATHS.recycle)) fs.mkdir(PATHS.recycle)
      os.open('explorer', { path: PATHS.recycle })
    } else if (it.path) os.openPath(it.path)
  }

  const removeSelected = (ids: Set<string> = selected) => {
    const targets = items.filter(i => ids.has(i.id) && !i.system && i.path)
    if (!targets.length) return
    targets.forEach(t => t.path && w7.recycle(t.path))
    setSelected(new Set())
    w7.toast(targets.length === 1 ? `"${targets[0].label}" was moved to the Recycle Bin.` : `${targets.length} items were moved to the Recycle Bin.`)
  }

  const commitRename = (it: Item, raw: string) => {
    setRenaming(null)
    const name = raw.trim()
    if (!it.path || !name || name === it.label) return
    if (BAD_NAME.test(name)) { w7.toast('A file name can\'t contain any of these characters: \\ / : * ? " < > |'); return }
    const to = joinPath(parentOf(it.path), name)
    try {
      fs.rename(it.path, to)
      const p = layout[it.id]
      w7.setPositions(ps => { const { [it.id]: _old, ...rest } = ps; return { ...rest, [to]: p } })
      setSelected(new Set([to]))
    } catch (err) {
      w7.toast(err instanceof Error ? err.message : String(err))
    }
  }

  const newItem = (kind: 'folder' | 'text') => {
    if (!fs.exists(PATHS.desktop)) fs.mkdir(PATHS.desktop)
    const name = fs.uniqueName(PATHS.desktop, kind === 'folder' ? 'New folder' : 'New Text Document.txt')
    const path = joinPath(PATHS.desktop, name)
    if (kind === 'folder') fs.mkdir(path)
    else fs.write(path, '')
    setSelected(new Set([path]))
    setRenaming(path)
  }

  const sortBy = (by: 'name' | 'type') => {
    const sorted = [...items].sort((a, b) => {
      if (a.system !== b.system) return a.system ? -1 : 1
      if (by === 'type' && a.type !== b.type) return a.type === 'dir' ? -1 : 1
      if (by === 'type') return extOf(a.label).localeCompare(extOf(b.label)) || a.label.localeCompare(b.label)
      return a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' })
    })
    w7.arrange(sorted.map(i => i.id))
  }

  const refresh = () => setRefreshKey(k => k + 1)

  const desktopMenu = (): W7MenuItem[] => [
    {
      label: 'View',
      children: (Object.keys(ICON_SIZES) as IconSize[]).map(s => ({
        label: `${s[0].toUpperCase()}${s.slice(1)} icons`, checked: w7.iconSize === s, onClick: () => w7.setIconSize(s),
      })),
    },
    { label: 'Sort by', children: [{ label: 'Name', onClick: () => sortBy('name') }, { label: 'Item type', onClick: () => sortBy('type') }] },
    { label: 'Refresh', onClick: refresh },
    { separator: true },
    { label: 'New', children: [{ label: 'Folder', onClick: () => newItem('folder') }, { label: 'Text Document', onClick: () => newItem('text') }] },
    { separator: true },
    { label: 'Screen resolution', onClick: () => w7.toast(`Your screen resolution is ${window.innerWidth} × ${window.innerHeight}.`) },
    { label: 'Personalize', onClick: () => os.open('personalize') },
  ]

  const itemMenu = (it: Item): W7MenuItem[] => {
    const entries: W7MenuItem[] = [{ label: 'Open', bold: true, onClick: () => open(it) }]
    if (it.id === 'sys:recycle') {
      entries.push(
        { label: 'Empty Recycle Bin', disabled: !recycleFull, onClick: () => { w7.emptyRecycleBin(); w7.toast('The Recycle Bin has been emptied.') } },
        { label: 'Restore all items', disabled: !recycleFull, onClick: () => w7.restoreAll() },
      )
    }
    if (it.type === 'file') entries.push({ label: 'Edit', onClick: () => it.path && os.open('notepad', { path: it.path }) })
    if (!it.system) {
      entries.push(
        { separator: true },
        { label: 'Delete', onClick: () => removeSelected(selected.has(it.id) ? selected : new Set([it.id])) },
        { label: 'Rename', onClick: () => setRenaming(it.id) },
      )
    }
    if (it.id === 'sys:computer') entries.push({ separator: true }, { label: 'Properties', onClick: () => os.open('about') })
    return entries
  }

  const onIconPointerDown = (e: ReactPointerEvent, it: Item) => {
    if (e.button !== 0) return
    e.stopPropagation()
    os.blur()
    root.current?.focus({ preventScroll: true })
    let sel = selected
    if (e.ctrlKey || e.metaKey) {
      sel = new Set(selected)
      if (sel.has(it.id)) sel.delete(it.id); else sel.add(it.id)
    } else if (!selected.has(it.id)) sel = new Set([it.id])
    setSelected(sel)
    if (!sel.has(it.id) || renaming) return
    const sx = e.clientX, sy = e.clientY
    const origins = [...sel].map(id => ({ id, ...layout[id] })).filter(o => Number.isFinite(o.x))
    let moved = false
    let last: Record<string, Point> = {}
    const move = (ev: PointerEvent) => {
      let dx = ev.clientX - sx, dy = ev.clientY - sy
      if (!moved && Math.hypot(dx, dy) < 4) return
      moved = true
      const minX = Math.min(...origins.map(o => o.x)), minY = Math.min(...origins.map(o => o.y))
      const maxX = Math.max(...origins.map(o => o.x + size.width)), maxY = Math.max(...origins.map(o => o.y + size.height))
      dx = clamp(dx, -minX, Math.max(-minX, area.w - maxX))
      dy = clamp(dy, -minY, Math.max(-minY, area.h - maxY))
      last = Object.fromEntries(origins.map(o => [o.id, { x: o.x + dx, y: o.y + dy }]))
      setDrag(last)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      if (moved) w7.setPositions(ps => ({ ...layout, ...ps, ...last }))
      setDrag(null)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const onBackgroundPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0 || e.target !== e.currentTarget) return
    os.blur()
    root.current?.focus({ preventScroll: true })
    const rect = e.currentTarget.getBoundingClientRect()
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top
    const initial = e.ctrlKey || e.metaKey ? new Set(selected) : new Set<string>()
    setSelected(initial)
    const move = (ev: PointerEvent) => {
      const ex = clamp(ev.clientX - rect.left, 0, rect.width), ey = clamp(ev.clientY - rect.top, 0, rect.height)
      const b = { x: Math.min(sx, ex), y: Math.min(sy, ey), w: Math.abs(ex - sx), h: Math.abs(ey - sy) }
      setBand(b)
      const next = new Set(initial)
      for (const it of items) {
        const p = layout[it.id]
        if (p.x < b.x + b.w && p.x + size.width > b.x && p.y < b.y + b.h && p.y + size.height > b.y) next.add(it.id)
      }
      setSelected(next)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      setBand(null)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).closest('input')) return
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); setSelected(new Set(items.map(i => i.id))) }
    else if (e.key === 'Delete') { e.preventDefault(); removeSelected() }
    else if (e.key === 'F2' && selected.size === 1) { e.preventDefault(); const id = [...selected][0]; if (!items.find(i => i.id === id)?.system) setRenaming(id) }
    else if (e.key === 'Enter') { e.preventDefault(); items.filter(i => selected.has(i.id)).forEach(open) }
    else if (e.key === 'F5') { e.preventDefault(); refresh() }
  }

  // Drop selection for items that vanished (deleted / renamed elsewhere).
  useEffect(() => {
    const ids = new Set(items.map(i => i.id))
    setSelected(s => ([...s].every(id => ids.has(id)) ? s : new Set([...s].filter(id => ids.has(id)))))
  }, [items])

  return (
    <div
      ref={root}
      className={`w7-desktop${refreshKey ? ` refreshed-${refreshKey % 2}` : ''}`}
      tabIndex={-1}
      style={{ ['--icon-w' as string]: `${size.width}px`, ['--icon-h' as string]: `${size.height}px`, ['--icon-img' as string]: `${size.icon}px` }}
      onPointerDown={onBackgroundPointerDown}
      onKeyDown={onKeyDown}
      onContextMenu={e => {
        e.preventDefault()
        if (e.target === e.currentTarget) { setSelected(new Set()); setMenu({ x: e.clientX, y: e.clientY, items: desktopMenu() }) }
      }}
    >
      {items.map(it => {
        const p = posOf(it.id)
        return (
          <div
            key={it.id}
            className={`w7-icon${selected.has(it.id) ? ' selected' : ''}${drag?.[it.id] ? ' dragging' : ''}`}
            style={{ left: p.x, top: p.y }}
            title={it.label}
            onPointerDown={e => onIconPointerDown(e, it)}
            onDoubleClick={() => renaming !== it.id && open(it)}
            onContextMenu={e => {
              e.preventDefault()
              e.stopPropagation()
              if (!selected.has(it.id)) setSelected(new Set([it.id]))
              setMenu({ x: e.clientX, y: e.clientY, items: itemMenu(it) })
            }}
          >
            <img src={it.icon} alt="" draggable={false} />
            {renaming === it.id
              ? <RenameBox initial={it.label} onDone={v => (v === null ? setRenaming(null) : commitRename(it, v))} />
              : <span className="w7-icon-label">{it.label}</span>}
          </div>
        )
      })}
      {band && <div className="w7-band" style={{ left: band.x, top: band.y, width: band.w, height: band.h }} />}
      {menu && <W7ContextMenu {...menu} onClose={() => setMenu(null)} />}
    </div>
  )
}

function RenameBox({ initial, onDone }: { initial: string; onDone: (v: string | null) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.focus()
    const dot = initial.lastIndexOf('.')
    el.setSelectionRange(0, dot > 0 ? dot : initial.length)
  }, [initial])
  const finish = (v: string | null) => { if (!done.current) { done.current = true; onDone(v) } }
  return (
    <textarea
      ref={ref}
      className="w7-rename"
      defaultValue={initial}
      rows={2}
      spellCheck={false}
      onPointerDown={e => e.stopPropagation()}
      onDoubleClick={e => e.stopPropagation()}
      onKeyDown={e => {
        e.stopPropagation()
        if (e.key === 'Enter') { e.preventDefault(); finish(e.currentTarget.value) }
        if (e.key === 'Escape') finish(null)
      }}
      onBlur={e => finish(e.currentTarget.value)}
    />
  )
}
