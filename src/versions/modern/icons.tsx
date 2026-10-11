import { svgIcon } from '../../core'

/**
 * Fluent-style icons drawn by hand (no Microsoft bitmaps).
 * `APP_ICONS` are colourful data-URI icons for AppDefs / tiles / desktop;
 * `<Glyph>` renders monochrome line icons that follow `currentColor`.
 */

const svg48 = (body: string) => svgIcon(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${body}</svg>`)

export const APP_ICONS = {
  folder: svg48('<path d="M4 12a3 3 0 0 1 3-3h12l4 5h18a3 3 0 0 1 3 3v5H4z" fill="#eeb72c"/><path d="M5 18h39a2 2 0 0 1 2 2l-4 21a3 3 0 0 1-3 2H7a3 3 0 0 1-3-3V21a3 3 0 0 1 1-3z" fill="#ffd75a"/><path d="M5 21h40l-3 18H4z" fill="#f9c943"/>'),
  edge: svg48('<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#25c5ba"/><stop offset=".5" stop-color="#0d93ca"/><stop offset="1" stop-color="#1955cb"/></linearGradient></defs><path d="M44 29c0 11-9 17-20 17C13 46 4 39 4 27 4 14 13 3 25 3c10 0 18 7 19 17-3-6-10-9-17-8-8 1-14 7-15 15 5-5 11-7 18-5 5 1 8 5 14 7z" fill="url(#a)"/><path d="M44 29c-4 7-11 10-20 9-7-1-11-5-12-11 6-6 15-7 22-2 3 2 6 4 10 4z" fill="#087ac4"/><path d="M44 29c-5 4-12 5-18 3-5-2-10-3-14-5 2 10 11 16 22 15 6-2 10-7 10-13z" fill="#22a7c5"/>'),
  store: svg48('<rect x="6" y="13" width="36" height="31" rx="3" fill="#eee"/><rect x="9" y="18" width="30" height="23" rx="1" fill="#fff"/><path d="M17 16v-5a7 7 0 0 1 14 0v5" fill="none" stroke="#777" stroke-width="3"/><rect x="16" y="23" width="7" height="7" fill="#f25022"/><rect x="25" y="23" width="7" height="7" fill="#7fba00"/><rect x="16" y="32" width="7" height="7" fill="#00a4ef"/><rect x="25" y="32" width="7" height="7" fill="#ffb900"/>'),
  settings: svg48('<path d="M20 3h8l1.3 5.5a17 17 0 0 1 4.4 2.5L39 9l5 7-3.6 4.3a16 16 0 0 1 0 5.4L44 30l-5 7-5.3-2a17 17 0 0 1-4.4 2.5L28 43h-8l-1.3-5.5a17 17 0 0 1-4.4-2.5L9 37l-5-7 3.6-4.3a16 16 0 0 1 0-5.4L4 16l5-7 5.3 2a17 17 0 0 1 4.4-2.5z" fill="#858b90"/><circle cx="24" cy="23" r="9" fill="#e5e9eb"/><circle cx="24" cy="23" r="5.5" fill="#858b90"/>'),
  notepad: svg48('<rect x="9" y="5" width="31" height="39" rx="3" fill="#76c6df"/><path d="M9 10h31v32a2 2 0 0 1-2 2H12a3 3 0 0 1-3-3z" fill="#fff"/><path d="M16 20h17M16 26h17M16 32h13" stroke="#7ca8bc" stroke-width="2"/><path d="M16 4v8m8-8v8m8-8v8" stroke="#4788ab" stroke-width="3" stroke-linecap="round"/>'),
  calculator: svg48('<rect x="9" y="3" width="30" height="42" rx="4" fill="#d6dbe1"/><rect x="13" y="8" width="22" height="11" rx="1" fill="#fff"/><path d="M16 24h4m7 0h5M16 30h4m7 0h5M16 36h4m7 0h5" stroke="#555" stroke-width="3" stroke-linecap="round"/>'),
  bin: svg48('<path d="M14 11h20l-2 32H16z" fill="#d9ecf5" stroke="#82b4d2" stroke-width="2"/><path d="M11 10h26v4H11z" fill="#f4f8fa" stroke="#83a9bd" stroke-width="1.5"/><path d="M19 8V5h10v3" fill="none" stroke="#83a9bd" stroke-width="2"/><path d="m20 23 4-4 3 3m-3-3-1 5m1-5 5 1M20 29l2 4 4-1m-4 1 4 2m0-3 2-5" fill="none" stroke="#56a1d0" stroke-width="1.8" stroke-linecap="round"/>'),
  pc: svg48('<rect x="5" y="7" width="38" height="28" rx="2" fill="#353f4c"/><rect x="8" y="10" width="32" height="22" fill="#63a9db"/><path d="M20 35h8v5H20zm-7 5h22v3H13z" fill="#aab3bd"/>'),
  doc: svg48('<path d="M10 3h19l9 9v32H10z" fill="#f5f5f5" stroke="#b5b5b5"/><path d="M29 3v10h9" fill="#ddd"/><path d="M16 22h16m-16 6h16m-16 6h13" stroke="#8b9bad" stroke-width="2"/>'),
  photo: svg48('<rect x="5" y="7" width="38" height="34" rx="4" fill="#73bbdb"/><circle cx="32" cy="17" r="5" fill="#ffdc70"/><path d="m7 35 11-13 8 9 6-6 10 10v4H7z" fill="#4d9d76"/>'),
  paint: svg48('<path d="M24 4C12 4 4 12 4 23c0 10 8 17 16 17 3 0 4-2 4-4s-2-3-2-5 2-3 4-3h6c7 0 12-5 12-11C44 10 35 4 24 4z" fill="#f4f4f4" stroke="#b0b0b0"/><circle cx="14" cy="20" r="3.5" fill="#e74856"/><circle cx="21" cy="12" r="3.5" fill="#ffb900"/><circle cx="31" cy="12" r="3.5" fill="#16c60c"/><circle cx="37" cy="20" r="3.5" fill="#0078d4"/><path d="m30 44 14-16 2 2-14 16z" fill="#8a5a2b"/>'),
  mail: svg48('<rect x="4" y="10" width="40" height="28" rx="3" fill="#0f6cbd"/><path d="m5 12 19 14 19-14" fill="none" stroke="#9fd4ff" stroke-width="2.5"/>'),
  calendarApp: svg48('<rect x="5" y="8" width="38" height="34" rx="3" fill="#fff" stroke="#b7b7b7"/><path d="M5 11a3 3 0 0 1 3-3h32a3 3 0 0 1 3 3v6H5z" fill="#0f6cbd"/><path d="M12 24h5m7 0h5m7 0h1M12 32h5m7 0h5" stroke="#555" stroke-width="3" stroke-linecap="round"/>'),
  weather: svg48('<circle cx="19" cy="18" r="9" fill="#ffc83d"/><path d="M14 40h21a8 8 0 0 0 0-16 11 11 0 0 0-21 3 6.5 6.5 0 0 0 0 13z" fill="#e8f1fb"/>'),
  news: svg48('<rect x="5" y="8" width="38" height="32" rx="3" fill="#e1543b"/><rect x="10" y="14" width="13" height="11" fill="#fff"/><path d="M27 15h11M27 20h11M27 25h11M10 31h28M10 35h22" stroke="#fff" stroke-width="2"/>'),
  music: svg48('<circle cx="24" cy="24" r="20" fill="#f7630c"/><path d="M20 32V15l12-3v17" fill="none" stroke="#fff" stroke-width="2.5"/><circle cx="17" cy="32" r="3.5" fill="#fff"/><circle cx="29" cy="29" r="3.5" fill="#fff"/>'),
  drive: svg48('<rect x="4" y="16" width="40" height="18" rx="3" fill="#c9cfd6"/><rect x="4" y="27" width="40" height="7" rx="2" fill="#9aa3ad"/><rect x="8" y="12" width="13" height="10" fill="#f25022"/><rect x="22" y="12" width="13" height="10" fill="#7fba00"/><circle cx="38" cy="30.5" r="1.6" fill="#3cd070"/>'),
  user: svg48('<circle cx="24" cy="24" r="21" fill="#b0cee8"/><circle cx="24" cy="19" r="8" fill="#fff"/><path d="M10 38a15 11 0 0 1 28 0" fill="#fff"/>'),
} as const

export type AppIconName = keyof typeof APP_ICONS

const GLYPHS = {
  search: '<circle cx="10.8" cy="10.8" r="6.8" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 16 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  taskview: '<rect x="2" y="4" width="8" height="8" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.7"/><rect x="13" y="4" width="9" height="16" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M2 16h8M2 20h8" stroke="currentColor" stroke-width="1.7"/>',
  wifi: '<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="20" r="1.5" fill="currentColor"/>',
  volume: '<path d="M3 9v6h4l5 4V5L7 9zM16 8a6 6 0 0 1 0 8m2-11a10 10 0 0 1 0 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  battery: '<rect x="2" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M22 10v4M5 9h12v6H5z" fill="currentColor" stroke="currentColor" stroke-linecap="round"/>',
  power: '<path d="M12 2v10m-5-7a9 9 0 1 0 10 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  chevron: '<path d="m8 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  chevronUp: '<path d="m5 15 7-7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  chevronDown: '<path d="m5 9 7 7 7-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  back: '<path d="m11 5-7 7 7 7M4 12h17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2 6M20 4v7h-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  plus: '<path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  sun: '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M20 4l-2 2M6 18l-2 2" stroke="currentColor" stroke-width="1.6"/>',
  moon: '<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  bluetooth: '<path d="M7 6 17 17l-5 4V3l5 4L7 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  airplane: '<path d="m2 13 8-2 6-8c1-1 3-1 3 1l-4 9 6 3v3l-8-1-4 4-2-1 2-6-7 1z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
  leaf: '<path d="M5 19C5 9 11 4 21 3c0 10-5 16-14 16M5 19l8-8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  accessibility: '<circle cx="12" cy="4.5" r="2" fill="currentColor"/><path d="M4 8l8 2 8-2M12 10v5l-3 7m3-7 3 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  location: '<path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/>',
  focus: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  tablet: '<rect x="3" y="5" width="18" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M10 16h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  project: '<rect x="2" y="4" width="14" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="1.7"/><rect x="8" y="10" width="14" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="1.7"/>',
  vpn: '<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  snip: '<circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 16 18 3M16 16 6 3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  gear: '<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  message: '<path d="M3 5h18v12H8l-5 4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  documents: '<path d="M6 2h9l4 4v16H6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M15 2v4h4" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  pictures: '<rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m3 17 6-6 5 5 3-3 4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  person: '<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 21a8 8 0 0 1 16 0" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  home: '<path d="M3 11 12 3l9 8M5 9v12h5v-6h4v6h5V9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  close: '<path d="m5 5 14 14M19 5 5 19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  cortana: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2.6"/>',
  pen: '<path d="m4 20 1-5L16 4l4 4L9 19z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  apps: '<rect x="3" y="3" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="3" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="14" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="14" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  shield: '<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  globe: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  clock: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  game: '<path d="M6 8h12a4 4 0 0 1 4 4l-1 5a2.5 2.5 0 0 1-4.4 1L15 16H9l-1.6 2A2.5 2.5 0 0 1 3 17l-1-5a4 4 0 0 1 4-4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M7 11v3M5.5 12.5h3" stroke="currentColor" stroke-width="1.6"/>',
  update: '<path d="M20 11a8 8 0 1 0-2 6M20 4v7h-7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  display: '<rect x="2" y="4" width="20" height="13" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="1.6"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 18h4" stroke="currentColor" stroke-width="1.6"/>',
  info: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 11v6M12 7.5v.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  storage: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 14h18M7 17h2" stroke="currentColor" stroke-width="1.6"/>',
  sleep: '<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  restart: '<path d="M4 13a8 8 0 1 0 2-6M4 4v5h5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  more: '<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
} as const

export type GlyphName = keyof typeof GLYPHS

/** Monochrome inline line icon (follows currentColor). */
export function Glyph({ name, size = 16, className = '' }: { name: GlyphName; size?: number; className?: string }) {
  return (
    <svg
      className={`glyph ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: GLYPHS[name] }}
    />
  )
}

/** The four-pane Windows logo, drawn with CSS grid. */
export function WinLogo({ size = 22, color }: { size?: number; color?: string }) {
  const style = { width: size, height: size, gap: Math.max(1, Math.round(size / 11)) }
  return (
    <span className="win-logo" style={style} aria-hidden="true">
      {[0, 1, 2, 3].map(i => <i key={i} style={color ? { background: color } : undefined} />)}
    </span>
  )
}
