import { useState } from 'react'
import { useOS, type AppDef } from '../../core'
import { APP_ICONS, Glyph, type GlyphName } from './icons'

/** A small Microsoft Store look-alike: browse the apps this shell ships with. */
function Store() {
  const os = useOS()
  const [tab, setTab] = useState('Home')
  const [q, setQ] = useState('')
  const apps = Object.values(os.apps).filter(a => !['msgbox', 'about', 'store'].includes(a.id))
  const shown = apps.filter(a => a.title.toLowerCase().includes(q.trim().toLowerCase()))
  const nav: [string, GlyphName][] = [['Home', 'home'], ['Apps', 'apps'], ['Gaming', 'game'], ['Library', 'documents']]
  return (
    <div className="app app-store">
      <aside className="store-nav">
        {nav.map(([t, g]) => (
          <button key={t} className={`store-nav-item${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            <Glyph name={g} size={18} /><span>{t}</span>
          </button>
        ))}
      </aside>
      <main className="store-main">
        <div className="store-hero">
          <h1>{tab === 'Home' ? 'Welcome to Microsoft Store' : tab}</h1>
          <p>Apps included with your PC — free, and already installed.</p>
        </div>
        <input className="field store-search" placeholder="Search apps, games, movies and more" value={q} onChange={e => setQ(e.target.value)} />
        <h2>Essential apps</h2>
        <div className="store-grid">
          {shown.map(a => (
            <button key={a.id} className="store-card" onClick={() => os.open(a.id)}>
              <img src={a.icon} alt="" />
              <b>{a.title}</b>
              <small>Installed · Open</small>
            </button>
          ))}
          {shown.length === 0 && <p className="store-empty">No results for “{q}”.</p>}
        </div>
      </main>
    </div>
  )
}

export const storeApp: AppDef = {
  id: 'store', title: 'Microsoft Store', icon: APP_ICONS.store, component: Store, width: 880, height: 600, single: true,
}
