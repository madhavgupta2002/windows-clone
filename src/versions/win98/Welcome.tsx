import { useState } from 'react'
import { Icon, useOS, usePref, type AppDef, type AppProps, type OS } from '../../core'
import { icons, readPref } from '../classic'

export const WELCOME_PREF = 'win98.showWelcome'

interface Topic {
  id: string
  label: string
  color: string
  title: string
  text: string
  run: (os: OS) => void
}

const TOPICS: Topic[] = [
  {
    id: 'register', label: 'Register Now', color: '#e33', title: 'Register Now',
    text: 'Register your copy of Windows 98 to receive product information, updates and special offers.',
    run: os => os.alert('Registration Wizard', 'Thank you! Your copy of Windows 98 has been registered (well, pretend it has).', 'info'),
  },
  {
    id: 'connect', label: 'Connect to the Internet', color: '#3b3', title: 'Connect to the Internet',
    text: 'Set up your Internet connection and start browsing the Web with Internet Explorer.',
    run: os => { os.open('browser') },
  },
  {
    id: 'discover', label: 'Discover Windows 98', color: '#36f', title: 'Discover Windows 98',
    text: 'Take a tour of the new features: the web-integrated desktop, Quick Launch, and much more.',
    run: os => { os.open('about') },
  },
  {
    id: 'maintain', label: 'Maintain Your Computer', color: '#fd2', title: 'Maintain Your Computer',
    text: 'Keep your computer running at its best with Maintenance Wizard, Disk Defragmenter and ScanDisk.',
    run: os => os.alert('Maintenance Wizard', 'Your computer is in great shape. Nothing to do!', 'info'),
  },
]

/** The "Welcome to Windows 98" screen shown at startup. */
function Welcome({ winId }: AppProps) {
  const os = useOS()
  const [hover, setHover] = useState<Topic | null>(null)
  const [show, setShow] = usePref(WELCOME_PREF, true)
  return (
    <div className="app win98-welcome">
      <header>
        <span>Welcome to</span>
        <b>Windows<i>98</i></b>
      </header>
      <div className="win98-welcome-main">
        <nav>
          {TOPICS.map(t => (
            <button key={t.id} type="button" onPointerEnter={() => setHover(t)} onClick={() => t.run(os)}>
              <span className="win98-welcome-dot" style={{ background: t.color }} />
              {t.label}
            </button>
          ))}
        </nav>
        <section>
          {hover ? (
            <>
              <h2>{hover.title}</h2>
              <p>{hover.text}</p>
            </>
          ) : (
            <>
              <Icon src={icons.welcome} size={32} />
              <p>Point to a topic on the left to learn more. Click it to get started.</p>
            </>
          )}
        </section>
      </div>
      <footer>
        <label>
          <input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} />
          Show this screen each time Windows 98 starts.
        </label>
        <button type="button" className="btn" onClick={() => os.close(winId)}>Close</button>
      </footer>
    </div>
  )
}

export const WelcomeApp: AppDef = {
  id: 'welcome98', title: 'Welcome to Windows 98', icon: icons.welcome, component: Welcome, width: 600, height: 380, resizable: false, single: true,
}

export const welcomeOnStartup = () => (readPref(WELCOME_PREF, true) ? ['welcome98'] : [])
