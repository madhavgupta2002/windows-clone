import { useCallback, useMemo, useState, type MouseEvent } from 'react'
import {
  ContextMenu, coreApps, DesktopIcons, joinPath, OSProvider, pickApps, useFS, useOS, usePref, WindowLayer,
  type DesktopIconDef, type MenuItem,
} from '../../core'
import { ICONS } from '../nt6shared/icons'
import { useWallpaper, WallpaperContext, withDefaultArgs, type WallpaperState } from '../nt6shared/shared'
import { VISTA_EXTRA_APPS, WELCOME_PREF } from './apps'
import { ABOUT, DESKTOP_DIR, DOCS, RECYCLE_DIR, SEED, WALLPAPERS, WORK_AREA } from './data'
import { VistaFrame } from './Frame'
import { BootScreen, Delay, LogonScreen, type LogonStatus } from './screens'
import { Sidebar } from './Sidebar'
import { Taskbar, type PowerAction } from './Taskbar'
import './vista.css'

const APPS = pickApps(
  {
    notepad: { icon: ICONS.notepad },
    calculator: { icon: ICONS.calculator },
    explorer: {
      icon: ICONS.folder,
      title: 'Windows Explorer',
      component: withDefaultArgs(coreApps.explorer.component, {
        folderIcon: ICONS.folder, driveIcon: ICONS.drive, computerIcon: ICONS.computer, computerLabel: 'Computer',
      }),
    },
    minesweeper: { icon: ICONS.mine },
    paint: { icon: ICONS.paint },
    browser: { icon: ICONS.ie, title: 'Windows Internet Explorer' },
    msgbox: {},
    about: { icon: ICONS.computer, title: 'About Windows' },
  },
  VISTA_EXTRA_APPS,
)

type Phase = 'boot' | 'desktop' | LogonStatus

function Desktop({ onPower }: { onPower: (a: PowerAction) => void }) {
  const os = useOS()
  const fs = useFS()
  const { current } = useWallpaper()
  const [sidebar, setSidebar] = usePref('vista.sidebar', true)
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const toggleSidebar = useCallback(() => setSidebar(s => !s), [setSidebar])

  const desktopFiles = fs.isDir(DESKTOP_DIR) ? fs.list(DESKTOP_DIR) : []
  const icons: DesktopIconDef[] = [
    { id: 'bin', label: 'Recycle Bin', icon: ICONS.recycle, onOpen: () => os.open('explorer', { path: RECYCLE_DIR, title: 'Recycle Bin' }) },
    { id: 'pc', label: 'Computer', icon: ICONS.computer, onOpen: () => os.open('explorer', { path: '' }) },
    { id: 'user', label: 'User', icon: ICONS.documents, onOpen: () => os.open('explorer', { path: DOCS }) },
    { id: 'ie', label: 'Internet Explorer', icon: ICONS.ie, onOpen: () => os.open('browser') },
    ...desktopFiles.map(f => ({
      id: f.path, label: f.name, icon: f.type === 'dir' ? ICONS.folder : ICONS.textfile, onOpen: () => os.openPath(f.path),
    })),
  ]

  const items: MenuItem[] = [
    { label: 'View', disabled: true },
    { label: 'Sort By', disabled: true },
    { label: 'Refresh', onClick: () => undefined },
    { separator: true },
    { label: 'Paste', disabled: true },
    { separator: true },
    { label: 'New Folder', onClick: () => fs.mkdir(joinPath(DESKTOP_DIR, fs.uniqueName(DESKTOP_DIR, 'New Folder'))) },
    { label: 'New Text Document', onClick: () => fs.write(joinPath(DESKTOP_DIR, fs.uniqueName(DESKTOP_DIR, 'New Text Document.txt')), '') },
    { separator: true },
    { label: 'Show Sidebar', checked: sidebar, onClick: toggleSidebar },
    { label: 'Personalize', onClick: () => os.open('vista-personalize') },
  ]

  const onContext = (e: MouseEvent) => {
    e.preventDefault()
    if ((e.target as HTMLElement).closest('.desktop-icon, .vista-sidebar')) return
    setMenu({ x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <div
        className="vista-desktop"
        style={{ background: current.css }}
        onPointerDown={e => e.target === e.currentTarget && os.blur()}
        onContextMenu={onContext}
      >
        <DesktopIcons icons={icons} className={sidebar ? 'with-sidebar' : ''} />
        {sidebar && <Sidebar onClose={() => setSidebar(false)} />}
      </div>
      {menu && <ContextMenu x={menu.x} y={menu.y} items={items} onClose={() => setMenu(null)} />}
      <WindowLayer Frame={VistaFrame} />
      <Taskbar onPower={onPower} sidebar={sidebar} onToggleSidebar={toggleSidebar} />
    </>
  )
}

/** Reads the Welcome Center "Run at startup" checkbox (stored by usePref). */
function welcomeAtStartup() {
  try { return localStorage.getItem(`winclone.pref.${WELCOME_PREF}`) !== 'false' } catch { return true }
}

function Session() {
  const os = useOS()
  const [phase, setPhase] = useState<Phase>('boot')
  const [freshLogon, setFreshLogon] = useState(true)

  const power = (a: PowerAction) => {
    switch (a) {
      case 'shutdown': os.closeAll(); setPhase('shutdown'); break
      case 'restart': os.closeAll(); setPhase('restart'); break
      case 'logoff': os.closeAll(); setFreshLogon(true); setPhase('logoff'); break
      case 'lock': case 'sleep': setPhase('locked'); break
      case 'switch': setPhase('pick'); break
    }
  }

  const enterDesktop = () => {
    setPhase('desktop')
    if (freshLogon && welcomeAtStartup()) os.open('vista-welcome')
    setFreshLogon(false)
  }

  return (
    <div className="os-root os-vista">
      {phase === 'boot' && <BootScreen onDone={() => setPhase('pick')} />}
      {phase !== 'boot' && phase !== 'desktop' && (
        <LogonScreen status={phase} onLogin={() => setPhase(phase === 'locked' ? 'desktop' : 'welcome')} onShutDown={() => power('shutdown')} />
      )}
      {phase === 'welcome' && <Delay ms={1800} onDone={enterDesktop} />}
      {phase === 'logoff' && <Delay ms={1500} onDone={() => setPhase('pick')} />}
      {phase === 'restart' && <Delay ms={1800} onDone={() => setPhase('boot')} />}
      {phase === 'shutdown' && <Delay ms={2000} onDone={os.exit} />}
      {phase === 'desktop' && <Desktop onPower={power} />}
    </div>
  )
}

export default function Shell() {
  const [wallpaper, setWallpaper] = usePref<string>('vista.wallpaper', 'aurora')
  const ctx = useMemo<WallpaperState>(() => ({ wallpapers: WALLPAPERS, wallpaper, setWallpaper }), [wallpaper, setWallpaper])
  return (
    <WallpaperContext.Provider value={ctx}>
      <OSProvider versionId="vista" about={ABOUT} apps={APPS} fsSeed={SEED} documentsPath={DOCS} workArea={WORK_AREA}>
        <Session />
      </OSProvider>
    </WallpaperContext.Provider>
  )
}
