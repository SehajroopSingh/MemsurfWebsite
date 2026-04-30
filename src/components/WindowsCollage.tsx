'use client'

import React, { useCallback, useState, useRef, useEffect, useId } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useAmplitude } from '@/hooks/useAmplitude'

type PaneType = 'single' | 'split-v' | 'split-h' | 'grid-4' | 'grid-6' | 'grid-9';

interface WindowData {
  id: string
  imageUrl: string
  /** When set, idle shows poster image; on hover the video plays. */
  videoSrc?: string
  /** True square frame: height % of collage, width = height (capped by maxWidth). */
  square?: boolean
  /** Wide 16:9 frame: height from `height`, width follows aspect (capped by `width`). */
  wide169?: boolean
  /** Video/poster `object-position` when using cover + zoom (e.g. `center top`). */
  videoObjectPosition?: string
  /**
   * `object-position` below Tailwind `md` (narrow layout). Wide screens use `videoObjectPosition`.
   * Use a higher horizontal % (e.g. `62% center`) to shift framing toward the right.
   */
  videoObjectPositionNarrow?: string
  /** Override `VIDEO_CROP_ZOOM` for this video only. */
  videoCropZoom?: number
  /** Wider than 100% = horizontal overscan; overflow clips side letterboxing (e.g. 155G��175). */
  videoMediaWidthPct?: number
  top: string
  left: string
  width: string
  height: string
  zIndex: number
  paneType: PaneType
  frameShape?: 'rect' | 'arched-top'
  sharedSceneGroupId?: string
}

interface SharedSceneGroup {
  imageUrl: string
  /** Same clip played in every pane that references this group (hover is synced via `sharedSceneGroupId`). */
  videoSrc?: string
  top: number
  left: number
  width: number
  height: number
  /**
   * Collage-% points added to the gap between the two horizontal panes in UV space only.
   * Makes the video GǣjumpGǥ across the mullion/padding so edges donG��t line up like one continuous crop.
   */
  horizontalGapExtra?: number
}

/** Hover scale on the outer frame (was 1.5; keep subtle so panes donG��t dominate the collage). */
const WINDOW_HOVER_SCALE = 1.1

/** Slight zoom so video/poster are cropped (edges clipped) inside the window. */
const VIDEO_CROP_ZOOM = 1.14

/** Extra scale + focal bias so arched-top windows fill the semicircle (no empty/black wedges in the curve). */
const ARCH_TOP_MEDIA_SCALE = 1.12

const COLLAGE_DESIGN_WIDTH = 1481.51
const COLLAGE_DESIGN_HEIGHT = 2582

function designX(px: number): string {
  return `${(px / COLLAGE_DESIGN_WIDTH) * 100}%`
}

function designY(px: number): string {
  return `${(px / COLLAGE_DESIGN_HEIGHT) * 100}%`
}

const sharedSceneGroups: Record<string, SharedSceneGroup> = {
  /** Bounding box must match the union of all panes in this scene (w4 + w5). */
  bedRoom: {
    imageUrl: '/videos/veo3.1-with-reference-images-bed-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-bed.mp4',
    top: 48.33,
    left: 73.03,
    width: 26.97,
    height: 17.43,
    horizontalGapExtra: 3,
  },
}

function percentValue(value: string): number {
  return Number.parseFloat(value)
}

function getWindowVideoSrc(item: WindowData): string | undefined {
  if (item.videoSrc) return item.videoSrc
  const g = item.sharedSceneGroupId
    ? sharedSceneGroups[item.sharedSceneGroupId]
    : undefined
  return g?.videoSrc
}

function sharedScenePanesSorted(groupId: string): WindowData[] {
  return windowData
    .filter((w) => w.sharedSceneGroupId === groupId)
    .sort((a, b) => percentValue(a.left) - percentValue(b.left))
}

/** Virtual horizontal span for UV: left pane + collage gap + extra + right pane. */
function getSharedSceneVirtualWidthCollage(
  groupId: string,
  group: SharedSceneGroup,
): number {
  const panes = sharedScenePanesSorted(groupId)
  const extra = group.horizontalGapExtra ?? 0
  if (panes.length !== 2) return group.width
  const [a, b] = panes
  const aL = percentValue(a.left)
  const aW = percentValue(a.width)
  const bL = percentValue(b.left)
  const bW = percentValue(b.width)
  const gap = Math.max(0, bL - (aL + aW))
  return aW + gap + extra + bW
}

function getSharedSceneMediaStyle(
  item: WindowData,
  group: SharedSceneGroup,
): React.CSSProperties {
  const gid = item.sharedSceneGroupId!
  const itemTop = percentValue(item.top)
  const itemLeft = percentValue(item.left)
  const itemWidth = percentValue(item.width)
  const itemHeight = percentValue(item.height)

  const panes = sharedScenePanesSorted(gid)
  if (panes.length === 2) {
    const [a, b] = panes
    const aL = percentValue(a.left)
    const aW = percentValue(a.width)
    const bL = percentValue(b.left)
    const bW = percentValue(b.width)
    const aTop = percentValue(a.top)
    const aH = percentValue(a.height)
    const sameRow =
      Math.abs(percentValue(b.top) - aTop) < 0.01 &&
      Math.abs(percentValue(b.height) - aH) < 0.01

    if (sameRow) {
      const gap = Math.max(0, bL - (aL + aW))
      const extra = group.horizontalGapExtra ?? 0
      const V = aW + gap + extra + bW

      if (item.id === a.id) {
        return {
          left: '0%',
          top: '0%',
          width: `${(V / itemWidth) * 100}%`,
          height: `${(group.height / itemHeight) * 100}%`,
        }
      }
      if (item.id === b.id) {
        const uBeforeB = aW + gap + extra
        return {
          left: `${-(uBeforeB / itemWidth) * 100}%`,
          top: '0%',
          width: `${(V / itemWidth) * 100}%`,
          height: `${(group.height / itemHeight) * 100}%`,
        }
      }
    }
  }

  return {
    left: `${-((itemLeft - group.left) / itemWidth) * 100}%`,
    top: `${-((itemTop - group.top) / itemHeight) * 100}%`,
    width: `${(group.width / itemWidth) * 100}%`,
    height: `${(group.height / itemHeight) * 100}%`,
  }
}

