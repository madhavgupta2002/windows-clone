import type { CSSProperties } from 'react'
import { svgIcon } from '../../core'
import type { DesktopPrefs, Variant } from './context'

/** The 16-colour EGA / VGA palette everything in these versions is drawn with. */
export const EGA = {
  black: '#000000', blue: '#0000aa', green: '#00aa00', cyan: '#00aaaa',
  red: '#aa0000', magenta: '#aa00aa', brown: '#aa5500', lightGray: '#aaaaaa',
  darkGray: '#555555', lightBlue: '#5555ff', lightGreen: '#55ff55', lightCyan: '#55ffff',
  lightRed: '#ff5555', lightMagenta: '#ff55ff', yellow: '#ffff55', white: '#ffffff',
} as const

/** Windows 3.1's default 16 colours (VGA). */
export const VGA16 = [
  '#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0',
  '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff',
]

/** A colour scheme: everything the Frame / menus / desktop read via CSS variables. */
export interface Scheme {
  desktop: string
  titleBg: string
  titleFg: string
  inactiveBg: string
  inactiveFg: string
  border: string
  inactiveBorder: string
  frame: string
  menuBg: string
  menuFg: string
  windowBg: string
  windowFg: string
  face: string
  shadow: string
  accent: string
  accentFg: string
}

const W3_DEFAULT: Scheme = {
  desktop: '#008080', titleBg: '#000080', titleFg: '#ffffff', inactiveBg: '#ffffff', inactiveFg: '#000000',
  border: '#c0c0c0', inactiveBorder: '#c0c0c0', frame: '#000000', menuBg: '#ffffff', menuFg: '#000000',
  windowBg: '#ffffff', windowFg: '#000000', face: '#c0c0c0', shadow: '#808080', accent: '#000080', accentFg: '#ffffff',
}

/** Windows 3.1 Control Panel colour schemes (approximations of the shipped ones). */
export const W3_SCHEMES: Record<string, Scheme> = {
  'Windows Default': W3_DEFAULT,
  Arizona: { ...W3_DEFAULT, desktop: '#808040', titleBg: '#008080', inactiveBg: '#c0c0c0', border: '#c0c0a0', inactiveBorder: '#c0c0a0', menuBg: '#ffffe0', accent: '#808000' },
  'Black Leather Jacket': { ...W3_DEFAULT, desktop: '#000000', titleBg: '#404040', titleFg: '#ffffff', inactiveBg: '#808080', inactiveFg: '#c0c0c0', border: '#808080', inactiveBorder: '#404040', menuBg: '#c0c0c0', accent: '#000000' },
  Bordeaux: { ...W3_DEFAULT, desktop: '#400040', titleBg: '#800040', inactiveBg: '#c0c0c0', border: '#c08080', inactiveBorder: '#c0c0c0', accent: '#800040' },
  Designer: { ...W3_DEFAULT, desktop: '#408080', titleBg: '#004040', inactiveBg: '#c0c0c0', border: '#c0c0c0', accent: '#004040' },
  'Hotdog Stand': { ...W3_DEFAULT, desktop: '#ffff00', titleBg: '#ff0000', titleFg: '#ffffff', inactiveBg: '#ffff00', inactiveFg: '#000000', border: '#ff0000', inactiveBorder: '#ffff00', menuBg: '#ffffff', windowBg: '#ff0000', windowFg: '#ffffff', accent: '#000000', face: '#c0c0c0' },
  Ocean: { ...W3_DEFAULT, desktop: '#004080', titleBg: '#008080', inactiveBg: '#c0c0c0', border: '#80c0c0', inactiveBorder: '#c0c0c0', accent: '#008080' },
  Rugby: { ...W3_DEFAULT, desktop: '#008000', titleBg: '#800000', inactiveBg: '#ffffff', border: '#c0c0c0', accent: '#800000' },
  'The Blues': { ...W3_DEFAULT, desktop: '#000080', titleBg: '#0000ff', inactiveBg: '#c0c0ff', inactiveFg: '#000080', border: '#8080ff', inactiveBorder: '#c0c0ff', accent: '#0000ff' },
  Wingtips: { ...W3_DEFAULT, desktop: '#804000', titleBg: '#808080', inactiveBg: '#c0c0c0', border: '#c0a080', inactiveBorder: '#c0c0c0', accent: '#804000' },
}

