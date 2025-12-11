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

// Track events
export function trackEvent(eventName: string, eventProperties?: Record<string, any>) {
  amplitude.track(eventName, eventProperties)
}

// Set user properties
export function setUserProperties(properties: Record<string, any>) {
  amplitude.setUserProperties(properties)
}

// Identify user
export function identify(userId: string, userProperties?: Record<string, any>) {
  const identifyObj = amplitude.Identify()
  if (userProperties) {
    Object.entries(userProperties).forEach(([key, value]) => {
      identifyObj.set(key, value)
    })
  }
  amplitude.setUserId(userId)
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
