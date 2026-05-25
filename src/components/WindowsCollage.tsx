'use client'

import React, { useCallback, useMemo, useState, useRef, useEffect, useId } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
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

/** w3 arched window: soft glow echoing on-screen UI light (--app-blue-bright / lavender / mint). */
const W3_FRAME_HOVER_FILTER =
  'drop-shadow(0 0 22px rgba(137, 176, 235, 0.5)) drop-shadow(0 0 46px rgba(165, 128, 218, 0.3)) drop-shadow(0 0 72px rgba(143, 225, 212, 0.14)) drop-shadow(0 14px 32px rgba(0, 0, 0, 0.55))'

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

export const COLLAGE_READY_ASSET_TOTAL = COLLAGE_READY_ASSET_KEYS.length

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
/** w10 (shopping / extended_shopping.mp4): one motion.span per sentence. */
const W10_HOVER_LINES = [
  'Supermarket aisle.',
  'Cart half-full.',
  'You know there was a nutrition tip you wanted to follow.',
  'You forgot where you saved it.',
  'Now would be a good time to remember it.',
] as const
const W10_HOVER_COPY = W10_HOVER_LINES.join(' ')
const W2_HOVER_COPY =
  'The meeting starts. You’re prepared and aiming for a promotion. One key comment would’ve made you shine in front of your boss- but when it mattered most, your mind went blank'
/** w1 (kitchen): one motion.span per sentence (replaces former AutoFit `<p>`). */
const W1_HOVER_LINES = [
  'Evening.',
  'Podcast on while cooking.',
  'A funny joke lands.',
  'You tell yourself: this one I’ll remember.',
  'You smile.',
  'Tomorrow’s date will laugh at this.',
] as const
const W1_HOVER_COPY = W1_HOVER_LINES.join(' ')
const W8_HOVER_COPY =
  'You wake up. Shower running. A health thought crosses your mind. You’ll remember it later.'
/** w6 (desk image under w2): short lines above the frame to avoid wrap orphans. */
const W6_HOVER_LINES = [
  'After a day of classes,',
  'you are too tired to sit down and study.',
  'Notes are scattered across apps,',
  'screenshots, and tabs.',
  'You don’t know where to start',
  'so you don’t and keep scrolling.',
] as const
/** w9 (studying.mp4): one motion.span per sentence, above the frame (same as w8). */
const W9_HOVER_LINES = [
  'After a day of classes, you are too tired to sit down and study.',
  'Notes are scattered across apps, screenshots, and tabs.',
  'You don’t know where to start so you don’t and keep scrolling.',
] as const
const W9_HOVER_COPY = W9_HOVER_LINES.join(' ')
const W3_HOVER_COPY =
  'You open ChatGPT. You ask one question, then another. You’re learning fast. Connecting ideas. Following threads. Somewhere in there, you find it. A great answer. A clear explanation. Exactly what you needed. You think: I’ll come back to this. Later, you can’t find it.'

function splitHoverCopyLines(copy: string): string[] {
  return copy
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** One animated line per sentence for w3 hover. */
const W3_HOVER_LINES = splitHoverCopyLines(W3_HOVER_COPY)
/** w2 (office.mp4): one motion.span per sentence, placed above the frame. */
const W2_HOVER_LINES = [
  'The meeting starts.',
  'You’re prepared and aiming for a promotion.',
  'One key comment would’ve made you shine in front of your boss- but when it mattered most, your mind went blank',
] as const
/** One animated line per sentence for w8 hover. */
const W8_HOVER_LINES = splitHoverCopyLines(W8_HOVER_COPY)
/** w4 + w5 (bed.mp4 shared scene): one motion.span per sentence, left of the frame. */
const BEDROOM_HOVER_LINES = [
  'Night. In bed.',
  'Your mind reaches for things it knows are there but can’t pull back.',
] as const
/** After pointer leaves a pane, wait this long before starting dim/text fade-out. */
const HOVER_FALLOFF_DELAY_MS = 200
/** Gap between pane edge and outside stagger hover copy (was 16px; +20px). */
const HOVER_COPY_FRAME_GAP_PX = 36
/** Figma hover spotlight: full-bleed vertical gradient (Variant2 / 387:890). */
const COLLAGE_HOVER_OVERLAY_GRADIENT =
  'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 32.692%, rgb(0, 0, 0) 69.231%, rgba(0, 0, 0, 0) 100%)'
const COLLAGE_HOVER_OVERLAY_Z = 50
/** Footer tagline + logo stay above the hover overlay (Figma). */
const COLLAGE_BRAND_FOOTER_Z = 65
/** Unified pointer target for multi-pane shared scenes (e.g. w4 + w5). */
const COLLAGE_SHARED_SCENE_HOVER_Z_IDLE = 25
const COLLAGE_SHARED_SCENE_HOVER_Z_ACTIVE = 61

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

const w3LineEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Outside-pane hover stagger — matches “If life gives you something worth keeping.” */
const HOVER_STAGGER_TEXT_SHADOW = '0px 0px 23px rgba(255, 255, 255, 1)'
/** % of `.collage-scale-root` width; scales when the collage div resizes. */
const COLLAGE_HOVER_FONT_CQI = 1.925

function collageHoverFontSizeCssVar(): string {
  const scale = COLLAGE_TEXT_SCALE
  return `clamp(calc(1.1424rem * ${scale}), calc(${COLLAGE_HOVER_FONT_CQI * scale}cqi), calc(2.352rem * ${scale}))`
}

const hoverStaggerTextGlowHidden = '0px 0px 0px rgba(255, 255, 255, 0)'
const hoverStaggerTextGlowVisible = HOVER_STAGGER_TEXT_SHADOW

const outsideStaggerLineVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    textShadow: hoverStaggerTextGlowHidden,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
  visible: {
    opacity: 1,
    y: 0,
    textShadow: hoverStaggerTextGlowVisible,
    transition: { duration: 0.52, ease: w3LineEase },
  },
}

