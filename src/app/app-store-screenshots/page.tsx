"use client";

import React, { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";

type ExportSize = {
  id: "iphone-6-7-portrait" | "iphone-6-7-landscape" | "iphone-6-5-portrait" | "iphone-6-5-landscape";
  label: string;
  width: number;
  height: number;
};

type Slide = {
  id: string;
  headline: string;
  subheadline: string;
  screenshotSrc: string;
  badge?: string;
  style: "hero" | "split" | "bottom-card" | "centered";
};

const EXPORT_SIZES: ExportSize[] = [
  { id: "iphone-6-7-portrait", label: 'iPhone 6.7" Portrait (1242 x 2688)', width: 1242, height: 2688 },
  { id: "iphone-6-7-landscape", label: 'iPhone 6.7" Landscape (2688 x 1242)', width: 2688, height: 1242 },
  { id: "iphone-6-5-portrait", label: 'iPhone 6.5" Portrait (1284 x 2778)', width: 1284, height: 2778 },
  { id: "iphone-6-5-landscape", label: 'iPhone 6.5" Landscape (2778 x 1284)', width: 2778, height: 1284 },
];

const SLIDES: Slide[] = [
  {
    id: "hero-memory-agent",
    headline: "Your Memory Agent.",
    subheadline: "Capture what matters. Practice what sticks.",
    screenshotSrc: "/app-store/iphone/home.png",
    badge: "MemSurf",
    style: "hero",
  },
  {
    id: "lessons",
    headline: "Learn In Structured Paths.",
    subheadline: "AI transforms raw captures into guided lesson modules.",
    screenshotSrc: "/app-store/iphone/lesson.png",
    badge: "Lessons",
    style: "split",
  },
  {
    id: "adaptive-quizzes",
    headline: "Practice Across Quiz Types.",
    subheadline: "Matching, multiple-choice, and more keep recall active.",
    screenshotSrc: "/app-store/iphone/matching-quiz.png",
    badge: "Adaptive Quizzes",
    style: "bottom-card",
  },
  {
    id: "daily-review",
    headline: "Daily Review, Always On Time.",
    subheadline: "Progressive sessions prioritize what is due next.",
    screenshotSrc: "/app-store/iphone/mcq-quiz.png",
    badge: "Spaced Practice",
    style: "centered",
  },
  {
    id: "containers",
    headline: "Organize By Learning Intent.",
    subheadline: "Use captures and containers to steer your study flow.",
    screenshotSrc: "/app-store/iphone/containers.png",
    badge: "Your Captures",
    style: "split",
  },
  {
    id: "social-momentum",
    headline: "Stay Consistent With Momentum.",
    subheadline: "Streaks, XP, and leagues help you keep showing up.",
    screenshotSrc: "/app-store/iphone/leaderboard.png",
    badge: "Social Progress",
    style: "bottom-card",
  },
];

const PREVIEW_SCALE = 0.17;

function SlideCanvas({
  slide,
  canvasWidth,
  canvasHeight,
}: {
  slide: Slide;
  canvasWidth: number;
  canvasHeight: number;
}) {
  const isLandscape = canvasWidth > canvasHeight;
  const scale = Math.min(canvasWidth / 1284, canvasHeight / 2778);
  const headlineSize = Math.max(86, Math.round(124 * scale));
  const subheadlineSize = Math.max(36, Math.round(54 * scale));
  const badgeSize = Math.max(24, Math.round(36 * scale));
  const portraitPhoneWidth = Math.round(920 * scale);
  const portraitPhoneHeight = Math.round(1880 * scale);
  const landscapePhoneWidth = Math.round(620 * scale);
  const landscapePhoneHeight = Math.round(1230 * scale);
  const isHeroMemoryAgent = slide.id === "hero-memory-agent";
  const isAdaptiveQuizzes = slide.id === "adaptive-quizzes";
  const isDailyReview = slide.id === "daily-review";
  const isSocialMomentum = slide.id === "social-momentum";

  const PhoneFrame = ({
    width,
    height,
    className = "",
  }: {
    width: number;
    height: number;
    className?: string;
  }) => (
    <div
      className={`relative rounded-[120px] border-[16px] border-white/35 bg-black/65 p-[18px] shadow-[0_30px_120px_rgba(94,234,212,0.25)] ${className}`}
      style={{ width, height }}
    >
      <div className="absolute top-[22px] left-1/2 -translate-x-1/2 h-[56px] w-[296px] rounded-full bg-black" />
      <img
        src={slide.screenshotSrc}
        alt={slide.id}
        className="h-full w-full rounded-[94px] object-cover"
        crossOrigin="anonymous"
      />
    </div>
  );

  if (isLandscape) {
    return (
      <div className="relative overflow-hidden rounded-[40px] border border-white/20 shadow-2xl bg-slate-950 h-full w-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(95,246,221,0.35),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(194,135,255,0.33),transparent_42%),radial-gradient(circle_at_45%_90%,rgba(135,186,255,0.28),transparent_40%),linear-gradient(180deg,#020817_0%,#030d1f_100%)]" />
        <div className="relative z-10 h-full w-full px-16 py-14 flex items-center gap-10">
          <div className="flex-1 space-y-5">
            {slide.badge ? (
              <p
                className="inline-flex rounded-full border border-cyan-100/30 bg-cyan-200/15 px-4 py-2 tracking-wide text-cyan-100"
                style={{ fontSize: badgeSize }}
              >
                {slide.badge}
              </p>
            ) : null}
            <h3 className="font-extrabold tracking-tight leading-[1.02]" style={{ fontSize: headlineSize }}>
              {slide.headline}
            </h3>
            <p className="text-slate-200 leading-[1.2] max-w-[95%]" style={{ fontSize: subheadlineSize }}>
              {slide.subheadline}
            </p>
          </div>
          <div className="w-[42%] flex justify-end">
            <PhoneFrame width={landscapePhoneWidth} height={landscapePhoneHeight} />
          </div>
        </div>
      </div>
    );
  }

  const renderBadge = () =>
    slide.badge ? (
      <p
        className="inline-flex rounded-full border border-cyan-100/30 bg-cyan-200/15 px-4 py-2 tracking-wide text-cyan-100"
        style={{ fontSize: badgeSize }}
      >
        {slide.badge}
      </p>
    ) : null;

  return (
    <div className="relative overflow-hidden rounded-[40px] border border-white/20 shadow-2xl bg-slate-950 h-full w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(95,246,221,0.35),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(194,135,255,0.33),transparent_42%),radial-gradient(circle_at_45%_90%,rgba(135,186,255,0.28),transparent_40%),linear-gradient(180deg,#020817_0%,#030d1f_100%)]" />
      {slide.style === "hero" ? (
        <div className="relative z-10 h-full px-16 pt-14 pb-10 flex flex-col">
          <div className="space-y-4">
            {renderBadge()}
            <h3 className="font-extrabold tracking-tight leading-[1.02] max-w-[94%]" style={{ fontSize: headlineSize + 10 }}>
              {slide.headline}
            </h3>
            <p className="text-slate-200 leading-[1.2] max-w-[92%]" style={{ fontSize: subheadlineSize + 8 }}>
              {slide.subheadline}
            </p>
          </div>
          <div className="mt-auto flex justify-center">
            {(() => {
              const multiplier = isHeroMemoryAgent ? 1.08 : 1;
              return (
                <PhoneFrame
                  width={Math.round(portraitPhoneWidth * multiplier)}
                  height={Math.round(portraitPhoneHeight * multiplier)}
                />
              );
            })()}
          </div>
        </div>
      ) : null}

      {slide.style === "split" ? (
        <div className="relative z-10 h-full px-14 py-14 flex flex-col">
          <div className="w-[64%] space-y-4">
            {renderBadge()}
            <h3 className="font-extrabold tracking-tight leading-[1.03]" style={{ fontSize: headlineSize + 8 }}>
              {slide.headline}
            </h3>
            <p className="text-slate-200 leading-[1.2]" style={{ fontSize: subheadlineSize + 6 }}>
              {slide.subheadline}
            </p>
          </div>
          <div className="mt-auto flex justify-end pb-8 pr-2">
            <PhoneFrame
              width={Math.round(portraitPhoneWidth * 0.98)}
              height={Math.round(portraitPhoneHeight * 0.98)}
              className="rotate-[2deg]"
            />
          </div>
        </div>
      ) : null}

      {slide.style === "bottom-card" ? (
        <div className="relative z-10 h-full px-12 py-10 flex flex-col">
          <div className="flex justify-center">
            {(() => {
              const multiplier = isAdaptiveQuizzes || isSocialMomentum ? 1.06 : 0.92;
              return (
                <PhoneFrame
                  width={Math.round(portraitPhoneWidth * multiplier)}
                  height={Math.round(portraitPhoneHeight * multiplier)}
                />
              );
            })()}
          </div>
          <div className="mt-auto rounded-[40px] border border-white/25 bg-slate-950/55 px-10 py-8 backdrop-blur-sm">
            <div className="space-y-3">
              {renderBadge()}
              <h3 className="font-extrabold tracking-tight leading-[1.04]" style={{ fontSize: headlineSize + 6 }}>
                {slide.headline}
              </h3>
              <p className="text-slate-200 leading-[1.2]" style={{ fontSize: subheadlineSize + 4 }}>
                {slide.subheadline}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {slide.style === "centered" ? (
        <div className="relative z-10 h-full px-16 pt-16 pb-10 flex flex-col items-center text-center">
          {renderBadge()}
          <h3
            className="font-extrabold tracking-tight leading-[1.03] max-w-[96%] mt-4"
            style={{ fontSize: headlineSize + 12 }}
          >
            {slide.headline}
          </h3>
          <p className="text-slate-200 leading-[1.18] max-w-[94%] mt-2" style={{ fontSize: subheadlineSize + 6 }}>
            {slide.subheadline}
          </p>
          <div className="mt-auto mb-2">
            {(() => {
              const multiplier = isDailyReview ? 1.1 : 0.96;
              return (
                <PhoneFrame
                  width={Math.round(portraitPhoneWidth * multiplier)}
                  height={Math.round(portraitPhoneHeight * multiplier)}
                />
              );
            })()}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function AppStoreScreenshotsPage() {
  const [selectedSizeId, setSelectedSizeId] = useState<ExportSize["id"]>("iphone-6-5-portrait");
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<string>("Ready to export");
  const [activeExportSlide, setActiveExportSlide] = useState<Slide>(SLIDES[0]);
  const exportCanvasRef = useRef<HTMLDivElement | null>(null);

  const selectedSize = useMemo(
    () => EXPORT_SIZES.find((size) => size.id === selectedSizeId) ?? EXPORT_SIZES[0],
    [selectedSizeId]
  );
  const previewWidth = Math.round(selectedSize.width * PREVIEW_SCALE);
  const previewHeight = Math.round(selectedSize.height * PREVIEW_SCALE);

  const sleep = (ms: number) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const renderExportCanvasForSlide = async (slide: Slide) => {
    setActiveExportSlide(slide);
    // Wait for React commit + image paint before capture.
    await sleep(80);
    await sleep(80);
  };

  const captureSlide = async (slide: Slide): Promise<string> => {
    await renderExportCanvasForSlide(slide);
    const target = exportCanvasRef.current;
    if (!target) {
      throw new Error("Export canvas not ready.");
    }

    return toPng(target, {
      cacheBust: true,
      pixelRatio: 1,
      width: selectedSize.width,
      height: selectedSize.height,
    });
  };

  const downloadDataUrl = (pngDataUrl: string, filename: string) => {
    const anchor = document.createElement("a");
    anchor.href = pngDataUrl;
    anchor.download = filename;
    anchor.click();
  };

  const exportSingleSlide = async (slide: Slide) => {
    setIsExporting(true);
    setStatus(`Exporting "${slide.id}"...`);
    try {
      const pngDataUrl = await captureSlide(slide);
      downloadDataUrl(pngDataUrl, `memsurf-${slide.id}-${selectedSize.id}.png`);
      setStatus(`Exported "${slide.id}"`);
    } catch (error) {
      console.error(error);
      setStatus(`Failed export for "${slide.id}"`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAllSlides = async () => {
    setIsExporting(true);
    setStatus("Preparing ZIP export...");
    try {
      const zip = new JSZip();
      for (const slide of SLIDES) {
        setStatus(`Exporting "${slide.id}"...`);
        const pngDataUrl = await captureSlide(slide);
        const base64Data = pngDataUrl.split(",")[1];
        zip.file(`memsurf-${slide.id}-${selectedSize.id}.png`, base64Data, { base64: true });

        // Small delay gives the browser room between renders.
        // eslint-disable-next-line no-await-in-loop
        await sleep(250);
      }

      setStatus("Building ZIP file...");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      const anchor = document.createElement("a");
      anchor.href = zipUrl;
      anchor.download = `memsurf-app-store-${selectedSize.id}.zip`;
      anchor.click();
      URL.revokeObjectURL(zipUrl);

      setStatus("Downloaded ZIP with all slides.");
    } catch (error) {
      console.error(error);
      setStatus("Failed while exporting all slides.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-3">
          <p className="inline-flex items-center rounded-full border border-cyan-200/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
            MemSurf Screenshot Studio
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">App Store Screenshot Generator</h1>
          <p className="text-slate-300 max-w-3xl">
            Uses your provided iPhone captures with ad-style copy. Pick a target Apple size and export
            each slide or the full set as PNGs.
          </p>
          <p className="text-xs text-amber-300/90">
            Export sizes are limited to App Store accepted dimensions: 1242x2688, 2688x1242, 1284x2778, 2778x1284.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="size-select" className="text-sm text-slate-300">
              Export size
            </label>
            <select
              id="size-select"
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white border border-white/15"
              value={selectedSizeId}
              onChange={(event) => setSelectedSizeId(event.target.value as ExportSize["id"])}
              disabled={isExporting}
            >
              {EXPORT_SIZES.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
              onClick={exportAllSlides}
              disabled={isExporting}
            >
              Export All Slides
            </button>
            <span className="text-sm text-slate-400">{status}</span>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {SLIDES.map((slide) => (
            <article key={slide.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">{slide.id}</h2>
                <button
                  type="button"
                  className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-60"
                  onClick={() => exportSingleSlide(slide)}
                  disabled={isExporting}
                >
                  Export
                </button>
              </div>

              <div
                style={{ width: previewWidth, height: previewHeight }}
                className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-900"
              >
                <div
                  style={{
                    width: selectedSize.width,
                    height: selectedSize.height,
                    transform: `scale(${PREVIEW_SCALE})`,
                    transformOrigin: "top left",
                  }}
                  className="absolute left-0 top-0"
                >
                  <SlideCanvas slide={slide} canvasWidth={selectedSize.width} canvasHeight={selectedSize.height} />
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>

      <div className="fixed -left-[20000px] top-0 pointer-events-none opacity-0">
        <div ref={exportCanvasRef} style={{ width: selectedSize.width, height: selectedSize.height }}>
          <SlideCanvas
            slide={activeExportSlide}
            canvasWidth={selectedSize.width}
            canvasHeight={selectedSize.height}
          />
        </div>
      </div>
    </main>
  );
}
