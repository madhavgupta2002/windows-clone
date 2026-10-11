import { useEffect, useState } from 'react'
import { OSProvider, WindowLayer, coreApps, pickApps, useOS, type AppProps, type FsSeed } from '../../core'
import { WIN7_APPS } from './apps'
import { Desktop } from './Desktop'
import { Win7Frame } from './Frame'
import { ICONS } from './icons'
import type { PowerAction } from './StartMenu'
import { PATHS, Toasts, USER, Win7Provider, useWin7 } from './shell'
import { Taskbar } from './Taskbar'
import { Wallpaper } from './Wallpaper'
import './win7.css'

const WELCOME = `Welcome to your Windows 7 web desktop!

GETTING STARTED
• Double-click a desktop icon to open it.
• Drag icons to rearrange the desktop.
• Drag an empty desktop area to select multiple icons.
• Right-click the desktop for view, sorting, and personalization options.
• Open programs using the Start menu or its search box.

WINDOWS
Drag a title bar to move a window. Drag any edge or corner to resize it.
Double-click a title bar to maximize or restore.
Aero Snap: drag a window to the top, left or right edge of the screen.
Click a taskbar button to minimize or restore its window.
The narrow button at the far right shows the desktop.

SHORTCUTS
Windows key / Ctrl+Esc: Start menu
Alt+F4: close the focused window
F2: rename, Delete: recycle, Ctrl+A: select all, F5: refresh

This is a self-contained web simulation, not an actual operating system.
`

const SEED: FsSeed = {
  [`${PATHS.desktop}/Text Document.txt`]: WELCOME,
  [`${PATHS.documents}/My Notes.txt`]: 'My Notes\n========\n\nA little space for your ideas.\n',
  [`${PATHS.documents}/Projects/Read Me.txt`]: 'Project ideas\n\n1. Build something useful.\n2. Make it beautiful.\n3. Share it with the world.\n',
  [PATHS.downloads]: null,
  [PATHS.pictures]: null,
  [PATHS.music]: null,
  [`${USER}/Favorites`]: null,
  [PATHS.recycle]: null,
  'C:/Program Files/Internet Explorer': null,
  'C:/Program Files/Windows Media Player': null,
  'C:/Windows/System32/drivers/etc/hosts': '# Copyright (c) 1993-2009 Microsoft Corp.\n#\n127.0.0.1       localhost\n::1             localhost\n',
  'C:/Windows/win.ini': '; for 16-bit app support\n[fonts]\n[extensions]\n[mci extensions]\n[files]\n[Mail]\nMAPI=1\n',
}

/** Core Explorer with Windows 7 icons and labels as default args. */
const CoreExplorer = coreApps.explorer.component
const EXPLORER_DEFAULTS = { folderIcon: ICONS.folder, fileIcon: ICONS.text, driveIcon: ICONS.computer, computerIcon: ICONS.computer, computerLabel: 'Computer' }
function Explorer7({ winId, args }: AppProps) {
  return <CoreExplorer winId={winId} args={{ ...EXPLORER_DEFAULTS, ...args }} />
}

const APPS = pickApps(
  {
    explorer: { title: 'Windows Explorer', icon: ICONS.folder, width: 760, height: 490, component: Explorer7 },
    notepad: { icon: ICONS.notepad, width: 650, height: 440 },
    calculator: { icon: ICONS.calculator, width: 228, height: 322 },
    browser: { title: 'Internet Explorer', icon: ICONS.browser, width: 820, height: 560 },
    paint: { icon: ICONS.paint, width: 720, height: 520 },
    minesweeper: { icon: ICONS.mines },
    msgbox: { icon: ICONS.windows },
    about: { title: 'About Windows', icon: ICONS.computer },
  },
  WIN7_APPS,
)

const ABOUT = {
  product: 'Windows 7 Ultimate',
  version: 'Version 6.1 (Build 7601: Service Pack 1)',
  copyright: 'A web recreation. Windows is a trademark of Microsoft Corporation.',
  extra: 'This product is licensed to: User',
}

const WORK_AREA = { top: 0, left: 0, right: 0, bottom: 40 }

type Phase = 'boot' | 'logon' | 'desktop' | 'shutdown' | 'restart' | 'sleep'

function Win7() {
  const os = useOS()
  const w7 = useWin7()
  const [phase, setPhase] = useState<Phase>('boot')
  const [peek, setPeek] = useState(false)

  useEffect(() => {
    if (phase === 'boot') { const t = setTimeout(() => setPhase('logon'), 2600); return () => clearTimeout(t) }
    if (phase === 'shutdown') { const t = setTimeout(() => os.exit(), 1800); return () => clearTimeout(t) }
    if (phase === 'restart') { const t = setTimeout(() => setPhase('boot'), 1800); return () => clearTimeout(t) }
  }, [phase, os])

  const power = (a: PowerAction) => {
    if (a === 'sleep') { setPhase('sleep'); return }
    os.closeAll()
    setPhase(a === 'logoff' ? 'logon' : a)
  }

  return (
    <div className={`os-root os-win7${peek ? ' w7-peek' : ''}`} data-theme={w7.theme}>
      <Wallpaper />
      {phase === 'desktop' && (
        <>
          <Desktop />
          <WindowLayer Frame={Win7Frame} />
          <Taskbar onPower={power} onPeek={setPeek} />
        </>
      )}
      {phase === 'boot' && (
        <div className="w7-screen w7-boot" onClick={() => setPhase('logon')}>
          <div className="w7-boot-logo"><img src={ICONS.windows} alt="" /></div>
          <div className="w7-boot-text">Starting Windows</div>
        </div>
      )}
      {phase === 'logon' && (
        <div className="w7-screen w7-logon">
          <button className="w7-logon-user" onClick={() => { setPhase('desktop'); w7.toast('Welcome') }} autoFocus>
            <span className="w7-logon-pic"><img src={ICONS.user} alt="" /></span>
            <span className="w7-logon-name">User</span>
            <span className="w7-logon-hint">Click to log on</span>
          </button>
          <div className="w7-logon-brand"><img src={ICONS.windows} alt="" /> Windows 7 <small>Ultimate</small></div>
          <button className="w7-logon-power" title="Shut down" onClick={() => setPhase('shutdown')}>⏻</button>
        </div>
      )}
      {(phase === 'shutdown' || phase === 'restart') && (
        <div className="w7-screen w7-logon">
          <div className="w7-busy"><span className="w7-spinner" />{phase === 'shutdown' ? 'Shutting down...' : 'Restarting...'}</div>
        </div>
      )}
      <Toasts />
      {phase === 'sleep' && <div className="w7-screen w7-sleep" onClick={() => setPhase('logon')}>Click to wake</div>}
    </div>
  )
}

export default function Shell() {
  return (
    <OSProvider versionId="win7" about={ABOUT} apps={APPS} fsSeed={SEED} documentsPath={PATHS.documents} workArea={WORK_AREA}>
      <Win7Provider>
        <Win7 />
      </Win7Provider>
    </OSProvider>
  )
}