function CollageHoverStaggerLine({
  textAlign,
  children,
}: {
  textAlign: string
  children: React.ReactNode
}) {
  return (
    <motion.span
      variants={outsideStaggerLineVariants}
      className={`collage-hover-stagger-line ${textAlign}`}
    >
      {children}
    </motion.span>
  )
}

const outsideStaggerContainerVariants = {
  hidden: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 as const },
  },
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.06,
    },
  },
}

/** Kitchen video pane only (`kitchen-good.mp4`). */
function isKitchenPane(item: WindowData): boolean {
  return (
    item.id === 'w1' ||
    item.videoSrc?.includes('kitchen-good') === true
  )
}

/** Office video pane only (`office.mp4`). */
function isOfficePane(item: WindowData): boolean {
  return (
    item.id === 'w2' ||
    item.videoSrc?.includes('office') === true
  )
}

/** Shower video pane only (`shower.mp4`). */
function isShowerPane(item: WindowData): boolean {
  return (
    item.id === 'w8' ||
    item.videoSrc?.includes('shower') === true
  )
}

/** Studying video pane only (`studying.mp4`). */
function isStudyingPane(item: WindowData): boolean {
  return (
    item.id === 'w9' ||
    item.videoSrc?.includes('studying') === true
  )
}

/** Desk image pane under w2 (`w6-under-w2-desk.png`). */
function isW6Pane(item: WindowData): boolean {
  return (
    item.id === 'w6' ||
    item.imageUrl?.includes('w6-under-w2-desk') === true
  )
}

type SharedSceneHoverRect = {
  groupId: string
  leftPct: number
  widthPct: number
  top: string
  height: string
}

function getSharedSceneHoverRects(): SharedSceneHoverRect[] {
  return Object.keys(sharedSceneGroups).flatMap((groupId) => {
    const panes = sharedScenePanesSorted(groupId)
    if (panes.length < 2) return []
    const group = sharedSceneGroups[groupId]
    const [a, b] = panes
    const span = combinedHorizontalSpan(a, b)
    const extra = group.horizontalGapExtra ?? 0
    return [
      {
        groupId,
        leftPct: span.leftPct,
        widthPct: span.widthPct + extra,
        top: a.top,
        height: a.height,
      },
    ]
  })
}

type OutsideStaggerSide = 'left' | 'right'

/**
 * Staggered hover copy beside the pane (w3 = left; w1 / w10 = right).
 * Same DOM as the working windows: outer column → motion container → motion.span per sentence.
 */
function PaneOutsideStaggerText({
  paneId,
  lines,
  isVisible,
  side,
  verticalAlign = 'center',
}: {
  paneId: string
  lines: readonly string[]
  isVisible: boolean
  side: OutsideStaggerSide
  /** `end` = last line sits on the pane bottom edge (w6 desk). */
  verticalAlign?: 'center' | 'end'
}) {
  const textAlign = side === 'left' ? 'text-right' : 'text-left'
  const anchorClass =
    side === 'left'
      ? 'right-full top-0 bottom-0'
      : 'left-full top-0 bottom-0'
  const gapStyle =
    side === 'left'
      ? { marginRight: HOVER_COPY_FRAME_GAP_PX }
      : { marginLeft: HOVER_COPY_FRAME_GAP_PX }
  const justifyClass = verticalAlign === 'end' ? 'justify-end' : 'justify-center'

  return (
    <div
      data-pane-hover-copy={paneId}
      className={`collage-hover-stagger-column pointer-events-none absolute z-[55] flex min-w-0 flex-col ${justifyClass} ${anchorClass}`}
      style={gapStyle}
      aria-hidden={!isVisible}
    >
      <motion.div
        initial={false}
        animate={isVisible ? 'visible' : 'hidden'}
        variants={outsideStaggerContainerVariants}
        className={`collage-hover-stagger-stack flex max-h-full w-full flex-col ${justifyClass} overflow-visible ${textAlign}`}
      >
        {lines.map((line, i) => (
          <CollageHoverStaggerLine
            key={`${paneId}-${i}-${line.slice(0, 12)}`}
            textAlign={textAlign}
          >
            {line}
          </CollageHoverStaggerLine>
        ))}
      </motion.div>
    </div>
  )
}

function W3OutsideStaggerText({ isVisible }: { isVisible: boolean }) {
  return (
    <PaneOutsideStaggerText
      paneId="w3"
      lines={W3_HOVER_LINES}
      isVisible={isVisible}
      side="left"
    />
  )
}

function W10OutsideStaggerText({ isVisible }: { isVisible: boolean }) {
  return (
    <PaneOutsideStaggerText
      paneId="w10"
      lines={W10_HOVER_LINES}
      isVisible={isVisible}
      side="right"
    />
  )
}

