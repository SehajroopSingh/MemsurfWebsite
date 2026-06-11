#!/usr/bin/env node

import crypto from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import { assertFlattenedRendererCss, writeFlattenedRendererCss } from "./renderer-bundle-css.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const workbenchRoot = path.join(repoRoot, "public", "renderer-workbench");
const currentDir = path.join(workbenchRoot, "current");
const libraryDir = path.join(workbenchRoot, "library");
const draftsDir = path.join(workbenchRoot, "drafts");
const cellDefinitionsDir = path.join(currentDir, "cell-definitions");
const port = Number(process.env.RENDERER_LAB_PORT || 8765);
const host = process.env.RENDERER_LAB_HOST || "127.0.0.1";
const apiBase = (process.env.RENDERER_LAB_BACKEND_API_URL || "https://api.memsurf.com/api").replace(/\/$/, "");

const requiredBundleFiles = [
  "index.html",
  "renderer.js",
  "renderer.css",
  "capabilities.json",
  "renderer_style_availability.json",
  "katex.min.js",
  "katex.min.css",
];

const styleIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const cellTypePattern = /^[A-Z][A-Za-z0-9]*Cell$/;

const cellFolderByType = {
  HeadingCell: "heading",
  ImageCell: "image",
  KeyPointsCell: "key-points",
  CompareCell: "compare",
  TextCell: "text",
  RecallPromptCell: "recall-prompt",
  TimelineStepCell: "timeline-step",
  KeyValueCell: "key-value",
  PairCell: "pair",
  TripletCell: "triplet",
  FunctionPlotCell: "function-plot",
  CodeTraceCell: "code-trace",
  MiniChartCell: "mini-chart",
  MathExpressionCell: "math-expression",
  MapRegionCell: "map-region",
  ProcessStepCell: "process-step",
  SpacerCell: "spacer",
};

const cardClassByType = {
  HeadingCell: "heading-card",
  ImageCell: "image-card",
  KeyPointsCell: "keypoint-card",
  CompareCell: "compare-card",
  TextCell: "text-card",
  RecallPromptCell: "recall-card",
  TimelineStepCell: "timeline-card",
  KeyValueCell: "key-value-card",
  PairCell: "pair-card",
  TripletCell: "triplet-card",
  FunctionPlotCell: "function-plot-card",
  CodeTraceCell: "code-trace-card",
  MiniChartCell: "mini-chart-card",
  MathExpressionCell: "math-expression-card",
  MapRegionCell: "map-region-card",
  ProcessStepCell: "process-card",
  SpacerCell: "spacer-card",
};

function jsonResponse(response, status, payload) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload, null, 2));
}

