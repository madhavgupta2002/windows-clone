import { useLayoutEffect, useRef, useState } from 'react'
import { useClickOutside } from '../../core'

/** Context menu item with optional cascading submenu. */
export interface W7MenuItem {
  label?: string
  onClick?: () => void
  disabled?: boolean
  checked?: boolean
  bold?: boolean
  separator?: boolean
  children?: W7MenuItem[]
}

function List({ items, onDone }: { items: W7MenuItem[]; onDone: () => void }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="menu-dropdown" onPointerDown={e => e.stopPropagation()}>
      {items.map((it, i) =>
        it.separator ? <div key={i} className="menu-separator" /> : (
          <div
            key={i}
            className={`menu-item${it.disabled ? ' disabled' : ''}${it.checked ? ' checked' : ''}${open === i ? ' open' : ''}`}
            style={it.bold ? { fontWeight: 600 } : undefined}
            onPointerEnter={() => setOpen(it.children ? i : null)}
            onClick={() => {
              if (it.disabled || it.children) return
              onDone()
              it.onClick?.()
            }}
          >
            <span className="menu-check">{it.checked ? '●' : ''}</span>
            <span className="menu-label">{it.label}</span>
            {it.children && <span className="menu-arrow">▸</span>}
            {it.children && open === i && (
              <div className="w7-submenu"><List items={it.children} onDone={onDone} /></div>
            )}
          </div>
        ),
      )}
    </div>
  )
}

/** Right-click menu at (x, y) that keeps itself on-screen and supports submenus. */
export function W7ContextMenu({ x, y, items, onClose }: { x: number; y: number; items: W7MenuItem[]; onClose: () => void }) {
  const ref = useClickOutside<HTMLDivElement>(true, onClose)
  const [pos, setPos] = useState({ left: x, top: y, flip: false })
  const inner = useRef<HTMLDivElement | null>(null)
  useLayoutEffect(() => {
    const el = inner.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos({
      left: Math.max(0, Math.min(x, window.innerWidth - r.width - 2)),
      top: Math.max(0, Math.min(y, window.innerHeight - r.height - 2)),
      flip: x + r.width + 200 > window.innerWidth,
    })
  }, [x, y])
  return (
    <div
      ref={el => { ref.current = el; inner.current = el }}
      className={`context-menu${pos.flip ? ' flip' : ''}`}
      style={{ position: 'fixed', left: pos.left, top: pos.top, zIndex: 100000 }}
      onContextMenu={e => e.preventDefault()}
    >
      <List items={items} onDone={onClose} />
    </div>
  )
}
