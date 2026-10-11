import { versions } from './versions'
import './launcher.css'

export function Launcher() {
  return (
    <main className="launcher">
      <header>
        <h1>Windows Clone</h1>
        <p>Every desktop Windows release from 1.0 to 11, running in your browser. Pick a version to boot it.</p>
      </header>
      <ol className="launcher-grid">
        {versions.map(v => (
          <li key={v.id}>
            <a href={`#/${v.id}`} className="launcher-card">
              <span className="launcher-preview" style={{ background: v.preview }} />
              <span className="launcher-name">{v.name}</span>
              <span className="launcher-year">{v.year}</span>
              <span className="launcher-tagline">{v.tagline}</span>
            </a>
          </li>
        ))}
      </ol>
      <footer>A fan-made recreation for fun. Not affiliated with Microsoft. Shut down (or Exit) inside any version to return here.</footer>
    </main>
  )
}
