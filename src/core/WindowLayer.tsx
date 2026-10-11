import { type ComponentType, type PointerEvent as ReactPointerEvent, type CSSProperties } from 'react'
import { useOS } from './os'
import type { FrameProps, WinState } from './types'

const MIN_W = 160
const MIN_H = 90
type Edge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
const EDGES: Edge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

/** Follow the pointer until release, calling onMove with the total delta. */
function track(e: ReactPointerEvent, onMove: (dx: number, dy: number) => void) {
  const sx = e.clientX
  const sy = e.clientY
  const move = (ev: PointerEvent) => onMove(ev.clientX - sx, ev.clientY - sy)
  const up = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    document.body.style.userSelect = ''
  }
  document.body.style.userSelect = 'none'
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}

function WindowHost({ win, Frame }: { win: WinState; Frame: ComponentType<FrameProps> }) {
  const os = useOS()
  const app = os.apps[win.appId]
  const App = app.component
  const { workArea: wa } = os

  const startDrag = (e: ReactPointerEvent) => {
    if (e.button !== 0) return
    // Buttons inside the title bar handle their own clicks.
    if ((e.target as HTMLElement).closest('button, input, select, [data-no-drag]')) return
    os.focus(win.id)
    if (win.maximized) return
    const { x, y, w, h } = win
    track(e, (dx, dy) => {
      const nx = Math.min(Math.max(x + dx, wa.left - w + 60), window.innerWidth - 60)
      const ny = Math.min(Math.max(y + dy, wa.top), window.innerHeight - wa.bottom - 20)
      os.setBounds(win.id, { x: nx, y: ny, w, h })
    })
  }

  const startResize = (edge: Edge) => (e: ReactPointerEvent) => {
    e.stopPropagation()
    os.focus(win.id)
    const { x, y, w, h } = win
    track(e, (dx, dy) => {
      let nx = x, ny = y, nw = w, nh = h
      if (edge.includes('e')) nw = Math.max(MIN_W, w + dx)
      if (edge.includes('s')) nh = Math.max(MIN_H, h + dy)
      if (edge.includes('w')) { nw = Math.max(MIN_W, w - dx); nx = x + w - nw }
      if (edge.includes('n')) { nh = Math.max(MIN_H, h - dy); ny = Math.max(wa.top, y + h - nh); nh = y + h - ny }
      os.setBounds(win.id, { x: nx, y: ny, w: nw, h: nh })
    })
  }

  const style: CSSProperties = win.maximized
    ? { left: wa.left, top: wa.top, right: wa.right, bottom: wa.bottom, zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }

  return (
    <div
      className={`wm-window${win.maximized ? ' wm-maximized' : ''}${os.activeId === win.id ? ' wm-active' : ''}`}
      style={{ position: 'absolute', display: win.minimized ? 'none' : undefined, ...style }}
      onPointerDownCapture={() => os.activeId !== win.id && os.focus(win.id)}
      data-app={win.appId}
    >
      <Frame
        win={win}
        active={os.activeId === win.id}
        dragHandle={{ onPointerDown: startDrag, onDoubleClick: () => win.resizable && os.toggleMaximize(win.id) }}
        onClose={() => os.close(win.id)}
        onMinimize={() => os.minimize(win.id)}
        onMaximize={() => os.toggleMaximize(win.id)}
      >
        <App winId={win.id} args={win.args} />
      </Frame>
      {win.resizable && !win.maximized &&
        EDGES.map(edge => <div key={edge} className={`wm-resize wm-resize-${edge}`} onPointerDown={startResize(edge)} />)}
    </div>
  )
}

/** Renders all open windows using the version's Frame component. */
export function WindowLayer({ Frame }: { Frame: ComponentType<FrameProps> }) {
  const { windows } = useOS()
  return (
    <>
      {windows.map(w => <WindowHost key={w.id} win={w} Frame={Frame} />)}
    </>
  )
}
