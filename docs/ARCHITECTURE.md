# Architecture

One React + Vite app. `src/App.tsx` is a hash router: `#/` shows the launcher, `#/<versionId>` lazily boots that version.

```
src/
  core/                 shared by every version (do not fork per version)
    os.tsx              <OSProvider>, useOS(), useFS(): window manager + virtual FS + app registry
    WindowLayer.tsx     renders open windows; drag + resize; uses the version's <Frame>
    fs.ts               localStorage-backed virtual file system (namespace per version)
    MenuBar.tsx         MenuBar / MenuList / ContextMenu
    DesktopIcons.tsx    desktop shortcut grid
    Icon.tsx            <Icon src>  (image URL / data URI / emoji) + svgIcon()
    hooks.ts            useClock, useClickOutside, usePref
    apps/               shared apps: notepad, calculator, explorer, minesweeper, paint, browser, msgbox, about
  versions/
    index.ts            registry (metadata + lazy loader)
    <id>/index.tsx      default export: the version's Shell component
```

## Writing a version

```tsx
export default function Shell() {
  const apps = useMemo(() => pickApps({ notepad: { icon: NOTEPAD }, explorer: { title: 'File Manager' } }, [MyExtraApp]), [])
  return (
    <OSProvider versionId="win95" about={...} apps={apps} fsSeed={SEED} documentsPath="C:/My Documents"
                workArea={{ top: 0, left: 0, right: 0, bottom: 28 }}>
      <div className="os-root os-win95">          {/* all version CSS is scoped under .os-<id> */}
        <DesktopIcons icons={...} />
        <WindowLayer Frame={Win95Frame} />
        <Taskbar />                                {/* version-specific, uses useOS() */}
      </div>
    </OSProvider>
  )
}
```

- `useOS()` gives `windows`, `activeId`, `open(appId, args)`, `close`, `focus`, `minimize`, `toggleMaximize`, `taskbarClick`, `alert`, `openPath`, `exit` (back to launcher), `fs`, `about`, `documentsPath`.
- `Frame` receives `FrameProps` (`win`, `active`, `dragHandle`, `onClose/onMinimize/onMaximize`, `children`). Spread `dragHandle` on the title bar. Frame root must fill its parent (`height: 100%`, flex column) and give children a `flex: 1; min-height: 0` body.
- Pass the `apps` array from a `useMemo`/module constant (not inline) so the registry is stable.
- `fsSeed` keys are paths (`"C:/WINDOWS/WIN.INI"`); value `string` = file, `null` = folder. Persisted under `winclone.fs.<id>`.
- Version-only apps are plain `AppDef`s (`{ id, title, icon, component, width, height }`).
- Every version must offer a way back to the launcher (`os.exit()`), e.g. Shut Down / Exit Windows.
- Icons/wallpapers: draw with CSS / inline SVG (`svgIcon`) or emoji. No copyrighted Microsoft bitmaps.

## Shared app styling contract

Apps render semantic markup and read CSS variables. A version sets these on `.os-<id>` and may override any class.

| Variable | Meaning |
|---|---|
| `--ui-font` | UI font shorthand, e.g. `11px Tahoma, sans-serif` |
| `--ui-fg` / `--ui-bg` | text / face colour of windows and controls |
| `--field-bg` / `--field-fg` | text fields, list views, editors |
| `--accent` / `--accent-fg` | selection highlight |
| `--border-light` / `--border-dark` / `--border-darker` | bevel colours (3D look) |
| `--radius` | control corner radius (0 for classic) |

Class names apps use (version CSS may restyle them):

- generic: `.app` (root, fills window), `.app-<id>`, `.btn`, `.field`, `.toolbar`, `.statusbar`, `.sunken` (inset panel), `.listview`, `.listview-item(.selected)`
- menus: `.menubar`, `.menubar-item(.open)`, `.menu-dropdown`, `.menu-item(.disabled,.checked)`, `.menu-separator`, `.context-menu`
- notepad: `.app-notepad textarea`
- calculator: `.calc-display`, `.calc-keys`, `.calc-key(.op,.eq,.fn)`
- explorer: `.explorer-toolbar`, `.explorer-address`, `.explorer-tree`, `.explorer-list`, `.explorer-item(.selected)`; `args.view` = `'icons' | 'details'`
- minesweeper: `.mine-header`, `.mine-counter`, `.mine-face`, `.mine-grid`, `.mine-cell(.open,.flag,.mine,.boom,.n1..n8)`
- paint: `.paint-tools`, `.paint-tool(.active)`, `.paint-canvas`, `.paint-palette`, `.paint-swatch`
- browser: `.browser-toolbar`, `.browser-address`, `.browser-page`
- msgbox: `.msgbox-icon(.info,.warning,.error,.question)`, `.msgbox-text`, `.msgbox-buttons`
- about: `.about-logo`, `.about-text`
