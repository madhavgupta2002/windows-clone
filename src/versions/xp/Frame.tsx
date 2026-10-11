import { Icon, type FrameProps } from '../../core'

/** Dialog-style windows only get a close button. */
const DIALOGS = new Set(['msgbox', 'about', 'xp-run', 'xp-display'])

const Glyph = {
  min: <svg viewBox="0 0 21 21"><rect x="5" y="13" width="7" height="3" fill="#fff" /></svg>,
  max: <svg viewBox="0 0 21 21"><rect x="5" y="5" width="11" height="11" fill="none" stroke="#fff" strokeWidth="1" /><rect x="5" y="5" width="11" height="3" fill="#fff" /></svg>,
  restore: (
    <svg viewBox="0 0 21 21">
      <rect x="8" y="4" width="9" height="8" fill="none" stroke="#fff" /><rect x="8" y="4" width="9" height="2" fill="#fff" />
      <rect x="4" y="9" width="9" height="8" fill="#2d61d9" stroke="#fff" /><rect x="4" y="9" width="9" height="2" fill="#fff" />
    </svg>
  ),
  close: <svg viewBox="0 0 21 21"><path d="M6 6l9 9M15 6l-9 9" stroke="#fff" strokeWidth="2.2" strokeLinecap="square" /></svg>,
}

/** Luna Blue window frame: rounded blue gradient title bar, red close button. */
export function XpFrame({ win, active, dragHandle, onClose, onMinimize, onMaximize, children }: FrameProps) {
  const dialog = DIALOGS.has(win.appId)
  return (
    <div className={`xp-frame${active ? ' active' : ''}${win.maximized ? ' max' : ''}`}>
      <div className="xp-titlebar" {...dragHandle}>
        {!dialog && <Icon src={win.icon} size={16} className="xp-title-icon" />}
        <span className="xp-title-text">{win.title}</span>
        <div className="xp-title-buttons">
          {!dialog && <button className="xp-tb" onClick={onMinimize} aria-label="Minimize">{Glyph.min}</button>}
          {!dialog && (
            <button className="xp-tb" onClick={onMaximize} disabled={!win.resizable} aria-label="Maximize">
              {win.maximized ? Glyph.restore : Glyph.max}
            </button>
          )}
          <button className="xp-tb xp-tb-close" onClick={onClose} aria-label="Close">{Glyph.close}</button>
        </div>
      </div>
      <div className="xp-window-body">{children}</div>
    </div>
  )
}
