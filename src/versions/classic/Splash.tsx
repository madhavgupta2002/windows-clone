import { useEffect, useState } from 'react'
import { Icon } from '../../core'
import { icons } from './icons'
import type { SplashProps } from './types'

/** Calls onDone after `ms`, or immediately on click / key press. */
function useAutoDone(onDone: () => void, ms: number) {
  useEffect(() => {
    const t = setTimeout(onDone, ms)
    const skip = () => onDone()
    window.addEventListener('keydown', skip)
    return () => { clearTimeout(t); window.removeEventListener('keydown', skip) }
  }, [onDone, ms])
}

export function Logo({ edition, small }: { edition: string; small?: string }) {
  return (
    <div className="classic-logo">
      <Icon src={icons.flag} className="classic-logo-flag" />
      <div className="classic-logo-text">
        <span className="classic-logo-ms">Microsoft<sup>®</sup></span>
        <span className="classic-logo-win">Windows<span className="classic-logo-ed">{edition}</span></span>
        {small && <span className="classic-logo-small">{small}</span>}
      </div>
    </div>
  )
}

export interface CloudSplashProps extends SplashProps {
  edition: string
  /** Line under the logo (e.g. "Millennium Edition"). */
  small?: string
  ms?: number
  /** Sky gradient override. */
  sky?: string
}

/** 9x-style boot screen: sky with clouds, logo, animated bar at the bottom. */
export function CloudSplash({ onDone, edition, small, ms = 3200, sky }: CloudSplashProps) {
  useAutoDone(onDone, ms)
  return (
    <div className="classic-screen classic-cloud-splash" style={sky ? { background: sky } : undefined} onClick={onDone}>
      <div className="classic-clouds" />
      <Logo edition={edition} small={small} />
      <div className="classic-splash-bar" />
    </div>
  )
}

export interface NtSplashProps extends SplashProps {
  product: string
  edition: string
  ms?: number
}

/** NT-style boot screen: framed logo panel with a "Starting Up…" progress bar. */
export function NtSplash({ onDone, product, edition, ms = 3600 }: NtSplashProps) {
  useAutoDone(onDone, ms)
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const t = setInterval(() => setPct(Math.min(100, ((Date.now() - start) / (ms * 0.9)) * 100)), 80)
    return () => clearInterval(t)
  }, [ms])
  return (
    <div className="classic-screen classic-nt-splash" onClick={onDone}>
      <div className="classic-nt-panel">
        <div className="classic-nt-hero">
          <Logo edition={product} small={edition} />
          <span className="classic-nt-built">Built on NT Technology</span>
        </div>
        <div className="classic-nt-band" />
        <div className="classic-nt-progress-wrap">
          <span>Starting Up...</span>
          <div className="classic-nt-progress"><div style={{ width: `${pct}%` }} /></div>
        </div>
      </div>
    </div>
  )
}
