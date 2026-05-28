"use client";

import JSZip from "jszip";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  DownloadCloud,
  Grid2X2,
  Lock,
  MonitorSmartphone,
  Moon,
  RefreshCw,
  RotateCcw,
  Save,
  Smartphone,
  Sun,
  Unlock,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Device = "iphone" | "android";
type Theme = "light" | "dark";
type RendererSource = "local" | "backend";
type BundleKind = "current" | "library" | "draft";
type LabMode = "catalog" | "real-lessons";

type RendererManifest = {
  source?: string;
  renderer_id: string;
  version: string;
  schema_version: string;
  bundle_endpoint?: string;
  bundle_base_path?: string;
  catalog_path?: string;
  style_availability_path?: string;
  extra_stylesheet_paths?: string[];
  bundle_sha256?: string;
  bundle_size_bytes?: number;
};

type RendererPayload = {
  renderer_id: string;
  schema_version: string;
  version?: string;
  stylePolicy: "first-only" | "preview";
  style_policy?: "first-only" | "preview";
  theme: Theme;
  showScenarioTitles?: boolean;
  scenarios: Array<Record<string, unknown>>;
};

type CatalogEntry = {
  id: string;
  group: string;
  label: string;
  cell_type: string;
  render_mode: string;
  layout_id?: string;
  layout_label?: string;
  layout_kind?: string;
  style_group_id?: string;
  style_id?: string;
  style_label?: string;
  is_locked?: boolean;
  default_style_id?: string;
  style_key?: string;
  relationship_mode?: string;
  render_mode_token?: string;
  payload: RendererPayload;
};

type StyleAvailabilityStyle = {
  style_id: string;
  label: string;
  is_locked: boolean;
  real_lesson_enabled: boolean;
};

type StyleAvailabilityGroup = {
  group_id: string;
  cell_type: string;
  layout_id: string;
  layout_label: string;
  layout_kind: string;
  style_key: string;
  relationship_mode?: string;
  render_mode?: string;
  is_locked: boolean;
  default_style_id: string;
  styles: StyleAvailabilityStyle[];
};

type RendererStyleAvailability = {
  schema_version: string;
  renderer_id: string;
  version: string;
  groups: StyleAvailabilityGroup[];
};

type RendererCatalog = {
  renderer_id: string;
  version: string;
  schema_version: string;
  stylePolicy: "first-only" | "preview";
  style_policy?: "first-only" | "preview";
  style_availability_path?: string;
  style_availability?: RendererStyleAvailability;
  entry_count: number;
  entries: CatalogEntry[];
};

type RealLessonModule = {
  id: number;
  module_reference?: string;
  title?: string;
  order?: number;
  overview?: string;
  content?: unknown;
  content_raw?: unknown;
  content_schema_version?: string;
  generation_failed?: boolean;
};

type RealLessonPlan = {
  id: number;
  plan_kind?: string;
  plan_summary?: string;
  modules?: RealLessonModule[];
};

type RealLessonSample = {
  quick_capture_id: number;
  source_quick_capture_id?: number;
  title: string;
  preview_text: string;
  classification?: string | null;
  lesson_plan?: RealLessonPlan | null;
};

type RealLessonSamplesResponse = {
  renderer_id: string;
  version: string;
  schema_version: string;
  sample_count: number;
  samples: RealLessonSample[];
};

type RealLessonScreenOption = {
  key: string;
  sample: RealLessonSample;
  module: RealLessonModule;
  section: Record<string, unknown>;
  sectionIndex: number;
  screenIndex: number;
  scenario: Record<string, unknown>;
  cellTypes: string[];
  title: string;
  subtitle: string;
};

type RealLessonStats = {
  moduleCount: number;
  sectionCount: number;
  screenCount: number;
  gridcellScreenCount: number;
};

type RendererBundle = {
  rendererCss: string;
  rendererCssHref?: string;
  rendererCssExtraHrefs?: string[];
  rendererJs: string;
  katexCss: string;
  katexCssHref?: string;
  katexJs: string;
  styleAvailability?: RendererStyleAvailability;
};

type WorkbenchBundleItem = {
  id: string;
  kind: BundleKind;
  label: string;
  version: string;
};

type WorkbenchBundleList = {
  current: WorkbenchBundleItem;
  library: WorkbenchBundleItem[];
  drafts: WorkbenchBundleItem[];
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_RENDERER_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.memsurf.com/api"
).replace(/\/$/, "");
const RENDERER_LAB_API_URL = (process.env.NEXT_PUBLIC_RENDERER_LAB_API_URL || "http://127.0.0.1:8765").replace(/\/$/, "");
const SITE_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const WORKBENCH_BASE_PATH = "/renderer-workbench/current";
const HIDDEN_TRIPLET_RELATIONSHIP_MODES = new Set([
  "cause_mechanism_effect",
  "input_process_output",
  "problem_method_result",
  "claim_evidence_implication",
  "trigger_response_outcome",
  "before_change_after",
]);
const PAIR_VISUAL_RENDER_MODES = [
  {
    id: "divider",
    label: "Divider mode",
    baseRelation: "contrast",
    relations: ["parallel_examples", "contrast", "example_nonexample"],
  },
  {
    id: "flowline",
    label: "Flowline mode",
    baseRelation: "cause_effect",
    relations: ["before_after", "problem_solution", "cause_effect"],
  },
  {
    id: "support",
    label: "Support mode",
    baseRelation: "claim_evidence",
    relations: ["claim_evidence"],
  },
];

const DEVICE_FRAMES: Record<Device, { label: string; width: number; height: number; icon: typeof Smartphone }> = {
  iphone: { label: "iPhone", width: 393, height: 852, icon: Smartphone },
  android: { label: "Android", width: 412, height: 915, icon: MonitorSmartphone },
};

