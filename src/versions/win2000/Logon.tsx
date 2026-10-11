import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../core'
import { Logo, StaticDialog, icons, type LogonProps } from '../classic'

function Banner() {
  return (
    <div className="w2k-logon-banner">
      <Logo edition="2000" small="Professional" />
      <span className="w2k-logon-built">Built on NT Technology</span>
    </div>
  )
}

/** Windows 2000 secure attention screen ("Press Ctrl-Alt-Delete") followed by the Log On dialog. */
export function Logon({ onDone, onShutDown }: LogonProps) {
  const [step, setStep] = useState<'sas' | 'login'>('sas')
  const [user, setUser] = useState('Administrator')
  const [password, setPassword] = useState('')
  const pwRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step !== 'sas') return
    const onKey = (e: KeyboardEvent) => {
      // Real Ctrl+Alt+Del can't be captured by a browser; accept Ctrl+Alt+Delete/Backspace or Enter.
      if ((e.ctrlKey && e.altKey && (e.key === 'Delete' || e.key === 'Backspace')) || e.key === 'Enter') {
        e.preventDefault()
        setStep('login')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  useEffect(() => { if (step === 'login') pwRef.current?.focus() }, [step])

  return (
    <div className="classic-screen w2k-logon">
      {step === 'sas' ? (
        <StaticDialog title="Welcome to Windows" className="w2k-logon-dialog">
          <Banner />
          <div className="classic-dialog w2k-logon-body">
            <div className="w2k-sas">
              <Icon src={icons.computer} size={32} />
              <p>Press Ctrl-Alt-Delete to begin.</p>
            </div>
            <p className="w2k-sas-note">
              Requiring users to press Ctrl-Alt-Delete before logging on helps keep your computer secure.
              <br />(In this browser, press Ctrl+Alt+Backspace, Enter, or click the button.)
            </p>
            <div className="classic-dialog-buttons">
              <button type="button" className="btn default" onClick={() => setStep('login')}>Ctrl+Alt+Del</button>
            </div>
          </div>
        </StaticDialog>
      ) : (
        <StaticDialog title="Log On to Windows" className="w2k-logon-dialog">
          <Banner />
          <form className="classic-dialog w2k-logon-body" onSubmit={e => { e.preventDefault(); onDone() }}>
            <div className="w2k-logon-fields">
              <label><span><u>U</u>ser name:</span><input className="field" value={user} onChange={e => setUser(e.target.value)} /></label>
              <label><span><u>P</u>assword:</span><input ref={pwRef} className="field" type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
            </div>
            <div className="classic-dialog-buttons">
              <button type="submit" className="btn default">OK</button>
              <button type="button" className="btn" onClick={() => { setPassword(''); setStep('sas') }}>Cancel</button>
              <button type="button" className="btn" onClick={onShutDown}><u>S</u>hutdown...</button>
              <button type="button" className="btn" disabled><u>O</u>ptions &lt;&lt;</button>
            </div>
          </form>
        </StaticDialog>
      )}
    </div>
  )
}
