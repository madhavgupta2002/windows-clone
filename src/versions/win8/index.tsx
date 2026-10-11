import { useCallback, useEffect, useMemo, useState } from 'react'
import { OSProvider, WindowLayer, coreApps, pickApps, useOS, usePref, type AboutInfo, type AppProps, type FsSeed } from '../../core'
import { Charms, type Pane, type PowerChoice } from './Charms'
import { VARIANTS, type Palette, type Variant, type VariantConfig } from './config'
import { DesktopSurface, Taskbar, Win8Frame } from './Desktop'
import { Glyph } from './Glyph'
import { glyphUri } from './icons'
import { LockScreen } from './LockScreen'
import { MODERN_META, ModernApp, type ModernId } from './ModernApp'
import { StartScreen } from './StartScreen'
import type { TileDef } from './tiles'
import './win8.css'

const DOCS = 'C:/Users/User/Documents'
const SEED: FsSeed = {
  [`${DOCS}/Welcome.txt`]: 'Welcome to Windows 8!\n\n• Point to the top-right or bottom-right corner to open the charms.\n• Point to the bottom-left corner (or press the Windows key) for Start.\n• Click the Desktop tile for the classic desktop.\n• Settings charm → Power → Shut down returns to the launcher.\n',
  [`${DOCS}/Shopping list.txt`]: 'Milk\nEggs\nCoffee\n',
  'C:/Users/User/Desktop': null,
  'C:/Users/User/Downloads': null,
  'C:/Users/User/Music': null,
  'C:/Users/User/Pictures': null,
  'C:/Users/User/Videos': null,
  'C:/$Recycle.Bin': null,
  'C:/Program Files/Windows Defender': null,
  'C:/Windows/System32/drivers/etc/hosts': '127.0.0.1       localhost\n::1             localhost\n',
}

const WORK_AREA = { top: 0, left: 0, right: 0, bottom: 40 }

const CoreExplorer = coreApps.explorer.component

function makeApps(computerLabel: string) {
  const ico = (g: string, bg: string) => glyphUri(g, '#fff', bg)
  const defaults = {
    folderIcon: glyphUri('folder', '#d9a520'), fileIcon: glyphUri('notepad', '#2b5797'),
    driveIcon: glyphUri('computer', '#555'), computerIcon: glyphUri('computer', '#1b6ec2'), computerLabel,
  }
  const Explorer8 = ({ winId, args }: AppProps) => <CoreExplorer winId={winId} args={{ ...defaults, ...args }} />
  return pickApps({
    explorer: { title: 'File Explorer', icon: ico('folder', '#e3a21a'), width: 760, height: 480, component: Explorer8 },
    notepad: { icon: ico('notepad', '#2b5797'), width: 640, height: 440 },
    calculator: { icon: ico('calc', '#603cba') },
    paint: { icon: ico('paint', '#da532c'), width: 720, height: 520 },
    browser: { title: 'Internet Explorer', icon: ico('ie', '#2672ec'), width: 860, height: 560 },
    minesweeper: { icon: ico('mines', '#107c10') },
    msgbox: { icon: ico('help', '#4a4a4a') },
    about: { title: 'About Windows', icon: ico('flag', '#1b6ec2') },
  })
}
const APPS = { win8: makeApps(VARIANTS['8'].computerName), win81: makeApps(VARIANTS['8.1'].computerName) }

type View = { kind: 'lock' } | { kind: 'start' } | { kind: 'desktop' } | { kind: 'modern'; id: ModernId } | { kind: 'power'; text: string } | { kind: 'sleep' }
type Behind = { kind: 'desktop' } | { kind: 'modern'; id: ModernId }

