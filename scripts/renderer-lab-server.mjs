#!/usr/bin/env node

import crypto from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const workbenchRoot = path.join(repoRoot, "public", "renderer-workbench");
const currentDir = path.join(workbenchRoot, "current");
const libraryDir = path.join(workbenchRoot, "library");
const draftsDir = path.join(workbenchRoot, "drafts");
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

async function writeWorkbenchManifest(workbenchDir, { version, catalogEntryCount = 0 }) {
  const capabilities = await readJson(path.join(workbenchDir, "bundle", "capabilities.json"));
  const manifest = {
    source: "local-workbench",
    renderer_id: "dynamic_gridcell",
    version,
    schema_version: "three_step_gridcell_v1",
    entrypoint: "index.html",
    bundle_base_path: "/renderer-workbench/current/bundle/",
    catalog_path: "/renderer-workbench/current/catalog.json",
    style_availability_path: "/renderer-workbench/current/bundle/renderer_style_availability.json",
    editable_files: [
      "public/renderer-workbench/current/bundle/renderer.js",
      "public/renderer-workbench/current/bundle/renderer.css",
      "public/renderer-workbench/current/bundle/renderer_style_availability.json",
      "public/renderer-workbench/current/catalog.json",
    ],
    catalog_entry_count: catalogEntryCount,
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
  await writeJson(availabilityPath, availability);
  await writeJson(catalogPath, catalog);
  await writeJson(capabilitiesPath, capabilities);
  await writeFile(indexPath, indexHTMLWithAvailability(await readFile(indexPath, "utf8"), availability), "utf8");
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
    if (request.method === "GET" && url.pathname === "/health") {
      jsonResponse(response, 200, { ok: true, root: workbenchRoot });
      return;
    }
    if (request.method === "GET" && url.pathname === "/bundles") {
      jsonResponse(response, 200, await listBundles());
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

createServer(route).listen(port, host, () => {
  console.log(`Renderer lab server listening at http://${host}:${port}`);
});
