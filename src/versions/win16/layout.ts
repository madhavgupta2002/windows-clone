/** Geometry helpers shared by tiling (1.0), Task List (3.1) and Program Manager's Window menu. */
export interface Rect { x: number; y: number; w: number; h: number }

/**
 * Tile `n` rectangles into `area`: ceil(sqrt(n)) columns, the earlier columns get fewer rows
 * (1 → full, 2 → side by side, 3 → one left + two stacked right, like Windows 1.0).
 */
export function tileRects(n: number, area: Rect): Rect[] {
  if (n <= 0) return []
  const cols = Math.ceil(Math.sqrt(n))
  const base = Math.floor(n / cols)
  const extra = n % cols // the last `extra` columns get one more row
  const colW = Math.floor(area.w / cols)
  const out: Rect[] = []
  for (let c = 0; c < cols; c++) {
    const rows = base + (c >= cols - extra ? 1 : 0)
    const rowH = Math.floor(area.h / rows)
    for (let r = 0; r < rows; r++) {
      out.push({
        x: area.x + c * colW,
        y: area.y + r * rowH,
        w: c === cols - 1 ? area.w - c * colW : colW,
        h: r === rows - 1 ? area.h - r * rowH : rowH,
      })
    }
  }
  return out
}

/** Cascade `n` rectangles from the top-left of `area`. */
export function cascadeRects(n: number, area: Rect, step = 22): Rect[] {
  const w = Math.max(200, Math.round(area.w * 0.7))
  const h = Math.max(120, Math.round(area.h * 0.65))
  const maxOff = Math.max(0, Math.min(area.w - w, area.h - h))
  return Array.from({ length: n }, (_, i) => {
    const off = maxOff ? (i * step) % (maxOff + 1) : 0
    return { x: area.x + off, y: area.y + off, w: Math.min(w, area.w), h: Math.min(h, area.h) }
  })
}

/** Follow the pointer until release, calling onMove with the total delta. */
export function trackPointer(e: { clientX: number; clientY: number }, onMove: (dx: number, dy: number) => void) {
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