function textResponse(response, status, message) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(message);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJson(filePath, payload) {
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

const catalogTextVariants = ["small", "medium", "large"];

function largeText(value, detail) {
  const base = String(value || detail || "Preview text").trim();
  return `${base} This larger sample adds detail for checking wrapping, vertical spacing, and card rhythm in the phone preview.`;
}

function recordOrEmpty(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function textCellContentVariant(content, variant, label) {
  const title = content.title || label || "Text sample";
  if (variant === "small") {
    return {
      ...content,
      title,
      orientation: "Short note.",
      body: "Short note.",
      definition: "A compact definition.",
      quote: "A compact quote.",
      rule: "Use the rule.",
      example: "One quick example.",
      warning: "Check the exception.",
      caption: "Compact caption.",
    };
  }
  return {
    ...content,
    title,
    orientation: largeText(content.orientation || content.body, "A clear orientation sentence"),
    body: largeText(content.body, "A clear body sentence"),
    definition: largeText(content.definition, "A definition"),
    quote: largeText(content.quote, "A quote"),
    rule: largeText(content.rule, "A rule"),
    example: largeText(content.example, "An example"),
    warning: largeText(content.warning, "A warning"),
    caption: largeText(content.caption, "A caption"),
  };
}

function pairPanelVariant(panel, variant, fallbackLabel, fallbackBody) {
  const basePanel = recordOrEmpty(panel);
  if (variant === "small") {
    return {
      ...basePanel,
      label: basePanel.label || fallbackLabel,
      body: fallbackBody,
    };
  }
  return {
    ...basePanel,
    label: basePanel.label || fallbackLabel,
    body: largeText(basePanel.body || basePanel.detail || basePanel.description, fallbackBody),
  };
}

function keyValueContentVariant(content, variant) {
  const items = Array.isArray(content.items) ? content.items.map(recordOrEmpty) : [];
  return {
    ...content,
    title: content.title || content.heading || content.label || "Renderer facts",
    items: items.map((item) => {
      const key = String(item.key || item.label || "").trim().toLowerCase();
      if (key === "mode" || key === "style") {
        return item;
      }
      return {
        ...item,
        value: variant === "small"
          ? key === "cue"
            ? "Prompt"
            : key === "action"
              ? "Recall first"
              : key === "result"
                ? "Stronger recall"
                : String(item.value || item.body || item.text || "Value").split(/[.!?]/)[0].slice(0, 28) || "Value"
          : largeText(item.value || item.body || item.text, "Detailed value"),
      };
    }),
  };
}

function contentForTextVariant(cellType, content, variant, label) {
  if (variant === "medium") return deepClone(content);

  if (cellType === "TextCell") return textCellContentVariant(content, variant, label);
  if (cellType === "HeadingCell") {
    return { ...content, heading: variant === "small" ? "Renderer Lab" : largeText(content.heading, "Renderer Lab") };
  }
  if (cellType === "ImageCell" || cellType === "MapRegionCell" || cellType === "FunctionPlotCell" || cellType === "MiniChartCell") {
    return {
      ...content,
      caption: variant === "small" ? "Compact visual caption." : largeText(content.caption, "Visual caption"),
    };
  }
  if (cellType === "CompareCell") {
    const rows = Array.isArray(content.rows) ? content.rows.map(recordOrEmpty) : [];
    return {
      ...content,
      title: variant === "small" ? "Quick contrast" : largeText(content.title, "Study method contrast"),
      left_title: variant === "small" ? "Passive" : largeText(content.left_title, "Passive review"),
      right_title: variant === "small" ? "Active" : largeText(content.right_title, "Active recall"),
      rows: variant === "small"
        ? rows.slice(0, 2).map((row) => ({ ...row, left: "Short", right: "Clear" }))
        : [
            ...rows.map((row) => ({
              ...row,
              left: largeText(row.left, "Left comparison"),
              right: largeText(row.right, "Right comparison"),
            })),
            { aspect: "Transfer", left: "Often fragile without retrieval practice.", right: "Stronger because the cue and answer are separated." },
          ],
      takeaway: variant === "small" ? "Choose active recall." : largeText(content.takeaway, "Active recall wins"),
    };
  }
  if (cellType === "KeyPointsCell") {
    return {
      ...content,
      points: variant === "small"
        ? ["Preview density.", "Check spacing."]
        : [
            "Use randomized-stable-unlocked style policy while checking the current catalog sample.",
            "Preview enough mobile text to catch wrapping, rhythm, and edge spacing issues.",
            "Keep the payload local to the renderer workbench until production promotion is requested.",
            "Compare the same structure across light and dark themes before approving the style.",
          ],
    };
  }
  if (cellType === "RecallPromptCell") {
    return {
      ...content,
      question: variant === "small" ? "What changes?" : largeText(content.question, "What should you remember from this card?"),
      answer: variant === "small" ? "The key distinction." : largeText(content.answer, "The answer explains the key distinction"),
    };
  }
  if (cellType === "TimelineStepCell") {
    return {
      ...content,
      chain_label: content.chain_label || "Renderer rollout",
      time_label: variant === "small" ? "Step" : content.time_label || "Step 1",
      event_title: variant === "small" ? "Preview ships" : content.event_title || "Preview endpoint ships",
      description: variant === "small"
        ? "Check spacing."
        : variant === "large"
          ? "The website loads the current renderer bundle into the phone preview, then checks whether the timeline rail keeps long event copy readable without crowding the date chip or outer card padding."
          : content.description || "The lab loads the renderer bundle in the phone frame.",
      note: variant === "small"
        ? content.note || ""
        : variant === "large"
          ? content.note || "Use this longer note to verify the bottom spacing and rail alignment after the event copy wraps onto multiple lines."
          : content.note,
    };
  }
  if (cellType === "ProcessStepCell") {
    return {
      ...content,
      chain_label: content.chain_label || "Lab workflow",
      action: variant === "small"
        ? "Adjust payload."
        : variant === "large"
          ? "Adjust the payload, style tokens, and spacing rules while keeping the step layout stable inside the phone preview."
          : content.action || "Adjust payload or CSS",
      output: variant === "small"
        ? "Preview updates."
        : variant === "large"
          ? "The phone frame refreshes with enough wrapped output text to test the result pill, arrow hint, and card rhythm."
          : content.output || "The phone frame updates",
      note: variant === "small"
        ? "Local only."
        : variant === "large"
          ? "Use this longer note to confirm the node, connector, output block, and bottom padding still feel balanced."
          : content.note || "Changes stay local to the workbench",
    };
  }
  if (cellType === "MathExpressionCell") {
    return {
      ...content,
      explanation: variant === "small" ? "Use the expression to compare terms." : largeText(content.explanation, "The expression explains how each variable contributes"),
    };
  }
  if (cellType === "CodeTraceCell") {
    return {
      ...content,
      trace_steps: variant === "small"
        ? ["Initialize.", "Return result."]
        : [
            "Initialize the input state before the function starts.",
            "Apply the first branch and record the intermediate value.",
            "Finish the loop and compare the final value with the expected result.",
          ],
      result: variant === "small" ? "Result is stable." : largeText(content.result, "The result is stable"),
    };
  }
  if (cellType === "PairCell") {
    return {
      ...content,
      left: pairPanelVariant(content.left, variant, "Cue", "Compact cue."),
      right: pairPanelVariant(content.right, variant, "Answer", "Compact answer."),
      connector_label: variant === "small" ? "links to" : content.connector_label || "connects to",
      relationship_sentence: variant === "small" ? "Cue links to answer." : largeText(content.relationship_sentence, "A paired explanation completes the relationship"),
    };
  }
  if (cellType === "KeyValueCell") {
    return keyValueContentVariant(content, variant);
  }
  if (cellType === "TripletCell") {
    const items = Array.isArray(content.items) ? content.items.map(recordOrEmpty) : [];
    return {
      ...content,
      chain_label: content.chain_label || "Connected flow",
      connector_labels: variant === "small" ? ["then", "then"] : content.connector_labels || ["leads to", "results in"],
      items: variant === "small"
        ? items.map((item, index) => ({ ...item, title: `Step ${index + 1}`, body: "Compact detail." }))
        : items.map((item, index) => ({
            ...item,
            title: largeText(item.title, `Step ${index + 1}`),
            body: largeText(item.body || item.description, "Detailed step explanation"),
          })),
      relationship_sentence: variant === "small" ? "Each step leads to the next." : largeText(content.relationship_sentence, "The three-part relationship explains the full path"),
    };
  }
  if (cellType === "SpacerCell") {
    return { ...content, label: variant === "small" ? "Space" : largeText(content.label, "Spacer") };
  }
  return {
    ...content,
    title: content.title && (variant === "small" ? String(content.title).slice(0, 24) : largeText(content.title, "Title")),
    body: content.body && (variant === "small" ? "Compact body." : largeText(content.body, "Body")),
  };
}

function payloadForTextVariant(basePayload, variant, entry = {}) {
  const payload = deepClone(basePayload || {});
  payload.scenarios = Array.isArray(payload.scenarios)
    ? payload.scenarios.map((scenario) => {
        const nextScenario = { ...scenario };
        nextScenario.slots = Array.isArray(scenario.slots)
          ? scenario.slots.map((slot) => {
              if (!slot || typeof slot !== "object") return slot;
              const cellType = typeof slot.cell_type === "string" ? slot.cell_type : entry.cell_type;
              const content = slot.content && typeof slot.content === "object" && !Array.isArray(slot.content)
                ? slot.content
                : {};
              return {
                ...slot,
                content: contentForTextVariant(cellType, content, variant, entry.label || entry.cell_type),
              };
            })
          : scenario.slots;
        return nextScenario;
      })
    : payload.scenarios;
  return payload;
}

function rebuildCatalogEntryTextVariants(entry) {
  if (!entry || !entry.payload) return entry;
  entry.text_variants = {
    small: payloadForTextVariant(entry.payload, "small", entry),
    medium: deepClone(entry.payload),
    large: payloadForTextVariant(entry.payload, "large", entry),
  };
  return entry;
}

function normalizeCatalogEntryTextVariants(entry) {
  if (!entry || !entry.payload) return entry;
  const existing = entry.text_variants && typeof entry.text_variants === "object" ? entry.text_variants : {};
  entry.text_variants = {
    small: existing.small || payloadForTextVariant(entry.payload, "small", entry),
    medium: deepClone(entry.payload),
    large: existing.large || payloadForTextVariant(entry.payload, "large", entry),
  };
  return entry;
}

function mapCatalogEntryPayloads(entry, mapPayload) {
  if (entry.payload) {
    entry.payload = mapPayload(entry.payload);
  }
  if (entry.text_variants && typeof entry.text_variants === "object") {
    for (const variant of catalogTextVariants) {
      if (entry.text_variants[variant]) {
        entry.text_variants[variant] = mapPayload(entry.text_variants[variant]);
      }
    }
  }
  return entry;
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function slugify(value) {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "renderer-draft";
}

function styleSlug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cellSlugFromType(cellType) {
  const base = String(cellType || "").replace(/Cell$/, "");
  return styleSlug(
    base
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2"),
  );
}

function labelFromCellType(cellType) {
  const base = String(cellType || "").replace(/Cell$/, "");
  return base
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim() || "Draft Cell";
}

function cellFolderForType(cellType) {
  return cellFolderByType[cellType] || cellSlugFromType(cellType);
}

function cardClassForType(cellType) {
  return cardClassByType[cellType] || `${cellSlugFromType(cellType)}-card`;
}

function labelFromStyleId(styleId) {
  return styleId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeCssString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function localHostname(hostname) {
  return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname);
}

function localRemoteAddress(address) {
  return !address ||
    address === "127.0.0.1" ||
    address === "::1" ||
    address === "::ffff:127.0.0.1";
}

function assertLocalWriteRequest(request) {
  const remoteAddress = request.socket?.remoteAddress || "";
  if (!localRemoteAddress(remoteAddress)) {
    throw new Error("Renderer lab writes are only allowed from this machine.");
  }

  const origin = request.headers.origin || request.headers.referer;
  if (!origin) {
    return;
  }

  try {
    const { hostname } = new URL(origin);
    if (!localHostname(hostname)) {
      throw new Error("Renderer lab writes are only allowed from localhost.");
    }
  } catch {
    throw new Error("Renderer lab writes require a local origin.");
  }
}

function safeChild(baseDir, id) {
  const resolved = path.resolve(baseDir, slugify(id));
  if (!resolved.startsWith(path.resolve(baseDir) + path.sep)) {
    throw new Error("Invalid workbench id.");
  }
  return resolved;
}

async function copyDirectory(source, destination) {
  await rm(destination, { recursive: true, force: true });
  await mkdir(path.dirname(destination), { recursive: true });
  await mkdir(destination, { recursive: true });
  await readdir(source, { withFileTypes: true }).then((entries) =>
    Promise.all(entries.map(async (entry) => {
      const sourcePath = path.join(source, entry.name);
      const destinationPath = path.join(destination, entry.name);
      if (entry.isDirectory()) {
        await copyDirectory(sourcePath, destinationPath);
      } else if (entry.isFile()) {
        await mkdir(path.dirname(destinationPath), { recursive: true });
        await writeFile(destinationPath, await readFile(sourcePath));
      }
    })),
  );
}

function availabilityScriptJSON(availability) {
  return JSON.stringify(availability).replace(/<\/script/gi, "<\\/script");
}

function indexHTMLWithAvailability(indexHTML, availability) {
  const script = `<script id="renderer-style-availability-data" type="application/json">${availabilityScriptJSON(availability)}</script>`;
  if (indexHTML.includes('id="renderer-style-availability-data"')) {
    return indexHTML.replace(
      /\s*<script id="renderer-style-availability-data" type="application\/json">[\s\S]*?<\/script>/,
      `\n  ${script}`,
    );
  }
  const rendererScript = '<script src="./renderer.js"></script>';
  if (indexHTML.includes(rendererScript)) {
    return indexHTML.replace(rendererScript, `${script}\n  ${rendererScript}`);
  }
  return indexHTML.replace("</body>", `  ${script}\n</body>`);
}

async function validateBundleDirectory(bundleDir) {
  for (const filename of requiredBundleFiles) {
    if (!(await exists(path.join(bundleDir, filename)))) {
      throw new Error(`Bundle is missing ${filename}.`);
    }
  }
  const rendererJS = await readFile(path.join(bundleDir, "renderer.js"), "utf8");
  if (!rendererJS.includes("compactRendererStyleAvailability")) {
    throw new Error("renderer.js does not support renderer_style_availability.json metadata.");
  }
  await assertFlattenedRendererCss(bundleDir);
}

function normalizeAvailability(availability, version) {
  const groups = Array.isArray(availability.groups) ? availability.groups : [];
  let styleCount = 0;
  for (const group of groups) {
    if (!Array.isArray(group.styles) || group.styles.length === 0) {
      throw new Error(`Style group ${group.group_id || "(unknown)"} has no styles.`);
    }
    const unlocked = [];
    for (const style of group.styles) {
      style.is_locked = Boolean(style.is_locked);
      style.real_lesson_enabled = !style.is_locked;
      if (!style.is_locked) {
        unlocked.push(style.style_id);
      }
      styleCount += 1;
    }
    if (unlocked.length === 0) {
      throw new Error(`Style group ${group.group_id || "(unknown)"} cannot have every style locked.`);
    }
    if (!unlocked.includes(group.default_style_id)) {
      group.default_style_id = unlocked[0];
    }
    group.is_locked = Boolean(group.is_locked);
  }
  return {
    ...availability,
    version,
    group_count: groups.length,
    style_count: styleCount,
    groups,
  };
}

const preferredCellOrder = [
  "heading",
  "image",
  "key-points",
  "compare",
  "text",
  "recall-prompt",
  "timeline-step",
  "key-value",
  "pair",
  "triplet",
  "function-plot",
  "code-trace",
  "mini-chart",
  "math-expression",
  "map-region",
  "process-step",
  "spacer",
];

const preferredCellCssOrder = [
  "index.css",
  "card.css",
  "base.css",
  "animations.css",
  "shared.css",
  "styles/shared.css",
];

function compareCellCssFiles(left, right) {
  const [leftCell, ...leftParts] = left.split("/");
  const [rightCell, ...rightParts] = right.split("/");
  const leftCellRank = preferredCellOrder.indexOf(leftCell);
  const rightCellRank = preferredCellOrder.indexOf(rightCell);
  const normalizedLeftCellRank = leftCellRank === -1 ? Number.MAX_SAFE_INTEGER : leftCellRank;
  const normalizedRightCellRank = rightCellRank === -1 ? Number.MAX_SAFE_INTEGER : rightCellRank;
  if (normalizedLeftCellRank !== normalizedRightCellRank) {
    return normalizedLeftCellRank - normalizedRightCellRank;
  }
  if (leftCell !== rightCell) {
    return leftCell.localeCompare(rightCell);
  }

  const leftPath = leftParts.join("/");
  const rightPath = rightParts.join("/");
  const leftPathRank = preferredCellCssOrder.indexOf(leftPath);
  const rightPathRank = preferredCellCssOrder.indexOf(rightPath);
  const normalizedLeftPathRank = leftPathRank === -1 ? Number.MAX_SAFE_INTEGER : leftPathRank;
  const normalizedRightPathRank = rightPathRank === -1 ? Number.MAX_SAFE_INTEGER : rightPathRank;
  if (normalizedLeftPathRank !== normalizedRightPathRank) {
    return normalizedLeftPathRank - normalizedRightPathRank;
  }
  return leftPath.localeCompare(rightPath);
}

async function listCellStylesheetFiles(workbenchDir) {
  const cellsRoot = path.join(workbenchDir, "bundle", "cells");
  if (!(await exists(cellsRoot))) {
    return { extraStylesheetPaths: [], editableFiles: [] };
  }

  const files = [];
  async function walk(directory, relativeDirectory = "") {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(entryPath, relativePath);
      } else if (entry.isFile() && entry.name.endsWith(".css")) {
        files.push(relativePath);
      }
    }
  }

  await walk(cellsRoot);
  files.sort(compareCellCssFiles);
  return {
    extraStylesheetPaths: files
      .filter((file) => file.endsWith("/index.css"))
      .map((file) => `/renderer-workbench/current/bundle/cells/${file}`),
    editableFiles: files.map((file) => `public/renderer-workbench/current/bundle/cells/${file}`),
  };
}

async function listSharedStylesheetFiles(workbenchDir) {
  const sharedRoot = path.join(workbenchDir, "bundle", "shared");
  if (!(await exists(sharedRoot))) {
    return [];
  }

  const files = [];
  async function walk(directory, relativeDirectory = "") {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(entryPath, relativePath);
      } else if (entry.isFile() && entry.name.endsWith(".css")) {
        files.push(relativePath);
      }
    }
  }

  await walk(sharedRoot);
  files.sort((left, right) => left.localeCompare(right));
  return files.map((file) => `public/renderer-workbench/current/bundle/shared/${file}`);
}

