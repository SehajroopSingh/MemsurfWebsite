'use client'

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import {
  MOBILE_COLLAGE_PANEL_GRADIENT,
  MOBILE_FRAME_SLOT,
  mobileHoverFontSizeCssVar,
  mobilePanelH,
  mobilePanelW,
  mobilePanelX,
  mobilePanelY,
  type MobileFrameVariant,
} from './mobileCollageConfig'
import {
  buildMobileCollageSlides,
  getMobilePaneMedia,
  getMobileReadyAssetKeys,
  type MobilePaneMedia,
} from './mobileCollageMedia'
import type { MobileCollageSlideConfig } from './mobileCollageConfig'

const WINDOW_HOVER_SCALE = 1.1
const VIDEO_CROP_ZOOM = 1.14
const ARCH_TOP_MEDIA_SCALE = 1.12
const HOVER_FALLOFF_DELAY_MS = 200

const W3_FRAME_HOVER_FILTER =
  'drop-shadow(0 0 22px rgba(137, 176, 235, 0.5)) drop-shadow(0 0 46px rgba(165, 128, 218, 0.3)) drop-shadow(0 0 72px rgba(143, 225, 212, 0.14)) drop-shadow(0 14px 32px rgba(0, 0, 0, 0.55))'

const ARCH_SPRING_LINE_PCT = 30
const ARCH_SPRING_LINE_RATIO = ARCH_SPRING_LINE_PCT / 100
const ARCH_CLIP_PATH_D = `M 0,1 L 0,${ARCH_SPRING_LINE_RATIO} A 0.5 ${ARCH_SPRING_LINE_RATIO} 0 0 1 1,${ARCH_SPRING_LINE_RATIO} L 1,1 Z`
const ARCH_FRAME_PATH_D = `M 0,100 L 0,${ARCH_SPRING_LINE_PCT} A 50 ${ARCH_SPRING_LINE_PCT} 0 0 1 100,${ARCH_SPRING_LINE_PCT} L 100,100 Z`
const ARCH_RADIAL_DEGREES = [45, 90, 135]
const FRAME_COLOR = '#000000'

const HOVER_STAGGER_TEXT_SHADOW = '0px 0px 23px rgba(255, 255, 255, 1)'
const hoverStaggerTextGlowHidden = '0px 0px 0px rgba(255, 255, 255, 0)'
const w3LineEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

const outsideStaggerLineVariants = {
  hidden: {
    opacity: 0,
    y: 8,
    textShadow: hoverStaggerTextGlowHidden,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
  visible: {
    opacity: 1,
    y: 0,
    textShadow: HOVER_STAGGER_TEXT_SHADOW,
    transition: { duration: 0.52, ease: w3LineEase },
  },
}

const outsideStaggerContainerVariants = {
  hidden: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 as const },
  },
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.06 },
  },
}

function videoCoverObjectPositionParts(
  item: Pick<
    MobilePaneMedia,
    'videoObjectPosition' | 'videoObjectPositionNarrow'
  >,
): { extraClass: string; positionStyle: React.CSSProperties } {
  const wide = item.videoObjectPosition ?? 'center'
  const narrow = item.videoObjectPositionNarrow
  if (narrow == null) {
    return { extraClass: '', positionStyle: { objectPosition: wide } }
  }
  return {
    extraClass:
      '[object-position:var(--video-object-narrow)]',
    positionStyle: {
      ['--video-object-narrow' as string]: narrow,
      objectPosition: narrow,
    } as React.CSSProperties,
  }
}

function MobileCollageHoverLine({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <motion.span
      variants={outsideStaggerLineVariants}
      className="mobile-collage-hover-line block text-center"
    >
      {children}
    </motion.span>
  )
}

function MobileHoverStagger({
  lines,
  isVisible,
}: {
  lines: readonly string[]
  isVisible: boolean
}) {
  return (
    <motion.div
      initial={false}
      animate={isVisible ? 'visible' : 'hidden'}
      variants={outsideStaggerContainerVariants}
      className="mobile-collage-hover-stack flex w-full max-w-[min(70cqi,calc(100%-2rem))] flex-col items-center mx-auto"
      aria-hidden={!isVisible}
    >
      {lines.map((line, i) => (
        <MobileCollageHoverLine key={`${i}-${line.slice(0, 10)}`}>
          {line}
        </MobileCollageHoverLine>
      ))}
    </motion.div>
  )
}

