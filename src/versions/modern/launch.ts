import { useCallback, useMemo } from 'react'
import { baseName, extOf, useFS, useOS, type FileSystem, type OS, type WinState } from '../../core'
import { useModern } from './context'
import { APP_ICONS } from './icons'
import { SETTINGS_CATEGORIES, categoryDesc, categoryName } from './settingsData'

/** Where the modern shells keep the user's files. */
export const USER_HOME = 'C:/Users/User'
export const DESKTOP_DIR = `${USER_HOME}/Desktop`
export const DOCUMENTS_DIR = `${USER_HOME}/Documents`
export const PICTURES_DIR = `${USER_HOME}/Pictures`
export const RECYCLE_BIN = 'C:/$Recycle.Bin'

/** Something Start / Search can launch. */
export interface Launchable {
  key: string
  label: string
  icon: string
  kind: 'App' | 'Settings' | 'Document' | 'Folder'
  subtitle?: string
  open: () => void
}

const HIDDEN_APPS = new Set(['msgbox', 'about'])

/** Icon for a file-system node. */
export function iconForPath(fs: FileSystem, path: string): string {
  if (fs.isDir(path)) return path === RECYCLE_BIN ? APP_ICONS.bin : APP_ICONS.folder
  const ext = extOf(path)
  if (ext === 'bmp' || ext === 'png' || ext === 'jpg') return APP_ICONS.photo
  return APP_ICONS.doc
}

/** Opens Settings (single window) and navigates it to `page`. */
export function useOpenSettings() {
  const os = useOS()
  const m = useModern()
  return useCallback((page = 'home') => {
    os.open('settings', { page })
    m.navigateSettings(page)
  }, [os, m])
}

/** All files under the user's folders, most recently modified first. */
export function recentDocuments(fs: FileSystem, limit = 6) {
  const out: { path: string; modified: number }[] = []
  const walk = (dir: string, depth: number) => {
    for (const n of fs.list(dir)) {
      if (n.type === 'dir') { if (depth < 3) walk(n.path, depth + 1) }
      else out.push({ path: n.path, modified: n.modified })
    }
  }
  walk(USER_HOME, 0)
  return out.sort((a, b) => b.modified - a.modified).slice(0, limit)
}

/** Apps, settings pages and documents the shell can launch, plus a search function. */
export function useLaunchables() {
  const os = useOS()
  const fs = useFS()
  const { variant } = useModern()
  const openSettings = useOpenSettings()

  const apps = useMemo<Launchable[]>(() => {
    const list: Launchable[] = Object.values(os.apps)
      .filter(a => !HIDDEN_APPS.has(a.id))
      .map(a => ({ key: `app:${a.id}`, label: a.title, icon: a.icon ?? APP_ICONS.doc, kind: 'App', open: () => os.open(a.id) }))
    list.push(
      { key: 'app:pc', label: 'This PC', icon: APP_ICONS.pc, kind: 'App', open: () => os.open('explorer', { path: '' }) },
      { key: 'app:bin', label: 'Recycle Bin', icon: APP_ICONS.bin, kind: 'App', open: () => os.open('explorer', { path: RECYCLE_BIN }) },
    )
    return list.sort((a, b) => a.label.localeCompare(b.label))
  }, [os])

  const settings = useMemo<Launchable[]>(() => SETTINGS_CATEGORIES.flatMap(c => [
    { key: `set:${c.id}`, label: categoryName(c, variant), icon: APP_ICONS.settings, kind: 'Settings' as const, subtitle: categoryDesc(c, variant), open: () => openSettings(c.id) },
    ...c.pages.map(p => ({
      key: `set:${c.id}/${p.id}`, label: p.name, icon: APP_ICONS.settings, kind: 'Settings' as const,
      subtitle: `${categoryName(c, variant)} settings`, open: () => openSettings(`${c.id}/${p.id}`),
    })),
  ]), [openSettings, variant])

  const search = useCallback((query: string): Launchable[] => {
    const q = query.trim().toLowerCase()
    if (!q) return apps
    const docs: Launchable[] = recentDocuments(fs, 50).map(d => ({
      key: `doc:${d.path}`, label: baseName(d.path), icon: iconForPath(fs, d.path), kind: 'Document',
      subtitle: d.path.replace(/\//g, '\\'), open: () => os.openPath(d.path),
    }))
    const score = (l: Launchable) => {
      const name = l.label.toLowerCase()
      return name.startsWith(q) ? 0 : name.split(/\s+/).some(w => w.startsWith(q)) ? 1 : 2
    }
    return [...apps, ...settings, ...docs]
      .filter(l => l.label.toLowerCase().includes(q) || l.key.includes(q))
      .sort((a, b) => score(a) - score(b))
  }, [apps, settings, fs, os])

  return { apps, settings, search }
}

/** A taskbar button: a pinned app and/or a group of running windows of one app. */
export interface TaskItem {
  appId: string
  title: string
  icon?: string
  pinned: boolean
  windows: WinState[]
  active: boolean
}

export function useTaskItems(pinned: readonly string[]): TaskItem[] {
  const os = useOS()
  return useMemo(() => {
    const items: TaskItem[] = pinned.filter(id => os.apps[id]).map(id => ({
      appId: id, title: os.apps[id].title, icon: os.apps[id].icon, pinned: true, windows: [], active: false,
    }))
    for (const w of os.windows) {
      let item = items.find(i => i.appId === w.appId)
      if (!item) {
        item = { appId: w.appId, title: w.title, icon: w.icon, pinned: false, windows: [], active: false }
        items.push(item)
      }
      item.windows.push(w)
      if (w.id === os.activeId) item.active = true
    }
    return items
  }, [pinned, os.apps, os.windows, os.activeId])
}

/** Taskbar click: launch, minimize/restore, or cycle through the app's windows. */
export function clickTaskItem(os: OS, item: TaskItem) {
  const ws = item.windows
  if (ws.length === 0) { os.open(item.appId); return }
  if (ws.length === 1) { os.taskbarClick(ws[0].id); return }
  const byZ = [...ws].sort((a, b) => a.z - b.z)
  if (!item.active) { os.focus(byZ[byZ.length - 1].id); return }
  os.focus(byZ[0].id) // bring the bottom-most one to the front: cycles through the group
}