async function listCellDefinitionFiles(workbenchDir) {
  const definitionsRoot = path.join(workbenchDir, "cell-definitions");
  if (!(await exists(definitionsRoot))) {
    return [];
  }
  const entries = await readdir(definitionsRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => `public/renderer-workbench/current/cell-definitions/${entry.name}`)
    .sort((left, right) => left.localeCompare(right));
}

async function writeWorkbenchManifest(workbenchDir, { version, catalogEntryCount = 0 }) {
  const capabilities = await readJson(path.join(workbenchDir, "bundle", "capabilities.json"));
  const cellStylesheets = await listCellStylesheetFiles(workbenchDir);
  const sharedStylesheets = await listSharedStylesheetFiles(workbenchDir);
  const cellDefinitionFiles = await listCellDefinitionFiles(workbenchDir);
  const manifest = {
    source: "local-workbench",
    renderer_id: "dynamic_gridcell",
    version,
    schema_version: "three_step_gridcell_v1",
    entrypoint: "index.html",
    bundle_base_path: "/renderer-workbench/current/bundle/",
    catalog_path: "/renderer-workbench/current/catalog.json",
    cell_definitions_path: "/renderer-workbench/current/cell-definitions/",
    style_availability_path: "/renderer-workbench/current/bundle/renderer_style_availability.json",
    extra_stylesheet_paths: cellStylesheets.extraStylesheetPaths,
    editable_files: [
      "public/renderer-workbench/current/bundle/renderer.js",
      "public/renderer-workbench/current/bundle/renderer.css",
      ...sharedStylesheets,
      ...cellStylesheets.editableFiles,
      "public/renderer-workbench/current/bundle/renderer_style_availability.json",
      "public/renderer-workbench/current/catalog.json",
      ...cellDefinitionFiles,
    ],
    catalog_entry_count: catalogEntryCount,
    cell_definition_count: cellDefinitionFiles.length,
    capabilities: {
      ...capabilities,
      version,
      style_availability_path: "renderer_style_availability.json",
    },
  };
  await writeJson(path.join(workbenchDir, "workbench-manifest.json"), manifest);
}

async function refreshCurrentMetadata() {
  const availabilityPath = path.join(currentDir, "bundle", "renderer_style_availability.json");
  const catalogPath = path.join(currentDir, "catalog.json");
  const capabilitiesPath = path.join(currentDir, "bundle", "capabilities.json");
  const indexPath = path.join(currentDir, "bundle", "index.html");
  const bundleDir = path.join(currentDir, "bundle");
  const capabilities = await readJson(capabilitiesPath);
  const version = capabilities.version || (await readJson(path.join(currentDir, "workbench-manifest.json"))).version;
  const availability = normalizeAvailability(await readJson(availabilityPath), version);
  const catalog = await readJson(catalogPath);

  catalog.version = version;
  catalog.style_availability = availability;
  catalog.style_availability_path = "renderer_style_availability.json";
  catalog.entry_count = Array.isArray(catalog.entries) ? catalog.entries.length : 0;
  if (Array.isArray(catalog.entries)) {
    const groupsById = new Map(availability.groups.map((group) => [group.group_id, group]));
    for (const entry of catalog.entries) {
      normalizeCatalogEntryTextVariants(entry);
      mapCatalogEntryPayloads(entry, (payload) => ({
        ...payload,
        version,
      }));
      const group = groupsById.get(entry.style_group_id);
      if (!group || !entry.style_id) continue;
      const style = group.styles.find((candidate) => candidate.style_id === entry.style_id);
      if (!style) continue;
      entry.is_locked = Boolean(style.is_locked || group.is_locked);
      entry.default_style_id = group.default_style_id;
    }
  }

  capabilities.version = version;
  capabilities.style_availability_path = "renderer_style_availability.json";
  capabilities.style_availability = availability;
  await writeJson(availabilityPath, availability);
  await writeJson(catalogPath, catalog);
  await writeJson(capabilitiesPath, capabilities);
  await writeFile(indexPath, indexHTMLWithAvailability(await readFile(indexPath, "utf8"), availability), "utf8");
  await writeFlattenedRendererCss(bundleDir);
  await writeWorkbenchManifest(currentDir, { version, catalogEntryCount: catalog.entry_count });
}

async function listDirectoryItems(baseDir, kind) {
  if (!(await exists(baseDir))) return [];
  const entries = await readdir(baseDir, { withFileTypes: true });
  const items = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const itemDir = path.join(baseDir, entry.name);
    const manifestPath = path.join(itemDir, "workbench-manifest.json");
    const bundleCapabilitiesPath = path.join(itemDir, "bundle", "capabilities.json");
    let version = "";
    if (await exists(manifestPath)) {
      version = (await readJson(manifestPath)).version || "";
    } else if (await exists(bundleCapabilitiesPath)) {
      version = (await readJson(bundleCapabilitiesPath)).version || "";
    }
    items.push({
      id: entry.name,
      kind,
      label: entry.name.replace(/[-_]+/g, " "),
      version,
    });
  }
  return items.sort((a, b) => a.id.localeCompare(b.id));
}

async function listBundles() {
  return {
    current: {
      id: "current",
      kind: "current",
      label: "Current workbench",
      version: (await readJson(path.join(currentDir, "workbench-manifest.json"))).version || "",
    },
    library: await listDirectoryItems(libraryDir, "library"),
    drafts: await listDirectoryItems(draftsDir, "draft"),
  };
}

function sourceDirFor(kind, id) {
  if (kind === "current") return currentDir;
  if (kind === "library") return safeChild(libraryDir, id);
  if (kind === "draft") return safeChild(draftsDir, id);
  throw new Error("Unknown bundle source kind.");
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function copyToCurrent(payload) {
  const source = sourceDirFor(payload.kind, payload.id);
  if (!(await exists(source))) {
    throw new Error("Selected bundle does not exist.");
  }
  if (path.resolve(source) !== path.resolve(currentDir)) {
    const tempDir = path.join(workbenchRoot, `.current-${Date.now()}`);
    await copyDirectory(source, tempDir);
    await rm(currentDir, { recursive: true, force: true });
    await copyDirectory(tempDir, currentDir);
    await rm(tempDir, { recursive: true, force: true });
  }
  await refreshCurrentMetadata();
}

async function saveDraft(payload) {
  await refreshCurrentMetadata();
  const manifest = await readJson(path.join(currentDir, "workbench-manifest.json"));
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "");
  const draftId = `${slugify(payload.name || manifest.version || "renderer")}-${stamp}`;
  const destination = safeChild(draftsDir, draftId);
  await copyDirectory(currentDir, destination);
  return { id: draftId, version: manifest.version };
}

function findMatchingBrace(source, openIndex) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = openIndex; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = "";
      }
      continue;
    }
    if (character === "\"" || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }
  throw new Error("Unable to find renderer registry object boundary.");
}

