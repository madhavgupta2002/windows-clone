import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { usePref } from '../hooks'
import { MenuBar } from '../MenuBar'
import { useOS } from '../os'
import type { AppProps } from '../types'
import { useIsActive, useKeyDown } from './util'
import { chord, DIFFICULTIES, flagsLeft, newGame, reveal, toggleFlag, type Cell, type Difficulty, type Game } from './minesweeperLogic'

/** Three-digit LED readout; negative numbers show a leading minus like the original. */
const led = (n: number) => {
  const v = Math.max(-99, Math.min(999, n))
  return v < 0 ? '-' + String(-v).padStart(2, '0') : String(v).padStart(3, '0')
}

function cellClass(c: Cell, i: number, g: Game) {
  const cls = ['mine-cell']
  if (c.open) cls.push('open')
  if (c.flag) cls.push('flag')
  if (c.open && c.mine) cls.push('mine')
  if (g.boom === i) cls.push('boom')
  if (g.status === 'lost' && c.flag && !c.mine) cls.push('wrong')
  if (c.open && !c.mine && c.adj > 0) cls.push(`n${c.adj}`)
  return cls.join(' ')
}

function cellText(c: Cell, lost: boolean) {
  if (c.flag) return lost && !c.mine ? '✕' : '🚩'
  if (!c.open) return ''
  if (c.mine) return '💣'
  return c.adj > 0 ? String(c.adj) : ''
}

export default function Minesweeper({ winId }: AppProps) {
  const os = useOS()
  const [levelId, setLevelId] = usePref<Difficulty['id']>(`${os.versionId}.minesweeper.level`, 'beginner')
  const level = DIFFICULTIES.find(d => d.id === levelId) ?? DIFFICULTIES[0]
  const [game, setGame] = useState(() => newGame(level))
  const [pressing, setPressing] = useState(false)
  const [seconds, setSeconds] = useState(0)

  const restart = (d: Difficulty = level) => {
    setLevelId(d.id)
    setGame(newGame(d))
    setSeconds(0)
  }

  // Timer runs from the first reveal until the game ends.
  useEffect(() => {
    if (game.status !== 'playing') return
    const t = setInterval(() => setSeconds(s => Math.min(999, s + 1)), 1000)
    return () => clearInterval(t)
  }, [game.status])

  // Fit the window to the board whenever its dimensions change (frame chrome differs per version).
  const rootRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<HTMLDivElement>(null)
  const osRef = useRef(os)
  osRef.current = os
  useLayoutEffect(() => {
    const root = rootRef.current
    const board = gameRef.current
    const win = osRef.current.windows.find(w => w.id === winId)
    if (!root || !board || !win || win.maximized) return
    const r = root.getBoundingClientRect()
    const b = board.getBoundingClientRect()
    const w = Math.ceil(win.w - r.width + b.width)
    const h = Math.ceil(win.h - r.height + (b.bottom - r.top))
    if (Math.abs(w - win.w) > 1 || Math.abs(h - win.h) > 1) osRef.current.setBounds(winId, { x: win.x, y: win.y, w, h })
  }, [winId, game.w, game.h])

  useKeyDown(useIsActive(winId), e => {
    if (e.key === 'F2') { e.preventDefault(); restart() }
  })

  const lost = game.status === 'lost'
  const face = lost ? '😵' : game.status === 'won' ? '😎' : pressing ? '😮' : '🙂'

  const onCellClick = (i: number) => {
    setGame(g => (g.cells[i].open ? chord(g, i) : reveal(g, i)))
  }
  const onCellRightClick = (e: MouseEvent, i: number) => {
    e.preventDefault()
    setGame(g => (g.cells[i].open ? chord(g, i) : toggleFlag(g, i)))
  }

  return (
    <div className="app app-minesweeper" ref={rootRef}>
      <MenuBar menus={[
        { label: 'Game', items: [
          { label: 'New', shortcut: 'F2', onClick: () => restart() },
          { separator: true },
          ...DIFFICULTIES.map(d => ({ label: d.label, checked: d.id === level.id, onClick: () => restart(d) })),
          { separator: true },
          { label: 'Exit', onClick: () => os.close(winId) },
        ] },
        { label: 'Help', items: [
          { label: 'How to Play', onClick: () => os.alert('Minesweeper', 'Uncover every square that is not a mine. Numbers show how many mines touch a square. Right-click to flag a mine; click a number with that many flags around it to clear its neighbours.') },
        ] },
      ]} />
      <div className="mine-game" ref={gameRef}>
        <div className="mine-header sunken">
          <div className="mine-counter" title="Mines left">{led(flagsLeft(game))}</div>
          <button type="button" className="mine-face" onClick={() => restart()} title="New game">{face}</button>
          <div className="mine-counter" title="Seconds">{led(seconds)}</div>
        </div>
        <div
          className="mine-grid sunken"
          style={{ gridTemplateColumns: `repeat(${game.w}, var(--mine-cell, 16px))` }}
          onPointerDown={e => e.button === 0 && !lost && game.status !== 'won' && setPressing(true)}
          onPointerUp={() => setPressing(false)}
          onPointerLeave={() => setPressing(false)}
          onContextMenu={e => e.preventDefault()}
        >
          {game.cells.map((c, i) => (
            <div
              key={i}
              className={cellClass(c, i, game)}
              onClick={() => onCellClick(i)}
              onContextMenu={e => onCellRightClick(e, i)}
            >
              {cellText(c, lost)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
