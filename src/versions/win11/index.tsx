import { useCallback, useState } from 'react'
import { OSProvider, WindowLayer, useOS, type DesktopIconDef, type FrameProps } from '../../core'
import {
  APP_ICONS, LockScreen, DisplayFilters, MODERN_APPS, ModernContext, ModernDesktop, ModernFrame, PowerScreen, RECYCLE_BIN, TaskView,
  modernFsSeed, modernRootProps, useFlyoutDismiss, useModernShell, DOCUMENTS_DIR,
} from '../modern'
import { Taskbar11, type Fly } from './Taskbar11'
import { WIN11_ACCENTS, WIN11_WALLPAPERS } from './wallpapers'
import './win11.css'

const ABOUT = {
  product: 'Windows 11 Home',
  version: 'Version 23H2 (OS Build 22631.web)',
  copyright: '© Microsoft Corporation. All rights reserved.',
  extra: 'A browser recreation, built with React.',
}
const FS_SEED = modernFsSeed('Windows 11')
const WORK_AREA = { top: 0, left: 0, right: 0, bottom: 48 }
const Win11Frame = (p: FrameProps) => <ModernFrame {...p} snap />

export default function Shell() {
  return (
    <OSProvider versionId="win11" about={ABOUT} apps={MODERN_APPS} fsSeed={FS_SEED} documentsPath={DOCUMENTS_DIR} workArea={WORK_AREA}>
      <Win11 />
    </OSProvider>
  )
}

function Win11() {
  const os = useOS()
  const shell = useModernShell({ variant: 'win11', wallpapers: WIN11_WALLPAPERS, accents: WIN11_ACCENTS, defaultAccent: '#0067c0', defaultTheme: 'light' })
  const [fly, setFly] = useState<Fly>(null)
  const [taskView, setTaskView] = useState(false)
  const [locked, setLocked] = useState(false)
  const closeFly = useCallback(() => setFly(null), [])
  useFlyoutDismiss(fly !== null, closeFly)

  const shortcuts: DesktopIconDef[] = [
    { id: 'bin', label: 'Recycle Bin', icon: APP_ICONS.bin, onOpen: () => os.open('explorer', { path: RECYCLE_BIN }) },
    { id: 'edge', label: 'Microsoft Edge', icon: APP_ICONS.edge, onOpen: () => os.open('browser') },
    { id: 'pc', label: 'This PC', icon: APP_ICONS.pc, onOpen: () => os.open('explorer', { path: '' }) },
  ]

  const root = modernRootProps(shell)
  return (
    <ModernContext.Provider value={shell}>
      <div className={root.className} style={root.style}>
        <ModernDesktop shortcuts={shortcuts} />
        <WindowLayer Frame={Win11Frame} />
        {taskView && <TaskView onClose={() => setTaskView(false)} />}
        <Taskbar11 fly={fly} setFly={setFly} onTaskView={() => { setFly(null); setTaskView(v => !v) }} onLock={() => { setFly(null); setLocked(true) }} />
        {locked && <LockScreen onUnlock={() => setLocked(false)} />}
        <DisplayFilters />
        <PowerScreen onResume={from => from === 'signout' && setLocked(true)} />
      </div>
    </ModernContext.Provider>
  )
}
