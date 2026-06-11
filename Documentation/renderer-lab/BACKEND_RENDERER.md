# Backend Renderer And CSS Setup

This document explains how the Django-served lesson renderer is organized and how it differs from the website-local renderer workbench.

## Backend Location

Backend renderer bundles live in:

```text
/Users/sehaj/Documents/Github/Django_Playground/RememqBackend/User_Interface/lesson_renderer_bundle/
```

Each renderer version is a directory:

```text
lesson_renderer_bundle/
├── active_version.txt
├── 2026.05.29.1/
└── 2026.05.29.2/
```

`active_version.txt` chooses the active backend renderer. `User_Interface/lesson_renderer.py` reads that file and exposes the active version as `RENDERER_VERSION`.

Do not mutate an already-active production bundle for normal renderer work. Create a new version directory, then activate the new version.

## Required Bundle Files

Each backend renderer version must include:

```text
index.html
renderer.js
renderer.css
capabilities.json
renderer_style_availability.json
katex.min.js
katex.min.css
fonts/
```

Current bundles also preserve split CSS sources:

```text
shared/
cells/
```

Those split files are useful for review, tests, parity with the website workbench, and future editing. The production runtime still needs the root `renderer.css` to be complete.

## How Django Serves The Renderer

`User_Interface/lesson_renderer.py` builds a deterministic ZIP response for the active renderer bundle.

The bundle endpoints include:

- Authenticated manifest and bundle endpoints for production app use.
- Public preview manifest, bundle, catalog, and sample lesson endpoints for the website renderer lab.

When building the ZIP, Django:

- Reads the active version from `active_version.txt`.
- Loads `capabilities.json`.
- Loads or derives `renderer_style_availability.json`.
- Injects style availability metadata into `index.html`.
- Normalizes `capabilities.json` and `renderer_style_availability.json` with the active version.
- Includes the version directory files in the ZIP.

Django does not resolve CSS `@import` statements during serving.

## Backend CSS Rule

Backend production `renderer.css` must be standalone.

That means:

- `renderer.css` should not contain live `@import` statements.
- It should already include shared CSS and all cell CSS needed by `index.html`.
- It may contain comments such as `/* begin import: shared/tokens.css */` and `/* end import: ... */`; those are flattened-source markers, not browser imports.

This matters because backend `index.html` loads only:

```html
<link rel="stylesheet" href="./katex.min.css" />
<link rel="stylesheet" href="./renderer.css" />
<script src="./katex.min.js"></script>
<script src="./renderer.js"></script>
```

If backend `renderer.css` still contains `@import`, mobile clients may not load the split files correctly from the ZIP renderer context.

Backend tests assert this:

- `renderer.css` is present in the ZIP.
- nested `shared/` and `cells/` CSS files are also present.
- root `renderer.css` does not contain `@import`.
- root `renderer.css` contains core shared rules such as `--page-max-width` and `.cell-card.sequence-pending`.

## Split CSS Layout

The split CSS tree mirrors the website workbench.

Shared renderer CSS:

```text
shared/
├── tokens.css
├── document.css
├── layout.css
├── card-shell.css
├── sequence.css
└── responsive.css
```

Typical cell CSS:

```text
cells/{cell-slug}/
├── index.css
├── card.css          # optional
├── base.css
├── animations.css
├── responsive.css    # optional
├── shared.css
└── styles/
    └── {style-id}.css
```

Special cases:

- Text render-mode CSS: `cells/text/modes/{mode}.css`
- Pair relationship variants: `cells/pair/styles/variants.css`
- Triplet relationship/layout variants: `cells/triplet/styles/variants.css`
- KeyValue relationship styles: `cells/key-value/styles/{style-id}.css`

`index.css` files are the local modular source-of-truth for import order. The flattened backend `renderer.css` should preserve that order.

## Website Workbench vs Backend Bundle

Website local workbench:

- `public/renderer-workbench/current/bundle/renderer.css` is generated from split CSS modules.
- The lab page can load additional split CSS via `workbench-manifest.json` `extra_stylesheet_paths`.
- The local server can update split CSS and manifest metadata.

Backend production bundle:

- Root `renderer.css` must be flattened and standalone.
- The import command normalizes root `renderer.css` from split CSS before activating the bundle.
- The ZIP may still include split CSS files, but production clients should not depend on browser-resolving those split files.

Before promoting or committing renderer CSS changes, run:

```bash
npm run renderer-bundle-css:write
npm run renderer-bundle-css:check
```

## Promoting Website Workbench To Backend

When a website workbench renderer is approved:

1. Create a new backend version, for example `YYYY.MM.DD.N`.
2. Copy approved bundle files from:

   ```text
   /Users/sehaj/Documents/Github/MemsurfWebsite/public/renderer-workbench/current/bundle/
   ```

   into:

   ```text
   /Users/sehaj/Documents/Github/Django_Playground/RememqBackend/User_Interface/lesson_renderer_bundle/YYYY.MM.DD.N/
   ```

3. Ensure backend `renderer.css` is flattened before activating the bundle.
4. Confirm:

   ```bash
   grep -n '@import ' User_Interface/lesson_renderer_bundle/YYYY.MM.DD.N/renderer.css
   ```

   returns no matches.

5. Confirm the new bundle has `renderer_style_availability.json`.
6. Update or import the version using the backend versioning path.

The backend import command is:

```bash
cd /Users/sehaj/Documents/Github/Django_Playground/RememqBackend
source .venv/bin/activate
python manage.py import_lesson_renderer_bundle \
  --source /path/to/prepared/bundle \
  --version YYYY.MM.DD.N \
  --activate
```

Use `--replace` only when intentionally replacing an unshipped local version.

## Backend Validation

Run backend validation after promotion:

```bash
cd /Users/sehaj/Documents/Github/Django_Playground/RememqBackend
source .venv/bin/activate
node --check User_Interface/lesson_renderer_bundle/YYYY.MM.DD.N/renderer.js
python manage.py test User_Interface.tests --keepdb
python manage.py check
```

If the change only affects renderer endpoints, at minimum run:

```bash
python manage.py test User_Interface.tests.LessonRendererEndpointTests --keepdb
python manage.py check
```

Do not run iOS simulators, Xcode builds, or Xcode tests as part of backend renderer validation.

## Backend New Cell Promotion

A local workbench draft cell is not production-ready just because it renders in `/labs/renderers`.

Backend promotion for a new cell also requires:

- Add the cell type to backend renderer capabilities.
- Add renderer JS support and flattened CSS support.
- Add sample catalog coverage in backend preview catalog.
- Add LLM prompt/catalog instructions in the backend gridcell catalog.
- Add validation/normalization support in the gridcell pipeline when needed.
- Add or update backend tests.

Relevant backend prompt/catalog files currently live under:

```text
Quick_Capture/Quick_Capture_Processing/Classification/Version_9/a1/Lessons_Planner/gridcell_v1/
Quick_Capture/Quick_Capture_Processing/Classification/Version_9/a1/PROMPTS/prompt_builder/workflows/lesson_3_step/gridcell_v1/
```

Keep draft cells out of real lesson generation until those backend pieces are complete.
