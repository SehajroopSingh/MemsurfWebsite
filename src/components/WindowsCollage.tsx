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
    top: 66,
    left: 71,
    width: 29,
    height: 20,
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

/** Pane ids skipped when rendering (still in `windowData` for layout math / restore later). */
const WINDOW_IDS_HIDDEN: ReadonlySet<string> = new Set([])

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
    /** Bottom was 108% (clipped); same height, shifted up so bottom = 100%. */
    top: '70%',
    left: '19%',
    width: '50%',
    /** Leaves notes band + `w6` strip (see workflow constants). */
    height: '12%',
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
    top: '66%',
    left: '71%',
    width: '14%',
    height: '20%',
    videoCropZoom: 1.12,
    videoObjectPosition: '32% 28%',
    zIndex: 13,
    paneType: 'single',
    sharedSceneGroupId: 'bedRoom'
  },
  {
    id: 'w5',
    imageUrl: sharedSceneGroups.bedRoom.imageUrl,
    top: '66%',
    left: '86%',
    width: '14%',
    height: '20%',
    videoCropZoom: 1.12,
    videoObjectPosition: '32% 28%',
    zIndex: 14,
    paneType: 'split-h',
    sharedSceneGroupId: 'bedRoom'
  },
  {
    id: 'w6',
    imageUrl: '/collage/w6-under-w2-desk.png',
    /** Under `w2` column, nudged right (see `WORKFLOW_W6_SHIFT_RIGHT_PCT`). */
    top: '85%',
    left: '31%',
    width: '38%',
    height: '15%',
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
    left: '48%',
    width: '47%',
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

function ArchedTopWindowMullions() {
  const lineClass =
    'absolute bg-[#1a1a1a] pointer-events-none z-[11] opacity-80'
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
          stroke="#1a1a1a"
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
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d={ARCH_FRAME_PATH_D}
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
   * Split hero: “this is where” above `w10`; “Not just between moments.” between `w1`/`w4` and `w9`/`w2`; “But” / “after” / “learning.” left of `w2`; “After taking notes…” in the gutter above `w6`; “After reading.” under `w4`/`w5`; footer: “If life…”, “MemSurf helps you remember it.”; “MEMSURF” / “FITS” under `w3` / `w8`.
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
/** Horizontal gap column between `w2` left edge and `w6` for “After taking notes…” (above `w6`). */
const WORKFLOW_W6_SHIFT_RIGHT_PCT = 12
/** Vertical band between bottom of `w2` and top of `w6` for that line. */
const WORKFLOW_W6_NOTES_BAND_PCT = 3
/** Gap between “But after learning…” column and the left edge of `w2`. */
const WORKFLOW_W2_LEFT_COPY_GAP_PCT = 1.25
/** Horizontal inset from `w1` right and `w4` left for “Not just between moments.” */
const WORKFLOW_BETWEEN_MOMENTS_H_GAP_PCT = 0.75
/** Extra shift right for that band (width shrinks toward `w4`). */
const WORKFLOW_BETWEEN_MOMENTS_SHIFT_RIGHT_PCT = 3.5
/** Additional nudge right (~1–2%) so copy sits slightly right of the w1–w4 gutter. */
const WORKFLOW_BETWEEN_MOMENTS_NUDGE_RIGHT_PCT = 1.5
/** Vertical gap below `w9` and above `w2` for that line. */
const WORKFLOW_BETWEEN_MOMENTS_V_GAP_PCT = 1
/** Band directly under w4+w5 for “After reading.” (use remaining collage height below bed row). */
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
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const videoRefs = useRef<Partial<Record<string, HTMLVideoElement | null>>>({})
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

  const getHoverId = (item: WindowData) => item.sharedSceneGroupId ?? item.id

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

  const w1DataPane = windowData.find((w) => w.id === 'w1')
  const w1WorkflowBottomPct =
    workflowHeroCopy &&
    w1WorkflowTopPct != null &&
    w1DataPane != null
      ? w1WorkflowTopPct + percentValue(w1DataPane.height)
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
  /** Bottom of `w2` → top of notes band → top of `w6` image. */
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
    w1DataPane != null
      ? w1WorkflowLeftPct + percentValue(w1DataPane.width)
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
  }, [hoveredId])

  return (
    <div className="w-full bg-transparent py-20 relative overflow-hidden flex justify-center items-center">
      <div className="mx-auto w-full max-w-7xl px-4 [container-type:inline-size]">
        <div className="relative h-[1420px] w-full md:h-[1920px]">
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
        {workflowHeroCopy &&
          betweenMomentsLeftPct != null &&
          betweenMomentsWidthPct != null &&
          betweenMomentsWidthPct > 0 &&
          betweenMomentsTopPct != null &&
          betweenMomentsHeightPct != null &&
          betweenMomentsHeightPct > 0 && (
            <div
              className="pointer-events-none absolute z-[26] flex min-w-0 flex-col items-center justify-center px-1 sm:px-2 [container-type:inline-size]"
              style={{
                left: `${betweenMomentsLeftPct}%`,
                width: `${betweenMomentsWidthPct}%`,
                top: `${betweenMomentsTopPct}%`,
                height: `${betweenMomentsHeightPct}%`,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: 0.06 }}
                className="flex w-full min-w-0 max-w-full flex-col items-center gap-1.5 text-center text-white sm:gap-2 [container-type:inline-size]"
                aria-label="Not just between moments."
              >
                <span className="block min-w-0 max-w-full font-bold leading-[0.98] [font-family:var(--font-collage-tagline),cursive] [font-size:clamp(2.65rem,21cqi,7.5rem)] [text-wrap:balance]">
                  Not just
                </span>
                <span className="block min-w-0 max-w-full font-bold leading-[0.98] [font-family:var(--font-collage-tagline),cursive] [font-size:clamp(2.65rem,21cqi,7.5rem)] [text-wrap:balance]">
                  between
                </span>
                <span className="block min-w-0 max-w-full font-bold leading-[0.98] [font-family:var(--font-collage-tagline),cursive] [font-size:clamp(2.65rem,21cqi,7.5rem)] [text-wrap:balance]">
                  moments.
                </span>
              </motion.div>
            </div>
          )}
        {workflowHeroCopy &&
          w2Pane != null &&
          w2WorkflowTopPct != null &&
          w2WorkflowHeightPct != null &&
          w2LeftButAfterColumnWidthPct != null &&
          w2LeftButAfterColumnWidthPct > 0 && (
            <div
              className="pointer-events-none absolute z-[25] flex min-w-0 flex-col items-center justify-start overflow-visible px-2 pt-1 sm:px-3 sm:pt-2 [container-type:inline-size]"
              style={{
                left: '0%',
                width: `${w2LeftButAfterColumnWidthPct}%`,
                top: `${w2WorkflowTopPct}%`,
                height: `${w2WorkflowHeightPct}%`,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: 0.05 }}
                className="-translate-y-6 flex w-full min-w-0 max-w-full flex-col items-center gap-1.5 text-center text-white sm:-translate-y-10 sm:gap-2 md:-translate-y-14 [container-type:inline-size]"
                aria-label="But after learning."
              >
                <span className="block w-full min-w-0 max-w-full text-center font-bold leading-[1.02] [font-size:clamp(1.55rem,14cqi,5.75rem)] [text-wrap:balance]">
                  But
                </span>
                <span className="block w-full min-w-0 max-w-full text-center font-bold leading-[1.02] [font-size:clamp(1.55rem,14cqi,5.75rem)] [text-wrap:balance]">
                  after
                </span>
                <span className="block w-full min-w-0 max-w-full text-center font-bold leading-[0.98] [font-size:clamp(1.85rem,17cqi,6.75rem)] [text-wrap:balance]">
                  learning.
                </span>
              </motion.div>
            </div>
          )}
        {workflowHeroCopy &&
          w2Pane != null &&
          w6NotesCopyTopPct != null && (
            <div
              className="pointer-events-none absolute z-[25] flex min-w-0 flex-col items-center justify-center overflow-visible px-1 sm:px-2 [container-type:inline-size]"
              style={{
                top: `${w6NotesCopyTopPct}%`,
                left: `${percentValue(w2Pane.left) + WORKFLOW_W6_SHIFT_RIGHT_PCT}%`,
                width: `${percentValue(w2Pane.width) - WORKFLOW_W6_SHIFT_RIGHT_PCT}%`,
                height: `${WORKFLOW_W6_NOTES_BAND_PCT}%`,
              }}
            >
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
                className="flex w-full items-center justify-center font-bold leading-none tracking-tight text-white whitespace-nowrap [font-size:clamp(1rem,min(6.5cqi,4.5vw),2.75rem)]"
              >
                After taking notes you&apos;ll never revisit.
              </motion.p>
            </div>
          )}
        {workflowHeroCopy && afterReadingBedSpan != null && (
          <div
            className="pointer-events-none absolute z-[25] flex min-w-0 flex-col items-center justify-center overflow-visible [container-type:inline-size]"
            style={{
              top: `${afterReadingUnderTopPct}%`,
              left: `${afterReadingBedSpan.leftPct}%`,
              width: `${afterReadingBedSpan.widthPct}%`,
              height: `${WORKFLOW_AFTER_READING_UNDER_BLOCK_PCT}%`,
            }}
          >
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className="w-full min-w-0 max-w-full text-center font-bold leading-[0.95] tracking-tight text-white [font-size:clamp(1.5rem,min(14cqi,11vw),5.75rem)] [text-wrap:balance]"
            >
              After reading.
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
        {visibleWindowData.map((item, index) => {
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

          return (
            <div
              key={item.id}
              className="absolute p-1 sm:p-2 md:p-3"
              style={{
                top: w1WorkflowLayout
                  ? `${w1WorkflowTopPct}%`
                  : w2WorkflowLayout
                    ? `${w2WorkflowTopPct}%`
                    : w6UnderW2Layout && w6ImageTopPct != null
                      ? `${w6ImageTopPct}%`
                      : item.top,
                left: w1WorkflowLayout
                  ? `${w1WorkflowLeftPct}%`
                  : w6UnderW2Layout
                    ? `${
                        percentValue(w2Pane.left) + WORKFLOW_W6_SHIFT_RIGHT_PCT
                      }%`
                    : item.left,
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
                        width: w1WorkflowLayout
                          ? w10Pane.width
                          : w6UnderW2Layout
                            ? `${
                                percentValue(w2Pane.width) -
                                WORKFLOW_W6_SHIFT_RIGHT_PCT
                              }%`
                            : item.width,
                        height: w2WorkflowLayout
                          ? `${w2WorkflowHeightPct}%`
                          : w6UnderW2Layout
                            ? `${WORKFLOW_W6_STRIP_PCT}%`
                            : item.height,
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
                      className="absolute inset-0 border-[6px] border-[#1a1a1a] pointer-events-none z-10"
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
        {workflowHeroCopy && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.06 }}
            className="flex w-full flex-col items-center gap-6 px-3 pt-48 text-center text-white sm:gap-7 sm:pt-64 md:gap-8 md:pt-80 [container-type:inline-size]"
            aria-label="If life gives you something worth keeping. MemSurf helps you remember it."
          >
            <motion.p
              initial={{
                opacity: 0,
                clipPath: 'inset(0 100% 0 0)',
                filter: 'blur(1.5px)',
              }}
              whileInView={{
                opacity: 1,
                clipPath: 'inset(0 0% 0 0)',
                filter: 'blur(0px)',
              }}
              viewport={{ once: true, amount: 0.75 }}
              transition={{
                duration: 2.35,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.22,
              }}
              className="w-full max-w-6xl overflow-hidden font-normal leading-snug text-gray-100 [font-family:var(--font-collage-tagline),cursive] [font-size:clamp(1.55rem,min(9cqi,6.25vw),4.5rem)] [text-wrap:balance] md:[font-size:clamp(1.35rem,min(8cqi,5.5vw),4.5rem)]"
            >
              If life gives you something worth keeping.
            </motion.p>
            <motion.p
              initial={{
                opacity: 0,
                y: 10,
                clipPath: 'inset(0 100% 0 0)',
                filter: 'blur(1px)',
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                clipPath: 'inset(0 0% 0 0)',
                filter: 'blur(0px)',
              }}
              viewport={{ once: true, amount: 0.75 }}
              transition={{
                duration: 1.65,
                ease: [0.16, 1, 0.3, 1],
                delay: 1.55,
              }}
              className="w-full max-w-5xl overflow-hidden pb-1 font-bold leading-[1.1] tracking-tight [font-size:clamp(1.95rem,min(10cqi,11vw),5.75rem)] md:pb-2 md:leading-[1.05] md:[font-size:clamp(1.75rem,min(9cqi,10vw),5.75rem)]"
            >
              MemSurf helps you remember it.
            </motion.p>
          </motion.div>
        )}
        {!workflowHeroCopy && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: 'easeOut', delay: 0.08 }}
            className="w-full px-1 pt-8 pb-1 text-center font-bold leading-[1.05] tracking-tight text-white [text-wrap:balance] [font-size:clamp(1.75rem,min(9cqi,10vw),5.75rem)] md:pt-10 md:pb-2"
          >
            MemSurf helps you remember it.
          </motion.p>
        )}
      </div>
    </div>
  )
}
