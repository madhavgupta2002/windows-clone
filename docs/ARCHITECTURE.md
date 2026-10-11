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
- `AppDef.defaultArgs` are merged under the caller's args on every open — use it for per-version Explorer icons/labels instead of wrapping the component.
- `usePref(key, initial)` is shared: every component using the same key sees the same value.
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

All default app styles in `core/apps/apps.css` are wrapped in `:where()` (zero specificity), so any version rule wins, even a bare `.btn {}`. Each variable has a classic fallback (`--ui-bg` → `#c0c0c0`, `--accent` → `#000080`, …).

Optional extra variables: `--editor-font` (Notepad), `--calc-op-fg` / `--calc-fn-fg` (Calculator key text), `--mine-cell` (Minesweeper cell size, default `16px`), `--mine-bg`, `--paint-workspace` (grey area around the Paint canvas).

Additional class names (additive to the list above):

- shared file panels (Notepad/Paint): `form.save-bar` (inline "Save as" bar, also `.toolbar`), `.file-panel`, `.file-panel-title`, `.file-panel-list` (also `.listview.sunken`), `.file-panel-actions`
- notepad: `textarea.notepad-editor(.nowrap)` (also `.field`)
- calculator: `.calc-body`, `.calc-memory` (the "M" indicator), `.calc-value`, `.calc-key.mem`, `.calc-key-tall` (=), `.calc-key-wide` (0)
- explorer: `.explorer-body`, `.explorer-list.icons|.details` (also `.listview.sunken`), `.explorer-header` (details column header), `.explorer-icon`, `.explorer-name`, `.explorer-size`, `.explorer-type`, `.explorer-modified`, `.explorer-rename` (inline rename input); tree: `.tree-node`, `.tree-row(.selected)`, `.tree-toggle`, `.tree-label`, `.tree-children`
- minesweeper: `.mine-game` (sized to content; the window resizes itself to fit it), `.mine-cell.wrong` (wrongly flagged cell after a loss)
- paint: `.paint-main`, `.paint-tool[data-tool=pencil|brush|eraser|fill|picker|line|rect|ellipse]`, `.paint-sizes`, `.paint-size(.active)`, `.paint-surface`, `.paint-overlay`, `.paint-current` > `.paint-primary` / `.paint-secondary`, `.paint-swatches`
- browser: `.browser-doc` (built-in page), `.browser-web` > `.browser-notice` + `iframe.browser-frame`, `.browser-link`; built-in pages use `.web-*` classes and deliberately look like the web, not the OS
- msgbox / about: `.msgbox-body`, `.about-body`, `.about-product`, `.about-version`, `.about-copyright`, `.about-extra`. About reuses `.msgbox-buttons`. `.about-logo` shows a neutral placeholder; versions should restyle it.

### Shared app args

| App | args |
|---|---|
| notepad | `path?` |
| explorer | `path?` (default `documentsPath`; `""` = drive list), `tree?: boolean` (default true), `view?: 'icons'\|'details'`, `folderIcon?`, `fileIcon?`, `driveIcon?`, `computerIcon?`, `computerLabel?` (default "My Computer"), `title?` (fixed title; otherwise it follows the folder) |
| paint | `path?` (`.bmp` whose content is an image data URL; Save writes a PNG data URL) |
| browser | `url?`, `home?` (default `about:home`), `homeTitle?` (default `os.about.product`). Built-in pages: `about:home`, `about:search?q=`, `about:retro`, `about:news`, `about:guestbook`, `about:webring`, `about:blank` |
| msgbox | `title`, `text`, `icon?: info\|warning\|error\|question`, `buttons?: string[]` (default `['OK']`), `onButton?: (label) => void` |
| about | `logo?` (icon src rendered inside `.about-logo`) |

Notepad, Paint, Explorer and Browser keep the window title in sync (for example `*readme.txt - Notepad`), using the version's registered app title.
