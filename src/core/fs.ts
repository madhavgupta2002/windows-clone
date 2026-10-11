import { useSyncExternalStore } from 'react'
import type { FsSeed } from './types'

/**
 * Tiny virtual file system persisted to localStorage, one namespace per version.
 * Paths are absolute, '/'-separated, without trailing slash: "C:/My Documents/readme.txt".
 */
export interface FsEntry {
  type: 'file' | 'dir'
  content: string
  modified: number
}

export interface FsNode {
  name: string
  path: string
  type: 'file' | 'dir'
  modified: number
  size: number
}

export const parentOf = (path: string) => path.slice(0, Math.max(path.lastIndexOf('/'), 0)) || path
export const baseName = (path: string) => path.slice(path.lastIndexOf('/') + 1)
export const joinPath = (dir: string, name: string) => `${dir.replace(/\/$/, '')}/${name}`
export const extOf = (path: string) => {
  const name = baseName(path)
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
}

export class FileSystem {
  private entries: Record<string, FsEntry>
  private listeners = new Set<() => void>()
  private version = 0

  constructor(private key: string, seed: FsSeed) {
    this.entries = this.loadOrSeed(seed)
  }

  private loadOrSeed(seed: FsSeed): Record<string, FsEntry> {
    try {
      const saved = localStorage.getItem(this.key)
      if (saved) return JSON.parse(saved)
    } catch { /* corrupt storage — reseed */ }
    const now = Date.now()
    const entries: Record<string, FsEntry> = {}
    for (const [path, content] of Object.entries(seed)) {
      // Make sure every ancestor directory exists.
      let p = parentOf(path)
      while (p.includes('/') && !entries[p]) {
        entries[p] = { type: 'dir', content: '', modified: now }
        p = parentOf(p)
      }
      if (!p.includes('/') && !entries[p]) entries[p] = { type: 'dir', content: '', modified: now }
      entries[path] = content === null ? { type: 'dir', content: '', modified: now } : { type: 'file', content, modified: now }
    }
    return entries
  }

  private commit() {
    this.version++
    try { localStorage.setItem(this.key, JSON.stringify(this.entries)) } catch { /* quota */ }
    this.listeners.forEach(l => l())
  }

  subscribe = (l: () => void) => {
    this.listeners.add(l)
    return () => this.listeners.delete(l)
  }

  getVersion = () => this.version

  exists(path: string) { return path in this.entries }
  isDir(path: string) { return this.entries[path]?.type === 'dir' }

  /** Top-level drives / roots, e.g. ["C:"]. */
  roots(): string[] {
    return Object.keys(this.entries).filter(p => !p.includes('/')).sort()
  }

  list(dir: string): FsNode[] {
    const prefix = dir + '/'
    return Object.entries(this.entries)
      .filter(([p]) => p.startsWith(prefix) && !p.slice(prefix.length).includes('/'))
      .map(([path, e]) => ({ name: baseName(path), path, type: e.type, modified: e.modified, size: e.content.length }))
      .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1))
  }

  read(path: string): string | null {
    const e = this.entries[path]
    return e?.type === 'file' ? e.content : null
  }

  write(path: string, content: string) {
    if (!this.isDir(parentOf(path))) this.mkdir(parentOf(path))
    this.entries[path] = { type: 'file', content, modified: Date.now() }
    this.commit()
  }

  mkdir(path: string) {
    let p = path
    const now = Date.now()
    while (p && !this.entries[p]) {
      this.entries[p] = { type: 'dir', content: '', modified: now }
      if (!p.includes('/')) break
      p = parentOf(p)
    }
    this.commit()
  }

  remove(path: string) {
    for (const p of Object.keys(this.entries)) {
      if (p === path || p.startsWith(path + '/')) delete this.entries[p]
    }
    this.commit()
  }

  rename(from: string, to: string) {
    if (this.exists(to)) throw new Error(`${baseName(to)} already exists`)
    for (const p of Object.keys(this.entries)) {
      if (p === from || p.startsWith(from + '/')) {
        this.entries[to + p.slice(from.length)] = this.entries[p]
        delete this.entries[p]
      }
    }
    this.commit()
  }

  /** "New Text Document.txt", "New Text Document (2).txt", ... */
  uniqueName(dir: string, name: string) {
    const dot = name.lastIndexOf('.')
    const stem = dot > 0 ? name.slice(0, dot) : name
    const ext = dot > 0 ? name.slice(dot) : ''
    let candidate = name
    for (let i = 2; this.exists(joinPath(dir, candidate)); i++) candidate = `${stem} (${i})${ext}`
    return candidate
  }

  reset(seed: FsSeed) {
    this.entries = {}
    localStorage.removeItem(this.key)
    this.entries = this.loadOrSeed(seed)
    this.commit()
  }
}

/** Re-render when the file system changes. */
export function useFsVersion(fs: FileSystem) {
  return useSyncExternalStore(fs.subscribe, fs.getVersion)
}