function renderWindowPanes(variant: MobileFrameVariant) {
  const lineClass =
    'absolute bg-black pointer-events-none z-10 opacity-80'
  switch (variant) {
    case 'split-v':
      return (
        <div
          className={`top-0 left-1/2 w-[4px] h-full -ml-[2px] ${lineClass}`}
        />
      )
    case 'grid-4':
    case 'bed-combined':
      return (
        <>
          <div
            className={`top-1/2 left-0 w-full h-[4px] -mt-[2px] ${lineClass}`}
          />
          <div
            className={`top-0 left-1/2 w-[4px] h-full -ml-[2px] ${lineClass}`}
          />
        </>
      )
    case 'grid-6':
      return (
        <>
          <div
            className={`top-1/2 left-0 w-full h-[4px] -mt-[2px] ${lineClass}`}
          />
          <div
            className={`top-0 left-1/3 w-[4px] h-full -ml-[1.33px] ${lineClass}`}
          />
          <div
            className={`top-0 left-2/3 w-[4px] h-full -ml-[1.33px] ${lineClass}`}
          />
        </>
      )
    default:
      return null
  }
}

function ArchedTopWindowMullions() {
  const lineClass = 'absolute bg-black pointer-events-none z-[11] opacity-100'
  const lowerHeight = `${100 - ARCH_SPRING_LINE_PCT}%`

  const renderRadials = (strokeWidth: number) =>
    ARCH_RADIAL_DEGREES.map((deg) => {
      const rad = (deg * Math.PI) / 180
      const x2 = 50 + 50 * Math.cos(rad)
      const y2 = ARCH_SPRING_LINE_PCT - ARCH_SPRING_LINE_PCT * Math.sin(rad)
      return (
        <line
          key={deg}
          x1={50}
          y1={ARCH_SPRING_LINE_PCT}
          x2={x2}
          y2={y2}
          stroke={FRAME_COLOR}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      )
    })

  return (
    <>
      <div
        className={`left-0 w-full h-[4px] -mt-[2px] ${lineClass}`}
        style={{ top: `${ARCH_SPRING_LINE_PCT}%` }}
      />
      <div
        className={`left-1/2 w-[4px] -ml-[2px] ${lineClass}`}
        style={{ top: `${ARCH_SPRING_LINE_PCT}%`, height: lowerHeight }}
      />
      <svg
        className="pointer-events-none absolute inset-0 z-[11] h-full w-full opacity-80"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <g>{renderRadials(4)}</g>
      </svg>
    </>
  )
}

