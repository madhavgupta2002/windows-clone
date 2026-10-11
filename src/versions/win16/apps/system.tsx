import { useLayoutEffect, useRef, useState } from 'react'
import { useOS, type AppProps } from '../../../core'
import { useWin16, W16 } from '../context'
import { runProgram } from '../dos'
import { cascadeRects, tileRects } from '../layout'

/** "This will end your Windows session." — OK leaves to the launcher. */
export function ExitDialog({ winId }: AppProps) {
  const os = useOS()
  const { variant, shutdown } = useWin16()
  return (
    <div className="app app-w16-exit">
      <div className="w16-dlg-body">
        {variant === 'win3' && <span className="msgbox-icon warning" aria-hidden />}
        <p>This will end your Windows session.</p>
      </div>
      <div className="w16-dlg-buttons">
        <button className="btn default" autoFocus onClick={() => { os.close(winId); shutdown() }}>OK</button>
        <button className="btn" onClick={() => os.close(winId)}>Cancel</button>
      </div>
    </div>
  )
}

/**
 * Invisible helper behind the .EXE / .COM file association: File Manager calls
 * os.openPath("C:/WINDOWS/CLOCK.EXE"), which lands here and launches the mapped app.
 */
export function RunApp({ winId, args }: AppProps) {
  const os = useOS()
  const done = useRef(false)
  useLayoutEffect(() => {
    if (done.current) return
    done.current = true
    os.close(winId)
    if (typeof args.path === 'string') runProgram(os, args.path)
  }, [os, winId, args.path])
  return null
}

/** 3.1 Task List (Ctrl+Esc or double-click the desktop). */
export function TaskList({ winId }: AppProps) {
  const os = useOS()
  const { shellApp, requestExit } = useWin16()
  const tasks = os.windows.filter(w => w.id !== winId && w.appId !== W16.run && w.appId !== W16.exit)
  const [sel, setSel] = useState<string | null>(tasks[0]?.id ?? null)
  const area = { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight - 70 }

  const switchTo = (id = sel) => { if (!id) return; os.close(winId); os.focus(id) }
  const endTask = () => {
    const w = tasks.find(t => t.id === sel)
    if (!w) return
    if (w.appId === shellApp) { os.close(winId); requestExit() } else os.close(w.id)
  }
  const arrange = (rects: (n: number) => { x: number; y: number; w: number; h: number }[]) => {
    const wins = tasks.filter(t => !t.minimized && t.resizable)
    rects(wins.length).forEach((r, i) => {
      if (wins[i].maximized) os.toggleMaximize(wins[i].id)
      os.setBounds(wins[i].id, r)
    })
    os.close(winId)
  }

  return (
    <div className="app app-w16-tasklist">
      <div className="listview" role="listbox">
        {tasks.map(t => (
          <div key={t.id} className={`listview-item${sel === t.id ? ' selected' : ''}`} onPointerDown={() => setSel(t.id)} onDoubleClick={() => switchTo(t.id)}>
            {t.title}
          </div>
        ))}
      </div>
      <div className="w16-dlg-buttons">
        <button className="btn default" onClick={() => switchTo()} disabled={!sel}>Switch To</button>
        <button className="btn" onClick={endTask} disabled={!sel}>End Task</button>
        <button className="btn" onClick={() => os.close(winId)}>Cancel</button>
      </div>
      <div className="w16-dlg-buttons">
        <button className="btn" onClick={() => arrange(n => cascadeRects(n, area, 26))}>Cascade</button>
        <button className="btn" onClick={() => arrange(n => tileRects(n, area))}>Tile</button>
        <button className="btn" onClick={() => os.close(winId)}>Arrange Icons</button>
      </div>
    </div>
  )
}