function objectBoundsAfterMarker(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Unable to find ${marker}.`);
  }
  const openIndex = source.indexOf("{", markerIndex);
  if (openIndex === -1) {
    throw new Error(`Unable to find object for ${marker}.`);
  }
  return { start: openIndex, end: findMatchingBrace(source, openIndex) };
}

function propertyObjectBounds(source, propertyName) {
  const match = new RegExp(`${escapeRegExp(propertyName)}\\s*:\\s*\\{`).exec(source);
  if (!match) {
    throw new Error(`Unable to find renderer registry object ${propertyName}.`);
  }
  const openIndex = source.indexOf("{", match.index);
  return { start: openIndex, end: findMatchingBrace(source, openIndex) };
}

function replaceBounds(source, bounds, replacement) {
  return `${source.slice(0, bounds.start)}${replacement}${source.slice(bounds.end + 1)}`;
}

function updateObjectAfterMarker(source, marker, updater) {
  const bounds = objectBoundsAfterMarker(source, marker);
  const objectText = source.slice(bounds.start, bounds.end + 1);
  return replaceBounds(source, bounds, updater(objectText));
}

function updatePropertyObject(source, propertyName, updater) {
  const bounds = propertyObjectBounds(source, propertyName);
  const objectText = source.slice(bounds.start, bounds.end + 1);
  return replaceBounds(source, bounds, updater(objectText));
}

function addStyleToArrayProperty(source, propertyName, styleId) {
  const match = new RegExp(`(${escapeRegExp(propertyName)}\\s*:\\s*\\[)([^\\]]*)(\\])`).exec(source);
  if (!match) {
    throw new Error(`Unable to find renderer style registry array ${propertyName}.`);
  }
  const existingStyle = new RegExp(`["']${escapeRegExp(styleId)}["']`).test(match[2]);
  if (existingStyle) {
    return source;
  }
  const nextItems = match[2].trim()
    ? `${match[2]}, ${JSON.stringify(styleId)}`
    : JSON.stringify(styleId);
  return `${source.slice(0, match.index)}${match[1]}${nextItems}${match[3]}${source.slice(match.index + match[0].length)}`;
}

function updateRendererRegistryForGroup(rendererJS, group, styleId) {
  const layoutKind = String(group.layout_kind || "");
  const styleKey = String(group.style_key || "");
  if (layoutKind === "text_render_mode") {
    const renderMode = String(group.render_mode || group.layout_id || "").trim();
    if (!renderMode) {
      throw new Error(`Text style group ${group.group_id} is missing render_mode.`);
    }
    return updateObjectAfterMarker(rendererJS, "const gridcellRenderStyles = {", (gridcellStyles) =>
      updatePropertyObject(gridcellStyles, "TextCell", (textStyles) =>
        addStyleToArrayProperty(textStyles, renderMode, styleId),
      ),
    );
  }

  if (styleKey === "preview_relationship_style" || layoutKind === "triplet_layout") {
    const relationshipKind = String(group.relationship_kind || "").trim();
    const relationshipMode = String(group.relationship_mode || "").trim();
    if (!relationshipKind || !relationshipMode) {
      throw new Error(`Relationship style group ${group.group_id} is missing relationship metadata.`);
    }
    return updateObjectAfterMarker(rendererJS, "const relationshipRenderStyles = {", (relationshipStyles) =>
      updatePropertyObject(relationshipStyles, relationshipKind, (kindStyles) =>
        addStyleToArrayProperty(kindStyles, relationshipMode, styleId),
      ),
    );
  }

  if (layoutKind === "cell_style") {
    const cellType = String(group.cell_type || "").trim();
    if (!cellType) {
      throw new Error(`Cell style group ${group.group_id} is missing cell_type.`);
    }
    return updateObjectAfterMarker(rendererJS, "const gridcellRenderStyles = {", (gridcellStyles) =>
      addStyleToArrayProperty(gridcellStyles, cellType, styleId),
    );
  }

  throw new Error(`Unsupported style group kind ${layoutKind || "(unknown)"}.`);
}

function targetStyleGroups(availability, selectedGroup) {
  const groups = [selectedGroup];
  const relationshipKind = String(selectedGroup.relationship_kind || "");
  const relationshipMode = String(selectedGroup.relationship_mode || "");
  if (selectedGroup.cell_type !== "TripletCell" || relationshipKind !== "triplet" || !relationshipMode) {
    return groups;
  }

  const linkedGroups = (availability.groups || []).filter((group) => {
    if (group === selectedGroup) return false;
    if (group.cell_type !== "TripletCell") return false;
    if (group.relationship_kind !== "triplet") return false;
    return group.relationship_mode === relationshipMode &&
      (group.layout_kind === "relationship_mode" || group.layout_kind === "triplet_layout");
  });
  return [...groups, ...linkedGroups];
}

function upsertAvailabilityStyle(group, styleId, label, locked, overwrite, isPrimaryGroup) {
  if (!Array.isArray(group.styles)) {
    group.styles = [];
  }
  const existing = group.styles.find((style) => style.style_id === styleId);
  if (existing && isPrimaryGroup && !overwrite) {
    throw new Error(`Style ${styleId} already exists in ${group.group_id}.`);
  }
  const nextStyle = {
    style_id: styleId,
    label,
    is_locked: locked,
    real_lesson_enabled: !locked,
  };
  if (existing) {
    Object.assign(existing, nextStyle);
  } else {
    group.styles.push(nextStyle);
  }
  if (!group.default_style_id) {
    group.default_style_id = styleId;
  }
}

function cssTargetForGroup(group, styleId) {
  const layoutKind = String(group.layout_kind || "");
  const relationshipKind = String(group.relationship_kind || "");
  const cellType = String(group.cell_type || "");

  if (layoutKind === "text_render_mode") {
    const renderMode = String(group.render_mode || group.layout_id || "").trim();
    return {
      filePath: path.join(currentDir, "bundle", "cells", "text", "modes", `${renderMode}.css`),
      mode: "append",
      className: `text-style-${styleId}`,
    };
  }

  if (layoutKind === "relationship_mode" && relationshipKind === "pair") {
    return {
      filePath: path.join(currentDir, "bundle", "cells", "pair", "styles", "variants.css"),
      mode: "append",
      className: `pair-style-${styleId}`,
    };
  }

  if ((layoutKind === "relationship_mode" || layoutKind === "triplet_layout") && relationshipKind === "triplet") {
    return {
      filePath: path.join(currentDir, "bundle", "cells", "triplet", "styles", "variants.css"),
      mode: "append",
      className: `triplet-style-${styleId}`,
    };
  }

  const folder = cellFolderForType(cellType);
  if (!folder) {
    throw new Error(`No stylesheet folder is configured for ${cellType}.`);
  }

  return {
    filePath: path.join(currentDir, "bundle", "cells", folder, "styles", `${styleId}.css`),
    indexPath: path.join(currentDir, "bundle", "cells", folder, "index.css"),
    importPath: `./styles/${styleId}.css`,
    mode: "file",
    className: layoutKind === "relationship_mode" && relationshipKind === "keyValue"
      ? `key-value-style-${styleId}`
      : `cell-style-${styleId}`,
  };
}

function defaultStyleCss(group, styleId, label) {
  const layoutKind = String(group.layout_kind || "");
  const relationshipKind = String(group.relationship_kind || "");
  const cellType = String(group.cell_type || "");
  const cardClass = cardClassForType(cellType);
  const escapedLabel = escapeCssString(label);

  if (layoutKind === "text_render_mode") {
    const renderMode = String(group.render_mode || group.layout_id || "body");
    return `.cell-card.text-mode-${renderMode}.text-style-${styleId} {
  border-color: rgba(47, 143, 131, 0.24);
  background:
    linear-gradient(135deg, rgba(47, 143, 131, 0.10), rgba(123, 105, 239, 0.08)),
    var(--card-bg);
}

.cell-card.text-mode-${renderMode}.text-style-${styleId} .text-cell::before {
  content: "${escapedLabel}";
  display: inline-flex;
  width: fit-content;
  margin-bottom: 10px;
  border-radius: 999px;
  background: rgba(47, 143, 131, 0.12);
  padding: 4px 9px;
  color: var(--accent-1);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

:root[data-theme="dark"] .cell-card.text-mode-${renderMode}.text-style-${styleId} {
  border-color: rgba(88, 193, 178, 0.28);
  background:
    linear-gradient(135deg, rgba(88, 193, 178, 0.12), rgba(142, 126, 255, 0.10)),
    var(--card-bg);
}`;
  }

  if (relationshipKind === "pair") {
    return `.cell-card.pair-card.pair-style-${styleId} .pair-panel {
  border-color: rgba(47, 143, 131, 0.22);
  background:
    linear-gradient(135deg, rgba(47, 143, 131, 0.12), rgba(123, 105, 239, 0.08)),
    rgba(255, 255, 255, 0.42);
}

.cell-card.pair-card.pair-style-${styleId} .pair-connector span {
  border-color: var(--relationship-line);
  color: var(--relationship-a);
  box-shadow: 0 0 0 7px rgba(47, 143, 131, 0.07);
}

:root[data-theme="dark"] .cell-card.pair-card.pair-style-${styleId} .pair-panel {
  background:
    linear-gradient(135deg, rgba(88, 193, 178, 0.10), rgba(142, 126, 255, 0.08)),
    rgba(255, 255, 255, 0.04);
}`;
  }

  if (relationshipKind === "triplet") {
    return `.cell-card.triplet-card.triplet-style-${styleId} .triplet-item {
  border-color: rgba(47, 143, 131, 0.22);
  background:
    linear-gradient(135deg, rgba(47, 143, 131, 0.11), rgba(123, 105, 239, 0.07)),
    rgba(255, 255, 255, 0.44);
}

.cell-card.triplet-card.triplet-style-${styleId} .triplet-connector span {
  border-color: var(--relationship-line);
  color: var(--relationship-a);
}

:root[data-theme="dark"] .cell-card.triplet-card.triplet-style-${styleId} .triplet-item {
  background:
    linear-gradient(135deg, rgba(88, 193, 178, 0.10), rgba(142, 126, 255, 0.08)),
    rgba(255, 255, 255, 0.04);
}`;
  }

  if (relationshipKind === "keyValue") {
    return `.cell-card.key-value-card.key-value-style-${styleId} .key-value-title {
  border-bottom-color: rgba(47, 143, 131, 0.18);
  background: rgba(47, 143, 131, 0.10);
}

.cell-card.key-value-card.key-value-style-${styleId} .key-value-cell {
  border-color: rgba(47, 143, 131, 0.22);
  background:
    linear-gradient(135deg, rgba(47, 143, 131, 0.11), rgba(123, 105, 239, 0.07)),
    rgba(255, 255, 255, 0.48);
}

:root[data-theme="dark"] .cell-card.key-value-card.key-value-style-${styleId} .key-value-cell {
  background:
    linear-gradient(135deg, rgba(88, 193, 178, 0.10), rgba(142, 126, 255, 0.08)),
    rgba(255, 255, 255, 0.04);
}`;
  }

  return `.cell-card.${cardClass}.cell-style-${styleId} {
  --cell-style-accent: var(--accent-1);
  border-color: rgba(47, 143, 131, 0.24);
  background:
    linear-gradient(135deg, rgba(47, 143, 131, 0.11), rgba(123, 105, 239, 0.08)),
    var(--card-bg);
}

:root[data-theme="dark"] .cell-card.${cardClass}.cell-style-${styleId} {
  border-color: rgba(88, 193, 178, 0.28);
  background:
    linear-gradient(135deg, rgba(88, 193, 178, 0.12), rgba(142, 126, 255, 0.10)),
    var(--card-bg);
}`;
}

function styleBlock(styleId, css) {
  const blockCss = String(css || "").trim();
  return `\n\n/* renderer-workbench-style:start style_id=${styleId} */\n${blockCss}\n/* renderer-workbench-style:end style_id=${styleId} */\n`;
}

async function upsertStyleBlock(filePath, styleId, css, overwrite) {
  const block = styleBlock(styleId, css);
  const markerPattern = new RegExp(
    `\\n*\\/\\* renderer-workbench-style:start style_id=${escapeRegExp(styleId)} \\*\\/[\\s\\S]*?\\/\\* renderer-workbench-style:end style_id=${escapeRegExp(styleId)} \\*\\/\\n*`,
  );
  const existing = await exists(filePath) ? await readFile(filePath, "utf8") : "";
  if (markerPattern.test(existing)) {
    if (!overwrite) {
      throw new Error(`CSS block for ${styleId} already exists.`);
    }
    await writeFile(filePath, existing.replace(markerPattern, block), "utf8");
    return;
  }
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${existing.replace(/\s*$/, "")}${block}`, "utf8");
}

async function ensureStylesheetImport(indexPath, importPath) {
  const importLine = `@import "${importPath}";`;
  const indexCSS = await readFile(indexPath, "utf8");
  if (indexCSS.includes(importLine)) {
    return;
  }
  const lines = indexCSS.split(/\r?\n/);
  const insertIndex = lines.findIndex((line) =>
    line.includes('@import "./responsive.css"') ||
    line.includes('@import "./animations.css"') ||
    line.includes('@import "./shared.css"'),
  );
  if (insertIndex === -1) {
    lines.push(importLine);
  } else {
    lines.splice(insertIndex, 0, importLine);
  }
  await writeFile(indexPath, `${lines.join("\n").replace(/\s*$/, "")}\n`, "utf8");
}

async function writeStyleCss(group, styleId, label, css, overwrite) {
  const target = cssTargetForGroup(group, styleId);
  const finalCss = String(css || "").trim() || defaultStyleCss(group, styleId, label);
  if (target.mode === "file") {
    if ((await exists(target.filePath)) && !overwrite) {
      throw new Error(`Stylesheet ${path.relative(repoRoot, target.filePath)} already exists.`);
    }
    await mkdir(path.dirname(target.filePath), { recursive: true });
    await writeFile(target.filePath, styleBlock(styleId, finalCss).replace(/^\n+/, ""), "utf8");
    await ensureStylesheetImport(target.indexPath, target.importPath);
    return;
  }
  await upsertStyleBlock(target.filePath, styleId, finalCss, overwrite);
}

function catalogEntryIdForGroup(group, styleId) {
  const layoutKind = String(group.layout_kind || "");
  if (layoutKind === "text_render_mode") {
    return `style-text-${group.render_mode || group.layout_id}-${styleId}`;
  }
  if (layoutKind === "triplet_layout") {
    return `style-triplet-layout-${group.render_mode || group.layout_id}-${styleId}`;
  }
  if (layoutKind === "relationship_mode") {
    return `style-relationship-${group.relationship_kind}-${group.relationship_mode}-${styleId}`;
  }
  if (layoutKind === "cell_style") {
    return `style-cell-${group.cell_type}-${styleId}`;
  }
  return `style-${slugify(group.group_id)}-${styleId}`;
}

function updateSlotForStyle(slot, group, styleId, label) {
  if (!slot || typeof slot !== "object") {
    return;
  }
  const styleKey = group.style_key || "preview_cell_style";
  slot[styleKey] = styleId;
  slot.props = slot.props && typeof slot.props === "object" ? slot.props : {};
  if (group.layout_kind === "text_render_mode") {
    slot.props.render_mode = group.render_mode || group.layout_id;
  }
  if (group.relationship_kind === "pair") {
    slot.props.relation = group.relationship_mode;
  }
  if (group.relationship_kind === "keyValue") {
    slot.props.tone = group.relationship_mode;
  }
  if (group.cell_type === "KeyValueCell" && group.layout_kind === "cell_style") {
    slot.preview_relationship_style = "ledger";
  }
  if (group.relationship_kind === "triplet") {
    slot.props.relation = group.relationship_mode;
    if (group.layout_kind === "triplet_layout") {
      slot.props.render_mode = group.render_mode || group.layout_id;
      slot.props.orientation = group.orientation || "vertical";
    }
  }
  const content = slot.content && typeof slot.content === "object" ? slot.content : null;
  if (!content) {
    return;
  }
  if (typeof content.heading === "string") {
    content.heading = `${label} heading`;
  }
  if (Array.isArray(content.items)) {
    const styleItem = content.items.find((item) =>
      item && typeof item === "object" && String(item.key || "").toLowerCase() === "style",
    );
    if (styleItem) {
      styleItem.value = label;
    }
  }
}

function catalogEntryForStyle(catalog, group, styleId, label, locked, version) {
  const template = (catalog.entries || []).find((entry) => entry.style_group_id === group.group_id);
  if (!template) {
    throw new Error(`Catalog has no sample entry for ${group.group_id}.`);
  }
  const entry = JSON.parse(JSON.stringify(template));
  entry.id = catalogEntryIdForGroup(group, styleId);
  entry.label = label;
  entry.style_id = styleId;
  entry.style_label = label;
  entry.is_locked = locked;
  entry.default_style_id = group.default_style_id;
  entry.layout_id = group.layout_id;
  entry.layout_label = group.layout_label;
  entry.layout_kind = group.layout_kind;
  entry.style_group_id = group.group_id;
  entry.style_key = group.style_key;
  entry.relationship_mode = group.relationship_mode || "";
  entry.render_mode = group.render_mode || group.relationship_mode || group.layout_id || "default";
  entry.render_mode_token = group.render_mode || "";

  const payload = entry.payload || {};
  payload.version = version;
  payload.stylePolicy = "preview";
  payload.style_policy = "preview";
  payload.showScenarioTitles = true;
  const scenario = Array.isArray(payload.scenarios) ? payload.scenarios[0] : null;
  if (scenario && typeof scenario === "object") {
    scenario.title = `${group.cell_type}: ${group.layout_label || entry.render_mode} - ${label}`;
    scenario.subtitle = "Local workbench style preview";
    const slot = Array.isArray(scenario.slots) ? scenario.slots[0] : null;
    updateSlotForStyle(slot, group, styleId, label);
  }
  entry.payload = payload;
  rebuildCatalogEntryTextVariants(entry);
  return entry;
}

function upsertCatalogEntry(catalog, entry, overwrite) {
  if (!Array.isArray(catalog.entries)) {
    catalog.entries = [];
  }
  const existingIndex = catalog.entries.findIndex((candidate) => candidate.id === entry.id);
  if (existingIndex >= 0 && !overwrite) {
    throw new Error(`Catalog entry ${entry.id} already exists.`);
  }
  if (existingIndex >= 0) {
    catalog.entries[existingIndex] = entry;
  } else {
    catalog.entries.push(entry);
  }
}

async function saveStyle(payload) {
  const groupId = String(payload.groupId || "").trim();
  const styleName = String(payload.styleName || "").trim();
  const styleId = styleSlug(payload.styleId || styleName);
  if (!groupId) {
    throw new Error("groupId is required.");
  }
  if (!styleId || !styleIdPattern.test(styleId)) {
    throw new Error("styleId must be kebab-case letters and numbers.");
  }

  const label = styleName || labelFromStyleId(styleId);
  const locked = payload.locked === undefined ? true : Boolean(payload.locked);
  const overwrite = Boolean(payload.overwrite);
  const manifest = await readJson(path.join(currentDir, "workbench-manifest.json"));
  const availabilityPath = path.join(currentDir, "bundle", "renderer_style_availability.json");
  const catalogPath = path.join(currentDir, "catalog.json");
  const rendererPath = path.join(currentDir, "bundle", "renderer.js");
  const availability = await readJson(availabilityPath);
  const catalog = await readJson(catalogPath);
  const selectedGroup = (availability.groups || []).find((group) => group.group_id === groupId);
  if (!selectedGroup) {
    throw new Error(`Style group ${groupId} was not found.`);
  }

  const rendererJS = updateRendererRegistryForGroup(await readFile(rendererPath, "utf8"), selectedGroup, styleId);
  const groupsToUpdate = targetStyleGroups(availability, selectedGroup);
  groupsToUpdate.forEach((group, index) => {
    upsertAvailabilityStyle(group, styleId, label, locked, overwrite, index === 0);
  });
  const version = manifest.version || "local-workbench";
  const catalogEntry = catalogEntryForStyle(catalog, selectedGroup, styleId, label, locked, version);
  upsertCatalogEntry(catalog, catalogEntry, overwrite);
  const normalizedAvailability = normalizeAvailability(availability, version);
  await writeStyleCss(selectedGroup, styleId, label, payload.css, overwrite);
  await writeFile(rendererPath, rendererJS, "utf8");
  await writeJson(availabilityPath, normalizedAvailability);
  await writeJson(catalogPath, catalog);
  await refreshCurrentMetadata();
  return {
    entryId: catalogEntry.id,
    groupId,
    styleId,
    label,
    locked,
  };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseJsonLike(value, fallback, label) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error(`${label} must be valid JSON.`);
    }
  }
  return value;
}

function normalizeStringArray(value, label) {
  const parsed = parseJsonLike(value, [], label);
  if (!Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON array.`);
  }
  return parsed.map((item) => String(item || "").trim()).filter(Boolean);
}

