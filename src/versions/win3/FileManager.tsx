import { coreApps, type AppProps } from '../../core'
import { ICONS } from '../win16/icons'

const Explorer = coreApps.explorer.component

/** File Manager: the shared Explorer with a directory tree, details view and 3.1 icons. */
export function FileManager({ winId, args }: AppProps) {
  return (
    <Explorer
      winId={winId}
      args={{ path: 'C:', view: 'details', folderIcon: ICONS.folder, driveIcon: ICONS.drive, fileIcon: ICONS.file, computerLabel: 'Drives', ...args }}
    />
  )
}
