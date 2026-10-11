import { useEffect, useRef, useState } from 'react'
import { parentOf } from '../fs'
import { usePref } from '../hooks'
import { MenuBar } from '../MenuBar'
import { useFS, useOS } from '../os'
import type { AppProps } from '../types'
import { displayName, OpenPanel, SaveBar } from './FilePanels'
import { argStr, useAppTitle, useAsk, useIsActive, useKeyDown, useWindowTitle } from './util'

const TEXT_EXTS = ['txt', 'ini', 'log', 'md', 'bat']

type Panel = { kind: 'none' } | { kind: 'open' } | { kind: 'save'; then?: () => void }

/** args: { path?: string } — the file to open. */
export default function Notepad({ winId, args }: AppProps) {
  const os = useOS()
  const fs = useFS()
  const ask = useAsk()
  const appTitle = useAppTitle('notepad', 'Notepad')

  const [path, setPath] = useState<string | null>(() => argStr(args, 'path') ?? null)
  const [text, setText] = useState(() => (path && fs.read(path)) || '')
  const [savedText, setSavedText] = useState(text)
  const [wrap, setWrap] = usePref(`${os.versionId}.notepad.wrap`, true)
  const [panel, setPanel] = useState<Panel>({ kind: 'none' })
  const editor = useRef<HTMLTextAreaElement>(null)

  // Return focus to the editor when an inline panel closes.
  useEffect(() => { if (panel.kind === 'none') editor.current?.focus() }, [panel.kind])

  const dirty = text !== savedText
  const name = displayName(path)
  useWindowTitle(winId, `${dirty ? '*' : ''}${name} - ${appTitle}`)

  // Message-box callbacks fire later; read the latest state through a ref.
  const latest = useRef({ text, path })
  latest.current = { text, path }

  const load = (p: string | null) => {
    const content = (p && fs.read(p)) || ''
    setPath(p)
    setText(content)
    setSavedText(content)
    setPanel({ kind: 'none' })
  }

  const writeTo = (p: string) => {
    fs.write(p, latest.current.text)
    setPath(p)
    setSavedText(latest.current.text)
  }

  /** Save to the current path, or ask for one first. `then` runs after a successful save. */
  const save = (then?: () => void) => {
    const p = latest.current.path
    if (p) { writeTo(p); then?.() } else setPanel({ kind: 'save', then })
  }

  /** Run `next` once unsaved changes are saved or discarded. */
  const guard = (next: () => void) => {
    if (!dirty) { next(); return }
    ask(appTitle, `Do you want to save changes to ${name}?`, ['Yes', 'No', 'Cancel'], label => {
      if (label === 'Yes') save(next)
      else if (label === 'No') next()
    }, 'warning')
  }

  const insertTimeDate = () => {
    const el = editor.current
    const stamp = new Date().toLocaleString()
    const start = el?.selectionStart ?? text.length
    const end = el?.selectionEnd ?? text.length
    setText(text.slice(0, start) + stamp + text.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + stamp.length, start + stamp.length)
    })
  }

  const selectAll = () => { editor.current?.focus(); editor.current?.select() }

  useKeyDown(useIsActive(winId), e => {
    const ctrl = e.ctrlKey || e.metaKey
    if (ctrl && e.key.toLowerCase() === 's') { e.preventDefault(); save() }
    else if (ctrl && e.key.toLowerCase() === 'o') { e.preventDefault(); guard(() => setPanel({ kind: 'open' })) }
    else if (e.key === 'F5') { e.preventDefault(); insertTimeDate() }
  }, true)

  return (
    <div className="app app-notepad">
      <MenuBar menus={[
        { label: 'File', items: [
          { label: 'New', shortcut: 'Ctrl+N', onClick: () => guard(() => load(null)) },
          { label: 'Open...', shortcut: 'Ctrl+O', onClick: () => guard(() => setPanel({ kind: 'open' })) },
          { label: 'Save', shortcut: 'Ctrl+S', onClick: () => save() },
          { label: 'Save As...', onClick: () => setPanel({ kind: 'save' }) },
          { separator: true },
          { label: 'Exit', onClick: () => guard(() => os.close(winId)) },
        ] },
        { label: 'Edit', items: [
          { label: 'Select All', shortcut: 'Ctrl+A', onClick: selectAll },
          { label: 'Time/Date', shortcut: 'F5', onClick: insertTimeDate },
        ] },
        { label: 'Format', items: [
          { label: 'Word Wrap', checked: wrap, onClick: () => setWrap(!wrap) },
        ] },
      ]} />
      {panel.kind === 'save' && (
        <SaveBar
          dir={path ? parentOf(path) : os.documentsPath}
          defaultName={path ? name : 'Untitled.txt'}
          ext="txt"
          onSave={p => { writeTo(p); setPanel({ kind: 'none' }); panel.then?.() }}
          onCancel={() => setPanel({ kind: 'none' })}
        />
      )}
      {panel.kind === 'open' ? (
        <OpenPanel dir={os.documentsPath} exts={TEXT_EXTS} onOpen={load} onCancel={() => setPanel({ kind: 'none' })} />
      ) : (
        <textarea
          ref={editor}
          className={`field notepad-editor${wrap ? '' : ' nowrap'}`}
          value={text}
          wrap={wrap ? 'soft' : 'off'}
          spellCheck={false}
          autoFocus
          onChange={e => setText(e.target.value)}
        />
      )}
    </div>
  )
}
