/** Per-variant differences between Windows 8 and Windows 8.1. */
export type Variant = '8' | '8.1'

export interface Palette {
  id: string
  /** Start screen background. */
  bg: string
  /** Accent: window borders, taskbar tint, selection. */
  accent: string
}

export interface VariantConfig {
  versionId: 'win8' | 'win81'
  name: string
  build: string
  /** Taskbar Start button (8.1 brought it back). */
  startButton: boolean
  /** "All apps" arrow at the bottom of Start (8.1). */
  allAppsArrow: boolean
  /** Name of "Computer" on the desktop / in Explorer. */
  computerName: string
  palettes: Palette[]
  /** Desktop wallpaper (CSS background). */
  wallpaper: string
  /** Lock screen picture (CSS background). */
  lockscreen: string
}

const WIN8_PALETTES: Palette[] = [
  { id: 'purple', bg: '#2d1960', accent: '#5133ab' },
  { id: 'indigo', bg: '#1d1d5f', accent: '#3a3ab0' },
  { id: 'teal', bg: '#004a4a', accent: '#00a0a0' },
  { id: 'green', bg: '#0d4a13', accent: '#00a300' },
  { id: 'crimson', bg: '#4a0c16', accent: '#ac193d' },
  { id: 'orange', bg: '#6b2a0a', accent: '#d24726' },
  { id: 'graphite', bg: '#1f1f1f', accent: '#4a4a4a' },
]

const WIN81_PALETTES: Palette[] = [
  { id: 'blue', bg: '#0a3f73', accent: '#1b6ec2' },
  { id: 'magenta', bg: '#4a0f3f', accent: '#b01e8e' },
  { id: 'emerald', bg: '#004d40', accent: '#00897b' },
  { id: 'amber', bg: '#5e3a00', accent: '#e39a00' },
  { id: 'violet', bg: '#2c1a5c', accent: '#6b4bd8' },
  { id: 'red', bg: '#5a0e0e', accent: '#d13438' },
  { id: 'slate', bg: '#22303c', accent: '#4f6b80' },
]

export const VARIANTS: Record<Variant, VariantConfig> = {
  '8': {
    versionId: 'win8',
    name: 'Windows 8',
    build: 'Version 6.2 (Build 9200)',
    startButton: false,
    allAppsArrow: false,
    computerName: 'Computer',
    palettes: WIN8_PALETTES,
    wallpaper:
      'radial-gradient(circle at 64% 46%, #fff1c2 0 2%, #f9b54a 6%, #e86f2c 11%, transparent 20%),' +
      'repeating-conic-gradient(from 0deg at 64% 46%, #ffffff10 0 6deg, transparent 6deg 30deg),' +
      'radial-gradient(ellipse at 64% 46%, #5fd0b8 0, #1d8f8a 35%, #0b4f5c 80%)',
    lockscreen:
      'radial-gradient(ellipse at 30% 110%, #f2b33d 0 12%, transparent 38%),' +
      'linear-gradient(170deg, #1b3f6b 0%, #2a6c9c 45%, #e0894a 85%, #f2b33d 100%)',
  },
  '8.1': {
    versionId: 'win81',
    name: 'Windows 8.1',
    build: 'Version 6.3 (Build 9600)',
    startButton: true,
    allAppsArrow: true,
    computerName: 'This PC',
    palettes: WIN81_PALETTES,
    wallpaper:
      'radial-gradient(ellipse at 20% 80%, #38b6ff66, transparent 45%),' +
      'radial-gradient(ellipse at 80% 20%, #8b5cf666, transparent 45%),' +
      'linear-gradient(135deg, #062a52, #0b4f8f 50%, #04223f)',
    lockscreen:
      'radial-gradient(circle at 75% 30%, #ffffff40 0 4%, transparent 22%),' +
      'linear-gradient(180deg, #0b2440 0%, #1d5a8a 55%, #4f9cc6 80%, #9cd1e8 100%)',
  },
}