function ArchedTopWindowFrame() {
  return (
    <svg
      className="pointer-events-none absolute inset-[-1px] z-10 h-[calc(100%+2px)] w-[calc(100%+2px)]"
      viewBox="-0.5 -0.5 101 101"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d={ARCH_FRAME_PATH_D}
        fill="none"
        stroke={FRAME_COLOR}
        strokeWidth={13}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function IntroFitsGrid() {
  return (
    <div className="relative h-full w-full border-[6px] border-white bg-black">
      <div className="absolute top-1/2 left-0 right-0 h-[4px] -mt-[2px] bg-white/40" />
      <div className="absolute top-0 bottom-0 left-1/2 w-[6px] -ml-[3px] bg-white/40" />
      <div className="absolute inset-0 flex items-center justify-center">
        <p
          className="font-bold italic text-white text-center leading-none"
          style={{
            fontSize: 'var(--mobile-fits-size)',
            textShadow: '0px 0px 20px rgba(255,255,255,0.66)',
          }}
        >
          fits
        </p>
      </div>
    </div>
  )
}

function CollageWindowFrame({
  variant,
  media,
  isActive,
  archClipId,
  targetId,
  onAssetReady,
  videoRef,
}: {
  variant: MobileFrameVariant
  media: MobilePaneMedia
  isActive: boolean
  archClipId: string
  targetId: string
  onAssetReady: (key: string) => void
  videoRef: (el: HTMLVideoElement | null) => void
}) {
  const isArch = variant === 'arched-top' || media.frameShape === 'arched-top'
  const videoZoom = media.videoCropZoom ?? VIDEO_CROP_ZOOM
  const mediaW = media.videoMediaWidthPct
  const videoOp = videoCoverObjectPositionParts(media)
  const archClipStyle = isArch
    ? { clipPath: `url(#${archClipId})` as const }
    : undefined

  const outerStyle: React.CSSProperties = isArch
    ? {
        transform: isActive ? `scale(${WINDOW_HOVER_SCALE})` : 'scale(1)',
        transformOrigin: 'center',
        backfaceVisibility: 'hidden',
        ...archClipStyle,
        filter: isActive ? W3_FRAME_HOVER_FILTER : 'drop-shadow(0 10px 18px rgba(0, 0, 0, 0.35))',
      }
    : {
        transform: isActive ? `scale(${WINDOW_HOVER_SCALE})` : 'scale(1)',
        transformOrigin: 'center',
        backfaceVisibility: 'hidden',
        boxShadow: isActive
          ? '0 14px 28px -8px rgba(0, 0, 0, 0.45)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      }

  return (
    <div
      className={`h-full w-full relative transition-transform duration-500 ease-out ${
        isArch ? 'overflow-hidden bg-black' : 'bg-black'
      }`}
      style={outerStyle}
    >
      <div
        className={`relative h-full w-full overflow-hidden border-2 border-black z-20 ${
          isArch ? '' : 'rounded-sm'
        }`}
        style={isArch ? archClipStyle : undefined}
      >
        {media.videoSrc ? (
          <div className="absolute inset-0 bg-black">
            <div className="relative h-full w-full overflow-hidden">
              <video
                ref={videoRef}
                src={media.videoSrc}
                className={`absolute left-1/2 top-1/2 min-h-full min-w-full object-cover ${
                  mediaW != null
                    ? 'max-w-none'
                    : ''
                } ${videoOp.extraClass}`.trim()}
                style={{
                  width: mediaW != null ? `${mediaW}%` : undefined,
                  transform: `translate(-50%, -50%) scale(${videoZoom})`,
                  ...videoOp.positionStyle,
                }}
                muted
                loop
                playsInline
                preload="metadata"
                onLoadedMetadata={() => onAssetReady(`video:${targetId}`)}
                onError={() => onAssetReady(`video:${targetId}`)}
                aria-hidden
              />
              {!isActive && (
                <div className="absolute inset-0 z-[1] overflow-hidden" aria-hidden>
                  <Image
                    src={media.imageUrl}
                    alt=""
                    fill
                    className={`object-cover opacity-95 ${videoOp.extraClass}`.trim()}
                    style={videoOp.positionStyle}
                    sizes="100vw"
                    onLoad={() => onAssetReady(`image:${targetId}`)}
                    onError={() => onAssetReady(`image:${targetId}`)}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full">
            <Image
              src={media.imageUrl}
              alt=""
              fill
              className="object-cover opacity-90"
              sizes="100vw"
              onLoad={() => onAssetReady(`image:${targetId}`)}
              onError={() => onAssetReady(`image:${targetId}`)}
            />
          </div>
        )}
        {isArch ? <ArchedTopWindowFrame /> : (
          <div
            className="absolute inset-0 border-[6px] border-black pointer-events-none z-20"
            aria-hidden
          />
        )}
        {isArch ? <ArchedTopWindowMullions /> : renderWindowPanes(variant)}
      </div>
    </div>
  )
}

function MobileCollagePanelTemplate({
  slide,
  isActive,
  hoveredId,
  children,
}: {
  slide: MobileCollageSlideConfig
  isActive: boolean
  hoveredId: string | null
  children: React.ReactNode
}) {
  const isWindow = slide.kind === 'window'
  const showGradient =
    isWindow && hoveredId === (slide.kind === 'window' ? slide.targetId : null)

  return (
    <div className="mobile-collage-panel relative h-full w-full overflow-visible">
      <div
        className="mobile-collage-panel-inner relative mx-auto flex h-full min-h-[100dvh] w-full max-h-[100dvh] flex-col overflow-visible"
        style={
          {
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            ['--mobile-hover-font-size' as string]: mobileHoverFontSizeCssVar(),
            ['--mobile-fits-size' as string]:
              'clamp(2.5rem, 24.4cqi, 6rem)',
            ['--mobile-title-size' as string]:
              'clamp(1.25rem, 8.14cqi, 2rem)',
            ['--mobile-tagline-size' as string]:
              'clamp(1rem, 6.1cqi, 1.5rem)',
            ['--mobile-footer-bold-size' as string]:
              'clamp(0.875rem, 5.1cqi, 1.25rem)',
          } as React.CSSProperties
        }
      >
        {/* Full viewport width — not clipped to aspect-[393/852] content column */}
        <AnimatePresence>
          {showGradient ? (
            <motion.div
              key="mobile-panel-gradient"
              className="pointer-events-none absolute left-1/2 top-0 bottom-0 z-[20] h-full w-screen max-w-[100vw] -translate-x-1/2 backdrop-blur-[2px]"
              style={{ backgroundImage: MOBILE_COLLAGE_PANEL_GRADIENT }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              aria-hidden
            />
          ) : null}
        </AnimatePresence>

        <div className="relative z-[25] mx-auto flex h-full w-full min-h-0 max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] max-w-full flex-col [container-type:inline-size] aspect-[393/852]">
          <h2
            className="relative z-[30] shrink-0 px-4 pt-6 text-center font-semibold text-white [text-wrap:balance]"
            style={{
              fontSize: 'var(--mobile-title-size)',
              textShadow: '0px 0px 20px rgba(255,255,255,0.66)',
            }}
          >
            Windows of Possibility
          </h2>

          <div className="relative z-[25] min-h-0 flex-1 px-3">{children}</div>

          <div className="relative z-[30] shrink-0 px-4 pb-2 pt-2">
            <p
              className="text-center text-[#f3f4f6] [font-family:var(--font-collage-note),serif] [text-wrap:balance]"
              style={{
                fontSize: 'var(--mobile-tagline-size)',
                textShadow: '0px 0px 20px rgba(255,255,255,1)',
              }}
            >
              If life gives you something worth keeping.
            </p>
            <p
              className="mt-2 text-right font-bold leading-tight text-white tracking-tight"
              style={{
                fontSize: 'var(--mobile-footer-bold-size)',
                textShadow: '0px 0px 20px rgba(255,255,255,0.85)',
              }}
            >
              MemSurf helps you
              <br />
              remember it.
            </p>
            <div className="mt-3 flex justify-center">
              <img
                src="/logos/memsurf-logo.svg"
                alt="MemSurf"
                className="pointer-events-none"
                style={{
                  width: 'clamp(3.5rem, 22.6cqi, 5.5rem)',
                  height: 'auto',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MobileIntroContent() {
  return (
    <>
      <p
        className="absolute font-bold italic text-white text-right"
        style={{
          right: mobilePanelX(94),
          top: mobilePanelY(205.5),
          fontSize: 'clamp(1rem, 6.1cqi, 1.5rem)',
          textShadow: '0px 0px 20px rgba(255,255,255,0.66)',
        }}
      >
        Swipe
      </p>
      <div
        className="absolute text-right text-white"
        style={{
          right: mobilePanelX(81.5),
          top: mobilePanelY(248),
          maxWidth: mobilePanelW(272),
          textShadow: '0px 0px 20px rgba(255,255,255,0.66)',
          fontSize: 'clamp(0.875rem, 5.1cqi, 1.25rem)',
        }}
      >
        <span className="font-semibold">To Explore How </span>
        <span
          className="bg-clip-text font-semibold text-transparent"
          style={{
            backgroundImage:
              'linear-gradient(90deg, #E6B3FF 3.91%, #84AAE1 51.8%, #96EEDC 100%)',
          }}
        >
          MemSurf
        </span>
      </div>
      <div
        className="absolute"
        style={{
          left: MOBILE_FRAME_SLOT['intro-fits-grid'].leftPct != null
            ? `${MOBILE_FRAME_SLOT['intro-fits-grid'].leftPct}%`
            : '50%',
          top: `${MOBILE_FRAME_SLOT['intro-fits-grid'].topPct}%`,
          width: `${MOBILE_FRAME_SLOT['intro-fits-grid'].widthPct}%`,
          height: `${MOBILE_FRAME_SLOT['intro-fits-grid'].heightPct}%`,
          transform:
            MOBILE_FRAME_SLOT['intro-fits-grid'].leftPct == null
              ? 'translateX(-50%)'
              : undefined,
        }}
      >
        <IntroFitsGrid />
      </div>
    </>
  )
}

function MobileWindowSlideBody({
  slide,
  isActive,
  archClipId,
  onAssetReady,
  registerVideoRef,
}: {
  slide: Extract<MobileCollageSlideConfig, { kind: 'window' }>
  isActive: boolean
  archClipId: string
  onAssetReady: (key: string) => void
  registerVideoRef: (targetId: string, el: HTMLVideoElement | null) => void
}) {
  const media = getMobilePaneMedia(slide.targetId)
  const slot = MOBILE_FRAME_SLOT[slide.frameVariant]
  if (!media) return null

  const left =
    slot.leftPct != null
      ? `${slot.leftPct}%`
      : `${(100 - slot.widthPct) / 2}%`

  return (
    <div className="relative h-full w-full">
      <div
        className="absolute"
        style={{
          left,
          top: `${slot.topPct}%`,
          width: `${slot.widthPct}%`,
          height: `${slot.heightPct}%`,
        }}
      >
        <CollageWindowFrame
          variant={slide.frameVariant}
          media={media}
          isActive={isActive}
          archClipId={archClipId}
          targetId={slide.targetId}
          onAssetReady={onAssetReady}
          videoRef={(el) => registerVideoRef(slide.targetId, el)}
        />
      </div>
      <div
        className="absolute left-0 right-0 z-[40] px-3"
        style={{ top: mobilePanelY(520), bottom: mobilePanelY(200) }}
      >
        <MobileHoverStagger lines={slide.hoverLines} isVisible={isActive} />
      </div>
    </div>
  )
}

type MobileCollageCarouselProps = {
  onReady?: () => void
}

export default function MobileCollageCarousel({
  onReady,
}: MobileCollageCarouselProps) {
  const archClipId = useId().replace(/:/g, '')
  const slides = useMemo(() => buildMobileCollageSlides(), [])
  const scrollRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const videoRefs = useRef<Partial<Record<string, HTMLVideoElement | null>>>({})
  const hoverFalloffTimeoutRef = useRef<number | null>(null)
  const readyAssetKeysRef = useRef<Set<string>>(new Set())
  const hasReportedReadyRef = useRef(false)

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)

  const requiredKeys = useMemo(() => getMobileReadyAssetKeys(), [])

  const markAssetReady = useCallback(
    (key: string) => {
      if (!onReady || hasReportedReadyRef.current) return
      readyAssetKeysRef.current.add(key)
      if (readyAssetKeysRef.current.size >= requiredKeys.length) {
        hasReportedReadyRef.current = true
        onReady()
      }
    },
    [onReady, requiredKeys.length],
  )

  useEffect(() => {
    readyAssetKeysRef.current.clear()
    hasReportedReadyRef.current = false
    if (!onReady) return
    if (requiredKeys.length === 0) {
      hasReportedReadyRef.current = true
      onReady()
    }
  }, [onReady, requiredKeys.length])

  const activateHover = useCallback((id: string) => {
    if (hoverFalloffTimeoutRef.current != null) {
      window.clearTimeout(hoverFalloffTimeoutRef.current)
      hoverFalloffTimeoutRef.current = null
    }
    setHoveredId(id)
  }, [])

  const scheduleHoverClear = useCallback(() => {
    if (hoverFalloffTimeoutRef.current != null) {
      window.clearTimeout(hoverFalloffTimeoutRef.current)
    }
    hoverFalloffTimeoutRef.current = window.setTimeout(() => {
      setHoveredId(null)
      hoverFalloffTimeoutRef.current = null
    }, HOVER_FALLOFF_DELAY_MS)
  }, [])

  const registerVideoRef = useCallback(
    (targetId: string, el: HTMLVideoElement | null) => {
      if (el) videoRefs.current[targetId] = el
      else delete videoRefs.current[targetId]
    },
    [],
  )

  useEffect(() => {
    for (const slide of slides) {
      if (slide.kind !== 'window') continue
      const media = getMobilePaneMedia(slide.targetId)
      if (!media?.videoSrc) continue
      const el = videoRefs.current[slide.targetId]
      if (!el) continue
      if (hoveredId === slide.targetId) {
        void el.play().catch(() => {})
      } else {
        el.pause()
        el.currentTime = 0
      }
    }
  }, [hoveredId, slides])

  useEffect(() => {
    const root = scrollRef.current
    if (!root || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { index: number; ratio: number } | null = null
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = Number(
            (entry.target as HTMLElement).dataset.slideIndex ?? -1,
          )
          if (index < 0) continue
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { index, ratio: entry.intersectionRatio }
          }
        }
        if (!best || best.ratio < 0.45) return

        setActiveSlideIndex(best.index)
        const slide = slides[best.index]
        if (!slide) return

        if (slide.kind === 'intro') {
          scheduleHoverClear()
          setHoveredId(null)
        } else if (best.ratio >= 0.55) {
          activateHover(slide.targetId)
        }
      },
      { root, threshold: [0.45, 0.55, 0.65, 0.75] },
    )

    slideRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [slides, activateHover, scheduleHoverClear])

  const scrollToIndex = (index: number) => {
    const el = slideRefs.current[index]
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  return (
    <div className="relative w-full overflow-visible">
      <svg
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        aria-hidden
      >
        <defs>
          <clipPath id={archClipId} clipPathUnits="objectBoundingBox">
            <path d={ARCH_CLIP_PATH_D} />
          </clipPath>
        </defs>
      </svg>

      <div
        ref={scrollRef}
        className="mobile-collage-scroll flex w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabIndex={0}
        aria-label="Windows of Possibility carousel"
      >
        {slides.map((slide, index) => {
          const isWindow = slide.kind === 'window'
          const isActive = isWindow && hoveredId === slide.targetId

          return (
            <div
              key={slide.kind === 'intro' ? 'intro' : slide.targetId}
              ref={(el) => {
                slideRefs.current[index] = el
              }}
              data-slide-index={index}
              data-slide-target={
                slide.kind === 'window' ? slide.targetId : 'intro'
              }
              className="h-full w-full min-w-full shrink-0 snap-center snap-always overflow-visible"
            >
              <MobileCollagePanelTemplate
                slide={slide}
                isActive={isActive}
                hoveredId={hoveredId}
              >
                {slide.kind === 'intro' ? (
                  <MobileIntroContent />
                ) : (
                  <MobileWindowSlideBody
                    slide={slide}
                    isActive={isActive}
                    archClipId={archClipId}
                    onAssetReady={markAssetReady}
                    registerVideoRef={registerVideoRef}
                  />
                )}
              </MobileCollagePanelTemplate>
            </div>
          )
        })}
      </div>

      <div
        className="pointer-events-none absolute left-0 right-0 z-[50] flex justify-center gap-2"
        style={{ bottom: 'max(5.5rem, calc(env(safe-area-inset-bottom) + 4.5rem))' }}
        aria-hidden
      >
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={activeSlideIndex === i ? 'true' : undefined}
            onClick={() => scrollToIndex(i)}
          >
            <span
              className={`block rounded-full border border-white/80 transition-colors ${
                activeSlideIndex === i
                  ? 'h-2.5 w-2.5 bg-white'
                  : 'h-2 w-2 bg-transparent'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
