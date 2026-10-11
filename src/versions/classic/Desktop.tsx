import { useState, type MouseEvent } from 'react'
import { DesktopIcons, baseName, joinPath, useFS, useOS, type DesktopIconDef, type FsNode } from '../../core'
import { CascadePopup } from './CascadeMenu'
import { useClassic } from './context'
import { fileIcon } from './util'
import { icons } from './icons'
import type { CascadeItem, ShellCtx } from './types'
import { TASKBAR_HEIGHT } from './Taskbar'

type SortKey = 'name' | 'type' | 'size' | 'date'

const sorters: Record<SortKey, (a: FsNode, b: FsNode) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  type: (a, b) => (a.type === b.type ? a.name.split('.').pop()!.localeCompare(b.name.split('.').pop()!) : a.type === 'dir' ? -1 : 1),
  size: (a, b) => a.size - b.size,
  date: (a, b) => a.modified - b.modified,
}

interface MenuState { x: number; y: number; items: CascadeItem[] }

/** Desktop surface: wallpaper, shortcuts + files of the Desktop folder, right-click menus. */
export function Desktop() {
  const os = useOS()
  const fs = useFS()
  const classic = useClassic()
  const { config, shell } = classic
  const ctx: ShellCtx = { os, shell, config }
  const [menu, setMenu] = useState<MenuState | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [autoArrange, setAutoArrange] = useState(true)

  const files = fs.exists(config.desktopPath) ? [...fs.list(config.desktopPath)].sort(sorters[sortKey]) : []
  const recycleFull = fs.exists(config.recyclePath) && fs.list(config.recyclePath).length > 0

  const iconDefs: DesktopIconDef[] = [
    ...config.desktopIcons.map(ic => ({
      id: ic.id,
      label: ic.label,
      icon: ic.id === 'recycle' && recycleFull ? icons.recycleFull : ic.icon,
      onOpen: () => ic.action(ctx),
    })),
    ...files.map(f => ({ id: f.path, label: f.name, icon: fileIcon(f), onOpen: () => os.openPath(f.path) })),
  ]

  const createNew = (name: string, dir: boolean) => {
    const path = joinPath(config.desktopPath, fs.uniqueName(config.desktopPath, name))
    if (dir) fs.mkdir(path)
    else fs.write(path, '')
  }

  const emptyRecycleBin = () => {
    for (const n of fs.list(config.recyclePath)) fs.remove(n.path)
  }

  const desktopMenu: CascadeItem[] = [
    {
      label: 'Arrange Icons',
      children: [
        ...(['name', 'type', 'size', 'date'] as const).map(k => ({
          label: `by ${k[0].toUpperCase()}${k.slice(1)}`,
          checked: sortKey === k,
          action: () => setSortKey(k),
        })),
        { separator: true },
        { label: 'Auto Arrange', checked: autoArrange, action: () => setAutoArrange(a => !a) },
      ],
    },
    { label: 'Line up Icons', disabled: autoArrange },
    { separator: true },
    { label: 'Refresh', action: () => setSortKey(k => k) },
    { separator: true },
    { label: 'Paste', disabled: true },
    { label: 'Paste Shortcut', disabled: true },
    { separator: true },
    ...(config.desktopMenuExtra ?? []),
    {
      label: 'New',
      children: [
        { label: 'Folder', icon: icons.folder, action: () => createNew('New Folder', true) },
        { label: 'Shortcut', disabled: true },
        { separator: true },
        { label: 'Text Document', icon: icons.textFile, action: () => createNew('New Text Document.txt', false) },
        { label: 'Bitmap Image', icon: icons.bitmap, action: () => createNew('New Bitmap Image.bmp', false) },
      ],
    },
    { separator: true },
    { label: 'Properties', action: () => os.open('display') },
  ]

  const iconMenu = (index: number): CascadeItem[] => {
    const def = iconDefs[index]
    const sys = config.desktopIcons.find(i => i.id === def.id)
    if (sys) {
      return [
        { label: 'Open', action: def.onOpen },
        ...(sys.id === 'mycomputer' ? [{ label: 'Explore', action: () => shell.openMyComputer() }] : []),
        ...(sys.id === 'recycle' ? [{ separator: true }, { label: 'Empty Recycle Bin', disabled: !recycleFull, action: emptyRecycleBin }] : []),
        { separator: true },
        { label: 'Properties', action: () => os.alert(`${sys.label} Properties`, `${sys.label}\n\n${config.about.product}`, 'info') },
      ]
    }
    const path = def.id
    return [
      { label: 'Open', action: def.onOpen },
      { separator: true },
      { label: 'Cut', disabled: true },
      { label: 'Copy', disabled: true },
      { separator: true },
      {
        label: 'Delete',
        action: () => {
          if (!fs.exists(config.recyclePath)) fs.mkdir(config.recyclePath)
          fs.rename(path, joinPath(config.recyclePath, fs.uniqueName(config.recyclePath, baseName(path))))
        },
      },
      { separator: true },
      {
        label: 'Properties',
        action: () => {
          const n = files.find(f => f.path === path)
          os.alert(`${baseName(path)} Properties`, `${baseName(path)}\nLocation: ${config.desktopPath.replace(/\//g, '\\')}\nSize: ${n?.size ?? 0} bytes\nModified: ${new Date(n?.modified ?? Date.now()).toLocaleString()}`, 'info')
        },
      },
    ]
  }

  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault()
    const iconEl = (e.target as HTMLElement).closest('.desktop-icon')
    const index = iconEl ? Array.prototype.indexOf.call(iconEl.parentElement?.children ?? [], iconEl) : -1
    setMenu({ x: e.clientX, y: e.clientY, items: index >= 0 ? iconMenu(index) : desktopMenu })
  }

  const bg = config.backgrounds[classic.background]?.css
  return (
    <div
      className="classic-desktop"
      style={{ bottom: TASKBAR_HEIGHT, background: bg ?? undefined }}
      onPointerDown={e => { if (!(e.target as HTMLElement).closest('.desktop-icon')) os.blur() }}
      onContextMenu={onContextMenu}
    >
      <DesktopIcons icons={iconDefs} />
      {menu && <CascadePopup x={menu.x} y={menu.y} items={menu.items} ctx={ctx} onClose={() => setMenu(null)} />}
    </div>
  )
}
