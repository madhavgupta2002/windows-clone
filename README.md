# Windows Clone

Browser recreations of every desktop Windows release, from 1.0 (1985) to 11 (2021), in a single React + Vite app.

| | | | |
|---|---|---|---|
| Windows 1.0 | Windows 2.0 | Windows 3.1 | Windows 95 |
| Windows 98 | Windows ME | Windows 2000 | Windows XP |
| Windows Vista | Windows 7 | Windows 8 / 8.1 | Windows 10 |
| Windows 11 | | | |

## Run

```bash
npm install
npm run dev        # http://localhost:5173 — pick a version from the launcher
npm run build      # typecheck + production build to dist/
```

Open a version directly with its hash route, for example `#/xp` or `#/win95`. To return to the launcher, use Shut Down or Exit inside the version.

## How it's built

All versions share one core in `src/core`:

- window manager: drag, resize, minimise, maximise and z-order
- a file system kept in localStorage, separate for each version
- menus and desktop icons
- shared apps: Notepad, Calculator, Explorer, Minesweeper, Paint, Browser, message box and About

Each version in `src/versions/<id>` adds only its own shell (window frame, taskbar or Program Manager, Start menu) plus a theme stylesheet that restyles the shared apps. Versions with a common design share one shell: 95, 98, ME and 2000 use `classic/`, and 10 and 11 use `modern/`. For details, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

`legacy/` holds the original single-file Windows 7 and 11 recreations this project grew from.

Fan-made for fun; not affiliated with Microsoft. All visuals are drawn with CSS and SVG.
