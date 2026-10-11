import { useModern } from './context'
import { Glyph } from './icons'
import { timeAgo } from './ui'

/** Notification list used by the Win10 Action Center and the Win11 notification center. */
export function NotificationList({ emptyText = 'No new notifications' }: { emptyText?: string }) {
  const m = useModern()
  if (m.notices.length === 0) return <div className="m-notices-empty">{emptyText}</div>
  return (
    <div className="m-notices">
      {m.notices.map(n => (
        <div key={n.id} className="m-notice">
          <div className="m-notice-head">
            <img src={n.icon} alt="" />
            <span>{n.app}</span>
            <small>{timeAgo(n.time)}</small>
            <button aria-label="Dismiss notification" onClick={() => m.dismiss(n.id)}><Glyph name="close" size={10} /></button>
          </div>
          <b>{n.title}</b>
          <p>{n.body}</p>
        </div>
      ))}
    </div>
  )
}
