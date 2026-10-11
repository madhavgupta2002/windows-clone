import { pickApps, type AboutInfo } from '../../core'
import { WIN16_APPS } from '../win16/apps'
import { ICONS } from '../win16/icons'
import { dosSeed } from '../win16/seed'
import { Win16Shell } from '../win16/Win16Shell'
import { ColorApplet, ControlPanel, DateTimeApplet, DesktopApplet } from './ControlPanel'
import { FileManager } from './FileManager'
import { ProgramManager } from './ProgramManager'
import './win3.css'

const ABOUT: AboutInfo = {
  product: 'Microsoft Windows Program Manager',
  version: 'Version 3.1',
  copyright: 'Copyright © 1985-1992 Microsoft Corp.',
  extra: '386 Enhanced Mode\nMemory: 14,336 KB Free\nSystem Resources: 82% Free',
}

const APPS = pickApps(
  {
    notepad: { icon: ICONS.notepad },
    calculator: { icon: ICONS.calculator },
    paint: { icon: ICONS.paint, title: 'Paintbrush' },
    explorer: { icon: ICONS.filemgr, title: 'File Manager', component: FileManager },
    minesweeper: { icon: ICONS.minesweeper },
    about: { title: 'About Program Manager' },
    msgbox: {},
  },
  [
    { id: 'w3-progman', title: 'Program Manager', icon: ICONS.progman, component: ProgramManager, width: 620, height: 430, single: true },
    { id: 'w3-control', title: 'Control Panel', icon: ICONS.control, component: ControlPanel, width: 330, height: 200, single: true },
    { id: 'w3-cp-color', title: 'Color', icon: ICONS.color, component: ColorApplet, width: 330, height: 330, resizable: false, single: true },
    { id: 'w3-cp-desktop', title: 'Desktop', icon: ICONS.desktop, component: DesktopApplet, width: 320, height: 230, resizable: false, single: true },
    { id: 'w3-cp-datetime', title: 'Date & Time', icon: ICONS.datetime, component: DateTimeApplet, width: 260, height: 150, resizable: false, single: true },
    WIN16_APPS.dosprompt,
    WIN16_APPS.clock,
    WIN16_APPS.reversi,
    WIN16_APPS.tasklist,
    WIN16_APPS.exit,
    WIN16_APPS.run,
  ],
)

const SEED = dosSeed('win3')

const shellBounds = (w: number, h: number) => ({ x: 24, y: 16, w: Math.min(620, w - 48), h: Math.min(430, h - 96) })

/** Windows 3.1 (1992): Program Manager, File Manager, teal desktop, Control Panel colour schemes. */
export default function Shell() {
  return (
    <Win16Shell variant="win3" about={ABOUT} apps={APPS} fsSeed={SEED} shellApp="w3-progman" shellBounds={shellBounds} />
  )
}
