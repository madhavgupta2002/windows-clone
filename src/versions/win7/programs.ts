import { ICONS } from './icons'

export interface Program {
  id: string
  name: string
  icon: string
  keywords: string
  /** Shown in the Start menu's frequent list (left column) by default. */
  frequent?: boolean
  /** All Programs sub-folder. */
  folder?: 'Accessories' | 'Games' | 'Maintenance'
}

/** Everything the Start menu and its search know how to launch. */
export const PROGRAMS: Program[] = [
  { id: 'notepad', name: 'Notepad', icon: ICONS.notepad, keywords: 'text editor document write', frequent: true, folder: 'Accessories' },
  { id: 'calculator', name: 'Calculator', icon: ICONS.calculator, keywords: 'math numbers arithmetic', frequent: true, folder: 'Accessories' },
  { id: 'paint', name: 'Paint', icon: ICONS.paint, keywords: 'draw picture image bitmap', frequent: true, folder: 'Accessories' },
  { id: 'browser', name: 'Internet Explorer', icon: ICONS.browser, keywords: 'internet browser search web', frequent: true },
  { id: 'explorer', name: 'Windows Explorer', icon: ICONS.folder, keywords: 'files folders computer', frequent: true, folder: 'Accessories' },
  { id: 'minesweeper', name: 'Minesweeper', icon: ICONS.mines, keywords: 'game mines', frequent: true, folder: 'Games' },
  { id: 'personalize', name: 'Personalization', icon: ICONS.settings, keywords: 'control panel settings wallpaper theme background icons' },
  { id: 'help', name: 'Help and Support', icon: ICONS.help, keywords: 'help support guide shortcuts' },
  { id: 'about', name: 'About Windows', icon: ICONS.computer, keywords: 'winver version system properties', folder: 'Maintenance' },
]
