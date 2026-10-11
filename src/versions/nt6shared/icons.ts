import { svgIcon } from '../../core'

/**
 * Original inline-SVG icons used by the XP and Vista shells (no Microsoft bitmaps).
 * Each is a 48x48 drawing turned into a data URI.
 */
const svg = (body: string) => svgIcon(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${body}</svg>`)
const lin = (id: string, a: string, b: string, vertical = true) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`

const folderBody = (extra = '') =>
  `<defs>${lin('f', '#ffe792', '#f0bf3c')}${lin('b', '#e7b33a', '#c48a17')}</defs>` +
  `<path d="M4 11a2 2 0 0 1 2-2h12l4 4h20a2 2 0 0 1 2 2v23a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="url(#b)"/>` +
  extra +
  `<path d="M3 19a2 2 0 0 1 2-2h38a2 2 0 0 1 2 2l-1.5 19a2 2 0 0 1-2 2h-35a2 2 0 0 1-2-2z" fill="url(#f)" stroke="#c48a17" stroke-width=".8"/>`

export const ICONS = {
  computer: svg(
    `<defs>${lin('g', '#f2f2ec', '#b9b9ad')}${lin('s', '#6fb6ff', '#0b4db8', false)}</defs>` +
    `<rect x="5" y="5" width="38" height="29" rx="3" fill="url(#g)" stroke="#6b6b60"/>` +
    `<rect x="9" y="9" width="30" height="21" fill="url(#s)"/><path d="M9 9h30L9 24z" fill="#fff" opacity=".18"/>` +
    `<path d="M18 34h12l2 5H16z" fill="#a8a89c"/><rect x="10" y="39" width="28" height="5" rx="1.5" fill="url(#g)" stroke="#6b6b60"/>`,
  ),
  folder: svg(folderBody()),
  drive: svg(
    `<defs>${lin('v', '#f4f4f0', '#a9a99d')}</defs>` +
    `<path d="M6 22l6-10h24l6 10z" fill="#d9d9d0" stroke="#66665c"/><rect x="6" y="22" width="36" height="12" rx="2" fill="url(#v)" stroke="#66665c"/>` +
    `<rect x="10" y="27" width="16" height="2" fill="#777"/><circle cx="36" cy="28" r="1.8" fill="#3ccf3c"/>`,
  ),
  documents: svg(folderBody(`<rect x="12" y="8" width="22" height="20" fill="#fff" stroke="#999" stroke-width=".8"/><path d="M15 13h15M15 17h15M15 21h11" stroke="#7d9ccf" stroke-width="1.5"/>`)),
  pictures: svg(folderBody(`<rect x="12" y="7" width="24" height="18" fill="#fff" stroke="#999" stroke-width=".8"/><rect x="14" y="9" width="20" height="13" fill="#7fc3ff"/><path d="M14 22l6-7 4 4 3-3 7 6z" fill="#3e9a2a"/>`)),
  music: svg(folderBody(`<path d="M20 7v14a4 4 0 1 0 2 3.5V12l10-2v9a4 4 0 1 0 2 3.5V5z" fill="#2a63c9"/>`)),
  recycle: svg(
    `<defs>${lin('b', '#eef4fa', '#9fb2c4', false)}</defs>` +
    `<path d="M11 13h26l-3.2 29a2 2 0 0 1-2 1.8H16.2a2 2 0 0 1-2-1.8z" fill="url(#b)" stroke="#5a6a7a"/>` +
    `<ellipse cx="24" cy="13" rx="14" ry="3.5" fill="#d7e2ec" stroke="#5a6a7a"/>` +
    `<path d="M17 18l1.5 21M24 18v21M31 18l-1.5 21" stroke="#7f93a6" stroke-width="1.2"/>` +
    `<path d="M19 30l5-7 5 7h-3v5h-4v-5z" fill="#36a336" stroke="#1f6e1f" stroke-width=".6"/>`,
  ),
  ie: svg(
    `<defs><radialGradient id="e" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9ed4ff"/><stop offset="1" stop-color="#0d4fc2"/></radialGradient></defs>` +
    `<path d="M12.5 25h23a11.5 11.5 0 1 0-3.4 8.2" fill="none" stroke="#0d4fc2" stroke-width="8"/><path d="M12.5 25h23a11.5 11.5 0 1 0-3.4 8.2" fill="none" stroke="url(#e)" stroke-width="5.5"/>` +
    `<ellipse cx="24" cy="24" rx="22" ry="8.5" fill="none" stroke="#f2b705" stroke-width="3" transform="rotate(-28 24 24)"/>`,
  ),
  notepad: svg(
    `<rect x="9" y="6" width="30" height="38" rx="2" fill="#fff" stroke="#6c7a89"/>` +
    `<rect x="9" y="6" width="30" height="7" rx="2" fill="#4c86d6"/>` +
    `<path d="M13 19h22M13 24h22M13 29h22M13 34h16" stroke="#9ab" stroke-width="1.5"/>` +
    `<path d="M14 4v5M20 4v5M26 4v5M32 4v5" stroke="#555" stroke-width="2" stroke-linecap="round"/>`,
  ),
  textfile: svg(
    `<path d="M10 4h20l8 8v32H10z" fill="#fff" stroke="#7a8a99"/><path d="M30 4v8h8" fill="#e4ebf2" stroke="#7a8a99"/>` +
    `<path d="M14 18h20M14 23h20M14 28h20M14 33h14" stroke="#9ab" stroke-width="1.5"/>`,
  ),
  paint: svg(
    `<defs>${lin('p', '#f3d9a8', '#c99a52')}</defs>` +
    `<path d="M24 6C11 6 4 15 4 24s7 18 16 18c4 0 4-4 2-6s0-6 4-6h6c8 0 12-4 12-10C44 12 36 6 24 6z" fill="url(#p)" stroke="#8a6630"/>` +
    `<circle cx="14" cy="22" r="3.5" fill="#e33"/><circle cx="20" cy="14" r="3.5" fill="#fc0"/><circle cx="30" cy="13" r="3.5" fill="#3b3"/><circle cx="37" cy="20" r="3.5" fill="#36f"/>` +
    `<path d="M44 30L28 44" stroke="#6b4a1e" stroke-width="3" stroke-linecap="round"/>`,
  ),
  calculator: svg(
    `<defs>${lin('c', '#f4f4f0', '#b6b6aa')}</defs>` +
    `<rect x="9" y="4" width="30" height="40" rx="3" fill="url(#c)" stroke="#5b5b52"/>` +
    `<rect x="13" y="8" width="22" height="8" fill="#d6edd0" stroke="#6b7a68"/>` +
    [0, 1, 2, 3].flatMap(r => [0, 1, 2].map(c => `<rect x="${13 + c * 8}" y="${20 + r * 6}" width="6" height="4" rx="1" fill="${c === 2 ? '#5d86c9' : '#fff'}" stroke="#777" stroke-width=".5"/>`)).join(''),
  ),
  mine: svg(
    `<g stroke="#222" stroke-width="3" stroke-linecap="round"><path d="M24 6v36M6 24h36M11 11l26 26M37 11L11 37"/></g>` +
    `<circle cx="24" cy="24" r="12" fill="#222"/><circle cx="20" cy="20" r="3.5" fill="#fff"/>`,
  ),
  cards: svg(
    `<rect x="6" y="8" width="24" height="34" rx="3" fill="#fff" stroke="#556" transform="rotate(-10 18 25)"/>` +
    `<rect x="18" y="6" width="24" height="34" rx="3" fill="#fff" stroke="#556"/>` +
    `<path d="M30 30c-6-5-8-8-8-11a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 3-2 6-8 11z" fill="#d22"/>`,
  ),
  controlPanel: svg(
    `<defs>${lin('k', '#7fb2f0', '#2357b8')}</defs>` +
    `<rect x="4" y="8" width="40" height="32" rx="4" fill="url(#k)" stroke="#173f8a"/>` +
    `<path d="M14 14v20M24 14v20M34 14v20" stroke="#dfe9f8" stroke-width="2"/>` +
    `<rect x="10" y="17" width="8" height="5" rx="1" fill="#f3c24a"/><rect x="20" y="27" width="8" height="5" rx="1" fill="#6fd06a"/><rect x="30" y="20" width="8" height="5" rx="1" fill="#f37b5a"/>`,
  ),
  display: svg(
    `<defs>${lin('d', '#5aa0f0', '#bfe3ff')}</defs>` +
    `<rect x="4" y="6" width="40" height="29" rx="3" fill="#ddd" stroke="#555"/><rect x="8" y="10" width="32" height="21" fill="url(#d)"/>` +
    `<path d="M8 31c8-9 18-9 32-5v5z" fill="#4c9e2a"/><path d="M18 35h12l2 6H16z" fill="#aaa"/>`,
  ),
  help: svg(
    `<defs><radialGradient id="h" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#8cc4ff"/><stop offset="1" stop-color="#1450b8"/></radialGradient></defs>` +
    `<circle cx="24" cy="24" r="19" fill="url(#h)" stroke="#0e3a85"/>` +
    `<path d="M18 19a6 6 0 1 1 9 5c-2 1.2-3 2.4-3 4.5V30" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="36" r="2.5" fill="#fff"/>`,
  ),
  search: svg(
    `<circle cx="20" cy="20" r="12" fill="#cfe7ff" fill-opacity=".7" stroke="#3a5e8c" stroke-width="4"/>` +
    `<path d="M29 29l12 12" stroke="#7a5a2a" stroke-width="6" stroke-linecap="round"/>`,
  ),
  run: svg(
    `<rect x="4" y="8" width="40" height="32" rx="2" fill="#fff" stroke="#4a6a99"/><rect x="4" y="8" width="40" height="7" rx="2" fill="#2f63c4"/>` +
    `<path d="M14 30l10-10M24 20h-7M24 20v7" stroke="#2a8a2a" stroke-width="3" stroke-linecap="round" fill="none"/>`,
  ),
  network: svg(
    `<defs><radialGradient id="n" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9fe0ff"/><stop offset="1" stop-color="#1b6bbf"/></radialGradient></defs>` +
    `<circle cx="24" cy="24" r="18" fill="url(#n)" stroke="#124d8a"/>` +
    `<path d="M10 18c6 3 22 3 28 0M10 30c6-3 22-3 28 0M24 6c-8 10-8 26 0 36M24 6c8 10 8 26 0 36" fill="none" stroke="#e8f6ff" stroke-width="1.4"/>` +
    `<path d="M14 14c3 4 6 4 8 8s-2 6 0 9 6 2 6 6" fill="none" stroke="#4caf3a" stroke-width="3"/>`,
  ),
  user: svg(
    `<defs>${lin('u', '#ffcf5a', '#f07a17')}</defs>` +
    `<rect x="2" y="2" width="44" height="44" rx="6" fill="url(#u)"/>` +
    [0, 72, 144, 216, 288].map(a => `<ellipse cx="24" cy="14" rx="6" ry="10" fill="#fff" opacity=".85" transform="rotate(${a} 24 24)"/>`).join('') +
    `<circle cx="24" cy="24" r="5" fill="#e3a10a"/>`,
  ),
  logoff: svg(
    `<defs>${lin('l', '#ffd36b', '#e48a0e')}</defs><rect x="4" y="4" width="40" height="40" rx="6" fill="url(#l)" stroke="#a65c00"/>` +
    `<path d="M14 24h18M26 16l8 8-8 8" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  ),
  power: svg(
    `<defs>${lin('o', '#ff8a65', '#c9230c')}</defs><rect x="4" y="4" width="40" height="40" rx="6" fill="url(#o)" stroke="#8a1400"/>` +
    `<path d="M17 15a12 12 0 1 0 14 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M24 10v14" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
  ),
  restart: svg(
    `<defs>${lin('r', '#9be07a', '#2f8f14')}</defs><rect x="4" y="4" width="40" height="40" rx="6" fill="url(#r)" stroke="#1b5e05"/>` +
    `<path d="M33 18a11 11 0 1 0 2 9" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M36 10v10H26" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  ),
  standby: svg(
    `<defs>${lin('y', '#ffe680', '#e0a800')}</defs><rect x="4" y="4" width="40" height="40" rx="6" fill="url(#y)" stroke="#8a6500"/>` +
    `<path d="M28 12a12 12 0 1 0 8 18 10 10 0 0 1-8-18z" fill="#fff"/>`,
  ),
  welcome: svg(
    `<defs><radialGradient id="w" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#bff3ff"/><stop offset=".5" stop-color="#2fa3d8"/><stop offset="1" stop-color="#0b4a7a"/></radialGradient></defs>` +
    `<rect x="4" y="6" width="40" height="34" rx="3" fill="#eaf3fb" stroke="#46698c"/><rect x="4" y="6" width="40" height="7" rx="3" fill="#5b87b5"/>` +
    `<circle cx="24" cy="27" r="9" fill="url(#w)"/>`,
  ),
  speaker: svg(`<path d="M8 18h8l10-8v28l-10-8H8z" fill="#ddd" stroke="#333" stroke-width="2"/><path d="M31 17a9 9 0 0 1 0 14M35 12a15 15 0 0 1 0 24" fill="none" stroke="#333" stroke-width="2.5"/>`),
  shield: svg(`<path d="M24 4l16 6v12c0 11-7 19-16 22C15 41 8 33 8 22V10z" fill="#d22" stroke="#7a0000" stroke-width="2"/><path d="M24 14v12M24 31v3" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`),
  info: svg(`<circle cx="24" cy="24" r="19" fill="#2c6fd6" stroke="#0d3a8a" stroke-width="2"/><path d="M24 21v14" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="24" cy="14" r="3" fill="#fff"/>`),
  lock: svg(`<rect x="10" y="20" width="28" height="22" rx="3" fill="#f2c13a" stroke="#8a6500" stroke-width="2"/><path d="M16 20v-6a8 8 0 0 1 16 0v6" fill="none" stroke="#666" stroke-width="4"/>`),
}

export type IconName = keyof typeof ICONS

/** Four-pane wavy flag in the XP palette (drawn from scratch, not the trademarked bitmap). */
export const FLAG_SVG = svgIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">` +
  `<path d="M4 8c6-3 11-3 18 0l-3 15c-6-3-11-3-18 0z" fill="#f35325"/>` +
  `<path d="M25 9c6 3 11 3 18 0l-3 15c-7 3-12 3-18 0z" fill="#81bc06"/>` +
  `<path d="M1 26c6-3 11-3 18 0l-3 15c-6-3-11-3-18 0z" fill="#05a6f0"/>` +
  `<path d="M22 27c6 3 11 3 18 0l-3 15c-7 3-12 3-18 0z" fill="#ffba08"/></svg>`,
)
