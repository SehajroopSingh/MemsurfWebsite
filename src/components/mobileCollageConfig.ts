/** Figma iPhone 16 panel reference (node 399:434). */
export const MOBILE_PANEL_DESIGN_WIDTH = 393
export const MOBILE_PANEL_DESIGN_HEIGHT = 852

export const MOBILE_COLLAGE_PANEL_GRADIENT =
  'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 43.75%, rgb(0, 0, 0) 67.788%, rgba(0, 0, 0, 0) 100%)'

export const MOBILE_COLLAGE_SLIDE_ORDER = [
  'intro',
  'w10',
  'w3',
  'w1',
  'w8',
  'w9',
  'bedRoom',
  'w2',
  'w6',
] as const

export type MobileCollageSlideKey = (typeof MOBILE_COLLAGE_SLIDE_ORDER)[number]

export type MobileFrameVariant =
  | 'intro-fits-grid'
  | 'arched-top'
  | 'grid-4'
  | 'grid-6'
  | 'split-v'
  | 'bed-combined'

export type MobileWindowSlideConfig = {
  kind: 'window'
  targetId: string
  frameVariant: MobileFrameVariant
  hoverLines: readonly string[]
}

export type MobileIntroSlideConfig = {
  kind: 'intro'
}

export type MobileCollageSlideConfig = MobileIntroSlideConfig | MobileWindowSlideConfig

export function mobilePanelX(px: number): string {
  return `${(px / MOBILE_PANEL_DESIGN_WIDTH) * 100}%`
}

export function mobilePanelY(px: number): string {
  return `${(px / MOBILE_PANEL_DESIGN_HEIGHT) * 100}%`
}

export function mobilePanelW(px: number): string {
  return `${(px / MOBILE_PANEL_DESIGN_WIDTH) * 100}%`
}

export function mobilePanelH(px: number): string {
  return `${(px / MOBILE_PANEL_DESIGN_HEIGHT) * 100}%`
}

/** Hero frame slot per variant (% of panel); centered horizontally unless left set. */
export const MOBILE_FRAME_SLOT: Record<
  MobileFrameVariant,
  { widthPct: number; heightPct: number; topPct: number; leftPct?: number }
> = {
  'intro-fits-grid': {
    widthPct: (350 / 393) * 100,
    heightPct: (187 / 852) * 100,
    topPct: (280 / 852) * 100,
    leftPct: (22 / 393) * 100,
  },
  'arched-top': {
    widthPct: (138.021 / 393) * 100,
    heightPct: (387 / 852) * 100,
    topPct: (310 / 852) * 100,
  },
  'grid-4': {
    widthPct: (290.755 / 393) * 100,
    heightPct: (137.2 / 852) * 100,
    topPct: (310 / 852) * 100,
  },
  'grid-6': {
    widthPct: (320 / 393) * 100,
    heightPct: (200 / 852) * 100,
    topPct: (300 / 852) * 100,
  },
  'split-v': {
    widthPct: (290 / 393) * 100,
    heightPct: (137 / 852) * 100,
    topPct: (310 / 852) * 100,
  },
  'bed-combined': {
    widthPct: (320 / 393) * 100,
    heightPct: (160 / 852) * 100,
    topPct: (310 / 852) * 100,
  },
}

export function mobileHoverFontSizeCssVar(): string {
  return 'clamp(0.875rem, 5cqi, 1.25rem)'
}
