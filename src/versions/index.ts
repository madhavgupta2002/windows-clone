import type { VersionMeta } from '../core/types'

/** Every version, in release order. Each loads lazily so the launcher stays small. */
export const versions: VersionMeta[] = [
  { id: 'win1', name: 'Windows 1.0', year: 1985, tagline: 'Tiled windows and MS-DOS Executive', preview: 'linear-gradient(#fff 0 18%, #00a 18% 22%, #fff 22%)', load: () => import('./win1') },
  { id: 'win2', name: 'Windows 2.0', year: 1987, tagline: 'Overlapping windows arrive', preview: 'linear-gradient(#0aa 0 100%)', load: () => import('./win2') },
  { id: 'win3', name: 'Windows 3.1', year: 1992, tagline: 'Program Manager and File Manager', preview: 'linear-gradient(#008080 0 100%)', load: () => import('./win3') },
  { id: 'win95', name: 'Windows 95', year: 1995, tagline: 'The Start button and taskbar', preview: 'linear-gradient(#008080 0 88%, #c0c0c0 88%)', load: () => import('./win95') },
  { id: 'win98', name: 'Windows 98', year: 1998, tagline: 'Quick Launch and the web-integrated desktop', preview: 'linear-gradient(#3a6ea5 0 88%, #c0c0c0 88%)', load: () => import('./win98') },
  { id: 'winme', name: 'Windows ME', year: 2000, tagline: 'Millennium Edition', preview: 'linear-gradient(#3a6ea5 0 88%, #d4d0c8 88%)', load: () => import('./winme') },
  { id: 'win2000', name: 'Windows 2000', year: 2000, tagline: 'NT for the professional desktop', preview: 'linear-gradient(#3a6ea5 0 88%, #d4d0c8 88%)', load: () => import('./win2000') },
  { id: 'xp', name: 'Windows XP', year: 2001, tagline: 'Luna and the Bliss hill', preview: 'linear-gradient(#5d9ce6 0 45%, #4a9a2a 60% 88%, #245edb 88%)', load: () => import('./xp') },
  { id: 'vista', name: 'Windows Vista', year: 2007, tagline: 'Aero glass and the sidebar', preview: 'linear-gradient(135deg, #0b2a1e, #1f6b4f 50%, #061410 88%, #1a1a1a 88%)', load: () => import('./vista') },
  { id: 'win7', name: 'Windows 7', year: 2009, tagline: 'Superbar and Aero Snap', preview: 'linear-gradient(135deg, #0e5fa8, #3aa0e0 50%, #0b3d73 88%, #1c3c5a 88%)', load: () => import('./win7') },
  { id: 'win8', name: 'Windows 8', year: 2012, tagline: 'Live tiles on the Start screen', preview: 'linear-gradient(135deg, #1d1d5f, #2d1960)', load: () => import('./win8') },
  { id: 'win81', name: 'Windows 8.1', year: 2013, tagline: 'The Start button returns', preview: 'linear-gradient(135deg, #0a3f73, #1b6ec2)', load: () => import('./win8/win81') },
  { id: 'win10', name: 'Windows 10', year: 2015, tagline: 'Start menu, tiles and Cortana', preview: 'linear-gradient(135deg, #001d3d, #0063b1 60%, #101010 88%)', load: () => import('./win10') },
  { id: 'win11', name: 'Windows 11', year: 2021, tagline: 'Centered taskbar and Mica', preview: 'radial-gradient(ellipse at 58% 56%, #538bdc, #254dba 23%, #102974 52%, #061848 78%)', load: () => import('./win11') },
]