function apiUrl(path: string) {
  const normalizedPath = path.replace(/^\//, "");
  const explicitlyProxy = process.env.NEXT_PUBLIC_RENDERER_API_PROXY === "1";
  const explicitlyDirect = process.env.NEXT_PUBLIC_RENDERER_API_PROXY === "0";
  const isLocalLab =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const shouldProxy =
    !explicitlyDirect &&
    (explicitlyProxy || (isLocalLab && API_BASE_URL === "https://api.memsurf.com/api"));
  if (shouldProxy) {
    return `${RENDERER_LAB_API_URL}/django-proxy/${normalizedPath}`;
  }
  return `${API_BASE_URL}/${normalizedPath}`;
}

function labApiUrl(path: string) {
  return `${RENDERER_LAB_API_URL}/${path.replace(/^\//, "")}`;
}

function layoutExpansionKey(group: string, layoutId: string) {
  return `${group}::${layoutId}`;
}

function assetUrl(path: string) {
  return `${SITE_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

function absoluteAssetUrl(path: string) {
  const url = assetUrl(path);
  if (typeof window === "undefined") return url;
  return new URL(url, window.location.origin).toString();
}

function withCacheBust(url: string, token: number) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${token}`;
}

function scriptSafe(value: string) {
  return value.replace(/<\/script/gi, "<\\/script");
}

function styleSafe(value: string) {
  return value.replace(/<\/style/gi, "<\\/style");
}

function attrSafe(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function jsonForScript(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function mimeForFont(path: string) {
  if (path.endsWith(".woff2")) return "font/woff2";
  if (path.endsWith(".woff")) return "font/woff";
  if (path.endsWith(".ttf")) return "font/ttf";
  return "application/octet-stream";
}

async function rewriteKatexFontUrls(zip: JSZip, css: string) {
  const fontPaths = Array.from(css.matchAll(/url\((?:["']?)fonts\/([^)"']+)(?:["']?)\)/g)).map(
    (match) => `fonts/${match[1]}`,
  );
  const uniqueFontPaths = Array.from(new Set(fontPaths));
  const replacements = new Map<string, string>();

  await Promise.all(
    uniqueFontPaths.map(async (fontPath) => {
      const fontFile = zip.file(fontPath);
      if (!fontFile) return;
      const base64 = await fontFile.async("base64");
      replacements.set(fontPath, `url(data:${mimeForFont(fontPath)};base64,${base64})`);
    }),
  );

  return css.replace(/url\((?:["']?)fonts\/([^)"']+)(?:["']?)\)/g, (_match, fontName) => {
    return replacements.get(`fonts/${fontName}`) || _match;
  });
}

function cssImportPath(fromPath: string, importPath: string) {
  if (
    importPath.startsWith("/") ||
    importPath.startsWith("#") ||
    /^[a-z][a-z0-9+.-]*:/i.test(importPath)
  ) {
    return null;
  }

  const baseParts = fromPath.split("/").slice(0, -1);
  const parts = [...baseParts, ...importPath.split("/")];
  const resolved: string[] = [];
  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") {
      resolved.pop();
      continue;
    }
    resolved.push(part);
  }
  return resolved.join("/");
}

async function resolveZipCssImports(
  zip: JSZip,
  cssPath: string,
  css: string,
  seen = new Set<string>(),
): Promise<string> {
  if (seen.has(cssPath)) return css;
  const nextSeen = new Set(seen);
  nextSeen.add(cssPath);
  const importPattern = /@import\s+(?:url\(\s*)?(?:"([^"]+)"|'([^']+)')\s*\)?\s*([^;]*);/g;
  let resolvedCss = "";
  let lastIndex = 0;
  for (const match of css.matchAll(importPattern)) {
    const importPath = match[1] || match[2] || "";
    const importOptions = match[3]?.trim();
    const importStart = match.index || 0;
    resolvedCss += css.slice(lastIndex, importStart);

    const zipPath = importOptions ? null : cssImportPath(cssPath, importPath);
    const importedFile = zipPath ? zip.file(zipPath) : null;
    if (!zipPath || !importedFile || nextSeen.has(zipPath)) {
      resolvedCss += match[0];
    } else {
      const importedCss = await importedFile.async("string");
      resolvedCss += `\n${await resolveZipCssImports(zip, zipPath, importedCss, nextSeen)}\n`;
    }
    lastIndex = importStart + match[0].length;
  }
  return resolvedCss + css.slice(lastIndex);
}

async function loadBundle(buffer: ArrayBuffer): Promise<RendererBundle> {
  const zip = await JSZip.loadAsync(buffer);
  const rendererCssFile = zip.file("renderer.css");
  const rendererJsFile = zip.file("renderer.js");
  const katexCssFile = zip.file("katex.min.css");
  const katexJsFile = zip.file("katex.min.js");
  const styleAvailabilityFile = zip.file("renderer_style_availability.json");

  if (!rendererCssFile || !rendererJsFile || !katexCssFile || !katexJsFile) {
    throw new Error("Renderer bundle is missing required JS/CSS assets.");
  }

  const [rendererCssRaw, rendererJs, katexCssRaw, katexJs, styleAvailabilityText] = await Promise.all([
    rendererCssFile.async("string"),
    rendererJsFile.async("string"),
    katexCssFile.async("string"),
    katexJsFile.async("string"),
    styleAvailabilityFile?.async("string") || Promise.resolve(""),
  ]);

  const rendererCss = await resolveZipCssImports(zip, "renderer.css", rendererCssRaw);
  const katexCss = await rewriteKatexFontUrls(zip, katexCssRaw);
  const styleAvailability = styleAvailabilityText
    ? (JSON.parse(styleAvailabilityText) as RendererStyleAvailability)
    : undefined;

  return { rendererCss, rendererJs, katexCss, katexJs, styleAvailability };
}

function rewriteStaticKatexFontUrls(css: string, bundleBasePath: string, cacheToken: number) {
  const normalizedBase = bundleBasePath.replace(/\/$/, "");
  return css.replace(/url\((?:["']?)fonts\/([^)"']+)(?:["']?)\)/g, (_match, fontName) => {
    const fontUrl = withCacheBust(assetUrl(`${normalizedBase}/fonts/${fontName}`), cacheToken);
    return `url("${fontUrl}")`;
  });
}

async function fetchTextAsset(path: string, cacheToken: number) {
  const response = await fetch(withCacheBust(assetUrl(path), cacheToken), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${path} request failed with HTTP ${response.status}.`);
  }
  return response.text();
}

async function loadWorkbenchBundle(manifest: RendererManifest, cacheToken: number): Promise<RendererBundle> {
  const bundleBasePath = manifest.bundle_base_path || `${WORKBENCH_BASE_PATH}/bundle/`;
  const normalizedBase = bundleBasePath.replace(/\/$/, "");
  const availabilityPath = manifest.style_availability_path?.startsWith("/")
    ? manifest.style_availability_path
    : `${normalizedBase}/${manifest.style_availability_path || "renderer_style_availability.json"}`;
  const rendererCssHref = withCacheBust(absoluteAssetUrl(`${normalizedBase}/renderer.css`), cacheToken);
  const rendererCssExtraHrefs = (manifest.extra_stylesheet_paths || []).map((stylesheetPath) => {
    const resolvedPath = stylesheetPath.startsWith("/") ? stylesheetPath : `${normalizedBase}/${stylesheetPath}`;
    return withCacheBust(absoluteAssetUrl(resolvedPath), cacheToken);
  });
  const [rendererJs, katexCssRaw, katexJs, styleAvailabilityText] = await Promise.all([
    fetchTextAsset(`${normalizedBase}/renderer.js`, cacheToken),
    fetchTextAsset(`${normalizedBase}/katex.min.css`, cacheToken),
    fetchTextAsset(`${normalizedBase}/katex.min.js`, cacheToken),
    fetchTextAsset(availabilityPath, cacheToken),
  ]);

  return {
    rendererCss: "",
    rendererCssHref,
    rendererCssExtraHrefs,
    rendererJs,
    katexCss: rewriteStaticKatexFontUrls(katexCssRaw, bundleBasePath, cacheToken),
    katexJs,
    styleAvailability: JSON.parse(styleAvailabilityText) as RendererStyleAvailability,
  };
}

function payloadWithTheme(payload: RendererPayload, theme: Theme): RendererPayload {
  const stylePolicy = payload.stylePolicy === "preview" || payload.style_policy === "preview" ? "preview" : "first-only";
  return {
    ...payload,
    theme,
    stylePolicy,
    style_policy: stylePolicy,
  };
}

function combinedPayload(entries: CatalogEntry[], theme: Theme): RendererPayload {
  const first = entries[0]?.payload;
  const stylePolicy = entries.some((entry) => entry.payload.stylePolicy === "preview" || entry.payload.style_policy === "preview")
    ? "preview"
    : "first-only";
  return {
    renderer_id: first?.renderer_id || "dynamic_gridcell",
    schema_version: first?.schema_version || "three_step_gridcell_v1",
    version: first?.version,
    stylePolicy,
    style_policy: stylePolicy,
    theme,
    showScenarioTitles: true,
    scenarios: entries.flatMap((entry) =>
      entry.payload.scenarios.map((scenario) => ({
        ...scenario,
        title: `${entry.cell_type}: ${entry.label}`,
        subtitle: entry.render_mode || entry.group,
      })),
    ),
  };
}

function payloadWithForcedStyle(
  basePayload: RendererPayload,
  styleKey: string,
  styleId: string,
  title: string,
  subtitle: string,
): RendererPayload {
  const payload = JSON.parse(JSON.stringify(basePayload)) as RendererPayload;
  payload.stylePolicy = "preview";
  payload.style_policy = "preview";
  payload.showScenarioTitles = true;

  const scenario = payload.scenarios[0] as { title?: string; subtitle?: string; slots?: Array<Record<string, unknown>> } | undefined;
  if (scenario) {
    scenario.title = title;
    scenario.subtitle = subtitle;
    const slot = Array.isArray(scenario.slots) ? scenario.slots[0] : undefined;
    if (slot) {
      slot[styleKey] = styleId;
    }
  }

  return payload;
}

function payloadWithScenarioMetadata(basePayload: RendererPayload, title: string, subtitle: string): RendererPayload {
  const payload = JSON.parse(JSON.stringify(basePayload)) as RendererPayload;
  payload.showScenarioTitles = true;

  const scenario = payload.scenarios[0] as { title?: string; subtitle?: string } | undefined;
  if (scenario) {
    scenario.title = title;
    scenario.subtitle = subtitle;
  }

  return payload;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordValue(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

function arrayRecords(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function stringValue(value: unknown, fallback = "") {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return fallback;
}

function moduleContent(module: RealLessonModule) {
  return recordValue(module.content_raw) || recordValue(module.content) || {};
}

function sectionsForModule(module: RealLessonModule) {
  return arrayRecords(moduleContent(module).sections);
}

function screensForSection(section: Record<string, unknown>) {
  const screens = arrayRecords(section.screens);
  if (screens.length) return screens;
  const screen = recordValue(section.screen);
  return screen ? [screen] : [];
}

function primaryComponentForScreen(screen: Record<string, unknown>) {
  return recordValue(screen.primary_component) || recordValue(screen.primaryComponent);
}

function layoutGridSlots(primaryComponent: Record<string, unknown>) {
  const content = recordValue(primaryComponent.content);
  const contentSlots = content ? arrayRecords(content.slots) : [];
  if (contentSlots.length) return contentSlots;
  return arrayRecords(primaryComponent.slots);
}

function layoutGridDefinition(primaryComponent: Record<string, unknown>) {
  const content = recordValue(primaryComponent.content);
  return (
    (content ? recordValue(content.grid) : null) ||
    recordValue(primaryComponent.grid) ||
    { rows: 20, cols: 10 }
  );
}

function scenarioFromRealLessonScreen(
  sample: RealLessonSample,
  module: RealLessonModule,
  section: Record<string, unknown>,
  sectionIndex: number,
  screen: Record<string, unknown>,
  screenIndex: number,
): RealLessonScreenOption | null {
  const primaryComponent = primaryComponentForScreen(screen);
  const primaryType = stringValue(primaryComponent?.type).toLowerCase();
  if (!primaryComponent || (primaryType !== "layoutgrid" && primaryType !== "layout_grid")) {
    return null;
  }

  const rawSlots = layoutGridSlots(primaryComponent);
  if (!rawSlots.length) return null;

  const slots = rawSlots.map((slot, slotIndex) => {
    const cellType = stringValue(slot.cell_type ?? slot.type, "TextCell");
    return {
      ...slot,
      slot_id: stringValue(slot.slot_id ?? slot.id, `slot_${slotIndex + 1}`),
      cell_type: cellType,
      props: recordValue(slot.props) || {},
      content: slot.content ?? {},
    };
  });
  const cellTypes = Array.from(new Set(slots.map((slot) => stringValue(slot.cell_type, "Cell"))));
  const sectionTitle = stringValue(
    section.section_title ?? section.title ?? section.section_reference,
    `Section ${sectionIndex + 1}`,
  );
  const screenTitle = stringValue(
    screen.title ?? screen.screen_title ?? screen.screen_explanation ?? screen.screenExplanation,
    `Screen ${screenIndex + 1}`,
  );
  const moduleTitle = stringValue(module.title, `Module ${module.order || module.id}`);
  const supportingComponents = arrayRecords(screen.supporting_components ?? screen.supportingComponents);

  return {
    key: `${sample.quick_capture_id}:${module.id}:${sectionIndex}:${screenIndex}`,
    sample,
    module,
    section,
    sectionIndex,
    screenIndex,
    cellTypes,
    title: `${moduleTitle} - ${sectionTitle}`,
    subtitle: `${screenTitle} - ${cellTypes.join(", ")}`,
    scenario: {
      title: `${moduleTitle}: ${sectionTitle}`,
      subtitle: screenTitle,
      screenExplanation: stringValue(
        screen.screen_explanation ?? screen.screenExplanation ?? section.section_goal,
        stringValue(sample.preview_text, "Real lesson sample"),
      ),
      grid: layoutGridDefinition(primaryComponent),
      slots,
      supportingComponents,
    },
  };
}

function realLessonScreenOptions(sample: RealLessonSample) {
  const modules = sample.lesson_plan?.modules || [];
  return modules.flatMap((module) =>
    sectionsForModule(module).flatMap((section, sectionIndex) =>
      screensForSection(section)
        .map((screen, screenIndex) =>
          scenarioFromRealLessonScreen(sample, module, section, sectionIndex, screen, screenIndex),
        )
        .filter((option): option is RealLessonScreenOption => option !== null),
    ),
  );
}

function realLessonSampleStats(sample: RealLessonSample): RealLessonStats {
  const modules = sample.lesson_plan?.modules || [];
  let sectionCount = 0;
  let screenCount = 0;
  for (const module of modules) {
    const sections = sectionsForModule(module);
    sectionCount += sections.length;
    screenCount += sections.reduce((total, section) => total + screensForSection(section).length, 0);
  }
  return {
    moduleCount: modules.length,
    sectionCount,
    screenCount,
    gridcellScreenCount: realLessonScreenOptions(sample).length,
  };
}

function realLessonRendererPayload(
  option: RealLessonScreenOption,
  theme: Theme,
  manifest: RendererManifest | null,
  sampleLessons: RealLessonSamplesResponse | null,
): RendererPayload {
  return {
    renderer_id: manifest?.renderer_id || sampleLessons?.renderer_id || "dynamic_gridcell",
    schema_version: manifest?.schema_version || sampleLessons?.schema_version || "three_step_gridcell_v1",
    version: manifest?.version || sampleLessons?.version,
    stylePolicy: "first-only",
    style_policy: "first-only",
    theme,
    showScenarioTitles: false,
    scenarios: [option.scenario],
  };
}

function pairVisualCatalogEntries(entries: CatalogEntry[]): CatalogEntry[] {
  const pairEntries = entries.filter((entry) => entry.cell_type === "PairCell");
  if (!pairEntries.length) return [];

  const baseEntriesByRelation = new Map<string, CatalogEntry>();
  const styleEntriesByRelation = new Map<string, CatalogEntry[]>();

  for (const entry of pairEntries) {
    if (!entry.style_id) {
      baseEntriesByRelation.set(entry.render_mode, entry);
      continue;
    }
    if (entry.layout_kind === "relationship_mode" && entry.relationship_mode) {
      const styleEntries = styleEntriesByRelation.get(entry.relationship_mode) || [];
      styleEntries.push(entry);
      styleEntriesByRelation.set(entry.relationship_mode, styleEntries);
    }
  }

  return PAIR_VISUAL_RENDER_MODES.flatMap((mode) => {
    const modeEntries: CatalogEntry[] = [];
    const baseEntry = baseEntriesByRelation.get(mode.baseRelation) ||
      mode.relations.map((relation) => baseEntriesByRelation.get(relation)).find(Boolean);

    if (baseEntry) {
      const label = mode.label.replace(/ mode$/, "");
      modeEntries.push({
        ...baseEntry,
        id: `pair-${mode.id}`,
        label,
        render_mode: mode.id,
        layout_id: mode.id,
        layout_label: mode.label,
        layout_kind: "pair_visual_mode",
        payload: payloadWithScenarioMetadata(baseEntry.payload, `PairCell: ${label}`, "Pair visual render mode"),
      });
    }

    for (const relation of mode.relations) {
      const styleEntries = styleEntriesByRelation.get(relation) || [];
      for (const entry of styleEntries) {
        const styleLabel = entry.style_label || entry.label;
        modeEntries.push({
          ...entry,
          id: `${entry.id}-${mode.id}`,
          render_mode: mode.id,
          layout_id: mode.id,
          layout_label: mode.label,
          layout_kind: "pair_visual_mode",
          render_mode_token: mode.id,
          payload: payloadWithScenarioMetadata(
            entry.payload,
            `PairCell: ${mode.label} - ${styleLabel}`,
            "Backend-owned visual render mode preview",
          ),
        });
      }
    }

    return modeEntries;
  });
}

function catalogEntriesWithRenderModeStyles(entries: CatalogEntry[]): CatalogEntry[] {
  const pairEntries = pairVisualCatalogEntries(entries);
  let didInsertPairEntries = false;
  const visibleEntries = entries.flatMap((entry) => {
    if (entry.cell_type === "PairCell") {
      if (didInsertPairEntries) return [];
      didInsertPairEntries = true;
      return pairEntries;
    }
    if (entry.cell_type === "TripletCell") {
      if (entry.layout_kind === "cell_style") return [];
      if (entry.layout_kind === "relationship_mode") return [];
      if (HIDDEN_TRIPLET_RELATIONSHIP_MODES.has(entry.render_mode || "")) return [];
    }
    return [entry];
  });
  const baseEntriesByCellType = new Map<string, CatalogEntry[]>();
  const cellsWithSpecificStyleGroups = new Set<string>();

  for (const entry of visibleEntries) {
    if (!entry.style_id) {
      const baseEntries = baseEntriesByCellType.get(entry.cell_type) || [];
      baseEntries.push(entry);
      baseEntriesByCellType.set(entry.cell_type, baseEntries);
    } else if (entry.layout_kind && entry.layout_kind !== "cell_style") {
      cellsWithSpecificStyleGroups.add(entry.cell_type);
    }
  }

  return visibleEntries.flatMap((entry) => {
    if (!entry.style_id || entry.layout_kind !== "cell_style" || cellsWithSpecificStyleGroups.has(entry.cell_type)) {
      return [entry];
    }

    const baseEntries = baseEntriesByCellType.get(entry.cell_type) || [];
    if (baseEntries.length === 0) {
      return [entry];
    }

    const styleId = entry.style_id;

    return baseEntries.map((baseEntry) => {
      const renderMode = baseEntry.render_mode || baseEntry.id;
      const styleKey = entry.style_key || "preview_cell_style";
      const styleLabel = entry.style_label || entry.label;
      const layoutLabel = baseEntry.render_mode || baseEntry.label || entry.layout_label || "Default mode";
      return {
        ...entry,
        id: `${entry.id}-${renderMode}`.replace(/[^a-zA-Z0-9_-]/g, "-"),
        render_mode: renderMode,
        layout_id: renderMode,
        layout_label: layoutLabel,
        render_mode_token: renderMode,
        payload: payloadWithForcedStyle(
          baseEntry.payload,
          styleKey,
          styleId,
          `${entry.cell_type}: ${layoutLabel} - ${styleLabel}`,
          "Backend-owned style availability preview",
        ),
      };
    });
  });
}

function prettyJson(payload: RendererPayload) {
  return JSON.stringify(payload, null, 2);
}

function buildIframeDocument(bundle: RendererBundle, payload: RendererPayload, cssOverride: string) {
  const katexStylesheet = bundle.katexCssHref
    ? `<link rel="stylesheet" href="${attrSafe(bundle.katexCssHref)}" />`
    : `<style>${styleSafe(bundle.katexCss)}</style>`;
  const rendererStylesheet = bundle.rendererCssHref
    ? `<link rel="stylesheet" href="${attrSafe(bundle.rendererCssHref)}" />`
    : `<style>${styleSafe(bundle.rendererCss)}</style>`;
  const rendererExtraStylesheets = (bundle.rendererCssExtraHrefs || [])
    .map((href) => `<link rel="stylesheet" href="${attrSafe(href)}" />`)
    .join("\n  ");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  ${katexStylesheet}
  ${rendererStylesheet}
  ${rendererExtraStylesheets}
  <style>
    html, body { min-height: 100%; margin: 0; }
    body { background: ${payload.theme === "dark" ? "#06111d" : "#eef5fb"}; }
    #grid-layout-root { max-width: var(--page-max-width); margin: 0 auto; padding: 0 var(--gridcell-root-edge); }
    .scenario-shell { padding-left: 0; padding-right: 0; }
    ${styleSafe(cssOverride)}
  </style>
</head>
<body>
  <div id="grid-layout-root"></div>
  <script id="grid-layout-data" type="application/json">${jsonForScript(payload)}</script>
  <script id="renderer-style-availability-data" type="application/json">${jsonForScript(bundle.styleAvailability || {})}</script>
  <script>${scriptSafe(bundle.katexJs)}</script>
  <script>${scriptSafe(bundle.rendererJs)}</script>
</body>
</html>`;
}

async function postWorkbenchAction(path: string, payload: Record<string, unknown> = {}) {
  const response = await fetch(labApiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || `${path} failed with HTTP ${response.status}.`);
  }
  return data;
}

type RealLessonsPanelProps = {
  sampleLessons: RealLessonSamplesResponse | null;
  isLoading: boolean;
  error: string;
  selectedSampleId: number | null;
  selectedScreenKey: string;
  onSelectSample: (sampleId: number) => void;
  onSelectScreen: (screenKey: string) => void;
};

function RealLessonsPanel({
  sampleLessons,
  isLoading,
  error,
  selectedSampleId,
  selectedScreenKey,
  onSelectSample,
  onSelectScreen,
}: RealLessonsPanelProps) {
  const samples = sampleLessons?.samples || [];
  const selectedSample = samples.find((sample) => sample.quick_capture_id === selectedSampleId) || samples[0] || null;
  const selectedStats = selectedSample ? realLessonSampleStats(selectedSample) : null;
  const selectedOptions = selectedSample ? realLessonScreenOptions(selectedSample) : [];
  const modules = selectedSample?.lesson_plan?.modules || [];

  return (
    <>
      <div className="flex items-center justify-between border-b border-[#e1e8ee] px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-[#17212b]">Real Lessons</h2>
          <p className="text-xs text-[#6c7d89]">
            {sampleLessons ? `${sampleLessons.sample_count} reserved samples` : "Loading example captures"}
          </p>
        </div>
        <BookOpen className="h-4 w-4 text-[#6c7d89]" />
      </div>
      <div className="max-h-[calc(100vh-315px)] overflow-y-auto px-3 py-3">
        {isLoading ? <div className="px-1 py-3 text-sm text-[#6c7d89]">Loading sample lessons...</div> : null}
        {error ? (
          <div className="mb-3 rounded-md border border-[#f0b6b6] bg-[#fff3f3] px-3 py-2 text-xs text-[#8a2525]">{error}</div>
        ) : null}
        <div className="space-y-2">
          {samples.map((sample) => {
            const stats = realLessonSampleStats(sample);
            const isSelected = selectedSample?.quick_capture_id === sample.quick_capture_id;
            return (
              <button
                key={sample.quick_capture_id}
                type="button"
                onClick={() => onSelectSample(sample.quick_capture_id)}
                className={`w-full rounded-md border px-3 py-2 text-left transition ${
                  isSelected
                    ? "border-[#17212b] bg-[#17212b] text-white"
                    : "border-[#dce5ec] bg-[#fbfcfd] text-[#253440] hover:bg-[#eef3f6]"
                }`}
              >
                <span className="block text-sm font-semibold">{sample.title}</span>
                <span className={`mt-1 line-clamp-2 block text-xs ${isSelected ? "text-[#d2dbe3]" : "text-[#6c7d89]"}`}>
                  {sample.preview_text || "Reserved onboarding capture"}
                </span>
                <span className={`mt-2 block text-[10px] font-semibold ${isSelected ? "text-[#d2dbe3]" : "text-[#7b8c98]"}`}>
                  {stats.moduleCount} modules - {stats.gridcellScreenCount} grid screens
                </span>
              </button>
            );
          })}
        </div>

        {selectedSample && selectedStats ? (
          <div className="mt-4 border-t border-[#e1e8ee] pt-4">
            <div className="rounded-md bg-[#f6f9fb] px-3 py-3">
              <div className="text-sm font-semibold text-[#17212b]">{selectedSample.title}</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-[#5b6f7c]">
                <span>Kind: {selectedSample.lesson_plan?.plan_kind || "Unknown"}</span>
                <span>Modules: {selectedStats.moduleCount}</span>
                <span>Sections: {selectedStats.sectionCount}</span>
                <span>Grid screens: {selectedStats.gridcellScreenCount}</span>
              </div>
              {selectedStats.screenCount > selectedStats.gridcellScreenCount ? (
                <p className="mt-2 text-[11px] text-[#8a6d2f]">
                  {selectedStats.screenCount - selectedStats.gridcellScreenCount} non-grid screens skipped.
                </p>
              ) : null}
            </div>

            <div className="mt-3 space-y-3">
              {modules.map((module, moduleIndex) => {
                const moduleSections = sectionsForModule(module);
                const moduleTitle = stringValue(module.title, `Module ${moduleIndex + 1}`);
                return (
                  <div key={module.id || moduleIndex} className="rounded-md border border-[#e1e8ee] bg-white">
                    <div className="border-b border-[#edf2f6] px-3 py-2">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#728390]">
                        Module {moduleIndex + 1}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-[#253440]">{moduleTitle}</div>
                    </div>
                    <div className="space-y-2 px-3 py-3">
                      {moduleSections.map((section, sectionIndex) => {
                        const sectionTitle = stringValue(
                          section.section_title ?? section.title ?? section.section_reference,
                          `Section ${sectionIndex + 1}`,
                        );
                        const sectionOptions = selectedOptions.filter(
                          (option) => option.module.id === module.id && option.sectionIndex === sectionIndex,
                        );
                        return (
                          <div key={`${module.id || moduleIndex}-${sectionIndex}`} className="border-l border-[#dfe7ee] pl-3">
                            <div className="text-xs font-semibold text-[#506676]">{sectionTitle}</div>
                            <div className="mt-2 space-y-1">
                              {sectionOptions.length ? (
                                sectionOptions.map((option) => {
                                  const isSelected = option.key === selectedScreenKey;
                                  return (
                                    <button
                                      key={option.key}
                                      type="button"
                                      onClick={() => onSelectScreen(option.key)}
                                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                                        isSelected
                                          ? "bg-[#17212b] text-white"
                                          : "bg-[#f8fafb] text-[#253440] hover:bg-[#eef3f6]"
                                      }`}
                                    >
                                      <span className="block font-medium">Screen {option.screenIndex + 1}</span>
                                      <span className={`block text-xs ${isSelected ? "text-[#d2dbe3]" : "text-[#718390]"}`}>
                                        {option.cellTypes.join(", ")}
                                      </span>
                                    </button>
                                  );
                                })
                              ) : (
                                <div className="rounded-md bg-[#f8fafb] px-3 py-2 text-xs text-[#7b8c98]">
                                  No LayoutGrid screen in this section.
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : !isLoading ? (
          <div className="mt-4 rounded-md bg-[#f6f9fb] px-3 py-3 text-sm text-[#6c7d89]">
            No reserved sample lessons with gridcell screens were returned.
          </div>
        ) : null}
      </div>
    </>
  );
}

export default function RendererLabPage() {
  const [labMode, setLabMode] = useState<LabMode>("catalog");
  const [source, setSource] = useState<RendererSource>(() => {
    if (typeof window === "undefined") return "local";
    return new URLSearchParams(window.location.search).get("source") === "backend" ? "backend" : "local";
  });
  const [manifest, setManifest] = useState<RendererManifest | null>(null);
  const [catalog, setCatalog] = useState<RendererCatalog | null>(null);
  const [bundle, setBundle] = useState<RendererBundle | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [device, setDevice] = useState<Device>("iphone");
  const [theme, setTheme] = useState<Theme>("light");
  const [showAll, setShowAll] = useState(false);
  const [draftJson, setDraftJson] = useState("");
  const [appliedPayload, setAppliedPayload] = useState<RendererPayload | null>(null);
  const [cssOverride, setCssOverride] = useState("");
  const [error, setError] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const [workbenchApiAvailable, setWorkbenchApiAvailable] = useState(false);
  const [workbenchBundles, setWorkbenchBundles] = useState<WorkbenchBundleList | null>(null);
  const [selectedWorkbenchKey, setSelectedWorkbenchKey] = useState("current:current");
  const [draftName, setDraftName] = useState("");
  const [workbenchMessage, setWorkbenchMessage] = useState("");
  const [isWorkbenchMutating, setIsWorkbenchMutating] = useState(false);
  const [expandedCellGroups, setExpandedCellGroups] = useState<Record<string, boolean>>({});
  const [expandedRenderModes, setExpandedRenderModes] = useState<Record<string, boolean>>({});
  const [sampleLessons, setSampleLessons] = useState<RealLessonSamplesResponse | null>(null);
  const [isSampleLessonsLoading, setIsSampleLessonsLoading] = useState(false);
  const [sampleLessonsError, setSampleLessonsError] = useState("");
  const [selectedSampleId, setSelectedSampleId] = useState<number | null>(null);
  const [selectedRealLessonScreenKey, setSelectedRealLessonScreenKey] = useState("");

  const catalogEntries = useMemo(
    () => catalogEntriesWithRenderModeStyles(catalog?.entries || []),
    [catalog],
  );

  const selectedEntry = useMemo(
    () => catalogEntries.find((entry) => entry.id === selectedId) || catalogEntries[0] || null,
    [catalogEntries, selectedId],
  );

  const selectedSample = useMemo(
    () => sampleLessons?.samples.find((sample) => sample.quick_capture_id === selectedSampleId) || sampleLessons?.samples[0] || null,
    [sampleLessons, selectedSampleId],
  );

  const selectedRealLessonScreenOptions = useMemo(
    () => (selectedSample ? realLessonScreenOptions(selectedSample) : []),
    [selectedSample],
  );

  const selectedRealLessonScreen = useMemo(
    () =>
      selectedRealLessonScreenOptions.find((option) => option.key === selectedRealLessonScreenKey) ||
      selectedRealLessonScreenOptions[0] ||
      null,
    [selectedRealLessonScreenKey, selectedRealLessonScreenOptions],
  );

  const workbenchOptions = useMemo(() => {
    if (!workbenchBundles) return [];
    return [
      workbenchBundles.current,
      ...workbenchBundles.library,
      ...workbenchBundles.drafts,
    ];
  }, [workbenchBundles]);

  const groupedEntries = useMemo(() => {
    const groups = new Map<string, Map<string, { label: string; entries: CatalogEntry[] }>>();
    for (const entry of catalogEntries) {
      const cellGroup = entry.group || entry.cell_type || "Renderer";
      const layoutKey = entry.layout_id || entry.render_mode || "samples";
      const layoutLabel = entry.layout_label || entry.render_mode || "Samples";
      const layouts = groups.get(cellGroup) || new Map<string, { label: string; entries: CatalogEntry[] }>();
      const layout = layouts.get(layoutKey) || { label: layoutLabel, entries: [] };
      layout.entries.push(entry);
      layouts.set(layoutKey, layout);
      groups.set(cellGroup, layouts);
    }
    return Array.from(groups.entries()).map(([group, layouts]) => ({
      group,
      layouts: Array.from(layouts.entries()).map(([layoutId, layout]) => ({
        layoutId,
        ...layout,
      })),
    }));
  }, [catalogEntries]);

  useEffect(() => {
    if (!selectedEntry) return;
    const cellGroup = selectedEntry.group || selectedEntry.cell_type || "Renderer";
    const layoutId = selectedEntry.layout_id || selectedEntry.render_mode || "samples";
    const renderModeKey = layoutExpansionKey(cellGroup, layoutId);

    setExpandedCellGroups((current) => {
      if (current[cellGroup] !== undefined) return current;
      return { ...current, [cellGroup]: true };
    });
    setExpandedRenderModes((current) => {
      if (current[renderModeKey] !== undefined) return current;
      return { ...current, [renderModeKey]: true };
    });
  }, [selectedEntry]);

  const setPayloadDraft = useCallback((payload: RendererPayload) => {
    setAppliedPayload(payload);
    setDraftJson(prettyJson(payload));
    setJsonError("");
  }, []);

  const refreshWorkbenchApi = useCallback(async () => {
    try {
      const [healthResponse, bundlesResponse] = await Promise.all([
        fetch(labApiUrl("health"), { cache: "no-store" }),
        fetch(labApiUrl("bundles"), { cache: "no-store" }),
      ]);
      if (!healthResponse.ok || !bundlesResponse.ok) {
        throw new Error("Renderer lab API unavailable.");
      }
      setWorkbenchApiAvailable(true);
      setWorkbenchBundles((await bundlesResponse.json()) as WorkbenchBundleList);
    } catch {
      setWorkbenchApiAvailable(false);
      setWorkbenchBundles(null);
    }
  }, []);

  useEffect(() => {
    refreshWorkbenchApi();
  }, [refreshWorkbenchApi]);

  useEffect(() => {
    let cancelled = false;

    async function loadRenderer() {
      setIsLoading(true);
      setError("");
      try {
        let nextManifest: RendererManifest;
        let nextBundle: RendererBundle;
        let nextCatalog: RendererCatalog;

        if (source === "local") {
          const manifestResponse = await fetch(
            withCacheBust(assetUrl(`${WORKBENCH_BASE_PATH}/workbench-manifest.json`), reloadToken),
            { cache: "no-store" },
          );
          if (!manifestResponse.ok) {
            throw new Error(`Workbench manifest request failed with HTTP ${manifestResponse.status}.`);
          }
          nextManifest = (await manifestResponse.json()) as RendererManifest;
          const catalogPath = nextManifest.catalog_path || `${WORKBENCH_BASE_PATH}/catalog.json`;
          const [loadedBundle, catalogResponse] = await Promise.all([
            loadWorkbenchBundle(nextManifest, reloadToken),
            fetch(withCacheBust(assetUrl(catalogPath), reloadToken), { cache: "no-store" }),
          ]);
          if (!catalogResponse.ok) {
            throw new Error(`Workbench catalog request failed with HTTP ${catalogResponse.status}.`);
          }
          nextBundle = loadedBundle;
          nextCatalog = (await catalogResponse.json()) as RendererCatalog;
        } else {
          const manifestResponse = await fetch(apiUrl("user-interface/lesson-renderer/preview/manifest/"), {
            cache: "no-store",
          });
          if (!manifestResponse.ok) {
            throw new Error(`Manifest request failed with HTTP ${manifestResponse.status}.`);
          }
          nextManifest = (await manifestResponse.json()) as RendererManifest;
          if (!nextManifest.bundle_endpoint) {
            throw new Error("Backend manifest did not include a bundle endpoint.");
          }

          const [bundleResponse, catalogResponse] = await Promise.all([
            fetch(apiUrl(nextManifest.bundle_endpoint), { cache: "no-store" }),
            fetch(apiUrl("user-interface/lesson-renderer/preview/catalog/"), { cache: "no-store" }),
          ]);

          if (!bundleResponse.ok) {
            throw new Error(`Bundle request failed with HTTP ${bundleResponse.status}.`);
          }
          if (!catalogResponse.ok) {
            throw new Error(`Catalog request failed with HTTP ${catalogResponse.status}.`);
          }

          [nextBundle, nextCatalog] = await Promise.all([
            loadBundle(await bundleResponse.arrayBuffer()),
            catalogResponse.json() as Promise<RendererCatalog>,
          ]);
        }

        if (cancelled) return;

        const firstEntry = nextCatalog.entries[0];
        setManifest(nextManifest);
        setCatalog(nextCatalog);
        setBundle(nextBundle);
        setSelectedId(firstEntry?.id || "");
        setShowAll(false);
        if (firstEntry) {
          setPayloadDraft(payloadWithTheme(firstEntry.payload, "light"));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load renderer lab.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadRenderer();

    return () => {
      cancelled = true;
    };
  }, [reloadToken, setPayloadDraft, source]);

  useEffect(() => {
    if (labMode !== "real-lessons") return;
    let cancelled = false;

    async function loadSampleLessons() {
      setIsSampleLessonsLoading(true);
      setSampleLessonsError("");
      try {
        const response = await fetch(apiUrl("user-interface/lesson-renderer/preview/sample-lessons/"), {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Sample lessons request failed with HTTP ${response.status}.`);
        }
        const nextSampleLessons = (await response.json()) as RealLessonSamplesResponse;
        if (cancelled) return;
        setSampleLessons(nextSampleLessons);
      } catch (sampleError) {
        if (!cancelled) {
          setSampleLessonsError(sampleError instanceof Error ? sampleError.message : "Unable to load sample lessons.");
        }
      } finally {
        if (!cancelled) {
          setIsSampleLessonsLoading(false);
        }
      }
    }

    loadSampleLessons();

    return () => {
      cancelled = true;
    };
  }, [labMode, reloadToken]);

  useEffect(() => {
    if (!sampleLessons?.samples.length) return;
    const hasSelectedSample = sampleLessons.samples.some((sample) => sample.quick_capture_id === selectedSampleId);
    if (!hasSelectedSample) {
      setSelectedSampleId(sampleLessons.samples[0].quick_capture_id);
    }
  }, [sampleLessons, selectedSampleId]);

  useEffect(() => {
    if (!selectedRealLessonScreenOptions.length) {
      setSelectedRealLessonScreenKey("");
      return;
    }
    const hasSelectedScreen = selectedRealLessonScreenOptions.some((option) => option.key === selectedRealLessonScreenKey);
    if (!hasSelectedScreen) {
      setSelectedRealLessonScreenKey(selectedRealLessonScreenOptions[0].key);
    }
  }, [selectedRealLessonScreenKey, selectedRealLessonScreenOptions]);

  useEffect(() => {
    if (labMode !== "real-lessons") return;
    setShowAll(false);
    if (!selectedRealLessonScreen) {
      setAppliedPayload(null);
      setDraftJson("");
      setJsonError("");
      return;
    }
    setPayloadDraft(realLessonRendererPayload(selectedRealLessonScreen, theme, manifest, sampleLessons));
  }, [labMode, manifest, sampleLessons, selectedRealLessonScreen, setPayloadDraft, theme]);

  const activePayload = useMemo(() => {
    if (!appliedPayload) return null;
    return payloadWithTheme(appliedPayload, theme);
  }, [appliedPayload, theme]);

  const iframeDocument = useMemo(() => {
    if (!bundle || !activePayload) return "";
    return buildIframeDocument(bundle, activePayload, cssOverride);
  }, [activePayload, bundle, cssOverride]);

  const handleSelectEntry = (entry: CatalogEntry) => {
    setLabMode("catalog");
    setSelectedId(entry.id);
    setShowAll(false);
    setPayloadDraft(payloadWithTheme(entry.payload, theme));
  };

  const handleShowAll = () => {
    if (!catalogEntries.length) return;
    setLabMode("catalog");
    setShowAll(true);
    setSelectedId("");
    setPayloadDraft(combinedPayload(catalogEntries, theme));
  };

  const toggleCellGroup = (group: string) => {
    setExpandedCellGroups((current) => ({
      ...current,
      [group]: !(current[group] ?? false),
    }));
  };

  const toggleRenderMode = (group: string, layoutId: string) => {
    const renderModeKey = layoutExpansionKey(group, layoutId);
    setExpandedRenderModes((current) => ({
      ...current,
      [renderModeKey]: !(current[renderModeKey] ?? false),
    }));
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(draftJson) as RendererPayload;
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.scenarios)) {
        throw new Error("Payload must be an object with a scenarios array.");
      }
      setAppliedPayload(payloadWithTheme(parsed, theme));
      setJsonError("");
    } catch (parseError) {
      setJsonError(parseError instanceof Error ? parseError.message : "Invalid JSON.");
    }
  };

  const handleResetJson = () => {
    if (labMode === "real-lessons") {
      if (selectedRealLessonScreen) {
        setPayloadDraft(realLessonRendererPayload(selectedRealLessonScreen, theme, manifest, sampleLessons));
      }
      return;
    }
    if (showAll && catalog) {
      setPayloadDraft(combinedPayload(catalogEntries, theme));
      return;
    }
    if (selectedEntry) {
      setPayloadDraft(payloadWithTheme(selectedEntry.payload, theme));
    }
  };

  const runWorkbenchAction = async (action: () => Promise<void>, successMessage: string) => {
    setWorkbenchMessage("");
    setIsWorkbenchMutating(true);
    try {
      await action();
      await refreshWorkbenchApi();
      setSource("local");
      setReloadToken((value) => value + 1);
      setWorkbenchMessage(successMessage);
    } catch (actionError) {
      setWorkbenchMessage(actionError instanceof Error ? actionError.message : "Workbench action failed.");
    } finally {
      setIsWorkbenchMutating(false);
    }
  };

  const handleCopySelectedBundle = () => {
    const [kind, id] = selectedWorkbenchKey.split(":") as [BundleKind, string];
    runWorkbenchAction(
      async () => {
        await postWorkbenchAction("copy-to-current", { kind, id });
      },
      "Copied selected bundle into the current workbench.",
    );
  };

  const handleSaveDraft = () => {
    runWorkbenchAction(
      async () => {
        await postWorkbenchAction("save-draft", { name: draftName || manifest?.version || "renderer-draft" });
      },
      "Saved current workbench as a draft.",
    );
  };

  const handleImportBackendLatest = () => {
    runWorkbenchAction(
      async () => {
        const result = await postWorkbenchAction("import-backend-latest");
        if (result?.bundle?.kind && result?.bundle?.id) {
          setSelectedWorkbenchKey(`${result.bundle.kind}:${result.bundle.id}`);
        }
      },
      "Imported backend latest into the local bundle library.",
    );
  };

  const handleToggleLock = (entry: CatalogEntry) => {
    if (!entry.style_group_id || !entry.style_id) return;
    runWorkbenchAction(
      async () => {
        await postWorkbenchAction("toggle-lock", {
          groupId: entry.style_group_id,
          styleId: entry.style_id,
          locked: !entry.is_locked,
        });
      },
      entry.is_locked ? "Unlocked style for real lessons." : "Locked style for real lessons.",
    );
  };

  const handleSelectLabMode = (nextLabMode: LabMode) => {
    setLabMode(nextLabMode);
    setJsonError("");
    if (nextLabMode === "catalog") {
      if (showAll && catalogEntries.length) {
        setPayloadDraft(combinedPayload(catalogEntries, theme));
      } else if (selectedEntry) {
        setPayloadDraft(payloadWithTheme(selectedEntry.payload, theme));
      }
    } else {
      setShowAll(false);
      if (selectedRealLessonScreen) {
        setPayloadDraft(realLessonRendererPayload(selectedRealLessonScreen, theme, manifest, sampleLessons));
      } else {
        setAppliedPayload(null);
        setDraftJson("");
        setJsonError("");
      }
    }
  };

  const frame = DEVICE_FRAMES[device];
  const FrameIcon = frame.icon;
  const sourceLabel = source === "local" ? "Local workbench" : "Backend latest";
  const canEditWorkbench = source === "local" && workbenchApiAvailable && !isWorkbenchMutating;
  const previewTitle =
    labMode === "real-lessons"
      ? selectedRealLessonScreen
        ? selectedRealLessonScreen.title
        : "Real lesson preview"
      : showAll
        ? "All catalog samples"
        : selectedEntry
          ? `${selectedEntry.cell_type}: ${selectedEntry.label}`
          : "Preview";
  const previewSubtitle =
    labMode === "real-lessons"
      ? selectedRealLessonScreen?.subtitle || "Reserved sample lesson screen"
      : `stylePolicy: ${activePayload?.stylePolicy || "first-only"}`;

  return (
    <main className="min-h-screen bg-[#f4f7f9] text-[#17212b]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px] flex-col px-5 py-5 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d4dde5] pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#58707f]">Renderer lab</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-[#101820]">Mobile cell previews</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-[#d4dde5] bg-white px-3 py-2 text-sm text-[#425463]">
              {manifest ? `${sourceLabel}: ${manifest.renderer_id} ${manifest.version}` : "Loading renderer"}
            </span>
            <div className="inline-flex rounded-md border border-[#c7d2dc] bg-[#f8fafb] p-1">
              <button
                type="button"
                onClick={() => setSource("local")}
                className={`h-9 rounded px-3 text-sm font-medium ${
                  source === "local" ? "bg-[#17212b] text-white shadow-sm" : "text-[#5c6e7b]"
                }`}
              >
                Local workbench
              </button>
              <button
                type="button"
                onClick={() => setSource("backend")}
                className={`h-9 rounded px-3 text-sm font-medium ${
                  source === "backend" ? "bg-[#17212b] text-white shadow-sm" : "text-[#5c6e7b]"
                }`}
              >
                Backend latest
              </button>
            </div>
            <button
              type="button"
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#c7d2dc] bg-white px-3 text-sm font-medium text-[#17212b] shadow-sm"
            >
              {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "light" ? "Light" : "Dark"}
            </button>
            <button
              type="button"
              onClick={() => {
                refreshWorkbenchApi();
                setReloadToken((value) => value + 1);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#c7d2dc] bg-white px-3 text-sm font-medium text-[#17212b] shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Reload
            </button>
          </div>
        </header>

        {error ? (
          <div className="mt-5 rounded-md border border-[#f0b6b6] bg-[#fff3f3] px-4 py-3 text-sm text-[#8a2525]">{error}</div>
        ) : null}

        <div className="mt-4 inline-flex w-fit rounded-md border border-[#c7d2dc] bg-[#f8fafb] p-1">
          <button
            type="button"
            onClick={() => handleSelectLabMode("catalog")}
            className={`inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-medium ${
              labMode === "catalog" ? "bg-white text-[#17212b] shadow-sm" : "text-[#5c6e7b]"
            }`}
          >
            <Grid2X2 className="h-4 w-4" />
            Cell Catalog
          </button>
          <button
            type="button"
            onClick={() => handleSelectLabMode("real-lessons")}
            className={`inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-medium ${
              labMode === "real-lessons" ? "bg-white text-[#17212b] shadow-sm" : "text-[#5c6e7b]"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Real Lessons
          </button>
        </div>

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[340px_minmax(420px,1fr)_420px]">
          <aside className="min-h-0 overflow-hidden rounded-lg border border-[#d4dde5] bg-white">
            <div className="border-b border-[#e1e8ee] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#17212b]">Workbench</h2>
                  <p className="text-xs text-[#6c7d89]">
                    {workbenchApiAvailable ? "Local editing server connected" : "Preview only"}
                  </p>
                </div>
                {workbenchApiAvailable ? (
                  <span className="rounded-full bg-[#e8f6ef] px-2 py-1 text-[10px] font-semibold text-[#24724f]">Writable</span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef2f5] px-2 py-1 text-[10px] font-semibold text-[#667785]">
                    <WifiOff className="h-3 w-3" />
                    Read-only
                  </span>
                )}
              </div>
              <select
                value={selectedWorkbenchKey}
                onChange={(event) => setSelectedWorkbenchKey(event.target.value)}
                disabled={!workbenchApiAvailable || isWorkbenchMutating || workbenchOptions.length === 0}
                className="mt-3 h-9 w-full rounded-md border border-[#c7d2dc] bg-white px-2 text-sm text-[#17212b] disabled:opacity-50"
              >
                {workbenchOptions.map((item) => (
                  <option key={`${item.kind}:${item.id}`} value={`${item.kind}:${item.id}`}>
                    {item.kind === "current" ? "Current" : item.kind === "library" ? "Library" : "Draft"} - {item.label}
                    {item.version ? ` (${item.version})` : ""}
                  </option>
                ))}
              </select>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopySelectedBundle}
                  disabled={!canEditWorkbench || selectedWorkbenchKey === "current:current"}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#c7d2dc] bg-[#f8fafb] px-2 text-xs font-semibold text-[#425463] disabled:opacity-50"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Use Bundle
                </button>
                <button
                  type="button"
                  onClick={handleImportBackendLatest}
                  disabled={!canEditWorkbench}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#c7d2dc] bg-[#f8fafb] px-2 text-xs font-semibold text-[#425463] disabled:opacity-50"
                >
                  <DownloadCloud className="h-3.5 w-3.5" />
                  Import Backend
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder="Draft name"
                  disabled={!canEditWorkbench}
                  className="h-9 min-w-0 flex-1 rounded-md border border-[#c7d2dc] bg-white px-2 text-sm text-[#17212b] disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={!canEditWorkbench}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#17212b] px-3 text-xs font-semibold text-white disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save
                </button>
              </div>
              {workbenchMessage ? (
                <div className="mt-3 rounded-md bg-[#f4f7f9] px-3 py-2 text-xs text-[#516575]">{workbenchMessage}</div>
              ) : null}
            </div>

            {labMode === "catalog" ? (
              <>
            <div className="flex items-center justify-between border-b border-[#e1e8ee] px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-[#17212b]">Catalog</h2>
                <p className="text-xs text-[#6c7d89]">{catalog ? `${catalogEntries.length} samples` : "Loading samples"}</p>
              </div>
              <button
                type="button"
                onClick={handleShowAll}
                disabled={!catalog}
                className={`rounded-md px-3 py-2 text-xs font-semibold ${
                  showAll ? "bg-[#17212b] text-white" : "border border-[#d4dde5] bg-[#f8fafb] text-[#425463]"
                } disabled:opacity-50`}
              >
                Show all
              </button>
            </div>
            <div className="max-h-[calc(100vh-315px)] overflow-y-auto px-2 py-2">
              {isLoading ? (
                <div className="px-3 py-4 text-sm text-[#6c7d89]">Loading renderer catalog...</div>
              ) : null}
              {groupedEntries.map(({ group, layouts }) => {
                const isCellGroupExpanded = expandedCellGroups[group] ?? false;
                return (
                  <div key={group} className="mb-3">
                    <button
                      type="button"
                      onClick={() => toggleCellGroup(group)}
                      className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#728390] hover:bg-[#f3f7fa]"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {isCellGroupExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="truncate">{group}</span>
                      </span>
                      <span className="rounded-full bg-[#eef3f6] px-2 py-0.5 text-[10px] tracking-normal text-[#6c7d89]">
                        {layouts.reduce((total, layout) => total + layout.entries.length, 0)}
                      </span>
                    </button>
                    {isCellGroupExpanded ? (
                      <div className="mt-1 space-y-2 pl-3">
                        {layouts.map((layout) => {
                          const renderModeKey = layoutExpansionKey(group, layout.layoutId);
                          const isRenderModeExpanded = expandedRenderModes[renderModeKey] ?? false;
                          return (
                          <div key={`${group}-${layout.layoutId}`}>
                            <button
                              type="button"
                              onClick={() => toggleRenderMode(group, layout.layoutId)}
                              className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold text-[#506676] hover:bg-[#f3f7fa]"
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                {isRenderModeExpanded ? (
                                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                                )}
                                <span className="truncate">{layout.label}</span>
                              </span>
                              <span className="shrink-0 text-[10px] font-semibold text-[#8a9aa6]">{layout.entries.length}</span>
                            </button>
                            {isRenderModeExpanded ? (
                              <div className="ml-7 mt-1 space-y-1 border-l border-[#dfe7ee] pl-4">
                                {layout.entries.map((entry) => {
                                  const isSelected = !showAll && selectedId === entry.id;
                                  const hasLockState = typeof entry.is_locked === "boolean";
                                  const LockIcon = entry.is_locked ? Lock : Unlock;
                                  const canToggle = canEditWorkbench && hasLockState && !!entry.style_group_id && !!entry.style_id;
                                  return (
                                    <div
                                      key={entry.id}
                                      className={`flex w-full items-stretch gap-1 rounded-md transition ${
                                        isSelected ? "bg-[#17212b] text-white" : "text-[#253440] hover:bg-[#eef3f6]"
                                      }`}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => handleSelectEntry(entry)}
                                        className="min-w-0 flex-1 px-3 py-2 text-left text-sm"
                                      >
                                        <span className="flex min-w-0 items-center justify-between gap-2">
                                          <span className="truncate font-medium">{entry.style_label || entry.label}</span>
                                          {hasLockState ? (
                                            <span
                                              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                isSelected
                                                  ? "bg-white/15 text-white"
                                                  : entry.is_locked
                                                    ? "bg-[#eef2f5] text-[#667785]"
                                                    : "bg-[#e8f6ef] text-[#24724f]"
                                              }`}
                                            >
                                              <LockIcon className="h-3 w-3" />
                                              {entry.is_locked ? "Locked" : "Unlocked"}
                                            </span>
                                          ) : null}
                                        </span>
                                        <span className={`block text-xs ${isSelected ? "text-[#d2dbe3]" : "text-[#718390]"}`}>
                                          {entry.style_id || entry.render_mode || entry.cell_type}
                                        </span>
                                      </button>
                                      {hasLockState ? (
                                        <button
                                          type="button"
                                          title={entry.is_locked ? "Unlock for real lessons" : "Lock for real lessons"}
                                          onClick={() => handleToggleLock(entry)}
                                          disabled={!canToggle}
                                          className={`m-1 inline-flex w-8 shrink-0 items-center justify-center rounded border text-xs ${
                                            isSelected
                                              ? "border-white/20 bg-white/10 text-white"
                                              : "border-[#d4dde5] bg-white text-[#425463]"
                                          } disabled:opacity-35`}
                                        >
                                          <LockIcon className="h-3.5 w-3.5" />
                                        </button>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
              </>
            ) : (
              <RealLessonsPanel
                sampleLessons={sampleLessons}
                isLoading={isSampleLessonsLoading}
                error={sampleLessonsError}
                selectedSampleId={selectedSampleId}
                selectedScreenKey={selectedRealLessonScreen?.key || selectedRealLessonScreenKey}
                onSelectSample={setSelectedSampleId}
                onSelectScreen={setSelectedRealLessonScreenKey}
              />
            )}
          </aside>

          <section className="flex min-h-[780px] flex-col rounded-lg border border-[#d4dde5] bg-[#e8eef3]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d4dde5] bg-white px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-[#17212b]">{previewTitle}</h2>
                <p className="text-xs text-[#6c7d89]">{previewSubtitle}</p>
              </div>
              <div className="inline-flex rounded-md border border-[#c7d2dc] bg-[#f8fafb] p-1">
                {(Object.keys(DEVICE_FRAMES) as Device[]).map((deviceKey) => {
                  const option = DEVICE_FRAMES[deviceKey];
                  const OptionIcon = option.icon;
                  return (
                    <button
                      key={deviceKey}
                      type="button"
                      onClick={() => setDevice(deviceKey)}
                      className={`inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-medium ${
                        device === deviceKey ? "bg-white text-[#17212b] shadow-sm" : "text-[#5c6e7b]"
                      }`}
                    >
                      <OptionIcon className="h-4 w-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-1 justify-center overflow-auto px-4 py-6">
              <div
                className={`relative shrink-0 bg-[#111] shadow-[0_24px_90px_rgba(19,31,43,0.28)] ${
                  device === "iphone" ? "rounded-[58px] p-[12px]" : "rounded-[36px] p-[10px]"
                }`}
                style={{ width: frame.width + 24, height: frame.height + 24 }}
              >
                <div
                  className={`absolute left-1/2 top-4 z-10 -translate-x-1/2 bg-black ${
                    device === "iphone" ? "h-7 w-32 rounded-full" : "h-3 w-20 rounded-b-xl"
                  }`}
                />
                <div
                  className={`h-full w-full overflow-hidden bg-white ${
                    device === "iphone" ? "rounded-[46px]" : "rounded-[28px]"
                  }`}
                >
                  {iframeDocument ? (
                    <iframe
                      key={`${labMode}-${device}-${theme}-${showAll ? "all" : selectedId}-${selectedRealLessonScreenKey}-${manifest?.version || "unknown"}-${reloadToken}`}
                      title="Renderer mobile preview"
                      sandbox="allow-scripts"
                      srcDoc={iframeDocument}
                      className="h-full w-full border-0"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-8 text-center text-sm text-[#6c7d89]">
                      Renderer preview will appear after the bundle loads.
                    </div>
                  )}
                </div>
                <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/65 px-3 py-1 text-[11px] text-white/80">
                  <FrameIcon className="h-3.5 w-3.5" />
                  {frame.label} {frame.width} x {frame.height}
                </div>
              </div>
            </div>
          </section>

          <aside className="grid min-h-0 gap-5 lg:grid-rows-[1fr_0.72fr]">
            <section className="min-h-0 overflow-hidden rounded-lg border border-[#d4dde5] bg-white">
              <div className="flex items-center justify-between border-b border-[#e1e8ee] px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#17212b]">Payload JSON</h2>
                  <p className="text-xs text-[#6c7d89]">
                    {labMode === "real-lessons" ? "Real lesson first-only payload" : "Local preview only"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleResetJson}
                    disabled={!activePayload}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-[#c7d2dc] bg-[#f8fafb] px-3 text-xs font-semibold text-[#425463] disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyJson}
                    disabled={!draftJson}
                    className="h-9 rounded-md bg-[#17212b] px-3 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              </div>
              {jsonError ? (
                <div className="border-b border-[#f0c6c6] bg-[#fff6f6] px-4 py-2 text-xs text-[#9a2a2a]">{jsonError}</div>
              ) : null}
              <textarea
                value={draftJson}
                onChange={(event) => setDraftJson(event.target.value)}
                spellCheck={false}
                className="h-[calc(100%-58px)] min-h-[360px] w-full resize-none bg-[#fbfcfd] px-4 py-3 font-mono text-xs leading-5 text-[#15202b] outline-none"
              />
            </section>

            <section className="min-h-0 overflow-hidden rounded-lg border border-[#d4dde5] bg-white">
              <div className="border-b border-[#e1e8ee] px-4 py-3">
                <h2 className="text-sm font-semibold text-[#17212b]">CSS override</h2>
                <p className="text-xs text-[#6c7d89]">Injected after renderer.css</p>
              </div>
              <textarea
                value={cssOverride}
                onChange={(event) => setCssOverride(event.target.value)}
                placeholder={".cell-card { outline: 2px solid rgba(79, 158, 149, .35); }"}
                spellCheck={false}
                className="h-[calc(100%-58px)] min-h-[260px] w-full resize-none bg-[#fbfcfd] px-4 py-3 font-mono text-xs leading-5 text-[#15202b] outline-none"
              />
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
