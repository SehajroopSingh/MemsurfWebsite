import { liquidGlassHighlightStyle } from '@/lib/liquidGlass'

type LiquidGlassOverlaysProps = {
  roundedClassName?: string
  sheenTranslateClassName?: string
}

export default function LiquidGlassOverlays({
  roundedClassName = 'rounded-full',
  sheenTranslateClassName = 'group-hover:translate-x-48 group-focus-within:translate-x-48',
}: LiquidGlassOverlaysProps) {
  return (
    <>
      <span
        className={`pointer-events-none absolute inset-0 opacity-75 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 ${roundedClassName}`}
        style={liquidGlassHighlightStyle}
        aria-hidden
      />
      <span
        className={`pointer-events-none absolute -left-12 top-0 h-full w-10 rotate-12 bg-white/25 blur-sm transition-transform duration-700 ${sheenTranslateClassName}`}
        aria-hidden
      />
    </>
  )
}
