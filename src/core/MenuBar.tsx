import { useState } from 'react'
import { useClickOutside } from './hooks'

export interface MenuItem {
  label?: string
  onClick?: () => void
  disabled?: boolean
  checked?: boolean
  shortcut?: string
  separator?: boolean
}

export interface Menu {
  label: string
  items: MenuItem[]
}

/**
 * Classic application menu bar (File Edit View Help).
 * Markup: .menubar > .menubar-item(.open) > .menu-dropdown > .menu-item / .menu-separator
 */
export function MenuBar({ menus }: { menus: Menu[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const ref = useClickOutside<HTMLDivElement>(open !== null, () => setOpen(null))
  return (
    <div className="menubar" ref={ref}>
      {menus.map((m, i) => (
        <div
          key={m.label}
          className={`menubar-item${open === i ? ' open' : ''}`}
          onPointerDown={() => setOpen(open === i ? null : i)}
          onPointerEnter={() => open !== null && setOpen(i)}
        >
          <span>{m.label}</span>
          {open === i && <MenuList items={m.items} onDone={() => setOpen(null)} />}
        </div>
      ))}
    </div>
  )
}

/** Dropdown / context menu list. */
export function MenuList({ items, onDone, style }: { items: MenuItem[]; onDone: () => void; style?: React.CSSProperties }) {
  return (
    <div className="menu-dropdown" style={style} onPointerDown={e => e.stopPropagation()}>
      {items.map((it, i) =>
        it.separator ? (
          <div key={i} className="menu-separator" />
        ) : (
          <div
            key={i}
            className={`menu-item${it.disabled ? ' disabled' : ''}${it.checked ? ' checked' : ''}`}
            onClick={() => { if (it.disabled) return; onDone(); it.onClick?.() }}
          >
            <span className="menu-check">{it.checked ? '✓' : ''}</span>
            <span className="menu-label">{it.label}</span>
            {it.shortcut && <span className="menu-shortcut">{it.shortcut}</span>}
          </div>
        ),
      )}
    </div>
  )
}

/** Right-click menu positioned at (x, y). Render conditionally; call onClose to dismiss. */
export function ContextMenu({ x, y, items, onClose }: { x: number; y: number; items: MenuItem[]; onClose: () => void }) {
  const ref = useClickOutside<HTMLDivElement>(true, onClose)
  const left = Math.min(x, window.innerWidth - 200)
  const top = Math.min(y, window.innerHeight - items.length * 24 - 10)
  return (
    <div ref={ref} className="context-menu" style={{ position: 'fixed', left, top, zIndex: 100000 }}>
      <MenuList items={items} onDone={onClose} />
    </div>
  )
}
