import { useEffect, useState } from 'react'
import { MenuBar } from '../MenuBar'
import { useOS } from '../os'
import type { AppProps } from '../types'
import { NotFoundPage, PAGES } from './browserPages'
import { argStr, useAppTitle, useIsActive, useKeyDown, useWindowTitle } from './util'

/**
 * Turn whatever the user typed into a URL we are willing to load:
 * about: pages, or http(s). Anything else (other schemes, plain words) becomes a search.
 */
function normalizeUrl(input: string): string {
  const s = input.trim()
  if (!s) return 'about:blank'
  if (/^about:/i.test(s)) return 'about:' + s.slice(6)
  const search = () => `about:search?q=${encodeURIComponent(s)}`
  const tryHttp = (candidate: string) => {
    try {
      const u = new URL(candidate)
      return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null
    } catch { return null }
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(s) && !/^[\w-]+(\.[\w-]+)+(:\d+)?(\/|$)/.test(s)) return tryHttp(s) ?? search()
  if (!/\s/.test(s) && /^[\w-]+(\.[\w-]+)+(:\d+)?(\/.*)?$/.test(s)) return tryHttp(`https://${s}`) ?? search()
  return search()
}

const isWeb = (url: string) => /^https?:/i.test(url)

function splitAbout(url: string) {
  const q = url.indexOf('?')
  return { key: (q < 0 ? url : url.slice(0, q)).toLowerCase(), params: new URLSearchParams(q < 0 ? '' : url.slice(q + 1)) }
}

function pageTitle(url: string) {
  if (isWeb(url)) { try { return new URL(url).hostname } catch { return url } }
  const { key, params } = splitAbout(url)
  if (key === 'about:search') return `${params.get('q') ?? ''} - Search`
  return PAGES[key]?.title ?? 'Cannot find server'
}

/**
 * args:
 *  url?: string        first page (default: home)
 *  home?: string       home page URL (default "about:home")
 *  homeTitle?: string  heading of the home portal (default os.about.product)
 */
export default function Browser({ winId, args }: AppProps) {
  const os = useOS()
  const appTitle = useAppTitle('browser', 'Internet Explorer')
  const home = normalizeUrl(argStr(args, 'home', 'about:home'))
  const homeTitle = argStr(args, 'homeTitle') ?? os.about.product

  const [history, setHistory] = useState(() => [normalizeUrl(argStr(args, 'url', home))])
  const [index, setIndex] = useState(0)
  const [reloads, setReloads] = useState(0)
  const url = history[index]
  const [address, setAddress] = useState(url)

  useEffect(() => setAddress(url), [url])
  useWindowTitle(winId, `${pageTitle(url)} - ${appTitle}`)

  const go = (input: string) => {
    const next = normalizeUrl(input)
    if (next === url) { setReloads(r => r + 1); return }
    setHistory([...history.slice(0, index + 1), next])
    setIndex(index + 1)
  }
  const canBack = index > 0
  const canForward = index < history.length - 1
  const refresh = () => setReloads(r => r + 1)
  useKeyDown(useIsActive(winId), e => {
    if (e.key === 'F5') { e.preventDefault(); refresh() }
  })

  const page = (() => {
    if (isWeb(url)) {
      return (
        <div className="browser-web">
          <div className="browser-notice">
            Many websites refuse to be shown inside another page. If this stays blank,{' '}
            <a href={url} target="_blank" rel="noopener noreferrer">open {pageTitle(url)} in a new tab ↗</a>
          </div>
          <iframe
            key={reloads}
            className="browser-frame"
            src={url}
            title={pageTitle(url)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
          />
        </div>
      )
    }
    const { key, params } = splitAbout(url)
    const def = PAGES[key]
    if (!def) return <NotFoundPage url={url} />
    return <div key={reloads} className="browser-doc">{def.render({ go, params, homeTitle, versionId: os.versionId })}</div>
  })()

  return (
    <div className="app app-browser">
      <MenuBar menus={[
        { label: 'File', items: [
          { label: 'New Window', onClick: () => os.open('browser', { ...args, url }) },
          { separator: true },
          { label: 'Close', onClick: () => os.close(winId) },
        ] },
        { label: 'View', items: [{ label: 'Refresh', shortcut: 'F5', onClick: refresh }] },
        { label: 'Go', items: [
          { label: 'Back', disabled: !canBack, onClick: () => setIndex(index - 1) },
          { label: 'Forward', disabled: !canForward, onClick: () => setIndex(index + 1) },
          { label: 'Home Page', onClick: () => go(home) },
        ] },
        { label: 'Favorites', items: Object.entries(PAGES)
          .filter(([k, p]) => p.keywords && k !== 'about:search')
          .map(([k, p]) => ({ label: p.title, onClick: () => go(k) })) },
        { label: 'Help', items: [{ label: `About ${appTitle}`, onClick: () => os.alert(appTitle, `${appTitle}\nPart of ${os.about.product}.`) }] },
      ]} />
      <div className="toolbar browser-toolbar">
        <button type="button" className="btn" disabled={!canBack} onClick={() => setIndex(index - 1)} title="Back">◀ Back</button>
        <button type="button" className="btn" disabled={!canForward} onClick={() => setIndex(index + 1)} title="Forward">Forward ▶</button>
        <button type="button" className="btn" onClick={refresh} title="Refresh">⟳ Refresh</button>
        <button type="button" className="btn" onClick={() => go(home)} title="Home">⌂ Home</button>
      </div>
      <form className="browser-address toolbar" onSubmit={e => { e.preventDefault(); go(address) }}>
        <label>Address</label>
        <input className="field" value={address} onChange={e => setAddress(e.target.value)} onFocus={e => e.currentTarget.select()} spellCheck={false} />
        <button type="submit" className="btn">Go</button>
      </form>
      <div className="browser-page sunken">{page}</div>
      <div className="statusbar"><span>Done</span><span>{isWeb(url) ? 'Internet' : 'Local intranet'}</span></div>
    </div>
  )
}
