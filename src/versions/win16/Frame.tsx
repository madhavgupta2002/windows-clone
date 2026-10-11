import { useState } from 'react'
import { MenuList, useClickOutside, useOS, type FrameProps, type MenuItem } from '../../core'
import { DIALOG_APPS, useWin16, W16, type Variant } from './context'

/** Minimize / maximize / restore glyphs: solid triangles in 3.1, stemmed arrows in 2.0. */
function Glyph({ kind, variant }: { kind: 'min' | 'max' | 'restore'; variant: Variant }) {
  if (variant === 'win3') {
    const down = <path d="M1 3h9L5.5 7.5z" />
    const up = <path d="M1 7.5h9L5.5 3z" />
    return (
      <svg viewBox="0 0 11 11" width="11" height="11" aria-hidden>
        {kind === 'min' && down}
        {kind === 'max' && up}
        {kind === 'restore' && <><path d="M1 5h9L5.5 1z" /><path d="M1 6h9L5.5 10z" /></>}
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 11 11" width="11" height="11" aria-hidden>
      {kind === 'min' && <path d="M4 1h3v4h3L5.5 10 1 5h3z" />}
      {kind === 'max' && <path d="M4 10h3V6h3L5.5 1 1 6h3z" />}
      {kind === 'restore' && <path d="M5.5 0 9 3.5H7v4h2L5.5 11 2 7.5h2v-4H2z" />}
    </svg>
  )
}

/** The control-menu box and its drop-down (Restore / Move / Size / Minimize / Maximize / Close). */
export function ControlMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false))
  return (
    <div className="w16-ctl" ref={ref} data-no-drag>
      <button
        className="w16-sysbox"
        aria-label="Control menu"
        onClick={() => setOpen(o => !o)}
        onDoubleClick={e => { e.stopPropagation(); setOpen(false); items.find(i => i.label === 'Close')?.onClick?.() }}
      >
        <span />
      </button>
      {open && <MenuList items={items} onDone={() => setOpen(false)} />}
    </div>
  )
}

/**
 * Shared 16-bit window frame. Look is driven by `.os-win1/2/3` CSS:
 *  1.0 — thin black frame, centred caption, control box only (windows are tiled);
 *  2.0 — sizing border, control box, ↓ ↑ boxes;
 *  3.1 — grey sizing border with corner notches, ▼ ▲ bevel buttons.
 * Closing the shell app (MS-DOS Executive / Program Manager) asks to end the session.
 */
export function Win16Frame({ win, active, dragHandle, onClose, onMinimize, onMaximize, children }: FrameProps) {
  const os = useOS()
  const { variant, shellApp, requestExit } = useWin16()
  const dialog = DIALOG_APPS.has(win.appId)
  const isShell = win.appId === shellApp
  const close = isShell ? requestExit : onClose
  const v1 = variant === 'win1'

  const items: MenuItem[] = [
    { label: 'Restore', disabled: !win.maximized, onClick: onMaximize },
    { label: 'Move', disabled: true },
    { label: 'Size', disabled: true },
    ...(dialog ? [] : [
      { label: v1 ? 'Icon' : 'Minimize', onClick: onMinimize },
      { label: v1 ? 'Zoom' : 'Maximize', disabled: win.maximized || !win.resizable, onClick: onMaximize },
    ]),
    { separator: true },
    { label: 'Close', shortcut: 'Alt+F4', onClick: close },
    ...(variant === 'win3' && os.apps[W16.tasklist] && !dialog
      ? [{ separator: true }, { label: 'Switch To...', shortcut: 'Ctrl+Esc', onClick: () => { os.open(W16.tasklist) } }]
      : []),
    ...(isShell ? [{ separator: true }, { label: 'About...', onClick: () => { os.open('about') } }] : []),
  ]

  const cls = ['w16-frame', active && 'active', dialog && 'dialog', win.resizable && !dialog && 'sizable', win.maximized && 'maximized']
  return (
    <div className={cls.filter(Boolean).join(' ')}>
      <div className="w16-inner">
        <div className="w16-titlebar" {...dragHandle}>
          <ControlMenu items={items} />
          <span className="w16-title">{win.title}</span>
          {!dialog && !v1 && (
            <button className="w16-btn w16-min" onClick={onMinimize} aria-label="Minimize">
              <Glyph kind="min" variant={variant} />
            </button>
          )}
          {!dialog && !v1 && win.resizable && (
            <button className="w16-btn w16-max" onClick={onMaximize} aria-label={win.maximized ? 'Restore' : 'Maximize'}>
              <Glyph kind={win.maximized ? 'restore' : 'max'} variant={variant} />
            </button>
          )}
        </div>
        <div className="w16-body">{children}</div>
      </div>
    </div>
  )
}
