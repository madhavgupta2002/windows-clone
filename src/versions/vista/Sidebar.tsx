import { useEffect, useState } from 'react'
import { useClock, usePref } from '../../core'

/** Analog clock gadget. */
function ClockGadget() {
  const now = useClock(1000)
  const s = now.getSeconds()
  const m = now.getMinutes() + s / 60
  const h = (now.getHours() % 12) + m / 60
  const hand = (deg: number, len: number, width: number, color: string) => (
    <line x1="50" y1="50" x2="50" y2={50 - len} stroke={color} strokeWidth={width} strokeLinecap="round" transform={`rotate(${deg} 50 50)`} />
  )
  return (
    <div className="gadget gadget-clock" title={now.toLocaleTimeString()}>
      <svg viewBox="0 0 100 100">
        <defs>
          <radialGradient id="vclock-face" cx=".4" cy=".35" r=".75">
            <stop offset="0" stopColor="#ffffff" /><stop offset=".85" stopColor="#dfe6ec" /><stop offset="1" stopColor="#9aa8b4" />
          </radialGradient>
          <linearGradient id="vclock-rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2f4f6" /><stop offset="1" stopColor="#5d6670" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="url(#vclock-rim)" />
        <circle cx="50" cy="50" r="42" fill="url(#vclock-face)" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="50" y1="11" x2="50" y2={i % 3 === 0 ? 17 : 14} stroke="#3b4652" strokeWidth={i % 3 === 0 ? 2.4 : 1.2} transform={`rotate(${i * 30} 50 50)`} />
        ))}
        {hand(h * 30, 22, 3.6, '#1d252e')}
        {hand(m * 6, 31, 2.4, '#1d252e')}
        {hand(s * 6, 34, 1, '#c8102e')}
        <circle cx="50" cy="50" r="2.6" fill="#c8102e" />
        <ellipse cx="45" cy="30" rx="26" ry="14" fill="#fff" opacity=".35" />
      </svg>
    </div>
  )
}

/** Random-walk value in [lo, hi], refreshed every `ms`. */
function useFakeLoad(lo: number, hi: number, ms: number) {
  const [v, setV] = useState((lo + hi) / 2)
  useEffect(() => {
    const t = setInterval(() => setV(x => Math.min(hi, Math.max(lo, x + (Math.random() - 0.5) * (hi - lo) * 0.5))), ms)
    return () => clearInterval(t)
  }, [lo, hi, ms])
  return Math.round(v)
}

function Dial({ value, cx, r, label }: { value: number; cx: number; r: number; label: string }) {
  const deg = -120 + (value / 100) * 240
  return (
    <g>
      <circle cx={cx} cy={40} r={r} fill="#1a1d22" stroke="#9aa3ad" strokeWidth="2" />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={cx} y1={40 - r + 3} x2={cx} y2={40 - r + 6} stroke={i > 7 ? '#e33' : '#ccc'} strokeWidth="1" transform={`rotate(${-120 + i * 24} ${cx} 40)`} />
      ))}
      <line x1={cx} y1={40} x2={cx} y2={40 - r + 7} stroke="#ff5a1f" strokeWidth="1.6" transform={`rotate(${deg} ${cx} 40)`} />
      <circle cx={cx} cy={40} r="2.5" fill="#ddd" />
      <text x={cx} y={40 + r * 0.55} textAnchor="middle" fill="#7fdc5a" fontSize={r * 0.36} fontFamily="Segoe UI, sans-serif">{value}%</text>
      <text x={cx} y={40 + r + 9} textAnchor="middle" fill="#fff" fontSize="7" fontFamily="Segoe UI, sans-serif">{label}</text>
    </g>
  )
}

/** "CPU Meter"-style gadget with fake CPU and memory load. */
function MeterGadget() {
  const cpu = useFakeLoad(3, 70, 1500)
  const mem = useFakeLoad(38, 62, 4000)
  return (
    <div className="gadget gadget-meter" title={`CPU ${cpu}% · Memory ${mem}%`}>
      <svg viewBox="0 0 140 80">
        <Dial value={cpu} cx={52} r={30} label="CPU" />
        <Dial value={mem} cx={108} r={20} label="Memory" />
      </svg>
    </div>
  )
}

const SLIDES = [
  { name: 'Forest', css: 'radial-gradient(circle at 70% 25%, #fff8c0, transparent 25%), linear-gradient(#9fd3f0, #e7f4d0 50%, #2e6b28 52%, #183d14)' },
  { name: 'Sunset', css: 'radial-gradient(circle at 50% 70%, #ffef9a, #ff9a3c 15%, transparent 40%), linear-gradient(#2a1a5c, #c2456a 55%, #1a0f22 62%)' },
  { name: 'Beach', css: 'radial-gradient(circle at 25% 25%, #fff, transparent 12%), linear-gradient(#5ab4ff, #bfe6ff 48%, #1d8fc9 50%, #f2dca0 72%)' },
  { name: 'Peaks', css: 'linear-gradient(135deg, transparent 48%, #fff 49% 52%, transparent 53%), linear-gradient(#3b6ea8, #a7c7e7 55%, #4a5a6a 56%, #20282f)' },
]

/** Slide Show gadget cycling through drawn "photos". */
function SlideshowGadget() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="gadget gadget-slides" onClick={() => setI(x => (x + 1) % SLIDES.length)} title="Click for the next picture">
      {SLIDES.map((s, n) => <div key={s.name} className={`gadget-slide${n === i ? ' on' : ''}`} style={{ background: s.css }} />)}
      <span className="gadget-slide-caption">{SLIDES[i].name}</span>
    </div>
  )
}

/** Notes gadget, persisted. */
function NotesGadget() {
  const [text, setText] = usePref('vista.notes', 'Click here to type a note.\nNotes are saved automatically.')
  return (
    <div className="gadget gadget-notes">
      <textarea value={text} onChange={e => setText(e.target.value)} spellCheck={false} aria-label="Notes" />
    </div>
  )
}

/** Windows Sidebar docked on the right edge of the desktop. */
export function Sidebar({ onClose }: { onClose: () => void }) {
  return (
    <aside className="vista-sidebar" onContextMenu={e => e.stopPropagation()}>
      <div className="vista-sidebar-top">
        <span>Windows Sidebar</span>
        <button title="Close Sidebar" onClick={onClose}>×</button>
      </div>
      <ClockGadget />
      <MeterGadget />
      <SlideshowGadget />
      <NotesGadget />
    </aside>
  )
}
