import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { parentOf } from '../fs'
import { MenuBar } from '../MenuBar'
import { useFS, useOS } from '../os'
import type { AppProps } from '../types'
import { displayName, OpenPanel, SaveBar } from './FilePanels'
import { floodFill, hexToRgb, linePoints, PALETTE, rgbToHex, type Tool } from './paintLogic'
import { argStr, useAppTitle, useAsk, useIsActive, useKeyDown, useWindowTitle } from './util'

const DEFAULT_W = 560
const DEFAULT_H = 360
const SIZES = [1, 3, 5, 8, 12]
const MAX_UNDO = 20

const TOOLS: { id: Tool; label: string; glyph: string }[] = [
  { id: 'pencil', label: 'Pencil', glyph: '✏️' },
  { id: 'brush', label: 'Brush', glyph: '🖌️' },
  { id: 'eraser', label: 'Eraser', glyph: '🧽' },
  { id: 'fill', label: 'Fill With Color', glyph: '🪣' },
  { id: 'picker', label: 'Pick Color', glyph: '💧' },
  { id: 'line', label: 'Line', glyph: '╱' },
  { id: 'rect', label: 'Rectangle', glyph: '▭' },
  { id: 'ellipse', label: 'Ellipse', glyph: '◯' },
]

/** Only image data URLs are drawn, never arbitrary URLs from file contents. */
const isImageDataUrl = (s: string | null): s is string => !!s && /^data:image\/(png|bmp|jpeg|gif|webp);base64,/.test(s)

interface Stroke {
  tool: Tool
  color: string
  x0: number
  y0: number
  lastX: number
  lastY: number
}

type Panel = { kind: 'none' } | { kind: 'open' } | { kind: 'save'; then?: () => void }

/**
 * args: { path?: string } — a `.bmp` whose content is an image data URL.
 * Saving writes `canvas.toDataURL()` as the file content.
 */