/** Staggered copy above the pane (w2 office, w8 shower, w9 studying). */
function PaneAboveStaggerText({
  paneId,
  lines,
  isVisible,
  textAlign = 'text-center',
  stackZ = 55,
  measure = 'centered',
}: {
  paneId: string
  lines: readonly string[]
  isVisible: boolean
  textAlign?: 'text-center' | 'text-left' | 'text-right'
  stackZ?: number
  /** `pane` = full frame width (w6); default centered wide column. */
  measure?: 'centered' | 'pane'
}) {
  const aboveClass =
    measure === 'pane'
      ? 'collage-hover-stagger-above collage-hover-stagger-above--pane'
      : 'collage-hover-stagger-above'

  return (
    <div
      data-pane-hover-copy={paneId}
      className={`${aboveClass} pointer-events-none absolute bottom-full flex h-[min(10rem,28vh)] max-h-[min(180px,calc(100vw-2rem))] min-h-0 flex-col justify-end`}
      style={{ marginBottom: HOVER_COPY_FRAME_GAP_PX, zIndex: stackZ }}
      aria-hidden={!isVisible}
    >
      <motion.div
        initial={false}
        animate={isVisible ? 'visible' : 'hidden'}
        variants={outsideStaggerContainerVariants}
        className={`collage-hover-stagger-stack flex max-h-full w-full flex-col justify-end ${
          measure === 'pane' ? 'items-start' : ''
        } overflow-visible ${textAlign}`}
      >
        {lines.map((line, i) => (
          <CollageHoverStaggerLine
            key={`${paneId}-${i}-${line.slice(0, 12)}`}
            textAlign={textAlign}
          >
            <span>{line}</span>
          </CollageHoverStaggerLine>
        ))}
      </motion.div>
    </div>
  )
}

/** Mobile carousel slide order (narrative flow). */
const MOBILE_COLLAGE_SLIDE_ORDER = [
  'w10',
  'w1',
  'w3',
  'w8',
  'w9',
  'bedRoom',
  'w2',
  'w6',
] as const

type MobileCollageSlideId = (typeof MOBILE_COLLAGE_SLIDE_ORDER)[number]

const MOBILE_COLLAGE_HOVER_LINES: Record<MobileCollageSlideId, readonly string[]> = {
  w10: W10_HOVER_LINES,
  w1: W1_HOVER_LINES,
  w3: W3_HOVER_LINES,
  w8: W8_HOVER_LINES,
  w9: W9_HOVER_LINES,
  bedRoom: BEDROOM_HOVER_LINES,
  w2: W2_HOVER_LINES,
  w6: W6_HOVER_LINES,
}

/** Gap between bottom of window frames and the active-slide copy block (Figma mobile). */
const MOBILE_FRAME_TO_COPY_GAP_PX = 12

/** Mobile stagger line size, used for the active slide captions below each frame. */
const MOBILE_COLLAGE_STAGGER_FONT_SCALE = 1.45
const MOBILE_COLLAGE_STAGGER_FONT_SIZE = `clamp(calc(0.95rem * ${MOBILE_COLLAGE_STAGGER_FONT_SCALE}), calc(3.6vw * ${MOBILE_COLLAGE_STAGGER_FONT_SCALE}), calc(1.125rem * ${MOBILE_COLLAGE_STAGGER_FONT_SCALE}))`

const MOBILE_COLLAGE_CONTENT_Z = COLLAGE_HOVER_OVERLAY_Z + 1

const MOBILE_COPY_LAYOUT_TRANSITION = {
  layout: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
}

const MOBILE_COLLAGE_ASPECT: Record<MobileCollageSlideId, string> = {
  w10: 'aspect-[4/5]',
  w1: 'aspect-[4/5]',
  w3: 'aspect-[3/4]',
  w8: 'aspect-video',
  w9: 'aspect-[4/3]',
  bedRoom: 'aspect-[5/3]',
  w2: 'aspect-video',
  w6: 'aspect-[4/3]',
}

function getMobileSlideWindowItems(slideId: MobileCollageSlideId): WindowData[] {
  if (slideId === 'bedRoom') {
    return windowData.filter((w) => w.sharedSceneGroupId === 'bedRoom')
  }
  const item = windowData.find((w) => w.id === slideId)
  return item ? [item] : []
}

/** Figma 399:435 — pill scroll indicator (215×19, active dot white, inactive #8F8F8F). */
const MOBILE_SCROLL_INDICATOR_WIDTH = 215
const MOBILE_SCROLL_INDICATOR_HEIGHT = 19
const MOBILE_SCROLL_INDICATOR_DOT_R = 4.5
const MOBILE_SCROLL_INDICATOR_DOT_Y = 9.5
const MOBILE_SCROLL_INDICATOR_DOT_START_X = 11.5
const MOBILE_SCROLL_INDICATOR_DOT_END_X = 203.5

