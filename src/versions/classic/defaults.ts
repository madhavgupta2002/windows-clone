import { createElement, type ComponentType } from 'react'
import { coreApps, pickApps, svgIcon, type AppDef, type AppProps, type FsSeed } from '../../core'
import { icons } from './icons'
import { fileIcon } from './util'
import type { CascadeItem, ClassicDesktopIcon, DesktopBackground, QuickLaunchItem, ShellAction, ShellCtx } from './types'

/* ---------------------------------------------------------------- actions */

export const act = {
  open: (appId: string, args?: Record<string, unknown>): ShellAction => ({ os }) => { os.open(appId, args) },
  folder: (path: string, title?: string): ShellAction => ({ shell }) => shell.openPath(path, title),
  alert: (title: string, text: string, icon: 'info' | 'warning' | 'error' | 'question' = 'info'): ShellAction =>
    ({ os }) => os.alert(title, text, icon),
  notAvailable: (title: string): ShellAction =>
    ({ os }) => os.alert(title, `${title} is not available in this recreation.`, 'info'),
}

/** Read a value stored with core's usePref (key without the `winclone.pref.` prefix). */
export function readPref<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(`winclone.pref.${key}`)
    return raw === null ? initial : (JSON.parse(raw) as T)
  } catch { return initial }
}

/* ---------------------------------------------------------------- apps */

/** Wrap an app component so it receives default args (explicit args still win). */
function withArgs(Component: ComponentType<AppProps>, defaults: Record<string, unknown>): ComponentType<AppProps> {
  const Wrapped = (props: AppProps) => createElement(Component, { ...props, args: { ...defaults, ...props.args } })
  Wrapped.displayName = `WithArgs(${Component.displayName ?? Component.name})`
  return Wrapped
}

export interface ClassicAppsOptions {
  /** Label of the drive list in Explorer ("My Computer"). */
  computerLabel?: string
  /** Browser home page title. */
  browserTitle?: string
}

/** Shared apps with classic icons (and Explorer/About defaults), plus version-only extras. */
export function classicApps(extra: AppDef[] = [], o: ClassicAppsOptions = {}): AppDef[] {
  return pickApps(
    {
      notepad: { icon: icons.notepad },
      calculator: { icon: icons.calculator },
      explorer: {
        icon: icons.explorer,
        component: withArgs(coreApps.explorer.component, {
          folderIcon: icons.folder, driveIcon: icons.drive, computerLabel: o.computerLabel ?? 'My Computer',
        }),
      },
      minesweeper: { icon: icons.minesweeper },
      paint: { icon: icons.paint },
      browser: { icon: icons.ie, title: o.browserTitle ?? 'Microsoft Internet Explorer' },
      msgbox: {},
      about: { icon: icons.info, component: withArgs(coreApps.about.component, { logo: icons.flag }) },
    },
    extra,
  )
}

/* ---------------------------------------------------------------- desktop */

export const desktopIcon = {
  myComputer: (label = 'My Computer'): ClassicDesktopIcon => ({ id: 'mycomputer', label, icon: icons.computer, action: ({ shell }) => shell.openMyComputer() }),
  myDocuments: (path: string): ClassicDesktopIcon => ({ id: 'mydocs', label: 'My Documents', icon: icons.documents, action: act.folder(path, 'My Documents') }),
  recycleBin: (path: string): ClassicDesktopIcon => ({ id: 'recycle', label: 'Recycle Bin', icon: icons.recycleBin, action: act.folder(path, 'Recycle Bin') }),
  network: (label = 'Network Neighborhood'): ClassicDesktopIcon => ({ id: 'network', label, icon: icons.network, action: act.alert(label, 'Unable to browse the network.\n\nThe network is not accessible.', 'error') }),
  internetExplorer: (label = 'Internet Explorer'): ClassicDesktopIcon => ({ id: 'ie', label, icon: icons.ie, action: act.open('browser') }),
  outlook: (): ClassicDesktopIcon => ({ id: 'outlook', label: 'Outlook Express', icon: icons.mail, action: act.notAvailable('Outlook Express') }),
}

