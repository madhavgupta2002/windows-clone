import { useState } from 'react'
import { Icon, useOS, usePref, type AppDef, type AppProps, type OS } from '../../core'
import { ICONS } from '../nt6shared/icons'
import { makeControlPanel, useWallpaper } from '../nt6shared/shared'

export const WELCOME_PREF = 'vista.welcomeAtStartup'

interface Task {
  label: string
  icon: string
  text: string
  run: (os: OS) => void
}

const soon = (title: string) => (os: OS) => os.alert(title, `${title} is not available in this simulation.`, 'info')

const TASKS: Task[] = [
  { label: 'View computer details', icon: ICONS.computer, text: 'See details about your computer and the edition of Windows you are running.', run: os => os.open('about') },
  { label: 'Transfer files and settings', icon: ICONS.documents, text: 'Copy files and settings from your old computer with Windows Easy Transfer.', run: soon('Windows Easy Transfer') },
  { label: 'Add new users', icon: ICONS.user, text: 'Give everyone who uses this computer their own account.', run: soon('User Accounts') },
  { label: 'Connect to the Internet', icon: ICONS.network, text: 'Set up a wireless, broadband or dial-up connection.', run: os => os.open('browser') },
  { label: 'Personalize Windows', icon: ICONS.display, text: 'Change the desktop background, colors and screen saver.', run: os => os.open('vista-personalize') },
  { label: 'Windows Ultimate Extras', icon: ICONS.cards, text: 'Discover extra programs and services for Windows Vista Ultimate.', run: soon('Windows Ultimate Extras') },
  { label: "What's new in Windows Vista", icon: ICONS.help, text: 'Learn about Aero, Start Search, Windows Sidebar and more.', run: os => os.alert("What's new", 'Aero glass, instant search in the Start menu, Windows Sidebar gadgets, and a brand new look — all here.', 'info') },
  { label: 'Control Panel', icon: ICONS.controlPanel, text: 'Change settings and customize the functionality of this computer.', run: os => os.open('vista-cpanel') },
]

/** Welcome Center: computer summary + "Get started with Windows" tasks. */
function WelcomeCenter(_props: AppProps) {
  const os = useOS()
  const [atStartup, setAtStartup] = usePref(WELCOME_PREF, true)
  const [sel, setSel] = useState(0)
  const task = TASKS[sel]
  return (
    <div className="app app-welcome">
      <div className="welcome-head">
        <Icon src={ICONS.computer} size={48} />
        <div>
          <h1>Windows Vista™ Ultimate</h1>
          <p>Processor: Genuine Intel® Core™2 CPU 2.13GHz &nbsp;·&nbsp; Memory: 2.00 GB &nbsp;·&nbsp; Graphics: Aero-capable GPU</p>
          <button className="link" onClick={() => os.open('about')}>Show more details</button>
        </div>
      </div>
      <div className="welcome-section">Get started with Windows</div>
      <div className="welcome-grid">
        {TASKS.map((t, i) => (
          <button key={t.label} className={`welcome-task${i === sel ? ' selected' : ''}`} onClick={() => setSel(i)} onDoubleClick={() => t.run(os)}>
            <Icon src={t.icon} size={32} /><span>{t.label}</span>
          </button>
        ))}
      </div>
      <div className="welcome-detail">
        <Icon src={task.icon} size={32} />
        <div>
          <b>{task.label}</b>
          <p>{task.text}</p>
          <button className="btn" onClick={() => task.run(os)}>Open</button>
        </div>
      </div>
      <label className="welcome-foot">
        <input type="checkbox" checked={atStartup} onChange={e => setAtStartup(e.target.checked)} /> Run at startup
      </label>
    </div>
  )
}

/** Personalization → Desktop Background. */
function Personalize({ winId }: AppProps) {
  const os = useOS()
  const { wallpapers, wallpaper, setWallpaper } = useWallpaper()
  const [original] = useState(wallpaper)
  return (
    <div className="app app-personalize">
      <h2>Choose a desktop background</h2>
      <p>Click a picture to make it your desktop background.</p>
      <div className="personalize-grid">
        {wallpapers.map(w => (
          <button key={w.id} className={`personalize-thumb${w.id === wallpaper ? ' selected' : ''}`} onClick={() => setWallpaper(w.id)}>
            <span style={{ background: w.css }} />
            {w.name}
          </button>
        ))}
      </div>
      <div className="personalize-buttons">
        <button className="btn" onClick={() => os.close(winId)}>OK</button>
        <button className="btn" onClick={() => { setWallpaper(original); os.close(winId) }}>Cancel</button>
      </div>
    </div>
  )
}

const ControlPanel = makeControlPanel(
  [
    { id: 'system', label: 'System and Maintenance', icon: ICONS.computer, description: 'Get started with Windows · View basic information', run: os => os.open('vista-welcome') },
    { id: 'security', label: 'Security', icon: ICONS.shield, description: 'Check for updates · Check this computer\'s security status', run: soon('Windows Security Center') },
    { id: 'net', label: 'Network and Internet', icon: ICONS.network, description: 'View network status and tasks', run: os => os.open('browser') },
    { id: 'appearance', label: 'Appearance and Personalization', icon: ICONS.display, description: 'Change desktop background · Customize colors', run: os => os.open('vista-personalize') },
    { id: 'hardware', label: 'Hardware and Sound', icon: ICONS.speaker, description: 'Play CDs or other media automatically', run: soon('Hardware and Sound') },
    { id: 'programs', label: 'Programs', icon: ICONS.cards, description: 'Uninstall a program · Change startup programs', run: soon('Programs and Features') },
    { id: 'users', label: 'User Accounts and Family Safety', icon: ICONS.user, description: 'Add or remove user accounts', run: soon('User Accounts') },
    { id: 'ease', label: 'Ease of Access', icon: ICONS.help, description: 'Let Windows suggest settings', run: soon('Ease of Access Center') },
  ],
  'Pick a category',
)

export const VISTA_EXTRA_APPS: AppDef[] = [
  { id: 'vista-welcome', title: 'Welcome Center', icon: ICONS.welcome, component: WelcomeCenter, width: 640, height: 470, single: true },
  { id: 'vista-personalize', title: 'Personalization', icon: ICONS.display, component: Personalize, width: 560, height: 420, single: true },
  { id: 'vista-cpanel', title: 'Control Panel', icon: ICONS.controlPanel, component: ControlPanel, width: 680, height: 460, single: true },
]
