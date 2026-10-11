import { useState } from 'react'
import { Icon, useOS, usePref, type AppDef, type AppProps } from '../../core'
import { icons, readPref } from '../classic'

const TIPS = [
  'To open a file or an application from Windows Explorer, double-click it.',
  'You can start programs quickly by clicking the Start button and then pointing to Programs.',
  'To see what\'s on a floppy disk or on your hard disk, double-click the My Computer icon on your desktop.',
  'If you want to change the wallpaper, right-click the desktop and then click Properties.',
  'To run a program by typing its name, click the Start button, then click Run.',
  'You can switch between running programs by clicking their buttons on the taskbar.',
  'Deleted files go to the Recycle Bin. Right-click it and choose Empty Recycle Bin to remove them for good.',
]

export const WELCOME_PREF = 'win95.showWelcome'

/** The "Welcome to Windows 95" tip-of-the-day dialog shown at startup. */
function Welcome({ winId }: AppProps) {
  const os = useOS()
  const [tip, setTip] = useState(() => Math.floor(Math.random() * TIPS.length))
  const [show, setShow] = usePref(WELCOME_PREF, true)
  return (
    <div className="app classic-dialog win95-welcome">
      <h1>Welcome to <b>Windows</b><span>95</span></h1>
      <div className="win95-welcome-main">
        <div className="win95-welcome-tip sunken">
          <Icon src={icons.tips} size={32} />
          <div>
            <b>Did you know...</b>
            <p>{TIPS[tip]}</p>
          </div>
        </div>
        <div className="win95-welcome-buttons">
          <button type="button" className="btn" onClick={() => os.alert("What's New", 'Windows 95 brings the Start button, the taskbar, long file names and Plug and Play.', 'info')}>
            <u>W</u>hat&rsquo;s New
          </button>
          <button type="button" className="btn" onClick={() => os.open('browser')}>Online <u>R</u>egistration</button>
          <span style={{ flex: 1 }} />
          <button type="button" className="btn" onClick={() => setTip(t => (t + 1) % TIPS.length)}><u>N</u>ext Tip</button>
          <button type="button" className="btn default" onClick={() => os.close(winId)}>Close</button>
        </div>
      </div>
      <label className="classic-radio">
        <input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} />
        <span><u>S</u>how this Welcome Screen next time you start Windows</span>
      </label>
    </div>
  )
}

export const WelcomeApp: AppDef = {
  id: 'tips', title: 'Welcome', icon: icons.tips, component: Welcome, width: 500, height: 290, resizable: false, single: true,
}

export const welcomeOnStartup = () => (readPref(WELCOME_PREF, true) ? ['tips'] : [])