function normalizeCellStatus(value) {
  const status = String(value || "draft").trim();
  if (status === "draft" || status === "ready_for_backend") {
    return status;
  }
  throw new Error("status must be draft or ready_for_backend.");
}

function normalizeSchemaObject(value, fallback, label) {
  const parsed = parseJsonLike(value, fallback, label);
  if (!isPlainObject(parsed)) {
    throw new Error(`${label} must be a JSON object.`);
  }
  return parsed;
}

function normalizeSamplePayload(value) {
  const parsed = parseJsonLike(value, {}, "samplePayload");
  if (!isPlainObject(parsed)) {
    throw new Error("samplePayload must be a JSON object.");
  }
  return parsed;
}

function defaultContentSchema(cellType, displayName) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["title", "body"],
    properties: {
      title: {
        type: "string",
        description: `${displayName} headline.`,
      },
      body: {
        type: "string",
        description: `${displayName} explanatory body text.`,
      },
      items: {
        type: "array",
        items: { type: "string" },
        description: "Optional supporting bullets.",
      },
    },
    "x-cell-type": cellType,
  };
}

function defaultPropsSchema() {
  return {
    type: "object",
    additionalProperties: true,
    properties: {},
  };
}

function sampleContentForDefinition(displayName, samplePayload) {
  if (isPlainObject(samplePayload.content)) {
    return samplePayload.content;
  }
  if (isPlainObject(samplePayload.slot) && isPlainObject(samplePayload.slot.content)) {
    return samplePayload.slot.content;
  }
  if (isPlainObject(samplePayload) && !Array.isArray(samplePayload.scenarios) && Object.keys(samplePayload).length > 0) {
    return samplePayload;
  }
  return {
    title: `${displayName} preview`,
    body: "Draft cell content goes here.",
    items: ["Add real sample data", "Tune the renderer scaffold"],
  };
}

