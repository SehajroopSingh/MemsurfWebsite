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
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Smartphone,
  Sun,
  Unlock,
  WifiOff,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Device = "iphone" | "android";
type Theme = "light" | "dark";
type RendererSource = "local" | "backend";
type BundleKind = "current" | "library" | "draft";
type LabMode = "catalog" | "real-lessons" | "production-ios";
type StylePolicy = "randomized-stable-unlocked" | "first-only" | "preview";
type TextVariant = "small" | "medium" | "large";

const REAL_LESSON_STYLE_POLICY = "randomized-stable-unlocked" as const;
const PREVIEW_STYLE_POLICY = "preview" as const;
const TEXT_VARIANTS: TextVariant[] = ["small", "medium", "large"];
const TEXT_VARIANT_LABELS: Record<TextVariant, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

function usesRealLessonSamples(labMode: LabMode) {
  return labMode === "real-lessons" || labMode === "production-ios";
}

type RendererManifest = {
  source?: string;
  renderer_id: string;
  version: string;
  schema_version: string;
  bundle_endpoint?: string;
  bundle_base_path?: string;
  catalog_path?: string;
  cell_definitions_path?: string;
  style_availability_path?: string;
  extra_stylesheet_paths?: string[];
  bundle_sha256?: string;
  bundle_size_bytes?: number;
};

type RendererPayload = {
  renderer_id: string;
  schema_version: string;
  version?: string;
  stylePolicy: StylePolicy;
  style_policy?: StylePolicy;
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
  text_variants?: Partial<Record<TextVariant, RendererPayload>>;
};

const HIDDEN_CATALOG_CELL_TYPES = new Set(["HeadingCell", "ImageCell", "MapRegionCell", "SpacerCell"]);

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
  relationship_kind?: string;
  relationship_mode?: string;
  render_mode?: string;
  orientation?: string;
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
  stylePolicy: StylePolicy;
  style_policy?: StylePolicy;
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

type StyleGroupOption = {
  groupId: string;
  label: string;
  group: StyleAvailabilityGroup;
};

type PendingStyleSelection = {
  entryId?: string;
  groupId?: string;
  styleId?: string;
};

type PendingCellSelection = {
  entryId?: string;
  cellType?: string;
};

