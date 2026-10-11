import { createElement } from 'react'
import { coreApps, pickApps, type AppProps, type FsSeed } from '../../core'
import { APP_ICONS } from './icons'
import { DESKTOP_DIR, DOCUMENTS_DIR, PICTURES_DIR, RECYCLE_BIN, USER_HOME } from './launch'
import { settingsApp } from './Settings'
import { storeApp } from './Store'

const CoreExplorer = coreApps.explorer.component

/** File Explorer with Fluent folder / drive / PC icons as defaults (callers may still override). */
function FluentExplorer({ winId, args }: AppProps) {
  return createElement(CoreExplorer, {
    winId,
    args: { folderIcon: APP_ICONS.folder, driveIcon: APP_ICONS.drive, computerIcon: APP_ICONS.pc, computerLabel: 'This PC', ...args },
  })
}

/** App registry shared by Windows 10 and 11 (module constant → stable identity). */
export const MODERN_APPS = pickApps(
  {
    explorer: { title: 'File Explorer', icon: APP_ICONS.folder, width: 900, height: 560, component: FluentExplorer },
    browser: { title: 'Microsoft Edge', icon: APP_ICONS.edge, width: 1000, height: 640 },
    notepad: { icon: APP_ICONS.notepad, width: 760, height: 520 },
    calculator: { icon: APP_ICONS.calculator, width: 330, height: 500 },
    paint: { icon: APP_ICONS.paint, width: 860, height: 600 },
    msgbox: { width: 380, height: 170 },
    about: { title: 'About Windows', icon: APP_ICONS.pc, width: 460, height: 360 },
  },
  [settingsApp, storeApp],
)

export const modernFsSeed = (product: string): FsSeed => ({
  [DESKTOP_DIR]: null,
  [`${DOCUMENTS_DIR}/Welcome.txt`]:
    `Welcome to ${product}!\r\n\r\nThis is a browser recreation. Files you create are saved in your browser's local storage.\r\n\r\n` +
    'Try: Start menu search, Settings > Personalization, Quick settings, and the snap layouts on a window\'s maximize button.\r\n',
  [`${DOCUMENTS_DIR}/Shopping list.txt`]: 'Milk\r\nCoffee\r\nBread\r\n',
  [`${USER_HOME}/Downloads`]: null,
  [PICTURES_DIR]: null,
  [`${USER_HOME}/Music`]: null,
  [`${USER_HOME}/Videos`]: null,
  'C:/Program Files/Common Files': null,
  'C:/Windows/System32/drivers/etc/hosts': '# Copyright (c) 1993-2009 Microsoft Corp.\r\n\r\n127.0.0.1       localhost\r\n',
  'C:/Windows/win.ini': '; for 16-bit app support\r\n[fonts]\r\n[extensions]\r\n',
  [RECYCLE_BIN]: null,
})