export default function Paint({ winId, args }: AppProps) {
  const os = useOS()
  const fs = useFS()
  const ask = useAsk()
  const appTitle = useAppTitle('paint', 'Paint')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const stroke = useRef<Stroke | null>(null)
  const undo = useRef<ImageData[]>([])

  const [path, setPath] = useState<string | null>(() => argStr(args, 'path') ?? null)
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H })
  const [tool, setTool] = useState<Tool>('pencil')
  const [prevTool, setPrevTool] = useState<Tool>('pencil')
  const [primary, setPrimary] = useState('#000000')
  const [secondary, setSecondary] = useState('#ffffff')
  const [brush, setBrush] = useState(3)
  const [dirty, setDirty] = useState(false)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [panel, setPanel] = useState<Panel>({ kind: 'none' })

  const name = displayName(path)
  useWindowTitle(winId, `${dirty ? '*' : ''}${name} - ${appTitle}`)

  const ctx = () => canvasRef.current?.getContext('2d', { willReadFrequently: true }) ?? null

  const clear = (w = size.w, h = size.h) => {
    const c = canvasRef.current
    if (!c) return
    c.width = w
    c.height = h
    const g = ctx()!
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, w, h)
  }

  /** Load `p` (or a blank canvas) into the editor. */
  const load = (p: string | null) => {
    undo.current = []
    setPath(p)
    setDirty(false)
    setPanel({ kind: 'none' })
    const content = p ? fs.read(p) : null
    if (!isImageDataUrl(content)) {
      setSize({ w: DEFAULT_W, h: DEFAULT_H })
      clear(DEFAULT_W, DEFAULT_H)
      return
    }
    const img = new Image()
    img.onload = () => {
      setSize({ w: img.width, h: img.height })
      clear(img.width, img.height)
      ctx()?.drawImage(img, 0, 0)
    }
    img.src = content
  }

  // Initial document.
  useEffect(() => { load(path) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const snapshot = () => {
    const g = ctx()
    if (!g) return
    undo.current = [...undo.current.slice(-(MAX_UNDO - 1)), g.getImageData(0, 0, size.w, size.h)]
  }
  const doUndo = () => {
    const img = undo.current.pop()
    if (!img) return
    const c = canvasRef.current!
    c.width = img.width
    c.height = img.height
    setSize({ w: img.width, h: img.height })
    ctx()?.putImageData(img, 0, 0)
    setDirty(true)
  }

  const save = (then?: () => void) => {
    if (path) { writeTo(path); then?.() } else setPanel({ kind: 'save', then })
  }
  const writeTo = (p: string) => {
    const c = canvasRef.current
    if (!c) return
    fs.write(p, c.toDataURL('image/png'))
    setPath(p)
    setDirty(false)
  }
  const guard = (next: () => void) => {
    if (!dirty) { next(); return }
    ask(appTitle, `Save changes to ${name}?`, ['Yes', 'No', 'Cancel'], label => {
      if (label === 'Yes') save(next)
      else if (label === 'No') next()
    }, 'warning')
  }

  // ---- drawing -------------------------------------------------------------

  const toCanvas = (e: ReactPointerEvent) => {
    const r = overlayRef.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) * size.w) / r.width, y: ((e.clientY - r.top) * size.h) / r.height }
  }

  const freehand = (g: CanvasRenderingContext2D, s: Stroke, x: number, y: number) => {
    if (s.tool === 'pencil') {
      g.fillStyle = s.color
      for (const [px, py] of linePoints(s.lastX, s.lastY, x, y)) g.fillRect(px, py, 1, 1)
      return
    }
    g.strokeStyle = s.color
    g.lineWidth = s.tool === 'eraser' ? brush * 2 + 4 : brush
    g.lineCap = s.tool === 'eraser' ? 'square' : 'round'
    g.lineJoin = 'round'
    g.beginPath()
    g.moveTo(s.lastX, s.lastY)
    g.lineTo(x + 0.01, y) // a zero-length path draws nothing; nudge it so a click leaves a dot
    g.stroke()
  }

  const shape = (g: CanvasRenderingContext2D, s: Stroke, x: number, y: number) => {
    g.strokeStyle = s.color
    g.lineWidth = brush
    g.lineCap = 'round'
    g.beginPath()
    if (s.tool === 'line') {
      g.moveTo(s.x0, s.y0)
      g.lineTo(x, y)
    } else if (s.tool === 'rect') {
      g.rect(s.x0, s.y0, x - s.x0, y - s.y0)
    } else {
      g.ellipse((s.x0 + x) / 2, (s.y0 + y) / 2, Math.abs(x - s.x0) / 2, Math.abs(y - s.y0) / 2, 0, 0, Math.PI * 2)
    }
    g.stroke()
  }

  const onDown = (e: ReactPointerEvent) => {
    if (e.button !== 0 && e.button !== 2) return
    e.preventDefault()
    const g = ctx()
    if (!g) return
    const { x, y } = toCanvas(e)
    const useSecondary = e.button === 2
    const color = tool === 'eraser' ? (useSecondary ? primary : secondary) : useSecondary ? secondary : primary

    if (tool === 'picker') {
      const [r, gr, b] = g.getImageData(Math.floor(x), Math.floor(y), 1, 1).data
      ;(useSecondary ? setSecondary : setPrimary)(rgbToHex(r, gr, b))
      setTool(prevTool)
      return
    }
    snapshot()
    if (tool === 'fill') {
      const img = g.getImageData(0, 0, size.w, size.h)
      if (floodFill(img, x, y, hexToRgb(color))) { g.putImageData(img, 0, 0); setDirty(true) }
      else undo.current.pop()
      return
    }
    overlayRef.current!.setPointerCapture(e.pointerId)
    stroke.current = { tool, color, x0: x, y0: y, lastX: x, lastY: y }
    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') freehand(g, stroke.current, x, y)
    setDirty(true)
  }

  const onMove = (e: ReactPointerEvent) => {
    const { x, y } = toCanvas(e)
    setCursor({ x: Math.floor(x), y: Math.floor(y) })
    const s = stroke.current
    if (!s) return
    if (s.tool === 'pencil' || s.tool === 'brush' || s.tool === 'eraser') {
      freehand(ctx()!, s, x, y)
      s.lastX = x
      s.lastY = y
    } else {
      const o = overlayRef.current!.getContext('2d')!
      o.clearRect(0, 0, size.w, size.h)
      shape(o, s, x, y)
    }
  }

  const onUp = (e: ReactPointerEvent) => {
    const s = stroke.current
    if (!s) return
    stroke.current = null
    if (s.tool === 'line' || s.tool === 'rect' || s.tool === 'ellipse') {
      overlayRef.current!.getContext('2d')!.clearRect(0, 0, size.w, size.h)
      const { x, y } = toCanvas(e)
      shape(ctx()!, s, x, y)
    }
  }

  const pickTool = (t: Tool) => {
    if (t === 'picker' && tool !== 'picker') setPrevTool(tool)
    setTool(t)
  }

  useKeyDown(useIsActive(winId), e => {
    const ctrl = e.ctrlKey || e.metaKey
    if (ctrl && e.key.toLowerCase() === 'z') { e.preventDefault(); doUndo() }
    else if (ctrl && e.key.toLowerCase() === 's') { e.preventDefault(); save() }
  })

  return (
    <div className="app app-paint">
      <MenuBar menus={[
        { label: 'File', items: [
          { label: 'New', shortcut: 'Ctrl+N', onClick: () => guard(() => load(null)) },
          { label: 'Open...', onClick: () => guard(() => setPanel({ kind: 'open' })) },
          { label: 'Save', shortcut: 'Ctrl+S', onClick: () => save() },
          { label: 'Save As...', onClick: () => setPanel({ kind: 'save' }) },
          { separator: true },
          { label: 'Exit', onClick: () => guard(() => os.close(winId)) },
        ] },
        { label: 'Edit', items: [
          { label: 'Undo', shortcut: 'Ctrl+Z', onClick: doUndo },
          { label: 'Clear Image', onClick: () => { snapshot(); clear(); setDirty(true) } },
        ] },
        { label: 'Options', items: SIZES.map(s => ({ label: `Brush size ${s}px`, checked: brush === s, onClick: () => setBrush(s) })) },
      ]} />
      {panel.kind === 'save' && (
        <SaveBar
          dir={path ? parentOf(path) : os.documentsPath}
          defaultName={path ? name : 'untitled.bmp'}
          ext="bmp"
          onSave={p => { writeTo(p); setPanel({ kind: 'none' }); panel.then?.() }}
          onCancel={() => setPanel({ kind: 'none' })}
        />
      )}
      {panel.kind === 'open' && (
        <OpenPanel dir={os.documentsPath} exts={['bmp']} onOpen={load} onCancel={() => setPanel({ kind: 'none' })} />
      )}
      <div className="paint-main" style={panel.kind === 'open' ? { display: 'none' } : undefined}>
        <div className="paint-tools">
          {TOOLS.map(t => (
            <button
              key={t.id}
              type="button"
              data-tool={t.id}
              title={t.label}
              className={`btn paint-tool${tool === t.id ? ' active' : ''}`}
              onClick={() => pickTool(t.id)}
            >
              {t.glyph}
            </button>
          ))}
          <div className="paint-sizes sunken">
            {SIZES.map(s => (
              <button
                key={s}
                type="button"
                title={`${s}px`}
                className={`paint-size${brush === s ? ' active' : ''}`}
                onClick={() => setBrush(s)}
              >
                <span style={{ height: Math.min(s, 10) }} />
              </button>
            ))}
          </div>
        </div>
        <div className="paint-canvas sunken">
          <div className="paint-surface" style={{ width: size.w, height: size.h }}>
            {/* Sized imperatively (see clear/doUndo): a React-controlled width would wipe the bitmap on re-render. */}
            <canvas ref={canvasRef} className="paint-bitmap" />
            <canvas
              ref={overlayRef}
              className={`paint-overlay tool-${tool}`}
              width={size.w}
              height={size.h}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerLeave={() => setCursor(null)}
              onContextMenu={e => e.preventDefault()}
            />
          </div>
        </div>
      </div>
      <div className="paint-palette">
        <div className="paint-current sunken" title="Primary / secondary colour (left / right click a swatch)">
          <span className="paint-secondary" style={{ background: secondary }} />
          <span className="paint-primary" style={{ background: primary }} />
        </div>
        <div className="paint-swatches">
          {PALETTE.map(c => (
            <button
              key={c}
              type="button"
              className="paint-swatch"
              style={{ background: c }}
              title={c}
              onClick={() => setPrimary(c)}
              onContextMenu={e => { e.preventDefault(); setSecondary(c) }}
            />
          ))}
        </div>
      </div>
      <div className="statusbar">
        <span>{TOOLS.find(t => t.id === tool)?.label}</span>
        <span>{cursor ? `${cursor.x}, ${cursor.y}` : ''}</span>
        <span>{size.w} × {size.h}</span>
      </div>
    </div>
  )
}
