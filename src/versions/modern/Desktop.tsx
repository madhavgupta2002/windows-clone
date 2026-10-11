import { useState, type MouseEvent } from 'react'
import { ContextMenu, DesktopIcons, joinPath, useFS, useOS, type DesktopIconDef, type MenuItem } from '../../core'
import { useModern } from './context'
import { DESKTOP_DIR, iconForPath, useOpenSettings } from './launch'

/**
 * Wallpaper + desktop icons + desktop context menu. Fixed shortcuts come first,
 * followed by whatever is stored in the user's Desktop folder.
 */
export function ModernDesktop({ shortcuts }: { shortcuts: DesktopIconDef[] }) {
  const os = useOS()
  const fs = useFS()
  const m = useModern()
  const openSettings = useOpenSettings()
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const [showIcons, setShowIcons] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const files: DesktopIconDef[] = fs.isDir(DESKTOP_DIR)
    ? fs.list(DESKTOP_DIR).map(n => ({ id: n.path, label: n.name, icon: iconForPath(fs, n.path), onOpen: () => os.openPath(n.path) }))
    : []

  const create = (name: string, content: string | null) => {
    const path = joinPath(DESKTOP_DIR, fs.uniqueName(DESKTOP_DIR, name))
    if (content === null) fs.mkdir(path)
    else fs.write(path, content)
  }

  const items: MenuItem[] = [
    { label: 'Show desktop icons', checked: showIcons, onClick: () => setShowIcons(s => !s) },
    { label: 'Refresh', onClick: () => setRefreshKey(k => k + 1) },
    { separator: true },
    { label: 'New folder', onClick: () => create('New folder', null) },
    { label: 'New Text Document', onClick: () => create('New Text Document.txt', '') },
    { separator: true },
    { label: 'Display settings', onClick: () => openSettings('system/display') },
    { label: 'Personalize', onClick: () => openSettings('personalization') },
  ]

  const onContext = (e: MouseEvent) => {
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY })
  }

  return (
    <div className="m-desktop" onContextMenu={onContext} onPointerDown={e => e.target === e.currentTarget && os.blur()}>
      <div className="m-wallpaper" aria-hidden="true"><m.wallpaper.Component /></div>
      {showIcons && <DesktopIcons key={refreshKey} className="m-desktop-icons" icons={[...shortcuts, ...files]} />}
      {menu && <ContextMenu x={menu.x} y={menu.y} items={items} onClose={() => setMenu(null)} />}
    </div>
  )
}
