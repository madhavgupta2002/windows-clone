import {
  BACKGROUNDS, ClassicShell, CloudSplash, act, classicApps, classicQuickLaunch, classicSeed, classicStartMenu, desktopIcon, icons, THEME_2000,
  type ClassicConfig, type SplashProps,
} from '../classic'
import { SystemRestoreApp } from './SystemRestore'
import './winme.css'

const DOCS = 'C:/My Documents'
const DESKTOP = 'C:/WINDOWS/Desktop'
const RECYCLE = 'C:/RECYCLED'

function Splash(props: SplashProps) {
  return <CloudSplash {...props} edition="Me" small="Millennium Edition" sky="linear-gradient(#0a246a, #3a6ea5 55%, #a6caf0)" />
}

const config: ClassicConfig = {
  id: 'winme',
  banner: ['Windows', ' Me'],
  bannerStyle: { background: 'linear-gradient(0deg, #0a246a, #3a6ea5 60%, #a6caf0)' },
  theme: THEME_2000,
  about: {
    product: 'Microsoft Windows Millennium Edition',
    version: '4.90.3000',
    copyright: 'Copyright © 1981-2000 Microsoft Corp.',
    extra: 'This product is licensed to:\nWindows Clone User\n\nPhysical Memory Available to Windows: 65,536 KB',
  },
  apps: classicApps([SystemRestoreApp]),
  fsSeed: classicSeed({
    windowsDir: 'C:/WINDOWS', documentsPath: DOCS, desktopPath: DESKTOP, recyclePath: RECYCLE, product: 'Windows Me',
    extra: {
      'C:/My Documents/My Pictures': null,
      'C:/My Documents/My Music': null,
      'C:/My Documents/My Videos': null,
      'C:/_RESTORE': null,
    },
  }),
  documentsPath: DOCS,
  desktopPath: DESKTOP,
  recyclePath: RECYCLE,
  myComputerLabel: 'My Computer',
  desktopIcons: [
    desktopIcon.myDocuments(DOCS),
    desktopIcon.myComputer(),
    desktopIcon.network('My Network Places'),
    desktopIcon.recycleBin(RECYCLE),
    desktopIcon.internetExplorer(),
    { id: 'connect', label: 'Connect to the Internet', icon: icons.network, action: act.open('browser') },
  ],
  startMenu: classicStartMenu({
    documentsPath: DOCS,
    top: [{ label: 'Windows Update', icon: icons.update, action: act.open('browser', { url: 'https://windowsupdate.microsoft.com' }) }],
    findLabel: 'Search',
    findInternet: true,
    logOffUser: 'User',
    systemTools: [{ label: 'System Restore', icon: icons.restore, action: act.open('restore') }],
    programs: [{ label: 'Windows Media Player', icon: icons.speaker, action: act.notAvailable('Windows Media Player') }],
    settingsExtra: [{ label: 'Dial-Up Networking', icon: icons.network, action: act.notAvailable('Dial-Up Networking') }],
  }),
  quickLaunch: classicQuickLaunch(),
  backgrounds: [
    ...BACKGROUNDS,
    { name: 'Millennium', css: 'radial-gradient(ellipse 80% 60% at 70% 40%, #a6caf0, #3a6ea5 55%, #0a246a)' },
  ],
  Splash,
  trayVolume: true,
  shutDown: {
    style: 'dropdown',
    prompt: 'What do you want the computer to do?',
    options: [
      { id: 'standby', label: 'Stand by', description: 'Maintains your session, keeping the computer running on low power.' },
      { id: 'shutdown', label: 'Shut down', description: 'Ends your session and shuts down Windows so that you can safely turn off power.' },
      { id: 'restart', label: 'Restart', description: 'Ends your session, shuts down Windows, and starts Windows again.' },
    ],
  },
  safeStyle: '9x',
}

export default function Shell() {
  return <ClassicShell config={config} />
}
