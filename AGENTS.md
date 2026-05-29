# Agent Instructions

## Renderer Lab Work

Before changing the renderer lab, local renderer workbench, or renderer workbench server, read:

- `Documentation/renderer-lab/GETTING_STARTED.md`
- `Documentation/renderer-lab/RENDERER_FILES.md`
- `Documentation/renderer-lab/BACKEND_RENDERER.md`

Renderer lab work usually touches one or more of:

- `src/app/labs/renderers/page.tsx`
- `scripts/renderer-lab-server.mjs`
- `scripts/renderer-lab-dev.mjs`
- `public/renderer-workbench/current/`
- `public/renderer-workbench/library/`
- `public/renderer-workbench/drafts/`

## Local Development

Use the full local workbench command when browser actions need to save files:

```bash
npm run dev:renderer-lab
```

Use plain Next dev only for read-only preview:

```bash
npm run dev
```

## Renderer Lab Safety

- Keep renderer workbench edits website-local unless the user explicitly asks for backend, iOS, or Android promotion.
- Do not run iOS simulators, Xcode builds, or Xcode tests.
- New styles should default locked unless the user explicitly wants them available for real randomized lesson rendering.
- New cells are draft web-renderer cells until backend prompt/catalog/schema validation and mobile production support are explicitly implemented.
- Do not expose non-local write access from `scripts/renderer-lab-server.mjs`.
- Use deterministic scaffolds for browser-save flows; do not add arbitrary persistent JavaScript editing from the browser without an explicit security review.

## Validation

For renderer lab changes, run:

```bash
node --check scripts/renderer-lab-server.mjs
node --check public/renderer-workbench/current/bundle/renderer.js
npm run build
git diff --check
```

If validating local browser behavior, open:

```text
http://localhost:3000/labs/renderers
```
