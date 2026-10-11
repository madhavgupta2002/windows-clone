import { MenuBar, useClock, useOS, usePref, type AppProps } from '../../../core'

interface ClockPrefs { digital: boolean; seconds: boolean; date: boolean }

function Hand({ angle, length, width, className }: { angle: number; length: number; width: number; className: string }) {
  const rad = (angle * Math.PI) / 180
  return (
    <line x1="50" y1="50" x2={50 + Math.sin(rad) * length} y2={50 - Math.cos(rad) * length}
      strokeWidth={width} className={className} strokeLinecap="square" />
  )
}

/** Clock: analog face (hour dots, minute ticks) or digital readout; Settings persist. */
export function Clock(_props: AppProps) {
  const os = useOS()
  const now = useClock(1000)
  const [prefs, setPrefs] = usePref<ClockPrefs>(`${os.versionId}.clock`, { digital: false, seconds: true, date: true })
  const set = (p: Partial<ClockPrefs>) => setPrefs({ ...prefs, ...p })
  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()

  return (
    <div className="app app-w16-clock">
      <MenuBar menus={[{
        label: 'Settings',
        items: [
          { label: 'Analog', checked: !prefs.digital, onClick: () => set({ digital: false }) },
          { label: 'Digital', checked: prefs.digital, onClick: () => set({ digital: true }) },
          { separator: true },
          { label: 'Seconds', checked: prefs.seconds, onClick: () => set({ seconds: !prefs.seconds }) },
          { label: 'Date', checked: prefs.date, onClick: () => set({ date: !prefs.date }) },
        ],
      }]} />
      <div className="clock-face-wrap">
        {prefs.digital ? (
          <div className="clock-digital">
            <div className="clock-digital-time">
              {String(h % 12 || 12).padStart(2, ' ')}:{String(m).padStart(2, '0')}
              {prefs.seconds && <small>:{String(s).padStart(2, '0')}</small>}
              <small> {h < 12 ? 'AM' : 'PM'}</small>
            </div>
            {prefs.date && <div className="clock-digital-date">{now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}</div>}
          </div>
        ) : (
          <svg className="clock-analog" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {Array.from({ length: 60 }, (_, i) => {
              const a = (i * Math.PI) / 30
              const big = i % 5 === 0
              const r = 44
              const size = big ? 4 : 1.4
              return <rect key={i} className={big ? 'clock-hour-dot' : 'clock-min-dot'}
                x={50 + Math.sin(a) * r - size / 2} y={50 - Math.cos(a) * r - size / 2} width={size} height={size} />
            })}
            <Hand angle={(h % 12) * 30 + m / 2} length={24} width={4} className="clock-hand" />
            <Hand angle={m * 6 + s / 10} length={36} width={2.6} className="clock-hand" />
            {prefs.seconds && <Hand angle={s * 6} length={40} width={0.8} className="clock-second" />}
          </svg>
        )}
      </div>
      {prefs.date && !prefs.digital && <div className="clock-date">{now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}</div>}
    </div>
  )
}
