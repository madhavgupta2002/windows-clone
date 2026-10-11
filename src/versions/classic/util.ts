import { extOf, type FsNode } from '../../core'
import { icons } from './icons'

/** Icon for a file system entry. */
export function fileIcon(node: Pick<FsNode, 'type' | 'path'>): string {
  if (node.type === 'dir') return icons.folder
  switch (extOf(node.path)) {
    case 'bmp': return icons.bitmap
    case 'exe': case 'com': return icons.programs
    case 'bat': return icons.msdos
    case 'htm': case 'html': case 'url': return icons.ie
    default: return icons.textFile
  }
}

/** "C:/My Documents" → "C:\My Documents" */
export const dosPath = (path: string) => (path.includes('/') ? path.replace(/\//g, '\\') : `${path}\\`)