function getSharedSceneTransformOrigin(
  item: WindowData,
  group: SharedSceneGroup,
): string {
  const gid = item.sharedSceneGroupId!
  const itemTop = percentValue(item.top)
  const itemLeft = percentValue(item.left)
  const itemWidth = percentValue(item.width)
  const itemHeight = percentValue(item.height)

  const panes = sharedScenePanesSorted(gid)
  if (panes.length === 2) {
    const [a] = panes
    const aL = percentValue(a.left)
    const aTop = percentValue(a.top)
    const aH = percentValue(a.height)
    const b = panes[1]
    const sameRow =
      Math.abs(percentValue(b.top) - aTop) < 0.01 &&
      Math.abs(percentValue(b.height) - aH) < 0.01
    if (sameRow) {
      const V = getSharedSceneVirtualWidthCollage(gid, group)
      const originX = ((aL + V / 2 - itemLeft) / itemWidth) * 100
      const originY = ((group.top + group.height / 2 - itemTop) / itemHeight) * 100
      return `${originX}% ${originY}%`
    }
  }

  const originX = ((group.left + group.width / 2 - itemLeft) / itemWidth) * 100
  const originY = ((group.top + group.height / 2 - itemTop) / itemHeight) * 100

  return `${originX}% ${originY}%`
}

/** Responsive `object-position` for video + poster (narrow vs `md+`). */
function videoCoverObjectPositionParts(
  item: Pick<WindowData, 'videoObjectPosition' | 'videoObjectPositionNarrow'>,
): { extraClass: string; positionStyle: React.CSSProperties } {
  const wide = item.videoObjectPosition ?? 'center'
  const narrow = item.videoObjectPositionNarrow
  if (narrow == null) {
    return { extraClass: '', positionStyle: { objectPosition: wide } }
  }
  return {
    extraClass:
      'max-md:[object-position:var(--video-object-narrow)] md:[object-position:var(--video-object-wide)]',
    positionStyle: {
      ['--video-object-wide' as string]: wide,
      ['--video-object-narrow' as string]: narrow,
    } as React.CSSProperties,
  }
}

/** Pane ids skipped when rendering (still in `windowData` for layout math / restore later). */
const WINDOW_IDS_HIDDEN: ReadonlySet<string> = new Set([])

const windowData: WindowData[] = [
  {
    id: 'w1',
    imageUrl: '/videos/veo3.1-with-reference-images-kitchen-good-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-kitchen-good.mp4',
    top: designY(132),
    left: designX(680),
    width: '29.2776%',
    height: '17.0143%',
    zIndex: 10,
    paneType: 'grid-4'
  },
  {
    id: 'w2',
    imageUrl: '/videos/veo3.1-with-reference-images-office-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-office.mp4',
    top: designY(1383.81),
    left: designX(476),
    width: designX(600),
    height: designY(206.39),
    zIndex: 11,
    paneType: 'split-v'
  },
  {
    id: 'w3',
    imageUrl: '/videos/veo3.1-with-reference-images-coffee3-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-coffee3.mp4',
    videoObjectPosition: '58% center',
    videoObjectPositionNarrow: '58% center',
    videoCropZoom: 1,
    top: designY(132),
    left: designX(680),
    width: designX(300),
    height: designY(693.19),
    zIndex: 12,
    paneType: 'grid-4',
    frameShape: 'arched-top'
  },
  {
    id: 'w4',
    imageUrl: sharedSceneGroups.bedRoom.imageUrl,
    top: designY(1285.81),
    left: '75%',
    width: designX(187.56),
    height: designY(450.03),
    videoCropZoom: 1.12,
    videoObjectPosition: '32% 38%',
    zIndex: 13,
    paneType: 'single',
    sharedSceneGroupId: 'bedRoom'
  },
  {
    id: 'w5',
    imageUrl: sharedSceneGroups.bedRoom.imageUrl,
    top: designY(1285.81),
    left: '89%',
    width: designX(187.56),
    height: designY(450.03),
    videoCropZoom: 1.12,
    videoObjectPosition: '32% 38%',
    zIndex: 14,
    paneType: 'split-h',
    sharedSceneGroupId: 'bedRoom'
  },
  {
    id: 'w6',
    imageUrl: '/collage/w6-under-w2-desk.png',
    top: '68.5%',
    left: designX(205.92),
    width: designX(548.39),
    height: designY(321.77),
    zIndex: 12,
    paneType: 'grid-4'
  },
  {
    id: 'w8',
    imageUrl: '/videos/veo3.1-with-reference-images-shower-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-shower.mp4',
    videoObjectPosition: 'center 28%',
    videoCropZoom: 1,
    videoMediaWidthPct: 115,
    top: designY(691),
    left: designX(1009),
    width: designX(440.27),
    height: designY(207.58),
    zIndex: 17,
    paneType: 'grid-4'
  },
  {
    id: 'w9',
    imageUrl: '/videos/veo3.1-with-reference-images-studying-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-studying.mp4',
    top: designY(1016),
    left: designX(1009),
    width: designX(382.90),
    height: designY(245.03),
    zIndex: 18,
    paneType: 'grid-4'
  },
  {
    id: 'w10',
    imageUrl: '/videos/veo3.1_with_reference_images_extended_shopping-poster.jpg',
    videoSrc: '/videos/veo3.1_with_reference_images_extended_shopping.mp4',
    top: designY(792.98),
    left: '11.4%',
    width: designX(433.75),
    height: designY(439.31),
    zIndex: 15,
    paneType: 'grid-6'
  }
]

const visibleWindowData = windowData.filter((item) => !WINDOW_IDS_HIDDEN.has(item.id))
const COLLAGE_READY_ASSET_KEYS = visibleWindowData.flatMap((item) => {
  const keys = [`image:${item.id}`]
  if (getWindowVideoSrc(item)) {
    keys.push(`video:${item.id}`)
  }
  return keys
})

