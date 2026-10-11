import { useState, type ReactNode } from 'react'

/**
 * Modal box drawn inside an app window (MS-DOS Executive's Rename..., Program Manager's Run...).
 * 1.0 / 2.0 dialogs are plain double-bordered boxes; 3.1 adds a caption (via CSS).
 */
export function InlineDialog({ title, children, buttons, onSubmit }: {
  title: string
  children: ReactNode
  buttons: ReactNode
  onSubmit?: () => void
}) {
  return (
    <div className="w16-modal-backdrop" onPointerDown={e => e.stopPropagation()}>
      <form
        className="w16-modal"
        onSubmit={e => { e.preventDefault(); onSubmit?.() }}
        onKeyDown={e => e.stopPropagation()}
      >
        <div className="w16-modal-caption">{title}</div>
        <div className="w16-modal-body">{children}</div>
        <div className="w16-modal-buttons">{buttons}</div>
      </form>
    </div>
  )
}

export function PromptDialog({ title, label, initial = '', extra, onOk, onCancel }: {
  title: string
  label: ReactNode
  initial?: string
  extra?: ReactNode
  onOk: (value: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(initial)
  return (
    <InlineDialog
      title={title}
      onSubmit={() => onOk(value)}
      buttons={<>
        <button type="submit" className="btn default">OK</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </>}
    >
      <label className="w16-prompt">
        <span>{label}</span>
        <input className="field" autoFocus value={value} onChange={e => setValue(e.target.value)} onFocus={e => e.target.select()}
          onKeyDown={e => e.key === 'Escape' && onCancel()} />
      </label>
      {extra}
    </InlineDialog>
  )
}

export function ConfirmDialog({ title, text, okOnly, onOk, onCancel }: {
  title: string
  text: ReactNode
  okOnly?: boolean
  onOk: () => void
  onCancel: () => void
}) {
  return (
    <InlineDialog
      title={title}
      onSubmit={onOk}
      buttons={<>
        <button type="submit" className="btn default" autoFocus>OK</button>
        {!okOnly && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
      </>}
    >
      <div className="w16-confirm-text">{text}</div>
    </InlineDialog>
  )
}
