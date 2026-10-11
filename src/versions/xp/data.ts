import type { AboutInfo, FsSeed, WorkArea } from '../../core'
import type { Wallpaper } from '../nt6shared/shared'

export const USER_HOME = 'C:/Documents and Settings/User'
export const DOCS = `${USER_HOME}/My Documents`
export const DESKTOP_DIR = `${USER_HOME}/Desktop`
export const RECYCLE_DIR = 'C:/RECYCLER'
export const TASKBAR_H = 30
export const WORK_AREA: WorkArea = { top: 0, left: 0, right: 0, bottom: TASKBAR_H }

export const ABOUT: AboutInfo = {
  product: 'Microsoft Windows XP',
  version: 'Version 5.1 (Build 2600.xpsp_sp2_rtm.040803-2158 : Service Pack 2)',
  copyright: 'Copyright © 1985-2001 Microsoft Corporation',
  extra: 'This product is licensed to: User. Physical memory available to Windows: 523,760 KB',
}

export const SEED: FsSeed = {
  'C:/boot.ini': '[boot loader]\ntimeout=30\ndefault=multi(0)disk(0)rdisk(0)partition(1)\\WINDOWS\n[operating systems]\nmulti(0)disk(0)rdisk(0)partition(1)\\WINDOWS="Microsoft Windows XP Professional" /fastdetect\n',
  'C:/AUTOEXEC.BAT': '',
  'C:/CONFIG.SYS': '',
  [RECYCLE_DIR]: null,
  [`${DOCS}/My Pictures/Sample Pictures`]: null,
  [`${DOCS}/My Music/Sample Music`]: null,
  [`${DOCS}/My eBooks`]: null,
  [`${DOCS}/readme.txt`]: 'Welcome to Windows XP!\r\n\r\nThis is your My Documents folder. Double-click a text file to open it in Notepad.\r\n',
  [`${DOCS}/Shopping list.txt`]: '- Milk\r\n- Eggs\r\n- A blank CD-R spindle\r\n- New mouse pad\r\n',
  [`${DOCS}/Homework.txt`]: 'Book report: due Friday.\r\nRemember to print it before the bus comes.\r\n',
  [`${DESKTOP_DIR}/Notes.txt`]: 'Things to do:\r\n* Update antivirus definitions\r\n* Burn a mix CD\r\n* Defragment the hard drive\r\n',
  [`${USER_HOME}/Favorites/MSN.com.url`]: '[InternetShortcut]\r\nURL=http://www.msn.com/\r\n',
  [`${USER_HOME}/Start Menu/Programs`]: null,
  'C:/Documents and Settings/All Users/Shared Documents': null,
  'C:/Program Files/Internet Explorer/iexplore.exe': '',
  'C:/Program Files/Outlook Express': null,
  'C:/Program Files/Windows Media Player': null,
  'C:/Program Files/Movie Maker': null,
  'C:/WINDOWS/win.ini': '; for 16-bit app support\r\n[fonts]\r\n[extensions]\r\n[mci extensions]\r\n[files]\r\n[Mail]\r\nMAPI=1\r\n',
  'C:/WINDOWS/system.ini': '; for 16-bit app support\r\n[386Enh]\r\nwoafont=dosapp.fon\r\n[drivers]\r\nwave=mmdrv.dll\r\ntimer=timer.drv\r\n',
  'C:/WINDOWS/WindowsUpdate.log': '2004-08-04 12:00:01  Agent  * WSUS server: <NULL>\r\n2004-08-04 12:00:02  Agent  * Found 0 updates\r\n',
  'C:/WINDOWS/Web/Wallpaper': null,
  'C:/WINDOWS/system32/drivers/etc/hosts': '# Copyright (c) 1993-1999 Microsoft Corp.\r\n#\r\n127.0.0.1       localhost\r\n',
}

const clouds = [
  [18, 22, 16, 5], [32, 18, 10, 4], [62, 14, 20, 6], [80, 26, 14, 4], [48, 32, 12, 3.5], [8, 36, 10, 3],
].map(([x, y, w, h]) => `radial-gradient(ellipse ${w}% ${h}% at ${x}% ${y}%, rgba(255,255,255,.92), rgba(255,255,255,.55) 45%, rgba(255,255,255,0) 72%)`)

/** CSS-only wallpapers (no copyrighted photography). */
export const WALLPAPERS: Wallpaper[] = [
  {
    id: 'bliss',
    name: 'Bliss',
    css: [
      'radial-gradient(ellipse 125% 58% at 32% 112%, #2f7d13 0%, #47a01f 50%, #6cc23a 90%, #8bd552 97.5%, rgba(139,213,82,0) 98.5%)',
      'radial-gradient(ellipse 80% 42% at 96% 108%, #2d6f10 0%, #4b9a22 70%, #6db73a 97.5%, rgba(109,183,58,0) 98.5%)',
      ...clouds,
      'linear-gradient(#1855c7 0%, #3a80e0 28%, #78b2ef 52%, #b8daf8 66%, #d9ecfb 74%)',
    ].join(', '),
  },
  {
    id: 'azul',
    name: 'Azul',
    css: 'radial-gradient(ellipse 60% 40% at 70% 35%, rgba(150,210,255,.75), transparent 70%), linear-gradient(160deg, transparent 40%, rgba(120,190,255,.35) 50%, transparent 60%), radial-gradient(ellipse at 40% 60%, #1f6fd0, #0a3c8f 60%, #041d4d)',
  },
  {
    id: 'autumn',
    name: 'Autumn',
    css: 'radial-gradient(circle at 25% 30%, #ffd27a 0 6%, transparent 7%), radial-gradient(circle at 70% 60%, #f39a2c 0 9%, transparent 10%), radial-gradient(circle at 45% 80%, #c7461a 0 7%, transparent 8%), radial-gradient(circle at 85% 20%, #e8b33c 0 5%, transparent 6%), linear-gradient(135deg, #5a2c0e, #a8521b 50%, #d9822b)',
  },
  {
    id: 'tulips',
    name: 'Red Tulips',
    css: 'radial-gradient(ellipse 6% 10% at 20% 60%, #ff3b3b 60%, transparent 62%), radial-gradient(ellipse 6% 10% at 45% 55%, #ff2b4a 60%, transparent 62%), radial-gradient(ellipse 6% 10% at 72% 62%, #ff4b2b 60%, transparent 62%), linear-gradient(#7cc4ff 0 45%, #2f8a1d 45% 100%)',
  },
  { id: 'none', name: '(None)', css: '#004e98' },
]

export const balloonText = {
  title: 'Take a tour of Windows XP',
  text: 'To learn about the exciting new features in Windows XP, click here. To view the tour later, click All Programs on the Start menu, and then click Accessories.',
}
