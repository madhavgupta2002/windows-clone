import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Icon, useClickOutside } from '../../core'
import type { CascadeItem, ShellCtx } from './types'

const resolve = (children: CascadeItem['children'], ctx: ShellCtx): CascadeItem[] =>
  typeof children === 'function' ? children(ctx) : children ?? []

interface CascadeMenuProps {
  items: CascadeItem[]
  ctx: ShellCtx
  onDone: () => void
  /** Large (32px) icons for the Start menu's first level. */
  large?: boolean
  className?: string
  style?: CSSProperties
  /** Rendered before the item list (Start menu banner). */
  aside?: ReactNode
}

/**
 * A classic menu with cascading submenus that open on hover, like the Start menu
 * and desktop context menu. Submenus flip/shift to stay on screen.
 */
export function CascadeMenu({ items, ctx, onDone, large, className = '', style, aside }: CascadeMenuProps) {
  const [hot, setHot] = useState<number | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const enter = (i: number, it: CascadeItem) => {
    setHot(i)
    clearTimeout(timer.current)
    const hasKids = !!it.children && !it.disabled
    // Short delay, like the real thing, so diagonal mouse moves don't flicker submenus.
    timer.current = setTimeout(() => setOpen(hasKids ? i : null), hasKids ? 120 : 250)
  }

  const activate = (i: number, it: CascadeItem) => {
    if (it.disabled) return
    if (it.children) { clearTimeout(timer.current); setOpen(i); return }
    onDone()
    it.action?.(ctx)
  }

  useLayoutEffect(() => () => clearTimeout(timer.current), [])

  return (
    <div
      className={`cascade-menu${large ? ' large' : ''} ${className}`}
      style={style}
      onPointerLeave={() => { clearTimeout(timer.current); setHot(open) }}
      onPointerDown={e => e.stopPropagation()}
      onContextMenu={e => e.preventDefault()}
    >
      {aside}
      <div className="cascade-items">
        {items.map((it, i) =>
          it.separator ? (
            <div key={i} className="cascade-separator" />
          ) : (
            <div
              key={i}
              className={`cascade-item${hot === i ? ' hot' : ''}${it.disabled ? ' disabled' : ''}`}
              onPointerEnter={() => enter(i, it)}
              onClick={e => { e.stopPropagation(); activate(i, it) }}
            >
              <span className="cascade-icon">
                {it.checked ? <span className="cascade-check">✓</span> : it.icon && <Icon src={it.icon} size={large ? 32 : 16} />}
              </span>
              <span className="cascade-label">{it.label}</span>
              {it.children && <span className="cascade-arrow" />}
              {open === i && it.children && (
                <Submenu items={resolve(it.children, ctx)} ctx={ctx} onDone={onDone} />
              )}
            </div>
          ),
        )}
      </div>
    </div>
  )
}

function Submenu({ items, ctx, onDone }: { items: CascadeItem[]; ctx: ShellCtx; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<CSSProperties>({ left: '100%', top: -3, visibility: 'hidden' })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const next: CSSProperties = { left: '100%', top: -3 }
    if (r.right > window.innerWidth) { next.left = 'auto'; next.right = '100%' }
    if (r.bottom > window.innerHeight) next.top = -3 - (r.bottom - window.innerHeight) - 2
    setPos(next)
  }, [items.length])

  const shown = items.length ? items : [{ label: '(Empty)', disabled: true }]
  return (
    <div ref={ref} className="cascade-sub" style={pos}>
      <CascadeMenu items={shown} ctx={ctx} onDone={onDone} />
    </div>
  )
}

/** A cascade menu shown at a screen position (right-click menus). */
export function CascadePopup({ x, y, items, ctx, onClose }: { x: number; y: number; items: CascadeItem[]; ctx: ShellCtx; onClose: () => void }) {
  const ref = useClickOutside<HTMLDivElement>(true, onClose)
  const [pos, setPos] = useState({ left: x, top: y })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos({ left: Math.min(x, window.innerWidth - r.width - 2), top: Math.min(y, window.innerHeight - r.height - 2) })
  }, [x, y, ref])
  return (
    <div ref={ref} className="cascade-popup" style={{ position: 'fixed', ...pos, zIndex: 100000 }}>
      <CascadeMenu items={items} ctx={ctx} onDone={onClose} />
    </div>
  )
}
