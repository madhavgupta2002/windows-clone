import { useEffect, useRef, useState } from 'react'
import { baseName, extOf, joinPath, parentOf, useFS, useOS, type AppProps, type FileSystem } from '../../../core'
import { useWin16, type Variant } from '../context'
import { displaySize, dosDate, dosName, dosTime, findProgram, PROGRAM_EXTS, resolvePath, runProgram, splitName, toDos } from '../dos'

const DOS_VERSION: Record<Variant, string> = { win1: '3.10', win2: '3.30', win3: '5.00' }

const HELP = [
  'CD       Displays or changes the current directory.',
  'CLS      Clears the screen.',
  'COPY     Copies a file to another location.',
  'DATE     Displays the date.',
  'DEL      Deletes a file.',
  'DIR      Displays a list of files and subdirectories in a directory.',
  'ECHO     Displays messages.',
  'EXIT     Quits the MS-DOS Prompt.',
  'MD       Creates a directory.',
  'MEM      Displays the amount of used and free memory.',
  'REN      Renames a file.',
  'RD       Removes a directory.',
  'TIME     Displays the time.',
  'TYPE     Displays the contents of a text file.',
  'VER      Displays the MS-DOS version.',
]

const pad = (s: string, n: number) => s.padEnd(n).slice(0, n)
const num = (n: number) => n.toLocaleString('en-US').padStart(11)

function dir(fs: FileSystem, path: string): string[] {
  const nodes = fs.list(path)
  const files = nodes.filter(n => n.type === 'file')
  const bytes = files.reduce((t, n) => t + displaySize(n), 0)
  const lines = [' Volume in drive C is MS-DOS', ` Directory of ${toDos(path)}`, '']
  if (path.includes('/')) lines.push('.            <DIR>', '..           <DIR>')
  for (const n of nodes) {
    const [stem, ext] = splitName(dosName(n.name))
    const size = n.type === 'dir' ? '<DIR>      ' : num(displaySize(n))
    lines.push(`${pad(stem, 8)} ${pad(ext, 3)} ${size} ${dosDate(n.modified)}  ${dosTime(n.modified)}`)
  }
  lines.push(`${String(files.length).padStart(9)} file(s) ${num(bytes)} bytes`, `${' '.repeat(18)}${num(18_432_000)} bytes free`, '')
  return lines
}

