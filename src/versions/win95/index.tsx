import {
  BACKGROUNDS, ClassicShell, CloudSplash, act, classicApps, classicSeed, classicStartMenu, desktopIcon, icons,
  type ClassicConfig, type SplashProps,
} from '../classic'
import { WelcomeApp, welcomeOnStartup } from './Welcome'
import './win95.css'

const DOCS = 'C:/My Documents'
const DESKTOP = 'C:/WINDOWS/Desktop'
const RECYCLE = 'C:/RECYCLED'
const PRODUCT = 'Windows 95'

function Splash(props: SplashProps) {
  return <CloudSplash {...props} edition="95" />
}

const config: ClassicConfig = {
  id: 'win95',
  banner: ['Windows', '95'],
  theme: {},
  about: {
    product: 'Microsoft Windows 95',
    version: '4.00.950',
    copyright: 'Copyright © 1981-1995 Microsoft Corp.',
    extra: 'This product is licensed to:\nWindows Clone User\n\nPhysical Memory Available to Windows: 8,192 KB',
  },
  apps: classicApps([WelcomeApp]),
  fsSeed: classicSeed({
    windowsDir: 'C:/WINDOWS', documentsPath: DOCS, desktopPath: DESKTOP, recyclePath: RECYCLE, product: PRODUCT,
    extra: { 'C:/WINDOWS/README.TXT': 'Microsoft Windows 95 README for Microsoft Windows\r\n\r\nThis file contains late-breaking information.\r\n' },
  }),
  documentsPath: DOCS,
  desktopPath: DESKTOP,
  recyclePath: RECYCLE,
  myComputerLabel: 'My Computer',
  desktopIcons: [
    desktopIcon.myComputer(),
    desktopIcon.network(),
    desktopIcon.recycleBin(RECYCLE),
    desktopIcon.internetExplorer('The Internet'),
    { id: 'msn', label: 'The Microsoft Network', icon: icons.msn, action: act.alert('The Microsoft Network', 'Unable to connect to The Microsoft Network.\n\nCheck that your modem is plugged in.', 'warning') },
    { id: 'briefcase', label: 'My Briefcase', icon: icons.briefcase, action: act.folder(DOCS, 'My Briefcase') },
  ],
  startMenu: classicStartMenu({
    documentsPath: DOCS,
    accessories: [{ label: 'Welcome to Windows', icon: icons.tips, action: act.open('tips') }],
  }),
  backgrounds: BACKGROUNDS,
  Splash,
  startupApps: welcomeOnStartup,
  shutDown: {
    style: 'radios',
    prompt: 'Are you sure you want to:',
    okLabel: 'Yes',
    cancelLabel: 'No',
    options: [
      { id: 'shutdown', label: 'Shut down the computer?' },
      { id: 'restart', label: 'Restart the computer?' },
      { id: 'dos', label: 'Restart the computer in MS-DOS mode?' },
      { id: 'logoff', label: 'Close all programs and log on as a different user?' },
    ],
  },
  safeStyle: '9x',
}

export default function Shell() {
  return <ClassicShell config={config} />
}
