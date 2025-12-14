import * as amplitude from '@amplitude/analytics-browser'

// Initialize Amplitude
export function initAmplitude() {
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Amplitude API key is not set. Please add NEXT_PUBLIC_AMPLITUDE_API_KEY to your .env file')
    }
    return
  }

  amplitude.init(apiKey, {
    defaultTracking: {
      pageViews: true,
      sessions: true,
      formInteractions: true,
      fileDownloads: true,
    },
  })
}

// Check if user is internal (for adding to events)
function isInternalUser(): boolean {
  if (typeof window === 'undefined') return false
  // Check localStorage for cached value (set when ?internal=true is used)
  try {
    const stored = localStorage.getItem('amplitude_internal_user')
    return stored === 'true'
  } catch {
    return false
  }
}

// Track events
export function trackEvent(eventName: string, eventProperties?: Record<string, any>) {
  // Add is_internal to event properties if user is internal
  // This makes it visible in Live Events stream
  const enrichedProperties = {
    ...eventProperties,
    ...(isInternalUser() && { is_internal: true }),
  }
  amplitude.track(eventName, enrichedProperties)
}

// Set user properties (uses identify internally)
export function setUserProperties(properties: Record<string, any>) {
  const identifyObj = new amplitude.Identify()
  Object.entries(properties).forEach(([key, value]) => {
    identifyObj.set(key, value)
  })
  amplitude.identify(identifyObj)
}

// Identify user
export function identify(userId: string, userProperties?: Record<string, any>) {
  amplitude.setUserId(userId)
  const identifyObj = new amplitude.Identify()
  if (userProperties) {
    Object.entries(userProperties).forEach(([key, value]) => {
      identifyObj.set(key, value)
    })
  }
  amplitude.identify(identifyObj)
}

// Reset user (for logout)
export function reset() {
  amplitude.reset()
}

// Get the amplitude instance (for advanced usage)
export function getAmplitude() {
  return amplitude
}