function samplePropsForDefinition(samplePayload) {
  if (isPlainObject(samplePayload.props)) {
    return samplePayload.props;
  }
  if (isPlainObject(samplePayload.slot) && isPlainObject(samplePayload.slot.props)) {
    return samplePayload.slot.props;
  }
  return {};
}

function rendererPayloadForCellDefinition(definition, version, samplePayload) {
  if (Array.isArray(samplePayload.scenarios)) {
    return {
      ...samplePayload,
      renderer_id: "dynamic_gridcell",
      schema_version: "three_step_gridcell_v1",
      version,
      stylePolicy: "preview",
      style_policy: "preview",
      theme: samplePayload.theme === "dark" ? "dark" : "light",
      showScenarioTitles: true,
    };
  }

  const content = sampleContentForDefinition(definition.display_name, samplePayload);
  const props = samplePropsForDefinition(samplePayload);
  return {
    renderer_id: "dynamic_gridcell",
    schema_version: "three_step_gridcell_v1",
    version,
    stylePolicy: "preview",
    style_policy: "preview",
    theme: "light",
    showScenarioTitles: true,
    scenarios: [
      {
        title: `${definition.cell_type}: ${definition.display_name}`,
        subtitle: "Local draft cell preview",
        screenExplanation: definition.when_to_use || "Draft cell renderer scaffold.",
        grid: isPlainObject(samplePayload.grid) ? samplePayload.grid : { rows: 8, cols: 10 },
        slots: [
          {
            slot_id: `${definition.cell_slug}_preview`,
            cell_type: definition.cell_type,
            r: 0,
            c: 0,
            rowspan: 8,
            colspan: 10,
            preview_cell_style: "default",
            props,
            content,
          },
        ],
      },
    ],
  };
}

function normalizeCellDefinitionPayload(payload, version) {
  const rawCellType = String(payload.cellType || payload.cell_type || "").trim();
  if (!cellTypePattern.test(rawCellType)) {
    throw new Error("cell_type must be PascalCase and end with Cell, for example ConceptMapCell.");
  }
  const cellSlug = cellSlugFromType(rawCellType);
  if (!cellSlug || !styleIdPattern.test(cellSlug)) {
    throw new Error("cell_type could not be converted into a valid kebab-case folder name.");
  }
  const displayName = String(payload.displayName || payload.display_name || labelFromCellType(rawCellType)).trim();
  const samplePayload = normalizeSamplePayload(payload.samplePayload ?? payload.sample_payload ?? payload.shapeExample ?? payload.shape_example);
  const shapeExample = normalizeSchemaObject(
    payload.shapeExample ?? payload.shape_example ?? sampleContentForDefinition(displayName, samplePayload),
    sampleContentForDefinition(displayName, samplePayload),
    "shape_example",
  );
  const definition = {
    schema_version: "cell_definition_v1",
    cell_type: rawCellType,
    cell_slug: cellSlug,
    display_name: displayName,
    status: normalizeCellStatus(payload.status),
    when_to_use: String(payload.whenToUse || payload.when_to_use || "").trim(),
    when_not_to_use: String(payload.whenNotToUse || payload.when_not_to_use || "").trim(),
    llm_instruction: String(payload.llmInstruction || payload.llm_instruction || "").trim(),
    content_schema: normalizeSchemaObject(
      payload.contentSchema ?? payload.content_schema,
      defaultContentSchema(rawCellType, displayName),
      "content_schema",
    ),
    props_schema: normalizeSchemaObject(
      payload.propsSchema ?? payload.props_schema,
      defaultPropsSchema(),
      "props_schema",
    ),
    required_fields: normalizeStringArray(payload.requiredFields ?? payload.required_fields ?? ["title", "body"], "required_fields"),
    optional_fields: normalizeStringArray(payload.optionalFields ?? payload.optional_fields ?? ["items"], "optional_fields"),
    content_budget: Number.isFinite(Number(payload.contentBudget ?? payload.content_budget))
      ? Number(payload.contentBudget ?? payload.content_budget)
      : 45,
    shape_example: shapeExample,
    render_modes: [
      {
        id: "default",
        label: "Default mode",
      },
    ],
    style_groups: [
      {
        group_id: `cell:${rawCellType}`,
        layout_id: "default",
        layout_kind: "cell_style",
        layout_label: "Default style",
        style_key: "preview_cell_style",
        default_style_id: "default",
        styles: [
          {
            style_id: "default",
            label: "Default",
            is_locked: false,
            real_lesson_enabled: true,
          },
        ],
      },
    ],
    mobile_support: {
      web_renderer_only: payload.webRendererOnly === undefined ? true : Boolean(payload.webRendererOnly),
      requires_ios_native_type: Boolean(payload.requiresIosNativeType || payload.requires_ios_native_type),
      requires_android_native_type: Boolean(payload.requiresAndroidNativeType || payload.requires_android_native_type),
    },
    security: {
      allows_html: Boolean(payload.allowsHtml || payload.allows_html),
      allows_remote_images: Boolean(payload.allowsRemoteImages || payload.allows_remote_images),
    },
    example_payloads: [],
    version,
    updated_at: new Date().toISOString(),
  };
  definition.example_payloads = [
    rendererPayloadForCellDefinition(definition, version, samplePayload),
  ];
  return definition;
}

function cellDefinitionPath(cellType) {
  return path.join(cellDefinitionsDir, `${cellSlugFromType(cellType)}.json`);
}

async function listCellDefinitions() {
  if (!(await exists(cellDefinitionsDir))) {
    return [];
  }
  const entries = await readdir(cellDefinitionsDir, { withFileTypes: true });
  const definitions = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    definitions.push(await readJson(path.join(cellDefinitionsDir, entry.name)));
  }
  return definitions.sort((left, right) => String(left.cell_type).localeCompare(String(right.cell_type)));
}

function addArrayPropertyToObjectText(objectText, propertyName, items, overwrite) {
  const propertyPattern = new RegExp(`(\\n\\s*)${escapeRegExp(propertyName)}\\s*:\\s*\\[[^\\]]*\\](,?)`);
  const itemText = `[${items.map((item) => JSON.stringify(item)).join(", ")}]`;
  if (propertyPattern.test(objectText)) {
    return objectText;
  }
  const closingIndex = objectText.lastIndexOf("}");
  if (closingIndex === -1) {
    throw new Error("Unable to patch renderer style registry.");
  }
  const hasProperties = objectText.slice(1, closingIndex).trim().length > 0;
  const prefix = hasProperties ? "," : "";
  return `${objectText.slice(0, closingIndex)}${prefix}\n        ${propertyName}: ${itemText}\n      ${objectText.slice(closingIndex)}`;
}