/** A windowed COMMAND.COM: DIR, CD, TYPE, COPY, DEL, REN, MD, RD, MEM, VER... and runs programs. */
export function DosPrompt({ winId }: AppProps) {
  const os = useOS()
  const fs = useFS()
  const { variant } = useWin16()
  const [cwd, setCwd] = useState('C:/WINDOWS')
  const [lines, setLines] = useState<string[]>(() => [
    '',
    `Microsoft(R) MS-DOS(R) Version ${DOS_VERSION[variant]}`,
    '             (C)Copyright Microsoft Corp 1981-1991.',
    '',
    ...(variant === 'win3' ? ['  Type EXIT and press ENTER to quit this MS-DOS prompt and', '  return to Windows.', ''] : []),
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [hIndex, setHIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [lines])

  const prompt = `${toDos(cwd)}>`

  const exec = (raw: string): string[] | 'cls' | 'exit' => {
    const line = raw.trim()
    if (!line) return []
    // "CD.." and "CD\DOS" work without a space, as in real DOS.
    const m = /^(cd|chdir)([.\\].*)$/i.exec(line) ?? /^(\S+)\s*(.*)$/.exec(line) ?? ['', line, '']
    const cmd = m[1].toUpperCase()
    const arg = m[2].trim()
    const at = (p: string) => resolvePath(fs, p, cwd)
    switch (cmd) {
      case 'CLS': return 'cls'
      case 'EXIT': return 'exit'
      case 'VER': return ['', `MS-DOS Version ${DOS_VERSION[variant]}`, '']
      case 'HELP': return HELP
      case 'ECHO': return [arg || 'ECHO is on.']
      case 'DATE': return [`Current date is ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric' })}`]
      case 'TIME': return [`Current time is ${new Date().toLocaleTimeString('en-US')}`]
      case 'MEM': return ['', '    655360 bytes total conventional memory', '    655360 bytes available to MS-DOS', '    589824 largest executable program size', '']
      case 'WIN': return ['You are already running Windows.']
      case 'DIR': {
        const p = arg ? at(arg) : cwd
        return p && fs.isDir(p) ? dir(fs, p) : ['File not found']
      }
      case 'CD': case 'CHDIR': {
        if (!arg) return [toDos(cwd)]
        const p = at(arg)
        if (!p || !fs.isDir(p)) return ['Invalid directory']
        setCwd(p)
        return []
      }
      case 'MD': case 'MKDIR': {
        const p = arg && at(arg)
        if (!p || fs.exists(p)) return ['Unable to create directory']
        fs.mkdir(p)
        return []
      }
      case 'RD': case 'RMDIR': {
        const p = arg && at(arg)
        if (!p || !fs.isDir(p)) return ['Invalid path, not directory,', 'or directory not empty']
        if (fs.list(p).length) return ['Invalid path, not directory,', 'or directory not empty']
        fs.remove(p)
        return []
      }
      case 'TYPE': {
        const p = arg && at(arg)
        const text = p ? fs.read(p) : null
        return text === null ? ['File not found'] : text.split(/\r?\n/)
      }
      case 'DEL': case 'ERASE': {
        const p = arg && at(arg)
        if (!p || !fs.exists(p) || fs.isDir(p)) return ['File not found']
        fs.remove(p)
        return []
      }
      case 'COPY': {
        const [a, b] = arg.split(/\s+/)
        const from = a && at(a)
        const content = from ? fs.read(from) : null
        if (!from || content === null) return ['File not found', '        0 file(s) copied']
        let to = b ? at(b) : cwd
        if (!to) return ['Invalid drive specification']
        if (fs.isDir(to)) to = joinPath(to, baseName(from))
        fs.write(to, content)
        return ['        1 file(s) copied']
      }
      case 'REN': case 'RENAME': {
        const [a, b] = arg.split(/\s+/)
        const from = a && at(a)
        if (!from || !fs.exists(from) || !b) return ['File not found']
        try { fs.rename(from, joinPath(parentOf(from), b.toUpperCase())) } catch { return ['Duplicate file name or file not found'] }
        return []
      }
    }
    if (/^[a-zA-Z]:$/.test(cmd)) {
      if (!fs.exists(cmd)) return ['Invalid drive specification']
      setCwd(cmd)
      return []
    }
    const prog = findProgram(fs, cmd, cwd)
    if (!prog || !PROGRAM_EXTS.has(extOf(prog))) return ['Bad command or file name']
    runProgram(os, line, cwd)
    return []
  }

  const submit = () => {
    const out = exec(input)
    if (input.trim()) { setHistory(h => [input, ...h].slice(0, 30)); setHIndex(-1) }
    setInput('')
    if (out === 'exit') { os.close(winId); return }
    if (out === 'cls') { setLines([]); return }
    setLines(l => [...l, `${prompt}${input}`, ...out].slice(-400))
  }

  return (
    <div className="app app-w16-dosprompt" onPointerUp={() => { if (!getSelection()?.toString()) inputRef.current?.focus() }}>
      <pre className="dosprompt-out">
        {lines.join('\n')}
        {lines.length ? '\n' : ''}
        <span>{prompt}</span>
        <span className="dosprompt-line">
          <input
            ref={inputRef}
            autoFocus
            spellCheck={false}
            value={input}
            style={{ width: `${input.length + 1}ch` }}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') submit()
              else if (e.key === 'ArrowUp' && history.length) { const i = Math.min(hIndex + 1, history.length - 1); setHIndex(i); setInput(history[i]) }
              else if (e.key === 'ArrowDown') { const i = hIndex - 1; setHIndex(Math.max(i, -1)); setInput(i >= 0 ? history[i] : '') }
              else if (e.key === 'Escape') setInput('')
              else return
              e.preventDefault()
            }}
          />
          <span className="w16-caret">_</span>
        </span>
      </pre>
      <div ref={endRef} />
    </div>
  )
}
