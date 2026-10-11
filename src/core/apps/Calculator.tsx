import { useReducer } from 'react'
import { MenuBar } from '../MenuBar'
import type { AppProps } from '../types'
import { calcReduce, initialCalc, keyFromKeyboard, type CalcKey } from './calcLogic'
import { useIsActive, useKeyDown } from './util'

interface KeyDef {
  label: string
  key: CalcKey
  kind?: 'op' | 'eq' | 'fn' | 'mem'
  title?: string
}

const d = (digit: string): KeyDef => ({ label: digit, key: { type: 'digit', digit } })

/** 5 columns × 6 rows, laid out by `.calc-keys` (CSS grid). */
const KEYS: KeyDef[] = [
  { label: 'MC', key: { type: 'memory', action: 'MC' }, kind: 'mem', title: 'Memory clear' },
  { label: 'MR', key: { type: 'memory', action: 'MR' }, kind: 'mem', title: 'Memory recall' },
  { label: 'MS', key: { type: 'memory', action: 'MS' }, kind: 'mem', title: 'Memory store' },
  { label: 'M+', key: { type: 'memory', action: 'M+' }, kind: 'mem', title: 'Memory add' },
  { label: '←', key: { type: 'backspace' }, kind: 'fn', title: 'Backspace' },

  { label: 'CE', key: { type: 'clearEntry' }, kind: 'fn', title: 'Clear entry' },
  { label: 'C', key: { type: 'clear' }, kind: 'fn', title: 'Clear' },
  { label: '±', key: { type: 'negate' }, kind: 'fn', title: 'Negate' },
  { label: '√', key: { type: 'sqrt' }, kind: 'fn', title: 'Square root' },
  { label: '%', key: { type: 'percent' }, kind: 'fn', title: 'Percent' },

  d('7'), d('8'), d('9'),
  { label: '÷', key: { type: 'op', op: '/' }, kind: 'op' },
  { label: '1/x', key: { type: 'reciprocal' }, kind: 'fn', title: 'Reciprocal' },

  d('4'), d('5'), d('6'),
  { label: '×', key: { type: 'op', op: '*' }, kind: 'op' },
  { label: '=', key: { type: 'equals' }, kind: 'eq' },

  d('1'), d('2'), d('3'),
  { label: '−', key: { type: 'op', op: '-' }, kind: 'op' },

  d('0'),
  { label: '.', key: { type: 'dot' } },
  { label: '+', key: { type: 'op', op: '+' }, kind: 'op' },
]

export default function Calculator({ winId }: AppProps) {
  const [state, press] = useReducer(calcReduce, initialCalc)

  useKeyDown(useIsActive(winId), e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    const key = keyFromKeyboard(e.key)
    if (!key) return
    e.preventDefault()
    press(key)
  })

  const copy = () => { void navigator.clipboard?.writeText(state.display) }
  const paste = async () => {
    const text = (await navigator.clipboard?.readText().catch(() => '')) ?? ''
    for (const ch of text.trim()) {
      const key = keyFromKeyboard(ch)
      if (key) press(key)
    }
  }

  return (
    <div className="app app-calculator">
      <MenuBar menus={[
        { label: 'Edit', items: [
          { label: 'Copy', shortcut: 'Ctrl+C', onClick: copy },
          { label: 'Paste', shortcut: 'Ctrl+V', onClick: () => void paste() },
        ] },
      ]} />
      <div className="calc-body">
        <div className="calc-display field" aria-live="polite">
          <span className="calc-memory">{state.memory !== 0 ? 'M' : ''}</span>
          <span className="calc-value">{state.display}</span>
        </div>
        <div className="calc-keys">
          {KEYS.map(k => (
            <button
              key={k.label}
              type="button"
              title={k.title}
              className={`btn calc-key${k.kind ? ` ${k.kind}` : ''}${k.kind === 'eq' ? ' calc-key-tall' : ''}${k.label === '0' ? ' calc-key-wide' : ''}`}
              onClick={() => press(k.key)}
              tabIndex={-1}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
