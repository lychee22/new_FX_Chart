# AGENTS.md

Workspace guidance for future ZCode agents working in `D:\projects\chart`.

## What this is

A static, dependency-light **financial charting web app** ("Prosticks") that renders forex/metals
price charts (USD/JPY, Gold, etc.) on HTML5 `<canvas>`. There is **no build system, no bundler, no
package manager, no test runner, and no linter** — it is plain HTML + JS + CSS served as static files.
Open `charttest5.html` directly in a browser to run it (it `onload`s `initChart('cvsChart','prosticks.hk',800,600,0)` then `updateChart()`).

The only third-party libraries are vendored under `js/`:
- `jquery-2.1.4.min.js` — required; the chart code calls `$.ajax`, `$.parseJSON`.
- `dateformat.js` — Steven Levithan's dateFormat 1.2.3 (MIT). Do not edit; it's vendored.
- `lang.js` — UI string tables (`en`, `tc`, `sc` traditional/simplified Chinese; `ja`/`kr` partial).

## Layout

- `charttest5.html` — the demo/test host page. Holds the toolbar `<select>`s (code, interval, type, upper/lower tech, tool), the two stacked canvases, and wires `onchange`/`onclick` to the public chart functions.
- `js/simplechart.js` — **the whole chart engine**, one ~7,900-line monolithic file. All chart state is module-level `var`s (globals); there is no encapsulation or module system.
- `js/lang.js`, `js/dateformat.js` — vendored support libs above.
- `css/main.css` — page styling; classes like `.select`, `.subhead3` are referenced by attribute from the HTML.
- `images/*.gif` — toolbar icons (zoom, arrows, export).

## Architecture & layer rules

**Rendering uses two stacked canvases** declared in `charttest5.html`:
- `cvsChart` (z-index 0) — base chart, drawn by the `draw*` family.
- `cvsChartOver` (z-index 1, transparent) — interactive overlay (crosshair, value box, user-drawn lines/Fibonacci/text), drawn into `ctxOver` and cleared each move.

Edit the correct canvas: static chart elements vs. interactive overlays must not be mixed up.

**Function naming conventions inside `simplechart.js`:**
- Public API called from HTML: `initChart(...)`, `updateChart()`, `zoomChart(mode)`, `shiftChart(mode)`, `exportChart()`, `changeParameter()`, `saveParameter()`.
- Drawing: `drawChart`, `drawMain`, `drawBar`, `drawAxis`, `drawYScale`, `drawValueBox`, `drawLines`, `drawFibRet/Prj`, `drawTextBox`, `drawTechPane*`, `drawSupportResist`, `drawValueCursor`.
- Indicator math: `get*` — `getSMA`, `getEMA`, `getWMA`, `getBollinger`, `getParabolic`, `getIKH`, `getRSI`, `getMACD`, `getStochastics`, `getMomentum`, `getADX`, `getCCI`, `getATR`, `getOBV`, `getMoneyFlow`, etc.
- Scale math: `compXScale`, `compYScale`, `compTechScale`, `convertXcoordinate`, `convertYcoordinate`.
- Pointer: `mouseMoveHandler`, `mouseDownHandler`, `mouseUpHandler`, `getMousePos`.

**Chart type / interval / tech IDs are numeric constants** defined at the top of `simplechart.js` (e.g. `DEF_CANDLE_CHART=4`, `DEF_5MIN=4`, `DEF_RSI=2`, `DEF_MACD=3`). The `<option value=...>` numbers in `charttest5.html` must match these constants — when changing available options or types, keep both sides in sync. Note the chart-type constants carry inline comments showing the legacy external numeric mapping (e.g. candle is `4 //2`).

**i18n** uses an `eval`-based `Language(lang)` constructor and string tables in `lang.js`. `_lang.getStr(key, fallback)` falls back to English. Keep new UI strings in `en` first, then translate into `tc`/`sc`.

## Critical gotcha — data loading

In `simplechart.js` **`loadData()` has its live AJAX data fetch commented out** (the `$.ajax` calls to `…/chartasp/DataJSON.asp?code=…&exch=…&interval=…&chartType=…` and the support/resistance endpoint are inside `/* Disabled … */` blocks). The function instead assigns `barData` from a **hardcoded inline JSON string** of historical USD/JPY bars. The sample bar fields are: `dt` (YYYYMMDDHHMM), `o,h,l,c,v,vap,vam,mp,mc,ut,lt`.

Consequences for editing:
- Changing the instrument/interval in the UI today does **not** change the displayed data — it only re-renders the same embedded series.
- To restore live data, un-comment the AJAX blocks and ensure a backend is reachable at `prot + "//" + domain + "/chartasp/…"`. `domain` defaults to `window.location.hostname`; `charttest5.html` passes `'prosticks.hk'`.
- `exch == DEF_EXCH_CU` triggers a `getLocalTime()` timezone conversion of `dt`; other exchanges use the raw timestamp string.

## Conventions to follow

- Match the existing style: global `var`s, `function name(){}` declarations, tab indentation in `simplechart.js`, jQuery where async/DOM helpers are needed.
- Do **not** introduce a build step, bundler, npm packages, ES modules, or TypeScript unless explicitly asked — the project is intentionally a drop-in static site.
- `charttest5.html` uses unquoted HTML attributes and uppercase tag casing in places (`<SCRIPT>`, `<BODY …>`); preserve the surrounding style when editing it rather than reformatting wholesale.
- Keep the two-canvas IDs (`cvsChart`, `cvsChartOver`) and the hidden form inputs (`barno`, `exch`) intact — the JS reads them directly.

## Running / verifying changes

No test suite. To verify a change, open `charttest5.html` in a browser (or a local static server) and confirm the chart renders, the toolbar selectors update it, zoom/shift/export buttons work, and the overlay crosshair tracks the mouse. Watch the browser console — the code logs `"<n> bars loaded..."` and init diagnostics.
