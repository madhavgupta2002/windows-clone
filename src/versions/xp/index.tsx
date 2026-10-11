import { useCallback, useMemo, useState, type MouseEvent } from 'react'
import {
  ContextMenu, coreApps, DesktopIcons, joinPath, OSProvider, pickApps, useFS, useOS, usePref, WindowLayer,
  type DesktopIconDef, type MenuItem,
} from '../../core'
import { ICONS } from '../nt6shared/icons'
import { useWallpaper, WallpaperContext, withDefaultArgs, type WallpaperState } from '../nt6shared/shared'
import { XP_EXTRA_APPS } from './apps'
import { ABOUT, DESKTOP_DIR, DOCS, RECYCLE_DIR, SEED, WALLPAPERS, WORK_AREA } from './data'
import { XpFrame } from './Frame'
import { BootScreen, Delay, ExitDialog, WelcomeScreen } from './screens'
import { Taskbar } from './Taskbar'
import './xp.css'

const APPS = pickApps(
  {
    notepad: { icon: ICONS.notepad },
    calculator: { icon: ICONS.calculator },
    explorer: {
      icon: ICONS.folder,
      title: 'Windows Explorer',
      component: withDefaultArgs(coreApps.explorer.component, {
        folderIcon: ICONS.folder, driveIcon: ICONS.drive, computerIcon: ICONS.computer, computerLabel: 'My Computer',
      }),
    },
    minesweeper: { icon: ICONS.mine },
    paint: { icon: ICONS.paint, title: 'untitled - Paint' },
    browser: { icon: ICONS.ie, title: 'Microsoft Internet Explorer' },
    msgbox: {},
    about: { icon: ICONS.computer, title: 'About Windows' },
  },
  XP_EXTRA_APPS,
)

type Phase = 'boot' | 'welcome' | 'loading' | 'desktop' | 'logoff' | 'shutdown'
type Dialog = 'turnoff' | 'logoff' | null

