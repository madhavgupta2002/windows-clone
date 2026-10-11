import { baseName, extOf, joinPath, parentOf, type FileSystem, type FsNode, type OS } from '../../core'
import { W16 } from './context'

/** Executable name → app id. Executables without an entry fail with the classic memory error. */
export const EXE_APPS: Record<string, string> = {
  'NOTEPAD.EXE': 'notepad',
  'CALC.EXE': 'calculator',
  'PAINT.EXE': 'paint',
  'PBRUSH.EXE': 'paint',
  'CLOCK.EXE': W16.clock,
  'REVERSI.EXE': W16.reversi,
  'WINMINE.EXE': 'minesweeper',
  'PROGMAN.EXE': 'w3-progman',
  'WINFILE.EXE': 'explorer',
  'CONTROL.EXE': 'w3-control',
  'MSDOS.EXE': W16.dosexec,
  'COMMAND.COM': W16.dosprompt,
  'TASKMAN.EXE': W16.tasklist,
  'WINVER.EXE': 'about',
}

export const PROGRAM_EXTS = new Set(['exe', 'com', 'bat', 'pif'])

/** "C:/WINDOWS" → "C:\WINDOWS", "C:" → "C:\". */
export function toDos(path: string): string {
  return path.includes('/') ? path.replace(/\//g, '\\') : `${path}\\`
}

/** Directory listing name in upper case (DOS has no lower case). */
export const dosName = (name: string) => name.toUpperCase()

/** Split "README.TXT" into ["README", "TXT"]. */
export function splitName(name: string): [string, string] {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? [name.slice(0, dot), name.slice(dot + 1)] : [name, '']
}

/** Find an existing child of `dir` case-insensitively. */
function findChild(fs: FileSystem, dir: string, name: string): string | null {
  const want = name.toUpperCase()
  return fs.list(dir).find(n => n.name.toUpperCase() === want)?.path ?? null
}

/**
 * Resolve a DOS path typed by the user ("..\DOS", "\WINDOWS\WIN.INI", "C:readme.txt")
 * relative to `cwd`. Existing entries are matched case-insensitively; unknown segments keep
 * the case typed. Returns null for unknown drives.
 */
export function resolvePath(fs: FileSystem, input: string, cwd: string): string | null {
  let s = input.trim().replace(/\\/g, '/').replace(/^"|"$/g, '')
  const drive = cwd.split('/')[0]
  let path = cwd
  const m = /^([a-zA-Z]):/.exec(s)
  if (m) {
    const d = `${m[1].toUpperCase()}:`
    if (!fs.exists(d)) return null
    path = d === drive ? cwd : d
    s = s.slice(2)
  }
  if (s.startsWith('/')) { path = path.split('/')[0]; s = s.slice(1) }
  for (const seg of s.split('/')) {
    if (!seg || seg === '.') continue
    if (seg === '..') { path = parentOf(path); continue }
    path = findChild(fs, path, seg) ?? joinPath(path, seg)
  }
  return path
}

const BINARY_EXTS = new Set(['exe', 'com', 'dll', 'drv', 'sys', 'bin', 'ovl', 'fon', 'grp', '386', 'mod'])

/** Plausible byte sizes for binaries (the virtual FS only stores a stub). */
export function displaySize(node: FsNode): number {
  if (node.type === 'dir') return 0
  if (!BINARY_EXTS.has(extOf(node.name))) return node.size
  let h = 0
  for (const ch of node.name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return 4000 + (h % 60000)
}

/** DOS-style short date and time: "10-11-92", " 3:10p". */
export function dosDate(ms: number): string {
  const d = new Date(ms)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getFullYear() % 100)}`
}
export function dosTime(ms: number): string {
  const d = new Date(ms)
  const h = d.getHours() % 12 || 12
  return `${String(h).padStart(2)}:${String(d.getMinutes()).padStart(2, '0')}${d.getHours() < 12 ? 'a' : 'p'}`
}

const SEARCH_PATH = ['C:/WINDOWS', 'C:/DOS', 'C:']

/** Locate a program typed without a path / extension, searching cwd then PATH. */
export function findProgram(fs: FileSystem, name: string, cwd: string): string | null {
  const direct = resolvePath(fs, name, cwd)
  if (direct && fs.exists(direct) && !fs.isDir(direct)) return direct
  const hasExt = splitName(baseName(name.replace(/\\/g, '/')))[1] !== ''
  const tries = hasExt ? [name] : [`${name}.EXE`, `${name}.COM`, `${name}.BAT`]
  const looksRelative = !/[\\/:]/.test(name)
  for (const dir of looksRelative ? [cwd, ...SEARCH_PATH] : [cwd]) {
    for (const t of tries) {
      const p = resolvePath(fs, t, dir)
      if (p && fs.exists(p) && !fs.isDir(p)) return p
    }
  }
  return null
}

/**
 * Run a command line the way WIN.COM would: "notepad readme.txt", "C:\WINDOWS\CLOCK.EXE",
 * or a document name (opened with its associated application). Returns the new window id.
 */
export function runProgram(os: OS, cmdline: string, cwd = 'C:/WINDOWS'): string | null {
  const [first, ...rest] = cmdline.trim().split(/\s+/)
  if (!first) return null
  const target = findProgram(os.fs, first, cwd)
  if (!target) {
    os.alert('Error', `Cannot find file ${first.toUpperCase()} (or one of its components). Check to ensure the path and filename are correct and that all required libraries are available.`, 'error')
    return null
  }
  if (!PROGRAM_EXTS.has(extOf(target)) || extOf(target) === 'bat') {
    os.openPath(target)
    return null
  }
  const appId = EXE_APPS[baseName(target).toUpperCase()]
  if (!appId || !os.apps[appId]) {
    os.alert('Application Error', 'Insufficient memory to run this application. Quit one or more Windows applications and then try again.', 'warning')
    return null
  }
  const docArg = rest.join(' ')
  const doc = docArg ? resolvePath(os.fs, docArg, cwd) : null
  return os.open(appId, doc && os.fs.exists(doc) ? { path: doc } : {})
}
