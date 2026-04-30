'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu } from 'lucide-react'

function smoothStep(a: number, b: number, t: number) {
  const clamped = Math.max(0, Math.min(1, (t - a) / (b - a)))
  return clamped * clamped * (3 - 2 * clamped)
}

function length(x: number, y: number) {
  return Math.sqrt(x * x + y * y)
}

function roundedRectSDF(x: number, y: number, width: number, height: number, radius: number) {
  const qx = Math.abs(x) - width + radius
  const qy = Math.abs(y) - height + radius
  return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - radius
}

function texture(x: number, y: number) {
  return { x, y }
}

type LiquidGlassNavigationProps = {}

export default function LiquidGlassNavigation({}: LiquidGlassNavigationProps) {
  const id = useId().replace(/:/g, '')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const feImageRef = useRef<SVGFEImageElement | null>(null)
  const feDisplacementMapRef = useRef<SVGFEDisplacementMapElement | null>(null)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const horizontalInset = 24
  const navHeight = Math.max(Math.min(Math.round(viewportHeight * 0.1), 88), 56)
  const glassHeight = Math.max(navHeight, 1)

  useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth)
      setViewportHeight(window.innerHeight)
    }

    updateViewportWidth()
    window.addEventListener('resize', updateViewportWidth)

    return () => {
      window.removeEventListener('resize', updateViewportWidth)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const feImage = feImageRef.current
    const feDisplacementMap = feDisplacementMapRef.current

    if (!canvas || !feImage || !feDisplacementMap) {
      return
    }

    if (viewportWidth <= 0) {
      return
    }

    const width = Math.max(viewportWidth - horizontalInset, 1)
    const height = glassHeight
    const canvasDPI = 1
    const w = width * canvasDPI
    const h = height * canvasDPI
    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    canvas.width = w
    canvas.height = h

    const data = new Uint8ClampedArray(w * h * 4)
    let maxScale = 0
    const rawValues: number[] = []

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % w
      const y = Math.floor(i / 4 / w)
      const pos = (() => {
        const ix = x / w - 0.5
        const iy = y / h - 0.5
        const distanceToEdge = roundedRectSDF(ix, iy, 0.8, 0.6, 0.6)
        const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15)
        const scaled = smoothStep(0, 1, displacement)
        // Slightly increase distortion in the lower band so the bottom edge reads as refractive.
        const bottomBandBoost = smoothStep(0.05, 0.45, iy + 0.5)
        const boost = 1 + bottomBandBoost * 0.24
        return texture(ix * scaled * boost + 0.5, iy * scaled * boost + 0.5)
      })()

      const dx = pos.x * w - x
      const dy = pos.y * h - y
      maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy))
      rawValues.push(dx, dy)
    }

    maxScale *= 0.5

    let index = 0
    for (let i = 0; i < data.length; i += 4) {
      const r = rawValues[index++] / maxScale + 0.5
      const g = rawValues[index++] / maxScale + 0.5
      data[i] = r * 255
      data[i + 1] = g * 255
      data[i + 2] = 0
      data[i + 3] = 255
    }

    context.putImageData(new ImageData(data, w, h), 0, 0)
    feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', canvas.toDataURL())
    feDisplacementMap.setAttribute('scale', (maxScale / canvasDPI).toString())
  }, [glassHeight, horizontalInset, viewportHeight, viewportWidth])

  return (
    <>
      <svg
        aria-hidden="true"
        focusable="false"
        width="0"
        height="0"
        style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
      >
        <defs>
          <filter
            id={`${id}_filter`}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
            x="0"
            y="0"
            width={Math.max(viewportWidth - horizontalInset, 1)}
            height={glassHeight}
          >
            <feImage
              ref={feImageRef}
              id={`${id}_map`}
              width={Math.max(viewportWidth - horizontalInset, 1)}
              height={glassHeight}
            />
            <feDisplacementMap
              ref={feDisplacementMapRef}
              in="SourceGraphic"
              in2={`${id}_map`}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <canvas ref={canvasRef} hidden aria-hidden="true" />
      <div
        aria-hidden="true"
        role="presentation"
        className="pointer-events-none fixed left-3 right-3 top-3 z-[52] rounded-full overflow-hidden"
        style={{
          height: `${navHeight}px`,
          background: 'linear-gradient(145deg, rgba(0, 0, 0, 0.027), rgba(0, 0, 0, 0.027))',
          backdropFilter: `url(#${id}_filter) blur(2.64px) contrast(1.18) brightness(1.03) saturate(1.12)`,
          WebkitBackdropFilter: `url(#${id}_filter) blur(2.64px) contrast(1.18) brightness(1.03) saturate(1.12)`,
          border: '1px solid transparent',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25), 0 -10px 25px inset rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 -1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0) 62%, rgba(255, 255, 255, 0.06) 82%, rgba(255, 255, 255, 0.14) 100%)',
            mixBlendMode: 'screen',
          }}
        />
        {/* Glow edge temporarily disabled. */}
        {/*
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0.14) 10%, rgba(255, 255, 255, 0.03) 28%, rgba(255, 255, 255, 0) 48%, rgba(255, 255, 255, 0.05) 70%, rgba(255, 255, 255, 0.18) 100%)',
            opacity: 0.7,
            mixBlendMode: 'screen',
          }}
        />
        */}
      </div>
      <div
        className="pointer-events-none fixed left-3 right-3 top-3 z-[52] flex items-center justify-center"
        style={{ height: `${navHeight}px` }}
      >
        <div className="pointer-events-auto h-full w-full">
          <div className="flex h-full items-center justify-between px-3 sm:px-5 lg:px-7">
            <div className="h-full flex-shrink-0">
              <Link
                href="/"
                className="inline-flex h-full items-center justify-center"
              >
                <div className="flex h-full items-center" style={{ filter: 'drop-shadow(0 0 12px rgba(139, 176, 235, 0.4))' }}>
                  <svg
                    viewBox="0 0 89 54"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-[58%] w-auto min-h-6 max-h-9"
                    role="img"
                    aria-label="MemSurf logo"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M65.7783 19.0665C66.1136 19.0437 66.5126 19.189 66.7285 19.5128L75.9229 33.3184L79.7061 38.9718L88.1113 51.6778C88.2596 51.9021 88.2225 52.3781 88.1416 52.5929C88.0669 52.789 87.7821 53.0929 87.4873 53.0929L75.6807 53.1231V53.1251C73.146 53.1313 70.976 51.9107 69.3496 50.0528C68.4156 48.9849 67.6425 47.9279 66.834 46.7354L58.3926 34.2852C57.2986 32.6723 57.5148 30.9267 58.5205 29.3927L64.9678 19.5626C65.1598 19.27 65.4961 19.0862 65.7783 19.0665ZM20.2598 2.94832C25.8355 -1.47421 33.7646 -0.955494 38.2754 4.73543C39.5145 6.29842 40.4469 7.97433 41.0811 9.88289C41.8398 12.1643 42.2654 14.474 42.5 16.88C42.5383 17.2702 42.3706 17.7124 42.1143 17.9376C41.7312 18.2747 41.1219 18.2288 40.877 17.7608C39.838 15.7744 38.2908 14.0585 36.2441 13.1358C34.1973 12.2131 31.8969 12.524 30.2383 14.0684C29.239 14.9994 28.5821 16.1058 28.085 17.4093L22.7666 31.3575L20.2246 38.0147H20.2266C18.5431 42.4227 16.3762 46.936 12.6543 49.9522C10.5329 51.672 8.03866 52.9401 5.28418 52.961L0.912109 52.9942C0.678576 52.9963 0.314674 52.842 0.195312 52.6915C0.0210905 52.4704 0.00311414 52.161 0 51.7999L5.27441 37.3243L9.5625 25.4903L14.5703 11.5997C15.82 8.13416 17.3256 5.27634 20.2598 2.94832ZM66.4395 0.119222C72.7905 -0.376907 77.7892 3.69738 79.8027 9.54403C80.6424 11.9831 81.0504 14.5061 81.2061 17.0821C81.2372 17.5897 80.957 17.9875 80.5781 18.1173C80.0634 18.2936 79.6948 18.0526 79.4385 17.5763C78.3601 15.5793 76.6681 13.9982 74.5674 13.1544C70.8394 11.6591 67.6959 14.1005 65.5205 16.8975C64.4058 18.3299 63.4106 19.7359 62.3955 21.2638L55.4219 31.7598L49.4121 41.0069C47.8532 43.4053 46.0797 45.561 44.1182 47.6222C42.7408 49.069 41.2233 50.2497 39.4951 51.2149L39.4961 51.2159C35.0435 53.7047 30.2516 53.6927 26.3418 50.2501C23.3931 47.6533 21.1711 43.2249 20.5576 39.4044C20.5171 39.1522 20.692 38.7437 20.8301 38.588C21.0118 38.3846 21.425 38.2862 21.7197 38.3858C23.428 38.9628 25.2139 39.0653 26.9336 38.505C30.1397 37.4608 32.7485 35.0283 34.8887 32.4854C36.6365 30.4096 38.1935 28.2931 39.7607 26.0616L46.3936 16.6163C47.8859 14.4908 49.3946 12.5021 51.0156 10.4825C52.5383 8.58517 54.0802 6.83251 55.8779 5.19051C58.7923 2.52837 62.4291 0.432718 66.4395 0.119222ZM60.2539 32.0079L70.2715 46.6055L71.5918 48.2159C72.8964 49.5351 74.5426 50.1126 76.4004 50.1085L83.6201 50.0919L80.2939 45.086L65.9033 23.4063L60.2539 32.0079ZM36.5576 7.08016C34.1351 3.86985 30.1677 2.40085 26.2246 3.31942C23.4577 3.96403 21.1218 5.65918 19.4893 7.97469C18.5282 9.33848 17.9021 10.7778 17.3281 12.3575L12.1113 26.7149L7.68457 38.9718L3.66309 50.0255C10.4552 50.3483 14.8807 44.0405 17.0469 38.3682L25.4883 16.2735C26.2563 14.2622 27.4508 12.5351 29.1113 11.1983C32.1483 8.82666 35.4002 9.11509 38.6074 11.1837C38.1103 9.67571 37.4854 8.31001 36.5576 7.08016ZM74.5166 6.03524C71.1631 2.66851 66.3337 2.32274 62.207 4.4825C60.1457 5.56089 58.3519 6.94447 56.7109 8.61239C54.3342 11.0286 52.2534 13.6091 50.2793 16.3751L40.9629 29.4288C38.0806 33.4673 35.4902 37.0975 31.2441 39.8272C29.0677 41.1962 26.754 41.9796 24.0586 41.9288C25.5065 45.4276 27.8029 48.7293 31.666 49.7745C36.319 50.7968 40.7407 47.0237 43.5576 43.7335H43.5557C45.0482 41.9898 46.3806 40.2167 47.6406 38.2862L51.6924 32.0802C55.1497 26.7857 58.5551 21.545 62.2148 16.3917C63.8174 14.1342 65.5385 12.2057 67.9277 10.7921C71.2418 8.95391 74.6664 9.38642 77.6494 11.7384C77.1221 9.52654 76.0558 7.57967 74.5166 6.03524Z"
                      fill="url(#paint0_linear_116_165)"
                      fillOpacity="0.87"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_116_165"
                        x1="44.1117"
                        y1="51.014"
                        x2="44.1117"
                        y2="4.2555"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#6991CC" />
                        <stop offset="0.548077" stopColor="#E6B3FF" />
                        <stop offset="1" stopColor="#66C4B1" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
              <div className="relative group">
                <button className="flex items-center gap-1 text-app-textMuted hover:text-app-text transition-colors py-2 text-sm font-medium">
                  Product
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-app-surfaceElevated rounded-lg shadow-xl border border-app-border overflow-hidden py-1">
                    <Link
                      href="/#how-it-works"
                      className="block px-4 py-2 text-sm text-app-textMuted hover:bg-app-border hover:text-app-text"
                    >
                      How it works
                    </Link>
                  </div>
                </div>
              </div>
              <Link href="/team" className="text-app-textMuted hover:text-app-text transition-colors py-2 text-sm font-medium">
                Meet the Team
              </Link>
              <Link href="/blog" className="text-app-textMuted hover:text-app-text transition-colors py-2 text-sm font-medium">
                Blog
              </Link>
            </div>

            <div className="md:hidden">
              <button
                className="text-app-textMuted transition-colors hover:text-app-text"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>

          {isOpen ? (
            <div className="md:hidden mt-3 rounded-3xl border border-white/15 bg-app-surface/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(2,8,24,0.35)] px-4 pt-2 pb-4 space-y-2">
              <div className="px-3 pt-2 pb-1 text-xs font-semibold text-app-textMuted/80 uppercase tracking-wider">Product</div>
              <Link href="/#how-it-works" className="block px-3 py-2 text-app-textMuted hover:bg-app-border rounded-md pl-6">
                How it works
              </Link>
              <Link href="/team" className="block px-3 py-2 text-app-textMuted hover:bg-app-border rounded-md">
                Meet the Team
              </Link>
              <Link href="/blog" className="block px-3 py-2 text-app-textMuted hover:bg-app-border rounded-md">
                Blog
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}