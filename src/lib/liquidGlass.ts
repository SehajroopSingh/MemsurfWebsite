import type { CSSProperties } from 'react'

/** Shared liquid-glass surface (SocialGlassButtons, waitlist form, etc.). */
export const liquidGlassSurfaceStyle: CSSProperties = {
  background: 'linear-gradient(145deg, rgba(0, 0, 0, 0.027), rgba(0, 0, 0, 0.027))',
  backdropFilter: 'blur(2.64px) contrast(1.18) brightness(1.03) saturate(1.12)',
  WebkitBackdropFilter: 'blur(2.64px) contrast(1.18) brightness(1.03) saturate(1.12)',
  boxShadow:
    '0 4px 8px rgba(0, 0, 0, 0.25), 0 -10px 25px inset rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 -1px 0 rgba(255, 255, 255, 0.08)',
}

export const liquidGlassHighlightStyle: CSSProperties = {
  background:
    'linear-gradient(180deg, rgba(255, 255, 255, 0) 62%, rgba(255, 255, 255, 0.06) 82%, rgba(255, 255, 255, 0.14) 100%)',
  mixBlendMode: 'screen',
}
