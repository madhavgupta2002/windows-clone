import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Icon } from '../../core'
import { CaptionButton } from './Frame'
import { icons } from './icons'
import type { ClassicConfig, ShutDownChoice } from './types'

/** A classic dialog window drawn without the window manager (modal shell dialogs). */
export function StaticDialog({ title, children, className = '', onClose }: { title: string; children: ReactNode; className?: string; onClose?: () => void }) {
  return (
    <div className={`classic-window active dialog classic-static-dialog ${className}`} role="dialog" aria-label={title}>
      <div className="classic-titlebar">
        <span className="classic-title-text">{title}</span>
        {onClose && (
          <div className="classic-caption-btns">
            <CaptionButton glyph="close" label="Close" onClick={onClose} />
          </div>
        )}
      </div>
      <div className="classic-window-body">{children}</div>
    </div>
  )
}

/** Shut Down Windows dialog over a dithered screen. */
export function ShutDownDialog({ config, onChoose, onCancel }: { config: ClassicConfig; onChoose: (c: ShutDownChoice) => void; onCancel: () => void }) {
  const { style, prompt, options, okLabel = 'OK', cancelLabel = 'Cancel' } = config.shutDown
  const [choice, setChoice] = useState<ShutDownChoice>((options.find(o => o.id === 'shutdown') ?? options[0]).id)
  const selected = options.find(o => o.id === choice)
  const ok = () => onChoose(choice)
  return (
    <div className="classic-dither" onPointerDown={e => e.target === e.currentTarget && onCancel()}>
      <StaticDialog title="Shut Down Windows" onClose={onCancel}>
        <form className="classic-dialog classic-shutdown" onSubmit={e => { e.preventDefault(); ok() }}>
          <div className="classic-shutdown-main">
            <Icon src={icons.shutdown} size={32} />
            <div className="classic-shutdown-choices">
              <p>{prompt}</p>
              {style === 'radios' ? (
                options.map(o => (
                  <label key={o.id} className="classic-radio">
                    <input type="radio" name="shutdown" checked={choice === o.id} onChange={() => setChoice(o.id)} />
                    <span>{o.label}</span>
                  </label>
                ))
              ) : (
                <>
                  <select className="field" value={choice} onChange={e => setChoice(e.target.value as ShutDownChoice)} autoFocus>
                    {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                  {selected?.description && <p className="classic-shutdown-desc">{selected.description}</p>}
                </>
              )}
            </div>
          </div>
          <div className="classic-dialog-buttons">
            <button type="submit" className="btn default" autoFocus={style === 'radios'}>{okLabel}</button>
            <button type="button" className="btn" onClick={onCancel}>{cancelLabel}</button>
            <button type="button" className="btn" disabled>Help</button>
          </div>
        </form>
      </StaticDialog>
    </div>
  )
}

/** "Please wait while your computer shuts down." */
export function ClosingScreen({ onDone, nt }: { onDone: () => void; nt: boolean }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1600)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className={`classic-screen ${nt ? 'classic-black' : 'classic-closing'}`}>
      {nt ? (
        <StaticDialog title="Shutdown in Progress"><div className="classic-dialog classic-pad">Please wait while the system writes unsaved data to the disk.</div></StaticDialog>
      ) : (
        <p className="classic-closing-text">Please wait while your computer shuts down.</p>
      )}
    </div>
  )
}

/** "It's now safe to turn off your computer." Clicking returns to the launcher. */
export function SafeScreen({ nt, onExit, onRestart }: { nt: boolean; onExit: () => void; onRestart: () => void }) {
  if (nt) {
    return (
      <div className="classic-screen classic-black">
        <StaticDialog title="Shut Down Computer">
          <div className="classic-dialog classic-pad classic-safe-nt">
            <div className="classic-shutdown-main">
              <Icon src={icons.computer} size={32} />
              <p>It is now safe to turn off your computer.</p>
            </div>
            <div className="classic-dialog-buttons">
              <button type="button" className="btn default" onClick={onRestart}>Restart</button>
              <button type="button" className="btn" onClick={onExit}>Exit to launcher</button>
            </div>
          </div>
        </StaticDialog>
      </div>
    )
  }
  return (
    <div className="classic-screen classic-black classic-safe-9x" onClick={onExit} title="Click to return to the launcher">
      <p>It&rsquo;s now safe to turn off<br />your computer.</p>
      <small>Click anywhere to return to the launcher</small>
    </div>
  )
}

/** Stand by: a black screen until the user moves/clicks. */
export function StandbyScreen({ onWake }: { onWake: () => void }) {
  return <div className="classic-screen classic-black" onClick={onWake} onKeyDown={onWake} tabIndex={0} title="Click to wake up" />
}

/** "Restart in MS-DOS mode": a tiny prompt; `exit` or `win` returns to Windows. */
export function DosScreen({ product, version, onExit, onLauncher }: { product: string; version: string; onExit: () => void; onLauncher: () => void }) {
  const [lines, setLines] = useState<string[]>(['', `Microsoft(R) ${product.replace(/^Microsoft /, '')}`, '   (C)Copyright Microsoft Corp 1981-2000.', ''])
  const [cmd, setCmd] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => input.current?.focus(), [])

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const c = cmd.trim().toLowerCase()
    const out: string[] = [`C:\\WINDOWS>${cmd}`]
    if (c === 'exit' || c === 'win') { onExit(); return }
    if (c === 'shutdown' || c === 'quit') { onLauncher(); return }
    if (c === 'ver') out.push('', `${product} [Version ${version}]`, '')
    else if (c === 'cls') { setLines([]); setCmd(''); return }
    else if (c === 'dir') out.push(' Volume in drive C has no label', ' Directory of C:\\WINDOWS', '', 'COMMAND  COM        93,890  05-11-98  8:01p', 'WIN      COM        24,503  05-11-98  8:01p', '')
    else if (c === 'help') out.push('Type WIN or EXIT to return to Windows, QUIT to go back to the launcher.')
    else if (c) out.push('Bad command or file name', '')
    setLines(l => [...l, ...out])
    setCmd('')
  }

  return (
    <div className="classic-screen classic-dos" onClick={() => input.current?.focus()}>
      {lines.map((l, i) => <div key={i}>{l || '\u00a0'}</div>)}
      <div className="classic-dos-line">
        C:\WINDOWS&gt;
        <input ref={input} value={cmd} onChange={e => setCmd(e.target.value)} onKeyDown={onKey} spellCheck={false} aria-label="Command" />
      </div>
      <div className="classic-dos-hint">Type WIN to return to Windows</div>
    </div>
  )
}
