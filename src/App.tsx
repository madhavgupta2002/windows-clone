import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Launcher } from './Launcher'
import { versions } from './versions'

const readHash = () => location.hash.replace(/^#\/?/, '')

/** Hash router: "#/xp" boots Windows XP, empty hash shows the launcher. */
export function App() {
  const [route, setRoute] = useState(readHash)
  useEffect(() => {
    const onHash = () => setRoute(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const version = versions.find(v => v.id === route)
  const Shell = useMemo(() => (version ? lazy(version.load) : null), [version])

  useEffect(() => {
    document.title = version ? version.name : 'Windows Clone — 1.0 to 11'
  }, [version])

  if (!Shell) return <Launcher />
  return (
    <Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: '#000' }} />}>
      <Shell key={route} />
    </Suspense>
  )
}
