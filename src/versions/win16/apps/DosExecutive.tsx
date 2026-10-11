import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { baseName, extOf, joinPath, MenuBar, parentOf, useFS, useOS, type AppProps, type FsNode, type Menu } from '../../../core'
import { useWin16 } from '../context'
import { ConfirmDialog, PromptDialog } from '../Dialog'
import { displaySize, dosDate, dosName, dosTime, PROGRAM_EXTS, resolvePath, runProgram, splitName, toDos } from '../dos'

type SortKey = 'name' | 'date' | 'size' | 'kind'
type Dialog =
  | { kind: 'run' | 'load' | 'copy' | 'rename' | 'mkdir' | 'chdir' }
  | { kind: 'delete' | 'info' | 'format' }

const DRIVES = ['A', 'B', 'C']

/**
 * MS-DOS Executive — the Windows 1.0 / 2.0 shell. Drive icons, the current directory path
 * (click a segment to go up) and the directory listing; double-click to run or open.
 */
export function DosExecutive({ winId }: AppProps) {
  const os = useOS()
  const fs = useFS()
  const { requestExit } = useWin16()
  const [cwd, setCwd] = useState('C:/WINDOWS')
  const [sel, setSel] = useState<string | null>(null)
  const [long, setLong] = useState(false)
  const [programsOnly, setProgramsOnly] = useState(false)
  const [sort, setSort] = useState<SortKey>('name')
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const dir = fs.isDir(cwd) ? cwd : 'C:'
  const cmp: Record<SortKey, (a: FsNode, b: FsNode) => number> = {
    name: (a, b) => a.name.localeCompare(b.name),
    date: (a, b) => b.modified - a.modified,
    size: (a, b) => displaySize(b) - displaySize(a),
    kind: (a, b) => extOf(a.name).localeCompare(extOf(b.name)) || a.name.localeCompare(b.name),
  }
  // useFS re-renders on every file system change, so the listing is simply derived.
  const entries = fs.list(dir).filter(n => !programsOnly || n.type === 'dir' || PROGRAM_EXTS.has(extOf(n.name)))
    .sort((a, b) => (a.type === b.type ? cmp[sort](a, b) : a.type === 'dir' ? -1 : 1))
  const selected = entries.find(e => e.path === sel) ?? null

  useEffect(() => { listRef.current?.focus() }, [dir])

  const chdir = (path: string) => { setCwd(path); setSel(null) }
  const open = (node: FsNode) => {
    if (node.type === 'dir') chdir(node.path)
    else runProgram(os, node.path, dir)
  }

  const needSel = !selected
  const menus: Menu[] = [
    {
      label: 'File',
      items: [
        { label: 'Run...', onClick: () => setDialog({ kind: 'run' }) },
        { label: 'Load...', onClick: () => setDialog({ kind: 'load' }) },
        { label: 'Copy...', disabled: needSel || selected?.type === 'dir', onClick: () => setDialog({ kind: 'copy' }) },
        { label: 'Get Info...', disabled: needSel, onClick: () => setDialog({ kind: 'info' }) },
        { label: 'Delete...', disabled: needSel, onClick: () => setDialog({ kind: 'delete' }) },
        { label: 'Print...', disabled: needSel, onClick: () => os.alert('Spooler', 'Cannot print: no printer is connected to LPT1:.', 'warning') },
        { label: 'Rename...', disabled: needSel, onClick: () => setDialog({ kind: 'rename' }) },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Short', checked: !long, onClick: () => setLong(false) },
        { label: 'Long', checked: long, onClick: () => setLong(true) },
        { separator: true },
        { label: 'All', checked: !programsOnly, onClick: () => setProgramsOnly(false) },
        { label: 'Programs', checked: programsOnly, onClick: () => setProgramsOnly(true) },
        { separator: true },
        { label: 'By Name', checked: sort === 'name', onClick: () => setSort('name') },
        { label: 'By Date', checked: sort === 'date', onClick: () => setSort('date') },
        { label: 'By Size', checked: sort === 'size', onClick: () => setSort('size') },
        { label: 'By Kind', checked: sort === 'kind', onClick: () => setSort('kind') },
      ],
    },
    {
      label: 'Special',
      items: [
        { label: 'End Session...', onClick: requestExit },
        { separator: true },
        { label: 'Create Directory...', onClick: () => setDialog({ kind: 'mkdir' }) },
        { label: 'Change Directory...', onClick: () => setDialog({ kind: 'chdir' }) },
        { label: 'Format Data Disk...', onClick: () => setDialog({ kind: 'format' }) },
        { label: 'Make System Disk...', onClick: () => setDialog({ kind: 'format' }) },
      ],
    },
  ]

  const fail = (text: string) => { setDialog(null); os.alert('MS-DOS Executive', text, 'warning') }
  const resolveIn = (input: string) => resolvePath(fs, input, dir)

  const onKeyDown = (e: KeyboardEvent) => {
    if (dialog) return
    const i = entries.findIndex(n => n.path === sel)
    if (e.key === 'Enter' && selected) open(selected)
    else if (e.key === 'Backspace' && dir.includes('/')) chdir(parentOf(dir))
    else if (e.key === 'Delete' && selected) setDialog({ kind: 'delete' })
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') setSel(entries[Math.min(i + 1, entries.length - 1)]?.path ?? null)
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') setSel(entries[Math.max(i - 1, 0)]?.path ?? null)
    else return
    e.preventDefault()
  }

  const segments = dir.split('/')
  const selName = selected ? dosName(selected.name) : ''

  return (
    <div className="app app-w16-dosexec" onKeyDown={onKeyDown}>
      <MenuBar menus={menus} />
      <div className="dosexec-drives">
        {DRIVES.map(d => (
          <button
            key={d}
            className={`dosexec-drive${segments[0] === `${d}:` ? ' current' : ''}`}
            onClick={() => (fs.exists(`${d}:`) ? chdir(`${d}:`) : os.alert('MS-DOS Executive', `Cannot read from drive ${d}:`, 'warning'))}
          >
            <span className="dosexec-drive-img" aria-hidden />{d}
          </button>
        ))}
        <span className="dosexec-path">
          {segments.map((s, i) => (
            <span key={i} className="dosexec-seg" onClick={() => chdir(segments.slice(0, i + 1).join('/'))}>
              {i === 0 ? `${s}\\` : `${s}${i < segments.length - 1 ? '\\' : ''}`}
            </span>
          ))}
        </span>
      </div>
      <div
        ref={listRef}
        tabIndex={0}
        className={`dosexec-list ${long ? 'long' : 'short'}`}
        onPointerDown={e => e.target === e.currentTarget && setSel(null)}
      >
        {entries.length === 0 && <div className="dosexec-empty">No files found.</div>}
        {entries.map(n => {
          const [stem, ext] = splitName(dosName(n.name))
          return (
            <div
              key={n.path}
              className={`dosexec-item${n.type === 'dir' ? ' dir' : ''}${sel === n.path ? ' selected' : ''}`}
              onPointerDown={() => setSel(n.path)}
              onDoubleClick={() => open(n)}
            >
              {long ? (
                <>
                  <span className="c-name">{stem}</span>
                  <span className="c-ext">{ext}</span>
                  <span className="c-size">{n.type === 'dir' ? '<DIR>' : displaySize(n)}</span>
                  <span className="c-date">{dosDate(n.modified)}</span>
                  <span className="c-time">{dosTime(n.modified)}</span>
                </>
              ) : (
                dosName(n.name)
              )}
            </div>
          )
        })}
      </div>

      {(dialog?.kind === 'run' || dialog?.kind === 'load') && (
        <PromptDialog
          title={dialog.kind === 'run' ? 'Run' : 'Load'}
          label={dialog.kind === 'run' ? 'Run:' : 'Load:'}
          initial={selected && selected.type === 'file' ? selName : ''}
          onCancel={() => setDialog(null)}
          onOk={v => {
            setDialog(null)
            const id = runProgram(os, v, dir)
            if (id && dialog.kind === 'load') os.minimize(id)
            else if (dialog.kind === 'load') os.focus(winId)
          }}
        />
      )}
      {dialog?.kind === 'copy' && selected && (
        <PromptDialog title="Copy" label={<>Copy {selName} to:</>} onCancel={() => setDialog(null)} onOk={v => {
          const to = resolveIn(v)
          const content = fs.read(selected.path)
          if (!to || content === null) return fail('Cannot copy file.')
          const dest = fs.isDir(to) ? joinPath(to, selected.name) : to
          if (fs.exists(dest)) return fail(`${dosName(baseName(dest))} already exists.`)
          fs.write(dest, content)
          setDialog(null)
        }} />
      )}
      {dialog?.kind === 'rename' && selected && (
        <PromptDialog title="Rename" label={<>Rename {selName} to:</>} initial={selName} onCancel={() => setDialog(null)} onOk={v => {
          const name = v.trim()
          if (!name || /[\\/:*?"<>|]/.test(name)) return fail('Invalid filename.')
          try { fs.rename(selected.path, joinPath(dir, name.toUpperCase())) } catch (err) { return fail((err as Error).message) }
          setSel(joinPath(dir, name.toUpperCase()))
          setDialog(null)
        }} />
      )}
      {dialog?.kind === 'mkdir' && (
        <PromptDialog title="Create Directory" label="Create directory name:" onCancel={() => setDialog(null)} onOk={v => {
          const p = resolveIn(v)
          if (!p || !v.trim()) return fail('Invalid directory name.')
          if (fs.exists(p)) return fail('Directory already exists.')
          fs.mkdir(p)
          setDialog(null)
        }} />
      )}
      {dialog?.kind === 'chdir' && (
        <PromptDialog title="Change Directory" label="Change directory to:" initial={toDos(dir)} onCancel={() => setDialog(null)} onOk={v => {
          const p = resolveIn(v)
          if (!p || !fs.isDir(p)) return fail('Invalid directory.')
          chdir(p)
          setDialog(null)
        }} />
      )}
      {dialog?.kind === 'delete' && selected && (
        <ConfirmDialog title="Delete" text={<>Delete {selName}{selected.type === 'dir' ? ' and all of its files' : ''}?</>} onCancel={() => setDialog(null)} onOk={() => {
          fs.remove(selected.path)
          setSel(null)
          setDialog(null)
        }} />
      )}
      {dialog?.kind === 'info' && selected && (
        <ConfirmDialog okOnly title="Get Info" onOk={() => setDialog(null)} onCancel={() => setDialog(null)} text={
          <pre className="dosexec-info">{[
            `Name:  ${toDos(selected.path)}`,
            `Size:  ${selected.type === 'dir' ? '<DIR>' : `${displaySize(selected)} bytes`}`,
            `Date:  ${dosDate(selected.modified)}  ${dosTime(selected.modified)}`,
          ].join('\n')}</pre>
        } />
      )}
      {dialog?.kind === 'format' && (
        <ConfirmDialog title="Format" text="Insert new diskette in drive A:" onCancel={() => setDialog(null)}
          onOk={() => fail('Cannot format disk: drive A: not ready.')} />
      )}
    </div>
  )
}
