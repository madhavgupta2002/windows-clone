import { glyphMarkup } from './icons'

/** Inline Metro glyph in currentColor. Markup comes from the static table in icons.ts. */
export function Glyph({ name, className = '' }: { name: string; className?: string }) {
  return (
    <svg className={`w8-glyph ${className}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden
      dangerouslySetInnerHTML={{ __html: glyphMarkup(name) }} />
  )
}
