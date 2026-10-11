import {
  BACKGROUNDS, ClassicShell, NtSplash, act, classicApps, classicQuickLaunch, classicSeed, classicStartMenu, desktopIcon, icons, THEME_2000,
  type ClassicConfig, type SplashProps,
} from '../classic'
import { Logon } from './Logon'
import './win2000.css'

const PROFILE = 'C:/Documents and Settings/Administrator'
const DOCS = `${PROFILE}/My Documents`
const DESKTOP = `${PROFILE}/Desktop`
const RECYCLE = 'C:/RECYCLER'

function Splash(props: SplashProps) {
  return <NtSplash {...props} product="2000" edition="Professional" />
}

const config: ClassicConfig = {
  id: 'win2000',
  banner: ['Windows', ' 2000 Professional'],
  bannerStyle: { background: 'linear-gradient(0deg, #000, #0a246a 60%, #3a6ea5)' },
  theme: { ...THEME_2000, '--banner-fg2': '#d4d0c8', '--banner-font': 'bold 16px Tahoma, Arial, sans-serif' },
  about: {
    product: 'Microsoft Windows 2000',
    version: '5.0 (Build 2195: Service Pack 4)',
    copyright: 'Copyright © 1985-2000 Microsoft Corp.',
    extra: 'This product is licensed to:\nAdministrator\n\nPhysical memory available to Windows: 130,544 KB',
  },
  apps: classicApps([], { computerLabel: 'My Computer' }),
  fsSeed: classicSeed({
    windowsDir: 'C:/WINNT', documentsPath: DOCS, desktopPath: DESKTOP, recyclePath: RECYCLE, product: 'Windows 2000 Professional',
    extra: {
      [`${DOCS}/My Pictures`]: null,
      'C:/WINNT/system32/drivers/etc/hosts': '# Copyright (c) 1993-1999 Microsoft Corp.\r\n\r\n127.0.0.1       localhost\r\n',
      'C:/boot.ini': '[boot loader]\r\ntimeout=30\r\ndefault=multi(0)disk(0)rdisk(0)partition(1)\\WINNT\r\n[operating systems]\r\nmulti(0)disk(0)rdisk(0)partition(1)\\WINNT="Microsoft Windows 2000 Professional" /fastdetect\r\n',
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
    promptLabel: 'Command Prompt',
    programs: [{ label: 'Administrative Tools', icon: icons.controlPanel, children: [
      { label: 'Computer Management', icon: icons.computer, action: act.notAvailable('Computer Management') },
      { label: 'Event Viewer', icon: icons.find, action: act.notAvailable('Event Viewer') },
      { label: 'Services', icon: icons.settings, action: act.notAvailable('Services') },
    ] }],
    settingsExtra: [{ label: 'Network and Dial-up Connections', icon: icons.network, action: act.notAvailable('Network and Dial-up Connections') }],
  }),
  quickLaunch: classicQuickLaunch(),
  backgrounds: BACKGROUNDS,
  Splash,
  Logon,
  trayVolume: true,
  shutDown: {
    style: 'dropdown',
    prompt: 'What do you want the computer to do?',
    options: [
      { id: 'logoff', label: 'Log off Administrator', description: 'Ends your session, leaving the computer running on full power.' },
      { id: 'shutdown', label: 'Shut down', description: 'Ends your session and shuts down Windows so that you can safely turn off power.' },
      { id: 'restart', label: 'Restart', description: 'Ends your session, shuts down Windows, and starts Windows again.' },
      { id: 'standby', label: 'Stand by', description: 'Maintains your session, keeping the computer running on low power with data still in memory.' },
    ],
  },
  safeStyle: 'nt',
}

export default function Shell() {
  return <ClassicShell config={config} />
}
