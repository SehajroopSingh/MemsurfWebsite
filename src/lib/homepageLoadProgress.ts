/** Brand gradient used on collage footer / loading bar */
export const MEMSURF_LOADING_GRADIENT =
  'linear-gradient(90deg, #E6B3FF 3.91%, #84AAE1 51.8%, #96EEDC 100%)'

const LOGO_WEIGHT = 10
const PHONE_WEIGHT = 35
const COLLAGE_WEIGHT = 55

/** Cap while assets or minimum splash time are still pending */
export const LOAD_PROGRESS_CAP_BEFORE_DONE = 92

export type HomepageLoadProgressInput = {
  logoReady: boolean
  phoneReady: boolean
  collageLoaded: number
  collageTotal: number
  /** 0–1 elapsed fraction of minimum splash duration */
  timeFraction: number
  allCriticalReady: boolean
  minimumSplashElapsed: boolean
}

export function computeHomepageLoadProgress({
  logoReady,
  phoneReady,
  collageLoaded,
  collageTotal,
  timeFraction,
  allCriticalReady,
  minimumSplashElapsed,
}: HomepageLoadProgressInput): number {
  let progress = 0

  if (logoReady) progress += LOGO_WEIGHT
  if (phoneReady) progress += PHONE_WEIGHT

  if (collageTotal > 0) {
    progress += COLLAGE_WEIGHT * Math.min(1, collageLoaded / collageTotal)
  }

  // Gentle creep so the bar never looks stuck on slow networks
  const timeCreep = Math.min(12, timeFraction * 12)
  progress = Math.max(progress, timeCreep)

  const canFinish = allCriticalReady && minimumSplashElapsed
  if (!canFinish) {
    return Math.min(LOAD_PROGRESS_CAP_BEFORE_DONE, progress)
  }

  return 100
}