const renderWindowPanes = (type: PaneType) => {
  const lineClass = "absolute bg-[#1a1a1a] pointer-events-none z-10 opacity-80"
  
  switch (type) {
    case 'single':
      return null
    case 'split-v':
      return (
        <div className={`top-0 left-1/2 w-[4px] md:w-[6px] h-full -ml-[2px] md:-ml-[3px] ${lineClass}`} />
      )
    case 'split-h':
      return (
        <div className={`top-1/2 left-0 w-full h-[4px] md:h-[6px] -mt-[2px] md:-mt-[3px] ${lineClass}`} />
      )
    case 'grid-4':
      return (
        <>
          <div className={`top-1/2 left-0 w-full h-[4px] md:h-[6px] -mt-[2px] md:-mt-[3px] ${lineClass}`} />
          <div className={`top-0 left-1/2 w-[4px] md:w-[6px] h-full -ml-[2px] md:-ml-[3px] ${lineClass}`} />
        </>
      )
    case 'grid-6':
      return (
        <>
          <div className={`top-1/2 left-0 w-full h-[4px] md:h-[6px] -mt-[2px] md:-mt-[3px] ${lineClass}`} />
          <div className={`top-0 left-1/3 w-[4px] md:w-[6px] h-full -ml-[2px] md:-ml-[3px] ${lineClass}`} />
          <div className={`top-0 left-2/3 w-[4px] md:w-[6px] h-full -ml-[2px] md:-ml-[3px] ${lineClass}`} />
        </>
      )
    case 'grid-9':
      return (
        <>
          <div className={`top-1/3 left-0 w-full h-[4px] md:h-[6px] -mt-[2px] md:-mt-[3px] ${lineClass}`} />
          <div className={`top-2/3 left-0 w-full h-[4px] md:h-[6px] -mt-[2px] md:-mt-[3px] ${lineClass}`} />
          <div className={`top-0 left-1/3 w-[4px] md:w-[6px] h-full -ml-[2px] md:-ml-[3px] ${lineClass}`} />
          <div className={`top-0 left-2/3 w-[4px] md:w-[6px] h-full -ml-[2px] md:-ml-[3px] ${lineClass}`} />
        </>
      )
  }
}

const ARCH_SPRING_LINE_PCT = 30
const ARCH_SPRING_LINE_RATIO = ARCH_SPRING_LINE_PCT / 100
const ARCH_CLIP_PATH_D = `M 0,1 L 0,${ARCH_SPRING_LINE_RATIO} A 0.5 ${ARCH_SPRING_LINE_RATIO} 0 0 1 1,${ARCH_SPRING_LINE_RATIO} L 1,1 Z`
const ARCH_FRAME_PATH_D = `M 0,100 L 0,${ARCH_SPRING_LINE_PCT} A 50 ${ARCH_SPRING_LINE_PCT} 0 0 1 100,${ARCH_SPRING_LINE_PCT} L 100,100 Z`
const ARCH_RADIAL_DEGREES = [45, 90, 135]
const FRAME_COLOR = '#000000'
const COLLAGE_TEXT_SCALE = 0.97
const W10_HOVER_COPY =
  'Supermarket aisle. Cart half-full. You know there was a nutrition tip you wanted to follow. You forgot where you saved it. Now would be a good time to remember it.'
const W2_HOVER_COPY =
  'The meeting starts. You’re prepared and aiming for a promotion. One key comment would’ve made you shine in front of your boss- but when it mattered most, your mind went blank'
const W1_HOVER_COPY =
  'Evening. Podcast on while cooking. A funny joke lands. You tell yourself: this one I’ll remember. You smile. Tomorrow’s date will laugh at this.'
const W9_HOVER_COPY =
  'After a day of classes, you are too tired to sit down and study. Notes are scattered across apps, screenshots, and tabs. You don’t know where to start so you don’t and keep scrolling.'
const W8_HOVER_COPY =
  'You wake up. Shower running. A health thought crosses your mind. You’ll remember it later.'
const W3_HOVER_COPY =
  'You open ChatGPT. You ask one question, then another. You’re learning fast. Connecting ideas. Following threads. Somewhere in there, you find it. A great answer. A clear explanation. Exactly what you needed. You think: I’ll come back to this. Later, you can’t find it.'
const W4_HOVER_COPY =
  'Night. In bed. Your mind reaches for things'
const W5_HOVER_COPY = 'it knows are there but can’t pull back.'
const HOVER_FALLOFF_DELAY_MS = 2000

function scaledFontSize(size: string): string {
  return `calc(${size} * ${COLLAGE_TEXT_SCALE})`
}

function ArchedTopWindowMullions() {
  const lineClass =
    'absolute bg-black pointer-events-none z-[11] opacity-100'
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
      {/* Flat bar on the springing line (arch meets lower lights) */}
      <div
        className={`left-0 w-full h-[4px] md:h-[6px] -mt-[2px] md:-mt-[3px] ${lineClass}`}
        style={{ top: `${ARCH_SPRING_LINE_PCT}%` }}
      />
      {/* Lower half: vertical mullion from springing line to sill. */}
      <div
        className={`left-1/2 w-[4px] md:w-[6px] -ml-[2px] md:-ml-[3px] ${lineClass}`}
        style={{ top: `${ARCH_SPRING_LINE_PCT}%`, height: lowerHeight }}
      />
      <svg
        className="pointer-events-none absolute inset-0 z-[11] h-full w-full opacity-80"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <g className="md:hidden">{renderRadials(4)}</g>
        <g className="hidden md:block">{renderRadials(6)}</g>
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

function AutoFitHoverCopy({
  text,
  isVisible,
  justify = true,
  fitRatio = 0.85,
  fitWidthRatio,
  fitHeightRatio,
  offsetYPct = 0,
}: {
  text: string
  isVisible: boolean
  justify?: boolean
  fitRatio?: number
  fitWidthRatio?: number
  fitHeightRatio?: number
  offsetYPct?: number
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const textRef = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const textEl = textRef.current
    if (!container || !textEl) return

    let rafId = 0

    const fit = () => {
      const frameW = container.clientWidth
      const frameH = container.clientHeight
      if (frameW <= 0 || frameH <= 0) return

      const targetW = frameW * (fitWidthRatio ?? fitRatio)
      const targetH = frameH * (fitHeightRatio ?? fitRatio)
      const lineHeightRatio = 1.22

      textEl.style.width = `${targetW}px`

      let low = 8
      let high = Math.max(9, Math.min(frameW * 0.16, frameH * 0.25))
      let best = low

      for (let i = 0; i < 18; i += 1) {
        const mid = (low + high) / 2
        textEl.style.fontSize = `${mid}px`
        textEl.style.lineHeight = `${mid * lineHeightRatio}px`

        const fits =
          textEl.scrollHeight <= targetH + 1 && textEl.scrollWidth <= targetW + 1

        if (fits) {
          best = mid
          low = mid
        } else {
          high = mid
        }
      }

      textEl.style.fontSize = `${best}px`
      textEl.style.lineHeight = `${best * lineHeightRatio}px`
    }

    const scheduleFit = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(fit)
    }

    const observer = new ResizeObserver(scheduleFit)
    observer.observe(container)
    scheduleFit()

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [text, isVisible, fitRatio, fitWidthRatio, fitHeightRatio])

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 z-[30] flex items-center justify-center bg-black/55 px-[3%] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden={!isVisible}
    >
      <p
        ref={textRef}
        className="text-white"
        style={{
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          textAlign: 'center',
          textAlignLast: 'center',
          wordBreak: 'normal',
          overflowWrap: 'break-word',
          transform: `translateY(${offsetYPct}%)`,
        }}
      >
        {text}
      </p>
    </div>
  )
}

