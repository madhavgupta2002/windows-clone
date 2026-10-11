import { svgIcon } from '../../core'

/** 32x32 low-colour icons, drawn in the EGA / VGA palette with crisp edges. */
const ico = (body: string) =>
  svgIcon(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges">${body}</svg>`)

/** A small window frame (shared by several icons). */
const win = (fill: string) =>
  `<rect x="2" y="4" width="28" height="22" fill="#fff" stroke="#000"/><rect x="2.5" y="4.5" width="27" height="4" fill="${fill}"/><line x1="2" y1="9" x2="30" y2="9" stroke="#000"/>`

export const ICONS = {
  notepad: ico(
    `<rect x="6" y="3" width="20" height="26" fill="#fff" stroke="#000"/>` +
      `<rect x="6" y="3" width="20" height="4" fill="#00aaaa" stroke="#000"/>` +
      [11, 14, 17, 20, 23].map(y => `<line x1="9" y1="${y}" x2="23" y2="${y}" stroke="#0000aa"/>`).join('') +
      [9, 13, 17, 21].map(x => `<rect x="${x}" y="1" width="2" height="4" fill="#555"/>`).join(''),
  ),
  calculator: ico(
    `<rect x="6" y="2" width="20" height="28" fill="#aaa" stroke="#000"/><rect x="9" y="5" width="14" height="6" fill="#55ff55" stroke="#000"/>` +
      [0, 1, 2, 3].flatMap(r => [0, 1, 2].map(c => `<rect x="${9 + c * 5}" y="${14 + r * 4}" width="4" height="3" fill="${c === 2 ? '#aa0000' : '#fff'}" stroke="#000" stroke-width=".5"/>`)).join(''),
  ),
  paint: ico(
    `<rect x="3" y="5" width="26" height="22" fill="#fff" stroke="#000"/><circle cx="11" cy="13" r="4" fill="#aa0000"/><rect x="15" y="15" width="8" height="7" fill="#0000aa"/>` +
      `<path d="M6 24 L12 17 L16 22 Z" fill="#00aa00"/><path d="M20 2 L30 12 L27 15 L17 5 Z" fill="#aa5500" stroke="#000"/><path d="M17 5 L14 10 L19 8 Z" fill="#000"/>`,
  ),
  clock: ico(
    `<circle cx="16" cy="16" r="13" fill="#fff" stroke="#000" stroke-width="2"/>` +
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => {
        const a = (i * Math.PI) / 6
        return `<rect x="${(16 + Math.sin(a) * 10.5 - 1).toFixed(1)}" y="${(16 - Math.cos(a) * 10.5 - 1).toFixed(1)}" width="2" height="2" fill="${i % 3 ? '#00aaaa' : '#0000aa'}"/>`
      }).join('') +
      `<line x1="16" y1="16" x2="16" y2="8" stroke="#000" stroke-width="2"/><line x1="16" y1="16" x2="22" y2="19" stroke="#000" stroke-width="2"/>`,
  ),
  reversi: ico(
    `<rect x="2" y="2" width="28" height="28" fill="#00aa00" stroke="#000"/>` +
      [9, 16, 23].map(p => `<line x1="${p}" y1="2" x2="${p}" y2="30" stroke="#000"/><line x1="2" y1="${p}" x2="30" y2="${p}" stroke="#000"/>`).join('') +
      `<circle cx="12.5" cy="12.5" r="3" fill="#000"/><circle cx="19.5" cy="19.5" r="3" fill="#000"/><circle cx="19.5" cy="12.5" r="3" fill="#fff" stroke="#000"/><circle cx="12.5" cy="19.5" r="3" fill="#fff" stroke="#000"/>`,
  ),
  dos: ico(
    `<rect x="2" y="4" width="28" height="24" fill="#000" stroke="#aaa"/><rect x="2.5" y="4.5" width="27" height="5" fill="#0000aa"/>` +
      `<text x="5" y="20" font-family="monospace" font-size="8" font-weight="bold" fill="#aaa">C:\\&gt;</text><rect x="21" y="18" width="5" height="2" fill="#aaa"/>`,
  ),
  dosexec: ico(
    `<rect x="4" y="3" width="24" height="18" fill="#aaa" stroke="#000"/><rect x="7" y="6" width="18" height="12" fill="#0000aa"/>` +
      `<text x="8" y="14" font-family="monospace" font-size="6" font-weight="bold" fill="#fff">DOS</text>` +
      `<rect x="2" y="23" width="28" height="6" fill="#aaa" stroke="#000"/><rect x="18" y="25" width="8" height="2" fill="#000"/>`,
  ),
  progman: ico(
    win('#0000aa') +
      [0, 1, 2].map(c => `<rect x="${6 + c * 8}" y="12" width="5" height="5" fill="${['#aa0000', '#00aa00', '#aaaa00'][c]}" stroke="#000"/>`).join('') +
      [0, 1].map(c => `<rect x="${6 + c * 8}" y="19" width="5" height="5" fill="${['#00aaaa', '#aa00aa'][c]}" stroke="#000"/>`).join(''),
  ),
  filemgr: ico(
    `<rect x="4" y="3" width="24" height="26" fill="#aaaa00" stroke="#000"/>` +
      [5, 13, 21].map(y => `<rect x="7" y="${y}" width="18" height="6" fill="#ffff55" stroke="#000"/><rect x="13" y="${y + 2}" width="6" height="2" fill="#000"/>`).join(''),
  ),
  control: ico(
    `<rect x="3" y="3" width="26" height="20" fill="#aaa" stroke="#000"/><rect x="6" y="6" width="20" height="14" fill="#00aaaa" stroke="#000"/>` +
      `<rect x="10" y="23" width="12" height="3" fill="#aaa" stroke="#000"/><rect x="6" y="26" width="20" height="3" fill="#aaa" stroke="#000"/>` +
      `<rect x="9" y="9" width="3" height="8" fill="#ff5555"/><rect x="14" y="12" width="3" height="5" fill="#ffff55"/><rect x="19" y="10" width="3" height="7" fill="#55ff55"/>`,
  ),
  minesweeper: ico(
    `<rect x="2" y="2" width="28" height="28" fill="#c0c0c0" stroke="#808080"/>` +
      `<path d="M16 5V27M5 16H27M8 8L24 24M24 8L8 24" stroke="#000" stroke-width="2"/><circle cx="16" cy="16" r="7" fill="#000"/><rect x="12" y="12" width="3" height="3" fill="#fff"/>`,
  ),
  group: ico(
    win('#0000aa') +
      [0, 1, 2].map(c => `<rect x="${6 + c * 8}" y="13" width="4" height="4" fill="#aaa" stroke="#000"/>`).join('') +
      [0, 1, 2].map(c => `<rect x="${6 + c * 8}" y="19" width="4" height="4" fill="#aaa" stroke="#000"/>`).join(''),
  ),
  readme: ico(
    `<path d="M7 3H21L26 8V29H7Z" fill="#fff" stroke="#000"/><path d="M21 3V8H26" fill="none" stroke="#000"/>` +
      `<text x="10" y="22" font-family="serif" font-size="13" font-weight="bold" fill="#0000aa">A</text><line x1="18" y1="14" x2="23" y2="14" stroke="#000"/><line x1="18" y1="18" x2="23" y2="18" stroke="#000"/>`,
  ),
  setup: ico(
    `<rect x="4" y="12" width="16" height="16" fill="#aaa" stroke="#000"/><rect x="7" y="15" width="10" height="7" fill="#0000aa"/>` +
      `<rect x="14" y="3" width="14" height="14" fill="#000" stroke="#555"/><rect x="18" y="4" width="6" height="4" fill="#aaa"/><rect x="17" y="11" width="8" height="5" fill="#fff"/>`,
  ),
  write: ico(
    `<rect x="6" y="3" width="18" height="26" fill="#fff" stroke="#000"/>` +
      [8, 11, 14, 17, 20].map(y => `<line x1="9" y1="${y}" x2="21" y2="${y}" stroke="#555"/>`).join('') +
      `<path d="M28 6L14 22L12 26L16 24L30 8Z" fill="#aa0000" stroke="#000"/>`,
  ),
  color: ico(
    `<rect x="3" y="3" width="26" height="26" fill="#fff" stroke="#000"/>` +
      ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'].map((c, i) => `<rect x="${5 + (i % 3) * 8}" y="${6 + Math.floor(i / 3) * 11}" width="6" height="8" fill="${c}" stroke="#000"/>`).join(''),
  ),
  desktop: ico(
    `<rect x="3" y="3" width="26" height="20" fill="#aaa" stroke="#000"/><rect x="6" y="6" width="20" height="14" fill="#008080" stroke="#000"/>` +
      `<rect x="9" y="8" width="10" height="7" fill="#fff" stroke="#000"/><rect x="9.5" y="8.5" width="9" height="2" fill="#000080"/>` +
      `<rect x="10" y="23" width="12" height="3" fill="#aaa" stroke="#000"/><rect x="6" y="26" width="20" height="3" fill="#aaa" stroke="#000"/>`,
  ),
  datetime: ico(
    `<rect x="2" y="6" width="18" height="22" fill="#fff" stroke="#000"/><rect x="2.5" y="6.5" width="17" height="5" fill="#aa0000"/>` +
      `<text x="5" y="24" font-family="sans-serif" font-size="10" font-weight="bold">12</text>` +
      `<circle cx="22" cy="12" r="8" fill="#ffff55" stroke="#000"/><line x1="22" y1="12" x2="22" y2="6" stroke="#000"/><line x1="22" y1="12" x2="26" y2="13" stroke="#000"/>`,
  ),
  tasklist: ico(win('#0000aa') + [12, 16, 20].map(y => `<line x1="6" y1="${y}" x2="26" y2="${y}" stroke="#000"/>`).join('')),
  exe: ico(win('#0000aa')),
  folder: ico(`<path d="M2 8H12L14 6H22V10H30V27H2Z" fill="#ffff55" stroke="#000"/><path d="M2 12H30" stroke="#000"/>`),
  drive: ico(`<rect x="2" y="10" width="28" height="13" fill="#c0c0c0" stroke="#000"/><rect x="5" y="15" width="14" height="3" fill="#000"/><rect x="24" y="15" width="3" height="3" fill="#00aa00"/>`),
  file: ico(`<path d="M7 3H21L26 8V29H7Z" fill="#fff" stroke="#000"/><path d="M21 3V8H26" fill="none" stroke="#000"/>`),
} as const
