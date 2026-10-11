/** Pure pixel helpers for Paint. */

export type Tool = 'pencil' | 'brush' | 'eraser' | 'line' | 'rect' | 'ellipse' | 'fill' | 'picker'

/** The classic 28-colour palette (two rows of 14). */
export const PALETTE = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080ff', '#004080', '#8000ff', '#804000',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff0080', '#ff8040',
]

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export const rgbToHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')

/** Integer points on the segment (x0,y0)–(x1,y1) (Bresenham). */
export function linePoints(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1)
  const pts: [number, number][] = []
  const dx = Math.abs(x1 - x0)
  const dy = -Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy
  for (;;) {
    pts.push([x0, y0])
    if (x0 === x1 && y0 === y1) return pts
    const e2 = 2 * err
    if (e2 >= dy) { err += dy; x0 += sx }
    if (e2 <= dx) { err += dx; y0 += sy }
  }
}

/**
 * Scanline flood fill in place. Pixels within `tolerance` (per channel) of the
 * seed colour are replaced by `color`. Returns false if nothing changed.
 */
export function floodFill(img: ImageData, x: number, y: number, color: [number, number, number], tolerance = 24): boolean {
  const { width: w, height: h, data } = img
  x = Math.floor(x); y = Math.floor(y)
  if (x < 0 || y < 0 || x >= w || y >= h) return false
  const at = (px: number, py: number) => (py * w + px) * 4
  const s = at(x, y)
  const seed = [data[s], data[s + 1], data[s + 2], data[s + 3]]
  if (seed[0] === color[0] && seed[1] === color[1] && seed[2] === color[2] && seed[3] === 255) return false
  const matches = (i: number) =>
    Math.abs(data[i] - seed[0]) <= tolerance && Math.abs(data[i + 1] - seed[1]) <= tolerance &&
    Math.abs(data[i + 2] - seed[2]) <= tolerance && Math.abs(data[i + 3] - seed[3]) <= tolerance
  const seen = new Uint8Array(w * h)
  const stack: [number, number][] = [[x, y]]
  while (stack.length) {
    const [cx, cy] = stack.pop()!
    if (seen[cy * w + cx]) continue
    let lx = cx
    while (lx > 0 && !seen[cy * w + lx - 1] && matches(at(lx - 1, cy))) lx--
    let rx = cx
    while (rx < w - 1 && !seen[cy * w + rx + 1] && matches(at(rx + 1, cy))) rx++
    for (let px = lx; px <= rx; px++) {
      const i = at(px, cy)
      seen[cy * w + px] = 1
      data[i] = color[0]; data[i + 1] = color[1]; data[i + 2] = color[2]; data[i + 3] = 255
      for (const ny of [cy - 1, cy + 1]) {
        if (ny >= 0 && ny < h && !seen[ny * w + px] && matches(at(px, ny))) stack.push([px, ny])
      }
    }
  }
  return true
}
