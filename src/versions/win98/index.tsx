import {
  BACKGROUNDS, ClassicShell, CloudSplash, act, classicApps, classicQuickLaunch, classicSeed, classicStartMenu, desktopIcon, icons,
  type ClassicConfig, type SplashProps,
} from '../classic'
import { WelcomeApp, welcomeOnStartup } from './Welcome'
import './win98.css'

const DOCS = 'C:/My Documents'
const DESKTOP = 'C:/WINDOWS/Desktop'
const RECYCLE = 'C:/RECYCLED'

function Splash(props: SplashProps) {
  return <CloudSplash {...props} edition="98" />
}

const config: ClassicConfig = {
  id: 'win98',
  banner: ['Windows', '98'],
  bannerStyle: { background: 'linear-gradient(0deg, #000080, #1084d0)' },
  theme: {
    '--desktop': '#3a6ea5',
    '--title-active': 'linear-gradient(90deg, #000080, #1084d0)',
    '--title-inactive': 'linear-gradient(90deg, #808080, #b5b5b5)',
    '--banner-fg1': '#fff',
    '--banner-fg2': '#fff',
    '--banner-font': 'bold 18px Arial, sans-serif',
  },
  about: {
    product: 'Microsoft Windows 98',
    version: '4.10.1998',
    copyright: 'Copyright © 1981-1998 Microsoft Corp.',
    extra: 'This product is licensed to:\nWindows Clone User\n\nPhysical Memory Available to Windows: 32,768 KB',
  },
  apps: classicApps([WelcomeApp]),
  fsSeed: classicSeed({
    windowsDir: 'C:/WINDOWS', documentsPath: DOCS, desktopPath: DESKTOP, recyclePath: RECYCLE, product: 'Windows 98',
    extra: {
      'C:/WINDOWS/Favorites/Links': null,
      'C:/My Documents/My Pictures': null,
      'C:/Program Files/Outlook Express/MSIMN.EXE': 'MZ',
    },
  }),
  documentsPath: DOCS,
  desktopPath: DESKTOP,
  recyclePath: RECYCLE,
  myComputerLabel: 'My Computer',
  desktopIcons: [
    desktopIcon.myComputer(),
    desktopIcon.myDocuments(DOCS),
    desktopIcon.internetExplorer(),
    desktopIcon.network(),
    desktopIcon.recycleBin(RECYCLE),
    desktopIcon.outlook(),
    { id: 'online', label: 'Online Services', icon: icons.folder, action: act.alert('Online Services', 'No online services are installed.', 'info') },
  ],
  startMenu: classicStartMenu({
    documentsPath: DOCS,
    top: [{ label: 'Windows Update', icon: icons.update, action: act.open('browser', { url: 'https://windowsupdate.microsoft.com' }) }],
    favorites: true,
    findInternet: true,
    logOffUser: 'User',
    accessories: [{ label: 'Welcome To Windows', icon: icons.welcome, action: act.open('welcome98') }],
    settingsExtra: [
      { label: 'Folder Options...', icon: icons.folder, action: act.notAvailable('Folder Options') },
      { label: 'Active Desktop', icon: icons.display, children: [
        { label: 'View As Web Page', checked: false, action: act.notAvailable('Active Desktop') },
        { label: 'Customize my Desktop...', action: act.open('display') },
      ] },
      { label: 'Windows Update...', icon: icons.update, action: act.open('browser') },
    ],
  }),
  quickLaunch: classicQuickLaunch(true),
  desktopMenuExtra: [
    { label: 'Active Desktop', children: [
      { label: 'View As Web Page', checked: false, action: act.notAvailable('Active Desktop') },
      { separator: true },
      { label: 'Customize my Desktop...', action: act.open('display') },
    ] },
    { separator: true },
  ],
  backgrounds: BACKGROUNDS,
  Splash,
  startupApps: welcomeOnStartup,
  trayVolume: true,
  shutDown: {
    style: 'radios',
    prompt: 'What do you want the computer to do?',
    options: [
      { id: 'standby', label: 'Stand by' },
      { id: 'shutdown', label: 'Shut down' },
      { id: 'restart', label: 'Restart' },
      { id: 'dos', label: 'Restart in MS-DOS mode' },
    ],
  },
  safeStyle: '9x',
}

export default function Shell() {
  return <ClassicShell config={config} />
}
