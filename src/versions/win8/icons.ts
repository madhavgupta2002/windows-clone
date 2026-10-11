import { svgIcon } from '../../core'

/** Flat, single-colour "Metro" glyphs. `glyph()` returns raw SVG markup; `ICONS` are data URIs. */
const P: Record<string, string> = {
  flag: '<path d="M2 5.5 10.5 4.3v8.2H2zM11.7 4.1 22 2.6v9.9H11.7zM2 13.5h8.5v8.2L2 20.5zM11.7 13.5H22v9.9l-10.3-1.5z"/>',
  ie: '<path d="M12 3.5a8.5 8.5 0 1 0 8.2 10.8h-4.9a3.7 3.7 0 0 1-6.9-1.6h12.1A8.5 8.5 0 0 0 12 3.5zm-3.6 7a3.7 3.7 0 0 1 7.2 0z"/><path d="M3.5 18.5C1 15 9 6 18 3.2c3.4-1 4 1.2 2.5 3.4" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  folder: '<path d="M2 5h7l2 2.5h11V19H2z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2 10h20" stroke="currentColor" stroke-width="1.6"/>',
  notepad: '<path d="M5 3h11l3 3v15H5z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 9h8M8 12.5h8M8 16h5" stroke="currentColor" stroke-width="1.6"/>',
  calc: '<rect x="5" y="2.5" width="14" height="19" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="7.5" y="5" width="9" height="3.5"/><path d="M8 12h2v2H8zm3 0h2v2h-2zm3 0h2v2h-2zM8 16h2v2H8zm3 0h2v2h-2zm3 0h2v2h-2z"/>',
  paint: '<path d="M12 3a9 9 0 0 0 0 18c1.6 0 2-1 1.3-2.2-.8-1.3.1-2.8 1.7-2.8H17a4 4 0 0 0 4-4c0-5-4-9-9-9z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="7.5" cy="11" r="1.4"/><circle cx="10" cy="7" r="1.4"/><circle cx="14.5" cy="7" r="1.4"/><circle cx="17" cy="11" r="1.4"/>',
  mines: '<circle cx="12" cy="13" r="6"/><path d="M12 4v18M3 13h18M5.8 6.8l12.4 12.4M18.2 6.8 5.8 19.2" stroke="currentColor" stroke-width="1.6"/>',
  mail: '<rect x="2.5" y="5" width="19" height="14" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m2.5 5 9.5 8 9.5-8" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 9h18M7.5 2.5v4M16.5 2.5v4" stroke="currentColor" stroke-width="1.6"/><path d="M6 12h3v2.5H6zm4.5 0h3v2.5h-3zm4.5 0h3v2.5h-3zM6 16h3v2.5H6zm4.5 0h3v2.5h-3z"/>',
  photos: '<rect x="2.5" y="4.5" width="19" height="15" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m4 18 5.5-6 4 4 2.5-2.5L20 18z"/><circle cx="16" cy="9" r="1.8"/>',
  weather: '<circle cx="9" cy="9" r="3.5"/><path d="M9 2v2M9 14v2M2 9h2M14 9h2M4 4l1.4 1.4M12.6 12.6 14 14M4 14l1.4-1.4M12.6 5.4 14 4" stroke="currentColor" stroke-width="1.4"/><path d="M10 20h9a3 3 0 0 0 0-6 4.5 4.5 0 0 0-8.6 1A2.5 2.5 0 0 0 10 20z"/>',
  news: '<path d="M3 4h15v15a2 2 0 0 0 2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M18 8h3v11a2 2 0 0 1-4 0" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6 7h9v4H6zM6 13.5h9M6 16.5h9" stroke="currentColor" stroke-width="1.4"/>',
  store: '<path d="M3 7h18l-1 14H4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 7a3.5 3.5 0 0 1 7 0" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 11h3.6v3.6H8zm4.4 0H16v3.6h-3.6zM8 15.4h3.6V19H8zm4.4 0H16V19h-3.6z"/>',
  music: '<path d="M9 17.5V5l11-2.5V15" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="6.5" cy="17.5" r="2.7"/><circle cx="17.5" cy="15" r="2.7"/>',
  settings: '<path d="M10.3 2h3.4l.5 2.6 1.6.9 2.5-1 1.7 3-2 1.7v1.6l2 1.7-1.7 3-2.5-1-1.6.9-.5 2.6h-3.4l-.5-2.6-1.6-.9-2.5 1-1.7-3 2-1.7V9.2l-2-1.7 1.7-3 2.5 1 1.6-.9z" fill="none" stroke="currentColor" stroke-width="1.5" transform="translate(0 1.5)"/><circle cx="12" cy="11.5" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  desktop: '<rect x="2.5" y="4" width="19" height="12.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 20.5h6M12 16.5v4" stroke="currentColor" stroke-width="1.6"/>',
  user: '<circle cx="12" cy="8" r="4.5"/><path d="M3 22c0-5 4-8 9-8s9 3 9 8z"/>',
  search: '<circle cx="14" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.7 14.3 3 21" stroke="currentColor" stroke-width="2.4"/>',
  share: '<circle cx="18" cy="5" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="6" cy="12" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="19" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m8.3 10.8 7.4-4.4M8.3 13.2l7.4 4.4" stroke="currentColor" stroke-width="1.6"/>',
  devices: '<rect x="2.5" y="4" width="13" height="10" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6 18h6" stroke="currentColor" stroke-width="1.6"/><rect x="17" y="8" width="5" height="12" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  power: '<path d="M12 3v8" stroke="currentColor" stroke-width="2"/><path d="M7 6.2a7.5 7.5 0 1 0 10 0" fill="none" stroke="currentColor" stroke-width="2"/>',
  network: '<path d="M3 20h3v-4H3zm5 0h3v-8H8zm5 0h3V8h-3zm5 0h3V4h-3z"/>',
  volume: '<path d="M3 9h4l5-4v14l-5-4H3z"/><path d="M15 8.5q4 3.5 0 7m2.5-10q7.5 6.5 0 13" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  brightness: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" stroke="currentColor" stroke-width="1.6"/>',
  bell: '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21h4" stroke="currentColor" stroke-width="1.8"/>',
  keyboard: '<rect x="2" y="6" width="20" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 9h2v2H5zm4 0h2v2H9zm4 0h2v2h-2zm4 0h2v2h-2zM7 14h10v1.6H7z"/>',
  recycle: '<path d="M6 6h12l-1.2 15H7.2z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 6h16M9.5 6V3.5h5V6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 10v8M14 10v8" stroke="currentColor" stroke-width="1.3"/>',
  computer: '<rect x="2.5" y="3.5" width="19" height="13" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 21h8M12 16.5V21" stroke="currentColor" stroke-width="1.6"/>',
  help: '<circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 9.5a3 3 0 1 1 4.5 2.6c-1 .6-1.5 1.2-1.5 2.4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="17.5" r="1.2"/>',
  back: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M13 7l-5 5 5 5M8 12h9" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  down: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m7 10 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  up: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m7 14 5-5 5 5" fill="none" stroke="currentColor" stroke-width="1.8"/>',
}

export type GlyphName = keyof typeof P & string

/** Inline SVG markup in `currentColor`, for use with dangerouslySetInnerHTML-free <Glyph>. */
export const glyphMarkup = (name: string) => P[name] ?? ''

/** Data URI of a glyph in a fixed colour (for window/taskbar icons, which render as <img>). */
export const glyphUri = (name: string, color = '#fff', bg?: string) =>
  svgIcon(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" color="${color}">` +
    (bg ? `<rect width="24" height="24" fill="${bg}"/>` : '') +
    `<g ${bg ? 'transform="translate(4 4) scale(.667)"' : ''}>${P[name] ?? ''}</g></svg>`,
  )
