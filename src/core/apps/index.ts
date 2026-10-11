import type { AppDef } from '../types'
import About from './About'
import Browser from './Browser'
import Calculator from './Calculator'
import Explorer from './Explorer'
import Minesweeper from './Minesweeper'
import MsgBox from './MsgBox'
import Notepad from './Notepad'
import Paint from './Paint'
import './apps.css'

/**
 * Shared apps used by every version. Versions relabel/re-icon them with `pickApps`,
 * e.g. explorer is "MS-DOS Executive" in 1.0, "File Manager" in 3.1, "File Explorer" in 10.
 */
export const coreApps = {
  notepad: { id: 'notepad', title: 'Notepad', component: Notepad, width: 560, height: 400 },
  calculator: { id: 'calculator', title: 'Calculator', component: Calculator, width: 280, height: 330, resizable: false },
  explorer: { id: 'explorer', title: 'Explorer', component: Explorer, width: 640, height: 440 },
  minesweeper: { id: 'minesweeper', title: 'Minesweeper', component: Minesweeper, width: 190, height: 280, resizable: false, single: true },
  paint: { id: 'paint', title: 'Paint', component: Paint, width: 640, height: 480 },
  browser: { id: 'browser', title: 'Internet Explorer', component: Browser, width: 760, height: 520 },
  msgbox: { id: 'msgbox', title: 'Message', component: MsgBox, width: 340, height: 150, resizable: false },
  about: { id: 'about', title: 'About Windows', component: About, width: 420, height: 300, resizable: false, single: true },
} satisfies Record<string, AppDef>

export type CoreAppId = keyof typeof coreApps

/**
 * Pick core apps for a version with per-version overrides, plus extra version-only apps.
 *   pickApps({ notepad: { icon: npIcon }, explorer: { title: 'File Manager' } }, [ProgramManagerApp])
 * Apps not listed in `overrides` are excluded — except msgbox and about, which are always included.
 */
export function pickApps(overrides: Partial<Record<CoreAppId, Partial<AppDef>>>, extra: AppDef[] = []): AppDef[] {
  const ids = new Set<CoreAppId>([...(Object.keys(overrides) as CoreAppId[]), 'msgbox', 'about'])
  return [...[...ids].map(id => ({ ...coreApps[id], ...overrides[id] }) as AppDef), ...extra]
}
