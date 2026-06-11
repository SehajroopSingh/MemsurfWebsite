# Renderer Lab File Structure

This document explains how the website-local renderer workbench is organized.

For Django production renderer bundle details, including how backend `renderer.css` must be flattened, read `Documentation/renderer-lab/BACKEND_RENDERER.md`.

## Main Areas

```text
MemsurfWebsite/
├── src/app/labs/renderers/page.tsx
├── scripts/renderer-lab-server.mjs
├── scripts/renderer-lab-dev.mjs
└── public/renderer-workbench/
    ├── current/
    ├── library/
    └── drafts/
```

## Runtime UI

`src/app/labs/renderers/page.tsx`

This is the hidden Next page at `/labs/renderers`.

It handles:

- Backend latest vs Local workbench source selection.
- iPhone and Android preview frames.
- Light and dark theme toggle.
- Catalog browsing.
- Real lesson preview mode.
- Production iOS parity preview mode.
- Payload JSON editor.
- CSS override editor.
- Local style creation UI.
- Local draft cell creation UI.
- Workbench bundle import, copy, draft, and reload controls.

The page is a static Next page. Browser-only mode can preview static files, but cannot write repo files.

## Local Write Server

`scripts/renderer-lab-server.mjs`

This is the local-only write bridge. It is required for any action that edits files in the repository.

Important endpoints:

- `GET /health`: confirms the local server is available.
- `GET /bundles`: lists current, library, and draft bundles.
- `POST /import-backend-latest`: downloads backend latest into the local library.
- `POST /copy-to-current`: copies a selected bundle into `current`.
- `POST /save-draft`: snapshots `current` into `drafts`.
- `POST /refresh-current`: refreshes catalog, capabilities, and manifest metadata.
- `POST /toggle-lock`: locks or unlocks a style in style availability metadata.
- `POST /styles`: creates or updates a style scaffold.
- `GET /cells`: lists local draft cell definitions.
- `POST /cells`: creates or updates a local draft cell scaffold.
- `GET /django-proxy/*`: proxies backend preview endpoints for localhost CORS convenience.

Write endpoints are restricted to local requests and local origins.

`scripts/renderer-lab-dev.mjs`

Starts both the local write server and `next dev` with one command:

```bash
npm run dev:renderer-lab
```

## Current Workbench

`public/renderer-workbench/current/`

This is the editable local renderer workspace.

```text
current/
├── bundle/
├── catalog.json
├── cell-definitions/
└── workbench-manifest.json
```

Commit approved changes here when a developer edits the website-local renderer workbench.

## Bundle Files

`public/renderer-workbench/current/bundle/`

The bundle mirrors the Django renderer bundle shape.

Important files:

- `renderer.js`: renderer runtime used inside the preview iframe.
- `renderer.css`: generated flattened root renderer stylesheet for backend/iOS parity.
- `capabilities.json`: renderer metadata and supported cell types.
- `renderer_style_availability.json`: style groups, style ids, lock state, and real lesson availability.
- `index.html`: standalone renderer entrypoint metadata.
- `katex.min.js`, `katex.min.css`, `fonts/`: math rendering assets.
- `cells/`: per-cell CSS modules.
- `shared/`: shared CSS modules.

The lab loads `renderer.js`, `renderer.css`, KaTeX assets, and extra cell CSS from these files. The current local page does not duplicate renderer logic. Treat split CSS files as the editable source of truth and regenerate `renderer.css` with `npm run renderer-bundle-css:write`.

## Cell CSS Layout

Most cells follow this pattern:

```text
bundle/cells/{cell-slug}/
├── index.css
├── base.css
├── animations.css
├── shared.css
└── styles/
    └── {style-id}.css
```

`index.css` imports the cell CSS files. The workbench manifest includes each cell `index.css` in `extra_stylesheet_paths`, so new style files must be imported by the cell `index.css`.

Relationship cells use shared variant files:

- Pair relationship styles: `bundle/cells/pair/styles/variants.css`
- Triplet relationship and layout styles: `bundle/cells/triplet/styles/variants.css`
- Text render-mode styles: `bundle/cells/text/modes/{mode}.css`
- KeyValue relationship styles: `bundle/cells/key-value/styles/{style-id}.css`

## Catalog

`public/renderer-workbench/current/catalog.json`

The catalog drives the left-hand preview list in `/labs/renderers`.

Catalog entries contain:

- `id`
- `group`
- `label`
- `cell_type`
- `render_mode`
- `layout_id`
- `layout_kind`
- `style_group_id`
- `style_id`
- `style_key`
- `payload`

Preview entries should use:

```json
{
  "stylePolicy": "preview",
  "style_policy": "preview"
}
```

Real lesson payloads should use:

```json
{
  "stylePolicy": "randomized-stable-unlocked",
  "style_policy": "randomized-stable-unlocked"
}
```

Legacy `first-only` is accepted as an alias by current renderers, but new payloads should not emit it.

## Style Availability

`public/renderer-workbench/current/bundle/renderer_style_availability.json`

This file is the editable source for style lock state.

Each group represents one selectable style group:

- Normal cell style group: `layout_kind: "cell_style"`
- Text mode style group: `layout_kind: "text_render_mode"`
- Pair/KeyValue/Triplet relationship style group: `layout_kind: "relationship_mode"`
- Triplet layout style group: `layout_kind: "triplet_layout"`

Important fields:

- `group_id`
- `cell_type`
- `layout_id`
- `layout_kind`
- `style_key`
- `default_style_id`
- `styles[].style_id`
- `styles[].is_locked`
- `styles[].real_lesson_enabled`

At least one style in each group must remain unlocked so real lesson randomized selection always has a valid option.

## Draft Cell Definitions

`public/renderer-workbench/current/cell-definitions/`

Draft cell definitions are local workbench metadata for new cell experiments.

Saved definitions use `cell_definition_v1` and include:

- `cell_type`
- `cell_slug`
- `display_name`
- `status`
- `when_to_use`
- `when_not_to_use`
- `llm_instruction`
- `content_schema`
- `props_schema`
- `required_fields`
- `optional_fields`
- `content_budget`
- `shape_example`
- `example_payloads`
- `render_modes`
- `style_groups`
- `mobile_support`
- `security`

Draft cells are web-renderer-only until explicitly promoted into backend prompt/catalog/schema support and mobile production support.

## Workbench Manifest

`public/renderer-workbench/current/workbench-manifest.json`

The manifest tells the lab how to load the current local workbench.

Important fields:

- `bundle_base_path`
- `catalog_path`
- `cell_definitions_path`
- `style_availability_path`
- `extra_stylesheet_paths`
- `editable_files`
- `catalog_entry_count`
- `cell_definition_count`
- `capabilities`

Run `POST /refresh-current` through the lab server, or use the lab Reload flow after local write actions, to keep metadata consistent.

## Library And Drafts

`public/renderer-workbench/library/`

Imported backend bundles live here. Importing backend latest does not immediately replace current. A developer must choose a library bundle and click `Use Bundle`.

`public/renderer-workbench/drafts/`

Saved snapshots of current live here. These are useful checkpoints while editing.

## Safety Rules

- Do not treat draft cells as production-supported cells.
- Do not emit new draft cells from backend LLM prompts until backend validation and catalog support are added.
- Keep new styles locked until they are visually complete.
- Do not add raw HTML rendering unless the security fields and renderer escaping policy are deliberately reviewed.
- Avoid external remote assets in renderer samples unless explicitly needed.
- Do not edit backend, iOS, or Android production renderer files from the website workbench task unless the task explicitly asks for promotion.
