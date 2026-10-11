import { svgIcon } from '../../core'

/** Self-contained Aero-style vector icons (ported from the legacy symbol library). */

const svg = (viewBox: string, body: string) =>
  svgIcon(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`)

const grad = (id: string, a: string, b: string, mid?: string) =>
  `<linearGradient id="${id}" x2="0" y2="1"><stop stop-color="${a}"/>${mid ? `<stop offset=".48" stop-color="${mid}"/>` : ''}<stop offset="1" stop-color="${b}"/></linearGradient>`

/** The four-pane flag, as raw SVG markup (also used inline in the wallpaper / orb). */
export const FLAG_DEFS =
  grad('f-r', '#ffb047', '#e13e22') + grad('f-g', '#c4e857', '#58a526') +
  grad('f-b', '#68ccf8', '#1373ca') + grad('f-y', '#ffe889', '#f5b52c')
export const FLAG_PATHS =
  '<path fill="url(#f-r)" d="M13 15Q32 7 49 15L43 46Q25 39 7 47Z"/>' +
  '<path fill="url(#f-g)" d="M54 17Q73 25 92 16L86 47Q68 56 48 48Z"/>' +
  '<path fill="url(#f-b)" d="M6 52Q24 44 42 51L36 83Q18 76 0 84Z"/>' +
  '<path fill="url(#f-y)" d="M47 53Q66 61 85 52L79 84Q60 93 41 85Z"/>'

export const ICONS = {
  windows: svg('0 0 100 100', `<defs>${FLAG_DEFS}</defs>${FLAG_PATHS}`),

  computer: svg('0 0 48 48', `<defs>${grad('m', '#b6ebff', '#064989', '#278ed3')}</defs>
    <path d="M30 9h13v31H30z" fill="#b6c4ce" stroke="#617788"/>
    <path d="M33 13h7v2h-7zm0 5h7v2h-7z" fill="#526776"/>
    <circle cx="37" cy="35" r="2" fill="#61dc61"/>
    <path d="M17 31h7v10h-7z" fill="#a9b9c7" stroke="#657c8e"/>
    <path d="M10 41h22l3 3H7z" fill="#bfccd6" stroke="#647888"/>
    <rect x="2" y="5" width="33" height="28" rx="2" fill="#d7e1e8" stroke="#526a7d" stroke-width="1.5"/>
    <rect x="5" y="8" width="27" height="21" fill="url(#m)"/>
    <path d="M5 25L32 10v7L13 29H5z" fill="#ffffff25"/>`),

  recycle: svg('0 0 48 48', `
    <path d="M11 9h27l-3 34H14z" fill="#e5f4f7c9" stroke="#7c9cae" stroke-width="1.5"/>
    <ellipse cx="24.5" cy="9" rx="14" ry="4.5" fill="#f6fcff" stroke="#8cabbc"/>
    <ellipse cx="24.5" cy="9" rx="10" ry="2.3" fill="#afc7d5"/>
    <path d="M17 15l1 22m14-22-2 22" stroke="#ffffff" stroke-width="2" opacity=".7"/>
    <path d="m24 18 5 8-4-1-2-4-3 4-3-2 5-6zm8 9-1 9h-9l3-3h4l-1-5zm-12 8-8-5 5-8 1 4-2 4 5 2z" fill="#3daf53" stroke="#298848" stroke-width=".5"/>`),

  recycleFull: svg('0 0 48 48', `
    <path d="M11 9h27l-3 34H14z" fill="#e5f4f7c9" stroke="#7c9cae" stroke-width="1.5"/>
    <path d="M14 8l6-5 5 4 6-3 4 5z" fill="#fff" stroke="#9ab"/>
    <ellipse cx="24.5" cy="9" rx="14" ry="4.5" fill="#f6fcffaa" stroke="#8cabbc"/>
    <path d="m24 18 5 8-4-1-2-4-3 4-3-2 5-6zm8 9-1 9h-9l3-3h4l-1-5zm-12 8-8-5 5-8 1 4-2 4 5 2z" fill="#3daf53" stroke="#298848" stroke-width=".5"/>`),

  text: svg('0 0 48 48', `
    <path d="M10 3h21l8 8v34H10z" fill="#fff" stroke="#7794ab" stroke-width="1.5"/>
    <path d="M31 3v9h8" fill="#dcebf5" stroke="#7794ab"/>
    <path d="M15 18h19M15 23h19M15 28h19M15 33h19M15 38h13" stroke="#9bacbc" stroke-width="1.5"/>`),

  image: svg('0 0 48 48', `
    <path d="M10 3h21l8 8v34H10z" fill="#fff" stroke="#7794ab" stroke-width="1.5"/>
    <rect x="14" y="16" width="21" height="17" fill="#8fd0f5" stroke="#5b87a5"/>
    <path d="M14 33l7-9 5 5 3-3 6 7z" fill="#5cae3c"/><circle cx="29" cy="21" r="2.5" fill="#ffe36b"/>`),

  folder: svg('0 0 48 48', `<defs>${grad('fo', '#fff1a6', '#e9ad35')}</defs>
    <path d="M4 10h16l4 5h20v25H4z" fill="#e1ac44" stroke="#aa7b23"/>
    <path d="M7 12h12l4 5h18v20H7z" fill="#fff0aa"/>
    <path d="M3 19h43l-5 23H6z" fill="url(#fo)" stroke="#ba8b32"/>
    <path d="M5 21h38" stroke="#fff8d6" stroke-width="2"/>`),

  notepad: svg('0 0 48 48', `
    <path d="m9 5 29 3-3 37-29-3z" fill="#ccddea" stroke="#657e93"/>
    <path d="m12 4 29 3-4 35-29-3z" fill="#fff" stroke="#7e9db4"/>
    <path d="m12 5 29 3-1 7-29-3z" fill="#86bdd9"/>
    <path d="m15 3-1 8m7-7-1 8m7-7-1 8m7-7-1 8m7-7-1 8" stroke="#4d748f" stroke-width="2"/>
    <path d="m14 19 20 2m-21 4 20 2m-21 4 20 2m-21 4 15 2" stroke="#a7c6d8"/>
    <path d="m34 34 9-23 3 2-9 23-4 4z" fill="#edc557" stroke="#9f8136"/>`),

  calculator: svg('0 0 48 48', `
    <rect x="8" y="3" width="32" height="42" rx="3" fill="#b3c8db" stroke="#516d86" stroke-width="1.5"/>
    <rect x="12" y="7" width="24" height="10" rx="1" fill="#e9f7df" stroke="#748d84"/>
    <path d="M25 10h2v4h-2zm5 0h2v4h-2z" fill="#486551"/>
    <g fill="#f5f8fc" stroke="#71869a">
      <rect x="12" y="21" width="6" height="5" rx="1"/><rect x="21" y="21" width="6" height="5" rx="1"/>
      <rect x="12" y="29" width="6" height="5" rx="1"/><rect x="21" y="29" width="6" height="5" rx="1"/>
      <rect x="12" y="37" width="6" height="5" rx="1"/><rect x="21" y="37" width="6" height="5" rx="1"/>
    </g>
    <rect x="30" y="21" width="6" height="5" rx="1" fill="#df9d85" stroke="#987268"/>
    <rect x="30" y="29" width="6" height="13" rx="1" fill="#77a9d2" stroke="#557f9e"/>`),

  browser: svg('0 0 48 48', `
    <circle cx="25" cy="25" r="18" fill="#198bce"/>
    <path d="M13 24c0-17 26-18 25 2H17c0 11 13 13 18 5l5 3c-9 16-33 9-33-8z" fill="#48b9ed"/>
    <path d="M18 21h14c-1-9-12-10-14 0" fill="#fff"/>
    <path d="M5 32C-7 14 41-7 46 7c4 10-21 27-37 29" fill="none" stroke="#f3c743" stroke-width="4"/>
    <path d="M9 36c-7-1-7-5-4-10" fill="none" stroke="#ffe798" stroke-width="2"/>`),

  settings: svg('0 0 48 48', `
    <rect x="3" y="7" width="42" height="33" rx="2" fill="#e4eef8" stroke="#6986a1"/>
    <path d="M4 8h40v8H4z" fill="#68a5d2"/>
    <circle cx="14" cy="26" r="6" fill="#6aafd6"/>
    <path d="M7 36c0-8 14-8 14 0" fill="#518db6"/>
    <path d="M26 23h13m-13 6h13m-13 6h9" stroke="#91aabe" stroke-width="2"/>`),

  help: svg('0 0 48 48', `<defs>${grad('h', '#8fd3ff', '#1a62b8')}</defs>
    <circle cx="24" cy="24" r="20" fill="url(#h)" stroke="#164f8f" stroke-width="1.5"/>
    <path d="M17 18q1-7 8-7t7 6q0 4-5 6-2 1-2 4v2" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    <circle cx="25" cy="36" r="2.6" fill="#fff"/>`),

  paint: svg('0 0 48 48', `
    <path d="M6 30c0-14 12-24 24-22 12 2 15 12 11 17-3 3-8 0-10 4-2 5 3 7 0 10-4 4-25 4-25-9z" fill="#f4f0e4" stroke="#8b7b5a" stroke-width="1.5"/>
    <circle cx="17" cy="20" r="3.5" fill="#e23b2e"/><circle cx="27" cy="16" r="3.5" fill="#2e8ae2"/>
    <circle cx="35" cy="22" r="3" fill="#f0c419"/><circle cx="14" cy="31" r="3.5" fill="#3cae4a"/>`),

  mines: svg('0 0 48 48', `
    <circle cx="24" cy="26" r="13" fill="#2b2f36"/>
    <path d="M24 7v38M5 26h38M11 13l26 26M37 13 11 39" stroke="#2b2f36" stroke-width="4"/>
    <circle cx="19" cy="21" r="4" fill="#fff" opacity=".8"/>`),

  user: svg('0 0 48 48', `
    <circle cx="24" cy="15" r="9" fill="#e6f5ff"/>
    <path d="M7 44v-8c0-15 34-15 34 0v8z" fill="#e6f5ff"/>`),

  network: svg('0 0 24 24', `<path d="M3 20v-4h3v4zm5 0v-8h3v8zm5 0V8h3v12zm5 0V4h3v16z" fill="#ecf7ff" stroke="#234d70" stroke-width=".5"/>`),
  volume: svg('0 0 24 24', `<path d="M3 9h4l5-4v14l-5-4H3z" fill="#ecf7ff" stroke="#355973"/>
    <path d="M15 8q5 4 0 8m3-11q8 7 0 14" fill="none" stroke="#ecf7ff" stroke-width="1.5"/>`),
  mute: svg('0 0 24 24', `<path d="M3 9h4l5-4v14l-5-4H3z" fill="#ecf7ff" stroke="#355973"/>
    <path d="M15 9l6 6m0-6-6 6" stroke="#ff5a4a" stroke-width="2"/>`),
  flag: svg('0 0 24 24', `<path d="M5 3v18" stroke="#ecf7ff" stroke-width="2"/><path d="M6 4h12l-3 4 3 4H6z" fill="#ecf7ff" stroke="#355973" stroke-width=".5"/>`),
} as const

export type IconName = keyof typeof ICONS
