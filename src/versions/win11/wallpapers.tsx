import { useId } from 'react'
import type { WallpaperDef } from '../modern'

/**
 * Windows 11 wallpapers drawn in SVG/CSS. "Bloom" is the hand-made approximation from
 * the legacy single-file version (which also tried online images; we keep only the
 * local drawing so nothing copyrighted is loaded).
 */

const PALETTES = {
  light: { bg: 'radial-gradient(ellipse at 58% 56%, #538bdc 0%, #254dba 23%, #102974 52%, #061848 78%, #09143a 100%)', s1: ['#bddcff', '#589dea', '#1955bd', '#081c75'], s2: ['#f1f9ff', '#96c4fa', '#316bd0', '#15338d'], s3: ['#d9ecff', '#6ca6ef', '#21459f'], glow: '#71afff', streak: '#8abaff' },
  dark: { bg: 'radial-gradient(ellipse at 58% 56%, #2a4f9a 0%, #142c78 25%, #081a4c 55%, #030b26 80%, #020615 100%)', s1: ['#6b97e0', '#2f63c4', '#0f347f', '#04103f'], s2: ['#a8c8f5', '#4b7fd8', '#1a4296', '#0a1d55'], s3: ['#86aee9', '#3a6cc9', '#122f74'], glow: '#3b6fd0', streak: '#5b86d8' },
} as const

function Bloom({ variant }: { variant: keyof typeof PALETTES }) {
  const uid = useId().replace(/:/g, '')
  const p = PALETTES[variant]
  const id = (n: string) => `${uid}-${n}`
  return (
    <div className="wp wp-bloom" style={{ background: p.bg }}>
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
        <defs>
          <linearGradient id={id('s1')} x1=".12" y1=".05" x2=".86" y2=".95">
            <stop stopColor={p.s1[0]} /><stop offset=".25" stopColor={p.s1[1]} /><stop offset=".57" stopColor={p.s1[2]} /><stop offset="1" stopColor={p.s1[3]} />
          </linearGradient>
          <linearGradient id={id('s2')} x1=".18" y1=".12" x2=".82" y2=".91">
            <stop stopColor={p.s2[0]} /><stop offset=".27" stopColor={p.s2[1]} /><stop offset=".63" stopColor={p.s2[2]} /><stop offset="1" stopColor={p.s2[3]} />
          </linearGradient>
          <linearGradient id={id('s3')} x1=".2" y1=".1" x2=".8" y2=".9">
            <stop stopColor={p.s3[0]} /><stop offset=".45" stopColor={p.s3[1]} /><stop offset="1" stopColor={p.s3[2]} />
          </linearGradient>
          <filter id={id('blur')}><feGaussianBlur stdDeviation="19" /></filter>
        </defs>
        <ellipse cx="925" cy="450" rx="405" ry="300" fill={p.glow} opacity=".35" filter={`url(#${id('blur')})`} />
        <path d="M690 0C507 52 390 150 419 286c21 100 129 156 297 161 166 6 290-86 371-166 81-81 168-109 246-70 92 45 93 172 25 280-108 171-328 348-505 409h394c248-126 406-309 381-494-24-181-175-306-344-263-87 22-154 89-246 152-114 79-233 64-312 15-76-48-65-135 17-198C799 72 884 29 986 0z" fill={`url(#${id('s1')})`} opacity=".95" />
        <path d="M844-65C606 20 493 126 494 248c2 125 124 182 292 172 161-10 255-93 346-153 86-57 179-56 225 8 58 81-1 185-86 269-96 96-249 193-366 356h221c131-130 292-258 361-405 77-165 22-319-126-352-104-24-207 16-303 99-83 71-179 120-283 96-78-18-113-78-68-141 43-60 130-114 268-197z" fill={`url(#${id('s2')})`} />
        <path d="M900-50C698 17 598 111 603 218c5 96 103 150 230 135 105-13 175-73 256-131 111-80 213-88 276-15 79 91 38 218-59 319-124 128-268 211-358 374H772c78-155 241-288 379-407 98-85 140-153 104-206-34-51-99-32-175 24-100 75-194 139-315 107-120-32-182-115-132-215 47-93 138-156 267-253z" fill={`url(#${id('s3')})`} opacity=".91" />
        <path d="M1115-45c-138 78-254 165-287 263-29 86 22 146 116 147 85 1 170-59 257-99 78-36 145-20 162 42 28 105-98 220-230 331-79 67-147 148-191 261h-98c39-138 123-251 249-357 107-91 195-172 176-221-20-53-81-38-167 21-135 93-258 102-327 22-86-98-18-260 106-410z" fill={p.streak} opacity=".5" />
      </svg>
    </div>
  )
}

const gradient = (background: string) => function GradientWallpaper() {
  return <div className="wp" style={{ background }} />
}

export const WIN11_WALLPAPERS: WallpaperDef[] = [
  { id: 'bloom', name: 'Bloom (light)', Component: () => <Bloom variant="light" /> },
  { id: 'bloom-dark', name: 'Bloom (dark)', Component: () => <Bloom variant="dark" /> },
  { id: 'glow', name: 'Glow', Component: gradient('radial-gradient(circle at 50% 60%, #f7b6ff 0%, #b061e8 22%, #5b2ab8 48%, #1f0f5c 75%, #0c0624 100%)') },
  { id: 'sunrise', name: 'Sunrise', Component: gradient('linear-gradient(160deg, #ffd9a8 0%, #ff9a76 30%, #d9577a 60%, #5a2e7a 100%)') },
  { id: 'flow', name: 'Captured Motion', Component: gradient('conic-gradient(from 210deg at 60% 55%, #0c2b5e, #1a7fd4, #9fe3ff, #1a7fd4, #3b1f7a, #0c2b5e)') },
  { id: 'meadow', name: 'Meadow', Component: gradient('linear-gradient(180deg, #8fd3ff 0%, #c9ecff 45%, #7cc47a 46%, #3f8f4a 100%)') },
]

export const WIN11_ACCENTS = ['#0067c0', '#0078d4', '#744da9', '#c239b3', '#e3008c', '#d13438', '#e95420', '#ca5010', '#10893e', '#00b7c3', '#486860', '#68768a'] as const