/** Plain colour plus a few CSS-drawn patterns/wallpapers. `--desktop` is the plain colour. */
export const BACKGROUNDS: DesktopBackground[] = [
  { name: '(None)', css: null },
  { name: 'Clouds', css: 'radial-gradient(ellipse 22% 9% at 20% 25%, #fff9 60%, transparent 62%), radial-gradient(ellipse 18% 7% at 70% 40%, #fff8 60%, transparent 62%), radial-gradient(ellipse 26% 10% at 45% 70%, #fff7 60%, transparent 62%), linear-gradient(#2a62c9, #8db7ee)' },
  { name: 'Black Thatches', css: 'repeating-linear-gradient(45deg, #000 0 2px, transparent 2px 8px), repeating-linear-gradient(-45deg, #000 0 2px, transparent 2px 8px), var(--desktop)' },
  { name: 'Bricks', css: `url("${svgIcon('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" shape-rendering="crispEdges"><rect width="32" height="32" fill="#800000"/><path d="M0 14h32v2H0zM0 30h32v2H0zM30 0h2v14h-2zM14 16h2v14h-2z" fill="#000"/></svg>')}") 0 0 / 32px 32px` },
  { name: 'Houndstooth', css: 'conic-gradient(#000 25%, transparent 0 50%, #000 0 75%, transparent 0) 0 0 / 8px 8px, var(--desktop)' },
  { name: 'Setup', css: 'radial-gradient(circle at 50% 120%, #1084d0 0 40%, #000080 70%)' },
]

/* ---------------------------------------------------------------- start menu */

/** Files in My Documents, for the Start → Documents submenu. */
export const documentsList = ({ os }: ShellCtx): CascadeItem[] =>
  os.fs.exists(os.documentsPath)
    ? os.fs.list(os.documentsPath).filter(n => n.type === 'file').slice(0, 15).map(n => ({
        label: n.name, icon: fileIcon(n), action: ({ os: o }: ShellCtx) => o.openPath(n.path),
      }))
    : []

export interface StartMenuOptions {
  /** Items above the first separator (Windows Update, Office shortcuts, …). */
  top?: CascadeItem[]
  favorites?: boolean
  /** Extra entries in Programs, after Accessories. */
  programs?: CascadeItem[]
  /** Extra entries in Accessories. */
  accessories?: CascadeItem[]
  /** Extra entries in Accessories → System Tools. */
  systemTools?: CascadeItem[]
  /** "MS-DOS Prompt" (9x) or "Command Prompt" (NT). */
  promptLabel?: string
  /** Rendered as "Log Off <user>..." when set. */
  logOffUser?: string
  /** Find → On the Internet / People (98+). */
  findInternet?: boolean
  /** "Find" (95/98) or "Search" (ME/2000). */
  findLabel?: string
  /** Settings → Active Desktop / Windows Update (98+). */
  settingsExtra?: CascadeItem[]
  documentsPath: string
}

export function classicStartMenu(o: StartMenuOptions): CascadeItem[] {
  const prompt = o.promptLabel ?? 'MS-DOS Prompt'
  const accessories: CascadeItem[] = [
    {
      label: 'Games', icon: icons.programs, children: [
        { label: 'Minesweeper', icon: icons.minesweeper, action: act.open('minesweeper') },
      ],
    },
    {
      label: 'System Tools', icon: icons.programs, children: [
        { label: 'Disk Defragmenter', icon: icons.drive, action: act.notAvailable('Disk Defragmenter') },
        { label: 'ScanDisk', icon: icons.drive, action: act.notAvailable('ScanDisk') },
        ...(o.systemTools ?? []),
      ],
    },
    { label: 'Calculator', icon: icons.calculator, action: act.open('calculator') },
    { label: 'Notepad', icon: icons.notepad, action: act.open('notepad') },
    { label: 'Paint', icon: icons.paint, action: act.open('paint') },
    ...(o.accessories ?? []),
  ]
  return [
    ...(o.top?.length ? [...o.top, { separator: true }] : []),
    {
      label: 'Programs', icon: icons.programs, children: [
        { label: 'Accessories', icon: icons.programs, children: accessories },
        { label: 'StartUp', icon: icons.programs, children: [] },
        ...(o.programs ?? []),
        { label: 'Internet Explorer', icon: icons.ie, action: act.open('browser') },
        { label: prompt, icon: icons.msdos, action: act.alert(prompt, `${prompt} is not available here.\n\nTip: choose "Restart in MS-DOS mode" from Shut Down.`) },
        { label: 'Windows Explorer', icon: icons.explorer, action: act.open('explorer', { path: 'C:' }) },
      ],
    },
    ...(o.favorites ? [{
      label: 'Favorites', icon: icons.favorites, children: [
        { label: 'Channels', icon: icons.channels, children: [] },
        { label: 'Links', icon: icons.folder, children: [] },
        { label: 'MSN', icon: icons.ie, action: act.open('browser', { url: 'https://www.msn.com' }) },
      ],
    }] : []),
    {
      label: 'Documents', icon: icons.docsMenu, children: ctx => [
        { label: 'My Documents', icon: icons.documents, action: act.folder(o.documentsPath, 'My Documents') },
        { separator: true },
        ...documentsList(ctx),
      ],
    },
    {
      label: 'Settings', icon: icons.settings, children: [
        { label: 'Control Panel', icon: icons.controlPanel, action: act.open('display') },
        { label: 'Printers', icon: icons.printer, action: act.notAvailable('Printers') },
        { label: 'Taskbar & Start Menu...', icon: icons.settings, action: act.notAvailable('Taskbar Properties') },
        ...(o.settingsExtra ?? []),
      ],
    },
    {
      label: o.findLabel ?? 'Find', icon: icons.find, children: [
        { label: 'Files or Folders...', icon: icons.find, action: act.open('explorer', { path: 'C:' }) },
        { label: 'Computer...', icon: icons.computer, action: act.notAvailable('Find Computer') },
        ...(o.findInternet ? [
          { label: 'On the Internet...', icon: icons.ie, action: act.open('browser') },
          { label: 'People...', icon: icons.find, action: act.notAvailable('Find People') },
        ] : []),
      ],
    },
    { label: 'Help', icon: icons.help, action: ctx => ctx.os.open('about') },
    { label: 'Run...', icon: icons.run, action: ({ shell }) => shell.openRun() },
    ...(o.logOffUser ? [{ label: `Log Off ${o.logOffUser}...`, icon: icons.logoff, action: ({ shell }: ShellCtx) => shell.logOff() }] : []),
    { label: 'Shut Down...', icon: icons.shutdown, action: ({ shell }) => shell.openShutDown() },
  ]
}

