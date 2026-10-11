import { useOS } from '../os'
import type { AppProps } from '../types'
import { argStr } from './util'

export type MsgBoxIcon = 'info' | 'warning' | 'error' | 'question'
const ICONS: MsgBoxIcon[] = ['info', 'warning', 'error', 'question']

/** Icons drawn as inline SVG; versions can restyle `.msgbox-icon.<kind>` or hide the svg and use a background. */
function MsgBoxIconSvg({ kind }: { kind: MsgBoxIcon }) {
  switch (kind) {
    case 'warning':
      return (
        <svg viewBox="0 0 32 32" aria-hidden>
          <path d="M16 2 L31 29 H1 Z" fill="#ffd400" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="14.5" y="10" width="3" height="11" fill="#000" />
          <rect x="14.5" y="23" width="3" height="3" fill="#000" />
        </svg>
      )
    case 'error':
      return (
        <svg viewBox="0 0 32 32" aria-hidden>
          <circle cx="16" cy="16" r="14.5" fill="#e0201b" stroke="#7a0000" strokeWidth="1.5" />
          <path d="M10 10 L22 22 M22 10 L10 22" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      )
    case 'question':
      return (
        <svg viewBox="0 0 32 32" aria-hidden>
          <circle cx="16" cy="16" r="14.5" fill="#fff" stroke="#1d4fb5" strokeWidth="2" />
          <text x="16" y="23" textAnchor="middle" fontSize="20" fontWeight="bold" fontFamily="Arial, sans-serif" fill="#1d4fb5">?</text>
        </svg>
      )
    case 'info':
      return (
        <svg viewBox="0 0 32 32" aria-hidden>
          <circle cx="16" cy="16" r="14.5" fill="#fff" stroke="#1d4fb5" strokeWidth="2" />
          <rect x="14" y="13" width="4" height="12" fill="#1d4fb5" />
          <circle cx="16" cy="8.5" r="2.4" fill="#1d4fb5" />
        </svg>
      )
  }
}

/**
 * Shared message box.
 * args: { title, text, icon?: 'info'|'warning'|'error'|'question', buttons?: string[], onButton?: (label) => void }
 */
export default function MsgBox({ winId, args }: AppProps) {
  const os = useOS()
  const text = argStr(args, 'text', '')
  const icon = ICONS.find(i => i === args.icon)
  const buttons = Array.isArray(args.buttons) && args.buttons.length
    ? args.buttons.filter((b): b is string => typeof b === 'string')
    : ['OK']
  const onButton = typeof args.onButton === 'function' ? (args.onButton as (label: string) => void) : undefined

  const press = (label: string) => {
    os.close(winId)
    onButton?.(label)
  }

  return (
    <div
      className="app app-msgbox"
      onKeyDown={e => { if (e.key === 'Escape') press(buttons.includes('Cancel') ? 'Cancel' : buttons[buttons.length - 1]) }}
    >
      <div className="msgbox-body">
        {icon && <div className={`msgbox-icon ${icon}`}><MsgBoxIconSvg kind={icon} /></div>}
        <div className="msgbox-text">{text}</div>
      </div>
      <div className="msgbox-buttons">
        {buttons.map((b, i) => (
          <button key={b} type="button" className="btn" autoFocus={i === 0} onClick={() => press(b)}>{b}</button>
        ))}
      </div>
    </div>
  )
}
