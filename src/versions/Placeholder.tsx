/** Temporary shell for versions not built yet. */
export function Placeholder({ name }: { name: string }) {
  return (
    <div className="os-root" style={{ display: 'grid', placeItems: 'center', background: '#000', color: '#ccc', font: '16px monospace' }}>
      <div style={{ textAlign: 'center' }}>
        <p>{name} is being built…</p>
        <a href="#" style={{ color: '#8cf' }}>Back to launcher</a>
      </div>
    </div>
  )
}