/** Quick Launch: IE, Outlook Express, Show Desktop, (Channels). */
export function classicQuickLaunch(channels = false): QuickLaunchItem[] {
  return [
    { id: 'ie', label: 'Launch Internet Explorer Browser', icon: icons.ie, action: act.open('browser') },
    { id: 'mail', label: 'Launch Outlook Express', icon: icons.mail, action: act.notAvailable('Outlook Express') },
    { id: 'desktop', label: 'Show Desktop', icon: icons.showDesktop, action: ({ shell }) => shell.showDesktop() },
    ...(channels ? [{ id: 'channels', label: 'View Channels', icon: icons.channels, action: act.open('browser') }] : []),
  ]
}

/* ---------------------------------------------------------------- file system */

export interface SeedOptions {
  /** "C:/WINDOWS" or "C:/WINNT". */
  windowsDir: string
  documentsPath: string
  desktopPath: string
  recyclePath: string
  product: string
  extra?: FsSeed
}

export function classicSeed(o: SeedOptions): FsSeed {
  const win = o.windowsDir
  return {
    'C:/AUTOEXEC.BAT': '@ECHO OFF\r\nSET PATH=C:\\WINDOWS;C:\\WINDOWS\\COMMAND\r\nSET TEMP=C:\\WINDOWS\\TEMP\r\n',
    'C:/CONFIG.SYS': 'DEVICE=C:\\WINDOWS\\HIMEM.SYS\r\nDOS=HIGH,UMB\r\nFILES=40\r\n',
    [`${win}/WIN.INI`]: `; for 16-bit app support\r\n[windows]\r\nload=\r\nrun=\r\nNullPort=None\r\n\r\n[Desktop]\r\nWallpaper=(None)\r\nTileWallpaper=1\r\n\r\n[fonts]\r\n\r\n[mci extensions]\r\n`,
    [`${win}/SYSTEM.INI`]: '[boot]\r\nshell=Explorer.exe\r\nsystem.drv=system.drv\r\n\r\n[386Enh]\r\nwoafont=dosapp.fon\r\n',
    [`${win}/SYSTEM`]: null,
    [`${win}/TEMP`]: null,
    [`${win}/Fonts`]: null,
    [`${win}/NOTEPAD.EXE`]: 'MZ',
    [`${win}/CALC.EXE`]: 'MZ',
    [`${win}/WINMINE.EXE`]: 'MZ',
    'C:/Program Files/Accessories/MSPAINT.EXE': 'MZ',
    'C:/Program Files/Internet Explorer/IEXPLORE.EXE': 'MZ',
    [o.documentsPath]: null,
    [`${o.documentsPath}/Readme.txt`]:
      `Welcome to ${o.product}!\r\n\r\nThis is a recreation running in your browser. Files you create are saved in your browser's local storage.\r\n\r\nTry:\r\n - Start > Run... and type "notepad", "calc" or "winmine"\r\n - Right-click the desktop to create a new folder or change the wallpaper\r\n - Start > Shut Down... to go back to the launcher\r\n`,
    [`${o.documentsPath}/Shopping list.txt`]: 'Milk\r\nBread\r\nA new 56k modem\r\nFloppy disks (10-pack)\r\n',
    [o.desktopPath]: null,
    [o.recyclePath]: null,
    'D:': null,
    ...o.extra,
  }
}
