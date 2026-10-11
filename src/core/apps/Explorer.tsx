import { useEffect, useState, type MouseEvent } from 'react'
import { Icon } from '../Icon'
import { ContextMenu, MenuBar, type MenuItem } from '../MenuBar'
import { baseName, extOf, joinPath, parentOf, type FsNode } from '../fs'
import { useFS, useOS } from '../os'
import type { AppProps } from '../types'
import { argStr, useAppTitle, useAsk, useIsActive, useKeyDown, useWindowTitle } from './util'

/** The virtual "computer" location listing all drives. */
const COMPUTER = ''

type View = 'icons' | 'details'

/** "C:/My Documents" → "C:\My Documents", "C:" → "C:\" */
const toDosPath = (p: string) => (p.includes('/') ? p.replace(/\//g, '\\') : `${p}\\`)
/** Accepts either slash style and trailing separators. */
const fromTyped = (s: string) => s.trim().replace(/\\/g, '/').replace(/\/+$/, '')

const EXT_ICONS: Record<string, string> = { txt: '📄', ini: '⚙️', log: '📄', md: '📄', bat: '⚙️', bmp: '🖼️', exe: '🔷' }
const EXT_TYPES: Record<string, string> = { txt: 'Text Document', ini: 'Configuration Settings', log: 'Text Document', md: 'Markdown File', bat: 'MS-DOS Batch File', bmp: 'Bitmap Image', exe: 'Application' }

const formatSize = (n: number) => (n < 1024 ? `${n} byte${n === 1 ? '' : 's'}` : `${Math.ceil(n / 1024)} KB`)

/**
 * args:
 *  path?: string            folder to open (defaults to os.documentsPath; "" = all drives)
 *  tree?: boolean           show the folder tree (default true)
 *  view?: 'icons'|'details' initial view
 *  folderIcon?, fileIcon?, driveIcon?: string   icon overrides (emoji / URL)
 *  computerLabel?: string   label of the drive list, default "My Computer"
 */
export default function Explorer({ winId, args }: AppProps) {
  const os = useOS()
  const fs = useFS()
  const ask = useAsk()
  const appTitle = useAppTitle('explorer', 'Explorer')

  const folderIcon = argStr(args, 'folderIcon', '📁')
  const driveIcon = argStr(args, 'driveIcon', '💽')
  const fileIconArg = argStr(args, 'fileIcon')
  const computerLabel = argStr(args, 'computerLabel', 'My Computer')
  const showTree = args.tree !== false

  const [path, setPath] = useState(() => argStr(args, 'path', os.documentsPath))
  const [back, setBack] = useState<string[]>([])
  const [forward, setForward] = useState<string[]>([])
  const [address, setAddress] = useState(path)
  const [view, setView] = useState<View>(args.view === 'details' ? 'details' : 'icons')
  const [selected, setSelected] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<{ path: string; value: string } | null>(null)
  const [menu, setMenu] = useState<{ x: number; y: number; target: string | null } | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(ancestors(path)))

  const label = (p: string) => (p === COMPUTER ? computerLabel : p.includes('/') ? baseName(p) : `(${p})`)
  const fixedTitle = argStr(args, 'title')
  useWindowTitle(winId, fixedTitle ?? `${label(path)} - ${appTitle}`)

  // If the current folder disappears (deleted elsewhere), fall back to its nearest existing ancestor.
  useEffect(() => {
    if (path === COMPUTER || fs.isDir(path)) return
    let p = path
    while (p.includes('/') && !fs.isDir(p)) p = parentOf(p)
    setPath(fs.isDir(p) ? p : COMPUTER)
  })

  useEffect(() => { setAddress(path === COMPUTER ? computerLabel : toDosPath(path)) }, [path, computerLabel])

  const items: FsNode[] = path === COMPUTER
    ? fs.roots().map(r => ({ name: r, path: r, type: 'dir', modified: 0, size: 0 }))
    : fs.isDir(path) ? fs.list(path) : []

  const iconFor = (n: FsNode) => {
    if (n.type === 'dir') return n.path.includes('/') ? folderIcon : driveIcon
    return fileIconArg ?? EXT_ICONS[extOf(n.path)] ?? '📄'
  }
  const typeOf = (n: FsNode) => {
    if (n.type === 'dir') return n.path.includes('/') ? 'File Folder' : 'Local Disk'
    const ext = extOf(n.path)
    return EXT_TYPES[ext] ?? (ext ? `${ext.toUpperCase()} File` : 'File')
  }

  const navigate = (to: string, record = true) => {
    if (to === path) return
    if (record) { setBack(b => [...b, path]); setForward([]) }
    setPath(to)
    setSelected(null)
    setRenaming(null)
    setExpanded(e => new Set([...e, ...ancestors(to)]))
  }
  const goBack = () => {
    const prev = back[back.length - 1]
    if (prev === undefined) return
    setBack(back.slice(0, -1))
    setForward(f => [path, ...f])
    navigate(prev, false)
  }
  const goForward = () => {
    const [next, ...rest] = forward
    if (next === undefined) return
    setForward(rest)
    setBack(b => [...b, path])
    navigate(next, false)
  }
  const goUp = () => navigate(path.includes('/') ? parentOf(path) : COMPUTER)

  const openItem = (p: string) => {
    if (p === COMPUTER || fs.isDir(p)) navigate(p)
    else os.openPath(p)
  }

  const submitAddress = () => {
    const typed = fromTyped(address)
    if (typed === '' || typed.toLowerCase() === computerLabel.toLowerCase()) { navigate(COMPUTER); return }
    const match = fs.exists(typed) ? typed : findCaseInsensitive(typed)
    if (match && fs.isDir(match)) navigate(match)
    else if (match) os.openPath(match)
    else os.alert(appTitle, `Cannot find '${address}'. Make sure the path is correct.`, 'error')
  }
  const findCaseInsensitive = (p: string) => {
    const lower = p.toLowerCase()
    // Small FS: walking from the roots is cheap enough.
    const walk = (dir: string): string | null => {
      if (dir.toLowerCase() === lower) return dir
      if (!lower.startsWith(dir.toLowerCase() + '/')) return null
      for (const n of fs.list(dir)) {
        const hit = n.type === 'dir' ? walk(n.path) : n.path.toLowerCase() === lower ? n.path : null
        if (hit) return hit
      }
      return null
    }
    for (const r of fs.roots()) {
      const hit = walk(r)
      if (hit) return hit
    }
    return null
  }

  const createNew = (kind: 'folder' | 'text') => {
    if (path === COMPUTER) return
    const name = fs.uniqueName(path, kind === 'folder' ? 'New Folder' : 'New Text Document.txt')
    const p = joinPath(path, name)
    if (kind === 'folder') fs.mkdir(p)
    else fs.write(p, '')
    setSelected(p)
    setRenaming({ path: p, value: name })
  }

  const commitRename = () => {
    if (!renaming) return
    const { path: from, value } = renaming
    setRenaming(null)
    const name = value.trim()
    if (!name || name === baseName(from)) return
    if (/[\\/:*?"<>|]/.test(name)) { os.alert('Rename', 'A file name cannot contain any of the following characters:\n\\ / : * ? " < > |', 'error'); return }
    const to = joinPath(parentOf(from), name)
    try {
      fs.rename(from, to)
      setSelected(to)
    } catch (err) {
      os.alert('Error Renaming File', err instanceof Error ? err.message : String(err), 'error')
    }
  }

  const remove = (p: string) => {
    const what = fs.isDir(p) ? `the folder '${baseName(p)}' and all its contents` : `'${baseName(p)}'`
    ask('Confirm Delete', `Are you sure you want to delete ${what}?`, ['Yes', 'No'], label => {
      if (label !== 'Yes') return
      fs.remove(p)
      setSelected(s => (s === p ? null : s))
    })
  }

  const canModify = (p: string | null): p is string => !!p && p.includes('/')

  useKeyDown(useIsActive(winId), e => {
    if (e.key === 'Delete' && canModify(selected)) remove(selected)
    else if (e.key === 'F2' && canModify(selected)) setRenaming({ path: selected, value: baseName(selected) })
    else if (e.key === 'Enter' && selected) openItem(selected)
    else if (e.key === 'Backspace') { e.preventDefault(); goUp() }
    else return
    e.preventDefault()
  })

  const openMenu = (e: MouseEvent, target: string | null) => {
    e.preventDefault()
    e.stopPropagation()
    setSelected(target)
    setMenu({ x: e.clientX, y: e.clientY, target })
  }

  const menuItems = (target: string | null): MenuItem[] => {
    const inComputer = path === COMPUTER
    return [
      ...(target ? [{ label: 'Open', onClick: () => openItem(target) }, { separator: true }] : []),
      { label: 'New Folder', disabled: inComputer, onClick: () => createNew('folder') },
      { label: 'New Text Document', disabled: inComputer, onClick: () => createNew('text') },
      { separator: true },
      { label: 'Rename', disabled: !canModify(target), onClick: () => target && setRenaming({ path: target, value: baseName(target) }) },
      { label: 'Delete', disabled: !canModify(target), onClick: () => target && remove(target) },
      { separator: true },
      { label: 'Refresh', onClick: () => setSelected(null) },
    ]
  }

  const selectedNode = items.find(n => n.path === selected)
  const status = selectedNode
    ? `${typeOf(selectedNode)}${selectedNode.type === 'file' ? ` · ${formatSize(selectedNode.size)}` : ''}`
    : `${items.length} object(s)`

  const renderName = (n: FsNode) =>
    renaming?.path === n.path ? (
      <input
        className="field explorer-rename"
        value={renaming.value}
        autoFocus
        onFocus={e => {
          const dot = renaming.value.lastIndexOf('.')
          e.currentTarget.setSelectionRange(0, n.type === 'file' && dot > 0 ? dot : renaming.value.length)
        }}
        onChange={e => setRenaming({ path: n.path, value: e.target.value })}
        onBlur={commitRename}
        onKeyDown={e => {
          e.stopPropagation()
          if (e.key === 'Enter') commitRename()
          if (e.key === 'Escape') setRenaming(null)
        }}
        onClick={e => e.stopPropagation()}
        onDoubleClick={e => e.stopPropagation()}
      />
    ) : (
      <span className="explorer-name">{n.path.includes('/') ? n.name : `${label(n.path)}`}</span>
    )

  return (
    <div className="app app-explorer">
      <MenuBar menus={[
        { label: 'File', items: [
          { label: 'Open', disabled: !selected, onClick: () => selected && openItem(selected) },
          { separator: true },
          { label: 'New Folder', disabled: path === COMPUTER, onClick: () => createNew('folder') },
          { label: 'New Text Document', disabled: path === COMPUTER, onClick: () => createNew('text') },
          { separator: true },
          { label: 'Rename', shortcut: 'F2', disabled: !canModify(selected), onClick: () => selected && setRenaming({ path: selected, value: baseName(selected) }) },
          { label: 'Delete', shortcut: 'Del', disabled: !canModify(selected), onClick: () => selected && remove(selected) },
          { separator: true },
          { label: 'Close', onClick: () => os.close(winId) },
        ] },
        { label: 'View', items: [
          { label: 'Large Icons', checked: view === 'icons', onClick: () => setView('icons') },
          { label: 'Details', checked: view === 'details', onClick: () => setView('details') },
          { separator: true },
          { label: 'Refresh', onClick: () => setSelected(null) },
        ] },
        { label: 'Go', items: [
          { label: 'Back', disabled: !back.length, onClick: goBack },
          { label: 'Forward', disabled: !forward.length, onClick: goForward },
          { label: 'Up One Level', disabled: path === COMPUTER, onClick: goUp },
          { separator: true },
          { label: computerLabel, onClick: () => navigate(COMPUTER) },
          { label: baseName(os.documentsPath), onClick: () => navigate(os.documentsPath) },
        ] },
      ]} />

      <div className="toolbar explorer-toolbar">
        <button type="button" className="btn" title="Back" disabled={!back.length} onClick={goBack}>◀</button>
        <button type="button" className="btn" title="Forward" disabled={!forward.length} onClick={goForward}>▶</button>
        <button type="button" className="btn" title="Up" disabled={path === COMPUTER} onClick={goUp}>⇧</button>
        <form className="explorer-address" onSubmit={e => { e.preventDefault(); submitAddress() }}>
          <label>Address</label>
          <input className="field" value={address} onChange={e => setAddress(e.target.value)} onFocus={e => e.currentTarget.select()} />
        </form>
        <button type="button" className="btn" title="Toggle view" onClick={() => setView(view === 'icons' ? 'details' : 'icons')}>
          {view === 'icons' ? '☷' : '▦'}
        </button>
      </div>

      <div className="explorer-body">
        {showTree && (
          <div className="explorer-tree sunken">
            <TreeNode
              path={COMPUTER}
              label={computerLabel}
              icon={argStr(args, 'computerIcon', '🖥️')}
              current={path}
              expanded={expanded}
              childrenOf={p => (p === COMPUTER ? fs.roots() : fs.list(p).filter(n => n.type === 'dir').map(n => n.path))}
              labelOf={label}
              iconOf={p => (p.includes('/') ? folderIcon : driveIcon)}
              onToggle={p => setExpanded(e => { const n = new Set(e); if (n.has(p)) n.delete(p); else n.add(p); return n })}
              onSelect={navigate}
            />
          </div>
        )}
        <div
          className={`explorer-list sunken listview ${view}`}
          onClick={() => setSelected(null)}
          onContextMenu={e => openMenu(e, null)}
          tabIndex={0}
        >
          {view === 'details' && (
            <div className="explorer-header">
              <span>Name</span><span>Size</span><span>Type</span><span>Modified</span>
            </div>
          )}
          {items.map(n => (
            <div
              key={n.path}
              className={`explorer-item listview-item${selected === n.path ? ' selected' : ''}`}
              onClick={e => { e.stopPropagation(); setSelected(n.path) }}
              onDoubleClick={() => openItem(n.path)}
              onContextMenu={e => openMenu(e, n.path)}
              title={n.name}
            >
              <span className="explorer-icon"><Icon src={iconFor(n)} size={view === 'icons' ? 32 : 16} /></span>
              {renderName(n)}
              {view === 'details' && (
                <>
                  <span className="explorer-size">{n.type === 'file' ? formatSize(n.size) : ''}</span>
                  <span className="explorer-type">{typeOf(n)}</span>
                  <span className="explorer-modified">{n.modified ? new Date(n.modified).toLocaleString() : ''}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="statusbar">
        <span>{status}</span>
        <span>{path === COMPUTER ? computerLabel : toDosPath(path)}</span>
      </div>

      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems(menu.target)} onClose={() => setMenu(null)} />}
    </div>
  )
}

/** Every ancestor of `p` including the computer root, e.g. "C:/a/b" → ["", "C:", "C:/a"]. */
function ancestors(p: string): string[] {
  const out = [COMPUTER]
  if (p === COMPUTER) return out
  const parts = p.split('/')
  for (let i = 1; i < parts.length; i++) out.push(parts.slice(0, i).join('/'))
  return out
}

interface TreeNodeProps {
  path: string
  label: string
  icon: string
  current: string
  expanded: Set<string>
  childrenOf: (p: string) => string[]
  labelOf: (p: string) => string
  iconOf: (p: string) => string
  onToggle: (p: string) => void
  onSelect: (p: string) => void
}

function TreeNode(props: TreeNodeProps) {
  const { path, label, icon, current, expanded, childrenOf, onToggle, onSelect } = props
  const kids = childrenOf(path)
  const open = expanded.has(path)
  return (
    <div className="tree-node">
      <div className={`tree-row${current === path ? ' selected' : ''}`} onClick={() => onSelect(path)}>
        <span
          className="tree-toggle"
          onClick={e => { e.stopPropagation(); if (kids.length) onToggle(path) }}
        >
          {kids.length ? (open ? '−' : '+') : ''}
        </span>
        <Icon src={icon} size={16} />
        <span className="tree-label">{label}</span>
      </div>
      {open && kids.length > 0 && (
        <div className="tree-children">
          {kids.map(k => <TreeNode key={k} {...props} path={k} label={props.labelOf(k)} icon={props.iconOf(k)} />)}
        </div>
      )}
    </div>
  )
}
