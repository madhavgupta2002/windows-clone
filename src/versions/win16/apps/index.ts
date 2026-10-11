import type { AppDef } from '../../../core'
import { W16 } from '../context'
import { ICONS } from '../icons'
import { Clock } from './Clock'
import { DosExecutive } from './DosExecutive'
import { DosPrompt } from './DosPrompt'
import { Reversi } from './Reversi'
import { ExitDialog, RunApp, TaskList } from './system'

/** Shared 16-bit apps; versions spread these and override titles where the era differs. */
export const WIN16_APPS = {
  exit: { id: W16.exit, title: 'Exit Windows', component: ExitDialog, width: 330, height: 130, resizable: false, single: true },
  run: { id: W16.run, title: 'Run', component: RunApp, width: 1, height: 1, resizable: false },
  dosexec: { id: W16.dosexec, title: 'MS-DOS Executive', icon: ICONS.dosexec, component: DosExecutive, width: 600, height: 380, single: true },
  dosprompt: { id: W16.dosprompt, title: 'MS-DOS Prompt', icon: ICONS.dos, component: DosPrompt, width: 600, height: 360 },
  clock: { id: W16.clock, title: 'Clock', icon: ICONS.clock, component: Clock, width: 200, height: 230 },
  reversi: { id: W16.reversi, title: 'Reversi', icon: ICONS.reversi, component: Reversi, width: 330, height: 390 },
  tasklist: { id: W16.tasklist, title: 'Task List', component: TaskList, width: 320, height: 250, resizable: false, single: true },
} satisfies Record<string, AppDef>