type CellDefinition = {
  schema_version: "cell_definition_v1";
  cell_type: string;
  cell_slug: string;
  display_name: string;
  status: "draft" | "ready_for_backend";
  when_to_use?: string;
  when_not_to_use?: string;
  llm_instruction?: string;
  content_budget?: number;
  mobile_support?: {
    web_renderer_only?: boolean;
    requires_ios_native_type?: boolean;
    requires_android_native_type?: boolean;
  };
  security?: {
    allows_html?: boolean;
    allows_remote_images?: boolean;
  };
  updated_at?: string;
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

const CARD_CLASS_BY_CELL_TYPE: Record<string, string> = {
  HeadingCell: "heading-card",
  ImageCell: "image-card",
  KeyPointsCell: "keypoint-card",
  CompareCell: "compare-card",
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
const REPEATED_PREVIEW_CELL_TYPES = new Set(["KeyPointsCell", "TimelineStepCell", "ProcessStepCell"]);
const REPEATED_PREVIEW_COUNT = 3;

function clientCellSlugFromType(cellType: string) {
  return clientStyleSlug(
    cellType
      .replace(/Cell$/, "")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2"),
  );
}

function clientCardClassForType(cellType: string) {
  return CARD_CLASS_BY_CELL_TYPE[cellType] || `${clientCellSlugFromType(cellType)}-card`;
}

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

function clientStyleSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clientCellType(value: string) {
  const words = value
    .replace(/Cell$/, "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
  const pascal = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return pascal ? `${pascal}Cell` : "";
}

function commaSeparatedList(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function defaultContentSchemaJson(displayName: string) {
  const label = displayName || "Draft cell";
  return JSON.stringify(
    {
      type: "object",
      additionalProperties: false,
      required: ["title", "body"],
      properties: {
        title: {
          type: "string",
          description: `${label} headline.`,
        },
        body: {
          type: "string",
          description: `${label} explanatory body text.`,
        },
        items: {
          type: "array",
          items: { type: "string" },
          description: "Optional supporting bullets.",
        },
      },
    },
    null,
    2,
  );
}

function defaultPropsSchemaJson() {
  return JSON.stringify(
    {
      type: "object",
      additionalProperties: true,
      properties: {},
    },
    null,
    2,
  );
}

function defaultSamplePayloadJson(displayName: string) {
  const label = displayName || "Draft cell";
  return JSON.stringify(
    {
      title: `${label} preview`,
      body: "Use this sample to tune the draft renderer before backend promotion.",
      items: ["Define the LLM data shape", "Style the scaffold", "Promote deliberately later"],
    },
    null,
    2,
  );
}

function cssEscapedLabel(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function styleGroupLabel(group: StyleAvailabilityGroup) {
  if (group.layout_kind === "text_render_mode") {
    return `${group.cell_type} - ${group.layout_label || group.render_mode || group.layout_id}`;
  }
  if (group.layout_kind === "relationship_mode") {
    const relationship = (group.relationship_mode || group.layout_id || "").replace(/_/g, " ");
    return `${group.cell_type} - ${relationship || group.layout_label}`;
  }
  if (group.layout_kind === "triplet_layout") {
    return `${group.cell_type} - ${group.layout_label || group.render_mode || group.layout_id}`;
  }
  return `${group.cell_type} - ${group.layout_label || "Default mode"}`;
}

function styleCssScaffold(group: StyleAvailabilityGroup | undefined, styleId: string, styleName: string) {
  const safeStyleId = styleId || "new-style";
  const label = cssEscapedLabel(styleName || "New Style");
  if (!group) {
    return `.cell-card.cell-style-${safeStyleId} {
  border-color: rgba(47, 143, 131, 0.24);
}`;
  }
  if (group.layout_kind === "text_render_mode") {
    const renderMode = group.render_mode || group.layout_id || "body";
    return `.cell-card.text-mode-${renderMode}.text-style-${safeStyleId} {
  border-color: rgba(47, 143, 131, 0.24);
  background:
    linear-gradient(135deg, rgba(47, 143, 131, 0.10), rgba(123, 105, 239, 0.08)),
    var(--card-bg);
}

.cell-card.text-mode-${renderMode}.text-style-${safeStyleId} .text-cell::before {
  content: "${label}";
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
}`;
  }
  if (group.relationship_kind === "pair") {
    return `.cell-card.pair-card.pair-style-${safeStyleId} .pair-panel {
  border-color: rgba(47, 143, 131, 0.22);
  background:
    linear-gradient(135deg, rgba(47, 143, 131, 0.12), rgba(123, 105, 239, 0.08)),
    rgba(255, 255, 255, 0.42);
}

.cell-card.pair-card.pair-style-${safeStyleId} .pair-connector span {
  border-color: var(--relationship-line);
  color: var(--relationship-a);
  box-shadow: 0 0 0 7px rgba(47, 143, 131, 0.07);
}`;
  }
  if (group.relationship_kind === "triplet") {
    return `.cell-card.triplet-card.triplet-style-${safeStyleId} .triplet-item {
  border-color: rgba(47, 143, 131, 0.22);
  background:
    linear-gradient(135deg, rgba(47, 143, 131, 0.11), rgba(123, 105, 239, 0.07)),
    rgba(255, 255, 255, 0.44);
}

.cell-card.triplet-card.triplet-style-${safeStyleId} .triplet-connector span {
  border-color: var(--relationship-line);
  color: var(--relationship-a);
}`;
  }
  if (group.relationship_kind === "keyValue") {
    return `.cell-card.key-value-card.key-value-style-${safeStyleId} .key-value-title {
  border-bottom-color: rgba(47, 143, 131, 0.18);
  background: rgba(47, 143, 131, 0.10);
}

.cell-card.key-value-card.key-value-style-${safeStyleId} .key-value-cell {
  border-color: rgba(47, 143, 131, 0.22);
  background:
    linear-gradient(135deg, rgba(47, 143, 131, 0.11), rgba(123, 105, 239, 0.07)),
    rgba(255, 255, 255, 0.48);
}`;
  }
  const cardClass = clientCardClassForType(group.cell_type);
  return `.cell-card.${cardClass}.cell-style-${safeStyleId} {
  --cell-style-accent: var(--accent-1);
  border-color: rgba(47, 143, 131, 0.24);
  background:
    linear-gradient(135deg, rgba(47, 143, 131, 0.11), rgba(123, 105, 239, 0.08)),
    var(--card-bg);
}`;
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
  const stylePolicy =
    payload.stylePolicy === PREVIEW_STYLE_POLICY || payload.style_policy === PREVIEW_STYLE_POLICY
      ? PREVIEW_STYLE_POLICY
      : REAL_LESSON_STYLE_POLICY;
  return {
    ...payload,
    theme,
    stylePolicy,
    style_policy: stylePolicy,
  };
}

function payloadForEntryVariant(entry: CatalogEntry, variant: TextVariant): RendererPayload {
  return entry.text_variants?.[variant] || entry.text_variants?.medium || entry.payload;
}

function catalogEntryWithMappedPayloads(
  entry: CatalogEntry,
  mapPayload: (payload: RendererPayload) => RendererPayload,
): CatalogEntry {
  const mappedEntry: CatalogEntry = {
    ...entry,
    payload: mapPayload(entry.payload),
  };
  if (entry.text_variants) {
    mappedEntry.text_variants = Object.fromEntries(
      TEXT_VARIANTS
        .map((variant) => {
          const payload = entry.text_variants?.[variant];
          return payload ? [variant, mapPayload(payload)] : null;
        })
        .filter((item): item is [TextVariant, RendererPayload] => Boolean(item)),
    );
  }
  return mappedEntry;
}

function combinedPayload(entries: CatalogEntry[], theme: Theme): RendererPayload {
  const mediumPayloads = entries.map((entry) => payloadForEntryVariant(entry, "medium"));
  const first = mediumPayloads[0];
  const stylePolicy = mediumPayloads.some((payload) => payload.stylePolicy === PREVIEW_STYLE_POLICY || payload.style_policy === PREVIEW_STYLE_POLICY)
    ? PREVIEW_STYLE_POLICY
    : REAL_LESSON_STYLE_POLICY;
  return {
    renderer_id: first?.renderer_id || "dynamic_gridcell",
    schema_version: first?.schema_version || "three_step_gridcell_v1",
    version: first?.version,
    stylePolicy,
    style_policy: stylePolicy,
    theme,
    showScenarioTitles: true,
    scenarios: entries.flatMap((entry) =>
      payloadForEntryVariant(entry, "medium").scenarios.map((scenario) => ({
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

function payloadWithPreviewCellStyle(basePayload: RendererPayload, styleId: string): RendererPayload {
  const payload = JSON.parse(JSON.stringify(basePayload)) as RendererPayload;
  payload.scenarios = payload.scenarios.map((scenario) => {
    const slots = arrayRecords(scenario.slots);
    if (!slots.length) return scenario;
    return {
      ...scenario,
      slots: slots.map((slot) => ({
        ...slot,
        preview_cell_style: styleId,
      })),
    };
  });
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

function repeatedPreviewContent(cellType: string, content: Record<string, unknown>, index: number) {
  const stepNumber = index + 1;
  if (cellType === "KeyPointsCell") {
    const existingPoints = Array.isArray(content.points) ? content.points.filter((point) => typeof point === "string") : [];
    const pointTextLength = existingPoints.join(" ").length;
    if (existingPoints.length <= 2 && pointTextLength < 80) {
      const shortPoints = [
        ["Preview density.", "Check spacing."],
        ["Compare styles.", "Keep it tight."],
        ["Reload once.", "Review mobile."],
      ];
      return {
        ...content,
        points: shortPoints[index],
      };
    }
    if (existingPoints.length >= 4 || pointTextLength > 240) {
      const longPoints = [
        [
          "Use randomized-stable-unlocked style policy while checking this catalog sample in the phone frame.",
          "Review the same card in light and dark themes so text wrapping and contrast both stay visible.",
          "Keep the workbench payload local until a later production promotion is explicitly requested.",
          "Confirm the card spacing still reads cleanly when the bullet list grows beyond the medium sample.",
        ],
        [
          "Compare each available visual style against the same longer text so density changes are easy to spot.",
          "Watch for labels, bullets, and rounded containers competing for vertical space on smaller devices.",
          "Use the expanded list to catch awkward line breaks that a short sample would hide.",
          "Make sure repeated preview cells still feel like one connected flow rather than separate mockups.",
        ],
        [
          "Reload the renderer after local edits and verify the catalog row still selects the intended size variant.",
          "Check that the larger example keeps enough bottom padding inside the material wrapper.",
          "Scan the phone preview for clipped bullets, compressed line height, or accidental overlap with controls.",
          "Leave backend, iOS, and Android promotion untouched until this local renderer workbench version is approved.",
        ],
      ];
      return {
        ...content,
        points: longPoints[index],
      };
    }
    const labels = ["Setup", "Check", "Apply"];
    return {
      ...content,
      points: [
        `${labels[index]} the main idea in context.`,
        "Keep the supporting detail compact.",
        "Connect it to the next visible card.",
      ],
    };
  }
  if (cellType === "TimelineStepCell") {
    const titles = ["Preview endpoint ships", "Style pass lands", "Mobile review starts"];
    const descriptions = [
      "The lab loads the renderer bundle in the phone frame.",
      "Each visual style is checked against the same sequence.",
      "The connector and reveal timing are reviewed together.",
    ];
    return {
      ...content,
      chain_label: stepNumber === 1 ? content.chain_label || "Renderer rollout" : "",
      time_label: `Step ${stepNumber}`,
      event_title: titles[index],
      description: descriptions[index],
    };
  }
  if (cellType === "ProcessStepCell") {
    const actions = ["Adjust payload or CSS", "Reload the renderer", "Review connected output"];
    const outputs = ["Preview state changes", "Phone frame updates", "Ready for visual approval"];
    return {
      ...content,
      chain_label: stepNumber === 1 ? content.chain_label || "Lab workflow" : "",
      action: actions[index],
      output: outputs[index],
      note: index === 0 ? content.note || "Changes stay local to the workbench." : "The run should read as one connected flow.",
    };
  }
  return content;
}

function repeatedPreviewSlot(baseSlot: Record<string, unknown>, index: number) {
  const cellType = typeof baseSlot.cell_type === "string" ? baseSlot.cell_type : "";
  const props = recordValue(baseSlot.props) || {};
  const content = recordValue(baseSlot.content) || {};
  return {
    ...baseSlot,
    slot_id: `slot_${index + 1}`,
    r: index,
    c: 0,
    rowspan: 1,
    colspan: 1,
    props: {
      ...props,
      sequence_index: index + 1,
    },
    content: repeatedPreviewContent(cellType, content, index),
  };
}

function payloadWithRepeatedPreviewCells(basePayload: RendererPayload): RendererPayload {
  const payload = JSON.parse(JSON.stringify(basePayload)) as RendererPayload;
  payload.scenarios = payload.scenarios.map((scenario) => {
    const slots = arrayRecords(scenario.slots);
    if (slots.length !== 1) return scenario;

    const cellType = typeof slots[0]?.cell_type === "string" ? slots[0].cell_type : "";
    if (!REPEATED_PREVIEW_CELL_TYPES.has(cellType)) return scenario;

    return {
      ...scenario,
      grid: {
        ...(recordValue(scenario.grid) || {}),
        rows: REPEATED_PREVIEW_COUNT,
        cols: 1,
      },
      slots: Array.from({ length: REPEATED_PREVIEW_COUNT }, (_value, index) => repeatedPreviewSlot(slots[0], index)),
    };
  });
  return payload;
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
    stylePolicy: REAL_LESSON_STYLE_POLICY,
    style_policy: REAL_LESSON_STYLE_POLICY,
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
      modeEntries.push(
        catalogEntryWithMappedPayloads(
          {
            ...baseEntry,
            id: `pair-${mode.id}`,
            label,
            render_mode: mode.id,
            layout_id: mode.id,
            layout_label: mode.label,
            layout_kind: "pair_visual_mode",
          },
          (payload) => payloadWithScenarioMetadata(payload, `PairCell: ${label}`, "Pair visual render mode"),
        ),
      );
    }

    for (const relation of mode.relations) {
      const styleEntries = styleEntriesByRelation.get(relation) || [];
      for (const entry of styleEntries) {
        const styleLabel = entry.style_label || entry.label;
        modeEntries.push(
          catalogEntryWithMappedPayloads(
            {
              ...entry,
              id: `${entry.id}-${mode.id}`,
              render_mode: mode.id,
              layout_id: mode.id,
              layout_label: mode.label,
              layout_kind: "pair_visual_mode",
              render_mode_token: mode.id,
            },
            (payload) =>
              payloadWithScenarioMetadata(
                payload,
                `PairCell: ${mode.label} - ${styleLabel}`,
                "Backend-owned visual render mode preview",
              ),
          ),
        );
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

  const entriesWithRenderModeStyles = visibleEntries.flatMap((entry) => {
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
      return catalogEntryWithMappedPayloads(
        {
          ...entry,
          id: `${entry.id}-${renderMode}`.replace(/[^a-zA-Z0-9_-]/g, "-"),
          render_mode: renderMode,
          layout_id: renderMode,
          layout_label: layoutLabel,
          render_mode_token: renderMode,
          payload: baseEntry.payload,
          text_variants: baseEntry.text_variants,
        },
        (payload) =>
          payloadWithForcedStyle(
            payload,
            styleKey,
            styleId,
            `${entry.cell_type}: ${layoutLabel} - ${styleLabel}`,
            "Backend-owned style availability preview",
          ),
      );
    });
  });

  const repeatedEntries = entriesWithRenderModeStyles.map((entry) =>
    catalogEntryWithMappedPayloads(entry, payloadWithRepeatedPreviewCells),
  );
  const stableCellShellEntries = repeatedEntries.map((entry) => {
    if (entry.cell_type !== "KeyValueCell" || entry.layout_kind !== "relationship_mode") {
      return entry;
    }
    return catalogEntryWithMappedPayloads(entry, (payload) => payloadWithPreviewCellStyle(payload, "ledger"));
  });
  const styledLayoutKeys = new Set(
    stableCellShellEntries
      .filter((entry) => entry.style_id)
      .map((entry) => `${entry.cell_type}:${entry.layout_id || entry.render_mode || "samples"}`),
  );

  return stableCellShellEntries.filter((entry) => {
    if (entry.style_id) return true;
    const layoutKey = `${entry.cell_type}:${entry.layout_id || entry.render_mode || "samples"}`;
    return !styledLayoutKeys.has(layoutKey);
  });
}

function prettyJson(payload: RendererPayload) {
  return JSON.stringify(payload, null, 2);
}

type IframeDocumentOptions = {
  productionParity?: boolean;
};

function buildIframeDocument(
  bundle: RendererBundle,
  payload: RendererPayload,
  cssOverride: string,
  options: IframeDocumentOptions = {},
) {
  const productionParity = options.productionParity === true;
  const katexStylesheet = bundle.katexCssHref
    ? `<link rel="stylesheet" href="${attrSafe(bundle.katexCssHref)}" />`
    : `<style>${styleSafe(bundle.katexCss)}</style>`;
  const rendererStylesheet = bundle.rendererCssHref
    ? `<link rel="stylesheet" href="${attrSafe(bundle.rendererCssHref)}" />`
    : `<style>${styleSafe(bundle.rendererCss)}</style>`;
  const rendererExtraStylesheets = productionParity
    ? ""
    : (bundle.rendererCssExtraHrefs || [])
        .map((href) => `<link rel="stylesheet" href="${attrSafe(href)}" />`)
        .join("\n  ");
  const effectiveCssOverride = productionParity ? "" : cssOverride;
  const bodyBackground = productionParity ? "transparent" : payload.theme === "dark" ? "#08131d" : "#eef5fb";
  const blobbyBackground = productionParity
    ? ""
    : `  <div class="blobby-bg">
    <div class="bg-blob blob-1"></div>
    <div class="bg-blob blob-2"></div>
    <div class="bg-blob blob-3"></div>
    <div class="bg-blob blob-4"></div>
    <div class="bg-blob blob-5"></div>
    <div class="bg-blob blob-6"></div>
  </div>
`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  ${katexStylesheet}
  ${rendererStylesheet}
  ${rendererExtraStylesheets}
  ${productionParity ? "" : `<style>
    html, body { min-height: 100%; margin: 0; }
    body {
      background: ${bodyBackground};
      overflow-x: hidden;
    }
    #grid-layout-root {
      max-width: var(--page-max-width);
      margin: 0 auto;
      padding: 15vh var(--gridcell-root-edge) 0;
      position: relative;
      z-index: 1;
    }
    .scenario-shell { padding-left: 0; padding-right: 0; }

    /* Blobby Background styles */
    .blobby-bg {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    }
    .bg-blob {
      position: absolute;
      border-radius: 50%;
      mix-blend-mode: normal;
      will-change: transform;
    }
    .blob-1 {
      width: 250px;
      height: 250px;
      left: -40px;
      top: -20px;
      background: #4f9e95;
      opacity: ${payload.theme === "dark" ? 0.34 : 0.22};
      filter: blur(40px);
      animation: float-blob-1 14s ease-in-out infinite;
    }
    .blob-2 {
      width: 200px;
      height: 200px;
      right: -30px;
      top: 10%;
      background: #8c65c6;
      opacity: ${payload.theme === "dark" ? 0.30 : 0.20};
      filter: blur(35px);
      animation: float-blob-2 16s ease-in-out infinite;
    }
    .blob-3 {
      width: 180px;
      height: 180px;
      right: -20px;
      top: 45%;
      background: #5376ab;
      opacity: ${payload.theme === "dark" ? 0.32 : 0.22};
      filter: blur(35px);
      animation: float-blob-3 12s ease-in-out infinite;
    }
    .blob-4 {
      width: 220px;
      height: 220px;
      left: -50px;
      bottom: 10%;
      background: #6b57a8;
      opacity: ${payload.theme === "dark" ? 0.28 : 0.18};
      filter: blur(45px);
      animation: float-blob-4 18s ease-in-out infinite;
    }
    .blob-5 {
      width: 150px;
      height: 150px;
      left: 20%;
      top: 40%;
      background: #77c2b7;
      opacity: ${payload.theme === "dark" ? 0.26 : 0.16};
      filter: blur(30px);
      animation: float-blob-5 15s ease-in-out infinite;
    }
    .blob-6 {
      width: 170px;
      height: 170px;
      right: 10%;
      bottom: -20px;
      background: #a580da;
      opacity: ${payload.theme === "dark" ? 0.28 : 0.18};
      filter: blur(35px);
      animation: float-blob-6 13s ease-in-out infinite;
    }

    @keyframes float-blob-1 {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(40px, 20px) scale(1.1); }
      100% { transform: translate(0, 0) scale(1); }
    }
    @keyframes float-blob-2 {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-30px, 40px) scale(0.9); }
      100% { transform: translate(0, 0) scale(1); }
    }
    @keyframes float-blob-3 {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-40px, -20px) scale(1.15); }
      100% { transform: translate(0, 0) scale(1); }
    }
    @keyframes float-blob-4 {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(25px, -30px) scale(0.95); }
      100% { transform: translate(0, 0) scale(1); }
    }
    @keyframes float-blob-5 {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(30px, -25px) scale(1.1); }
      100% { transform: translate(0, 0) scale(1); }
    }
    @keyframes float-blob-6 {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-20px, 30px) scale(0.9); }
      100% { transform: translate(0, 0) scale(1); }
    }
    ${styleSafe(effectiveCssOverride)}
  </style>`}
</head>
<body>
${blobbyBackground}
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
  title?: string;
  subtitle?: string;
  icon?: "book" | "phone";
};

function RealLessonsPanel({
  sampleLessons,
  isLoading,
  error,
  selectedSampleId,
  selectedScreenKey,
  onSelectSample,
  onSelectScreen,
  title = "Real Lessons",
  subtitle,
  icon = "book",
}: RealLessonsPanelProps) {
  const samples = sampleLessons?.samples || [];
  const selectedSample = samples.find((sample) => sample.quick_capture_id === selectedSampleId) || samples[0] || null;
  const selectedStats = selectedSample ? realLessonSampleStats(selectedSample) : null;
  const selectedOptions = selectedSample ? realLessonScreenOptions(selectedSample) : [];
  const modules = selectedSample?.lesson_plan?.modules || [];
  const PanelIcon = icon === "phone" ? MonitorSmartphone : BookOpen;

  return (
    <>
      <div className="flex items-center justify-between border-b border-[#e1e8ee] px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-[#17212b]">{title}</h2>
          <p className="text-xs text-[#6c7d89]">
            {subtitle || (sampleLessons ? `${sampleLessons.sample_count} reserved samples` : "Loading example captures")}
          </p>
        </div>
        <PanelIcon className="h-4 w-4 text-[#6c7d89]" />
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
  const pendingStyleSelectionRef = useRef<PendingStyleSelection | null>(null);
  const pendingCellSelectionRef = useRef<PendingCellSelection | null>(null);
  const styleCssScaffoldRef = useRef("");
  const cellContentSchemaRef = useRef("");
  const cellSamplePayloadRef = useRef("");
  const [labMode, setLabMode] = useState<LabMode>("catalog");
  const [source, setSource] = useState<RendererSource>(() => {
    if (typeof window === "undefined") return "local";
    return new URLSearchParams(window.location.search).get("source") === "backend" ? "backend" : "local";
  });
  const isProductionIosMode = labMode === "production-ios";
  const effectiveSource: RendererSource = isProductionIosMode ? "backend" : source;
  const [manifest, setManifest] = useState<RendererManifest | null>(null);
  const [catalog, setCatalog] = useState<RendererCatalog | null>(null);
  const [bundle, setBundle] = useState<RendererBundle | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedTextVariant, setSelectedTextVariant] = useState<TextVariant>("medium");
  const [device, setDevice] = useState<Device>("iphone");
  const [theme, setTheme] = useState<Theme>("dark");
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
  const [workbenchCells, setWorkbenchCells] = useState<CellDefinition[]>([]);
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
  const [isAddStyleOpen, setIsAddStyleOpen] = useState(false);
  const [styleDraftGroupId, setStyleDraftGroupId] = useState("");
  const [styleDraftName, setStyleDraftName] = useState("");
  const [styleDraftId, setStyleDraftId] = useState("");
  const [styleDraftLocked, setStyleDraftLocked] = useState(true);
  const [styleDraftOverwrite, setStyleDraftOverwrite] = useState(false);
  const [styleDraftCss, setStyleDraftCss] = useState("");
  const [styleDraftIdEdited, setStyleDraftIdEdited] = useState(false);
  const [styleDraftCssEdited, setStyleDraftCssEdited] = useState(false);
  const [styleSaveError, setStyleSaveError] = useState("");
  const [isAddCellOpen, setIsAddCellOpen] = useState(false);
  const [cellDraftDisplayName, setCellDraftDisplayName] = useState("");
  const [cellDraftType, setCellDraftType] = useState("");
  const [cellDraftTypeEdited, setCellDraftTypeEdited] = useState(false);
  const [cellDraftStatus, setCellDraftStatus] = useState<"draft" | "ready_for_backend">("draft");
  const [cellDraftWhenToUse, setCellDraftWhenToUse] = useState("");
  const [cellDraftWhenNotToUse, setCellDraftWhenNotToUse] = useState("");
  const [cellDraftLlmInstruction, setCellDraftLlmInstruction] = useState("");
  const [cellDraftContentSchema, setCellDraftContentSchema] = useState(defaultContentSchemaJson(""));
  const [cellDraftPropsSchema, setCellDraftPropsSchema] = useState(defaultPropsSchemaJson());
  const [cellDraftSamplePayload, setCellDraftSamplePayload] = useState(defaultSamplePayloadJson(""));
  const [cellDraftContentSchemaEdited, setCellDraftContentSchemaEdited] = useState(false);
  const [cellDraftSamplePayloadEdited, setCellDraftSamplePayloadEdited] = useState(false);
  const [cellDraftRequiredFields, setCellDraftRequiredFields] = useState("title, body");
  const [cellDraftOptionalFields, setCellDraftOptionalFields] = useState("items");
  const [cellDraftContentBudget, setCellDraftContentBudget] = useState("45");
  const [cellDraftAllowsHtml, setCellDraftAllowsHtml] = useState(false);
  const [cellDraftAllowsRemoteImages, setCellDraftAllowsRemoteImages] = useState(false);
  const [cellDraftOverwrite, setCellDraftOverwrite] = useState(false);
  const [cellSaveError, setCellSaveError] = useState("");

  // Restore persistent settings on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDevice = localStorage.getItem("renderlab_device") as Device | null;
      if (savedDevice === "iphone" || savedDevice === "android") {
        setDevice(savedDevice);
      }
      const savedTheme = localStorage.getItem("renderlab_theme") as Theme | null;
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }
      const savedLabMode = localStorage.getItem("renderlab_labMode") as LabMode | null;
      if (savedLabMode === "catalog" || savedLabMode === "real-lessons" || savedLabMode === "production-ios") {
        setLabMode(savedLabMode);
      }
    }
  }, []);

  // Save persistent settings when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("renderlab_device", device);
    }
  }, [device]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("renderlab_theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("renderlab_labMode", labMode);
    }
  }, [labMode]);

  useEffect(() => {
    if (typeof window !== "undefined" && !isLoading) {
      localStorage.setItem("renderlab_selectedId", selectedId);
    }
  }, [selectedId, isLoading]);

  useEffect(() => {
    if (typeof window !== "undefined" && !isLoading) {
      localStorage.setItem("renderlab_selectedTextVariant", selectedTextVariant);
    }
  }, [selectedTextVariant, isLoading]);

  useEffect(() => {
    if (typeof window !== "undefined" && !isLoading) {
      localStorage.setItem("renderlab_showAll", String(showAll));
    }
  }, [showAll, isLoading]);

  useEffect(() => {
    if (typeof window !== "undefined" && selectedSampleId !== null) {
      localStorage.setItem("renderlab_selectedSampleId", String(selectedSampleId));
    }
  }, [selectedSampleId]);

  useEffect(() => {
    if (typeof window !== "undefined" && selectedRealLessonScreenKey !== "") {
      localStorage.setItem("renderlab_selectedRealLessonScreenKey", selectedRealLessonScreenKey);
    }
  }, [selectedRealLessonScreenKey]);

  useEffect(() => {
    if (!isProductionIosMode) return;
    if (source !== "backend") {
      setSource("backend");
    }
    if (device !== "iphone") {
      setDevice("iphone");
    }
  }, [device, isProductionIosMode, source]);

  const catalogEntries = useMemo(
    () =>
      catalogEntriesWithRenderModeStyles(catalog?.entries || []).filter(
        (entry) => !HIDDEN_CATALOG_CELL_TYPES.has(entry.cell_type),
      ),
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

  const styleAvailability = bundle?.styleAvailability || catalog?.style_availability;

  const styleGroupOptions = useMemo<StyleGroupOption[]>(() => {
    if (!styleAvailability?.groups?.length) return [];
    const visibleStyleGroupIds = new Set(
      catalogEntries
        .map((entry) => entry.style_group_id)
        .filter((groupId): groupId is string => Boolean(groupId)),
    );
    return styleAvailability.groups
      .filter((group) => visibleStyleGroupIds.has(group.group_id))
      .map((group) => ({
        groupId: group.group_id,
        label: styleGroupLabel(group),
        group,
      }));
  }, [catalogEntries, styleAvailability]);

  const selectedStyleGroupOption = useMemo(
    () => styleGroupOptions.find((option) => option.groupId === styleDraftGroupId) || styleGroupOptions[0],
    [styleDraftGroupId, styleGroupOptions],
  );

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

  useEffect(() => {
    if (!styleGroupOptions.length) return;
    const selectedEntryGroup = selectedEntry?.style_group_id;
    const preferredGroup = selectedEntryGroup && styleGroupOptions.some((option) => option.groupId === selectedEntryGroup)
      ? selectedEntryGroup
      : styleGroupOptions[0].groupId;
    if (!styleDraftGroupId || !styleGroupOptions.some((option) => option.groupId === styleDraftGroupId)) {
      setStyleDraftGroupId(preferredGroup);
    }
  }, [selectedEntry, styleDraftGroupId, styleGroupOptions]);

  useEffect(() => {
    const nextScaffold = styleCssScaffold(selectedStyleGroupOption?.group, styleDraftId, styleDraftName);
    if (!styleDraftCssEdited || styleDraftCss === styleCssScaffoldRef.current) {
      setStyleDraftCss(nextScaffold);
    }
    styleCssScaffoldRef.current = nextScaffold;
  }, [selectedStyleGroupOption, styleDraftCss, styleDraftCssEdited, styleDraftId, styleDraftName]);

  useEffect(() => {
    const nextSchema = defaultContentSchemaJson(cellDraftDisplayName);
    if (!cellDraftContentSchemaEdited || cellDraftContentSchema === cellContentSchemaRef.current) {
      setCellDraftContentSchema(nextSchema);
    }
    cellContentSchemaRef.current = nextSchema;

    const nextSample = defaultSamplePayloadJson(cellDraftDisplayName);
    if (!cellDraftSamplePayloadEdited || cellDraftSamplePayload === cellSamplePayloadRef.current) {
      setCellDraftSamplePayload(nextSample);
    }
    cellSamplePayloadRef.current = nextSample;
  }, [
    cellDraftContentSchema,
    cellDraftContentSchemaEdited,
    cellDraftDisplayName,
    cellDraftSamplePayload,
    cellDraftSamplePayloadEdited,
  ]);

  const setPayloadDraft = useCallback((payload: RendererPayload) => {
    setAppliedPayload(payload);
    setDraftJson(prettyJson(payload));
    setJsonError("");
  }, []);

  const refreshWorkbenchApi = useCallback(async () => {
    try {
      const [healthResponse, bundlesResponse, cellsResponse] = await Promise.all([
        fetch(labApiUrl("health"), { cache: "no-store" }),
        fetch(labApiUrl("bundles"), { cache: "no-store" }),
        fetch(labApiUrl("cells"), { cache: "no-store" }),
      ]);
      if (!healthResponse.ok || !bundlesResponse.ok || !cellsResponse.ok) {
        throw new Error("Renderer lab API unavailable.");
      }
      const cellsPayload = (await cellsResponse.json()) as { cells?: CellDefinition[] };
      setWorkbenchApiAvailable(true);
      setWorkbenchBundles((await bundlesResponse.json()) as WorkbenchBundleList);
      setWorkbenchCells(cellsPayload.cells || []);
    } catch {
      setWorkbenchApiAvailable(false);
      setWorkbenchBundles(null);
      setWorkbenchCells([]);
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

        if (effectiveSource === "local") {
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

        const visibleEntries = catalogEntriesWithRenderModeStyles(nextCatalog.entries).filter(
          (entry) => !HIDDEN_CATALOG_CELL_TYPES.has(entry.cell_type),
        );
        const pendingCellSelection = pendingCellSelectionRef.current;
        const pendingSelection = pendingStyleSelectionRef.current;

        const savedShowAll = typeof window !== "undefined" ? localStorage.getItem("renderlab_showAll") === "true" : false;
        const savedSelectedId = typeof window !== "undefined" ? localStorage.getItem("renderlab_selectedId") : null;
        const savedTextVariant = typeof window !== "undefined" ? localStorage.getItem("renderlab_selectedTextVariant") : null;
        const activeTextVariant: TextVariant =
          savedTextVariant === "small" || savedTextVariant === "medium" || savedTextVariant === "large"
            ? savedTextVariant
            : "medium";

        let firstEntry = null;
        let shouldShowAll = false;

        if (pendingCellSelection) {
          firstEntry =
            visibleEntries.find((entry) => entry.id === pendingCellSelection.entryId) ||
            visibleEntries.find((entry) => entry.cell_type === pendingCellSelection.cellType) ||
            visibleEntries[0];
        } else if (pendingSelection) {
          firstEntry =
            visibleEntries.find((entry) => entry.id === pendingSelection.entryId) ||
            visibleEntries.find(
              (entry) =>
                entry.style_group_id === pendingSelection.groupId &&
                entry.style_id === pendingSelection.styleId,
            ) ||
            visibleEntries[0];
        } else if (savedShowAll && !pendingCellSelection && !pendingSelection) {
          shouldShowAll = true;
        } else {
          firstEntry = (savedSelectedId && visibleEntries.find((entry) => entry.id === savedSelectedId)) || visibleEntries[0];
        }

        pendingCellSelectionRef.current = null;
        pendingStyleSelectionRef.current = null;
        setManifest(nextManifest);
        setCatalog(nextCatalog);
        setBundle(nextBundle);

        const savedTheme = (typeof window !== "undefined" ? localStorage.getItem("renderlab_theme") : null) as Theme | null;
        const activeTheme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : theme;

        if (shouldShowAll) {
          setSelectedId("");
          setSelectedTextVariant("medium");
          setShowAll(true);
          setPayloadDraft(combinedPayload(visibleEntries, activeTheme));
        } else {
          setSelectedId(firstEntry?.id || "");
          setSelectedTextVariant(activeTextVariant);
          setShowAll(false);
          if (firstEntry) {
            setPayloadDraft(payloadWithTheme(payloadForEntryVariant(firstEntry, activeTextVariant), activeTheme));
          }
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
  }, [effectiveSource, reloadToken, setPayloadDraft]);

  useEffect(() => {
    if (!usesRealLessonSamples(labMode)) return;
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
    const savedSampleIdText = typeof window !== "undefined" ? localStorage.getItem("renderlab_selectedSampleId") : null;
    const savedSampleId = savedSampleIdText ? Number(savedSampleIdText) : null;
    const activeSampleId = savedSampleId !== null ? savedSampleId : selectedSampleId;

    const hasSelectedSample = sampleLessons.samples.some((sample) => sample.quick_capture_id === activeSampleId);
    if (hasSelectedSample) {
      if (selectedSampleId !== activeSampleId) {
        setSelectedSampleId(activeSampleId);
      }
    } else {
      setSelectedSampleId(sampleLessons.samples[0].quick_capture_id);
    }
  }, [sampleLessons, selectedSampleId]);

  useEffect(() => {
    if (!selectedRealLessonScreenOptions.length) {
      setSelectedRealLessonScreenKey("");
      return;
    }
    const savedScreenKey = typeof window !== "undefined" ? localStorage.getItem("renderlab_selectedRealLessonScreenKey") : null;
    const activeScreenKey = savedScreenKey || selectedRealLessonScreenKey;

    const hasSelectedScreen = selectedRealLessonScreenOptions.some((option) => option.key === activeScreenKey);
    if (hasSelectedScreen) {
      if (selectedRealLessonScreenKey !== activeScreenKey) {
        setSelectedRealLessonScreenKey(activeScreenKey);
      }
    } else {
      setSelectedRealLessonScreenKey(selectedRealLessonScreenOptions[0].key);
    }
  }, [selectedRealLessonScreenKey, selectedRealLessonScreenOptions]);

  useEffect(() => {
    if (!usesRealLessonSamples(labMode)) return;
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
    return buildIframeDocument(bundle, activePayload, cssOverride, { productionParity: isProductionIosMode });
  }, [activePayload, bundle, cssOverride, isProductionIosMode]);

  const handleSelectEntry = (entry: CatalogEntry, variant: TextVariant = "medium") => {
    setLabMode("catalog");
    setSelectedId(entry.id);
    setSelectedTextVariant(variant);
    setShowAll(false);
    setPayloadDraft(payloadWithTheme(payloadForEntryVariant(entry, variant), theme));
  };

  const handleShowAll = () => {
    if (!catalogEntries.length) return;
    setLabMode("catalog");
    setShowAll(true);
    setSelectedId("");
    setSelectedTextVariant("medium");
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
    if (usesRealLessonSamples(labMode)) {
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
      setPayloadDraft(payloadWithTheme(payloadForEntryVariant(selectedEntry, selectedTextVariant), theme));
    }
  };

  const runWorkbenchAction = async (
    action: () => Promise<void>,
    successMessage: string,
    onError?: (message: string) => void,
  ) => {
    setWorkbenchMessage("");
    setIsWorkbenchMutating(true);
    try {
      await action();
      await refreshWorkbenchApi();
      setSource("local");
      setReloadToken((value) => value + 1);
      setWorkbenchMessage(successMessage);
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : "Workbench action failed.";
      setWorkbenchMessage(message);
      onError?.(message);
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

  const handleOpenAddStyle = () => {
    const preferredGroup = selectedEntry?.style_group_id &&
      styleGroupOptions.some((option) => option.groupId === selectedEntry.style_group_id)
      ? selectedEntry.style_group_id
      : styleGroupOptions[0]?.groupId || "";
    const initialName = "";
    const initialId = "";
    setStyleDraftGroupId(preferredGroup);
    setStyleDraftName(initialName);
    setStyleDraftId(initialId);
    setStyleDraftLocked(true);
    setStyleDraftOverwrite(false);
    setStyleDraftIdEdited(false);
    setStyleDraftCssEdited(false);
    setStyleSaveError("");
    const group = styleGroupOptions.find((option) => option.groupId === preferredGroup)?.group;
    const scaffold = styleCssScaffold(group, initialId, initialName);
    styleCssScaffoldRef.current = scaffold;
    setStyleDraftCss(scaffold);
    setIsAddCellOpen(false);
    setIsAddStyleOpen(true);
  };

  const handleStyleNameChange = (value: string) => {
    setStyleDraftName(value);
    if (!styleDraftIdEdited) {
      setStyleDraftId(clientStyleSlug(value));
    }
  };

  const handleStyleIdChange = (value: string) => {
    setStyleDraftId(clientStyleSlug(value));
    setStyleDraftIdEdited(true);
  };

  const handleStyleGroupChange = (groupId: string) => {
    setStyleDraftGroupId(groupId);
    setStyleSaveError("");
  };

  const handleResetStyleCss = () => {
    const scaffold = styleCssScaffold(selectedStyleGroupOption?.group, styleDraftId, styleDraftName);
    styleCssScaffoldRef.current = scaffold;
    setStyleDraftCss(scaffold);
    setStyleDraftCssEdited(false);
  };

  const handleSaveStyle = () => {
    if (!selectedStyleGroupOption) {
      setStyleSaveError("Choose a style group first.");
      return;
    }
    if (!styleDraftId) {
      setStyleSaveError("Enter a style name or slug.");
      return;
    }
    setStyleSaveError("");
    const styleLabel = styleDraftName.trim() || styleDraftId.replace(/-/g, " ");
    runWorkbenchAction(
      async () => {
        const result = await postWorkbenchAction("styles", {
          groupId: selectedStyleGroupOption.groupId,
          styleName: styleDraftName.trim() || styleLabel,
          styleId: styleDraftId,
          css: styleDraftCss,
          locked: styleDraftLocked,
          overwrite: styleDraftOverwrite,
        });
        const savedStyle = result?.style || {};
        pendingStyleSelectionRef.current = {
          entryId: typeof savedStyle.entryId === "string" ? savedStyle.entryId : undefined,
          groupId: typeof savedStyle.groupId === "string" ? savedStyle.groupId : selectedStyleGroupOption.groupId,
          styleId: typeof savedStyle.styleId === "string" ? savedStyle.styleId : styleDraftId,
        };
        setIsAddStyleOpen(false);
      },
      `Saved style ${styleLabel}.`,
      setStyleSaveError,
    );
  };

  const handleOpenAddCell = () => {
    const displayName = "";
    const contentSchema = defaultContentSchemaJson(displayName);
    const samplePayload = defaultSamplePayloadJson(displayName);
    setCellDraftDisplayName(displayName);
    setCellDraftType("");
    setCellDraftTypeEdited(false);
    setCellDraftStatus("draft");
    setCellDraftWhenToUse("");
    setCellDraftWhenNotToUse("");
    setCellDraftLlmInstruction("");
    setCellDraftContentSchema(contentSchema);
    setCellDraftPropsSchema(defaultPropsSchemaJson());
    setCellDraftSamplePayload(samplePayload);
    setCellDraftContentSchemaEdited(false);
    setCellDraftSamplePayloadEdited(false);
    setCellDraftRequiredFields("title, body");
    setCellDraftOptionalFields("items");
    setCellDraftContentBudget("45");
    setCellDraftAllowsHtml(false);
    setCellDraftAllowsRemoteImages(false);
    setCellDraftOverwrite(false);
    setCellSaveError("");
    cellContentSchemaRef.current = contentSchema;
    cellSamplePayloadRef.current = samplePayload;
    setIsAddStyleOpen(false);
    setIsAddCellOpen(true);
  };

  const handleCellDisplayNameChange = (value: string) => {
    setCellDraftDisplayName(value);
    if (!cellDraftTypeEdited) {
      setCellDraftType(clientCellType(value));
    }
  };

  const handleCellTypeChange = (value: string) => {
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "");
    setCellDraftType(cleaned.endsWith("Cell") || cleaned === "" ? cleaned : `${cleaned}Cell`);
    setCellDraftTypeEdited(true);
  };

  const handleResetCellJson = () => {
    const nextSchema = defaultContentSchemaJson(cellDraftDisplayName);
    const nextSample = defaultSamplePayloadJson(cellDraftDisplayName);
    setCellDraftContentSchema(nextSchema);
    setCellDraftSamplePayload(nextSample);
    setCellDraftPropsSchema(defaultPropsSchemaJson());
    setCellDraftContentSchemaEdited(false);
    setCellDraftSamplePayloadEdited(false);
    cellContentSchemaRef.current = nextSchema;
    cellSamplePayloadRef.current = nextSample;
  };

  const handleSaveCell = () => {
    if (!cellDraftType) {
      setCellSaveError("Enter a cell type.");
      return;
    }
    if (!/^[A-Z][A-Za-z0-9]*Cell$/.test(cellDraftType)) {
      setCellSaveError("Cell type must be PascalCase and end with Cell.");
      return;
    }
    setCellSaveError("");
    const displayName = cellDraftDisplayName.trim() || cellDraftType.replace(/Cell$/, "");
    runWorkbenchAction(
      async () => {
        const result = await postWorkbenchAction("cells", {
          cellType: cellDraftType,
          displayName,
          status: cellDraftStatus,
          whenToUse: cellDraftWhenToUse,
          whenNotToUse: cellDraftWhenNotToUse,
          llmInstruction: cellDraftLlmInstruction,
          contentSchema: cellDraftContentSchema,
          propsSchema: cellDraftPropsSchema,
          samplePayload: cellDraftSamplePayload,
          requiredFields: commaSeparatedList(cellDraftRequiredFields),
          optionalFields: commaSeparatedList(cellDraftOptionalFields),
          contentBudget: Number(cellDraftContentBudget),
          allowsHtml: cellDraftAllowsHtml,
          allowsRemoteImages: cellDraftAllowsRemoteImages,
          webRendererOnly: true,
          overwrite: cellDraftOverwrite,
        });
        const savedCell = result?.cell || {};
        pendingCellSelectionRef.current = {
          entryId: typeof savedCell.entryId === "string" ? savedCell.entryId : undefined,
          cellType: typeof savedCell.cellType === "string" ? savedCell.cellType : cellDraftType,
        };
        setIsAddCellOpen(false);
      },
      `Saved draft cell ${displayName}.`,
      setCellSaveError,
    );
  };

  const handleSelectLabMode = (nextLabMode: LabMode) => {
    setLabMode(nextLabMode);
    setJsonError("");
    if (nextLabMode === "production-ios") {
      setSource("backend");
      setDevice("iphone");
    }
    if (nextLabMode === "catalog") {
      if (showAll && catalogEntries.length) {
        setPayloadDraft(combinedPayload(catalogEntries, theme));
      } else if (selectedEntry) {
        setPayloadDraft(payloadWithTheme(payloadForEntryVariant(selectedEntry, selectedTextVariant), theme));
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
  const sourceLabel = isProductionIosMode
    ? "Production iOS / Backend latest"
    : effectiveSource === "local"
      ? "Local workbench"
      : "Backend latest";
  const canEditWorkbench = effectiveSource === "local" && !isProductionIosMode && workbenchApiAvailable && !isWorkbenchMutating;
  const previewTitle =
    usesRealLessonSamples(labMode)
      ? selectedRealLessonScreen
        ? selectedRealLessonScreen.title
        : isProductionIosMode
          ? "Production iOS preview"
          : "Real lesson preview"
      : showAll
        ? "All catalog samples"
        : selectedEntry
          ? `${selectedEntry.cell_type}: ${selectedEntry.label} (${TEXT_VARIANT_LABELS[selectedTextVariant]})`
          : "Preview";
  const previewSubtitle =
    labMode === "production-ios"
      ? "Backend latest, randomized-stable-unlocked, root CSS only, no overrides"
      : labMode === "real-lessons"
        ? selectedRealLessonScreen?.subtitle || "Reserved sample lesson screen"
      : showAll
        ? `stylePolicy: ${activePayload?.stylePolicy || REAL_LESSON_STYLE_POLICY}; text: Medium`
        : `stylePolicy: ${activePayload?.stylePolicy || REAL_LESSON_STYLE_POLICY}; text: ${TEXT_VARIANT_LABELS[selectedTextVariant]}`;

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
                disabled={isProductionIosMode}
                className={`h-9 rounded px-3 text-sm font-medium ${
                  effectiveSource === "local" ? "bg-[#17212b] text-white shadow-sm" : "text-[#5c6e7b]"
                }`}
              >
                Local workbench
              </button>
              <button
                type="button"
                onClick={() => setSource("backend")}
                disabled={isProductionIosMode}
                className={`h-9 rounded px-3 text-sm font-medium ${
                  effectiveSource === "backend" ? "bg-[#17212b] text-white shadow-sm" : "text-[#5c6e7b]"
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
          <button
            type="button"
            onClick={() => handleSelectLabMode("production-ios")}
            className={`inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-medium ${
              labMode === "production-ios" ? "bg-white text-[#17212b] shadow-sm" : "text-[#5c6e7b]"
            }`}
          >
            <MonitorSmartphone className="h-4 w-4" />
            Production iOS
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
              {effectiveSource === "local" && labMode === "catalog" ? (
                <div className="mt-3 border-t border-[#e1e8ee] pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={isAddStyleOpen ? () => setIsAddStyleOpen(false) : handleOpenAddStyle}
                      disabled={!canEditWorkbench || styleGroupOptions.length === 0}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#c7d2dc] bg-white px-3 text-xs font-semibold text-[#253440] disabled:opacity-50"
                    >
                      {isAddStyleOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      {isAddStyleOpen ? "Close style" : "Add style"}
                    </button>
                    <button
                      type="button"
                      onClick={isAddCellOpen ? () => setIsAddCellOpen(false) : handleOpenAddCell}
                      disabled={!canEditWorkbench}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#c7d2dc] bg-white px-3 text-xs font-semibold text-[#253440] disabled:opacity-50"
                    >
                      {isAddCellOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      {isAddCellOpen ? "Close cell" : "Add cell"}
                    </button>
                  </div>
                  {isAddStyleOpen ? (
                    <div className="mt-3 max-h-[58vh] space-y-2 overflow-y-auto rounded-md border border-[#d4dde5] bg-[#fbfcfd] p-3">
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[#728390]">
                        Style group
                        <select
                          value={selectedStyleGroupOption?.groupId || ""}
                          onChange={(event) => handleStyleGroupChange(event.target.value)}
                          disabled={!canEditWorkbench}
                          className="mt-1 h-9 w-full rounded-md border border-[#c7d2dc] bg-white px-2 text-sm font-medium normal-case tracking-normal text-[#17212b] disabled:opacity-50"
                        >
                          {styleGroupOptions.map((option) => (
                            <option key={option.groupId} value={option.groupId}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[#728390]">
                        Style name
                        <input
                          value={styleDraftName}
                          onChange={(event) => handleStyleNameChange(event.target.value)}
                          placeholder="Soft Pulse"
                          disabled={!canEditWorkbench}
                          className="mt-1 h-9 w-full rounded-md border border-[#c7d2dc] bg-white px-2 text-sm font-medium normal-case tracking-normal text-[#17212b] disabled:opacity-50"
                        />
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[#728390]">
                        Style slug
                        <input
                          value={styleDraftId}
                          onChange={(event) => handleStyleIdChange(event.target.value)}
                          placeholder="soft-pulse"
                          disabled={!canEditWorkbench}
                          className="mt-1 h-9 w-full rounded-md border border-[#c7d2dc] bg-white px-2 font-mono text-xs normal-case tracking-normal text-[#17212b] disabled:opacity-50"
                        />
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[#728390]">
                        CSS
                        <textarea
                          value={styleDraftCss}
                          onChange={(event) => {
                            setStyleDraftCss(event.target.value);
                            setStyleDraftCssEdited(true);
                          }}
                          spellCheck={false}
                          disabled={!canEditWorkbench}
                          className="mt-1 h-40 w-full resize-none rounded-md border border-[#c7d2dc] bg-white px-2 py-2 font-mono text-[11px] leading-4 normal-case tracking-normal text-[#17212b] disabled:opacity-50"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[#d4dde5] bg-white px-2 text-xs font-semibold text-[#425463]">
                          <input
                            type="checkbox"
                            checked={styleDraftLocked}
                            onChange={(event) => setStyleDraftLocked(event.target.checked)}
                            disabled={!canEditWorkbench}
                            className="h-4 w-4"
                          />
                          Locked
                        </label>
                        <label className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[#d4dde5] bg-white px-2 text-xs font-semibold text-[#425463]">
                          <input
                            type="checkbox"
                            checked={styleDraftOverwrite}
                            onChange={(event) => setStyleDraftOverwrite(event.target.checked)}
                            disabled={!canEditWorkbench}
                            className="h-4 w-4"
                          />
                          Overwrite
                        </label>
                      </div>
                      {styleSaveError ? (
                        <div className="rounded-md border border-[#f0c6c6] bg-[#fff6f6] px-3 py-2 text-xs text-[#9a2a2a]">
                          {styleSaveError}
                        </div>
                      ) : null}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleResetStyleCss}
                          disabled={!canEditWorkbench}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#c7d2dc] bg-white px-2 text-xs font-semibold text-[#425463] disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Reset CSS
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveStyle}
                          disabled={!canEditWorkbench || !styleDraftId}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#17212b] px-2 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Save style
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {isAddCellOpen ? (
                    <div className="mt-3 max-h-[58vh] space-y-2 overflow-y-auto rounded-md border border-[#d4dde5] bg-[#fbfcfd] p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[#728390]">
                          Display name
                          <input
                            value={cellDraftDisplayName}
                            onChange={(event) => handleCellDisplayNameChange(event.target.value)}
                            placeholder="Concept Map"
                            disabled={!canEditWorkbench}
                            className="mt-1 h-9 w-full rounded-md border border-[#c7d2dc] bg-white px-2 text-sm font-medium normal-case tracking-normal text-[#17212b] disabled:opacity-50"
                          />
                        </label>
                        <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[#728390]">
                          Cell type
                          <input
                            value={cellDraftType}
                            onChange={(event) => handleCellTypeChange(event.target.value)}
                            placeholder="ConceptMapCell"
                            disabled={!canEditWorkbench}
                            className="mt-1 h-9 w-full rounded-md border border-[#c7d2dc] bg-white px-2 font-mono text-xs normal-case tracking-normal text-[#17212b] disabled:opacity-50"
                          />
                        </label>
                      </div>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[#728390]">
                        Status
                        <select
                          value={cellDraftStatus}
                          onChange={(event) => setCellDraftStatus(event.target.value as "draft" | "ready_for_backend")}
                          disabled={!canEditWorkbench}
                          className="mt-1 h-9 w-full rounded-md border border-[#c7d2dc] bg-white px-2 text-sm font-medium normal-case tracking-normal text-[#17212b] disabled:opacity-50"
                        >
                          <option value="draft">Draft</option>
                          <option value="ready_for_backend">Ready for backend</option>
                        </select>
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[#728390]">
                        When to use
                        <textarea
                          value={cellDraftWhenToUse}
                          onChange={(event) => setCellDraftWhenToUse(event.target.value)}
                          placeholder="Use when the lesson needs..."
                          disabled={!canEditWorkbench}
                          className="mt-1 h-16 w-full resize-none rounded-md border border-[#c7d2dc] bg-white px-2 py-2 text-xs leading-4 normal-case tracking-normal text-[#17212b] disabled:opacity-50"
                        />
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[#728390]">
                        When not to use
                        <textarea
                          value={cellDraftWhenNotToUse}
                          onChange={(event) => setCellDraftWhenNotToUse(event.target.value)}
                          placeholder="Avoid when..."
                          disabled={!canEditWorkbench}
                          className="mt-1 h-14 w-full resize-none rounded-md border border-[#c7d2dc] bg-white px-2 py-2 text-xs leading-4 normal-case tracking-normal text-[#17212b] disabled:opacity-50"
                        />
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[#728390]">
                        LLM instruction
                        <textarea
                          value={cellDraftLlmInstruction}
                          onChange={(event) => setCellDraftLlmInstruction(event.target.value)}
                          placeholder="Produce concise content with..."
                          disabled={!canEditWorkbench}
                          className="mt-1 h-20 w-full resize-none rounded-md border border-[#c7d2dc] bg-white px-2 py-2 text-xs leading-4 normal-case tracking-normal text-[#17212b] disabled:opacity-50"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[#728390]">
                          Required fields
                          <input
                            value={cellDraftRequiredFields}
                            onChange={(event) => setCellDraftRequiredFields(event.target.value)}
                            disabled={!canEditWorkbench}
                            className="mt-1 h-9 w-full rounded-md border border-[#c7d2dc] bg-white px-2 text-xs normal-case tracking-normal text-[#17212b] disabled:opacity-50"
                          />
                        </label>
                        <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[#728390]">
                          Content budget
                          <input
                            value={cellDraftContentBudget}
                            onChange={(event) => setCellDraftContentBudget(event.target.value.replace(/[^0-9]/g, ""))}
                            disabled={!canEditWorkbench}
                            className="mt-1 h-9 w-full rounded-md border border-[#c7d2dc] bg-white px-2 text-xs normal-case tracking-normal text-[#17212b] disabled:opacity-50"
                          />
                        </label>
                      </div>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[#728390]">
                        Optional fields
                        <input
                          value={cellDraftOptionalFields}
                          onChange={(event) => setCellDraftOptionalFields(event.target.value)}
                          disabled={!canEditWorkbench}
                          className="mt-1 h-9 w-full rounded-md border border-[#c7d2dc] bg-white px-2 text-xs normal-case tracking-normal text-[#17212b] disabled:opacity-50"
                        />
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[#728390]">
                        Sample payload JSON
                        <textarea
                          value={cellDraftSamplePayload}
                          onChange={(event) => {
                            setCellDraftSamplePayload(event.target.value);
                            setCellDraftSamplePayloadEdited(true);
                          }}
                          spellCheck={false}
                          disabled={!canEditWorkbench}
                          className="mt-1 h-36 w-full resize-none rounded-md border border-[#c7d2dc] bg-white px-2 py-2 font-mono text-[11px] leading-4 normal-case tracking-normal text-[#17212b] disabled:opacity-50"
                        />
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[#728390]">
                        Content schema JSON
                        <textarea
                          value={cellDraftContentSchema}
                          onChange={(event) => {
                            setCellDraftContentSchema(event.target.value);
                            setCellDraftContentSchemaEdited(true);
                          }}
                          spellCheck={false}
                          disabled={!canEditWorkbench}
                          className="mt-1 h-36 w-full resize-none rounded-md border border-[#c7d2dc] bg-white px-2 py-2 font-mono text-[11px] leading-4 normal-case tracking-normal text-[#17212b] disabled:opacity-50"
                        />
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[#728390]">
                        Props schema JSON
                        <textarea
                          value={cellDraftPropsSchema}
                          onChange={(event) => setCellDraftPropsSchema(event.target.value)}
                          spellCheck={false}
                          disabled={!canEditWorkbench}
                          className="mt-1 h-24 w-full resize-none rounded-md border border-[#c7d2dc] bg-white px-2 py-2 font-mono text-[11px] leading-4 normal-case tracking-normal text-[#17212b] disabled:opacity-50"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[#d4dde5] bg-white px-2 text-xs font-semibold text-[#425463]">
                          <input
                            type="checkbox"
                            checked={cellDraftAllowsHtml}
                            onChange={(event) => setCellDraftAllowsHtml(event.target.checked)}
                            disabled={!canEditWorkbench}
                            className="h-4 w-4"
                          />
                          Allows HTML
                        </label>
                        <label className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[#d4dde5] bg-white px-2 text-xs font-semibold text-[#425463]">
                          <input
                            type="checkbox"
                            checked={cellDraftAllowsRemoteImages}
                            onChange={(event) => setCellDraftAllowsRemoteImages(event.target.checked)}
                            disabled={!canEditWorkbench}
                            className="h-4 w-4"
                          />
                          Remote images
                        </label>
                        <label className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[#d4dde5] bg-white px-2 text-xs font-semibold text-[#425463]">
                          <input type="checkbox" checked readOnly className="h-4 w-4" />
                          Web only
                        </label>
                        <label className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[#d4dde5] bg-white px-2 text-xs font-semibold text-[#425463]">
                          <input
                            type="checkbox"
                            checked={cellDraftOverwrite}
                            onChange={(event) => setCellDraftOverwrite(event.target.checked)}
                            disabled={!canEditWorkbench}
                            className="h-4 w-4"
                          />
                          Overwrite
                        </label>
                      </div>
                      {cellSaveError ? (
                        <div className="rounded-md border border-[#f0c6c6] bg-[#fff6f6] px-3 py-2 text-xs text-[#9a2a2a]">
                          {cellSaveError}
                        </div>
                      ) : null}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleResetCellJson}
                          disabled={!canEditWorkbench}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#c7d2dc] bg-white px-2 text-xs font-semibold text-[#425463] disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Reset JSON
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveCell}
                          disabled={!canEditWorkbench || !cellDraftType}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#17212b] px-2 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Save cell
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-3 rounded-md border border-[#d4dde5] bg-[#fbfcfd] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-semibold text-[#253440]">Draft cells</h3>
                        <p className="text-[11px] text-[#718390]">{workbenchCells.length ? `${workbenchCells.length} local definitions` : "No local draft cells yet"}</p>
                      </div>
                    </div>
                    {workbenchCells.length ? (
                      <div className="mt-2 space-y-2">
                        {workbenchCells.map((cell) => (
                          <div key={cell.cell_type} className="rounded-md border border-[#e1e8ee] bg-white px-3 py-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className="truncate text-xs font-semibold text-[#253440]">{cell.display_name}</div>
                                <div className="truncate font-mono text-[10px] text-[#718390]">{cell.cell_type}</div>
                              </div>
                              <span className="shrink-0 rounded-full bg-[#eef3f6] px-2 py-0.5 text-[10px] font-semibold text-[#5c6e7b]">
                                {cell.status === "ready_for_backend" ? "Ready" : "Draft"}
                              </span>
                            </div>
                            <div className="mt-2 grid gap-1 text-[10px] text-[#6c7d89]">
                              <span>1. Copy approved bundle into a new Django renderer version.</span>
                              <span>2. Add backend catalog and validation support.</span>
                              <span>3. Update mobile support only if needed outside web renderer.</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
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
                                        </span>
                                        <span className={`block text-xs ${isSelected ? "text-[#d2dbe3]" : "text-[#718390]"}`}>
                                          {entry.style_id || entry.render_mode || entry.cell_type}
                                        </span>
                                      </button>
                                      <div
                                        className={`my-1 flex shrink-0 items-center rounded border p-0.5 ${
                                          isSelected ? "border-white/20 bg-white/10" : "border-[#d4dde5] bg-white"
                                        }`}
                                      >
                                        {TEXT_VARIANTS.map((variant) => {
                                          const isActiveVariant = isSelected && selectedTextVariant === variant;
                                          return (
                                            <button
                                              key={variant}
                                              type="button"
                                              title={`${TEXT_VARIANT_LABELS[variant]} text sample`}
                                              aria-label={`${TEXT_VARIANT_LABELS[variant]} text sample`}
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                handleSelectEntry(entry, variant);
                                              }}
                                              className={`h-7 w-7 rounded text-[11px] font-bold transition ${
                                                isActiveVariant
                                                  ? isSelected
                                                    ? "bg-white text-[#17212b]"
                                                    : "bg-[#17212b] text-white"
                                                  : isSelected
                                                    ? "text-[#d2dbe3] hover:bg-white/15 hover:text-white"
                                                    : "text-[#58707f] hover:bg-[#edf3f7] hover:text-[#17212b]"
                                              }`}
                                            >
                                              {variant.charAt(0).toUpperCase()}
                                            </button>
                                          );
                                        })}
                                      </div>
                                      {hasLockState ? (
                                        <button
                                          type="button"
                                          title={entry.is_locked ? "Unlock for real lessons" : "Lock for real lessons"}
                                          onClick={() => handleToggleLock(entry)}
                                          disabled={!canToggle}
                                          className={`m-1 inline-flex w-8 shrink-0 items-center justify-center rounded border text-xs ${
                                            isSelected
                                              ? entry.is_locked
                                                ? "border-red-200/40 bg-red-500/20 text-red-100"
                                                : "border-emerald-200/40 bg-emerald-500/20 text-emerald-100"
                                              : entry.is_locked
                                                ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
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
                title={isProductionIosMode ? "Production iOS" : "Real Lessons"}
                subtitle={
                  isProductionIosMode
                    ? "Backend latest production-style samples"
                    : sampleLessons
                      ? `${sampleLessons.sample_count} reserved samples`
                      : "Loading example captures"
                }
                icon={isProductionIosMode ? "phone" : "book"}
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
                      key={`${labMode}-${device}-${theme}-${showAll ? "all" : selectedId}-${selectedTextVariant}-${selectedRealLessonScreenKey}-${manifest?.version || "unknown"}-${reloadToken}`}
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
                    {labMode === "production-ios"
                      ? "Production iOS randomized-stable-unlocked payload"
                      : labMode === "real-lessons"
                        ? "Real lesson randomized-stable-unlocked payload"
                        : "Local preview only"}
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
                <p className="text-xs text-[#6c7d89]">
                  {isProductionIosMode ? "Disabled in Production iOS mode" : "Injected after renderer.css"}
                </p>
              </div>
              <textarea
                value={cssOverride}
                onChange={(event) => setCssOverride(event.target.value)}
                placeholder={
                  isProductionIosMode
                    ? "Ignored in Production iOS mode."
                    : ".cell-card { outline: 2px solid rgba(79, 158, 149, .35); }"
                }
                spellCheck={false}
                disabled={isProductionIosMode}
                className="h-[calc(100%-58px)] min-h-[260px] w-full resize-none bg-[#fbfcfd] px-4 py-3 font-mono text-xs leading-5 text-[#15202b] outline-none disabled:text-[#8a9aa6]"
              />
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
