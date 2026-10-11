import { useId } from 'react'
import type { WallpaperDef } from '../modern'

/**
 * Windows 10 wallpapers. "Hero" is an original SVG approximation of the famous
 * light-beams-through-a-window look: a perspective four-pane window glowing on a
 * navy background, with soft beams fanning out to the left. No bitmaps.
 */
function Hero() {
  const uid = useId().replace(/:/g, '')
  const id = (n: string) => `${uid}-${n}`
  const u = (n: string) => `url(#${id(n)})`
  // Window quad (perspective: left edge shorter than the right edge).
  const TL = [960, 250], TR = [1320, 135], BR = [1320, 770], BL = [960, 650]
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const T = mid(TL, TR), B = mid(BL, BR), L = mid(TL, BL), R = mid(TR, BR)
  const pts = (...p: number[][]) => p.map(q => q.join(',')).join(' ')
  return (
    <div className="wp wp-hero" style={{ background: 'radial-gradient(ellipse at 70% 50%, #0b4fb4 0%, #03287a 30%, #011548 55%, #000a26 80%, #00040f 100%)' }}>
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
        <defs>
          <linearGradient id={id('pane')} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#9fe0ff" /><stop offset=".45" stopColor="#3fa4ff" /><stop offset="1" stopColor="#0a5bd6" />
          </linearGradient>
          <linearGradient id={id('beam')} x1="1" y1="0" x2="0" y2="0">
            <stop stopColor="#6cc3ff" stopOpacity=".55" /><stop offset=".5" stopColor="#2a7ae0" stopOpacity=".18" /><stop offset="1" stopColor="#0a3d9c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id('floor')} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#3b8cff" stopOpacity=".35" /><stop offset="1" stopColor="#0a3d9c" stopOpacity="0" />
          </linearGradient>
          <filter id={id('glow')} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
          <filter id={id('soft')}><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        {/* beams fanning to the left */}
        <polygon points={pts(TL, BL, [-200, 1050], [-200, -120])} fill={u('beam')} filter={u('soft')} />
        <polygon points={pts(L, BL, [0, 980], [0, 560])} fill={u('beam')} opacity=".7" />
        <polygon points={pts(TL, L, [0, 250], [0, -60])} fill={u('beam')} opacity=".6" />
        <polygon points={pts(BL, BR, [1500, 1000], [-100, 1000])} fill={u('floor')} filter={u('soft')} />
        {/* glow behind the window */}
        <polygon points={pts(TL, TR, BR, BL)} fill="#2f8dff" opacity=".8" filter={u('glow')} />
        {/* the window */}
        <polygon points={pts(TL, TR, BR, BL)} fill={u('pane')} />
        <line x1={T[0]} y1={T[1]} x2={B[0]} y2={B[1]} stroke="#03287a" strokeWidth="14" />
        <line x1={L[0]} y1={L[1]} x2={R[0]} y2={R[1]} stroke="#03287a" strokeWidth="14" />
        <polygon points={pts(TL, TR, BR, BL)} fill="none" stroke="#b9ecff" strokeOpacity=".5" strokeWidth="2" />
      </svg>
    </div>
  )
}

const gradient = (background: string) => function GradientWallpaper() {
  return <div className="wp" style={{ background }} />
}

export const WIN10_WALLPAPERS: WallpaperDef[] = [
  { id: 'hero', name: 'Windows 10', Component: Hero },
  { id: 'blue', name: 'Solid blue', Component: gradient('#0063b1') },
  { id: 'lake', name: 'Lake', Component: gradient('linear-gradient(180deg, #1c3d6e 0%, #4f7fb5 42%, #a9c7e0 50%, #2c4f72 52%, #0e2440 100%)') },
  { id: 'aurora', name: 'Aurora', Component: gradient('linear-gradient(170deg, #02121f 0%, #04324a 35%, #0b8a6f 55%, #3fd18f 62%, #052235 80%)') },
  { id: 'sunset', name: 'Sunset', Component: gradient('linear-gradient(180deg, #2b1055 0%, #7597de 30%, #f8b67b 62%, #e2675b 80%, #3a1c4a 100%)') },
  { id: 'dark', name: 'Solid dark', Component: gradient('#1f1f1f') },
]

export const WIN10_ACCENTS = ['#0078d7', '#0063b1', '#8e8cd8', '#744da9', '#b146c2', '#e3008c', '#e81123', '#ca5010', '#ffb900', '#107c10', '#00b7c3', '#2d7d9a', '#567c73', '#69797e'] as const