function Desktop({ onLogOff, onTurnOff }: { onLogOff: () => void; onTurnOff: () => void }) {
  const os = useOS()
  const fs = useFS()
  const { current } = useWallpaper()
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)

  const desktopFiles = fs.isDir(DESKTOP_DIR) ? fs.list(DESKTOP_DIR) : []
  const icons: DesktopIconDef[] = [
    { id: 'docs', label: 'My Documents', icon: ICONS.documents, onOpen: () => os.open('explorer', { path: DOCS }) },
    { id: 'pc', label: 'My Computer', icon: ICONS.computer, onOpen: () => os.open('explorer', { path: '' }) },
    { id: 'net', label: 'My Network Places', icon: ICONS.network, onOpen: () => os.alert('My Network Places', 'No network connection is available.', 'warning') },
    { id: 'ie', label: 'Internet Explorer', icon: ICONS.ie, onOpen: () => os.open('browser') },
    ...desktopFiles.map(f => ({
      id: f.path,
      label: f.name,
      icon: f.type === 'dir' ? ICONS.folder : ICONS.textfile,
      onOpen: () => os.openPath(f.path),
    })),
  ]
  const recycleFull = fs.isDir(RECYCLE_DIR) && fs.list(RECYCLE_DIR).length > 0
  const recycle: DesktopIconDef[] = [
    { id: 'bin', label: 'Recycle Bin', icon: ICONS.recycle, onOpen: () => os.open('explorer', { path: RECYCLE_DIR, title: 'Recycle Bin' }) },
  ]

  const items: MenuItem[] = [
    { label: 'Arrange Icons By', disabled: true },
    { label: 'Refresh', onClick: () => undefined },
    { separator: true },
    { label: 'Paste', disabled: true },
    { label: 'Paste Shortcut', disabled: true },
    { separator: true },
    { label: 'New Folder', onClick: () => fs.mkdir(joinPath(DESKTOP_DIR, fs.uniqueName(DESKTOP_DIR, 'New Folder'))) },
    { label: 'New Text Document', onClick: () => fs.write(joinPath(DESKTOP_DIR, fs.uniqueName(DESKTOP_DIR, 'New Text Document.txt')), '') },
    { separator: true },
    { label: 'Properties', onClick: () => os.open('xp-display') },
  ]

  const onContext = (e: MouseEvent) => {
    e.preventDefault()
    if ((e.target as HTMLElement).closest('.desktop-icon')) return
    setMenu({ x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <div
        className="xp-desktop"
        style={{ background: current.css, bottom: WORK_AREA.bottom }}
        onPointerDown={e => e.target === e.currentTarget && os.blur()}
        onContextMenu={onContext}
      >
        <DesktopIcons icons={icons} />
        <DesktopIcons icons={recycle} className={`xp-recycle${recycleFull ? ' full' : ''}`} />
      </div>
      {menu && <ContextMenu x={menu.x} y={menu.y} items={items} onClose={() => setMenu(null)} />}
      <WindowLayer Frame={XpFrame} />
      <Taskbar onLogOff={onLogOff} onTurnOff={onTurnOff} />
    </>
  )
}

function Session() {
  const os = useOS()
  const [phase, setPhase] = useState<Phase>('boot')
  const [dialog, setDialog] = useState<Dialog>(null)
  const cancel = useCallback(() => setDialog(null), [])

  const leave = (next: Phase) => { setDialog(null); os.closeAll(); setPhase(next) }

  return (
    <div className={`os-root os-xp${dialog ? ' xp-dimmed' : ''}`}>
      {phase === 'boot' && <BootScreen onDone={() => setPhase('welcome')} />}
      {(phase === 'welcome' || phase === 'loading' || phase === 'logoff' || phase === 'shutdown') && (
        <WelcomeScreen
          status={phase === 'welcome' ? 'pick' : phase}
          onLogin={() => setPhase('loading')}
          onTurnOff={() => setDialog('turnoff')}
        />
      )}
      {phase === 'loading' && <Delay ms={1600} onDone={() => setPhase('desktop')} />}
      {phase === 'logoff' && <Delay ms={1400} onDone={() => setPhase('welcome')} />}
      {phase === 'shutdown' && <Delay ms={2000} onDone={os.exit} />}
      {phase === 'desktop' && <Desktop onLogOff={() => setDialog('logoff')} onTurnOff={() => setDialog('turnoff')} />}

      {dialog === 'turnoff' && (
        <ExitDialog
          title="Turn off computer"
          onCancel={cancel}
          choices={[
            { label: 'Stand By', icon: ICONS.standby, onClick: () => leave('welcome') },
            { label: 'Turn Off', icon: ICONS.power, onClick: () => leave('shutdown') },
            { label: 'Restart', icon: ICONS.restart, onClick: () => leave('boot') },
          ]}
        />
      )}
      {dialog === 'logoff' && (
        <ExitDialog
          title="Log Off Windows"
          onCancel={cancel}
          choices={[
            { label: 'Switch User', icon: ICONS.user, onClick: () => { setDialog(null); setPhase('welcome') } },
            { label: 'Log Off', icon: ICONS.logoff, onClick: () => leave('logoff') },
          ]}
        />
      )}
    </div>
  )
}

export default function Shell() {
  const [wallpaper, setWallpaper] = usePref<string>('xp.wallpaper', 'bliss')
  const ctx = useMemo<WallpaperState>(() => ({ wallpapers: WALLPAPERS, wallpaper, setWallpaper }), [wallpaper, setWallpaper])
  return (
    <WallpaperContext.Provider value={ctx}>
      <OSProvider versionId="xp" about={ABOUT} apps={APPS} fsSeed={SEED} documentsPath={DOCS} workArea={WORK_AREA}>
        <Session />
      </OSProvider>
    </WallpaperContext.Provider>
  )
}
