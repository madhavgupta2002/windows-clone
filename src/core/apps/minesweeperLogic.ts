/** Pure Minesweeper rules. Boards are immutable; every move returns a new Game. */

export interface Cell {
  mine: boolean
  open: boolean
  flag: boolean
  /** Number of neighbouring mines. */
  adj: number
}

export type Status = 'ready' | 'playing' | 'won' | 'lost'

export interface Difficulty {
  id: 'beginner' | 'intermediate' | 'expert'
  label: string
  w: number
  h: number
  mines: number
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'beginner', label: 'Beginner', w: 9, h: 9, mines: 10 },
  { id: 'intermediate', label: 'Intermediate', w: 16, h: 16, mines: 40 },
  { id: 'expert', label: 'Expert', w: 30, h: 16, mines: 99 },
]

export interface Game {
  w: number
  h: number
  mines: number
  cells: Cell[]
  status: Status
  /** Index of the mine that was clicked (lost games only). */
  boom: number | null
}

export function newGame({ w, h, mines }: Pick<Difficulty, 'w' | 'h' | 'mines'>): Game {
  const cells = Array.from({ length: w * h }, () => ({ mine: false, open: false, flag: false, adj: 0 }))
  return { w, h, mines, cells, status: 'ready', boom: null }
}

export function neighbours(g: Pick<Game, 'w' | 'h'>, i: number): number[] {
  const x = i % g.w
  const y = Math.floor(i / g.w)
  const out: number[] = []
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx
      const ny = y + dy
      if ((dx || dy) && nx >= 0 && ny >= 0 && nx < g.w && ny < g.h) out.push(ny * g.w + nx)
    }
  }
  return out
}

/** Lay mines avoiding `safe` (and its neighbours when the board has room), then count adjacency. */
function layMines(g: Game, safe: number, random: () => number): Cell[] {
  const avoid = new Set([safe])
  if (g.w * g.h - g.mines >= 9) neighbours(g, safe).forEach(n => avoid.add(n))
  const candidates = g.cells.map((_, i) => i).filter(i => !avoid.has(i))
  // Partial Fisher–Yates: the first `mines` candidates become mines.
  for (let k = 0; k < g.mines && k < candidates.length; k++) {
    const j = k + Math.floor(random() * (candidates.length - k))
    ;[candidates[k], candidates[j]] = [candidates[j], candidates[k]]
  }
  const mineSet = new Set(candidates.slice(0, g.mines))
  return g.cells.map((c, i) => ({
    ...c,
    mine: mineSet.has(i),
    adj: neighbours(g, i).filter(n => mineSet.has(n)).length,
  }))
}

/** Open cells starting at `start`, flood-filling across zero cells. Mutates `cells`. */
function flood(g: Game, cells: Cell[], start: number) {
  const stack = [start]
  while (stack.length) {
    const i = stack.pop()!
    const c = cells[i]
    if (c.open || c.flag) continue
    cells[i] = { ...c, open: true }
    if (!c.mine && c.adj === 0) stack.push(...neighbours(g, i).filter(n => !cells[n].open))
  }
}

function settle(g: Game, cells: Cell[], hit: number | null): Game {
  if (hit !== null) {
    // Reveal every mine; mark wrong flags stay visible via `flag && !mine`.
    return { ...g, cells: cells.map(c => (c.mine && !c.flag ? { ...c, open: true } : c)), status: 'lost', boom: hit }
  }
  const won = cells.every(c => c.mine || c.open)
  if (won) return { ...g, cells: cells.map(c => (c.mine ? { ...c, flag: true } : c)), status: 'won' }
  return { ...g, cells, status: 'playing' }
}

const finished = (g: Game) => g.status === 'won' || g.status === 'lost'

/** Left-click a cell. The first reveal of a game is always safe. */
export function reveal(g: Game, i: number, random: () => number = Math.random): Game {
  if (finished(g) || g.cells[i].open || g.cells[i].flag) return g
  const cells = g.status === 'ready' ? layMines(g, i, random) : [...g.cells]
  if (cells[i].mine) return settle(g, cells, i)
  flood(g, cells, i)
  return settle(g, cells, null)
}

/** Click an open number whose flag count matches: open all unflagged neighbours. */
export function chord(g: Game, i: number): Game {
  const c = g.cells[i]
  if (finished(g) || !c.open || c.adj === 0) return g
  const around = neighbours(g, i)
  if (around.filter(n => g.cells[n].flag).length !== c.adj) return g
  const cells = [...g.cells]
  let hit: number | null = null
  for (const n of around) {
    if (cells[n].flag || cells[n].open) continue
    if (cells[n].mine) { hit ??= n; cells[n] = { ...cells[n], open: true } } else flood(g, cells, n)
  }
  return settle(g, cells, hit)
}

export function toggleFlag(g: Game, i: number): Game {
  if (finished(g) || g.cells[i].open) return g
  const cells = [...g.cells]
  cells[i] = { ...cells[i], flag: !cells[i].flag }
  return { ...g, cells }
}

export const flagsLeft = (g: Game) => g.mines - g.cells.filter(c => c.flag).length
