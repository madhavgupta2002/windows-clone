import { useCallback, useState } from 'react'
import { OSProvider, WindowLayer, useOS, type DesktopIconDef } from '../../core'
import {
  APP_ICONS, DOCUMENTS_DIR, DisplayFilters, LockScreen, MODERN_APPS, ModernContext, ModernDesktop, ModernFrame, PowerScreen,
  RECYCLE_BIN, TaskView, modernFsSeed, modernRootProps, useFlyoutDismiss, useModernShell,
} from '../modern'
import { Taskbar10, type Fly10 } from './Taskbar10'
import { WIN10_ACCENTS, WIN10_WALLPAPERS } from './wallpapers'
import './win10.css'

const ABOUT = {
  product: 'Windows 10 Home',
  version: 'Version 22H2 (OS Build 19045.web)',
  copyright: '© Microsoft Corporation. All rights reserved.',
  extra: 'A browser recreation, built with React.',
}
const FS_SEED = modernFsSeed('Windows 10')
const WORK_AREA = { top: 0, left: 0, right: 0, bottom: 40 }

export default function Shell() {
  return (
    <OSProvider versionId="win10" about={ABOUT} apps={MODERN_APPS} fsSeed={FS_SEED} documentsPath={DOCUMENTS_DIR} workArea={WORK_AREA}>
      <Win10 />
    </OSProvider>
  )
}

function Win10() {
  const os = useOS()
  const shell = useModernShell({ variant: 'win10', wallpapers: WIN10_WALLPAPERS, accents: WIN10_ACCENTS, defaultAccent: '#0078d7', defaultTheme: 'dark' })
  const [fly, setFly] = useState<Fly10>(null)
  const [taskView, setTaskView] = useState(false)
  const [locked, setLocked] = useState(true)
  const closeFly = useCallback(() => setFly(null), [])
  useFlyoutDismiss(fly !== null, closeFly)

  const shortcuts: DesktopIconDef[] = [
    { id: 'bin', label: 'Recycle Bin', icon: APP_ICONS.bin, onOpen: () => os.open('explorer', { path: RECYCLE_BIN }) },
    { id: 'pc', label: 'This PC', icon: APP_ICONS.pc, onOpen: () => os.open('explorer', { path: '' }) },
    { id: 'edge', label: 'Microsoft Edge', icon: APP_ICONS.edge, onOpen: () => os.open('browser') },
  ]

  const root = modernRootProps(shell)
  return (
    <ModernContext.Provider value={shell}>
      <div className={root.className} style={root.style}>
        <ModernDesktop shortcuts={shortcuts} />
        <WindowLayer Frame={ModernFrame} />
        {taskView && <TaskView onClose={() => setTaskView(false)} />}
        <Taskbar10
          fly={fly}
          setFly={setFly}
          onTaskView={() => { setFly(null); setTaskView(v => !v) }}
          onLock={() => { setFly(null); setLocked(true) }}
        />
        {locked && <LockScreen onUnlock={() => setLocked(false)} />}
        <DisplayFilters />
        <PowerScreen onResume={from => from !== 'shutdown' && setLocked(true)} />
      </div>
    </ModernContext.Provider>
  )
}
