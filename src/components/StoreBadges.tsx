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
    <div className="w-full sm:w-auto flex flex-row gap-3 sm:gap-4 sm:gap-6">
      <a
        href="/coming-soon"
        onClick={() => handleClick('app_store')}
        className={`${linkClassName} flex-1 sm:flex-none sm:w-auto`}
        aria-label="Download on the App Store"
      >
        <img
          src="/Download_on_App_Store/Black_lockup/SVG/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
          alt="Download on the App Store"
          className="w-full h-[90px] sm:h-[50px] md:h-[60px] sm:w-auto object-contain"
        />
      </a>
      <a
        href="/coming-soon"
        onClick={() => handleClick('google_play')}
        className={`${linkClassName} flex-1 sm:flex-none sm:w-auto`}
        aria-label="Get it on Google Play"
      >
        <img
          src="/Get_it_on_Google_Play/GetItOnGooglePlay_Badge_Web_color_English.svg"
          alt="Get it on Google Play"
          className="w-full h-[90px] sm:h-[50px] md:h-[60px] sm:w-auto object-contain"
        />
      </a>
    </div>
  )
}
