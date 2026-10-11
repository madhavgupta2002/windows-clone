import type { ClassicConfig } from './types'

/** Windows 2000 / Me palette: Tahoma, #d4d0c8 face, navy→sky gradient captions. */
export const THEME_2000: ClassicConfig['theme'] = {
  '--face': '#d4d0c8',
  '--face-light': '#d4d0c8',
  '--dark': '#404040',
  '--desktop': '#3a6ea5',
  '--title-active': 'linear-gradient(90deg, #0a246a, #a6caf0)',
  '--title-inactive': 'linear-gradient(90deg, #808080, #c0c0c0)',
  '--title-inactive-fg': '#d4d0c8',
  '--menu-hot': '#0a246a',
  '--accent': '#0a246a',
  '--ui-font': '11px Tahoma, "Microsoft Sans Serif", Geneva, sans-serif',
  '--banner-fg1': '#fff',
  '--banner-fg2': '#fff',
  '--banner-font': 'bold 18px Tahoma, Arial, sans-serif',
}
