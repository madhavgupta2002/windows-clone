import { svgIcon } from '../../core'

/**
 * Hand-drawn 32×32 SVG icons in the spirit of the 9x/2000 era (not copies of the originals).
 */
const svg = (body: string) =>
  svgIcon(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">${body}</svg>`)

const monitor = (screen = '#008080', x = 3, y = 2) => `
  <rect x="${x}" y="${y}" width="22" height="18" fill="#c0c0c0" stroke="#000"/>
  <rect x="${x + 3}" y="${y + 3}" width="16" height="11" fill="${screen}" stroke="#808080"/>
  <rect x="${x + 2}" y="${y + 17}" width="18" height="2" fill="#808080"/>`

const folderShape = (fill = '#ffd34f', dark = '#c89b14') => `
  <path d="M2 8h10l2 3h16v17H2z" fill="${dark}" stroke="#000"/>
  <path d="M2 12h28v16H2z" fill="${fill}" stroke="#000"/>
  <path d="M3 13h26" stroke="#fff6c4"/>`

const paper = (x = 7, y = 3, w = 18, h = 25) => `
  <path d="M${x} ${y}h${w - 5}l5 5v${h - 5}H${x}z" fill="#fff" stroke="#000"/>
  <path d="M${x + w - 5} ${y}v5h5" fill="#c0c0c0" stroke="#000"/>`

const lines = (x: number, y: number, n: number, w: number) =>
  Array.from({ length: n }, (_, i) => `<path d="M${x} ${y + i * 3}h${w}" stroke="#000080"/>`).join('')

export const icons = {
  flag: svg(`
    <path d="M4 7q4-2 8 0v8q-4-2-8 0z" fill="#e33"/>
    <path d="M13 7q4 2 8 0v8q-4 2-8 0z" fill="#3b3"/>
    <path d="M4 16q4-2 8 0v8q-4-2-8 0z" fill="#33e"/>
    <path d="M13 16q4 2 8 0v8q-4 2-8 0z" fill="#fd2"/>
    <path d="M1 9h2M0 13h3M1 18h2M0 22h3" stroke="#000" opacity=".6"/>`),

  computer: svg(`${monitor()}
    <rect x="1" y="23" width="28" height="7" fill="#c0c0c0" stroke="#000"/>
    <path d="M4 26h14M4 28h14" stroke="#808080"/><rect x="22" y="25" width="4" height="2" fill="#0a0"/>`),

  recycleBin: svg(`
    <path d="M7 8h18l-2 21H9z" fill="#e0e0e0" stroke="#000"/>
    <path d="M6 6h20v3H6z" fill="#c0c0c0" stroke="#000"/>
    <path d="M11 11l1 16M16 11v16M21 11l-1 16M8 15h16M8 20h16M9 25h14" stroke="#808080"/>`),

  recycleFull: svg(`
    <path d="M7 8h18l-2 21H9z" fill="#e0e0e0" stroke="#000"/>
    <path d="M9 3l6 4-3 3zM16 2h6v5h-6zM20 5l5 2-2 3z" fill="#fff" stroke="#000"/>
    <path d="M6 6h20v3H6z" fill="#c0c0c0" stroke="#000"/>
    <path d="M11 11l1 16M16 11v16M21 11l-1 16M8 15h16M8 20h16M9 25h14" stroke="#808080"/>`),

  folder: svg(folderShape()),

  folderOpen: svg(`
    <path d="M2 7h10l2 3h14v18H2z" fill="#c89b14" stroke="#000"/>
    <path d="M6 14h25l-4 14H2z" fill="#ffd34f" stroke="#000"/>`),

  documents: svg(`${folderShape()}${paper(9, 3, 14, 13)}${lines(11, 9, 2, 8)}`),

  programs: svg(`
    <rect x="2" y="6" width="22" height="18" fill="#c0c0c0" stroke="#000"/>
    <rect x="3" y="7" width="20" height="3" fill="#000080"/>
    <rect x="6" y="13" width="5" height="5" fill="#ffd34f" stroke="#000"/>
    <rect x="14" y="13" width="5" height="5" fill="#3b3" stroke="#000"/>
    <rect x="8" y="12" width="22" height="16" fill="none"/>`),

  docsMenu: svg(`${paper(4, 6, 16, 22)}${paper(10, 2, 16, 22)}${lines(12, 10, 4, 10)}`),

  textFile: svg(`${paper()}${lines(10, 11, 5, 12)}`),

  bitmap: svg(`${paper()}
    <rect x="10" y="11" width="12" height="12" fill="#8cf" stroke="#000"/>
    <path d="M10 23l4-6 3 4 2-2 3 4z" fill="#3a3"/><circle cx="19" cy="14" r="2" fill="#fd2"/>`),

  ie: svg(`
    <ellipse cx="16" cy="17" rx="14" ry="6" fill="none" stroke="#e8b400" stroke-width="2" transform="rotate(-25 16 17)"/>
    <path d="M16 6a10 10 0 1 0 9.6 13H19a4 4 0 0 1-7-1h14a10 10 0 0 0-10-12zm-4 8a4 4 0 0 1 8 0z" fill="#1e5fd0" stroke="#002a80" shape-rendering="auto"/>`),

  network: svg(`
    <ellipse cx="16" cy="12" rx="9" ry="9" fill="#3b8fd8" stroke="#000"/>
    <path d="M7 12h18M16 3v18M10 6q6 6 0 12M22 6q-6 6 0 12" fill="none" stroke="#bfe0ff"/>
    <rect x="1" y="20" width="9" height="7" fill="#c0c0c0" stroke="#000"/><rect x="3" y="22" width="5" height="3" fill="#008080"/>
    <rect x="22" y="20" width="9" height="7" fill="#c0c0c0" stroke="#000"/><rect x="24" y="22" width="5" height="3" fill="#008080"/>
    <path d="M5 27v3h22v-3M16 21v9" stroke="#000"/>`),

  notepad: svg(`
    <rect x="6" y="4" width="20" height="25" fill="#fff" stroke="#000"/>
    <rect x="6" y="4" width="20" height="4" fill="#4aa0e0" stroke="#000"/>
    ${lines(9, 12, 5, 14)}
    <path d="M9 2v4M13 2v4M17 2v4M21 2v4" stroke="#000"/>`),

  calculator: svg(`
    <rect x="6" y="2" width="20" height="28" fill="#c0c0c0" stroke="#000"/>
    <rect x="9" y="5" width="14" height="6" fill="#cfe8c0" stroke="#000"/>
    ${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${9 + c * 5}" y="${14 + r * 5}" width="4" height="3" fill="${c === 2 ? '#c33' : '#fff'}" stroke="#000"/>`).join('')).join('')}`),

  minesweeper: svg(`
    <path d="M16 3v26M3 16h26M7 7l18 18M25 7L7 25" stroke="#000" stroke-width="2"/>
    <circle cx="16" cy="16" r="8" fill="#000" shape-rendering="auto"/>
    <rect x="12" y="12" width="3" height="3" fill="#fff"/>`),

  paint: svg(`
    <path d="M4 18q0-12 13-12t11 9q-1 5-6 4t-4 3q1 5-4 5Q4 27 4 18z" fill="#f2d39b" stroke="#000" shape-rendering="auto"/>
    <circle cx="10" cy="14" r="2" fill="#e33"/><circle cx="15" cy="10" r="2" fill="#33e"/>
    <circle cx="21" cy="11" r="2" fill="#3b3"/><circle cx="10" cy="20" r="2" fill="#fd2"/>
    <path d="M30 2L18 22" stroke="#7a4a1a" stroke-width="3"/>`),

  run: svg(`
    <rect x="2" y="6" width="26" height="20" fill="#c0c0c0" stroke="#000"/>
    <rect x="3" y="7" width="24" height="3" fill="#000080"/>
    <rect x="6" y="15" width="18" height="5" fill="#fff" stroke="#808080"/>
    <path d="M18 2l8 6-8 6z" fill="#3b3" stroke="#000"/>`),

  help: svg(`
    <path d="M5 4h18l4 4v21H5z" fill="#1e5fd0" stroke="#000"/>
    <path d="M7 6h15v21H7z" fill="#5b8fe8"/>
    <text x="15" y="24" font-family="serif" font-weight="bold" font-size="20" fill="#fff" text-anchor="middle">?</text>`),

  find: svg(`${paper(3, 3, 16, 22)}${lines(6, 10, 4, 8)}
    <circle cx="20" cy="18" r="6" fill="#bfe0ff" stroke="#000" stroke-width="2" shape-rendering="auto"/>
    <path d="M24 22l6 7" stroke="#7a4a1a" stroke-width="3"/>`),

  settings: svg(`
    <rect x="3" y="3" width="26" height="24" fill="#c0c0c0" stroke="#000"/>
    <rect x="4" y="4" width="24" height="3" fill="#000080"/>
    <path d="M9 10v14M16 10v14M23 10v14" stroke="#808080"/>
    <rect x="7" y="13" width="4" height="3" fill="#ffd34f" stroke="#000"/>
    <rect x="14" y="18" width="4" height="3" fill="#e33" stroke="#000"/>
    <rect x="21" y="11" width="4" height="3" fill="#3b3" stroke="#000"/>`),

  controlPanel: svg(`${folderShape()}
    <rect x="9" y="15" width="14" height="10" fill="#c0c0c0" stroke="#000"/>
    <path d="M12 17v6M16 17v6M20 17v6" stroke="#808080"/><rect x="11" y="19" width="3" height="2" fill="#e33"/>`),

  printer: svg(`
    <rect x="9" y="3" width="14" height="10" fill="#fff" stroke="#000"/>
    <path d="M3 12h26v12H3z" fill="#c0c0c0" stroke="#000"/>
    <rect x="7" y="20" width="18" height="9" fill="#fff" stroke="#000"/>${lines(10, 23, 2, 12)}`),

  shutdown: svg(`${monitor('#000080')}
    <circle cx="14" cy="11" r="4" fill="none" stroke="#fd2" stroke-width="2" shape-rendering="auto"/>
    <path d="M14 6v5" stroke="#fd2" stroke-width="2"/>
    <rect x="5" y="23" width="18" height="6" fill="#c0c0c0" stroke="#000"/>`),

  msdos: svg(`
    <rect x="2" y="5" width="28" height="22" fill="#c0c0c0" stroke="#000"/>
    <rect x="3" y="6" width="26" height="3" fill="#000080"/>
    <rect x="4" y="10" width="24" height="15" fill="#000"/>
    <text x="5" y="19" font-family="monospace" font-size="8" fill="#c0c0c0">C:\\&gt;_</text>`),

  explorer: svg(`${monitor()}
    <path d="M14 14h7l1 2h8v13H14z" fill="#ffd34f" stroke="#000"/>`),

  update: svg(`
    <circle cx="14" cy="16" r="11" fill="#3b8fd8" stroke="#000" shape-rendering="auto"/>
    <path d="M3 16h22M14 5v22M8 8q6 8 0 16M20 8q-6 8 0 16" fill="none" stroke="#bfe0ff"/>
    <path d="M20 18h11l-5.5 9z" fill="#3b3" stroke="#000"/>`),

  favorites: svg(`${folderShape()}
    <path d="M16 13l2.4 5 5.4.6-4 3.6 1.1 5.3L16 25l-4.9 2.5 1.1-5.3-4-3.6 5.4-.6z" fill="#fd2" stroke="#000" shape-rendering="auto"/>`),

  logoff: svg(`
    <circle cx="10" cy="16" r="7" fill="#fd2" stroke="#000" shape-rendering="auto"/>
    <circle cx="8" cy="16" r="2" fill="#c0c0c0" stroke="#000"/>
    <path d="M16 15h14v3h-3v4h-3v-4h-2v3h-3v-3h-3z" fill="#fd2" stroke="#000"/>`),

  drive: svg(`
    <path d="M2 14l4-6h20l4 6v10H2z" fill="#c0c0c0" stroke="#000"/>
    <path d="M2 14h28" stroke="#000"/><rect x="5" y="18" width="14" height="2" fill="#808080"/>
    <rect x="24" y="18" width="3" height="2" fill="#0c0"/>`),

  cdrom: svg(`
    <circle cx="16" cy="16" r="13" fill="#d8dce8" stroke="#000" shape-rendering="auto"/>
    <path d="M16 3a13 13 0 0 1 11 6L16 16z" fill="#f4c0f0" opacity=".8"/>
    <circle cx="16" cy="16" r="3" fill="#fff" stroke="#000" shape-rendering="auto"/>`),

  floppy: svg(`
    <path d="M4 3h22l3 3v23H4z" fill="#333" stroke="#000"/>
    <rect x="9" y="3" width="13" height="9" fill="#c0c0c0"/><rect x="17" y="4" width="3" height="7" fill="#333"/>
    <rect x="7" y="16" width="19" height="13" fill="#fff"/>`),

  speaker: svg(`
    <path d="M5 12h6l7-7v22l-7-7H5z" fill="#c0c0c0" stroke="#000"/>
    <path d="M21 11q3 5 0 10M24 8q5 8 0 16" fill="none" stroke="#000" stroke-width="2" shape-rendering="auto"/>`),

  mail: svg(`
    <rect x="2" y="7" width="28" height="19" fill="#fff" stroke="#000"/>
    <path d="M2 7l14 11L30 7M2 26l10-9M30 26L20 17" fill="none" stroke="#000"/>
    <rect x="22" y="9" width="6" height="5" fill="#e33"/>`),

  showDesktop: svg(`
    <rect x="3" y="5" width="26" height="20" fill="#008080" stroke="#000"/>
    <rect x="6" y="8" width="4" height="4" fill="#fff"/><rect x="6" y="15" width="4" height="4" fill="#fff"/>
    <path d="M14 26l8-14 4 2-8 14-5 2z" fill="#fd2" stroke="#000"/>`),

  channels: svg(`
    <circle cx="16" cy="16" r="13" fill="#000080" stroke="#000" shape-rendering="auto"/>
    <path d="M16 6l3 7h7l-6 4 2 8-6-5-6 5 2-8-6-4h7z" fill="#fd2" shape-rendering="auto"/>`),

  briefcase: svg(`
    <rect x="12" y="4" width="8" height="5" fill="none" stroke="#000" stroke-width="2"/>
    <rect x="2" y="9" width="28" height="19" fill="#b5763a" stroke="#000"/>
    <path d="M2 16h28" stroke="#6b3f14"/><rect x="14" y="14" width="4" height="4" fill="#fd2" stroke="#000"/>`),

  msn: svg(`
    <circle cx="16" cy="16" r="13" fill="#fff" stroke="#000" shape-rendering="auto"/>
    <path d="M6 22V10l5 8 5-8 5 8 5-8v12" fill="none" stroke="#1e5fd0" stroke-width="3" shape-rendering="auto"/>`),

  welcome: svg(`
    <rect x="2" y="4" width="28" height="24" fill="#000080" stroke="#000"/>
    <path d="M9 10q3-1.5 6 0v6q-3-1.5-6 0z" fill="#e33"/><path d="M16 10q3 1.5 6 0v6q-3 1.5-6 0z" fill="#3b3"/>
    <path d="M9 17q3-1.5 6 0v6q-3-1.5-6 0z" fill="#33e"/><path d="M16 17q3 1.5 6 0v6q-3 1.5-6 0z" fill="#fd2"/>`),

  restore: svg(`
    <circle cx="16" cy="16" r="12" fill="#fff" stroke="#000" stroke-width="2" shape-rendering="auto"/>
    <path d="M16 8v8h6" stroke="#000" stroke-width="2"/>
    <path d="M2 10l4 6 4-6z" fill="#3b3" stroke="#000"/>`),

  clock: svg(`
    <circle cx="16" cy="16" r="13" fill="#fff" stroke="#000" stroke-width="2" shape-rendering="auto"/>
    <path d="M16 6v10l6 4" stroke="#000080" stroke-width="2" fill="none"/>`),

  display: svg(`${monitor('#3a6ea5')}
    <rect x="9" y="8" width="4" height="4" fill="#fff"/>
    <rect x="5" y="23" width="18" height="6" fill="#c0c0c0" stroke="#000"/>`),

  tips: svg(`
    <path d="M16 3a9 9 0 0 0-5 16v4h10v-4a9 9 0 0 0-5-16z" fill="#fd2" stroke="#000" shape-rendering="auto"/>
    <rect x="11" y="23" width="10" height="5" fill="#c0c0c0" stroke="#000"/>`),

  info: svg(`
    <circle cx="16" cy="16" r="13" fill="#fff" stroke="#000080" stroke-width="2" shape-rendering="auto"/>
    <text x="16" y="24" font-family="serif" font-weight="bold" font-size="20" fill="#000080" text-anchor="middle">i</text>`),
} as const

export type IconName = keyof typeof icons
