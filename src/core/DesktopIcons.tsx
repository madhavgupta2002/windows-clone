import { useState } from 'react'
import { Icon } from './Icon'

export interface DesktopIconDef {
  id: string
  label: string
  icon?: string
  onOpen: () => void
}

/**
 * Column-flow grid of desktop shortcuts. Single click selects, double click opens.
 * Markup: .desktop-icons > .desktop-icon(.selected) > .desktop-icon-img + .desktop-icon-label
 */
export function DesktopIcons({ icons, className = '' }: { icons: DesktopIconDef[]; className?: string }) {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div className={`desktop-icons ${className}`} onPointerDown={e => e.target === e.currentTarget && setSelected(null)}>
      {icons.map(ic => (
        <div
          key={ic.id}
          className={`desktop-icon${selected === ic.id ? ' selected' : ''}`}
          onPointerDown={() => setSelected(ic.id)}
          onDoubleClick={() => { setSelected(null); ic.onOpen() }}
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && ic.onOpen()}
        >
          <Icon src={ic.icon} className="desktop-icon-img" />
          <span className="desktop-icon-label">{ic.label}</span>
        </div>
      ))}
    </div>
  )
}
