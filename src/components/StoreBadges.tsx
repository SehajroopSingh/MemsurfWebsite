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
    <div className="w-full sm:w-auto flex flex-col gap-3 items-center">
      <div className="w-full sm:w-auto flex flex-row gap-3 sm:gap-4 sm:gap-6 justify-center items-center">
        <a
          href="/coming-soon"
          onClick={() => handleClick('app_store')}
          className={`${linkClassName} flex-1 sm:flex-none sm:w-auto`}
          aria-label="Download on the App Store"
        >
          <img
            src="/Download_on_App_Store/Black_lockup/SVG/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
            alt="Download on the App Store"
            className="w-full h-[70px] sm:h-[50px] md:h-[60px] sm:w-auto object-contain invert"
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
            className="w-full h-[70px] sm:h-[50px] md:h-[60px] sm:w-auto object-contain"
          />
        </a>
      </div>

      <div className="text-xs sm:text-sm text-app-textMuted/90 flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
        <a href="/privacy-policy" className="hover:text-app-lavenderHi transition-colors">
          Privacy Policy
        </a>
        <span aria-hidden="true">•</span>
        <a href="/terms-of-service" className="hover:text-app-lavenderHi transition-colors">
          Terms of Service
        </a>
        <span aria-hidden="true">•</span>
        <a
          href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-app-lavenderHi transition-colors"
        >
          Terms of Use (EULA)
        </a>
      </div>
    </div>
  )
}
