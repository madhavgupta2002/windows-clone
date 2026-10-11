/** Pure state machine for a standard (immediate-execution) calculator. */

export type BinaryOp = '+' | '-' | '*' | '/'
export type CalcKey =
  | { type: 'digit'; digit: string }
  | { type: 'dot' }
  | { type: 'op'; op: BinaryOp }
  | { type: 'equals' }
  | { type: 'clear' } // C: reset everything except memory
  | { type: 'clearEntry' } // CE: reset the current entry
  | { type: 'backspace' }
  | { type: 'negate' }
  | { type: 'percent' }
  | { type: 'sqrt' }
  | { type: 'reciprocal' }
  | { type: 'memory'; action: 'MC' | 'MR' | 'M+' | 'MS' }

export interface CalcState {
  /** Text shown on the display. */
  display: string
  /** Left operand waiting for the pending operator. */
  acc: number | null
  op: BinaryOp | null
  /** When true the next digit replaces the display instead of appending. */
  fresh: boolean
  /** Last operator + right operand, so repeated "=" repeats the operation. */
  repeat: { op: BinaryOp; operand: number } | null
  memory: number
  error: boolean
}

export const initialCalc: CalcState = {
  display: '0', acc: null, op: null, fresh: true, repeat: null, memory: 0, error: false,
}

const MAX_DIGITS = 16

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return 'Error'
  if (n === 0) return '0'
  const s = String(Number(n.toPrecision(14)))
  if (s.replace(/[-.]/g, '').length <= MAX_DIGITS && !s.includes('e')) return s
  return n.toExponential(9).replace(/\.?0+e/, 'e')
}

function apply(a: number, op: BinaryOp, b: number): number {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '*': return a * b
    case '/': return b === 0 ? NaN : a / b
  }
}

const value = (s: CalcState) => Number(s.display)

/** Show a computed result (or an error state). */
function show(s: CalcState, n: number, patch: Partial<CalcState> = {}): CalcState {
  if (!Number.isFinite(n)) return { ...initialCalc, memory: s.memory, display: 'Cannot divide by zero', error: true }
  return { ...s, ...patch, display: formatNumber(n), fresh: true }
}

export function calcReduce(s: CalcState, key: CalcKey): CalcState {
  // After an error only clearing (or memory recall) gets you out.
  if (s.error && key.type !== 'clear' && key.type !== 'clearEntry' && !(key.type === 'memory' && key.action === 'MR')) {
    if (key.type !== 'digit') return s
    s = { ...initialCalc, memory: s.memory }
  }

  switch (key.type) {
    case 'digit': {
      if (s.fresh) return { ...s, display: key.digit, fresh: false, error: false }
      if (s.display.replace(/[-.]/g, '').length >= MAX_DIGITS) return s
      return { ...s, display: s.display === '0' ? key.digit : s.display + key.digit }
    }
    case 'dot': {
      if (s.fresh) return { ...s, display: '0.', fresh: false }
      return s.display.includes('.') ? s : { ...s, display: s.display + '.' }
    }
    case 'op': {
      // Changing your mind about the operator: just swap it.
      if (s.op && s.fresh && s.acc !== null) return { ...s, op: key.op }
      if (s.op && s.acc !== null) {
        const result = apply(s.acc, s.op, value(s))
        return show(s, result, { acc: result, op: key.op, repeat: null })
      }
      return { ...s, acc: value(s), op: key.op, fresh: true, repeat: null }
    }
    case 'equals': {
      if (s.op && s.acc !== null) {
        const operand = value(s)
        return show(s, apply(s.acc, s.op, operand), { acc: null, op: null, repeat: { op: s.op, operand } })
      }
      if (s.repeat) return show(s, apply(value(s), s.repeat.op, s.repeat.operand))
      return { ...s, fresh: true }
    }
    case 'clear': return { ...initialCalc, memory: s.memory }
    case 'clearEntry': return s.error ? { ...initialCalc, memory: s.memory } : { ...s, display: '0', fresh: true }
    case 'backspace': {
      if (s.fresh) return s
      const d = s.display.slice(0, -1)
      return { ...s, display: d === '' || d === '-' ? '0' : d }
    }
    case 'negate': {
      if (s.display === '0') return s
      const display = s.display.startsWith('-') ? s.display.slice(1) : '-' + s.display
      return { ...s, display }
    }
    case 'percent': return show(s, s.acc !== null ? (s.acc * value(s)) / 100 : 0)
    case 'sqrt': return value(s) < 0 ? { ...initialCalc, memory: s.memory, display: 'Invalid input', error: true } : show(s, Math.sqrt(value(s)))
    case 'reciprocal': return show(s, 1 / value(s))
    case 'memory': {
      switch (key.action) {
        case 'MC': return { ...s, memory: 0 }
        case 'MR': return { ...s, display: formatNumber(s.memory), fresh: true, error: false }
        case 'MS': return { ...s, memory: value(s), fresh: true }
        case 'M+': return { ...s, memory: s.memory + value(s), fresh: true }
      }
    }
  }
}

/** Map a keyboard event key to a calculator key (or null if not a calculator key). */
export function keyFromKeyboard(key: string): CalcKey | null {
  if (/^[0-9]$/.test(key)) return { type: 'digit', digit: key }
  switch (key) {
    case '.': case ',': return { type: 'dot' }
    case '+': case '-': case '*': case '/': return { type: 'op', op: key }
    case 'x': case 'X': return { type: 'op', op: '*' }
    case 'Enter': case '=': return { type: 'equals' }
    case 'Escape': return { type: 'clear' }
    case 'Delete': return { type: 'clearEntry' }
    case 'Backspace': return { type: 'backspace' }
    case '%': return { type: 'percent' }
    case '@': return { type: 'sqrt' }
    case 'r': case 'R': return { type: 'reciprocal' }
    case 'F9': return { type: 'negate' }
    default: return null
  }
}
