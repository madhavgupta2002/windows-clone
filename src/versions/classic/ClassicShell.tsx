import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { OSProvider, WindowLayer, useOS, usePref, type WorkArea } from '../../core'
import { ClassicContext, type ClassicContextValue } from './context'
import { Desktop } from './Desktop'
import { SHELL_APPS } from './dialogs'
import { ClassicFrame } from './Frame'
import { ClosingScreen, DosScreen, SafeScreen, ShutDownDialog, StandbyScreen } from './Screens'
import { TASKBAR_HEIGHT, Taskbar } from './Taskbar'
import type { ClassicConfig, ShellCommands, ShutDownChoice } from './types'
import './classic.css'

const WORK_AREA: WorkArea = { top: 0, left: 0, right: 0, bottom: TASKBAR_HEIGHT }

type Phase = 'boot' | 'logon' | 'desktop' | 'closing' | 'safe' | 'standby' | 'dos'

/**
 * The shared Windows 95 / 98 / ME / 2000 shell. Each version passes a ClassicConfig
 * (branding, theme variables, icons, Start menu tree, extras).
 */
export function ClassicShell({ config }: { config: ClassicConfig }) {
  const apps = useMemo(() => [...config.apps, ...SHELL_APPS], [config.apps])
  return (
    <OSProvider
      versionId={config.id}
      about={config.about}
      apps={apps}
      fsSeed={config.fsSeed}
      documentsPath={config.documentsPath}
      workArea={WORK_AREA}
      fileAssociations={{ htm: 'browser', html: 'browser', url: 'browser' }}
    >
      <ClassicRoot config={config} />
    </OSProvider>
  )
}

function ClassicRoot({ config }: { config: ClassicConfig }) {
  const os = useOS()
  const { Splash, Logon } = config
  const [phase, setPhase] = useState<Phase>('boot')
  const [shutDownOpen, setShutDownOpen] = useState(false)
  const [background, setBackground] = usePref(`${config.id}.background`, 0)
  /** Where to go once the "shutting down" screen is done. */
  const afterClosing = useRef<Phase>('safe')
  /** Startup apps already launched for the current boot. */
  const booted = useRef(false)

  const closeTo = useCallback((next: Phase) => {
    afterClosing.current = next
    setPhase('closing')
  }, [])

  const shell: ShellCommands = useMemo(() => ({
    openRun: () => { os.open('run') },
    openShutDown: () => setShutDownOpen(true),
    showDesktop: () => os.windows.forEach(w => os.minimize(w.id)),
    restart: () => closeTo('boot'),
    logOff: () => closeTo(Logon ? 'logon' : 'boot'),
    openMyComputer: () => { os.open('explorer', { path: '', title: config.myComputerLabel, computerLabel: config.myComputerLabel }) },
    openPath: (path, title) => { os.open('explorer', { path, ...(title ? { title } : {}) }) },
  }), [os, config.myComputerLabel, closeTo, Logon])

  const choose = (c: ShutDownChoice) => {
    setShutDownOpen(false)
    switch (c) {
      case 'shutdown': closeTo('safe'); break
      case 'restart': closeTo('boot'); break
      case 'logoff': shell.logOff(); break
      case 'standby': setPhase('standby'); break
      case 'dos': os.closeAll(); setPhase('dos'); break
    }
  }

  const finishBoot = useCallback(() => setPhase(p => (p === 'boot' ? (Logon ? 'logon' : 'desktop') : p)), [Logon])
  const finishLogon = useCallback(() => setPhase(p => (p === 'logon' ? 'desktop' : p)), [])
  const finishClosing = useCallback(() => {
    os.closeAll()
    setPhase(afterClosing.current)
  }, [os])

  // Startup apps (Welcome screens…) once per boot / logon.
  useEffect(() => {
    if (phase === 'boot' || phase === 'logon') booted.current = false
    if (phase !== 'desktop' || booted.current) return
    booted.current = true
    const { startupApps = [] } = config
    const ids = typeof startupApps === 'function' ? startupApps() : startupApps
    ids.forEach(id => os.open(id))
  }, [phase, config, os])

  const ctxValue: ClassicContextValue = useMemo(
    () => ({ config, shell, background, setBackground }),
    [config, shell, background, setBackground],
  )

  return (
    <ClassicContext.Provider value={ctxValue}>
      <div className={`os-root os-classic os-${config.id}`} style={config.theme as CSSProperties}>
        <Desktop />
        <WindowLayer Frame={ClassicFrame} />
        <Taskbar />
        {shutDownOpen && <ShutDownDialog config={config} onChoose={choose} onCancel={() => setShutDownOpen(false)} />}
        {phase === 'boot' && <Splash onDone={finishBoot} />}
        {phase === 'logon' && Logon && <Logon onDone={finishLogon} onShutDown={() => closeTo('safe')} />}
        {phase === 'closing' && <ClosingScreen nt={config.safeStyle === 'nt'} onDone={finishClosing} />}
        {phase === 'safe' && <SafeScreen nt={config.safeStyle === 'nt'} onExit={os.exit} onRestart={() => setPhase('boot')} />}
        {phase === 'standby' && <StandbyScreen onWake={() => setPhase('desktop')} />}
        {phase === 'dos' && (
          <DosScreen product={config.about.product} version={config.about.version} onExit={() => closeTo('boot')} onLauncher={os.exit} />
        )}
      </div>
    </ClassicContext.Provider>
  )
}