function insertSwitchCaseBeforeDefault(source, caseValue, bodyLines, overwrite) {
  const casePattern = new RegExp(`case\\s+["']${escapeRegExp(caseValue)}["']\\s*:`);
  if (casePattern.test(source)) {
    return source;
  }
  const defaultIndex = source.indexOf("          default:");
  if (defaultIndex === -1) {
    throw new Error("Unable to find renderer switch default case.");
  }
  const caseBlock = [
    `          case ${JSON.stringify(caseValue)}:`,
    ...bodyLines.map((line) => `            ${line}`),
  ].join("\n");
  return `${source.slice(0, defaultIndex)}${caseBlock}\n${source.slice(defaultIndex)}`;
}

function ensureRendererDraftHelper(rendererJS) {
  if (rendererJS.includes("function renderWorkbenchDraftCell(")) {
    return rendererJS;
  }
  const marker = "      function renderCell(slot, hasIncomingConnection, hasOutgoingConnection, relationshipStyle, cellStyle, relationshipAssignment) {";
  const helper = `      function renderWorkbenchDraftCell(content, props, displayName) {
        const title = firstNonEmpty([content.title, content.heading, content.label, displayName]);
        const body = firstNonEmpty([content.body, content.body_markdown, content.text, content.description, props.summary]);
        const items = Array.isArray(content.items) ? content.items : [];
        const eyebrow = firstNonEmpty([props.eyebrow, props.label, "Draft Cell"]);
        const itemHtml = items.length
          ? '<ul class="workbench-draft-list">' + items.slice(0, 5).map(function (item) {
              if (typeof item === "string" || typeof item === "number") {
                return "<li>" + markdown(item) + "</li>";
              }
              if (!item || typeof item !== "object") {
                return "<li>" + markdown(item) + "</li>";
              }
              const itemTitle = firstNonEmpty([item.title, item.label, item.key]);
              const itemBody = firstNonEmpty([item.body, item.value, item.text]);
              return "<li>" + markdown(itemTitle || itemBody) + (itemTitle && itemBody ? "<span>" + markdown(itemBody) + "</span>" : "") + "</li>";
            }).join("") + "</ul>"
          : "";
        return '<div class="workbench-draft-cell">' +
          '<div class="workbench-draft-eyebrow">' + escapeHTML(eyebrow) + '</div>' +
          '<h3 class="workbench-draft-title">' + markdown(title) + '</h3>' +
          (body ? '<p class="workbench-draft-body">' + markdown(body) + '</p>' : "") +
          itemHtml +
          '</div>';
      }

`;
  if (!rendererJS.includes(marker)) {
    throw new Error("Unable to find renderCell insertion point.");
  }
  return rendererJS.replace(marker, `${helper}${marker}`);
}

function ensureRendererCellSupport(rendererJS, definition, overwrite) {
  let nextJS = updateObjectAfterMarker(rendererJS, "const gridcellRenderStyles = {", (gridcellStyles) =>
    addArrayPropertyToObjectText(gridcellStyles, definition.cell_type, ["default"], overwrite),
  );
  nextJS = ensureRendererDraftHelper(nextJS);

  const classSwitchMarker = "      function classNameForCellType(cellType) {";
  const renderCellMarker = "      function renderCell(slot, hasIncomingConnection, hasOutgoingConnection, relationshipStyle, cellStyle, relationshipAssignment) {";
  const classStart = nextJS.indexOf(classSwitchMarker);
  const renderStart = nextJS.indexOf(renderCellMarker);
  if (classStart === -1 || renderStart === -1 || renderStart <= classStart) {
    throw new Error("Unable to locate renderer cell switch blocks.");
  }
  const beforeClass = nextJS.slice(0, classStart);
  const classSection = nextJS.slice(classStart, renderStart);
  const afterClass = nextJS.slice(renderStart);
  const patchedClassSection = insertSwitchCaseBeforeDefault(
    classSection,
    definition.cell_type,
    [`return ${JSON.stringify(cardClassForType(definition.cell_type))};`],
    overwrite,
  );

  const nextRenderStart = beforeClass.length + patchedClassSection.length;
  nextJS = `${beforeClass}${patchedClassSection}${afterClass}`;
  const renderSectionStart = nextRenderStart;
  const animationMarker = "      function animationProfileForCell(card) {";
  const animationStart = nextJS.indexOf(animationMarker, renderSectionStart);
  if (animationStart === -1) {
    throw new Error("Unable to locate renderCell switch boundary.");
  }
  const beforeRender = nextJS.slice(0, renderSectionStart);
  const renderSection = nextJS.slice(renderSectionStart, animationStart);
  const afterRender = nextJS.slice(animationStart);
  const patchedRenderSection = insertSwitchCaseBeforeDefault(
    renderSection,
    definition.cell_type,
    [`return renderWorkbenchDraftCell(content, props, ${JSON.stringify(definition.display_name)});`],
    overwrite,
  );
  return `${beforeRender}${patchedRenderSection}${afterRender}`;
}

async function ensureCellCssScaffold(definition, overwrite) {
  const folder = cellFolderForType(definition.cell_type);
  const cellDir = path.join(currentDir, "bundle", "cells", folder);
  const indexPath = path.join(cellDir, "index.css");
  const basePath = path.join(cellDir, "base.css");
  const stylePath = path.join(cellDir, "styles", "default.css");
  if ((await exists(cellDir)) && !overwrite) {
    throw new Error(`Cell stylesheet folder ${folder} already exists.`);
  }
  await mkdir(path.join(cellDir, "styles"), { recursive: true });
  const cardClass = cardClassForType(definition.cell_type);
  await writeFile(indexPath, '@import "./base.css";\n@import "./styles/default.css";\n', "utf8");
  await writeFile(basePath, `.cell-card.${cardClass} {
  border-color: rgba(47, 143, 131, 0.22);
  background:
    linear-gradient(135deg, rgba(47, 143, 131, 0.10), rgba(123, 105, 239, 0.08)),
    var(--card-bg);
}

.cell-card.${cardClass} .workbench-draft-cell {
  display: grid;
  gap: 10px;
}

.cell-card.${cardClass} .workbench-draft-eyebrow {
  color: var(--accent-1);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.cell-card.${cardClass} .workbench-draft-title {
  margin: 0;
  color: var(--text-strong);
  font-size: clamp(20px, 5vw, 30px);
  line-height: 1.04;
}

.cell-card.${cardClass} .workbench-draft-body {
  margin: 0;
  color: var(--text);
  font-size: 14px;
  line-height: 1.48;
}

.cell-card.${cardClass} .workbench-draft-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cell-card.${cardClass} .workbench-draft-list li {
  border-left: 3px solid var(--accent-1);
  padding-left: 10px;
  color: var(--text);
  font-size: 13px;
  line-height: 1.38;
}

.cell-card.${cardClass} .workbench-draft-list span {
  display: block;
  margin-top: 2px;
  color: var(--text-muted);
}
`, "utf8");
  await writeFile(stylePath, `.cell-card.${cardClass}.cell-style-default {
  box-shadow: 0 18px 46px rgba(22, 35, 48, 0.10);
}

:root[data-theme="dark"] .cell-card.${cardClass}.cell-style-default {
  border-color: rgba(88, 193, 178, 0.26);
  background:
    linear-gradient(135deg, rgba(88, 193, 178, 0.12), rgba(142, 126, 255, 0.10)),
    var(--card-bg);
}
`, "utf8");
}

function upsertSupportedCellType(capabilities, cellType) {
  if (!Array.isArray(capabilities.supported_cell_types)) {
    capabilities.supported_cell_types = [];
  }
  if (!capabilities.supported_cell_types.includes(cellType)) {
    capabilities.supported_cell_types.push(cellType);
  }
}

function upsertCellAvailabilityGroup(availability, definition, overwrite) {
  if (!Array.isArray(availability.groups)) {
    availability.groups = [];
  }
  const groupId = `cell:${definition.cell_type}`;
  const existing = availability.groups.find((group) => group.group_id === groupId);
  const group = {
    cell_type: definition.cell_type,
    default_style_id: "default",
    group_id: groupId,
    is_locked: false,
    layout_id: "default",
    layout_kind: "cell_style",
    layout_label: "Default style",
    orientation: "",
    relationship_kind: "",
    relationship_mode: "",
    render_mode: "",
    style_key: "preview_cell_style",
    styles: [
      {
        is_locked: false,
        label: "Default",
        real_lesson_enabled: true,
        style_id: "default",
      },
    ],
  };
  if (existing) {
    if (!overwrite) {
      throw new Error(`Cell style group ${groupId} already exists.`);
    }
    Object.assign(existing, group);
  } else {
    availability.groups.push(group);
  }
}

function catalogEntryForCellDefinition(definition) {
  const payload = JSON.parse(JSON.stringify(definition.example_payloads[0]));
  payload.stylePolicy = "preview";
  payload.style_policy = "preview";
  payload.showScenarioTitles = true;
  const scenario = Array.isArray(payload.scenarios) ? payload.scenarios[0] : null;
  if (scenario && typeof scenario === "object") {
    scenario.title = `${definition.cell_type}: ${definition.display_name}`;
    scenario.subtitle = "Local draft cell preview";
  }
  const entry = {
    id: `draft-cell-${definition.cell_slug}`,
    group: definition.display_name,
    label: "Default preview",
    cell_type: definition.cell_type,
    render_mode: "default",
    layout_id: "default",
    layout_label: "Default style",
    layout_kind: "cell_style",
    style_group_id: `cell:${definition.cell_type}`,
    style_id: "default",
    style_label: "Default",
    is_locked: false,
    default_style_id: "default",
    style_key: "preview_cell_style",
    payload,
  };
  return rebuildCatalogEntryTextVariants(entry);
}

