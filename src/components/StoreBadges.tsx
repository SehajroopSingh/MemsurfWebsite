'use client'

import { useAmplitude } from '@/hooks/useAmplitude'

type StoreBadgesProps = {
  location: string
  linkClassName?: string
  imageClassName?: string
}

export default function StoreBadges({
  location,
  linkClassName = 'group relative inline-flex items-center justify-center transition-transform active:scale-95 hover:scale-105',
  imageClassName = 'h-[50px] md:h-[60px] w-auto',
}: StoreBadgesProps) {
  const { track } = useAmplitude()

  const handleClick = (store: 'app_store' | 'google_play') => {
    track('app_store_badge_clicked', {
      store,
      location,
    })
  }

  return (
    <>
      <a
        href="/coming-soon"
        onClick={() => handleClick('app_store')}
        className={linkClassName}
        aria-label="Download on the App Store"
      >
        <img
          src="/Download_on_App_Store/Black_lockup/SVG/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
          alt="Download on the App Store"
          className={imageClassName}
        />
      </a>
      <a
        href="/coming-soon"
        onClick={() => handleClick('google_play')}
        className={linkClassName}
        aria-label="Get it on Google Play"
      >
        <img
          src="/Get_it_on_Google_Play/GetItOnGooglePlay_Badge_Web_color_English.svg"
          alt="Get it on Google Play"
          className={imageClassName}
        />
      </a>
    </>
  )
}