function MobileCollageScrollIndicator({
  activeIndex,
  onSelectIndex,
}: {
  activeIndex: number
  onSelectIndex: (index: number) => void
}) {
  const count = MOBILE_COLLAGE_SLIDE_ORDER.length
  const step =
    count > 1
      ? (MOBILE_SCROLL_INDICATOR_DOT_END_X - MOBILE_SCROLL_INDICATOR_DOT_START_X) /
        (count - 1)
      : 0

  return (
    <div
      data-node-id="399:435"
      className="flex justify-center"
      role="tablist"
      aria-label={`Window carousel position, ${activeIndex + 1} of ${count}`}
    >
      <svg
        viewBox={`0 0 ${MOBILE_SCROLL_INDICATOR_WIDTH} ${MOBILE_SCROLL_INDICATOR_HEIGHT}`}
        className="h-[19px] w-[min(58vw,215px)] max-w-[215px]"
      >
        <rect
          width={MOBILE_SCROLL_INDICATOR_WIDTH}
          height={MOBILE_SCROLL_INDICATOR_HEIGHT}
          rx={MOBILE_SCROLL_INDICATOR_HEIGHT / 2}
          fill="rgba(0, 0, 0, 0.45)"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth={1}
          pointerEvents="none"
        />
        {Array.from({ length: count }, (_, i) => {
          const cx = MOBILE_SCROLL_INDICATOR_DOT_START_X + i * step
          const isActive = i === activeIndex
          return (
            <g key={MOBILE_COLLAGE_SLIDE_ORDER[i]}>
              <circle
                cx={cx}
                cy={MOBILE_SCROLL_INDICATOR_DOT_Y}
                r={12}
                fill="transparent"
                className="cursor-pointer"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to window ${i + 1} of ${count}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onSelectIndex(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectIndex(i)
                  }
                }}
              />
              <circle
                cx={cx}
                cy={MOBILE_SCROLL_INDICATOR_DOT_Y}
                r={MOBILE_SCROLL_INDICATOR_DOT_R}
                fill={isActive ? '#ffffff' : '#8F8F8F'}
                pointerEvents="none"
                className="transition-[fill] duration-300 ease-out"
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/** Staggered copy below the active mobile frame (reuses desktop hover line animation). */
function CollageMobileStaggerText({
  lines,
  isVisible = true,
}: {
  lines: readonly string[]
  isVisible?: boolean
}) {
  return (
    <motion.div
      layout
      initial={false}
      animate={isVisible ? 'visible' : 'hidden'}
      variants={outsideStaggerContainerVariants}
      transition={MOBILE_COPY_LAYOUT_TRANSITION}
      className="collage-mobile-stagger flex w-full flex-col items-center justify-start gap-0 px-2 pt-0 text-center"
      style={{ fontSize: MOBILE_COLLAGE_STAGGER_FONT_SIZE }}
      aria-hidden={!isVisible}
    >
      {lines.map((line, i) => (
        <CollageHoverStaggerLine
          key={`mobile-${i}-${line.slice(0, 12)}`}
          textAlign="text-center"
        >
          {line}
        </CollageHoverStaggerLine>
      ))}
    </motion.div>
  )
}

function MobileCollageWindowPane({
  item,
  isActive,
  archClipId,
  markAssetReady,
  videoRefs,
}: {
  item: WindowData
  isActive: boolean
  archClipId: string
  markAssetReady: (key: string) => void
  videoRefs: React.MutableRefObject<Partial<Record<string, HTMLVideoElement | null>>>
}) {
  const sharedSceneGroup = item.sharedSceneGroupId
    ? sharedSceneGroups[item.sharedSceneGroupId]
    : undefined
  const videoSrc = getWindowVideoSrc(item)
  const videoZoom = item.videoCropZoom ?? VIDEO_CROP_ZOOM
  const mediaW = item.videoMediaWidthPct
  const videoOp = videoCoverObjectPositionParts(item)
  const isArchTop = item.frameShape === 'arched-top'
  const archClipStyle = isArchTop
    ? { clipPath: `url(#${archClipId})` as const }
    : undefined

  useEffect(() => {
    const el = videoRefs.current[item.id]
    if (!el || !videoSrc) return
    if (isActive) {
      void el.play().catch(() => {})
    } else {
      el.pause()
      el.currentTime = 0
    }
  }, [isActive, item.id, videoSrc, videoRefs])

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-black ${
        isArchTop ? '' : 'rounded-sm'
      }`}
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
            {!isActive && (
              <div className="absolute inset-0 z-[1] overflow-hidden" aria-hidden>
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
                      alt=""
                      fill
                      className={`object-cover opacity-95 ${videoOp.extraClass}`.trim()}
                      style={videoOp.positionStyle}
                      sizes="85vw"
                      onLoad={() => markAssetReady(`image:${item.id}`)}
                      onError={() => markAssetReady(`image:${item.id}`)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : sharedSceneGroup ? (
        <div className="relative h-full w-full overflow-hidden">
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
                {!isActive && (
                  <div className="absolute inset-0 z-[1] overflow-hidden" aria-hidden>
                    <Image
                      src={sharedSceneGroup.imageUrl}
                      alt=""
                      fill
                      className={`object-cover opacity-95 ${videoOp.extraClass}`.trim()}
                      style={videoOp.positionStyle}
                      sizes="42vw"
                      onLoad={() => markAssetReady(`image:${item.id}`)}
                      onError={() => markAssetReady(`image:${item.id}`)}
                    />
                  </div>
                )}
              </>
            ) : (
              <Image
                src={sharedSceneGroup.imageUrl}
                alt=""
                fill
                className="object-cover opacity-80"
                sizes="42vw"
                onLoad={() => markAssetReady(`image:${item.id}`)}
                onError={() => markAssetReady(`image:${item.id}`)}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="relative h-full w-full overflow-hidden">
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
              alt=""
              fill
              className="object-cover opacity-80"
              style={isArchTop ? { objectPosition: 'center 32%' } : undefined}
              sizes="85vw"
              onLoad={() => markAssetReady(`image:${item.id}`)}
              onError={() => markAssetReady(`image:${item.id}`)}
            />
          </div>
        </div>
      )}
      {isArchTop ? <ArchedTopWindowFrame /> : (
        <div
          className="absolute inset-0 border-[6px] border-black pointer-events-none z-20"
          aria-hidden
        />
      )}
      {isArchTop ? <ArchedTopWindowMullions /> : renderWindowPanes(item.paneType)}
    </div>
  )
}

/** Figma 398:339 / 398:340 / 398:338 — brand block; shifts down via layout when copy expands. */
function MobileCollageBrandFooter() {
  return (
    <motion.footer
      layout
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{
        ...MOBILE_COPY_LAYOUT_TRANSITION,
        opacity: { duration: 0.65, ease: 'easeOut' },
      }}
      className="collage-mobile-brand-footer relative mt-12 flex w-full flex-col items-stretch px-5 pb-[calc(0.5rem*0.95)] pt-[calc(0.5rem*0.95)]"
    >
      <div className="mx-auto flex w-full max-w-[min(88vw,340px)] flex-col items-center justify-center gap-0">
        <p
          data-node-id="398:339"
          className="max-w-[20rem] text-center text-[clamp(1.5rem,7vw,1.75rem)] font-bold leading-[calc(1.05*0.95)] tracking-normal text-white [text-shadow:0_0_20.112px_rgba(255,255,255,0.85)]"
        >
          If life gives you something worth keeping.
        </p>
      </div>
      <div
        className="relative mx-auto mt-6 h-[clamp(4.25rem,18vw,6.25rem)] w-[clamp(9.5rem,42vw,15rem)]"
        data-node-id="398:338"
      >
        <Image
          src="/logos/memsurf-logo.svg"
          alt="MemSurf logo"
          fill
          className="object-contain object-center"
          sizes="(max-width: 768px) 55vw, 240px"
        />
      </div>
      <p
        data-node-id="398:340"
        className="mt-6 self-center text-center text-[clamp(1.5rem,7vw,1.75rem)] font-bold leading-[calc(1.05*0.95)] tracking-normal text-white [text-shadow:0_0_20.112px_rgba(255,255,255,0.85)]"
      >
        <span className="block whitespace-nowrap">MemSurf helps you</span>
        <span className="block whitespace-nowrap">remember it.</span>
      </p>
    </motion.footer>
  )
}

function MobileCollageCarousel({
  archClipId,
  markAssetReady,
}: {
  archClipId: string
  markAssetReady: (key: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Partial<Record<string, HTMLVideoElement | null>>>({})
  const [activeSlideId, setActiveSlideId] = useState<MobileCollageSlideId>(
    MOBILE_COLLAGE_SLIDE_ORDER[0],
  )

  const updateActiveSlideFromCenter = useCallback(() => {
    const root = scrollRef.current
    if (!root) return

    const rootRect = root.getBoundingClientRect()
    const rootCenterX = rootRect.left + rootRect.width / 2
    let closestSlideId: MobileCollageSlideId | null = null
    let closestDistance = Number.POSITIVE_INFINITY

    root.querySelectorAll<HTMLElement>('[data-mobile-slide]').forEach((el) => {
      const id = el.getAttribute('data-mobile-slide')
      if (
        !id ||
        !(MOBILE_COLLAGE_SLIDE_ORDER as readonly string[]).includes(id)
      ) {
        return
      }

      const rect = el.getBoundingClientRect()
      const slideCenterX = rect.left + rect.width / 2
      const distance = Math.abs(slideCenterX - rootCenterX)

      if (distance < closestDistance) {
        closestDistance = distance
        closestSlideId = id as MobileCollageSlideId
      }
    })

    if (closestSlideId != null) {
      const nextSlideId = closestSlideId
      setActiveSlideId((current) =>
        current === nextSlideId ? current : nextSlideId,
      )
    }
  }, [])

  useEffect(() => {
    const root = scrollRef.current
    if (!root) return

    let frame: number | null = null
    const requestUpdate = () => {
      if (frame != null) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        updateActiveSlideFromCenter()
      })
    }

    requestUpdate()
    root.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (frame != null) {
        window.cancelAnimationFrame(frame)
      }
      root.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [updateActiveSlideFromCenter])

  const scrollToSlideIndex = (index: number) => {
    const slideId = MOBILE_COLLAGE_SLIDE_ORDER[index]
    if (!slideId) return

    const root = scrollRef.current
    const slideEl = root?.querySelector<HTMLElement>(
      `[data-mobile-slide="${slideId}"]`,
    )
    if (slideEl) {
      slideEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      })
    }
    setActiveSlideId(slideId)
  }

  return (
    <div className="relative w-full md:hidden">
      <div
        className="relative w-full"
        style={{ zIndex: MOBILE_COLLAGE_CONTENT_Z }}
      >
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden>
        <defs>
          <clipPath id={`${archClipId}-mobile`} clipPathUnits="objectBoundingBox">
            <path d={ARCH_CLIP_PATH_D} />
          </clipPath>
        </defs>
      </svg>
      <div
        className="flex w-full flex-col items-center"
        style={{ gap: MOBILE_FRAME_TO_COPY_GAP_PX }}
      >
      <div className="collage-mobile-viewport collage-mobile-viewport-fade relative w-screen max-w-[100vw] self-start">
        <div
          ref={scrollRef}
          className="collage-mobile-scroll flex w-full snap-x snap-mandatory items-end gap-4 overflow-x-auto overflow-y-visible scroll-smooth px-[max(1rem,calc((100%-min(88vw,340px))/2))] pb-8 pt-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="MemSurf moment windows"
        >
        {MOBILE_COLLAGE_SLIDE_ORDER.map((slideId) => {
          const items = getMobileSlideWindowItems(slideId)
          const isActive = activeSlideId === slideId
          const isBedPair = slideId === 'bedRoom' && items.length === 2
          const mobileArchClipId = `${archClipId}-mobile`

          return (
            <div
              key={slideId}
              data-mobile-slide={slideId}
              className="flex w-[min(88vw,340px)] shrink-0 snap-center flex-col"
            >
              <div
                className={`relative w-full shrink-0 overflow-visible ${MOBILE_COLLAGE_ASPECT[slideId]}`}
              >
                <div
                  className={`absolute inset-0 overflow-hidden shadow-[0_10px_28px_-6px_rgba(0,0,0,0.45)] transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-45'
                  } ${isBedPair ? 'flex' : ''}`}
                >
                  {isBedPair ? (
                    items.map((item, i) => (
                      <div
                        key={item.id}
                        className={`relative h-full flex-1 overflow-hidden bg-black ${
                          i === 0 ? 'border-r-[3px] border-black' : ''
                        }`}
                      >
                        <MobileCollageWindowPane
                          item={item}
                          isActive={isActive}
                          archClipId={mobileArchClipId}
                          markAssetReady={markAssetReady}
                          videoRefs={videoRefs}
                        />
                      </div>
                    ))
                  ) : items[0] ? (
                    <MobileCollageWindowPane
                      item={items[0]}
                      isActive={isActive}
                      archClipId={mobileArchClipId}
                      markAssetReady={markAssetReady}
                      videoRefs={videoRefs}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
        </div>
        <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2">
          <MobileCollageScrollIndicator
            activeIndex={MOBILE_COLLAGE_SLIDE_ORDER.indexOf(activeSlideId)}
            onSelectIndex={scrollToSlideIndex}
          />
        </div>
      </div>

      <LayoutGroup id="mobile-collage-copy">
        <div
          className="flex w-full max-w-[min(88vw,340px)] flex-col items-center px-2"
          style={
            {
              ['--collage-hover-font-size' as string]:
                MOBILE_COLLAGE_STAGGER_FONT_SIZE,
            } as React.CSSProperties
          }
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={activeSlideId}
              layout="position"
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                ...MOBILE_COPY_LAYOUT_TRANSITION,
                opacity: { duration: 0.28, ease: 'easeOut' },
              }}
            >
              <CollageMobileStaggerText
                lines={MOBILE_COLLAGE_HOVER_LINES[activeSlideId]}
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <MobileCollageBrandFooter />
      </LayoutGroup>
      </div>
      </div>
    </div>
  )
}

type WindowsCollageProps = {
  /**
   * Split hero: Gǣthis is whereGǥ above `w10`; GǣNot just between moments.Gǥ between `w1`/`w4` and `w9`/`w2`; GǣButGǥ / GǣafterGǥ / Gǣlearning.Gǥ left of `w2`; GǣAfter taking notesGǪGǥ in the gutter above `w6`; GǣAfter reading.Gǥ under `w4`/`w5`; footer: GǣIf lifeGǪGǥ, GǣMemSurf helps you remember it.Gǥ; GǣMEMSURFGǥ / GǣFITSGǥ under `w3` / `w8`.
   */
  workflowHeroCopy?: boolean
  onReady?: () => void
  onLoadProgress?: (loaded: number, total: number) => void
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

export default function WindowsCollage({
  workflowHeroCopy,
  onReady,
  onLoadProgress,
}: WindowsCollageProps = {}) {
  const archClipId = useId().replace(/:/g, '')
  const { track } = useAmplitude()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const videoRefs = useRef<Partial<Record<string, HTMLVideoElement | null>>>({})
  const hoverFalloffTimeoutRef = useRef<number | null>(null)
  const collageThirdMarkerRefs = useRef<Partial<Record<CollageThirdMarkerKey, HTMLDivElement | null>>>({})
  const trackedCollageThirdsRef = useRef<Set<CollageThirdMarkerKey>>(new Set())
  const readyAssetKeysRef = useRef<Set<string>>(new Set())
  const hasReportedReadyRef = useRef(false)

  const markAssetReady = useCallback(
    (key: string) => {
      if (readyAssetKeysRef.current.has(key)) return

      readyAssetKeysRef.current.add(key)
      const loaded = readyAssetKeysRef.current.size
      const total = COLLAGE_READY_ASSET_KEYS.length
      onLoadProgress?.(loaded, total)

      if (!onReady || hasReportedReadyRef.current) return

      if (loaded >= total) {
        hasReportedReadyRef.current = true
        onReady()
      }
    },
    [onReady, onLoadProgress],
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

  const visibleWindowsSorted = useMemo(() => {
    if (!hoveredId) return visibleWindowData
    const active = visibleWindowData.filter((w) => getHoverId(w) === hoveredId)
    const rest = visibleWindowData.filter((w) => getHoverId(w) !== hoveredId)
    return [...rest, ...active]
  }, [hoveredId, visibleWindowData, getHoverId])

  const sharedSceneHoverRects = useMemo(() => getSharedSceneHoverRects(), [])

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

  const w10Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w10') : undefined
  const w3Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w3') : undefined
  const w8Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w8') : undefined
  const w9Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w9') : undefined
  const w4Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w4') : undefined
  const w5Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w5') : undefined
  const w2Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w2') : undefined

  const w4BedPane = windowData.find((w) => w.id === 'w4')
  const w5BedPane = windowData.find((w) => w.id === 'w5')
  const bedRoomHoverSpan =
    w4BedPane != null && w5BedPane != null
      ? combinedHorizontalSpan(w4BedPane, w5BedPane)
      : null
  const afterReadingBedSpan =
    w4Pane != null && w5Pane != null
      ? combinedHorizontalSpan(w4Pane, w5Pane)
      : bedRoomHoverSpan
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
      if (hoveredId === getHoverId(w)) {
        void el.play().catch(() => {})
      } else {
        el.pause()
        el.currentTime = 0
      }
    }
  }, [hoveredId, getHoverId])

  return (
    <>
    <MobileCollageCarousel
      archClipId={archClipId}
      markAssetReady={markAssetReady}
    />
    <div className="relative hidden w-full flex-col items-center justify-center overflow-visible bg-transparent md:flex">
      <div className="mx-auto w-full max-w-[1481.51px] px-[clamp(0.5rem,2vw,1.25rem)]">
        <div
          className="collage-scale-root relative w-full aspect-[1481.51/2582] isolate overflow-visible"
          style={
            {
              ['--collage-hover-font-size' as string]:
                collageHoverFontSizeCssVar(),
            } as React.CSSProperties
          }
        >
          <div className="absolute inset-0 -translate-y-[3%] overflow-visible">
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
        <AnimatePresence>
          {hoveredId !== null ? (
            <motion.div
              key="collage-hover-spotlight-overlay"
              className="pointer-events-none absolute left-1/2 top-0 z-[50] h-full w-screen -translate-x-1/2 backdrop-blur-[2px]"
              style={{
                zIndex: COLLAGE_HOVER_OVERLAY_Z,
                backgroundImage: COLLAGE_HOVER_OVERLAY_GRADIENT,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              aria-hidden
            />
          ) : null}
        </AnimatePresence>
        {sharedSceneHoverRects.map((rect) => {
          const isGroupHovered = hoveredId === rect.groupId
          return (
            <div
              key={`shared-scene-hover-${rect.groupId}`}
              data-shared-scene={rect.groupId}
              className="absolute"
              style={{
                left: `${rect.leftPct}%`,
                width: `${rect.widthPct}%`,
                top: rect.top,
                height: rect.height,
                zIndex: isGroupHovered
                  ? COLLAGE_SHARED_SCENE_HOVER_Z_ACTIVE
                  : COLLAGE_SHARED_SCENE_HOVER_Z_IDLE,
              }}
              onMouseEnter={() => activateHover(rect.groupId)}
              onMouseLeave={scheduleHoverClear}
            >
              {rect.groupId === 'bedRoom' ? (
                <PaneOutsideStaggerText
                  paneId="bedRoom"
                  lines={BEDROOM_HOVER_LINES}
                  isVisible={isGroupHovered}
                  side="left"
                />
              ) : null}
            </div>
          )
        })}
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
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[48] text-right font-bold text-white" style={{ left: designX(199), top: designY(709.35), width: designX(411.08), fontSize: scaledFontSize('clamp(0.85rem, 3.9cqi, 3.6rem)'), lineHeight: '1.2', textShadow: '0px 0px 23px rgba(255,255,255,1)' }}>This is where</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[48] font-bold" style={{ left: designX(637), top: designY(878), fontSize: scaledFontSize('clamp(1rem, 5.25cqi, 4.9rem)'), lineHeight: '1', backgroundImage: 'linear-gradient(90deg, #E6B3FF 3.91%, #84AAE1 51.8%, #96EEDC 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', textShadow: '0px 0px 23px rgba(134,170,225,1)' }}>MemSurf</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[48] font-bold italic text-white" style={{ left: designX(1037), top: '36%', fontSize: scaledFontSize('clamp(0.85rem, 3.85cqi, 3.6rem)'), lineHeight: '1.2', textShadow: '0px 0px 38px rgba(255,255,255,0.85)' }}>fits</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[48] whitespace-pre-line text-center text-white [font-family:var(--font-collage-tagline),cursive]" style={{ left: designX(674), top: designY(988), fontSize: scaledFontSize('clamp(1.3rem, 6.2cqi, 5.8rem)'), lineHeight: '1', textShadow: '0px 0px 23px rgba(255,255,255,1)' }}>{'Not just\nbetween \nmoments'}</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[48] text-center font-bold text-white" style={{ left: '37%', top: designY(1286), width: designX(509), fontSize: scaledFontSize('clamp(0.9rem, 3.9cqi, 3.6rem)'), textShadow: '0px 0px 23px rgba(255,255,255,0.85)' }}>But after learning,</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[48] text-center font-bold text-white" style={{ left: '33.5%', top: designY(1613.81), width: designX(600), fontSize: scaledFontSize('clamp(0.95rem, 4.05cqi, 3.75rem)'), textShadow: '0px 0px 23px rgba(255,255,255,0.85)' }}>after reading.</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[48] font-bold text-white" style={{ left: designX(789), top: '67.5%', width: designX(614), fontSize: scaledFontSize('clamp(0.95rem, 4.15cqi, 3.85rem)'), textShadow: '0px 0px 23px rgba(255,255,255,0.85)' }}>After taking notes you&apos;ll never revisit.</motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.35 }} className="pointer-events-none absolute z-[48] text-[#f3f4f6] [font-family:var(--font-collage-note)]" style={{ left: designX(789), top: '75%', width: designX(713), fontSize: scaledFontSize('clamp(1rem, 4.3cqi, 4rem)'), textShadow: '0px 0px 23px rgba(255,255,255,1)' }}>If life gives you something worth keeping.</motion.p>
            <motion.p
              data-collage-brand-footer
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              className="pointer-events-none absolute whitespace-pre-line text-center font-bold text-white"
              style={{
                left: '21.4%',
                top: '85%',
                zIndex: COLLAGE_BRAND_FOOTER_Z,
                fontSize: scaledFontSize('clamp(1.35rem, 6.24cqi, 5.75rem)'),
                lineHeight: '1.01',
                textShadow: '0px 0px 23px rgba(255,255,255,0.85)',
              }}
            >
              {'MemSurf helps you\nremember it.'}
            </motion.p>
            <img
              data-collage-brand-footer
              src="/logos/memsurf-logo.svg"
              alt="MemSurf logo"
              className="pointer-events-none absolute"
              style={{
                left: '43.5%',
                top: '94%',
                width: designX(185.4),
                height: designY(111.99),
                zIndex: COLLAGE_BRAND_FOOTER_Z,
              }}
            />
          </>
        )}
        {visibleWindowsSorted.map((item, index) => {
          const sharedSceneGroup = item.sharedSceneGroupId
            ? sharedSceneGroups[item.sharedSceneGroupId]
            : undefined
          const hoverId = getHoverId(item)
          const isHovered = hoveredId === hoverId
          const spotlight = hoveredId !== null && isHovered
          const paneStackZ = spotlight ? 60 : item.zIndex
          const videoZoom = item.videoCropZoom ?? VIDEO_CROP_ZOOM
          const mediaW = item.videoMediaWidthPct
          const videoOp = videoCoverObjectPositionParts(item)
          const isArchTop = item.frameShape === 'arched-top'
          const archClipStyle = isArchTop
            ? { clipPath: `url(#${archClipId})` as const }
            : undefined
          const hoverScalesPane =
            isHovered && item.sharedSceneGroupId == null
          const outerWindowStyle: any = isArchTop
            ? {
                transform: hoverScalesPane
                  ? `scale(${WINDOW_HOVER_SCALE})`
                  : 'scale(1)',
                transformOrigin: sharedSceneGroup
                  ? getSharedSceneTransformOrigin(item, sharedSceneGroup)
                  : 'center',
                backfaceVisibility: 'hidden',
                ...archClipStyle,
                filter: isHovered
                  ? item.id === 'w3'
                    ? W3_FRAME_HOVER_FILTER
                    : 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.55))'
                  : 'drop-shadow(0 10px 18px rgba(0, 0, 0, 0.35))',
              }
            : {
                transform: hoverScalesPane
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

          const w3CenteredLayout = item.id === 'w3'

          return (
            <div
              key={item.id}
              data-window-id={item.id}
              className="absolute overflow-visible p-0"
              style={{
                top: w1WorkflowLayout ? '50%' : item.top,
                left: w1WorkflowLayout
                  ? '1%'
                  : w3CenteredLayout
                    ? `${50 - percentValue(item.width) / 2 + 5}%`
                    : item.left,
                width: w1WorkflowLayout ? '29%' : item.width,
                height: w1WorkflowLayout ? '17%' : item.height,
                zIndex: paneStackZ,
                pointerEvents: item.sharedSceneGroupId ? 'none' : 'auto',
              }}
              {...(item.sharedSceneGroupId
                ? {}
                : {
                    onMouseEnter: () => activateHover(hoverId),
                    onMouseLeave: scheduleHoverClear,
                  })}
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
              {item.id === 'w10' ? (
                <W10OutsideStaggerText isVisible={isHovered} />
              ) : null}
              {isKitchenPane(item) ? (
                <div
                  data-pane-hover-copy="w1-kitchen"
                  data-video-src={item.videoSrc}
                  className="collage-hover-stagger-column pointer-events-none absolute left-full top-0 bottom-0 z-[55] flex min-w-0 flex-col justify-center"
                  style={{ marginLeft: HOVER_COPY_FRAME_GAP_PX }}
                  aria-hidden={!isHovered}
                >
                  <motion.div
                    initial={false}
                    animate={isHovered ? 'visible' : 'hidden'}
                    variants={outsideStaggerContainerVariants}
                    className="collage-hover-stagger-stack flex max-h-full w-full flex-col justify-center overflow-visible text-left"
                  >
                    {W1_HOVER_LINES.map((line, i) => (
                      <CollageHoverStaggerLine
                        key={`w1-kitchen-${i}`}
                        textAlign="text-left"
                      >
                        <span>{line}</span>
                      </CollageHoverStaggerLine>
                    ))}
                  </motion.div>
                </div>
              ) : null}
              {item.id === 'w3' ? (
                <W3OutsideStaggerText isVisible={isHovered} />
              ) : null}
              {isOfficePane(item) ? (
                <div
                  data-pane-hover-copy="w2-office"
                  data-video-src={item.videoSrc}
                  className="collage-hover-stagger-above pointer-events-none absolute bottom-full flex h-[min(10rem,28vh)] max-h-[min(180px,calc(100vw-2rem))] min-h-0 flex-col justify-end"
                  style={{
                    marginBottom: HOVER_COPY_FRAME_GAP_PX,
                    zIndex: isHovered ? 1001 : 55,
                  }}
                  aria-hidden={!isHovered}
                >
                  <motion.div
                    initial={false}
                    animate={isHovered ? 'visible' : 'hidden'}
                    variants={outsideStaggerContainerVariants}
                    className="collage-hover-stagger-stack flex max-h-full w-full flex-col justify-end overflow-visible text-center"
                  >
                    {W2_HOVER_LINES.map((line, i) => (
                      <CollageHoverStaggerLine
                        key={`w2-office-${i}`}
                        textAlign="text-center"
                      >
                        <span>{line}</span>
                      </CollageHoverStaggerLine>
                    ))}
                  </motion.div>
                </div>
              ) : null}
              {isShowerPane(item) ? (
                <PaneAboveStaggerText
                  paneId="w8-shower"
                  lines={W8_HOVER_LINES}
                  isVisible={isHovered}
                  textAlign="text-center"
                  stackZ={isHovered ? 1001 : 55}
                />
              ) : null}
              {isStudyingPane(item) ? (
                <PaneAboveStaggerText
                  paneId="w9-studying"
                  lines={W9_HOVER_LINES}
                  isVisible={isHovered}
                  textAlign="text-center"
                  stackZ={isHovered ? 1001 : 55}
                />
              ) : null}
              {isW6Pane(item) ? (
                <PaneAboveStaggerText
                  paneId="w6-desk"
                  lines={W6_HOVER_LINES}
                  isVisible={isHovered}
                  textAlign="text-left"
                  measure="pane"
                  stackZ={isHovered ? 1001 : 55}
                />
              ) : null}
            </div>
          )
        })}
          </div>
        </div>
        
        {!workflowHeroCopy && (
          <motion.p
            data-collage-brand-footer
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: 'easeOut', delay: 0.08 }}
            className="relative z-[65] w-full px-1 pt-8 pb-1 text-center font-bold leading-[1.05] tracking-tight text-white [text-wrap:balance] md:pt-10 md:pb-2"
            style={{ fontSize: scaledFontSize('clamp(1.75rem, min(9cqi, 10vw), 5.75rem)') }}
          >
            MemSurf helps you remember it.
          </motion.p>
        )}
      </div>
    </div>
    </>
  )
}
