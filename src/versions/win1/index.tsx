import { pickApps, type AboutInfo } from '../../core'
import { WIN16_APPS } from '../win16/apps'
import { ICONS } from '../win16/icons'
import { dosSeed } from '../win16/seed'
import { Win16Shell } from '../win16/Win16Shell'

const ABOUT: AboutInfo = {
  product: 'Microsoft Windows MS-DOS Executive',
  version: 'Version 1.01',
  copyright: 'Copyright © Microsoft Corporation, 1985',
  extra: 'Disk space free: 18,432K\nMemory free: 256K',
}

const APPS = pickApps(
  {
    notepad: { icon: ICONS.notepad, width: 480, height: 320 },
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

const SEED = dosSeed('win1')

/** Windows 1.01 (1985): tiled windows, MS-DOS Executive, icon area along the bottom. */
export default function Shell() {
  return (
    <Win16Shell
      variant="win1" about={ABOUT} apps={APPS} fsSeed={SEED} shellApp={WIN16_APPS.dosexec.id}
      startup={[{ app: WIN16_APPS.clock.id, minimized: true }]}
      tiled
    />
  )
}
