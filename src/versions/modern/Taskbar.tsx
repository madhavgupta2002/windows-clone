import { useRef, useState, type ReactNode } from 'react'
import { ContextMenu, Icon, useOS, type MenuItem } from '../../core'
import { clickTaskItem, useTaskItems, type TaskItem } from './launch'

/** Icon-only taskbar buttons for pinned + running apps (shared by Win10 and Win11). */
export function TaskButtons({ pinned }: { pinned: readonly string[] }) {
  const os = useOS()
  const items = useTaskItems(pinned)
  const [menu, setMenu] = useState<{ x: number; y: number; item: TaskItem } | null>(null)

  const menuItems = (item: TaskItem): MenuItem[] => [
    { label: os.apps[item.appId]?.title ?? item.title, onClick: () => os.open(item.appId) },
    ...(item.windows.length ? [
      { separator: true },
      { label: item.windows.length > 1 ? 'Close all windows' : 'Close window', onClick: () => item.windows.forEach(w => os.close(w.id)) },
    ] : []),
  ]

  return (
    <>
      {items.map(item => {
        const cls = ['m-taskbtn', item.windows.length ? 'running' : '', item.active ? 'focused' : '', item.windows.length > 1 ? 'multi' : '']
        const title = item.windows.length === 1 ? item.windows[0].title : item.title
        return (
          <button
            key={item.appId}
            className={cls.filter(Boolean).join(' ')}
            title={title}
            aria-label={title}
            onClick={() => clickTaskItem(os, item)}
            onContextMenu={e => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY - 80, item }) }}
          >
            <Icon src={item.icon} size={24} />
          </button>
        )
      })}
      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems(menu.item)} onClose={() => setMenu(null)} />}
    </>
  )
}

/** "Show desktop": minimizes every window; clicking again restores them. */
export function ShowDesktopButton({ children }: { children?: ReactNode }) {
  const os = useOS()
  const hidden = useRef<string[]>([])
  const onClick = () => {
    const visible = os.windows.filter(w => !w.minimized)
    if (visible.length) {
      hidden.current = visible.sort((a, b) => a.z - b.z).map(w => w.id)
      visible.forEach(w => os.minimize(w.id))
    } else {
      hidden.current.filter(id => os.windows.some(w => w.id === id)).forEach(id => os.focus(id))
      hidden.current = []
    }
  }
  return <button className="m-showdesktop" title="Show desktop" aria-label="Show desktop" onClick={onClick}>{children}</button>
}
