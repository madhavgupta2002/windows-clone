import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useClock, useFS, useOS, usePref, type AppDef, type AppProps } from '../../core'
import { useModern, type Theme } from './context'
import { APP_ICONS, Glyph, type GlyphName } from './icons'
import { SETTINGS_CATEGORIES, categoryDesc, categoryName, resolveSettingsPath, type SettingsCategory, type SettingsPage } from './settingsData'
import { Slider, Toggle, formatLongDate, formatTime } from './ui'

/**
 * Settings app shared by Windows 10 and 11. Navigation is a path: "home", "system",
 * "system/display". Win11 renders a permanent sidebar + breadcrumb, Win10 renders the
 * "Windows Settings" category grid and a per-category left nav.
 */

type Flag = (key: string, initial?: boolean) => [boolean, (v: boolean) => void]

interface PageCtx {
  go: (path: string) => void
  flag: Flag
}

export default function Settings({ args }: AppProps) {
  const m = useModern()
  const [path, setPath] = useState(() => (typeof args.page === 'string' ? args.page : 'home'))
  const [back, setBack] = useState<string[]>([])
  const [flags, setFlags] = usePref<Record<string, boolean>>(`${m.variant}.settingsFlags`, {})
  const seenNonce = useRef(m.settingsNav?.nonce ?? 0)

  const go = (p: string) => {
    if (p === path) return
    setBack(b => [...b, path].slice(-30))
    setPath(p)
  }

  // Follow navigation requests made while this (single) window is already open.
  useEffect(() => {
    if (!m.settingsNav || m.settingsNav.nonce === seenNonce.current) return
    seenNonce.current = m.settingsNav.nonce
    const target = m.settingsNav.page
    setPath(cur => {
      if (cur !== target) setBack(b => [...b, cur].slice(-30))
      return target
    })
  }, [m.settingsNav])

  const flag: Flag = (key, initial = false) => [flags[key] ?? initial, v => setFlags(f => ({ ...f, [key]: v }))]
  const goBack = back.length ? () => { setPath(back[back.length - 1]); setBack(b => b.slice(0, -1)) } : undefined
  const ctx: PageCtx = { go, flag }

  return m.variant === 'win11'
    ? <Settings11 path={path} ctx={ctx} onBack={goBack} />
    : <Settings10 path={path} ctx={ctx} onBack={goBack} />
}

/** AppDef for registering Settings in a modern shell. */
export const settingsApp: AppDef = {
  id: 'settings', title: 'Settings', icon: APP_ICONS.settings, component: Settings, width: 980, height: 640, single: true,
}

/* ---------------------------------------------------------------- shells */

