import { useState } from 'react'
import { Icon, useOS, type AppDef, type AppProps, type OS } from '../../core'
import { ICONS } from '../nt6shared/icons'
import { makeControlPanel, runCommand, useWallpaper } from '../nt6shared/shared'

const TABS = ['Themes', 'Desktop', 'Screen Saver', 'Appearance', 'Settings'] as const
type Tab = (typeof TABS)[number]

/** Display Properties → Desktop tab picks the wallpaper (persisted by the shell). */
function DisplayProperties({ winId }: AppProps) {
  const os = useOS()
  const { wallpapers, wallpaper, setWallpaper } = useWallpaper()
  const [tab, setTab] = useState<Tab>('Desktop')
  const [sel, setSel] = useState(wallpaper)
  const preview = wallpapers.find(w => w.id === sel) ?? wallpapers[0]

  return (
    <div className="app xp-dialog xp-display">
      <div className="xp-tabs" role="tablist">
        {TABS.map(t => (
          <button key={t} role="tab" aria-selected={t === tab} className={`xp-tab${t === tab ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <div className="xp-tabpanel">
        <div className="xp-monitor">
          <div className="xp-monitor-screen" style={{ background: tab === 'Screen Saver' ? '#000' : preview.css }}>
            {tab === 'Appearance' && <div className="xp-monitor-win"><div /> Active Window</div>}
          </div>
          <div className="xp-monitor-stand" />
        </div>
        {tab === 'Desktop' ? (
          <div className="xp-display-row">
            <div className="xp-display-list">
              <label>Background:</label>
              <div className="listview sunken">
                {wallpapers.map(w => (
                  <div
                    key={w.id}
                    className={`listview-item${sel === w.id ? ' selected' : ''}`}
                    onClick={() => setSel(w.id)}
                    onDoubleClick={() => setWallpaper(w.id)}
                  >
                    <span className="xp-swatch" style={{ background: w.css }} /> {w.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="xp-display-side">
              <button className="btn" onClick={() => os.alert('Display Properties', 'Browsing for pictures is not available in this simulation.', 'info')}>Browse...</button>
              <label>Position:</label>
              <select className="field" defaultValue="Stretch"><option>Center</option><option>Tile</option><option>Stretch</option></select>
            </div>
          </div>
        ) : (
          <p className="xp-tab-note">The {tab} settings are not available in this simulation. Try the Desktop tab.</p>
        )}
      </div>
      <div className="xp-dialog-buttons">
        <button className="btn" onClick={() => { setWallpaper(sel); os.close(winId) }}>OK</button>
        <button className="btn" onClick={() => os.close(winId)}>Cancel</button>
        <button className="btn" disabled={sel === wallpaper} onClick={() => setWallpaper(sel)}>Apply</button>
      </div>
    </div>
  )
}

/** Start → Run… */
function RunDialog({ winId }: AppProps) {
  const os = useOS()
  const [cmd, setCmd] = useState('')
  const go = () => { if (runCommand(os, cmd, { control: 'xp-cpanel', 'desk.cpl': 'xp-display' })) os.close(winId) }
  return (
    <form className="app xp-dialog xp-run" onSubmit={e => { e.preventDefault(); go() }}>
      <div className="xp-run-top">
        <Icon src={ICONS.run} size={32} />
        <p>Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.</p>
      </div>
      <label className="xp-run-field">
        Open: <input className="field" autoFocus value={cmd} onChange={e => setCmd(e.target.value)} list="xp-run-hints" />
        <datalist id="xp-run-hints">{['notepad', 'calc', 'mspaint', 'winmine', 'iexplore', 'explorer', 'control', 'winver'].map(h => <option key={h} value={h} />)}</datalist>
      </label>
      <div className="xp-dialog-buttons">
        <button className="btn" type="submit" disabled={!cmd.trim()}>OK</button>
        <button className="btn" type="button" onClick={() => os.close(winId)}>Cancel</button>
        <button className="btn" type="button" onClick={() => os.open('explorer', { path: '' })}>Browse...</button>
      </div>
    </form>
  )
}

const notHere = (title: string) => (os: OS) =>
  os.alert(title, `${title} is not available in this simulation.`, 'info')

const ControlPanel = makeControlPanel(
  [
    { id: 'display', label: 'Appearance and Themes', icon: ICONS.display, description: 'Change the desktop background, screen saver and theme', run: os => os.open('xp-display') },
    { id: 'net', label: 'Network and Internet Connections', icon: ICONS.network, description: 'Connect to the Internet', run: os => os.open('browser') },
    { id: 'programs', label: 'Add or Remove Programs', icon: ICONS.cards, description: 'Install or remove programs', run: notHere('Add or Remove Programs') },
    { id: 'sound', label: 'Sounds, Speech, and Audio Devices', icon: ICONS.speaker, description: 'Change the sound scheme', run: notHere('Sounds and Audio Devices') },
    { id: 'perf', label: 'Performance and Maintenance', icon: ICONS.computer, description: 'See basic information about your computer', run: os => os.open('about') },
    { id: 'users', label: 'User Accounts', icon: ICONS.user, description: 'Change user account settings and passwords', run: notHere('User Accounts') },
    { id: 'security', label: 'Security Center', icon: ICONS.shield, description: 'Check your security status', run: notHere('Security Center') },
    { id: 'help', label: 'Help and Support', icon: ICONS.help, description: 'Get help on using Windows', run: notHere('Help and Support') },
  ],
  'Pick a category',
)

export const XP_EXTRA_APPS: AppDef[] = [
  { id: 'xp-display', title: 'Display Properties', icon: ICONS.display, component: DisplayProperties, width: 404, height: 450, resizable: false, single: true },
  { id: 'xp-run', title: 'Run', icon: ICONS.run, component: RunDialog, width: 360, height: 180, resizable: false, single: true },
  { id: 'xp-cpanel', title: 'Control Panel', icon: ICONS.controlPanel, component: ControlPanel, width: 640, height: 440, single: true },
]
