import { useEffect, useState, type ReactNode } from 'react'
import { usePref } from '../hooks'

/** Built-in "web" pages for the shared Browser, rendered as React. */

export interface PageCtx {
  /** Navigate the browser to a URL (about: page or http(s)). */
  go: (url: string) => void
  /** Query string of the current about: URL, e.g. `q` for about:search?q=… */
  params: URLSearchParams
  homeTitle: string
  versionId: string
}

export interface PageDef {
  title: string
  /** Words matched by the built-in search. */
  keywords: string
  render: (ctx: PageCtx) => ReactNode
}

export const wikipediaSearch = (q: string) => `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(q)}`
export const wikipediaArticle = (q: string) => `https://en.wikipedia.org/wiki/${encodeURIComponent(q.trim().replace(/\s+/g, '_'))}`

/** In-page link: `href` is real (for hover/status), but clicks navigate inside the browser. */
export function Link({ to, go, children }: { to: string; go: (url: string) => void; children: ReactNode }) {
  return (
    <a className="browser-link" href={to} onClick={e => { e.preventDefault(); go(to) }}>
      {children}
    </a>
  )
}

function SearchBox({ go, initial = '' }: { go: (url: string) => void; initial?: string }) {
  const [q, setQ] = useState(initial)
  return (
    <form className="web-search" onSubmit={e => { e.preventDefault(); if (q.trim()) go(`about:search?q=${encodeURIComponent(q.trim())}`) }}>
      <input className="field" value={q} onChange={e => setQ(e.target.value)} placeholder="Search the Web" aria-label="Search" />
      <button type="submit" className="btn">Search</button>
    </form>
  )
}

const RETRO_RING = ['about:retro', 'about:news', 'about:guestbook', 'about:webring']

function WebRingNav({ go, current }: { go: (url: string) => void; current: string }) {
  const i = RETRO_RING.indexOf(current)
  const prev = RETRO_RING[(i - 1 + RETRO_RING.length) % RETRO_RING.length]
  const next = RETRO_RING[(i + 1) % RETRO_RING.length]
  return (
    <div className="web-ring">
      <Link to={prev} go={go}>&lt;&lt; Prev</Link> | <Link to="about:webring" go={go}>Retro Web Ring</Link> | <Link to={next} go={go}>Next &gt;&gt;</Link>
    </div>
  )
}

function HitCounter({ versionId, page }: { versionId: string; page: string }) {
  const [hits, setHits] = usePref(`${versionId}.browser.hits.${page}`, 1337)
  useEffect(() => { setHits(h => h + 1) }, [setHits])
  return <span className="web-counter">{String(hits).padStart(6, '0')}</span>
}

function Guestbook({ versionId }: { versionId: string }) {
  const [entries, setEntries] = usePref<{ name: string; text: string; at: number }[]>(`${versionId}.browser.guestbook`, [
    { name: 'webmaster', text: 'First! Thanks for stopping by. Sign my guestbook!!', at: 915148800000 },
    { name: 'CoolSurfer98', text: 'Awesome page d00d. Love the dancing hamsters.', at: 917827200000 },
  ])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  return (
    <>
      <form
        className="web-guestbook-form"
        onSubmit={e => {
          e.preventDefault()
          if (!text.trim()) return
          setEntries([{ name: name.trim() || 'Anonymous', text: text.trim(), at: Date.now() }, ...entries].slice(0, 50))
          setText('')
        }}
      >
        <label>Name: <input className="field" value={name} onChange={e => setName(e.target.value)} maxLength={40} /></label>
        <label>Message: <textarea className="field" value={text} onChange={e => setText(e.target.value)} maxLength={500} rows={3} /></label>
        <button type="submit" className="btn">Sign Guestbook</button>
      </form>
      <hr />
      {entries.map((en, i) => (
        <div key={i} className="web-guestbook-entry">
          <b>{en.name}</b> <small>wrote on {new Date(en.at).toLocaleDateString()}:</small>
          <div>{en.text}</div>
        </div>
      ))}
    </>
  )
}