function Win8({ cfg }: { cfg: VariantConfig }) {
  const os = useOS()
  const [view, setView] = useState<View>({ kind: 'lock' })
  // The last app/desktop shown "behind" Start, for toggling with the Windows key and hot corners.
  const [behind, setBehind] = useState<Behind | null>(null)
  const [pane, setPane] = useState<Pane | null>(null)
  const [paletteId, setPaletteId] = usePref(`${cfg.versionId}.palette`, cfg.palettes[0].id)
  const [brightness, setBrightness] = usePref(`${cfg.versionId}.brightness`, 100)
  const palette = cfg.palettes.find(p => p.id === paletteId) ?? cfg.palettes[0]
  const onPalette = (p: Palette) => setPaletteId(p.id)

  const go = useCallback((v: View) => {
    if (v.kind === 'desktop' || v.kind === 'modern') setBehind(v)
    setPane(null)
    setView(v)
  }, [])

  const toggleStart = useCallback(() => {
    setView(v => {
      if (v.kind === 'start') return behind ?? v
      if (v.kind === 'desktop' || v.kind === 'modern') return { kind: 'start' }
      return v
    })
    setPane(null)
  }, [behind])

  const launch = (t: TileDef) => {
    const l = t.launch
    if (l.kind === 'desktop') go({ kind: 'desktop' })
    else if (l.kind === 'modern') go({ kind: 'modern', id: l.id })
    else { go({ kind: 'desktop' }); os.open(l.app) }
  }

  const power = (p: PowerChoice) => {
    if (p === 'sleep') { setView({ kind: 'sleep' }); return }
    os.closeAll()
    setBehind(null)
    setView({ kind: 'power', text: p === 'shutdown' ? 'Shutting down' : 'Restarting' })
    setTimeout(() => (p === 'shutdown' ? os.exit() : setView({ kind: 'lock' })), 1800)
  }

  // Windows key (pressed alone) toggles Start; Esc on Start goes back.
  useEffect(() => {
    let alone = false
    const down = (e: KeyboardEvent) => {
      alone = e.key === 'Meta'
      if (e.key === 'Escape' && view.kind === 'start' && behind) setView(behind)
      if (e.ctrlKey && e.key === 'Escape') { e.preventDefault(); toggleStart() }
    }
    const up = (e: KeyboardEvent) => { if (e.key === 'Meta' && alone) toggleStart(); alone = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [view, behind, toggleStart])

  const interactive = view.kind === 'start' || view.kind === 'desktop' || view.kind === 'modern'
  const context = view.kind === 'desktop' ? 'Desktop' : view.kind === 'modern' ? MODERN_META[view.id].title : 'Start'
  const behindLabel = behind ? (behind.kind === 'desktop' ? 'Desktop' : MODERN_META[behind.id].title) : null

  const rootClass = `os-root os-win8${cfg.versionId === 'win81' ? ' os-win81' : ''}`
  return (
    <div
      className={rootClass}
      style={{ ['--start-bg' as string]: palette.bg, ['--accent' as string]: palette.accent, ['--wallpaper' as string]: cfg.wallpaper }}
    >
      {/* Desktop is always mounted so windows survive trips to Start. */}
      <div className={`w8-desktop-layer${view.kind === 'desktop' ? ' visible' : ''}`}>
        <DesktopSurface computerName={cfg.computerName} wallpaper={cfg.wallpaper} />
        <WindowLayer Frame={Win8Frame} />
        <Taskbar startButton={cfg.startButton} onStart={toggleStart} />
      </div>

      {view.kind === 'modern' && (
        <ModernApp id={view.id} onClose={() => go({ kind: 'start' })} palettes={cfg.palettes} palette={palette} onPalette={onPalette} />
      )}

      <StartScreen
        visible={view.kind === 'start'}
        allAppsArrow={cfg.allAppsArrow}
        userName="User"
        onLaunch={launch}
        onPower={() => setPane('settings')}
        onSearch={() => setPane('search')}
      />

      {interactive && (
        <>
          <HotCorner corner="bl" label={view.kind === 'start' ? behindLabel : 'Start'} onClick={toggleStart} />
          {behind && view.kind === 'start' && <HotCorner corner="tl" label={behindLabel} onClick={() => setView(behind)} />}
          <Charms
            pane={pane} setPane={setPane} context={context}
            onStart={toggleStart} onLaunch={launch} onPower={power}
            palettes={cfg.palettes} palette={palette} onPalette={onPalette}
            prefKey={cfg.versionId} brightness={brightness} setBrightness={setBrightness}
          />
        </>
      )}

      {view.kind === 'lock' && <LockScreen background={cfg.lockscreen} onUnlock={() => setView({ kind: 'start' })} />}
      {view.kind === 'power' && (
        <div className="w8-power-screen"><div className="w8-dots"><i /><i /><i /><i /><i /></div><div>{view.text}</div></div>
      )}
      {view.kind === 'sleep' && <div className="w8-sleep" onClick={() => setView({ kind: 'lock' })} />}
      {brightness < 100 && <div className="w8-dim" style={{ opacity: (100 - brightness) / 140 }} />}
    </div>
  )
}

/** Hot corner with a small thumbnail tile that appears on hover. */
function HotCorner({ corner, label, onClick }: { corner: 'tl' | 'bl'; label: string | null; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  if (!label) return null
  return (
    <div className={`w8-corner w8-corner-${corner}`} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)} onClick={onClick}>
      {hover && (
        <div className="w8-corner-thumb">
          {label === 'Start' ? <Glyph name="flag" /> : <span>{label}</span>}
        </div>
      )}
    </div>
  )
}

export function Win8Shell({ variant }: { variant: Variant }) {
  const cfg = VARIANTS[variant]
  const about: AboutInfo = useMemo(() => ({
    product: `${cfg.name} Pro`,
    version: cfg.build,
    copyright: 'A web recreation. Windows is a trademark of Microsoft Corporation.',
    extra: 'This product is licensed to: User',
  }), [cfg])
  return (
    <OSProvider versionId={cfg.versionId} about={about} apps={APPS[cfg.versionId]} fsSeed={SEED} documentsPath={DOCS} workArea={WORK_AREA}>
      <Win8 cfg={cfg} />
    </OSProvider>
  )
}

export default function Shell() {
  return <Win8Shell variant="8" />
}