function SettingsSearch({ ctx, placeholder }: { ctx: PageCtx; placeholder: string }) {
  const { variant } = useModern()
  const [q, setQ] = useState('')
  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return SETTINGS_CATEGORIES.flatMap(c => [
      { path: c.id, name: categoryName(c, variant), glyph: c.glyph },
      ...c.pages.map(p => ({ path: `${c.id}/${p.id}`, name: p.name, glyph: p.glyph })),
    ]).filter(r => r.name.toLowerCase().includes(s)).slice(0, 8)
  }, [q, variant])
  return (
    <div className="settings-search">
      <input
        className="field"
        value={q}
        placeholder={placeholder}
        onChange={e => setQ(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && results[0]) { ctx.go(results[0].path); setQ('') } }}
      />
      <Glyph name="search" size={14} className="settings-search-icon" />
      {q.trim() && (
        <div className="settings-search-results">
          {results.length === 0 && <div className="settings-search-empty">No results</div>}
          {results.map(r => (
            <button key={r.path} onClick={() => { ctx.go(r.path); setQ('') }}>
              <Glyph name={r.glyph} size={16} /> {r.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Settings11({ path, ctx, onBack }: { path: string; ctx: PageCtx; onBack?: () => void }) {
  const m = useModern()
  const { cat, page } = resolveSettingsPath(path)
  return (
    <div className="app app-settings settings-11">
      <aside className="settings-nav">
        <div className="settings-topline">
          {onBack && <button className="settings-back" onClick={onBack} title="Back"><Glyph name="back" size={14} /></button>}
          <span>Settings</span>
        </div>
        <div className="settings-profile">
          <img className="settings-avatar" src={APP_ICONS.user} alt="" />
          <div><b>{m.userName}</b><small>Local account</small></div>
        </div>
        <SettingsSearch ctx={ctx} placeholder="Find a setting" />
        <nav>
          <button className={`settings-nav-item${!cat ? ' active' : ''}`} onClick={() => ctx.go('home')}>
            <Glyph name="home" size={16} /> Home
          </button>
          {SETTINGS_CATEGORIES.map(c => (
            <button key={c.id} className={`settings-nav-item${cat?.id === c.id ? ' active' : ''}`} onClick={() => ctx.go(c.id)}>
              <span style={{ color: c.tint }}><Glyph name={c.glyph} size={16} /></span> {c.name}
            </button>
          ))}
        </nav>
      </aside>
      <main className="settings-main">
        <h1 className="settings-title">
          {!cat && 'Home'}
          {cat && !page && cat.name}
          {cat && page && <><button className="crumb" onClick={() => ctx.go(cat.id)}>{cat.name}</button><span className="crumb-sep">›</span>{page.name}</>}
        </h1>
        <div className="settings-content">
          {!cat && <HomePage ctx={ctx} />}
          {cat && !page && <CategoryPage cat={cat} ctx={ctx} />}
          {cat && page && <PageContent cat={cat} page={page} ctx={ctx} />}
        </div>
      </main>
    </div>
  )
}

function Settings10({ path, ctx, onBack }: { path: string; ctx: PageCtx; onBack?: () => void }) {
  const { cat, page } = resolveSettingsPath(path)
  if (!cat) {
    return (
      <div className="app app-settings settings-10 settings-10-home">
        {onBack && <button className="settings-back" onClick={onBack} title="Back"><Glyph name="back" size={14} /></button>}
        <h1>Windows Settings</h1>
        <SettingsSearch ctx={ctx} placeholder="Find a setting" />
        <div className="settings-grid">
          {SETTINGS_CATEGORIES.map(c => (
            <button key={c.id} className="settings-tile" onClick={() => ctx.go(c.id)}>
              <Glyph name={c.glyph} size={30} />
              <span><b>{categoryName(c, 'win10')}</b><small>{categoryDesc(c, 'win10')}</small></span>
            </button>
          ))}
        </div>
      </div>
    )
  }
  const current = page ?? cat.pages[0]
  return (
    <div className="app app-settings settings-10">
      <aside className="settings-nav">
        {onBack && <button className="settings-back" onClick={onBack} title="Back"><Glyph name="back" size={14} /></button>}
        <button className="settings-nav-item home" onClick={() => ctx.go('home')}><Glyph name="home" size={16} /> Home</button>
        <SettingsSearch ctx={ctx} placeholder="Find a setting" />
        <div className="settings-nav-heading">{categoryName(cat, 'win10')}</div>
        <nav>
          {cat.pages.map(p => (
            <button key={p.id} className={`settings-nav-item${current.id === p.id ? ' active' : ''}`} onClick={() => ctx.go(`${cat.id}/${p.id}`)}>
              <Glyph name={p.glyph} size={16} /> {p.name}
            </button>
          ))}
        </nav>
      </aside>
      <main className="settings-main">
        <h1 className="settings-title">{current.name}</h1>
        <div className="settings-content">
          <PageContent cat={cat} page={current} ctx={ctx} />
        </div>
      </main>
    </div>
  )
}

/* ---------------------------------------------------------------- building blocks */

function Row({ glyph, title, desc, children, onClick }: {
  glyph?: GlyphName
  title: ReactNode
  desc?: ReactNode
  children?: ReactNode
  onClick?: () => void
}) {
  const body = (
    <>
      {glyph && <Glyph name={glyph} size={20} className="settings-row-glyph" />}
      <span className="settings-row-text"><span className="settings-row-title">{title}</span>{desc && <small>{desc}</small>}</span>
      {children && <span className="settings-row-control">{children}</span>}
      {onClick && !children && <Glyph name="chevron" size={14} className="settings-row-chevron" />}
    </>
  )
  return onClick
    ? <button className="settings-row clickable" onClick={onClick}>{body}</button>
    : <div className="settings-row">{body}</div>
}

function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="settings-section">
      {title && <h2>{title}</h2>}
      {children}
    </section>
  )
}

function Select({ value, options, onChange, label }: { value: string; options: string[]; onChange?: (v: string) => void; label: string }) {
  const [local, setLocal] = useState(value)
  return (
    <select className="field settings-select" aria-label={label} value={onChange ? value : local}
      onChange={e => (onChange ? onChange(e.target.value) : setLocal(e.target.value))}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  )
}

function FlagRow({ ctx, id, glyph, title, desc, initial = false }: { ctx: PageCtx; id: string; glyph?: GlyphName; title: string; desc?: string; initial?: boolean }) {
  const [v, set] = ctx.flag(id, initial)
  return <Row glyph={glyph} title={title} desc={desc}><Toggle checked={v} onChange={set} label={title} /></Row>
}

/* ---------------------------------------------------------------- pages */

function HomePage({ ctx }: { ctx: PageCtx }) {
  const os = useOS()
  const m = useModern()
  return (
    <>
      <div className="settings-hero">
        <div className="settings-hero-device"><m.wallpaper.Component /></div>
        <div>
          <b>DESKTOP-WEB</b>
          <small>{os.about.product}</small>
          <button className="btn link" onClick={() => ctx.go('system/about')}>Rename</button>
        </div>
        <div className="settings-hero-status">
          <Glyph name="update" size={22} />
          <span><b>Windows Update</b><small>You're up to date</small></span>
        </div>
      </div>
      <Section title="Recommended settings">
        <Row glyph="pen" title="Personalization" desc="Customize your background, colors, and themes" onClick={() => ctx.go('personalization')} />
        <Row glyph="display" title="System" desc="Display, sound, notifications, power" onClick={() => ctx.go('system')} />
        <Row glyph="wifi" title="Network & internet" desc="Wi-Fi, airplane mode, VPN" onClick={() => ctx.go('network')} />
      </Section>
      <Section title="Color mode">
        <Row glyph="sun" title="Choose your mode" desc="Change the colors that appear in Windows and your apps">
          <Select label="Mode" value={m.theme === 'dark' ? 'Dark' : 'Light'} options={['Light', 'Dark']}
            onChange={v => m.setTheme(v.toLowerCase() as Theme)} />
        </Row>
      </Section>
    </>
  )
}

function CategoryPage({ cat, ctx }: { cat: SettingsCategory; ctx: PageCtx }) {
  const m = useModern()
  return (
    <>
      {cat.id === 'personalization' && (
        <div className="settings-personalize-head">
          <div className="settings-preview"><m.wallpaper.Component /></div>
          <div className="settings-theme-picks">
            <span>Select a theme to apply</span>
            <div>
              {m.wallpapers.slice(0, 6).map((w, i) => (
                <button key={w.id} className="settings-thumb" title={w.name}
                  onClick={() => { m.setWallpaper(w.id); m.setTheme(i % 2 ? 'dark' : 'light') }}>
                  <w.Component />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <Section>
        {cat.pages.map(p => <Row key={p.id} glyph={p.glyph} title={p.name} desc={p.desc} onClick={() => ctx.go(`${cat.id}/${p.id}`)} />)}
      </Section>
    </>
  )
}

function PageContent({ cat, page, ctx }: { cat: SettingsCategory; page: SettingsPage; ctx: PageCtx }) {
  const { variant } = useModern()
  const key = `${cat.id}/${page.id}`
  const Special = PAGES[key]
  if (Special) return <Special ctx={ctx} />
  return (
    <Section>
      <p className="settings-desc">{page.desc}.</p>
      <FlagRow ctx={ctx} id={`${key}.a`} glyph={page.glyph} title={page.name} desc={`Use ${page.name.toLowerCase()} on this device`} initial />
      <FlagRow ctx={ctx} id={`${key}.b`} title="Show suggestions" desc="Get tips and recommendations" />
      <Row title="Related settings" desc={`${categoryName(cat, variant)} settings`} onClick={() => ctx.go(cat.id)} />
    </Section>
  )
}

function WallpaperPicker() {
  const m = useModern()
  return (
    <div className="settings-wallpapers">
      {m.wallpapers.map(w => (
        <button key={w.id} className={`settings-thumb${m.wallpaper.id === w.id ? ' selected' : ''}`} title={w.name} onClick={() => m.setWallpaper(w.id)}>
          <w.Component />
        </button>
      ))}
    </div>
  )
}

function AccentPicker() {
  const m = useModern()
  return (
    <div className="settings-swatches">
      {m.accents.map(c => (
        <button key={c} className={`settings-swatch${m.accent === c ? ' selected' : ''}`} style={{ background: c }}
          title={c} aria-label={`Accent ${c}`} onClick={() => m.setAccent(c)} />
      ))}
      <label className="settings-swatch custom" title="Custom color">
        +<input type="color" value={m.accent} onChange={e => m.setAccent(e.target.value)} />
      </label>
    </div>
  )
}

function StorageBar() {
  const fs = useFS()
  let used = 0
  const walk = (dir: string) => { for (const n of fs.list(dir)) { if (n.type === 'dir') walk(n.path); else used += n.size } }
  fs.roots().forEach(walk)
  const pct = Math.min(100, 38 + used / 1000)
  return (
    <div className="settings-storage">
      <div className="settings-storage-head"><b>Local Disk (C:)</b><span>{(pct * 2.56).toFixed(1)} GB used of 256 GB</span></div>
      <div className="settings-meter"><span style={{ width: `${pct}%` }} /></div>
      <small>{used.toLocaleString()} bytes in your files</small>
    </div>
  )
}

function UpdatePage() {
  const now = useClock(30_000)
  const [state, setState] = useState<'idle' | 'checking' | 'done'>('idle')
  useEffect(() => {
    if (state !== 'checking') return
    const t = setTimeout(() => setState('done'), 2200)
    return () => clearTimeout(t)
  }, [state])
  return (
    <Section>
      <div className="settings-update">
        <span className={`settings-update-icon${state === 'checking' ? ' spinning' : ''}`}><Glyph name="update" size={36} /></span>
        <div>
          <b>{state === 'checking' ? 'Checking for updates…' : "You're up to date"}</b>
          <small>Last checked: Today, {formatTime(now)}</small>
        </div>
        <button className="btn primary" disabled={state === 'checking'} onClick={() => setState('checking')}>Check for updates</button>
      </div>
      <Row glyph="clock" title="Pause updates" desc="Pause for 1 week"><Select label="Pause" value="Pause for 1 week" options={['Pause for 1 week', 'Pause for 2 weeks', 'Pause for 5 weeks']} /></Row>
      <Row glyph="update" title="Update history" desc="Feature updates, quality updates, definitions" onClick={() => undefined} />
    </Section>
  )
}

type PageComponent = (p: { ctx: PageCtx }) => ReactNode

const PAGES: Record<string, PageComponent> = {
  'system/display': ({ ctx }) => {
    const m = useModern()
    return (
      <>
        <Section title="Brightness & color">
          <Row glyph="sun" title="Brightness" desc="Adjust the brightness of the built-in display">
            <Slider label="Brightness" min={30} max={100} value={m.brightness} onChange={m.setBrightness} />
          </Row>
          <Row glyph="moon" title="Night light" desc="Use warmer colors to help block blue light">
            <Toggle checked={m.quick.nightLight} onChange={() => m.toggleQuick('nightLight')} label="Night light" />
          </Row>
        </Section>
        <Section title="Scale & layout">
          <Row glyph="display" title="Scale" desc="Change the size of text, apps, and other items"><Select label="Scale" value="100% (Recommended)" options={['100% (Recommended)', '125%', '150%']} /></Row>
          <Row glyph="display" title="Display resolution" desc="Adjust the resolution to fit your connected display">
            <span className="settings-value">{window.screen.width} × {window.screen.height}</span>
          </Row>
          <FlagRow ctx={ctx} id="display.hdr" glyph="sun" title="Use HDR" desc="More info about HDR" />
        </Section>
      </>
    )
  },
  'system/sound': () => {
    const m = useModern()
    return (
      <Section title="Output">
        <Row glyph="volume" title="Volume"><Slider label="Volume" value={m.volume} onChange={m.setVolume} /></Row>
        <Row glyph="volume" title="Choose where to play sound"><Select label="Output" value="Speakers (High Definition Audio)" options={['Speakers (High Definition Audio)', 'Headphones']} /></Row>
      </Section>
    )
  },
  'system/notifications': ({ ctx }) => {
    const m = useModern()
    return (
      <Section>
        <FlagRow ctx={ctx} id="notif.on" glyph="bell" title="Notifications" desc="Get notifications from apps and other senders" initial />
        <Row glyph="focus" title="Do not disturb" desc="Notifications will go directly to notification center">
          <Toggle checked={m.quick.focus} onChange={() => m.toggleQuick('focus')} label="Do not disturb" />
        </Row>
        <Row glyph="message" title="Test notification" desc="Send a sample notification to the notification center">
          <button className="btn" onClick={() => m.notify({ app: 'Settings', icon: APP_ICONS.settings, title: 'Test notification', body: 'Notifications are working.' })}>Send</button>
        </Row>
      </Section>
    )
  },
  'system/focus': () => {
    const m = useModern()
    return (
      <Section>
        <Row glyph="focus" title="Focus assist" desc="Choose which notifications you want to see and hear">
          <Toggle checked={m.quick.focus} onChange={() => m.toggleQuick('focus')} label="Focus assist" />
        </Row>
      </Section>
    )
  },
  'system/power': () => {
    const m = useModern()
    return (
      <Section title="Power">
        <Row glyph="battery" title="Battery saver" desc="Extend battery life by limiting some notifications and background activity">
          <Toggle checked={m.quick.batterySaver} onChange={() => m.toggleQuick('batterySaver')} label="Battery saver" />
        </Row>
        <Row glyph="display" title="Screen and sleep" desc="Turn off my screen after"><Select label="Screen" value="10 minutes" options={['5 minutes', '10 minutes', '30 minutes', 'Never']} /></Row>
        <Row glyph="power" title="Power mode" desc="Optimize your device based on power use and performance"><Select label="Power mode" value="Balanced" options={['Best power efficiency', 'Balanced', 'Best performance']} /></Row>
      </Section>
    )
  },
  'system/storage': ({ ctx }) => (
    <Section title="Local Disk (C:)">
      <StorageBar />
      <FlagRow ctx={ctx} id="storage.sense" glyph="storage" title="Storage Sense" desc="Automatically free up space, delete temporary files" />
    </Section>
  ),
  'system/multitasking': ({ ctx }) => (
    <Section>
      <FlagRow ctx={ctx} id="multi.snap" glyph="taskview" title="Snap windows" desc="Show snap layouts when I hover over a window's maximize button" initial />
      <FlagRow ctx={ctx} id="multi.shake" glyph="taskview" title="Title bar window shake" desc="Minimize all other windows when I shake a title bar" />
    </Section>
  ),
  'system/about': () => {
    const os = useOS()
    const nav = navigator as Navigator & { deviceMemory?: number }
    return (
      <>
        <Section title="Device specifications">
          <dl className="settings-specs">
            <dt>Device name</dt><dd>DESKTOP-WEB</dd>
            <dt>Processor</dt><dd>Web Processor ({nav.hardwareConcurrency || 4} logical cores)</dd>
            <dt>Installed RAM</dt><dd>{nav.deviceMemory ? `${nav.deviceMemory}.0 GB` : '8.00 GB'}</dd>
            <dt>System type</dt><dd>64-bit operating system, x64-based processor</dd>
            <dt>Pen and touch</dt><dd>{navigator.maxTouchPoints > 0 ? 'Touch support' : 'No pen or touch input is available for this display'}</dd>
          </dl>
        </Section>
        <Section title="Windows specifications">
          <dl className="settings-specs">
            <dt>Edition</dt><dd>{os.about.product}</dd>
            <dt>Version</dt><dd>{os.about.version}</dd>
            <dt>Installed on</dt><dd>{new Date().toLocaleDateString('en-US')}</dd>
            {os.about.extra && <><dt>Experience</dt><dd>{os.about.extra}</dd></>}
          </dl>
          <button className="btn" onClick={() => os.open('about')}>About Windows</button>
        </Section>
      </>
    )
  },
  'devices/bluetooth': () => {
    const m = useModern()
    return (
      <Section>
        <Row glyph="bluetooth" title="Bluetooth" desc={m.quick.bluetooth ? 'Discoverable as "DESKTOP-WEB"' : 'Off'}>
          <Toggle checked={m.quick.bluetooth} onChange={() => m.toggleQuick('bluetooth')} label="Bluetooth" />
        </Row>
        {m.quick.bluetooth && <>
          <Row glyph="pen" title="Wireless Mouse" desc="Connected" />
          <Row glyph="volume" title="Headphones" desc="Paired" />
        </>}
      </Section>
    )
  },
  'network/wifi': () => {
    const m = useModern()
    return (
      <Section>
        <Row glyph="wifi" title="Wi-Fi" desc={m.quick.wifi ? 'Connected, secured' : 'Off'}>
          <Toggle checked={m.quick.wifi} onChange={() => m.toggleQuick('wifi')} label="Wi-Fi" />
        </Row>
        {m.quick.wifi && ['HomeNetwork', 'CoffeeShop-Guest', 'NETGEAR-5G'].map((n, i) => (
          <Row key={n} glyph="wifi" title={n} desc={i === 0 ? 'Connected, secured' : 'Secured'} />
        ))}
      </Section>
    )
  },
  'network/airplane': () => {
    const m = useModern()
    return (
      <Section>
        <Row glyph="airplane" title="Airplane mode" desc="Stop all wireless communication">
          <Toggle checked={m.quick.airplane} onChange={() => m.toggleQuick('airplane')} label="Airplane mode" />
        </Row>
      </Section>
    )
  },
  'network/vpn': () => {
    const m = useModern()
    return (
      <Section>
        <Row glyph="vpn" title="Work VPN" desc={m.quick.vpn ? 'Connected' : 'Not connected'}>
          <Toggle checked={m.quick.vpn} onChange={() => m.toggleQuick('vpn')} label="VPN" />
        </Row>
      </Section>
    )
  },
  'network/hotspot': () => {
    const m = useModern()
    return (
      <Section>
        <Row glyph="phone" title="Mobile hotspot" desc="Share my internet connection with other devices">
          <Toggle checked={m.quick.hotspot} onChange={() => m.toggleQuick('hotspot')} label="Mobile hotspot" />
        </Row>
      </Section>
    )
  },
  'personalization/background': () => {
    const m = useModern()
    return (
      <>
        <div className="settings-preview large"><m.wallpaper.Component /></div>
        <Section title="Personalize your background">
          <Row glyph="pictures" title="Background" desc={m.wallpaper.name} />
          <WallpaperPicker />
        </Section>
      </>
    )
  },
  'personalization/colors': () => {
    const m = useModern()
    return (
      <Section>
        <Row glyph="sun" title="Choose your mode" desc="Change the colors that appear in Windows and your apps">
          <Select label="Mode" value={m.theme === 'dark' ? 'Dark' : 'Light'} options={['Light', 'Dark']} onChange={v => m.setTheme(v.toLowerCase() as Theme)} />
        </Row>
        <Row glyph="display" title="Transparency effects" desc="Windows and surfaces appear translucent">
          <Toggle checked={m.transparency} onChange={m.setTransparency} label="Transparency effects" />
        </Row>
        <Row glyph="pen" title="Accent color" desc="Choose a color for Start, taskbar highlights and controls" />
        <AccentPicker />
      </Section>
    )
  },
  'personalization/themes': () => {
    const m = useModern()
    const themes = m.wallpapers.flatMap(w => (['light', 'dark'] as const).map(t => ({ w, t })))
    return (
      <Section title="Current theme: Custom">
        <div className="settings-wallpapers">
          {themes.map(({ w, t }) => (
            <button key={`${w.id}-${t}`} className={`settings-thumb theme-card${m.wallpaper.id === w.id && m.theme === t ? ' selected' : ''}`}
              title={`${w.name} (${t})`} onClick={() => { m.setWallpaper(w.id); m.setTheme(t) }}>
              <w.Component />
              <span className={`theme-card-chip ${t}`}>Aa</span>
            </button>
          ))}
        </div>
      </Section>
    )
  },
  'accounts/info': () => {
    const m = useModern()
    return (
      <Section>
        <div className="settings-account">
          <img src={APP_ICONS.user} alt="" />
          <b>{m.userName.toUpperCase()}</b>
          <small>Local account</small>
          <small>Administrator</small>
        </div>
      </Section>
    )
  },
  'time/datetime': ({ ctx }) => {
    const now = useClock()
    return (
      <Section>
        <div className="settings-clock"><b>{formatTime(now, true)}</b><small>{formatLongDate(now)}</small></div>
        <FlagRow ctx={ctx} id="time.auto" glyph="clock" title="Set time automatically" initial />
        <Row glyph="globe" title="Time zone"><span className="settings-value">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span></Row>
      </Section>
    )
  },
  'time/language': () => (
    <Section>
      <Row glyph="message" title="Windows display language"><Select label="Language" value="English (United States)" options={['English (United States)', 'English (United Kingdom)', 'Deutsch', 'Français', '日本語']} /></Row>
    </Section>
  ),
  'privacy/location': () => {
    const m = useModern()
    return (
      <Section>
        <Row glyph="location" title="Location services" desc="Determines whether apps can use your location">
          <Toggle checked={m.quick.location} onChange={() => m.toggleQuick('location')} label="Location services" />
        </Row>
      </Section>
    )
  },
  'privacy/security': () => (
    <Section title="Protection areas">
      {(['Virus & threat protection', 'Account protection', 'Firewall & network protection', 'App & browser control', 'Device security'] as const).map(t => (
        <Row key={t} glyph="shield" title={t} desc="No actions needed." />
      ))}
    </Section>
  ),
  'apps/installed': () => {
    const os = useOS()
    const apps = Object.values(os.apps).filter(a => a.id !== 'msgbox' && a.id !== 'about')
    return (
      <Section title={`${apps.length} apps found`}>
        {apps.map(a => (
          <Row key={a.id} title={<span className="settings-app"><img src={a.icon} alt="" />{a.title}</span>} desc="Microsoft Corporation">
            <button className="btn" onClick={() => os.open(a.id)}>Open</button>
          </Row>
        ))}
      </Section>
    )
  },
  'update/windowsupdate': () => <UpdatePage />,
}