export const PAGES: Record<string, PageDef> = {
  'about:blank': { title: 'about:blank', keywords: '', render: () => null },

  'about:home': {
    title: 'Home',
    keywords: 'home portal start',
    render: ({ go, homeTitle }) => (
      <div className="web-page web-home">
        <h1 className="web-home-title">{homeTitle}</h1>
        <p className="web-tagline">Your gateway to the World Wide Web</p>
        <SearchBox go={go} />
        <div className="web-home-columns">
          <section>
            <h3>Cool Sites</h3>
            <ul>
              <li><Link to="about:retro" go={go}>Dave's Totally Rad Homepage</Link></li>
              <li><Link to="about:news" go={go}>The Daily Byte</Link></li>
              <li><Link to="about:guestbook" go={go}>Sign the Guestbook</Link></li>
              <li><Link to="about:webring" go={go}>The Retro Web Ring</Link></li>
            </ul>
          </section>
          <section>
            <h3>On the Real Web</h3>
            <ul>
              <li><Link to="https://en.wikipedia.org/wiki/Microsoft_Windows" go={go}>Microsoft Windows (Wikipedia)</Link></li>
              <li><Link to="https://en.wikipedia.org/wiki/History_of_the_World_Wide_Web" go={go}>History of the Web</Link></li>
              <li><Link to="https://example.com/" go={go}>example.com</Link></li>
            </ul>
          </section>
        </div>
      </div>
    ),
  },

  'about:search': {
    title: 'Search Results',
    keywords: '',
    render: ({ go, params }) => {
      const q = params.get('q') ?? ''
      const words = q.toLowerCase().split(/\s+/).filter(Boolean)
      const local = Object.entries(PAGES).filter(([, p]) => p.keywords && words.some(w => p.keywords.includes(w) || p.title.toLowerCase().includes(w)))
      return (
        <div className="web-page web-search-results">
          <SearchBox go={go} initial={q} key={q} />
          <h2>Results for “{q}”</h2>
          <ol>
            <li>
              <Link to={wikipediaArticle(q)} go={go}>{q} — Wikipedia</Link>
              <div className="web-url">{wikipediaArticle(q)}</div>
            </li>
            <li>
              <Link to={wikipediaSearch(q)} go={go}>Search Wikipedia for “{q}”</Link>
              <div className="web-url">{wikipediaSearch(q)}</div>
            </li>
            {local.map(([url, p]) => (
              <li key={url}>
                <Link to={url} go={go}>{p.title}</Link>
                <div className="web-url">{url}</div>
              </li>
            ))}
          </ol>
        </div>
      )
    },
  },

  'about:retro': {
    title: "Dave's Totally Rad Homepage",
    keywords: 'retro homepage geocities dave rad hamster under construction 90s',
    render: ({ go, versionId }) => (
      <div className="web-page web-retro">
        <div className="web-marquee"><span>★ Welcome to my homepage on the Information Superhighway! ★ Best viewed at 800×600 ★</span></div>
        <h1 className="web-rainbow">Dave's Totally Rad Homepage</h1>
        <div className="web-construction">🚧 UNDER CONSTRUCTION 🚧</div>
        <p>Hi! My name is Dave and this is my corner of the web. I like computers, pizza and my hamster <b>Byte</b>. 🐹🐹🐹</p>
        <h3>My Favorite Things</h3>
        <ul>
          <li>Playing Minesweeper on Expert (personal best: 142 seconds!)</li>
          <li>Drawing in Paint</li>
          <li>Writing poems in Notepad</li>
        </ul>
        <p>Please <Link to="about:guestbook" go={go}>sign my guestbook</Link>!</p>
        <p className="web-small">You are visitor number <HitCounter versionId={versionId} page="retro" /></p>
        <WebRingNav go={go} current="about:retro" />
      </div>
    ),
  },

  'about:news': {
    title: 'The Daily Byte',
    keywords: 'news daily byte y2k millennium modem',
    render: ({ go }) => (
      <div className="web-page web-news">
        <h1>The Daily Byte</h1>
        <p className="web-small">All the news that fits in 640K</p>
        <article>
          <h2>Experts: Y2K Bug “Totally Under Control,” Probably</h2>
          <p>Engineers worldwide continue to replace two-digit years with four-digit ones. Stock up on canned goods anyway, say some.</p>
        </article>
        <article>
          <h2>56k Modems Now in Stores — Is Faster Even Possible?</h2>
          <p>Download an entire song in under ten minutes. Analysts doubt anyone will ever need more bandwidth.</p>
        </article>
        <article>
          <h2>Local Man Finally Beats Minesweeper on Expert</h2>
          <p>“I just clicked and hoped,” he told reporters.</p>
        </article>
        <WebRingNav go={go} current="about:news" />
      </div>
    ),
  },

  'about:guestbook': {
    title: 'Guestbook',
    keywords: 'guestbook sign message',
    render: ({ go, versionId }) => (
      <div className="web-page web-retro">
        <h1 className="web-rainbow">Sign My Guestbook!</h1>
        <Guestbook versionId={versionId} />
        <WebRingNav go={go} current="about:guestbook" />
      </div>
    ),
  },

  'about:webring': {
    title: 'The Retro Web Ring',
    keywords: 'webring ring retro sites links',
    render: ({ go }) => (
      <div className="web-page web-news">
        <h1>💍 The Retro Web Ring</h1>
        <p>A ring of the finest homepages on the Net. Click Next to surf the ring!</p>
        <ul>
          {RETRO_RING.filter(u => u !== 'about:webring').map(u => (
            <li key={u}><Link to={u} go={go}>{PAGES[u].title}</Link></li>
          ))}
        </ul>
        <WebRingNav go={go} current="about:webring" />
      </div>
    ),
  },
}

export function NotFoundPage({ url }: { url: string }) {
  return (
    <div className="web-page web-error">
      <h2>The page cannot be displayed</h2>
      <p>The page you are looking for, <b>{url}</b>, is currently unavailable.</p>
      <ul>
        <li>Check the address for typing errors.</li>
        <li>Try a search from the Home page.</li>
      </ul>
    </div>
  )
}
