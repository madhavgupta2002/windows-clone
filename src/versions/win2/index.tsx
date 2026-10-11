import { pickApps, type AboutInfo } from '../../core'
import { WIN16_APPS } from '../win16/apps'
import { ICONS } from '../win16/icons'
import { dosSeed } from '../win16/seed'
import { Win16Shell } from '../win16/Win16Shell'

const ABOUT: AboutInfo = {
  product: 'Microsoft Windows MS-DOS Executive',
  version: 'Version 2.03',
  copyright: 'Copyright © Microsoft Corporation, 1985-1987',
  extra: 'Disk space free: 18,432K\nMemory free: 384K',
}

const APPS = pickApps(
  {
    notepad: { icon: ICONS.notepad },
    calculator: { icon: ICONS.calculator },
    paint: { icon: ICONS.paint, title: 'Paint' },
    about: { title: 'About MS-DOS Executive...' },
    msgbox: {},
  },
  [
    WIN16_APPS.dosexec,
    WIN16_APPS.dosprompt,
    WIN16_APPS.clock,
    WIN16_APPS.reversi,
    { ...WIN16_APPS.exit, title: 'End Session' },
    WIN16_APPS.run,
  ],
)

const SEED = dosSeed('win2')

const shellBounds = (w: number, h: number) => ({ x: 16, y: 12, w: Math.min(600, w - 32), h: Math.min(380, h - 100) })

/** Windows 2.03 (1987): overlapping windows, minimize / maximize boxes, MS-DOS Executive. */
export default function Shell() {
  return (
    <Win16Shell
      variant="win2" about={ABOUT} apps={APPS} fsSeed={SEED} shellApp={WIN16_APPS.dosexec.id}
      shellBounds={shellBounds}
    />
  )
}
