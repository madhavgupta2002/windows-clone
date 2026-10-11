import { useId, useState } from 'react'
import { baseName, extOf, joinPath } from '../fs'
import { useFS } from '../os'

/** Resolve a typed file name against `dir`, adding `.ext` when the name has no extension. */
export function resolveFileName(dir: string, name: string, ext: string) {
  const trimmed = name.trim()
  const withExt = extOf(trimmed) ? trimmed : `${trimmed}.${ext}`
  return withExt.includes('/') ? withExt : joinPath(dir, withExt)
}

/**
 * In-app "Open" picker listing files with one of `exts` in `dir`.
 * Markup: .file-panel > .file-panel-title + .listview.sunken (.listview-item) + .file-panel-actions
 */
export function OpenPanel({ dir, exts, onOpen, onCancel }: {
  dir: string
  exts: string[]
  onOpen: (path: string) => void
  onCancel: () => void
}) {
  const fs = useFS()
  const files = fs.isDir(dir) ? fs.list(dir).filter(n => n.type === 'file' && exts.includes(extOf(n.path))) : []
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div className="file-panel" onKeyDown={e => e.key === 'Escape' && onCancel()}>
      <div className="file-panel-title">Open — {dir}</div>
      <div className="listview sunken file-panel-list" tabIndex={0}>
        {files.length === 0 && <div className="file-panel-empty">No {exts.map(e => `.${e}`).join(', ')} files here.</div>}
        {files.map(f => (
          <div
            key={f.path}
            className={`listview-item${selected === f.path ? ' selected' : ''}`}
            onClick={() => setSelected(f.path)}
            onDoubleClick={() => onOpen(f.path)}
          >
            📄 {f.name}
          </div>
        ))}
      </div>
      <div className="file-panel-actions">
        <button type="button" className="btn" disabled={!selected} onClick={() => selected && onOpen(selected)}>Open</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

/**
 * Inline "Save As" bar (no window.prompt).
 * Markup: form.save-bar > label + input.field + .btn ×2
 */
export function SaveBar({ dir, defaultName, ext, onSave, onCancel }: {
  dir: string
  defaultName: string
  ext: string
  onSave: (path: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(defaultName)
  const inputId = useId()
  return (
    <form
      className="save-bar toolbar"
      onSubmit={e => { e.preventDefault(); if (name.trim()) onSave(resolveFileName(dir, name, ext)) }}
      onKeyDown={e => e.key === 'Escape' && onCancel()}
    >
      <label htmlFor={inputId}>Save as:</label>
      <input
        id={inputId}
        className="field"
        value={name}
        autoFocus
        onFocus={e => e.currentTarget.select()}
        onChange={e => setName(e.target.value)}
        title={`Saved in ${dir} unless you type a full path`}
      />
      <button type="submit" className="btn" disabled={!name.trim()}>Save</button>
      <button type="button" className="btn" onClick={onCancel}>Cancel</button>
    </form>
  )
}

export const displayName = (path: string | null, fallback = 'Untitled') => (path ? baseName(path) : fallback)
