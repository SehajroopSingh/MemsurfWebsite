import type { MobileCollageSlideConfig, MobileFrameVariant } from './mobileCollageConfig'
import { MOBILE_COLLAGE_SLIDE_ORDER } from './mobileCollageConfig'

export type MobilePaneMedia = {
  imageUrl: string
  videoSrc?: string
  videoObjectPosition?: string
  videoObjectPositionNarrow?: string
  videoCropZoom?: number
  videoMediaWidthPct?: number
  frameShape?: 'arched-top'
}

const W1_HOVER_LINES = [
  'Evening.',
  'Podcast on while cooking.',
  'A funny joke lands.',
  'You tell yourself: this one I’ll remember.',
  'You smile.',
  'Tomorrow’s date will laugh at this.',
] as const

const W2_HOVER_LINES = [
  'The meeting starts.',
  'You’re prepared and aiming for a promotion.',
  'One key comment would’ve made you shine in front of your boss- but when it mattered most, your mind went blank',
] as const

const W3_HOVER_COPY =
  'You open ChatGPT. You ask one question, then another. You’re learning fast. Connecting ideas. Following threads. Somewhere in there, you find it. A great answer. A clear explanation. Exactly what you needed. You think: I’ll come back to this. Later, you can’t find it.'

function splitHoverCopyLines(copy: string): string[] {
  return copy
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

const W3_HOVER_LINES = splitHoverCopyLines(W3_HOVER_COPY)

const W8_HOVER_COPY =
  'You wake up. Shower running. A health thought crosses your mind. You’ll remember it later.'

const W8_HOVER_LINES = splitHoverCopyLines(W8_HOVER_COPY)

const W9_HOVER_LINES = [
  'After a day of classes, you are too tired to sit down and study.',
  'Notes are scattered across apps, screenshots, and tabs.',
  'You don’t know where to start so you don’t and keep scrolling.',
] as const

const W10_HOVER_LINES = [
  'Supermarket aisle.',
  'Cart half-full.',
  'You know there was a nutrition tip you wanted to follow.',
  'You forgot where you saved it.',
  'Now would be a good time to remember it.',
] as const

const BEDROOM_HOVER_LINES = [
  'Night. In bed.',
  'Your mind reaches for things it knows are there but can’t pull back.',
] as const

const W6_HOVER_LINES = [
  'After a day of classes,',
  'you are too tired to sit down and study.',
  'Notes are scattered across apps,',
  'screenshots, and tabs.',
  'You don’t know where to start',
  'so you don’t and keep scrolling.',
] as const

const MOBILE_HOVER_LINES_BY_TARGET: Record<string, readonly string[]> = {
  w1: W1_HOVER_LINES,
  w2: W2_HOVER_LINES,
  w3: W3_HOVER_LINES,
  w8: W8_HOVER_LINES,
  w9: W9_HOVER_LINES,
  w10: W10_HOVER_LINES,
  bedRoom: BEDROOM_HOVER_LINES,
  w6: W6_HOVER_LINES,
}

const MOBILE_FRAME_VARIANT_BY_TARGET: Record<string, MobileFrameVariant> = {
  w1: 'grid-4',
  w2: 'split-v',
  w3: 'arched-top',
  w8: 'grid-4',
  w9: 'grid-4',
  w10: 'grid-6',
  bedRoom: 'bed-combined',
  w6: 'grid-4',
}

const MOBILE_MEDIA_BY_TARGET: Record<string, MobilePaneMedia> = {
  w1: {
    imageUrl: '/videos/veo3.1-with-reference-images-kitchen-good-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-kitchen-good.mp4',
  },
  w2: {
    imageUrl: '/videos/veo3.1-with-reference-images-office-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-office.mp4',
  },
  w3: {
    imageUrl: '/videos/veo3.1-with-reference-images-coffee3-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-coffee3.mp4',
    videoObjectPosition: '58% center',
    videoObjectPositionNarrow: '58% center',
    videoCropZoom: 1,
    frameShape: 'arched-top',
  },
  w8: {
    imageUrl: '/videos/veo3.1-with-reference-images-shower-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-shower.mp4',
    videoObjectPosition: 'center 28%',
    videoCropZoom: 1,
    videoMediaWidthPct: 115,
  },
  w9: {
    imageUrl: '/videos/veo3.1-with-reference-images-studying-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-studying.mp4',
  },
  w10: {
    imageUrl: '/videos/veo3.1_with_reference_images_extended_shopping-poster.jpg',
    videoSrc: '/videos/veo3.1_with_reference_images_extended_shopping.mp4',
  },
  bedRoom: {
    imageUrl: '/videos/veo3.1-with-reference-images-bed-poster.jpg',
    videoSrc: '/videos/veo3.1-with-reference-images-bed.mp4',
    videoObjectPosition: '32% 38%',
    videoCropZoom: 1.12,
  },
  w6: {
    imageUrl: '/collage/w6-under-w2-desk.png',
  },
}

export function buildMobileCollageSlides(): MobileCollageSlideConfig[] {
  return MOBILE_COLLAGE_SLIDE_ORDER.map((key) => {
    if (key === 'intro') return { kind: 'intro' as const }
    return {
      kind: 'window' as const,
      targetId: key,
      frameVariant: MOBILE_FRAME_VARIANT_BY_TARGET[key],
      hoverLines: MOBILE_HOVER_LINES_BY_TARGET[key],
    }
  })
}

export function getMobilePaneMedia(targetId: string): MobilePaneMedia | undefined {
  return MOBILE_MEDIA_BY_TARGET[targetId]
}

export function getMobileReadyAssetKeys(): string[] {
  const keys: string[] = []
  for (const slide of buildMobileCollageSlides()) {
    if (slide.kind !== 'window') continue
    keys.push(`image:${slide.targetId}`)
    const media = MOBILE_MEDIA_BY_TARGET[slide.targetId]
    if (media?.videoSrc) keys.push(`video:${slide.targetId}`)
  }
  return keys
}
