import { Icon, type FrameProps } from '../../core'

const DIALOGS = new Set(['msgbox', 'about'])

/** Aero glass frame: translucent blurred border, glowing caption, red close button. */
export function VistaFrame({ win, active, dragHandle, onClose, onMinimize, onMaximize, children }: FrameProps) {
  const dialog = DIALOGS.has(win.appId)
  return (
    <div className={`vista-frame${active ? ' active' : ''}${win.maximized ? ' max' : ''}`}>
      <div className="vista-titlebar" {...dragHandle}>
        <Icon src={win.icon} size={16} className="vista-title-icon" />
        <span className="vista-title-text">{win.title}</span>
        <div className="vista-caption-buttons">
          {!dialog && (
            <>
              <button className="vista-cb" onClick={onMinimize} aria-label="Minimize">
                <svg viewBox="0 0 10 10"><rect x="1" y="6" width="8" height="2" /></svg>
              </button>
              <button className="vista-cb" onClick={onMaximize} disabled={!win.resizable} aria-label="Maximize">
                {win.maximized
                  ? <svg viewBox="0 0 10 10"><path d="M3 1h6v5H8V2.5H3zM1 4h6v5H1zM2 5.5v2.5h4V5.5z" fillRule="evenodd" /></svg>
                  : <svg viewBox="0 0 10 10"><path d="M1 1h8v8H1zM2.5 3v4.5h5V3z" fillRule="evenodd" /></svg>}
              </button>
            </>
          )}
          <button className="vista-cb vista-cb-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 10 10"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" strokeWidth="2" /></svg>
          </button>
        </div>
      </div>
      <div className="vista-window-body">{children}</div>
    </div>
  )
}