async function saveCellDefinition(payload) {
  const manifest = await readJson(path.join(currentDir, "workbench-manifest.json"));
  const version = manifest.version || "local-workbench";
  const definition = normalizeCellDefinitionPayload(payload, version);
  const overwrite = Boolean(payload.overwrite);
  const definitionPath = cellDefinitionPath(definition.cell_type);
  const capabilitiesPath = path.join(currentDir, "bundle", "capabilities.json");
  const availabilityPath = path.join(currentDir, "bundle", "renderer_style_availability.json");
  const catalogPath = path.join(currentDir, "catalog.json");
  const rendererPath = path.join(currentDir, "bundle", "renderer.js");
  const capabilities = await readJson(capabilitiesPath);
  const availability = await readJson(availabilityPath);
  const catalog = await readJson(catalogPath);
  const rendererJS = await readFile(rendererPath, "utf8");
  const isKnownCell = Array.isArray(capabilities.supported_cell_types) && capabilities.supported_cell_types.includes(definition.cell_type);
  const hasDefinition = await exists(definitionPath);
  if ((isKnownCell || hasDefinition) && !overwrite) {
    throw new Error(`Cell ${definition.cell_type} already exists. Enable overwrite to update it.`);
  }

  upsertSupportedCellType(capabilities, definition.cell_type);
  upsertCellAvailabilityGroup(availability, definition, overwrite);
  upsertCatalogEntry(catalog, catalogEntryForCellDefinition(definition), overwrite);
  await ensureCellCssScaffold(definition, overwrite);
  await mkdir(cellDefinitionsDir, { recursive: true });
  await writeFile(rendererPath, ensureRendererCellSupport(rendererJS, definition, overwrite), "utf8");
  await writeJson(definitionPath, definition);
  await writeJson(capabilitiesPath, capabilities);
  await writeJson(availabilityPath, normalizeAvailability(availability, version));
  await writeJson(catalogPath, catalog);
  await refreshCurrentMetadata();
  return {
    cellType: definition.cell_type,
    cellSlug: definition.cell_slug,
    entryId: `draft-cell-${definition.cell_slug}`,
    definitionPath: path.relative(repoRoot, definitionPath),
  };
}

function apiUrl(endpoint) {
  return `${apiBase}/${endpoint.replace(/^\//, "")}`;
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${url} failed with HTTP ${response.status}.`);
  }
  return response.json();
}

async function proxyBackendGet(request, response, url) {
  const endpoint = `${url.pathname.replace(/^\/django-proxy\/?/, "")}${url.search}`;
  if (!endpoint || endpoint.startsWith("../")) {
    textResponse(response, 400, "Invalid backend proxy path");
    return;
  }

  const backendResponse = await fetch(apiUrl(endpoint), {
    cache: "no-store",
    headers: {
      Accept: request.headers.accept || "*/*",
    },
  });
  const body = Buffer.from(await backendResponse.arrayBuffer());
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": backendResponse.headers.get("content-type") || "application/octet-stream",
    "Cache-Control": backendResponse.headers.get("cache-control") || "no-store",
  };
  response.writeHead(backendResponse.status, headers);
  response.end(body);
}

async function importBackendLatest() {
  const manifestUrl = apiUrl("user-interface/lesson-renderer/preview/manifest/");
  const manifest = await fetchJson(manifestUrl);
  if (!manifest.enabled || !manifest.bundle_endpoint || !manifest.version) {
    throw new Error("Backend renderer manifest is not downloadable.");
  }
  const bundleURL = manifest.bundle_endpoint.startsWith("http")
    ? manifest.bundle_endpoint
    : apiUrl(manifest.bundle_endpoint);
  const bundleResponse = await fetch(bundleURL, { cache: "no-store" });
  if (!bundleResponse.ok) {
    throw new Error(`Backend renderer bundle failed with HTTP ${bundleResponse.status}.`);
  }
  const bundleBuffer = Buffer.from(await bundleResponse.arrayBuffer());
  const actualSize = bundleBuffer.byteLength;
  const actualHash = crypto.createHash("sha256").update(bundleBuffer).digest("hex");
  if (manifest.bundle_size_bytes && actualSize !== manifest.bundle_size_bytes) {
    throw new Error(`Backend bundle size mismatch. Expected ${manifest.bundle_size_bytes}, got ${actualSize}.`);
  }
  if (manifest.bundle_sha256 && actualHash !== String(manifest.bundle_sha256).toLowerCase()) {
    throw new Error("Backend bundle hash mismatch.");
  }

  const catalog = await fetchJson(apiUrl("user-interface/lesson-renderer/preview/catalog/"));
  const zip = await JSZip.loadAsync(bundleBuffer);
  const bundleId = `backend-${slugify(manifest.version)}`;
  const destination = safeChild(libraryDir, bundleId);
  await rm(destination, { recursive: true, force: true });
  await mkdir(path.join(destination, "bundle"), { recursive: true });
  await Promise.all(Object.values(zip.files).map(async (file) => {
    if (file.dir) return;
    const destinationPath = path.join(destination, "bundle", file.name);
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await writeFile(destinationPath, await file.async("nodebuffer"));
  }));
  await validateBundleDirectory(path.join(destination, "bundle"));
  await writeJson(path.join(destination, "catalog.json"), catalog);
  await writeWorkbenchManifest(destination, {
    version: manifest.version,
    catalogEntryCount: Array.isArray(catalog.entries) ? catalog.entries.length : 0,
  });
  return { id: bundleId, kind: "library", version: manifest.version };
}

async function toggleLock(payload) {
  const groupId = String(payload.groupId || "").trim();
  const styleId = String(payload.styleId || "").trim();
  if (!groupId || !styleId) {
    throw new Error("groupId and styleId are required.");
  }
  const availabilityPath = path.join(currentDir, "bundle", "renderer_style_availability.json");
  const manifest = await readJson(path.join(currentDir, "workbench-manifest.json"));
  const availability = await readJson(availabilityPath);
  const group = (availability.groups || []).find((candidate) => candidate.group_id === groupId);
  if (!group) {
    throw new Error(`Style group ${groupId} was not found.`);
  }
  const style = (group.styles || []).find((candidate) => candidate.style_id === styleId);
  if (!style) {
    throw new Error(`Style ${styleId} was not found in ${groupId}.`);
  }
  style.is_locked = Boolean(payload.locked);
  style.real_lesson_enabled = !style.is_locked;
  const unlocked = group.styles.filter((candidate) => !candidate.is_locked);
  if (unlocked.length === 0) {
    style.is_locked = false;
    style.real_lesson_enabled = true;
    throw new Error("At least one style must remain unlocked in each group.");
  }
  if (!unlocked.some((candidate) => candidate.style_id === group.default_style_id)) {
    group.default_style_id = unlocked[0].style_id;
  }
  await writeJson(availabilityPath, normalizeAvailability(availability, manifest.version));
  await refreshCurrentMetadata();
}

async function route(request, response) {
  if (request.method === "OPTIONS") {
    jsonResponse(response, 200, { ok: true });
    return;
  }
  const url = new URL(request.url || "/", `http://${host}:${port}`);
  try {
    if (request.method === "POST") {
      assertLocalWriteRequest(request);
    }
    if (request.method === "GET" && url.pathname === "/health") {
      jsonResponse(response, 200, { ok: true, root: workbenchRoot });
      return;
    }
    if (request.method === "GET" && url.pathname === "/bundles") {
      jsonResponse(response, 200, await listBundles());
      return;
    }
    if (request.method === "GET" && url.pathname === "/cells") {
      jsonResponse(response, 200, { ok: true, cells: await listCellDefinitions() });
      return;
    }
    if (request.method === "GET" && url.pathname.startsWith("/django-proxy/")) {
      await proxyBackendGet(request, response, url);
      return;
    }
    if (request.method === "POST" && url.pathname === "/copy-to-current") {
      await copyToCurrent(await readBody(request));
      jsonResponse(response, 200, { ok: true });
      return;
    }
    if (request.method === "POST" && url.pathname === "/refresh-current") {
      await refreshCurrentMetadata();
      jsonResponse(response, 200, { ok: true });
      return;
    }
    if (request.method === "POST" && url.pathname === "/save-draft") {
      jsonResponse(response, 200, { ok: true, draft: await saveDraft(await readBody(request)) });
      return;
    }
    if (request.method === "POST" && url.pathname === "/import-backend-latest") {
      jsonResponse(response, 200, { ok: true, bundle: await importBackendLatest() });
      return;
    }
    if (request.method === "POST" && url.pathname === "/toggle-lock") {
      await toggleLock(await readBody(request));
      jsonResponse(response, 200, { ok: true });
      return;
    }
    if (request.method === "POST" && url.pathname === "/styles") {
      jsonResponse(response, 200, { ok: true, style: await saveStyle(await readBody(request)) });
      return;
    }
    if (request.method === "POST" && url.pathname === "/cells") {
      jsonResponse(response, 200, { ok: true, cell: await saveCellDefinition(await readBody(request)) });
      return;
    }
    textResponse(response, 404, "Not found");
  } catch (error) {
    jsonResponse(response, 400, {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown renderer lab server error.",
    });
  }
}

await mkdir(libraryDir, { recursive: true });
await mkdir(draftsDir, { recursive: true });
await mkdir(cellDefinitionsDir, { recursive: true });

createServer(route).listen(port, host, () => {
  console.log(`Renderer lab server listening at http://${host}:${port}`);
});
