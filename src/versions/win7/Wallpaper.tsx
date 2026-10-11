import { FLAG_DEFS, FLAG_PATHS } from './icons'

/** Vector "Harmony"-inspired wallpaper. Colours come from the theme CSS variables. */
export function Wallpaper() {
  return (
    <div className="w7-wallpaper" aria-hidden>
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="w7-wall-base" x2=".8" y2="1">
            <stop style={{ stopColor: 'var(--wall-top)' }} />
            <stop offset="1" style={{ stopColor: 'var(--wall-bottom)' }} />
          </linearGradient>
          <radialGradient id="w7-wall-light">
            <stop style={{ stopColor: 'var(--wall-glow)', stopOpacity: 0.9 }} />
            <stop offset=".4" style={{ stopColor: 'var(--wall-glow)', stopOpacity: 0.25 }} />
            <stop offset="1" style={{ stopColor: 'var(--wall-glow)', stopOpacity: 0 }} />
          </radialGradient>
          <linearGradient id="w7-wall-wave" x1="0" y1="1" x2="1" y2="0">
            <stop stopColor="#c1f5ff" stopOpacity=".1" />
            <stop offset=".55" stopColor="#d0fbff" stopOpacity=".7" />
            <stop offset="1" stopColor="#45bbfa" stopOpacity="0" />
          </linearGradient>
          <filter id="w7-logo-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
        </defs>
        <rect width="1600" height="1000" fill="url(#w7-wall-base)" />
        <ellipse cx="980" cy="660" rx="990" ry="730" fill="url(#w7-wall-light)" />
        <path d="M-100 1010C370 610 750 1140 1730 210" fill="none" stroke="#043e8290" strokeWidth="165" />
        <path d="M-100 1010C400 600 830 1160 1730 220" fill="none" stroke="url(#w7-wall-wave)" strokeWidth="4" />
        <path d="M-120 970C500 520 1030 1000 1680 260" fill="none" stroke="#9edfff30" strokeWidth="36" />
        <path d="M-60 1020C320 650 1030 975 1710 270" fill="none" stroke="#b1f8ff60" strokeWidth="2" />
        <path d="M-60 890C380 820 820 970 1630 650" fill="none" stroke="#b8e7ff20" strokeWidth="2" />
        <path d="M770 610 950 1000 1240 1000 930 490z" fill="#c5faff08" />
        <path d="M870 480 1180 0 1320 0 900 550z" fill="#f2fcff08" />
        <ellipse cx="884" cy="480" rx="135" ry="110" fill="#d6faff" opacity=".42" filter="url(#w7-logo-glow)" />
        <g transform="translate(750 345) rotate(-7 145 145) scale(2.92)" dangerouslySetInnerHTML={{ __html: `<defs>${FLAG_DEFS}</defs>${FLAG_PATHS}` }} />
        <g fill="#dcfaff">
          <circle cx="1040" cy="696" r="2" opacity=".8" />
          <circle cx="1085" cy="670" r="1.5" opacity=".6" />
          <circle cx="560" cy="793" r="2" opacity=".5" />
          <circle cx="1160" cy="700" r="1" opacity=".7" />
        </g>
        <path d="M1120 747q24-52 56-46-29 2-38 35 30-28 49-16-30-3-51 27" fill="#b8eb6560" />
      </svg>
    </div>
  )
}