type WindowsCollageProps = {
  /**
   * Split hero: Gǣthis is whereGǥ above `w10`; GǣNot just between moments.Gǥ between `w1`/`w4` and `w9`/`w2`; GǣButGǥ / GǣafterGǥ / Gǣlearning.Gǥ left of `w2`; GǣAfter taking notesGǪGǥ in the gutter above `w6`; GǣAfter reading.Gǥ under `w4`/`w5`; footer: GǣIf lifeGǪGǥ, GǣMemSurf helps you remember it.Gǥ; GǣMEMSURFGǥ / GǣFITSGǥ under `w3` / `w8`.
   */
  workflowHeroCopy?: boolean
  onReady?: () => void
}

function paneBottomPct(pane: WindowData): number {
  return (
    Number.parseFloat(pane.top.replace('%', '')) +
    Number.parseFloat(pane.height.replace('%', ''))
  )
}

/** Horizontal gap between two panes as % of collage width (left edge of `b` minus right edge of `a`). */
function horizontalGapPercent(a: WindowData, b: WindowData): number {
  const aRight = percentValue(a.left) + percentValue(a.width)
  const bLeft = percentValue(b.left)
  return Math.max(0, bLeft - aRight)
}

/** Left edge and width spanning both panes (e.g. w4 + w5 bed row). */
function combinedHorizontalSpan(a: WindowData, b: WindowData): {
  leftPct: number
  widthPct: number
} {
  const aL = percentValue(a.left)
  const aR = aL + percentValue(a.width)
  const bL = percentValue(b.left)
  const bR = bL + percentValue(b.width)
  const left = Math.min(aL, bL)
  const right = Math.max(aR, bR)
  return { leftPct: left, widthPct: Math.max(0, right - left) }
}

/** Gap below w10 bottom edge (virtual anchor for `w1` placement; tagline copy lives between `w1`/`w4` and `w9`/`w2`). */
const WORKFLOW_W10_FIRST_TAGLINE_TOP_OFFSET_PCT = 1.2
/** Workflow hero: approx. height of that line as % of collage below the tagline block top (for `w1` placement). */
const WORKFLOW_FIRST_TAGLINE_HEIGHT_PCT = 5.5
const WORKFLOW_W1_GAP_BELOW_TAGLINE_PCT = 0.5
/** Extra move up for `w1` only (subtract from computed top; does not affect tagline). */
const WORKFLOW_W1_EXTRA_LIFT_PCT = 2
/** Shift `w1` right from the w10 column anchor (workflow hero). */
const WORKFLOW_W1_SHIFT_RIGHT_PCT = 5
/** `w2` starts this far below the bottom of workflow `w1`. */
const WORKFLOW_W2_BELOW_W1_GAP_PCT = 1.25
/** Nudge `w2` down with workflow layout. */
const WORKFLOW_W2_SHIFT_DOWN_PCT = 1.5
/** Keep `w2` bottom near 100% of collage when height is computed. */
const WORKFLOW_W2_BOTTOM_PAD_PCT = 0.5
/** Strip below workflow `w2` for static image pane `w6` (taller = less squished). */
const WORKFLOW_W6_STRIP_PCT = 15
/** Horizontal gap column between `w2` left edge and `w6` for GǣAfter taking notesGǪGǥ (above `w6`). */
const WORKFLOW_W6_SHIFT_RIGHT_PCT = 12
/** Vertical band between bottom of `w2` and top of `w6` for that line. */
const WORKFLOW_W6_NOTES_BAND_PCT = 3
/** Gap between GǣBut after learningGǪGǥ column and the left edge of `w2`. */
const WORKFLOW_W2_LEFT_COPY_GAP_PCT = 1.25
/** Horizontal inset from `w1` right and `w4` left for GǣNot just between moments.Gǥ */
const WORKFLOW_BETWEEN_MOMENTS_H_GAP_PCT = 0.75
/** Extra shift right for that band (width shrinks toward `w4`). */
const WORKFLOW_BETWEEN_MOMENTS_SHIFT_RIGHT_PCT = 3.5
/** Additional nudge right (~1G��2%) so copy sits slightly right of the w1G��w4 gutter. */
const WORKFLOW_BETWEEN_MOMENTS_NUDGE_RIGHT_PCT = 1.5
/** Vertical gap below `w9` and above `w2` for that line. */
const WORKFLOW_BETWEEN_MOMENTS_V_GAP_PCT = 1
/** Band directly under w4+w5 for GǣAfter reading.Gǥ (use remaining collage height below bed row). */
const WORKFLOW_AFTER_READING_UNDER_BLOCK_PCT = 6
const COLLAGE_THIRD_MARKERS = [
  { key: 'first_third', thirdIndex: 1, thirdName: 'first_third', topPct: 0 },
  { key: 'second_third', thirdIndex: 2, thirdName: 'second_third', topPct: 33 },
  { key: 'final_third', thirdIndex: 3, thirdName: 'final_third', topPct: 66 },
] as const

type CollageThirdMarkerKey = (typeof COLLAGE_THIRD_MARKERS)[number]['key']

