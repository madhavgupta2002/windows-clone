import { useState } from 'react'
import { Icon, useOS, usePref, type AppDef, type AppProps } from '../../core'
import { icons } from '../classic'

interface RestorePoint {
  at: number
  label: string
}

type Step = 'welcome' | 'create' | 'pick' | 'done'

const fmt = (t: number) => new Date(t).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

/** Windows Me's System Restore wizard (a friendly stub: restore points are just remembered). */
function SystemRestore({ winId }: AppProps) {
  const os = useOS()
  const [points, setPoints] = usePref<RestorePoint[]>('winme.restorePoints', [
    { at: Date.now() - 86_400_000, label: 'System Checkpoint' },
    { at: Date.now() - 3 * 86_400_000, label: 'Installed Windows Media Player 7' },
  ])
  const [step, setStep] = useState<Step>('welcome')
  const [mode, setMode] = useState<'restore' | 'create'>('restore')
  const [desc, setDesc] = useState('')
  const [picked, setPicked] = useState(0)
  const [result, setResult] = useState('')

  const next = () => {
    if (step === 'welcome') setStep(mode === 'create' ? 'create' : 'pick')
    else if (step === 'create') {
      const label = desc.trim() || 'Manual restore point'
      setPoints([{ at: Date.now(), label }, ...points])
      setResult(`Restore point created:\n\n${fmt(Date.now())}  ${label}`)
      setStep('done')
    } else if (step === 'pick') {
      const p = points[picked]
      setResult(p ? `Your computer has been successfully restored to:\n\n${fmt(p.at)}  ${p.label}` : 'No restore point selected.')
      setStep('done')
    } else os.close(winId)
  }

  return (
    <div className="app winme-restore">
      <div className="winme-restore-main">
        <aside><Icon src={icons.restore} size={32} /></aside>
        <section>
          {step === 'welcome' && (
            <>
              <h1>Welcome to System Restore</h1>
              <p>You can use System Restore to undo harmful changes to your computer and restore its settings and performance. System Restore returns your computer to an earlier time (called a restore point) without causing you to lose recent work.</p>
              <p>To begin, select the task that you want to perform:</p>
              <label className="classic-radio"><input type="radio" checked={mode === 'restore'} onChange={() => setMode('restore')} /> Restore my computer to an earlier time</label>
              <label className="classic-radio"><input type="radio" checked={mode === 'create'} onChange={() => setMode('create')} /> Create a restore point</label>
            </>
          )}
          {step === 'create' && (
            <>
              <h1>Create a Restore Point</h1>
              <p>Type a description for your restore point. The current date and time are automatically added.</p>
              <label className="winme-restore-field">Restore point description:
                <input className="field" autoFocus value={desc} onChange={e => setDesc(e.target.value)} />
              </label>
            </>
          )}
          {step === 'pick' && (
            <>
              <h1>Select a Restore Point</h1>
              <p>Click the restore point you want to use, then click Next.</p>
              <div className="listview sunken winme-restore-list">
                {points.map((p, i) => (
                  <div key={p.at} className={`listview-item${picked === i ? ' selected' : ''}`} onClick={() => setPicked(i)}>
                    {fmt(p.at)} — {p.label}
                  </div>
                ))}
              </div>
            </>
          )}
          {step === 'done' && (
            <>
              <h1>{mode === 'create' ? 'Restore Point Created' : 'Restoration Complete'}</h1>
              <p className="winme-restore-result">{result}</p>
            </>
          )}
        </section>
      </div>
      <div className="classic-dialog-buttons winme-restore-buttons">
        <button type="button" className="btn" disabled={step === 'welcome' || step === 'done'} onClick={() => setStep('welcome')}>&lt; <u>B</u>ack</button>
        <button type="button" className="btn default" onClick={next}>{step === 'done' ? 'OK' : <><u>N</u>ext &gt;</>}</button>
        <button type="button" className="btn" onClick={() => os.close(winId)}>Cancel</button>
      </div>
    </div>
  )
}

export const SystemRestoreApp: AppDef = {
  id: 'restore', title: 'System Restore', icon: icons.restore, component: SystemRestore, width: 580, height: 400, resizable: false, single: true,
}
