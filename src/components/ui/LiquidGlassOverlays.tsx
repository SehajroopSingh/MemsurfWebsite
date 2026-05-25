import { liquidGlassHighlightStyle } from '@/lib/liquidGlass'

type LiquidGlassOverlaysProps = {
  roundedClassName?: string
  /** Tailwind classes for the sheen end position (parent-relative `left`). */
  sheenEndClassName?: string
}

export default function LiquidGlassOverlays({
  roundedClassName = 'rounded-full',
  sheenEndClassName =
    'group-hover:left-full group-focus-within:left-full group-focus-visible:left-full',
}: LiquidGlassOverlaysProps) {
  return (
    <>
      <span
        className={`pointer-events-none absolute inset-0 opacity-75 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 ${roundedClassName}`}
        style={liquidGlassHighlightStyle}
        aria-hidden
      />
      <span
        className={`pointer-events-none absolute inset-0 overflow-hidden ${roundedClassName}`}
        aria-hidden
      >
        <span
          className={`pointer-events-none absolute top-1/2 h-[160%] w-1/4 -left-1/4 -translate-y-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent blur-[3px] transition-[left] duration-700 ease-out ${sheenEndClassName}`}
        />
      </span>
    </>
  )
}
