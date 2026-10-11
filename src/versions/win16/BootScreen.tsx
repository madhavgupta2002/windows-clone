import { useEffect, useState } from 'react'
import type { Variant } from './context'

/** What DOS prints before WIN.COM takes over. */
const DOS_LINES: Record<Variant, string[]> = {
  win1: ['', 'Microsoft(R) MS-DOS(R) Version 3.10', '             (C)Copyright Microsoft Corp 1981-1985', ''],
  win2: ['', 'Microsoft(R) MS-DOS(R) Version 3.30', '             (C)Copyright Microsoft Corp 1981-1987', ''],
  win3: ['', 'Starting MS-DOS...', '', 'HIMEM is testing extended memory...done.', '', 'Microsoft(R) MS-DOS(R) Version 5.00', '             (C)Copyright Microsoft Corp 1981-1991.', ''],
}

/** The four-pane waving flag, drawn as plain SVG. */
function Flag({ size = 120 }: { size?: number }) {
  const pane = (d: string, fill: string) => <path d={d} fill={fill} />
  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 100 85" aria-hidden>
      {[0, 1, 2, 3, 4].map(i => <rect key={i} x={2 + i * 3} y={18 + i * 6} width={6 - i} height={4} fill={['#f00', '#0f0', '#00f', '#ff0', '#f00'][i]} opacity={0.3 + i * 0.15} />)}
      {pane('M22 10 Q40 2 58 10 L56 40 Q38 32 20 40 Z', '#ff0000')}
      {pane('M62 11 Q78 4 96 12 L94 42 Q76 34 60 41 Z', '#00c000')}
      {pane('M19 44 Q37 36 55 44 L53 74 Q35 66 17 74 Z', '#0000ff')}
      {pane('M59 45 Q75 38 93 46 L91 76 Q73 68 57 75 Z', '#ffcc00')}
    </svg>
  )
}

function Splash({ variant }: { variant: Variant }) {
  if (variant === 'win3') {
    return (
      <div className="w16-splash w16-splash-3">
        <Flag />
        <div>
          <div className="w16-splash-ms">Microsoft<sup>®</sup></div>
          <div className="w16-splash-name">Windows<sup>™</sup></div>
          <div className="w16-splash-ver">Version 3.1</div>
          <div className="w16-splash-copy">Copyright © 1985-1992 Microsoft Corp. All Rights Reserved.</div>
        </div>
      </div>
    )
  }
  const v1 = variant === 'win1'
  return (
    <div className={`w16-splash w16-splash-${v1 ? 1 : 2}`}>
      <div className="w16-splash-logo">
        <span className="w16-splash-ms">Microsoft</span>
        <span className="w16-splash-name">Windows</span>
      </div>
      <div className="w16-splash-ver">Version {v1 ? '1.01' : '2.03'}</div>
      <div className="w16-splash-copy">
        Copyright (c) Microsoft Corporation, {v1 ? '1985' : '1985-1987'}.<br />All Rights Reserved.
        <br />Microsoft is a registered trademark of Microsoft Corp.
      </div>
    </div>
  )
}

/** A DOS prompt screen, used before boot and after "End Session". */
export function DosScreen({ lines, typed = '', cursor = true }: { lines: string[]; typed?: string; cursor?: boolean }) {
  return (
    <pre className="w16-dos-screen">
      {lines.join('\n')}
      {'\n'}C:\{'>'}{typed}{cursor && <span className="w16-caret">_</span>}
    </pre>
  )
}

/** DOS prompt → "WIN" typed → splash. Click or press a key to skip. */
export function BootScreen({ variant, onDone }: { variant: Variant; onDone: () => void }) {
  const [phase, setPhase] = useState<'dos' | 'splash'>('dos')
  const [typed, setTyped] = useState('')

  useEffect(() => {
    const timers = [
      ...'WIN'.split('').map((_, i) => setTimeout(() => setTyped('WIN'.slice(0, i + 1)), 450 + i * 160)),
      setTimeout(() => setPhase('splash'), 1300),
      setTimeout(onDone, 3600),
    ]
    const skip = () => onDone()
    window.addEventListener('keydown', skip)
    return () => { timers.forEach(clearTimeout); window.removeEventListener('keydown', skip) }
  }, [onDone])

  return (
    <div className={`w16-boot w16-boot-${phase}`} onPointerDown={onDone}>
      {phase === 'dos' ? <DosScreen lines={DOS_LINES[variant]} typed={typed} /> : <Splash variant={variant} />}
    </div>
  )
}
