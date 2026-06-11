# Renderer Lab Getting Started

The renderer lab is a hidden local tooling page for previewing and editing the mobile lesson renderer inside phone-sized frames.

## What You Need

- Node.js and npm installed.
- Website dependencies installed with `npm install`.
- The Django backend is optional for local workbench editing. It is only needed when importing the latest backend renderer or previewing backend latest directly.

## Start The Full Local Workbench

Use this when you want to preview the renderer and save local workbench changes into the repository.

```bash
cd /Users/sehaj/Documents/Github/MemsurfWebsite
npm run dev:renderer-lab
```

This starts two processes:

- Next dev server: `http://localhost:3000`
- Local renderer lab write server: `http://127.0.0.1:8765`

Open:

```text
http://localhost:3000/labs/renderers
```

The Workbench panel should show `Writable`. If it shows read-only, the local write server is not running.

## Preview Only

Use this when you only need to view the page and do not need browser actions to write files.

```bash
cd /Users/sehaj/Documents/Github/MemsurfWebsite
npm run dev
```

In this mode, the page can still load static workbench files from `public/renderer-workbench/current`, but it cannot save styles, create cells, import backend bundles, copy bundles, or save drafts.

## Common Workflows

### Edit Existing Renderer Files

1. Start `npm run dev:renderer-lab`.
2. Open `/labs/renderers`.
3. Select `Local workbench`.
4. Edit files in your code editor under:
   - `public/renderer-workbench/current/bundle/renderer.js`
   - `public/renderer-workbench/current/bundle/renderer.css`
   - `public/renderer-workbench/current/bundle/cells/`
   - `public/renderer-workbench/current/catalog.json`
5. Click `Reload` in the lab.
6. Verify iPhone, Android, light mode, and dark mode.
7. Commit the changed website files normally.

### Import Backend Latest

1. Start `npm run dev:renderer-lab`.
2. Open `/labs/renderers`.
3. Select `Local workbench`.
4. Click `Import Backend`.
5. Select the imported backend bundle from the workbench dropdown.
6. Click `Use Bundle` to copy it into `current`.

This does not modify the backend. It only copies a backend renderer bundle into the website-local workbench.

### Add A Style

1. Start `npm run dev:renderer-lab`.
2. Open `/labs/renderers`.
3. Select `Local workbench`.
4. Pick the catalog group you want to extend.
5. Click `Add style`.
6. Enter a style name. The slug is generated but can be edited.
7. Keep new styles locked until they are visually complete.
8. Save the style.
9. Click `Reload` if needed and verify the new catalog preview.

Saving a style writes to the current workbench files. It does not change backend, iOS, or Android production renderer assets.

### Add A Draft Cell

1. Start `npm run dev:renderer-lab`.
2. Open `/labs/renderers`.
3. Select `Local workbench`.
4. Click `Add cell`.
5. Fill in:
   - Display name
   - Cell type, for example `ConceptMapCell`
   - When to use
   - When not to use
   - LLM instruction
   - Sample payload JSON
   - Content schema JSON
   - Props schema JSON
6. Save the cell.
7. Verify the generated catalog sample in iPhone and Android frames.

New cells are local workbench drafts only. Backend prompt generation, backend validation, iOS production support, and Android production support require a later promotion task.

## Validation Commands

Run these before committing renderer-lab changes:

```bash
cd /Users/sehaj/Documents/Github/MemsurfWebsite
node --check scripts/renderer-lab-server.mjs
node --check scripts/renderer-bundle-css.mjs
node --check scripts/renderer-parity-check.mjs
node --check public/renderer-workbench/current/bundle/renderer.js
npm run renderer-bundle-css:check
npm run renderer-parity:check
npm run build
git diff --check
```

`npm run lint` may prompt to configure Next ESLint if this repo has not been configured for it. Prefer `npm run build` for the current renderer-lab validation path.

## Production Boundary

The website workbench is not the production renderer source of truth. Production backend promotion is separate:

1. Copy approved `public/renderer-workbench/current/bundle/*` into a new Django renderer bundle version.
2. Update backend renderer version metadata.
3. Add backend prompt/catalog/schema support if new cell types were introduced.
4. Run backend renderer tests and Django checks.
5. Update iOS and Android only when the production app needs support outside the dynamic web renderer path.

Use Render Lab `Production iOS` mode before promotion when checking production parity. It forces backend latest, `randomized-stable-unlocked` sample payloads, flattened root CSS only, and no lab CSS overrides.
