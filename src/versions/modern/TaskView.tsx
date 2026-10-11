import { useEffect } from 'react'
import { Icon, useOS } from '../../core'
import { Glyph } from './icons'

/** Task View: every open window as a card; click to switch, × to close. */
export function TaskView({ onClose }: { onClose: () => void }) {
  const os = useOS()
  const wins = [...os.windows].sort((a, b) => b.z - a.z)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="m-taskview" onPointerDown={e => e.target === e.currentTarget && onClose()}>
      <div className="m-taskview-grid" onPointerDown={e => e.target === e.currentTarget && onClose()}>
        {wins.length === 0 && <div className="m-taskview-empty">No open windows</div>}
        {wins.map(w => (
          <div key={w.id} className={`m-taskview-card${w.id === os.activeId ? ' active' : ''}`}
            onClick={() => { os.focus(w.id); onClose() }}>
            <div className="m-taskview-cardhead">
              <Icon src={w.icon} size={16} />
              <span>{w.title}</span>
              <button aria-label={`Close ${w.title}`} onClick={e => { e.stopPropagation(); os.close(w.id) }}>
                <Glyph name="close" size={12} />
              </button>
            </div>
            <div className="m-taskview-thumb"><Icon src={w.icon} size={56} /></div>
          </div>
        ))}
      </div>
      <div className="m-taskview-desktops">
        <div className="m-taskview-desktop active"><span>Desktop 1</span></div>
        <div className="m-taskview-desktop new"><Glyph name="plus" size={18} /><span>New desktop</span></div>
      </div>
    </div>
  )
}
