#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const defaultBundleDir = path.join(repoRoot, "public", "renderer-workbench", "current", "bundle");

const expectedTripletLayouts = [
  {
    layoutId: "vertical-rail",
    relationshipMode: "input_process_output",
    styleId: "machine-flow",
  },
  {
    layoutId: "chain-strip",
    relationshipMode: "problem_method_result",
    styleId: "solve-path",
  },
  {
    layoutId: "ladder",
    relationshipMode: "claim_evidence_implication",
    styleId: "evidence-rail",
  },
];

function usage() {
  return [
    "Usage: node scripts/renderer-parity-check.mjs [bundle-dir]",
    "",
    "bundle-dir defaults to public/renderer-workbench/current/bundle.",
  ].join("\n");
}

function normalizeCss(css) {
  return String(css || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

function withoutCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function assertCondition(condition, message, failures) {
  if (!condition) {
    failures.push(message);
  }
}

async function readRequired(filePath, failures) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    failures.push(`Missing required file: ${filePath} (${error?.message || error})`);
    return "";
  }
}

function findMatchingBrace(text, openBraceIndex) {
  let depth = 0;
  for (let index = openBraceIndex; index < text.length; index += 1) {
    const char = text[index];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }
  return -1;
}

function selectorListHasExactSelector(selectorList, selector) {
  return selectorList
    .split(",")
    .map((item) => item.trim())
    .includes(selector);
}

function extractCssBlocks(css, selector) {
  const blocks = [];
  let searchIndex = 0;
  while (searchIndex < css.length) {
    const selectorIndex = css.indexOf(selector, searchIndex);
    if (selectorIndex === -1) break;
    const openBraceIndex = css.indexOf("{", selectorIndex + selector.length);
    if (openBraceIndex === -1) break;
    const previousCloseBraceIndex = css.lastIndexOf("}", selectorIndex);
    const selectorList = css.slice(previousCloseBraceIndex + 1, openBraceIndex).trim();
    if (!selectorListHasExactSelector(selectorList, selector)) {
      searchIndex = selectorIndex + selector.length;
      continue;
    }
    const closeBraceIndex = findMatchingBrace(css, openBraceIndex);
    if (closeBraceIndex === -1) break;
    blocks.push(css.slice(openBraceIndex + 1, closeBraceIndex));
    searchIndex = closeBraceIndex + 1;
  }
  return blocks;
}