export default function WindowsCollage({ workflowHeroCopy, onReady }: WindowsCollageProps = {}) {
  const archClipId = useId().replace(/:/g, '')
  const { track } = useAmplitude()
  const [hoveredIds, setHoveredIds] = useState<Set<string>>(new Set())
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const videoRefs = useRef<Partial<Record<string, HTMLVideoElement | null>>>({})
  const windowRefs = useRef<Partial<Record<string, HTMLDivElement | null>>>({})
  const hoverFalloffTimeoutRef = useRef<number | null>(null)
  const collageThirdMarkerRefs = useRef<Partial<Record<CollageThirdMarkerKey, HTMLDivElement | null>>>({})
  const trackedCollageThirdsRef = useRef<Set<CollageThirdMarkerKey>>(new Set())
  const readyAssetKeysRef = useRef<Set<string>>(new Set())
  const hasReportedReadyRef = useRef(false)

  const markAssetReady = useCallback(
    (key: string) => {
      if (!onReady || hasReportedReadyRef.current) return

      readyAssetKeysRef.current.add(key)

      if (readyAssetKeysRef.current.size >= COLLAGE_READY_ASSET_KEYS.length) {
        hasReportedReadyRef.current = true
        onReady()
      }
    },
    [onReady],
  )

  useEffect(() => {
    readyAssetKeysRef.current.clear()
    hasReportedReadyRef.current = false

    if (!onReady) return

    if (COLLAGE_READY_ASSET_KEYS.length === 0) {
      hasReportedReadyRef.current = true
      onReady()
    }
  }, [onReady])

  useEffect(() => {
    if (!workflowHeroCopy || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue

          const markerKey = entry.target.getAttribute('data-collage-third') as
            | CollageThirdMarkerKey
            | null
          const marker = COLLAGE_THIRD_MARKERS.find(
            (item) => item.key === markerKey,
          )

          if (!marker || trackedCollageThirdsRef.current.has(marker.key)) continue

          trackedCollageThirdsRef.current.add(marker.key)
          observer.unobserve(entry.target)
          track('window_collage_third_reached', {
            collage_variant: 'workflow_hero',
            third_index: marker.thirdIndex,
            third_count: COLLAGE_THIRD_MARKERS.length,
            third_name: marker.thirdName,
            marker_top_percent: marker.topPct,
          })
        }
      },
      {
        rootMargin: '0px 0px -45% 0px',
        threshold: 0,
      },
    )

    for (const marker of COLLAGE_THIRD_MARKERS) {
      const el = collageThirdMarkerRefs.current[marker.key]
      if (el && !trackedCollageThirdsRef.current.has(marker.key)) {
        observer.observe(el)
      }
    }

    return () => observer.disconnect()
  }, [track, workflowHeroCopy])

  const getHoverId = useCallback((item: WindowData) => item.sharedSceneGroupId ?? item.id, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    const onChange = () => setIsMobileViewport(mediaQuery.matches)
    onChange()
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!isMobileViewport || typeof IntersectionObserver === 'undefined') return

    const idToHoverId = new Map<string, string>()
    const observer = new IntersectionObserver(
      (entries) => {
        const nextHoveredIds = new Set<string>()
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const paneId = entry.target.getAttribute('data-window-id')
          if (!paneId) continue
          const hoverId = idToHoverId.get(paneId)
          if (!hoverId) continue
          nextHoveredIds.add(hoverId)
        }
        if (nextHoveredIds.size > 0) {
          if (hoverFalloffTimeoutRef.current != null) {
            window.clearTimeout(hoverFalloffTimeoutRef.current)
            hoverFalloffTimeoutRef.current = null
          }
          setHoveredIds(nextHoveredIds)
          return
        }

        if (hoverFalloffTimeoutRef.current != null) {
          window.clearTimeout(hoverFalloffTimeoutRef.current)
        }
        hoverFalloffTimeoutRef.current = window.setTimeout(() => {
          setHoveredIds(new Set())
          hoverFalloffTimeoutRef.current = null
        }, HOVER_FALLOFF_DELAY_MS)
      },
      {
        root: null,
        // Wider middle trigger band so activation feels less abrupt.
        rootMargin: '-35% 0px -35% 0px',
        threshold: 0,
      },
    )

    for (const item of visibleWindowData) {
      const el = windowRefs.current[item.id]
      if (!el) continue
      idToHoverId.set(item.id, getHoverId(item))
      observer.observe(el)
    }

    return () => {
      observer.disconnect()
      if (hoverFalloffTimeoutRef.current != null) {
        window.clearTimeout(hoverFalloffTimeoutRef.current)
        hoverFalloffTimeoutRef.current = null
      }
      setHoveredIds(new Set())
    }
  }, [getHoverId, isMobileViewport])

  const w10Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w10') : undefined
  const w3Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w3') : undefined
  const w8Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w8') : undefined
  const w9Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w9') : undefined
  const w4Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w4') : undefined
  const w5Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w5') : undefined
  const w2Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w2') : undefined

  const afterReadingBedSpan =
    w4Pane != null && w5Pane != null
      ? combinedHorizontalSpan(w4Pane, w5Pane)
      : null
  const afterReadingUnderTopPct =
    w4Pane != null ? paneBottomPct(w4Pane) : 0

  const w10TopPct = w10Pane ? Number.parseFloat(w10Pane.top.replace('%', '')) : 0
  const whereLineBlockPct = 7
  const whereLineTopPct =
    w10Pane != null ? Math.max(0.5, w10TopPct - whereLineBlockPct) : 0

  const w10TaglineBlockTopPct =
    w10Pane != null
      ? paneBottomPct(w10Pane) + WORKFLOW_W10_FIRST_TAGLINE_TOP_OFFSET_PCT
      : 0
  const w1WorkflowTopPct =
    workflowHeroCopy && w10Pane != null
      ? w10TaglineBlockTopPct +
        WORKFLOW_FIRST_TAGLINE_HEIGHT_PCT +
        WORKFLOW_W1_GAP_BELOW_TAGLINE_PCT -
        WORKFLOW_W1_EXTRA_LIFT_PCT
      : null
  const w1WorkflowLeftPct =
    workflowHeroCopy && w10Pane != null
      ? percentValue(w10Pane.left) + WORKFLOW_W1_SHIFT_RIGHT_PCT
      : null
  const w1WorkflowWidthPct =
    workflowHeroCopy && w2Pane != null ? percentValue(w2Pane.width) : null
  const w1WorkflowHeightPct =
    w1WorkflowWidthPct

  const w1DataPane = windowData.find((w) => w.id === 'w1')
  const w1WorkflowBottomPct =
    workflowHeroCopy &&
    w1WorkflowTopPct != null &&
    w1WorkflowHeightPct != null
      ? w1WorkflowTopPct + w1WorkflowHeightPct
      : null
  const w2WorkflowTopBasePct =
    workflowHeroCopy && w1WorkflowBottomPct != null
      ? w1WorkflowBottomPct + WORKFLOW_W2_BELOW_W1_GAP_PCT
      : null
  const w2WorkflowTopPct =
    w2WorkflowTopBasePct != null
      ? w2WorkflowTopBasePct + WORKFLOW_W2_SHIFT_DOWN_PCT
      : null
  /** Height from unshifted top so moving down does not shrink the pane. */
  const w2WorkflowHeightPct =
    workflowHeroCopy && w2WorkflowTopBasePct != null
      ? Math.max(
          12,
          100 -
            w2WorkflowTopBasePct -
            WORKFLOW_W2_BOTTOM_PAD_PCT -
            WORKFLOW_W6_NOTES_BAND_PCT -
            WORKFLOW_W6_STRIP_PCT,
        )
      : null
  /** Bottom of `w2` G�� top of notes band G�� top of `w6` image. */
  const w6NotesCopyTopPct =
    workflowHeroCopy &&
    w2WorkflowTopPct != null &&
    w2WorkflowHeightPct != null
      ? w2WorkflowTopPct + w2WorkflowHeightPct
      : null
  const w6ImageTopPct =
    w6NotesCopyTopPct != null
      ? w6NotesCopyTopPct + WORKFLOW_W6_NOTES_BAND_PCT
      : null
  const w2LeftButAfterColumnWidthPct =
    workflowHeroCopy && w2Pane != null
      ? Math.max(
          0,
          percentValue(w2Pane.left) - WORKFLOW_W2_LEFT_COPY_GAP_PCT,
        )
      : null

  const w1WorkflowRightPct =
    workflowHeroCopy &&
    w1WorkflowLeftPct != null &&
    w1WorkflowWidthPct != null
      ? w1WorkflowLeftPct + w1WorkflowWidthPct
      : null
  const betweenMomentsLeftPct =
    workflowHeroCopy &&
    w1WorkflowRightPct != null &&
    w4Pane != null
      ? w1WorkflowRightPct +
        WORKFLOW_BETWEEN_MOMENTS_H_GAP_PCT +
        WORKFLOW_BETWEEN_MOMENTS_SHIFT_RIGHT_PCT +
        WORKFLOW_BETWEEN_MOMENTS_NUDGE_RIGHT_PCT
      : null
  const betweenMomentsWidthPct =
    workflowHeroCopy &&
    betweenMomentsLeftPct != null &&
    w4Pane != null
      ? Math.max(
          0,
          percentValue(w4Pane.left) -
            WORKFLOW_BETWEEN_MOMENTS_H_GAP_PCT -
            betweenMomentsLeftPct,
        )
      : null
  const betweenMomentsTopPct =
    workflowHeroCopy && w9Pane != null && w2WorkflowTopPct != null
      ? paneBottomPct(w9Pane) + WORKFLOW_BETWEEN_MOMENTS_V_GAP_PCT
      : null
  const betweenMomentsHeightPct =
    workflowHeroCopy &&
    betweenMomentsTopPct != null &&
    w2WorkflowTopPct != null
      ? Math.max(
          3,
          w2WorkflowTopPct -
            WORKFLOW_BETWEEN_MOMENTS_V_GAP_PCT -
            betweenMomentsTopPct,
        )
      : null

  useEffect(() => {
    for (const w of windowData) {
      if (!getWindowVideoSrc(w)) continue
      const el = videoRefs.current[w.id]
      if (!el) continue
      if (hoveredIds.has(getHoverId(w))) {
        void el.play().catch(() => {})
      } else {
        el.pause()
        el.currentTime = 0
      }
    }
  }, [hoveredIds, getHoverId])

  return (
    <div className="w-full bg-transparent relative overflow-hidden flex justify-center items-center">
      <div className="mx-auto w-full max-w-[1481.51px] px-[clamp(0.5rem,2vw,1.25rem)] [container-type:inline-size]">
        <div className="relative w-full aspect-[1481.51/2582] -translate-y-[3%]">
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
        {workflowHeroCopy &&
          COLLAGE_THIRD_MARKERS.map((marker) => (
            <div
              key={marker.key}
              ref={(el) => {
                collageThirdMarkerRefs.current[marker.key] = el
              }}
              className="pointer-events-none absolute left-0 h-px w-px opacity-0"
              style={{ top: `${marker.topPct}%` }}
              data-collage-third={marker.key}
              aria-hidden
            />
          ))}
        {workflowHeroCopy && (
          <>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[25] text-right font-bold text-white" style={{ left: designX(199), top: designY(709.35), width: designX(411.08), fontSize: scaledFontSize('clamp(0.85rem, 3.9cqi, 3.6rem)'), lineHeight: '1.2', textShadow: '0px 0px 23px rgba(255,255,255,1)' }}>This is where</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[17] font-bold" style={{ left: designX(637), top: designY(878), fontSize: scaledFontSize('clamp(1rem, 5.25cqi, 4.9rem)'), lineHeight: '1', backgroundImage: 'linear-gradient(90deg, #E6B3FF 3.91%, #84AAE1 51.8%, #96EEDC 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', textShadow: '0px 0px 23px rgba(134,170,225,1)' }}>MemSurf</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[17] font-bold italic text-white" style={{ left: designX(1037), top: '36%', fontSize: scaledFontSize('clamp(0.85rem, 3.85cqi, 3.6rem)'), lineHeight: '1.2', textShadow: '0px 0px 38px rgba(255,255,255,0.85)' }}>fits</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[26] whitespace-pre-line text-center text-white [font-family:var(--font-collage-tagline),cursive]" style={{ left: designX(674), top: designY(988), fontSize: scaledFontSize('clamp(1.3rem, 6.2cqi, 5.8rem)'), lineHeight: '1', textShadow: '0px 0px 23px rgba(255,255,255,1)' }}>{'Not just\nbetween \nmoments'}</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[25] text-center font-bold text-white" style={{ left: '37%', top: designY(1286), width: designX(509), fontSize: scaledFontSize('clamp(0.9rem, 3.9cqi, 3.6rem)'), textShadow: '0px 0px 23px rgba(255,255,255,0.85)' }}>But after learning,</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[25] text-center font-bold text-white" style={{ left: '33.5%', top: designY(1613.81), width: designX(600), fontSize: scaledFontSize('clamp(0.95rem, 4.05cqi, 3.75rem)'), textShadow: '0px 0px 23px rgba(255,255,255,0.85)' }}>after reading.</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[25] font-bold text-white" style={{ left: designX(789), top: '67.5%', width: designX(614), fontSize: scaledFontSize('clamp(0.95rem, 4.15cqi, 3.85rem)'), textShadow: '0px 0px 23px rgba(255,255,255,0.85)' }}>After taking notes you&apos;ll never revisit.</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[25] text-[#f3f4f6] [font-family:var(--font-collage-note)]" style={{ left: designX(789), top: '75%', width: designX(713), fontSize: scaledFontSize('clamp(1rem, 4.3cqi, 4rem)'), textShadow: '0px 0px 23px rgba(255,255,255,1)' }}>If life gives you something worth keeping.</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[27] whitespace-pre-line text-center font-bold text-white" style={{ left: '21.4%', top: '85%', fontSize: scaledFontSize('clamp(1.35rem, 6.24cqi, 5.75rem)'), lineHeight: '1.01', textShadow: '0px 0px 23px rgba(255,255,255,0.85)' }}>{'MemSurf helps you\nremember it.'}</motion.p>
            <img src="/logos/memsurf-logo.svg" alt="MemSurf logo" className="pointer-events-none absolute z-[27]" style={{ left: '43.5%', top: '94%', width: designX(185.4), height: designY(111.99) }} />
          </>
        )}
        {visibleWindowData.map((item, index) => {
          const sharedSceneGroup = item.sharedSceneGroupId
            ? sharedSceneGroups[item.sharedSceneGroupId]
            : undefined
          const hoverId = getHoverId(item)
          const isHovered = hoveredIds.has(hoverId)
          const videoZoom = item.videoCropZoom ?? VIDEO_CROP_ZOOM
          const mediaW = item.videoMediaWidthPct
          const videoOp = videoCoverObjectPositionParts(item)
          const isArchTop = item.frameShape === 'arched-top'
          const archClipStyle = isArchTop
            ? { clipPath: `url(#${archClipId})` as const }
            : undefined
          const outerWindowStyle: any = isArchTop
            ? {
                transform: isHovered
                  ? `scale(${WINDOW_HOVER_SCALE})`
                  : 'scale(1)',
                transformOrigin: sharedSceneGroup
                  ? getSharedSceneTransformOrigin(item, sharedSceneGroup)
                  : 'center',
                backfaceVisibility: 'hidden',
                ...archClipStyle,
                filter: isHovered
                  ? 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.55))'
                  : 'drop-shadow(0 10px 18px rgba(0, 0, 0, 0.35))',
              }
            : {
                transform: isHovered
                  ? `scale(${WINDOW_HOVER_SCALE})`
                  : 'scale(1)',
                transformOrigin: sharedSceneGroup
                  ? getSharedSceneTransformOrigin(item, sharedSceneGroup)
                  : 'center',
                backfaceVisibility: 'hidden',
                boxShadow: isHovered
                  ? '0 14px 28px -8px rgba(0, 0, 0, 0.45)'
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
              }

          const w1WorkflowLayout =
            item.id === 'w1' &&
            workflowHeroCopy &&
            w10Pane != null &&
            w1WorkflowTopPct != null &&
            w1WorkflowLeftPct != null &&
            w1WorkflowWidthPct != null &&
            w1WorkflowHeightPct != null

          const w2WorkflowLayout =
            item.id === 'w2' &&
            workflowHeroCopy &&
            w2WorkflowTopPct != null &&
            w2WorkflowHeightPct != null

          const w6UnderW2Layout =
            item.id === 'w6' &&
            workflowHeroCopy &&
            w2Pane != null &&
            w2WorkflowTopPct != null &&
            w2WorkflowHeightPct != null

          const w3CenteredLayout = item.id === 'w3'

          return (
            <div
              key={item.id}
              ref={(el) => {
                windowRefs.current[item.id] = el
              }}
              data-window-id={item.id}
              className="absolute p-0"
              style={{
                top: w1WorkflowLayout ? '50%' : item.top,
                left: w1WorkflowLayout
                  ? '1%'
                  : w3CenteredLayout
                    ? `${50 - percentValue(item.width) / 2 + 5}%`
                    : item.left,
                width: w1WorkflowLayout ? '29%' : item.width,
                height: w1WorkflowLayout ? '17%' : item.height,
                zIndex: isHovered ? 999 : item.zIndex,
              }}
              onMouseEnter={() => {
                if (hoverFalloffTimeoutRef.current != null) {
                  window.clearTimeout(hoverFalloffTimeoutRef.current)
                  hoverFalloffTimeoutRef.current = null
                }
                if (!isMobileViewport) setHoveredIds(new Set([hoverId]))
              }}
              onMouseLeave={() => {
                if (!isMobileViewport) {
                  if (hoverFalloffTimeoutRef.current != null) {
                    window.clearTimeout(hoverFalloffTimeoutRef.current)
                  }
                  hoverFalloffTimeoutRef.current = window.setTimeout(() => {
                    setHoveredIds(new Set())
                    hoverFalloffTimeoutRef.current = null
                  }, HOVER_FALLOFF_DELAY_MS)
                }
              }}
            >
              <div 
                className={`w-full h-full relative transition-transform duration-500 ease-out origin-center group ${
                  isArchTop ? 'overflow-hidden bg-black' : 'bg-black'
                }`}
                style={outerWindowStyle as any}
              >
                {/* Window Frame / Container G�� arch clip lives on outer so bg/shadow match the curve (no square black ears). */}
                <div
                  className={`w-full h-full relative overflow-hidden border-2 border-black z-20 ${isArchTop ? '' : 'rounded-sm'}`}
                  style={isArchTop ? archClipStyle : undefined}
                >
                  {item.videoSrc ? (
                    <div className="absolute inset-0 bg-black">
                      <div className="relative h-full w-full overflow-hidden">
                        <video
                          ref={(el) => {
                            if (el) {
                              videoRefs.current[item.id] = el
                              if (el.readyState >= 1) markAssetReady(`video:${item.id}`)
                            } else {
                              delete videoRefs.current[item.id]
                            }
                          }}
                          src={item.videoSrc}
                          className={`${
                            mediaW != null
                              ? 'absolute left-1/2 top-1/2 h-full max-w-none object-cover'
                              : 'absolute left-1/2 top-1/2 min-h-full min-w-full object-cover'
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
                          onLoadedMetadata={() => markAssetReady(`video:${item.id}`)}
                          onError={() => markAssetReady(`video:${item.id}`)}
                          aria-hidden
                        />
                        {!isHovered && (
                          <div
                            className="absolute inset-0 z-[1] overflow-hidden"
                            aria-hidden
                          >
                            <div
                              className="absolute left-1/2 top-1/2 h-full max-w-none"
                              style={{
                                width: mediaW != null ? `${mediaW}%` : '100%',
                                transform: `translate(-50%, -50%) scale(${videoZoom})`,
                              }}
                            >
                              <div className="relative h-full w-full">
                                <Image
                                  src={item.imageUrl}
                                  alt={`${item.id} preview`}
                                  fill
                                  className={`object-cover opacity-95 ${videoOp.extraClass}`.trim()}
                                  style={videoOp.positionStyle}
                                  sizes="(max-width: 768px) 60vw, 35vw"
                                  onLoad={() => markAssetReady(`image:${item.id}`)}
                                  onError={() => markAssetReady(`image:${item.id}`)}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {item.id === 'w10' && (
                          <AutoFitHoverCopy text={W10_HOVER_COPY} isVisible={isHovered} />
                        )}
                        {item.id === 'w1' && (
                          <AutoFitHoverCopy text={W1_HOVER_COPY} isVisible={isHovered} />
                        )}
                        {item.id === 'w2' && (
                          <AutoFitHoverCopy text={W2_HOVER_COPY} isVisible={isHovered} />
                        )}
                        {item.id === 'w9' && (
                          <AutoFitHoverCopy text={W9_HOVER_COPY} isVisible={isHovered} />
                        )}
                        {item.id === 'w8' && (
                          <AutoFitHoverCopy text={W8_HOVER_COPY} isVisible={isHovered} />
                        )}
                        {item.id === 'w3' && (
                          <AutoFitHoverCopy
                            text={W3_HOVER_COPY}
                            isVisible={isHovered}
                            fitWidthRatio={0.84}
                            fitHeightRatio={0.72}
                            offsetYPct={15}
                          />
                        )}
                      </div>
                    </div>
                  ) : sharedSceneGroup ? (
                    <div className="w-full h-full relative overflow-hidden">
                      <div
                        className="absolute overflow-hidden"
                        style={getSharedSceneMediaStyle(item, sharedSceneGroup)}
                      >
                        {sharedSceneGroup.videoSrc ? (
                          <>
                            <video
                              ref={(el) => {
                                if (el) {
                                  videoRefs.current[item.id] = el
                                  if (el.readyState >= 1) markAssetReady(`video:${item.id}`)
                                } else {
                                  delete videoRefs.current[item.id]
                                }
                              }}
                              src={sharedSceneGroup.videoSrc}
                              className={`absolute inset-0 h-full w-full object-cover ${videoOp.extraClass}`.trim()}
                              style={{
                                transform: `scale(${videoZoom})`,
                                transformOrigin: 'center center',
                                ...videoOp.positionStyle,
                              }}
                              muted
                              loop
                              playsInline
                              preload="metadata"
                              onLoadedMetadata={() => markAssetReady(`video:${item.id}`)}
                              onError={() => markAssetReady(`video:${item.id}`)}
                              aria-hidden
                            />
                            {!isHovered && (
                              <div
                                className="absolute inset-0 z-[1] overflow-hidden"
                                aria-hidden
                              >
                                <Image
                                  src={sharedSceneGroup.imageUrl}
                                  alt={`${item.id} preview`}
                                  fill
                                  className={`object-cover opacity-95 ${videoOp.extraClass}`.trim()}
                                  style={videoOp.positionStyle}
                                  sizes="(max-width: 768px) 50vw, 40vw"
                                  onLoad={() => markAssetReady(`image:${item.id}`)}
                                  onError={() => markAssetReady(`image:${item.id}`)}
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <Image
                            src={sharedSceneGroup.imageUrl}
                            alt={`${item.id} view`}
                            fill
                            className="object-cover opacity-80"
                            sizes="(max-width: 768px) 50vw, 40vw"
                            onLoad={() => markAssetReady(`image:${item.id}`)}
                            onError={() => markAssetReady(`image:${item.id}`)}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      className="w-full h-full relative overflow-hidden"
                      animate={isHovered ? { scale: 1 } : {
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 20 + (index * 2 % 10),
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "linear"
                      }}
                    >
                      <div
                        className="absolute inset-0"
                        style={
                          isArchTop
                            ? {
                                transform: `scale(${ARCH_TOP_MEDIA_SCALE})`,
                                transformOrigin: 'center 42%',
                              }
                            : undefined
                        }
                      >
                        <Image
                          src={item.imageUrl}
                          alt={`${item.id} view`}
                          fill
                          className="object-cover opacity-80"
                          style={
                            isArchTop
                              ? { objectPosition: 'center 32%' }
                              : undefined
                          }
                          sizes="(max-width: 768px) 50vw, 33vw"
                          onLoad={() => markAssetReady(`image:${item.id}`)}
                          onError={() => markAssetReady(`image:${item.id}`)}
                        />
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Border and Panes */}
                  {isArchTop ? (
                    <ArchedTopWindowFrame />
                  ) : (
                    <div
                      className="absolute inset-0 border-[6px] border-black pointer-events-none z-20"
                      aria-hidden
                    />
                  )}
                  {isArchTop ? (
                    <ArchedTopWindowMullions />
                  ) : (
                    renderWindowPanes(item.paneType)
                  )}
                  
                </div>
              </div>
            </div>
          )
        })}
        </div>
        
        {!workflowHeroCopy && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: 'easeOut', delay: 0.08 }}
            className="w-full px-1 pt-8 pb-1 text-center font-bold leading-[1.05] tracking-tight text-white [text-wrap:balance] md:pt-10 md:pb-2"
            style={{ fontSize: scaledFontSize('clamp(1.75rem, min(9cqi, 10vw), 5.75rem)') }}
          >
            MemSurf helps you remember it.
          </motion.p>
        )}
      </div>
    </div>
  )
}