/** Windows 1.0: white everywhere, blue active caption, black lines. */
const W1_SCHEME: Scheme = {
  desktop: EGA.white, titleBg: EGA.blue, titleFg: EGA.white, inactiveBg: EGA.white, inactiveFg: EGA.black,
  border: EGA.white, inactiveBorder: EGA.white, frame: EGA.black, menuBg: EGA.white, menuFg: EGA.black,
  windowBg: EGA.white, windowFg: EGA.black, face: EGA.white, shadow: EGA.darkGray, accent: EGA.black, accentFg: EGA.white,
}

/** Windows 2.0: EGA colours, cyan desktop, blue caption, sizing borders. */
const W2_SCHEME: Scheme = {
  ...W1_SCHEME, desktop: EGA.cyan, border: EGA.lightGray, inactiveBorder: EGA.white,
}

export const SCHEMES: Record<Variant, Record<string, Scheme>> = {
  win1: { Default: W1_SCHEME },
  win2: { Default: W2_SCHEME },
  win3: W3_SCHEMES,
}

export const DEFAULT_SCHEME: Record<Variant, string> = { win1: 'Default', win2: 'Default', win3: 'Windows Default' }

/** CSS custom properties for a scheme (+ desktop override). */
export function schemeVars(scheme: Scheme, prefs: DesktopPrefs): CSSProperties {
  const vars: Record<string, string> = {
    '--w16-desktop': prefs.desktopColor ?? scheme.desktop,
    '--w16-title-bg': scheme.titleBg,
    '--w16-title-fg': scheme.titleFg,
    '--w16-title-inactive-bg': scheme.inactiveBg,
    '--w16-title-inactive-fg': scheme.inactiveFg,
    '--w16-border': scheme.border,
    '--w16-border-inactive': scheme.inactiveBorder,
    '--w16-frame': scheme.frame,
    '--w16-menu-bg': scheme.menuBg,
    '--w16-menu-fg': scheme.menuFg,
    '--w16-window-bg': scheme.windowBg,
    '--w16-window-fg': scheme.windowFg,
    '--w16-face': scheme.face,
    '--w16-shadow': scheme.shadow,
    '--accent': scheme.accent,
    '--accent-fg': scheme.accentFg,
  }
  return vars as CSSProperties
}

/** 8x8 desktop patterns, as stored in the [patterns] section of the 3.1 WIN.INI. */
export const PATTERNS: Record<string, number[] | null> = {
  '(None)': null,
  '50% Gray': [170, 85, 170, 85, 170, 85, 170, 85],
  Boxes: [127, 65, 65, 65, 65, 65, 127, 0],
  Critters: [0, 80, 114, 32, 0, 5, 39, 2],
  Diamonds: [32, 80, 136, 80, 32, 0, 0, 0],
  Paisley: [2, 7, 7, 2, 32, 80, 80, 32],
  Pattern: [224, 128, 142, 136, 234, 10, 14, 0],
  Quilt: [130, 68, 40, 17, 40, 68, 130, 1],
  Scottie: [64, 192, 200, 120, 120, 72, 0, 0],
  Spinner: [20, 12, 200, 121, 158, 19, 48, 40],
  Thatches: [248, 116, 34, 71, 143, 23, 34, 113],
  Tulip: [0, 0, 84, 124, 124, 56, 146, 124],
  Waffle: [0, 0, 0, 0, 128, 128, 128, 240],
  Weave: [136, 84, 34, 69, 136, 21, 34, 81],
}

/** CSS background-image for a desktop pattern (black bits over the desktop colour). */
export function patternImage(name: string): string | undefined {
  const bits = PATTERNS[name]
  if (!bits) return undefined
  let rects = ''
  bits.forEach((row, y) => {
    for (let x = 0; x < 8; x++) if (row & (128 >> x)) rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`
  })
  return `url("${svgIcon(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" width="8" height="8" shape-rendering="crispEdges">${rects}</svg>`)}")`
}
