import { useEffect, useState } from 'react'
import { MenuBar, useOS, type AppProps } from '../../../core'

type Cell = 0 | 1 | 2 // empty / you (black) / computer (white)
type Board = Cell[]
type Skill = 'Beginner' | 'Novice' | 'Expert' | 'Master'

const DIRS = [-9, -8, -7, -1, 1, 7, 8, 9]
const SKILLS: Skill[] = ['Beginner', 'Novice', 'Expert', 'Master']

/** Positional weights: corners good, squares next to corners bad. */
const WEIGHTS = [
  100, -20, 10, 5, 5, 10, -20, 100,
  -20, -50, -2, -2, -2, -2, -50, -20,
  10, -2, 1, 1, 1, 1, -2, 10,
  5, -2, 1, 0, 0, 1, -2, 5,
  5, -2, 1, 0, 0, 1, -2, 5,
  10, -2, 1, 1, 1, 1, -2, 10,
  -20, -50, -2, -2, -2, -2, -50, -20,
  100, -20, 10, 5, 5, 10, -20, 100,
]

function newBoard(): Board {
  const b: Board = Array(64).fill(0)
  b[27] = 2; b[36] = 2; b[28] = 1; b[35] = 1
  return b
}

/** Discs flipped by playing `who` at `i` (empty array = illegal). */
function flips(b: Board, i: number, who: Cell): number[] {
  if (b[i] !== 0) return []
  const other = who === 1 ? 2 : 1
  const out: number[] = []
  for (const d of DIRS) {
    const run: number[] = []
    let j = i + d
    while (j >= 0 && j < 64 && Math.abs((j % 8) - ((j - d) % 8)) <= 1 && b[j] === other) { run.push(j); j += d }
    if (run.length && j >= 0 && j < 64 && Math.abs((j % 8) - ((j - d) % 8)) <= 1 && b[j] === who) out.push(...run)
  }
  return out
}

const moves = (b: Board, who: Cell) => b.map((_, i) => i).filter(i => flips(b, i, who).length)

function play(b: Board, i: number, who: Cell): Board {
  const next = [...b]
  for (const j of [i, ...flips(b, i, who)]) next[j] = who
  return next
}

const score = (b: Board, who: Cell) => b.filter(c => c === who).length
const evaluate = (b: Board) => b.reduce<number>((t, c, i) => t + (c === 2 ? WEIGHTS[i] : c === 1 ? -WEIGHTS[i] : 0), 0)

/** Pick the computer's move: random (Beginner), greedy, or shallow minimax. */
function bestMove(b: Board, skill: Skill, who: Cell = 2): number | null {
  const options = moves(b, who)
  if (!options.length) return null
  if (skill === 'Beginner') return options[Math.floor(Math.random() * options.length)]
  if (skill === 'Novice') return options.reduce((best, i) => (flips(b, i, who).length > flips(b, best, who).length ? i : best))
  const depth = skill === 'Master' ? 3 : 1
  const sign = who === 2 ? 1 : -1
  const search = (board: Board, d: number, turn: Cell): number => {
    const ms = moves(board, turn)
    if (d === 0 || !ms.length) return sign * evaluate(board)
    const vals = ms.map(i => search(play(board, i, turn), d - 1, turn === 2 ? 1 : 2))
    return turn === who ? Math.max(...vals) : Math.min(...vals)
  }
  let best = options[0]
  let bestVal = -Infinity
  for (const i of options) {
    const v = search(play(b, i, who), depth, who === 2 ? 1 : 2)
    if (v > bestVal) { bestVal = v; best = i }
  }
  return best
}

/** Reversi (Windows 1.0 – 3.0): you are black, the computer is white. */
export function Reversi({ winId }: AppProps) {
  const os = useOS()
  const [board, setBoard] = useState(newBoard)
  const [turn, setTurn] = useState<Cell>(1)
  const [skill, setSkill] = useState<Skill>('Novice')
  const [hint, setHint] = useState<number | null>(null)
  const [msg, setMsg] = useState('')

  const mine = moves(board, 1)
  const theirs = moves(board, 2)
  const over = !mine.length && !theirs.length

  // Computer's turn.
  useEffect(() => {
    if (turn !== 2 || over) return
    const t = setTimeout(() => {
      const i = bestMove(board, skill)
      if (i === null) { setMsg('I must pass.'); setTurn(1); return }
      setBoard(play(board, i, 2))
      setMsg('')
      setTurn(1)
    }, 450)
    return () => clearTimeout(t)
  }, [turn, board, skill, over])

  // You have no move but the computer does → you must pass.
  useEffect(() => {
    if (turn === 1 && !over && !mine.length) setMsg('You must pass.')
  }, [turn, over, mine.length])

  const click = (i: number) => {
    if (turn !== 1 || over || !flips(board, i, 1).length) return
    setBoard(play(board, i, 1))
    setHint(null)
    setMsg('')
    setTurn(2)
  }

  const you = score(board, 1)
  const me = score(board, 2)
  const status = over
    ? you > me ? `You won by ${you - me}.` : you < me ? `You lost by ${me - you}.` : 'Tie game.'
    : msg || (turn === 2 ? 'Thinking...' : '')

  return (
    <div className="app app-w16-reversi">
      <MenuBar menus={[
        {
          label: 'Game',
          items: [
            { label: 'Hint', disabled: turn !== 1 || !mine.length, onClick: () => setHint(bestMove(board, 'Expert', 1)) },
            { label: 'Pass', disabled: turn !== 1 || mine.length > 0 || over, onClick: () => { setMsg(''); setTurn(2) } },
            { label: 'New', onClick: () => { setBoard(newBoard()); setTurn(1); setHint(null); setMsg('') } },
            { separator: true },
            { label: 'Exit', onClick: () => os.close(winId) },
          ],
        },
        { label: 'Skill', items: SKILLS.map(s => ({ label: s, checked: skill === s, onClick: () => setSkill(s) })) },
      ]} />
      <div className="reversi-board-wrap">
        <div className="reversi-board">
          {board.map((c, i) => (
            <div key={i} className={`reversi-cell${hint === i ? ' hint' : ''}${turn === 1 && mine.includes(i) ? ' legal' : ''}`} onClick={() => click(i)}>
              {c !== 0 && <span className={`reversi-disc ${c === 1 ? 'black' : 'white'}`} />}
            </div>
          ))}
        </div>
      </div>
      <div className="statusbar reversi-status">
        <span>You: {you}</span><span>{status}</span><span>Computer: {me}</span>
      </div>
    </div>
  )
}
