"use client";

import JSZip from "jszip";
import {
  MonitorSmartphone,
  Moon,
  RefreshCw,
  RotateCcw,
  Smartphone,
  Sun,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Device = "iphone" | "android";
type Theme = "light" | "dark";
type RendererSource = "local" | "backend";

type RendererManifest = {
  source?: string;
  renderer_id: string;
  version: string;
  schema_version: string;
  bundle_endpoint?: string;
  bundle_base_path?: string;
  catalog_path?: string;
  bundle_sha256?: string;
  bundle_size_bytes?: number;
};

type RendererPayload = {
  renderer_id: string;
  schema_version: string;
  version?: string;
  stylePolicy: "first-only" | "preview";
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
  payload: RendererPayload;
};

type RendererCatalog = {
  renderer_id: string;
  version: string;
  schema_version: string;
  stylePolicy: "first-only";
  entry_count: number;
  entries: CatalogEntry[];
};

type RendererBundle = {
  rendererCss: string;
  rendererJs: string;
  katexCss: string;
  katexJs: string;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_RENDERER_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.memsurf.com/api"
).replace(/\/$/, "");
const SITE_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const WORKBENCH_BASE_PATH = "/renderer-workbench/current";

const DEVICE_FRAMES: Record<Device, { label: string; width: number; height: number; icon: typeof Smartphone }> = {
  iphone: { label: "iPhone", width: 393, height: 852, icon: Smartphone },
  android: { label: "Android", width: 412, height: 915, icon: MonitorSmartphone },
};

function apiUrl(path: string) {
  return `${API_BASE_URL}/${path.replace(/^\//, "")}`;
}

function assetUrl(path: string) {
  return `${SITE_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
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

function jsonForScript(payload: RendererPayload) {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
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

  return css.replace(/url\((?:["']?)fonts\/([^)"']+)(?:["']?)\)/g, (match, fontName) => {
    return replacements.get(`fonts/${fontName}`) || match;
  });
}

async function loadBundle(buffer: ArrayBuffer): Promise<RendererBundle> {
  const zip = await JSZip.loadAsync(buffer);
  const rendererCssFile = zip.file("renderer.css");
  const rendererJsFile = zip.file("renderer.js");
  const katexCssFile = zip.file("katex.min.css");
  const katexJsFile = zip.file("katex.min.js");

  if (!rendererCssFile || !rendererJsFile || !katexCssFile || !katexJsFile) {
    throw new Error("Renderer bundle is missing required JS/CSS assets.");
  }

  const [rendererCss, rendererJs, katexCssRaw, katexJs] = await Promise.all([
    rendererCssFile.async("string"),
    rendererJsFile.async("string"),
    katexCssFile.async("string"),
    katexJsFile.async("string"),
  ]);

  const katexCss = await rewriteKatexFontUrls(zip, katexCssRaw);

  return { rendererCss, rendererJs, katexCss, katexJs };
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
  const [rendererCss, rendererJs, katexCssRaw, katexJs] = await Promise.all([
    fetchTextAsset(`${normalizedBase}/renderer.css`, cacheToken),
    fetchTextAsset(`${normalizedBase}/renderer.js`, cacheToken),
    fetchTextAsset(`${normalizedBase}/katex.min.css`, cacheToken),
    fetchTextAsset(`${normalizedBase}/katex.min.js`, cacheToken),
  ]);

  return {
    rendererCss,
    rendererJs,
    katexCss: rewriteStaticKatexFontUrls(katexCssRaw, bundleBasePath, cacheToken),
    katexJs,
  };
}

function payloadWithTheme(payload: RendererPayload, theme: Theme): RendererPayload {
  return {
    ...payload,
    theme,
    stylePolicy: "first-only",
  };
}

function combinedPayload(entries: CatalogEntry[], theme: Theme): RendererPayload {
  const first = entries[0]?.payload;
  return {
    renderer_id: first?.renderer_id || "dynamic_gridcell",
    schema_version: first?.schema_version || "three_step_gridcell_v1",
    version: first?.version,
    stylePolicy: "first-only",
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

function prettyJson(payload: RendererPayload) {
  return JSON.stringify(payload, null, 2);
}

function buildIframeDocument(bundle: RendererBundle, payload: RendererPayload, cssOverride: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <style>${styleSafe(bundle.katexCss)}</style>
  <style>${styleSafe(bundle.rendererCss)}</style>
  <style>
    html, body { min-height: 100%; margin: 0; overflow-x: hidden; }
    body { background: ${payload.theme === "dark" ? "#06111d" : "#eef5fb"}; }
    .scenario-shell { padding-left: 14px; padding-right: 14px; }
    ${styleSafe(cssOverride)}
  </style>
</head>
<body>
  <div id="grid-layout-root"></div>
  <script id="grid-layout-data" type="application/json">${jsonForScript(payload)}</script>
  <script>${scriptSafe(bundle.katexJs)}</script>
  <script>${scriptSafe(bundle.rendererJs)}</script>
</body>
</html>`;
}

export default function RendererLabPage() {
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

  const selectedEntry = useMemo(
    () => catalog?.entries.find((entry) => entry.id === selectedId) || catalog?.entries[0] || null,
    [catalog, selectedId],
  );

  const groupedEntries = useMemo(() => {
    const groups = new Map<string, CatalogEntry[]>();
    for (const entry of catalog?.entries || []) {
      groups.set(entry.group, [...(groups.get(entry.group) || []), entry]);
    }
    return Array.from(groups.entries());
  }, [catalog]);

  const setPayloadDraft = useCallback((payload: RendererPayload) => {
    setAppliedPayload(payload);
    setDraftJson(prettyJson(payload));
    setJsonError("");
  }, []);

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

  const activePayload = useMemo(() => {
    if (!appliedPayload) return null;
    return payloadWithTheme(appliedPayload, theme);
  }, [appliedPayload, theme]);

  const iframeDocument = useMemo(() => {
    if (!bundle || !activePayload) return "";
    return buildIframeDocument(bundle, activePayload, cssOverride);
  }, [activePayload, bundle, cssOverride]);

  const handleSelectEntry = (entry: CatalogEntry) => {
    setSelectedId(entry.id);
    setShowAll(false);
    setPayloadDraft(payloadWithTheme(entry.payload, theme));
  };

  const handleShowAll = () => {
    if (!catalog) return;
    setShowAll(true);
    setSelectedId("");
    setPayloadDraft(combinedPayload(catalog.entries, theme));
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
    if (showAll && catalog) {
      setPayloadDraft(combinedPayload(catalog.entries, theme));
      return;
    }
    if (selectedEntry) {
      setPayloadDraft(payloadWithTheme(selectedEntry.payload, theme));
    }
  };

  const frame = DEVICE_FRAMES[device];
  const FrameIcon = frame.icon;
  const sourceLabel = source === "local" ? "Local workbench" : "Backend latest";

  return (
    <main className="min-h-screen bg-[#f4f7f9] text-[#17212b]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-5 py-5 lg:px-8">
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
              onClick={() => setReloadToken((value) => value + 1)}
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

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[280px_minmax(420px,1fr)_420px]">
          <aside className="min-h-0 overflow-hidden rounded-lg border border-[#d4dde5] bg-white">
            <div className="flex items-center justify-between border-b border-[#e1e8ee] px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-[#17212b]">Catalog</h2>
                <p className="text-xs text-[#6c7d89]">{catalog ? `${catalog.entry_count} samples` : "Loading samples"}</p>
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
            <div className="max-h-[calc(100vh-150px)] overflow-y-auto px-2 py-2">
              {isLoading ? (
                <div className="px-3 py-4 text-sm text-[#6c7d89]">Loading renderer catalog...</div>
              ) : null}
              {groupedEntries.map(([group, entries]) => (
                <div key={group} className="mb-3">
                  <div className="px-2 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#728390]">{group}</div>
                  <div className="space-y-1">
                    {entries.map((entry) => {
                      const isSelected = !showAll && selectedId === entry.id;
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => handleSelectEntry(entry)}
                          className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                            isSelected
                              ? "bg-[#17212b] text-white"
                              : "text-[#253440] hover:bg-[#eef3f6]"
                          }`}
                        >
                          <span className="block font-medium">{entry.label}</span>
                          <span className={`block text-xs ${isSelected ? "text-[#d2dbe3]" : "text-[#718390]"}`}>
                            {entry.render_mode || entry.cell_type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="flex min-h-[780px] flex-col rounded-lg border border-[#d4dde5] bg-[#e8eef3]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d4dde5] bg-white px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-[#17212b]">
                  {showAll ? "All first-style samples" : selectedEntry ? `${selectedEntry.cell_type}: ${selectedEntry.label}` : "Preview"}
                </h2>
                <p className="text-xs text-[#6c7d89]">stylePolicy: first-only</p>
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
                      key={`${device}-${theme}-${showAll ? "all" : selectedId}-${manifest?.version || "unknown"}`}
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
                  <p className="text-xs text-[#6c7d89]">Local preview only</p>
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
