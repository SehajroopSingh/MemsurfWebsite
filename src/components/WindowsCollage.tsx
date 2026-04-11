'use client'

import React, { useState, useRef, useEffect, useId } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

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
  /** Wider than 100% = horizontal overscan; overflow clips side letterboxing (e.g. 155–175). */
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
   * Makes the video “jump” across the mullion/padding so edges don’t line up like one continuous crop.
   */
  horizontalGapExtra?: number
}

/** Hover scale on the outer frame (was 1.5; keep subtle so panes don’t dominate the collage). */
const WINDOW_HOVER_SCALE = 1.1

/** Slight zoom so video/poster are cropped (edges clipped) inside the window. */
const VIDEO_CROP_ZOOM = 1.14

/** Extra scale + focal bias so arched-top windows fill the semicircle (no empty/black wedges in the curve). */
const ARCH_TOP_MEDIA_SCALE = 1.12

const sharedSceneGroups: Record<string, SharedSceneGroup> = {
  /** Bounding box must match the union of all panes in this scene (w4 + w5). */
  bedRoom: {
    imageUrl: '/videos/veo3.1-with-reference-images-bed-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-bed.mp4',
    top: 72,
    left: 67,
    width: 31,
    height: 28,
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
          top: `${-((itemTop - group.top) / itemHeight) * 100}%`,
          width: `${(V / itemWidth) * 100}%`,
          height: `${(group.height / itemHeight) * 100}%`,
        }
      }
      if (item.id === b.id) {
        const uBeforeB = aW + gap + extra
        return {
          left: `${-(uBeforeB / itemWidth) * 100}%`,
          top: `${-((itemTop - group.top) / itemHeight) * 100}%`,
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

const windowData: WindowData[] = [
  {
    id: 'w1',
    imageUrl: '/videos/veo3.1-with-reference-images-kitchen-good-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-kitchen-good.mp4',
    /** Workflow hero: position overridden in component (under w10 tagline). Default: under bed column. */
    top: '100%',
    left: '67%',
    width: '31%',
    height: '25%',
    zIndex: 10,
    paneType: 'grid-6'
  },
  {
    id: 'w2',
    imageUrl: '/videos/veo3.1-with-reference-images-office-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-office.mp4',
    /** Left column; same row as w1 under bed. */
    top: '78%',
    left: '15%',
    width: '50%',
    height: '30%',
    zIndex: 11,
    paneType: 'split-v'
  },
  {
    id: 'w3',
    imageUrl: '/videos/veo3.1-with-reference-images-coffee3-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-coffee3.mp4',
    /** 16:9 in square+arch: cover crops sides; focal point right of center (more on narrow). */
    videoObjectPosition: '58% center',
    videoObjectPositionNarrow: '58% center',
    videoCropZoom: 1,
    top: '2%',
    left: '39%',
    width: '22%',
    height: '38%',
    zIndex: 12,
    paneType: 'grid-4',
    square: true,
    frameShape: 'arched-top'
  },
  {
    id: 'w4',
    imageUrl: sharedSceneGroups.bedRoom.imageUrl,
    top: '72%',
    left: '67%',
    width: '15%',
    height: '28%',
    videoCropZoom: 1.12,
    videoObjectPosition: '32% 28%',
    zIndex: 13,
    paneType: 'single',
    sharedSceneGroupId: 'bedRoom'
  },
  {
    id: 'w5',
    imageUrl: sharedSceneGroups.bedRoom.imageUrl,
    top: '72%',
    left: '83%',
    width: '15%',
    height: '28%',
    videoCropZoom: 1.12,
    videoObjectPosition: '32% 28%',
    zIndex: 14,
    paneType: 'split-h',
    sharedSceneGroupId: 'bedRoom'
  },
  {
    id: 'w6',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&q=80',
    top: '92%',
    left: '60%',
    width: '38%',
    height: '7%',
    zIndex: 19,
    paneType: 'grid-4'
  },
  {
    id: 'w8',
    imageUrl: '/videos/veo3.1-with-reference-images-shower-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-shower.mp4',
    videoObjectPosition: 'center 28%',
    videoCropZoom: 1,
    videoMediaWidthPct: 115,
    top: '23%',
    left: '62%',
    width: '37%',
    height: '12%',
    zIndex: 17,
    paneType: 'grid-4'
  },
  {
    id: 'w9',
    imageUrl: '/videos/veo3.1-with-reference-images-studying-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-studying.mp4',
    wide169: true,
    top: '45%',
    left: '40%',
    width: '40%',
    height: '20%',
    zIndex: 18,
    paneType: 'grid-4'
  },
  {
    id: 'w10',
    imageUrl: '/videos/veo3.1_with_reference_images_extended_shopping-poster.jpg',
    videoSrc: '/videos/veo3.1_with_reference_images_extended_shopping.mp4',
    top: '25%',
    left: '0%',
    width: '38%',
    height: '24%',
    zIndex: 15,
    paneType: 'split-h'
  }
]

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

function ArchedTopWindowMullions() {
  const lineClass =
    'absolute bg-[#1a1a1a] pointer-events-none z-[11] opacity-80'
  return (
    <>
      {/* Flat bar on the springing line (arch meets lower lights) */}
      <div
        className={`top-1/2 left-0 w-full h-[4px] md:h-[6px] -mt-[2px] md:-mt-[3px] ${lineClass}`}
      />
      {/* Lower half: vertical mullion from springing line to sill. */}
      <div
        className={`top-1/2 left-1/2 h-1/2 w-[4px] md:w-[6px] -ml-[2px] md:-ml-[3px] ${lineClass}`}
      />
      {/* Upper semicircle: three radials with fixed mullion width (matches the rest of the grid). */}
      <div className="pointer-events-none absolute left-0 top-0 z-[11] h-1/2 w-full opacity-80" aria-hidden>
        <div className="absolute bottom-0 left-1/2 h-full w-[4px] md:w-[6px] -translate-x-1/2 bg-[#1a1a1a]" />
        <div className="absolute bottom-0 left-1/2 h-full w-[4px] md:w-[6px] -translate-x-1/2 origin-bottom rotate-45 bg-[#1a1a1a]" />
        <div className="absolute bottom-0 left-1/2 h-full w-[4px] md:w-[6px] -translate-x-1/2 origin-bottom -rotate-45 bg-[#1a1a1a]" />
      </div>
    </>
  )
}

function ArchedTopWindowFrame() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M 0,100 L 0,50 A 50 50 0 0 1 100,50 L 100,100 Z"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth={12}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

type WindowsCollageProps = {
  /**
   * Split hero: “this is where” above `w10`; “Not just between moments.” under `w10`; `w1` under that line
   * (aligned with `w10`); “But after learning.” to the right of `w9`; “MEMSURF” / “FITS” under `w3` / `w8`.
   */
  workflowHeroCopy?: boolean
}

function paneBottomPct(pane: WindowData): number {
  return (
    Number.parseFloat(pane.top.replace('%', '')) +
    Number.parseFloat(pane.height.replace('%', ''))
  )
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

/** Horizontal gap between two panes as % of collage width (left edge of `b` minus right edge of `a`). */
function horizontalGapPercent(a: WindowData, b: WindowData): number {
  const aRight = percentValue(a.left) + percentValue(a.width)
  const bLeft = percentValue(b.left)
  return Math.max(0, bLeft - aRight)
}

/** Workflow hero: approx. height of “Not just between moments.” as % of collage below the w10 tagline block top. */
const WORKFLOW_FIRST_TAGLINE_HEIGHT_PCT = 4
const WORKFLOW_W1_GAP_BELOW_TAGLINE_PCT = 0.5
/** Shift `w1` right from the w10 column anchor (workflow hero). */
const WORKFLOW_W1_SHIFT_RIGHT_PCT = 5
/** Space between w9 right edge and “But after learning.” */
const WORKFLOW_AFTER_LEARNING_GAP_PCT = 1.25
/** Band above w4+w5 for “After reading.” */
const WORKFLOW_AFTER_READING_BLOCK_PCT = 5

export default function WindowsCollage({ workflowHeroCopy }: WindowsCollageProps = {}) {
  const archClipId = useId().replace(/:/g, '')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const videoRefs = useRef<Partial<Record<string, HTMLVideoElement | null>>>({})

  const getHoverId = (item: WindowData) => item.sharedSceneGroupId ?? item.id

  const w10Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w10') : undefined
  const w3Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w3') : undefined
  const w8Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w8') : undefined
  const w9Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w9') : undefined
  const w4Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w4') : undefined
  const w5Pane = workflowHeroCopy ? windowData.find((w) => w.id === 'w5') : undefined

  const afterReadingBedSpan =
    w4Pane != null && w5Pane != null
      ? combinedHorizontalSpan(w4Pane, w5Pane)
      : null
  const bedPanesTopPct =
    w4Pane != null && w5Pane != null
      ? Math.min(percentValue(w4Pane.top), percentValue(w5Pane.top))
      : 0
  const afterReadingTopPct =
    afterReadingBedSpan != null
      ? Math.max(0.5, bedPanesTopPct - WORKFLOW_AFTER_READING_BLOCK_PCT)
      : 0

  const w10TopPct = w10Pane ? Number.parseFloat(w10Pane.top.replace('%', '')) : 0
  const whereLineBlockPct = 7
  const whereLineTopPct =
    w10Pane != null ? Math.max(0.5, w10TopPct - whereLineBlockPct) : 0

  const w10TaglineBlockTopPct =
    w10Pane != null ? paneBottomPct(w10Pane) + 2.85 : 0
  const w1WorkflowTopPct =
    workflowHeroCopy && w10Pane != null
      ? w10TaglineBlockTopPct +
        WORKFLOW_FIRST_TAGLINE_HEIGHT_PCT +
        WORKFLOW_W1_GAP_BELOW_TAGLINE_PCT
      : null
  const w1WorkflowLeftPct =
    workflowHeroCopy && w10Pane != null
      ? percentValue(w10Pane.left) + WORKFLOW_W1_SHIFT_RIGHT_PCT
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
  }, [hoveredId])

  return (
    <div className="w-full bg-transparent py-20 relative overflow-hidden flex justify-center items-center">
      <div className="relative mx-auto h-[1150px] w-full max-w-7xl px-4 [container-type:inline-size] md:h-[1550px]">
        <svg
          className="pointer-events-none absolute h-0 w-0 overflow-hidden"
          aria-hidden
        >
          <defs>
            <clipPath id={archClipId} clipPathUnits="objectBoundingBox">
              {/* Rectangle + semicircle cap (diameter = width). sweep=1 picks upper arc in y-down coords. */}
              <path d="M 0,1 L 0,0.5 A 0.5 0.5 0 0 1 1,0.5 L 1,1 Z" />
            </clipPath>
          </defs>
        </svg>
        {workflowHeroCopy && w10Pane != null && (
          <div
            className="pointer-events-none absolute z-[25] flex min-w-0 flex-col items-end justify-end p-1 sm:p-2 md:p-3 [container-type:inline-size]"
            style={{
              top: `${whereLineTopPct}%`,
              left: w10Pane.left,
              width: w10Pane.width,
              height: `${whereLineBlockPct}%`,
            }}
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full min-w-0 max-w-full text-right font-bold leading-[1.05] text-white [font-size:clamp(0.8rem,8.25cqi,4rem)] [text-wrap:balance]"
            >
              this is where
            </motion.p>
          </div>
        )}
        {workflowHeroCopy && w10Pane != null && (
          <div
            className="pointer-events-none absolute z-[25] flex min-w-0 flex-col justify-start pt-2 pl-5 pr-2 sm:pl-6 sm:pr-3 md:pl-7 md:pr-3 [container-type:inline-size]"
            style={{
              top: `${w10TaglineBlockTopPct}%`,
              left: w10Pane.left,
              width: w10Pane.width,
            }}
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.06 }}
              className="w-full min-w-0 max-w-full text-left font-normal leading-snug text-gray-100 [font-family:var(--font-collage-tagline),cursive] [font-size:clamp(0.95rem,6.85cqi,2.15rem)] [text-wrap:balance]"
            >
              Not just between moments.
            </motion.p>
          </div>
        )}
        {workflowHeroCopy && afterReadingBedSpan != null && (
          <div
            className="pointer-events-none absolute z-[25] flex min-w-0 flex-col justify-end p-1 sm:p-2 md:p-3 [container-type:inline-size]"
            style={{
              top: `${afterReadingTopPct}%`,
              left: `${afterReadingBedSpan.leftPct}%`,
              width: `${afterReadingBedSpan.widthPct}%`,
              height: `${WORKFLOW_AFTER_READING_BLOCK_PCT}%`,
            }}
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
              className="w-full min-w-0 max-w-full text-center font-bold leading-tight text-white [font-size:clamp(0.85rem,6.5cqi,2rem)] [text-wrap:balance]"
            >
              After reading.
            </motion.p>
          </div>
        )}
        {workflowHeroCopy && w9Pane != null && (
          <div
            className="pointer-events-none absolute z-[25] flex min-w-0 flex-col items-start justify-center [container-type:inline-size]"
            style={{
              left: `${
                percentValue(w9Pane.left) +
                percentValue(w9Pane.width) +
                WORKFLOW_AFTER_LEARNING_GAP_PCT
              }%`,
              top: w9Pane.top,
              width: `${Math.max(
                0,
                100 -
                  percentValue(w9Pane.left) -
                  percentValue(w9Pane.width) -
                  WORKFLOW_AFTER_LEARNING_GAP_PCT -
                  1.5,
              )}%`,
              height: w9Pane.height,
            }}
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.14 }}
              className="w-full min-w-0 max-w-full text-left font-bold leading-[1.08] text-white [font-size:clamp(1rem,7.5cqi,2.4rem)] [text-wrap:balance]"
            >
              But after learning.
            </motion.p>
          </div>
        )}
        {/* MEMSURF/FITS: bottom edge just above w9; z below studying pane; items-end = shared bottom edge */}
        {workflowHeroCopy && w3Pane != null && w8Pane != null && (
          <div
            className="pointer-events-none absolute z-[17] flex w-full min-w-0 flex-row flex-nowrap items-baseline"
            style={{
              top:
                w9Pane != null
                  ? `${percentValue(w9Pane.top)}%`
                  : `${paneBottomPct(w3Pane)}%`,
              left: 0,
              transform:
                w9Pane != null
                  ? 'translateY(calc(-100% - 0.35rem))'
                  : undefined,
            }}
          >
            <div
              className="min-w-0 shrink-0"
              style={{ width: w3Pane.left }}
              aria-hidden
            />
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
              className="box-border min-w-0 shrink-0 pt-2 text-center font-bold leading-none tracking-tight text-white whitespace-nowrap pl-1 pr-3 sm:pl-2 sm:pr-5 md:pl-3 md:pr-7 [font-size:clamp(0.42rem,min(3.55cqi,4.35vw),3.35rem)]"
              style={{ width: w3Pane.width }}
            >
              MEMSURF
            </motion.p>
            <div
              className="min-w-0 shrink-0"
              style={{ width: `${horizontalGapPercent(w3Pane, w8Pane)}%` }}
              aria-hidden
            />
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.16 }}
              className="box-border min-w-0 shrink-0 pt-2 text-left font-bold leading-none tracking-tight text-white whitespace-nowrap px-1 sm:px-2 md:px-3 [font-size:clamp(0.52rem,min(8.75cqi,11.5vw),9.25rem)]"
              style={{ width: w8Pane.width }}
            >
              FITS
            </motion.p>
          </div>
        )}
        {windowData.map((item, index) => {
          const sharedSceneGroup = item.sharedSceneGroupId
            ? sharedSceneGroups[item.sharedSceneGroupId]
            : undefined
          const hoverId = getHoverId(item)
          const isHovered = hoveredId === hoverId
          const videoZoom = item.videoCropZoom ?? VIDEO_CROP_ZOOM
          const mediaW = item.videoMediaWidthPct
          const videoOp = videoCoverObjectPositionParts(item)
          const isArchTop = item.frameShape === 'arched-top'
          const archClipStyle = isArchTop
            ? { clipPath: `url(#${archClipId})` as const }
            : undefined
          const outerWindowStyle = isArchTop
            ? {
                transform: isHovered
                  ? `scale(${WINDOW_HOVER_SCALE})`
                  : 'scale(1)',
                transformOrigin: sharedSceneGroup
                  ? getSharedSceneTransformOrigin(item, sharedSceneGroup)
                  : 'center',
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
                boxShadow: isHovered
                  ? '0 14px 28px -8px rgba(0, 0, 0, 0.45)'
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
              }

          const w1WorkflowLayout =
            item.id === 'w1' &&
            workflowHeroCopy &&
            w10Pane != null &&
            w1WorkflowTopPct != null &&
            w1WorkflowLeftPct != null

          return (
            <div
              key={item.id}
              className="absolute p-1 sm:p-2 md:p-3"
              style={{
                top: w1WorkflowLayout ? `${w1WorkflowTopPct}%` : item.top,
                left: w1WorkflowLayout ? `${w1WorkflowLeftPct}%` : item.left,
                ...(item.wide169
                  ? {
                      height: item.height,
                      width: 'auto',
                      aspectRatio: '16 / 9',
                      maxWidth: item.width,
                    }
                  : item.square
                    ? {
                        height: item.height,
                        width: 'auto',
                        aspectRatio: '1',
                        maxWidth: item.width,
                      }
                    : {
                        width: w1WorkflowLayout ? w10Pane.width : item.width,
                        height: item.height,
                      }),
                zIndex: isHovered ? 999 : item.zIndex,
              }}
              onMouseEnter={() => setHoveredId(hoverId)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div 
                className={`w-full h-full relative transition-transform duration-500 ease-out origin-center group ${
                  isArchTop ? 'overflow-hidden bg-black' : 'bg-black'
                }`}
                style={outerWindowStyle}
              >
                {/* Window Frame / Container — arch clip lives on outer so bg/shadow match the curve (no square black ears). */}
                <div
                  className={`w-full h-full relative overflow-hidden border-2 border-white/10 ${isArchTop ? '' : 'rounded-sm'}`}
                >
                  {item.videoSrc ? (
                    <div className="absolute inset-0 bg-black">
                      <div className="relative h-full w-full overflow-hidden">
                        <video
                          ref={(el) => {
                            if (el) videoRefs.current[item.id] = el
                            else delete videoRefs.current[item.id]
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
                                if (el) videoRefs.current[item.id] = el
                                else delete videoRefs.current[item.id]
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
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      className="w-full h-full relative overflow-hidden"
                      animate={{
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
                        />
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Border and Panes */}
                  {isArchTop ? (
                    <ArchedTopWindowFrame />
                  ) : (
                    <div
                      className="absolute inset-0 border-[6px] border-[#1a1a1a] pointer-events-none z-10"
                      aria-hidden
                    />
                  )}
                  {isArchTop ? (
                    <ArchedTopWindowMullions />
                  ) : (
                    renderWindowPanes(item.paneType)
                  )}
                  
                  {/* Pane id for layout / discussion (e.g. move w4 vs w5) */}
                  <div className="pointer-events-none absolute bottom-0 left-0 z-20 w-full bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 md:p-3">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/95 drop-shadow-md md:text-xs">
                      {item.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