function assertNeutralPseudoElementBlocks(css, selector, failures) {
  const blocks = extractCssBlocks(css, selector);
  assertCondition(blocks.length > 0, `Missing CSS selector block: ${selector}`, failures);

  for (const block of blocks) {
    const normalized = withoutCssComments(block).toLowerCase();
    const hasContentNone = /content\s*:\s*none\b/.test(normalized);
    const hasDisplayNone = /display\s*:\s*none\b/.test(normalized);
    const hasVisibleAccentBackground =
      /background(?:-image)?\s*:\s*(?:linear-gradient|var\(--relationship-|var\(--item-accent)/.test(normalized);
    assertCondition(
      hasContentNone || hasDisplayNone,
      `${selector} must be neutral; expected content:none or display:none.`,
      failures,
    );
    assertCondition(
      !hasVisibleAccentBackground,
      `${selector} must not define a generic visible accent background.`,
      failures,
    );
  }
}

function assertTripletLayoutAvailability(styleAvailability, failures) {
  const groups = Array.isArray(styleAvailability?.groups) ? styleAvailability.groups : [];
  for (const expected of expectedTripletLayouts) {
    const group = groups.find(
      (candidate) =>
        candidate?.cell_type === "TripletCell" &&
        candidate?.layout_kind === "triplet_layout" &&
        candidate?.layout_id === expected.layoutId &&
        candidate?.relationship_mode === expected.relationshipMode,
    );
    assertCondition(
      Boolean(group),
      `Missing TripletCell triplet_layout group ${expected.layoutId}/${expected.relationshipMode}.`,
      failures,
    );
    if (!group) continue;

    assertCondition(
      group.is_locked === true,
      `TripletCell layout group ${group.group_id} must stay locked for real lessons.`,
      failures,
    );
    assertCondition(
      group.default_style_id === expected.styleId,
      `TripletCell layout group ${group.group_id} default must be ${expected.styleId}; found ${group.default_style_id}.`,
      failures,
    );

    const unlockedStyles = (Array.isArray(group.styles) ? group.styles : []).filter((style) => style?.is_locked === false);
    assertCondition(
      unlockedStyles.length === 1 && unlockedStyles[0]?.style_id === expected.styleId,
      `TripletCell layout group ${group.group_id} must keep only ${expected.styleId} unlocked for preview/import validity.`,
      failures,
    );

    const enabledStyles = (Array.isArray(group.styles) ? group.styles : []).filter((style) => style?.real_lesson_enabled === true);
    assertCondition(
      enabledStyles.length === 0,
      `TripletCell layout group ${group.group_id} must not expose real-lesson styles.`,
      failures,
    );
  }
}

async function assertRenderLabProductionMode(failures) {
  const pagePath = path.join(repoRoot, "src", "app", "labs", "renderers", "page.tsx");
  const pageSource = await readRequired(pagePath, failures);
  if (!pageSource) return;
  assertCondition(pageSource.includes('"production-ios"'), "Render Lab must define production-ios mode.", failures);
  assertCondition(pageSource.includes("productionParity"), "Render Lab must pass production parity options to the iframe.", failures);
  assertCondition(
    pageSource.includes("Backend latest, randomized-stable-unlocked, root CSS only, no overrides"),
    "Render Lab Production iOS mode must describe the production parity contract.",
    failures,
  );
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(usage());
    return;
  }

  const explicitBundleDir = args.find((arg) => !arg.startsWith("-"));
  const bundleDir = explicitBundleDir ? path.resolve(explicitBundleDir) : defaultBundleDir;
  const failures = [];

  const [rendererCss, rendererJs, styleAvailabilityText] = await Promise.all([
    readRequired(path.join(bundleDir, "renderer.css"), failures),
    readRequired(path.join(bundleDir, "renderer.js"), failures),
    readRequired(path.join(bundleDir, "renderer_style_availability.json"), failures),
  ]);

  const normalizedCss = normalizeCss(rendererCss);
  assertCondition(!/(^|\n)\s*@import\s+/m.test(normalizedCss), "renderer.css must be flattened and contain no @import rules.", failures);
  assertNeutralPseudoElementBlocks(normalizedCss, ".triplet-item::before", failures);
  assertNeutralPseudoElementBlocks(normalizedCss, ".cell-card.triplet-card .triplet-item::before", failures);
  assertNeutralPseudoElementBlocks(
    normalizedCss,
    ".cell-card.triplet-card .relationship-cell.triplet-cell .triplet-item::before",
    failures,
  );

  assertCondition(
    !rendererJs.includes("tripletAssignmentAvailability") &&
      !rendererJs.includes("tripletRenderAssignmentForSlot") &&
      !rendererJs.includes("triplet-render-assignment"),
    "renderer.js must not contain the special randomized TripletCell layout assignment path.",
    failures,
  );
  assertCondition(
    rendererJs.includes("selectedRelationshipCellStyle(cellType, mode, scenarioStyleKey"),
    "renderer.js must assign TripletCell styles through the normal unlocked relationship style path.",
    failures,
  );

  if (styleAvailabilityText) {
    try {
      assertTripletLayoutAvailability(JSON.parse(styleAvailabilityText), failures);
    } catch (error) {
      failures.push(`renderer_style_availability.json is invalid JSON: ${error?.message || error}`);
    }
  }

  await assertRenderLabProductionMode(failures);

  if (failures.length) {
    console.error(`Renderer parity check failed for ${bundleDir}:`);
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Renderer parity check passed for ${bundleDir}`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});
