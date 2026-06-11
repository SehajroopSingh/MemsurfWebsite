#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const defaultBundleDir = path.join(repoRoot, "public", "renderer-workbench", "current", "bundle");

const preferredSharedCssOrder = [
  "tokens.css",
  "document.css",
  "layout.css",
  "card-shell.css",
  "sequence.css",
  "responsive.css",
];

const finalSharedCssOrder = [
  "universal-cell-edges.css",
];

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

const cssImportPattern = /@import\s+(?:url\(\s*)?["']([^"')]+)["']\s*\)?\s*;/g;

function normalizeCssText(css) {
  return String(css || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

async function maybeReadDirectory(directory) {
  try {
    return await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

function orderByPreferred(preferredOrder) {
  return (left, right) => {
    const leftRank = preferredOrder.indexOf(left);
    const rightRank = preferredOrder.indexOf(right);
    const normalizedLeftRank = leftRank === -1 ? Number.MAX_SAFE_INTEGER : leftRank;
    const normalizedRightRank = rightRank === -1 ? Number.MAX_SAFE_INTEGER : rightRank;
    if (normalizedLeftRank !== normalizedRightRank) {
      return normalizedLeftRank - normalizedRightRank;
    }
    return left.localeCompare(right);
  };
}

async function listSharedEntrypoints(bundleDir) {
  const entries = await maybeReadDirectory(path.join(bundleDir, "shared"));
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".css"))
    .map((entry) => entry.name);
  const finalFiles = files
    .filter((file) => finalSharedCssOrder.includes(file))
    .sort(orderByPreferred(finalSharedCssOrder));
  const leadingFiles = files
    .filter((file) => !finalSharedCssOrder.includes(file))
    .sort(orderByPreferred(preferredSharedCssOrder));
  return {
    leading: leadingFiles.map((file) => `shared/${file}`),
    final: finalFiles.map((file) => `shared/${file}`),
  };
}

async function listCellEntrypoints(bundleDir) {
  const cellsRoot = path.join(bundleDir, "cells");
  const entries = await maybeReadDirectory(cellsRoot);
  const cellFolders = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const indexPath = path.join(cellsRoot, entry.name, "index.css");
    try {
      await readFile(indexPath, "utf8");
      cellFolders.push(entry.name);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return cellFolders
    .sort(orderByPreferred(preferredCellOrder))
    .map((folder) => `cells/${folder}/index.css`);
}

function resolveImportPath(sourceRelativePath, importPath) {
  const fileImportPath = importPath.split(/[?#]/, 1)[0];
  if (!fileImportPath.startsWith(".")) {
    throw new Error(`Only relative CSS imports can be flattened: ${importPath}`);
  }
  const sourceDirectory = path.posix.dirname(sourceRelativePath);
  const resolved = path.posix.normalize(path.posix.join(sourceDirectory, fileImportPath));
  if (resolved.startsWith("../") || resolved === "..") {
    throw new Error(`CSS import escapes the bundle directory: ${sourceRelativePath} -> ${importPath}`);
  }
  return resolved;
}

async function flattenCssFile(bundleDir, relativePath, stack = []) {
  if (stack.includes(relativePath)) {
    throw new Error(`Circular CSS import detected: ${[...stack, relativePath].join(" -> ")}`);
  }
  const filePath = path.join(bundleDir, ...relativePath.split("/"));
  const css = normalizeCssText(await readFile(filePath, "utf8"));
  let output = "";
  let lastIndex = 0;
  for (const match of css.matchAll(cssImportPattern)) {
    const importPath = match[1];
    const resolvedPath = resolveImportPath(relativePath, importPath);
    output += css.slice(lastIndex, match.index);
    output += await flattenCssFile(bundleDir, resolvedPath, [...stack, relativePath]);
    lastIndex = match.index + match[0].length;
  }
  output += css.slice(lastIndex);
  return `/* begin import: ${relativePath} */\n${output.trimEnd()}\n/* end import: ${relativePath} */`;
}

export async function rendererCssEntrypoints(bundleDir = defaultBundleDir) {
  const shared = await listSharedEntrypoints(bundleDir);
  const cells = await listCellEntrypoints(bundleDir);
  return [...shared.leading, ...cells, ...shared.final];
}

export async function buildFlattenedRendererCss(bundleDir = defaultBundleDir) {
  const entrypoints = await rendererCssEntrypoints(bundleDir);
  if (entrypoints.length === 0) {
    throw new Error(`No CSS entrypoints found in ${bundleDir}`);
  }
  const blocks = [];
  for (const entrypoint of entrypoints) {
    blocks.push(await flattenCssFile(bundleDir, entrypoint));
  }
  return [
    "/* This file is generated from shared/ and cells/ CSS modules. Do not edit directly. */",
    "",
    blocks.join("\n\n"),
    "",
  ].join("\n");
}

export async function writeFlattenedRendererCss(bundleDir = defaultBundleDir) {
  const css = await buildFlattenedRendererCss(bundleDir);
  await writeFile(path.join(bundleDir, "renderer.css"), css, "utf8");
  return css;
}

export async function assertFlattenedRendererCss(bundleDir = defaultBundleDir) {
  const rendererPath = path.join(bundleDir, "renderer.css");
  const [expected, actual] = await Promise.all([
    buildFlattenedRendererCss(bundleDir),
    readFile(rendererPath, "utf8").then(normalizeCssText),
  ]);
  if (actual !== expected) {
    throw new Error(`renderer.css is stale. Run: node scripts/renderer-bundle-css.mjs --write ${path.relative(repoRoot, bundleDir)}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes("--write");
  const check = args.includes("--check");
  const explicitBundleDir = args.find((arg) => !arg.startsWith("--"));
  const bundleDir = explicitBundleDir ? path.resolve(explicitBundleDir) : defaultBundleDir;

  if (write && check) {
    throw new Error("Use either --write or --check, not both.");
  }
  if (write) {
    await writeFlattenedRendererCss(bundleDir);
    console.log(`Wrote ${path.join(bundleDir, "renderer.css")}`);
    return;
  }
  if (check) {
    await assertFlattenedRendererCss(bundleDir);
    console.log(`renderer.css is current for ${bundleDir}`);
    return;
  }
  process.stdout.write(await buildFlattenedRendererCss(bundleDir));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
}
