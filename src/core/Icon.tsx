/** Renders an icon that is either an image URL/data URI or a short text/emoji glyph. */
export function Icon({ src, className = '', size }: { src?: string; className?: string; size?: number }) {
  const style = size ? { width: size, height: size, fontSize: size * 0.8 } : undefined
  if (!src) return <span className={`icon ${className}`} style={style} />
  const isImage = /^(data:|https?:|\/|\.\/|blob:)/.test(src) || /\.(svg|png|gif|ico|webp)$/.test(src)
  return isImage
    ? <img className={`icon ${className}`} src={src} style={style} alt="" draggable={false} />
    : <span className={`icon icon-glyph ${className}`} style={style}>{src}</span>
}

/** Build an SVG data URI from inline SVG markup (viewBox should be included by caller). */
export const svgIcon = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
