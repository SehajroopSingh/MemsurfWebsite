# Amplitude Event Tracking Guide

## Quick Start

### Method 1: Using the Hook (Recommended for Client Components)

```tsx
'use client'
import { useAmplitude } from '@/hooks/useAmplitude'

export function MyComponent() {
  const { track } = useAmplitude()
  
  const handleClick = () => {
    track('button_clicked', {
      button_name: 'signup',
      location: 'hero'
    })
  }
  
  return <button onClick={handleClick}>Click Me</button>
}
```

### Method 2: Using the Utility Directly

```tsx
import { trackEvent } from '@/lib/amplitude'

// In any function
trackEvent('page_viewed', { page: 'homepage' })
```

## Common Event Examples

### Button Clicks
```tsx
const { track } = useAmplitude()

<button onClick={() => track('button_clicked', { 
  button_name: 'signup',
  button_location: 'header'
})}>
  Sign Up
</button>
```

### Link Clicks
```tsx
<a 
  href="/about"
  onClick={() => track('link_clicked', {
    link_text: 'About',
    link_url: '/about',
    location: 'navigation'
  })}
>
  About
</a>
```

### Form Submissions
```tsx
const handleSubmit = (e) => {
  e.preventDefault()
  track('form_submitted', {
    form_name: 'contact',
    form_location: 'contact_page'
  })
  // ... rest of form logic
}
```

### Video Interactions
```tsx
const handleVideoPlay = () => {
  track('video_played', {
    video_name: 'hero_demo',
    video_location: 'hero_section'
  })
}

const handleVideoPause = () => {
  track('video_paused', {
    video_name: 'hero_demo'
  })
}
```

### Page Views (Automatic)
Page views are tracked automatically, but you can add custom page view events:

```tsx
'use client'
import { useEffect } from 'react'
import { useAmplitude } from '@/hooks/useAmplitude'

export function MyPage() {
  const { track } = useAmplitude()
  
  useEffect(() => {
    track('page_viewed', {
      page_name: 'about',
      page_path: '/about'
    })
  }, [track])
  
  return <div>...</div>
}
```

### Scroll Tracking
```tsx
const { track } = useAmplitude()

useEffect(() => {
  const handleScroll = () => {
    const scrollPercent = (window.scrollY / document.documentElement.scrollHeight) * 100
    if (scrollPercent > 50 && !hasTracked50) {
      track('scroll_milestone', { 
        milestone: 50,
        page: 'homepage'
      })
      setHasTracked50(true)
    }
  }
  
  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

### User Identification
```tsx
import { identify } from '@/lib/amplitude'

// When user logs in
identify('user123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium'
})
```

### Setting User Properties
```tsx
import { setUserProperties } from '@/lib/amplitude'

setUserProperties({
  subscription_status: 'active',
  user_type: 'premium'
})
```

### Reset User (on Logout)
```tsx
import { reset } from '@/lib/amplitude'

const handleLogout = () => {
  reset()
  // ... rest of logout logic
}
```

## Best Practices

1. **Use descriptive event names**: Use snake_case (e.g., `button_clicked`, `form_submitted`)
2. **Include context**: Always add properties like `location`, `page`, `section` to help filter events
3. **Be consistent**: Use the same event names and property names across your app
4. **Don't track sensitive data**: Never track passwords, credit cards, or other PII
5. **Group related events**: Use prefixes like `button_`, `form_`, `video_` for organization

## Event Naming Convention

- Use snake_case: `button_clicked`, `video_played`
- Be specific: `hero_cta_clicked` instead of `clicked`
- Include action: `form_submitted`, `link_clicked`, `video_paused`

## Common Properties

- `location`: Where the event occurred (e.g., 'hero', 'footer', 'navigation')
- `page`: Current page (e.g., 'homepage', 'about')
- `section`: Section of the page (e.g., 'features', 'testimonials')
- `element_name`: Name of the element (e.g., 'signup_button', 'video_player')

## What we're tracking now

| Goal | Event | Where it fires | Key properties |
| --- | --- | --- | --- |
| Acquisition | `app_store_badge_clicked` | Store badges in `Hero` + homepage app store section (`StoreBadges`) | `store` (`app_store`/`google_play`), `location` |
| Acquisition | `waitlist_submitted` | Homepage waitlist form + Coming Soon form | `source` (`homepage_waitlist`/`coming_soon_page`), `status` (`success`/`invalid_email`), `is_valid_email`, `email_length` (no emails captured) |
| Product interest | `navigation_link_clicked` | Header + footer links | `label`, `href`, `location` (`header`/`footer`), `menu_variant` (`desktop`/`mobile`/`logo`/`product` section) |
| Product interest | `feature_viewed` | Each card in `Features` | `feature_name`, `location` |
| Engagement | `video_started`, `video_loop_started`, `video_error` | `GreenScreenVideo` in Hero | `video_name`, `location`, `autoplay`, `error_message`, `error_code` |
| Engagement | `cta_button_clicked` | CTA component buttons | `button_type`, `button_text`, `location` |
| UX quality | `mobile_menu_toggled` | Header mobile menu | `state` (`opened`/`closed`) |
| Brand | `social_link_clicked` | Footer social icons | `platform`, `href`, `location` |
| Engagement | `scroll_milestone_reached` | Homepage scroll tracking | `page`, `scroll_percent` (10/25/50/75/90/100), `scroll_position`, `total_page_height`, `viewport_height`, `time_on_page` |
| Engagement | `scroll_depth` | Homepage scroll tracking (every 5% after 10%) | `page`, `scroll_percent`, `scroll_position`, `time_on_page` |
| Engagement | `section_viewed` | Homepage section visibility | `page`, `section_id`, `section_name`, `scroll_percent`, `scroll_position`, `time_on_page`, `viewport_height` |
| Engagement | `time_at_scroll_position` | Time spent at scroll positions | `page`, `scroll_position`, `scroll_percent`, `time_spent_seconds` |
| Engagement | `page_scroll_tracked` | Initial scroll tracking setup | `page`, `initial_scroll_position`, `total_page_height`, `viewport_height` |
| Engagement | `page_scroll_session_end` | When user leaves page | `page`, `final_scroll_percent`, `max_scroll_percent`, `total_time_seconds`, `sections_viewed`, `milestones_reached` |

## Instrumentation map

- Navigation: `src/components/Navigation.tsx` (`navigation_link_clicked`, `mobile_menu_toggled`)
- Hero: `src/components/Hero.tsx` + `src/components/GreenScreenVideo.tsx` (`app_store_badge_clicked`, `video_*`)
- Homepage app store + waitlist: `src/components/StoreBadges.tsx`, `src/components/WaitlistForm.tsx`
- Coming Soon waitlist: `src/app/coming-soon/page.tsx`
- Footer links/social: `src/components/Footer.tsx`
- Feature impressions: `src/components/Features.tsx`
- CTA buttons: `src/components/CTA.tsx`
- Scroll tracking: `src/components/ScrollTracker.tsx` (all `scroll_*` and `section_viewed` events) - Used on homepage

