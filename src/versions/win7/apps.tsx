import { useState } from 'react'
import type { AppDef, AppProps } from '../../core'
import { ICONS } from './icons'
import { ICON_SIZES, THEMES, useWin7, type IconSize, type ThemeId } from './shell'

function Personalization(_props: AppProps) {
  const w7 = useWin7()
  return (
    <div className="app app-personalize">
      <div className="w7-cp-address">
        <img src={ICONS.settings} alt="" />
        <span>Control Panel ▸ Appearance and Personalization ▸ Personalization</span>
      </div>
      <div className="w7-cp-body">
        <aside className="w7-cp-side">
          <a>Control Panel Home</a>
          <a>Change desktop icons</a>
          <a>Change mouse pointers</a>
          <a>Change your account picture</a>
          <div className="w7-cp-side-foot">See also<br /><a>Display</a><br /><a>Taskbar and Start Menu</a><br /><a>Ease of Access Center</a></div>
        </aside>
        <div className="w7-cp-page">
          <h1>Change the visuals and sounds on your computer</h1>
          <p>Click a theme to change the desktop background, window color, and sounds all at once.</p>
          <div className="w7-cp-section">Aero Themes ({Object.keys(THEMES).length})</div>
          <div className="w7-theme-grid">
            {(Object.keys(THEMES) as ThemeId[]).map(id => (
              <button key={id} className={`w7-theme${w7.theme === id ? ' active' : ''}`} onClick={() => w7.setTheme(id)} aria-pressed={w7.theme === id}>
                <div className="w7-theme-preview" style={{ background: `linear-gradient(135deg, ${THEMES[id].colors})` }}>
                  <img src={ICONS.windows} alt="" />
                </div>
                <span>{THEMES[id].name}</span>
              </button>
            ))}
          </div>
          <div className="w7-cp-row">
            <label htmlFor="w7-icon-size">Desktop icon size</label>
            <select id="w7-icon-size" className="field" value={w7.iconSize} onChange={e => w7.setIconSize(e.target.value as IconSize)}>
              {(Object.keys(ICON_SIZES) as IconSize[]).map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)} icons</option>)}
            </select>
          </div>
          <div className="w7-cp-row">
            <span>Desktop icon arrangement</span>
            <button className="btn" onClick={() => { w7.arrange([]); w7.toast('Desktop icons were auto-arranged.') }}>Auto arrange</button>
          </div>
          <p className="w7-cp-note">The wallpaper is rendered locally as vector artwork. Preferences are saved in this browser.</p>
        </div>
      </div>
    </div>
  )
}

const HELP: { title: string; lines: string[] }[] = [
  { title: 'Getting started', lines: [
    'Double-click a desktop icon to open it. Drag icons to rearrange the desktop.',
    'Drag across an empty area of the desktop to select several icons.',
    'Right-click the desktop for view, sorting, new items and Personalize.',
    'Open programs from the Start menu or type in its search box.',
  ] },
  { title: 'Windows', lines: [
    'Drag a title bar to move a window; drag any edge or corner to resize it.',
    'Double-click a title bar to maximize or restore.',
    'Aero Snap: drag a window to the top edge to maximize it, or to the left / right edge to fill half the screen.',
    'Taskbar buttons group windows of the same program. Hover to see them; right-click to pin a program.',
    'Hover the narrow button at the far right of the taskbar to peek at the desktop; click it to show the desktop.',
  ] },
  { title: 'Keyboard shortcuts', lines: [
    'Windows key or Ctrl+Esc — open the Start menu',
    'Alt+F4 — close the active window',
    'F2 — rename the selected desktop icon; Delete — move it to the Recycle Bin',
    'Ctrl+A — select all desktop icons; F5 — refresh the desktop',
  ] },
  { title: 'Your files', lines: [
    'Files, folders, theme, icon positions and pinned programs are kept in this browser\'s local storage.',
    'This is a web simulation, not an actual operating system.',
  ] },
]

function Help(_props: AppProps) {
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()
  const sections = HELP.map(s => ({ ...s, lines: s.lines.filter(l => !needle || l.toLowerCase().includes(needle) || s.title.toLowerCase().includes(needle)) }))
    .filter(s => s.lines.length)
  return (
    <div className="app app-help">
      <div className="w7-help-bar">
        <input className="field" type="search" placeholder="Search Help" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="w7-help-page">
        <div className="w7-help-hero"><img src={ICONS.help} alt="" /><h1>Windows Help and Support</h1></div>
        {sections.map(s => (
          <section key={s.title}>
            <h2>{s.title}</h2>
            <ul>{s.lines.map(l => <li key={l}>{l}</li>)}</ul>
          </section>
        ))}
        {!sections.length && <p>No results for “{q}”.</p>}
      </div>
    </div>
  )
}

export const WIN7_APPS: AppDef[] = [
  { id: 'personalize', title: 'Personalization', icon: ICONS.settings, component: Personalization, width: 720, height: 520, single: true },
  { id: 'help', title: 'Windows Help and Support', icon: ICONS.help, component: Help, width: 640, height: 500, single: true },
]
