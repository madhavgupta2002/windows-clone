import { Icon, type FrameProps } from '../../core'

/** Apps that render as dialogs: close button only, no minimize/maximize. */
export const DIALOG_APPS = new Set(['msgbox', 'about', 'run', 'datetime', 'display', 'tips'])

type Glyph = 'min' | 'max' | 'restore' | 'close'

const rects = (list: [number, number, number, number][]) => list.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h${-w}z`).join('')

/** Pixel glyphs for the caption buttons (10×9 grid), drawn crisp at 1x. */
const GLYPHS: Record<Glyph, string> = {
  min: rects([[2, 6, 6, 2]]),
  max: 'M0 0h10v9H0zM1 2v6h8V2z',
  restore: 'M3 0h7v6H7V5h2V2H4v1H3zM0 3h7v6H0zM1 5v3h5V5z',
  close: rects([[1, 1, 2, 1], [7, 1, 2, 1], [2, 2, 2, 1], [6, 2, 2, 1], [3, 3, 4, 1], [4, 4, 2, 1], [3, 5, 4, 1], [2, 6, 2, 1], [6, 6, 2, 1], [1, 7, 2, 1], [7, 7, 2, 1]]),
}

export function CaptionButton({ glyph, onClick, disabled, label }: { glyph: Glyph; onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      className={`classic-caption-btn ${glyph}`}
      aria-label={label}
      disabled={disabled}
      onClick={e => { e.stopPropagation(); onClick() }}
      onDoubleClick={e => e.stopPropagation()}
    >
      <svg viewBox="0 0 10 9" width="10" height="9" shapeRendering="crispEdges" aria-hidden>
        <path d={GLYPHS[glyph]} fillRule="evenodd" />
      </svg>
    </button>
  )
}

/** Classic 32-bit window frame: raised 2px bevel, (gradient) caption, three caption buttons. */
export function ClassicFrame({ win, active, dragHandle, onClose, onMinimize, onMaximize, children }: FrameProps) {
  const dialog = DIALOG_APPS.has(win.appId)
  return (
    <div className={`classic-window${active ? ' active' : ''}${dialog ? ' dialog' : ''}`}>
      <div className="classic-titlebar" {...dragHandle}>
        {!dialog && <Icon src={win.icon} size={16} className="classic-title-icon" />}
        <span className="classic-title-text">{win.title}</span>
        <div className="classic-caption-btns">
          {!dialog && <CaptionButton glyph="min" label="Minimize" onClick={onMinimize} />}
          {!dialog && (
            <CaptionButton glyph={win.maximized ? 'restore' : 'max'} label="Maximize" onClick={onMaximize} disabled={!win.resizable} />
          )}
          <CaptionButton glyph="close" label="Close" onClick={onClose} />
        </div>
      </div>
      <div className="classic-window-body">{children}</div>
    </div>
  )
}
