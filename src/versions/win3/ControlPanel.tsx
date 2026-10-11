import { useState, type CSSProperties } from 'react'
import { Icon, MenuBar, useClock, useOS, type AppProps } from '../../core'
import { useWin16 } from '../win16/context'
import { ICONS } from '../win16/icons'
import { patternImage, PATTERNS, VGA16, W3_SCHEMES, schemeVars } from '../win16/palette'

const APPLETS = [
  { id: 'w3-cp-color', label: 'Color', icon: ICONS.color },
  { id: 'w3-cp-desktop', label: 'Desktop', icon: ICONS.desktop },
  { id: 'w3-cp-datetime', label: 'Date/Time', icon: ICONS.datetime },
]

/** Control Panel window: an icon per applet. */
export function ControlPanel({ winId }: AppProps) {
  const os = useOS()
  const [sel, setSel] = useState<string | null>(null)
  return (
    <div className="app app-w3-control">
      <MenuBar menus={[
        {
          label: 'Settings',
          items: [
            ...APPLETS.map(a => ({ label: a.label, onClick: () => { os.open(a.id) } })),
            { separator: true },
            { label: 'Exit', onClick: () => os.close(winId) },
          ],
        },
        { label: 'Help', items: [{ label: 'About Control Panel...', onClick: () => { os.open('about') } }] },
      ]} />
      <div className="cp-icons" onPointerDown={e => e.target === e.currentTarget && setSel(null)}>
        {APPLETS.map(a => (
          <div key={a.id} className={`pm-item${sel === a.id ? ' selected' : ''}`} onPointerDown={() => setSel(a.id)} onDoubleClick={() => os.open(a.id)}>
            <Icon src={a.icon} size={32} />
            <span>{a.label}</span>
          </div>
        ))}
      </div>
      <div className="statusbar">{sel ? `Changes the ${APPLETS.find(a => a.id === sel)?.label.toLowerCase()} settings` : ''}</div>
    </div>
  )
}

function OkCancel({ onOk, onCancel }: { onOk: () => void; onCancel: () => void }) {
  return (
    <div className="w16-dlg-buttons">
      <button className="btn default" onClick={onOk}>OK</button>
      <button className="btn" onClick={onCancel}>Cancel</button>
    </div>
  )
}

/** Color: pick a scheme and (optionally) a custom desktop colour; preview before applying. */
export function ColorApplet({ winId }: AppProps) {
  const os = useOS()
  const { prefs, setPrefs } = useWin16()
  const [scheme, setScheme] = useState(W3_SCHEMES[prefs.scheme] ? prefs.scheme : 'Windows Default')
  const [desktop, setDesktop] = useState<string | null>(prefs.desktopColor)
  const s = W3_SCHEMES[scheme]
  const preview: CSSProperties = schemeVars(s, { ...prefs, scheme, desktopColor: desktop })

  return (
    <div className="app app-w3-cp-color">
      <label className="cp-row">
        <span>Color Schemes</span>
        <select className="field" value={scheme} onChange={e => setScheme(e.target.value)}>
          {Object.keys(W3_SCHEMES).map(n => <option key={n}>{n}</option>)}
        </select>
      </label>
      <div className="cp-preview" style={preview}>
        <div className="cp-pv-win inactive">
          <div className="cp-pv-title">Inactive</div>
        </div>
        <div className="cp-pv-win active">
          <div className="cp-pv-title">Active</div>
          <div className="cp-pv-menu"><span>Normal</span><span className="disabled">Disabled</span><span className="hl">Highlighted</span></div>
          <div className="cp-pv-text">Window Text</div>
        </div>
      </div>
      <div className="cp-row cp-swatch-row">
        <span>Desktop</span>
        <div className="cp-swatches">
          <button className={`cp-swatch auto${desktop === null ? ' selected' : ''}`} title="Scheme default" onClick={() => setDesktop(null)} style={{ background: s.desktop }} />
          {VGA16.map(c => (
            <button key={c} className={`cp-swatch${desktop === c ? ' selected' : ''}`} style={{ background: c }} title={c} onClick={() => setDesktop(c)} />
          ))}
        </div>
      </div>
      <OkCancel onCancel={() => os.close(winId)} onOk={() => { setPrefs({ scheme, desktopColor: desktop }); os.close(winId) }} />
    </div>
  )
}

/** Desktop: choose one of the 8x8 WIN.INI patterns. */
export function DesktopApplet({ winId }: AppProps) {
  const os = useOS()
  const { prefs, setPrefs } = useWin16()
  const [pattern, setPattern] = useState(prefs.pattern in PATTERNS ? prefs.pattern : '(None)')
  const img = patternImage(pattern)
  return (
    <div className="app app-w3-cp-desktop">
      <fieldset className="cp-group">
        <legend>Pattern</legend>
        <label className="cp-row">
          <span>Name:</span>
          <select className="field" value={pattern} onChange={e => setPattern(e.target.value)} size={6}>
            {Object.keys(PATTERNS).map(n => <option key={n}>{n}</option>)}
          </select>
        </label>
        <div className="cp-pattern-preview" style={{ backgroundImage: img }} />
      </fieldset>
      <OkCancel onCancel={() => os.close(winId)} onOk={() => { setPrefs({ pattern }); os.close(winId) }} />
    </div>
  )
}

/** Date/Time: shows the (real) clock; the virtual machine can't set it. */
export function DateTimeApplet({ winId }: AppProps) {
  const os = useOS()
  const now = useClock(1000)
  return (
    <div className="app app-w3-cp-datetime">
      <label className="cp-row"><span>Date</span><input className="field" readOnly value={now.toLocaleDateString('en-US')} /></label>
      <label className="cp-row"><span>Time</span><input className="field" readOnly value={now.toLocaleTimeString('en-US')} /></label>
      <div className="w16-dlg-buttons">
        <button className="btn default" onClick={() => os.close(winId)}>OK</button>
      </div>
    </div>
  )
}
