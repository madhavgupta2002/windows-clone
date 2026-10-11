import type { AboutInfo, FsSeed, WorkArea } from '../../core'
import type { Wallpaper } from '../nt6shared/shared'

export const USER_HOME = 'C:/Users/User'
export const DOCS = `${USER_HOME}/Documents`
export const DESKTOP_DIR = `${USER_HOME}/Desktop`
export const RECYCLE_DIR = 'C:/$Recycle.Bin'
export const TASKBAR_H = 30
export const WORK_AREA: WorkArea = { top: 0, left: 0, right: 0, bottom: TASKBAR_H }

export const ABOUT: AboutInfo = {
  product: 'Windows Vista™ Ultimate',
  version: 'Version 6.0 (Build 6002: Service Pack 2)',
  copyright: 'Copyright © 2007 Microsoft Corporation. All rights reserved.',
  extra: 'The Windows Vista Ultimate operating system and its user interface are protected by trademark and other pending or existing intellectual property rights.',
}

export const SEED: FsSeed = {
  [RECYCLE_DIR]: null,
  [`${DOCS}/Welcome.txt`]: 'Welcome to Windows Vista!\r\n\r\nYour personal files live in C:\\Users\\User. Use Start Search to find programs and documents fast.\r\n',
  [`${DOCS}/Budget 2007.txt`]: 'Rent ........ 950\r\nUtilities ... 140\r\nGroceries ... 300\r\nNew GPU ..... 249 (for Aero!)\r\n',
  [`${DOCS}/Ideas.txt`]: '- Try every Sidebar gadget\r\n- Set up Windows Mail\r\n- Play Chess Titans\r\n',
  [`${USER_HOME}/Pictures/Sample Pictures`]: null,
  [`${USER_HOME}/Music/Sample Music`]: null,
  [`${USER_HOME}/Videos/Sample Videos`]: null,
  [`${USER_HOME}/Downloads`]: null,
  [`${USER_HOME}/Favorites/Links`]: null,
  [`${USER_HOME}/Contacts`]: null,
  [`${USER_HOME}/Saved Games`]: null,
  [`${DESKTOP_DIR}/Shortcut list.txt`]: 'Win+Tab   Flip 3D\r\nWin+Space Show Sidebar\r\nWin+R     Run\r\n',
  'C:/Users/Public/Public Documents': null,
  'C:/Users/Public/Public Pictures': null,
  'C:/Program Files/Internet Explorer/iexplore.exe': '',
  'C:/Program Files/Windows Sidebar/Gadgets': null,
  'C:/Program Files/Windows Mail': null,
  'C:/Program Files/Windows Photo Gallery': null,
  'C:/Windows/win.ini': '; for 16-bit app support\r\n[fonts]\r\n[extensions]\r\n[mci extensions]\r\n[files]\r\n[Mail]\r\nMAPI=1\r\n',
  'C:/Windows/WindowsUpdate.log': '2009-05-26 09:12:11  Agent  * Found 3 updates\r\n2009-05-26 09:15:40  Agent  * Install: Service Pack 2 (KB948465)\r\n',
  'C:/Windows/System32/drivers/etc/hosts': '# Copyright (c) 1993-2006 Microsoft Corp.\r\n#\r\n127.0.0.1       localhost\r\n::1             localhost\r\n',
  'C:/Windows/Web/Wallpaper': null,
}

/** Aurora-style light ribbons over a deep green/blue field. */
const aurora = (base: string, glow: string, ribbon: string) => [
  `radial-gradient(ellipse 70% 18% at 55% 52%, ${ribbon}, transparent 70%)`,
  `linear-gradient(162deg, transparent 38%, ${glow} 46%, rgba(255,255,255,.35) 49%, ${glow} 52%, transparent 62%)`,
  `linear-gradient(168deg, transparent 50%, ${glow} 56%, transparent 66%)`,
  `linear-gradient(150deg, transparent 26%, rgba(255,255,255,.12) 33%, transparent 40%)`,
  `radial-gradient(ellipse 90% 70% at 70% 30%, ${glow}, transparent 70%)`,
  base,
].join(', ')

export const WALLPAPERS: Wallpaper[] = [
  { id: 'aurora', name: 'Aurora', css: aurora('linear-gradient(135deg, #04140f, #0d3b2b 40%, #0b4f3c 60%, #021009)', 'rgba(70, 220, 160, .38)', 'rgba(190, 255, 220, .45)') },
  { id: 'aurora-blue', name: 'Aurora (Blue)', css: aurora('linear-gradient(135deg, #020a1c, #0b2f5c 45%, #12497e 60%, #020814)', 'rgba(80, 170, 255, .38)', 'rgba(200, 235, 255, .45)') },
  { id: 'dusk', name: 'Dusk', css: aurora('linear-gradient(135deg, #12030f, #4a0f3a 45%, #8a2a4a 62%, #170510)', 'rgba(255, 140, 120, .35)', 'rgba(255, 220, 200, .4)') },
  { id: 'black', name: 'Solid Black', css: '#000' },
  { id: 'slate', name: 'Solid Slate', css: '#3a4a5a' },
]
