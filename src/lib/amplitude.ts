import * as amplitude from '@amplitude/analytics-browser'
import { createInstance } from '@amplitude/analytics-browser'

let secondaryInstance: ReturnType<typeof createInstance> | null = null

// Initialize Amplitude
export function initAmplitude() {
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY
  const secondaryKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY_SECONDARY

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Primary Amplitude API key is not set. Please add NEXT_PUBLIC_AMPLITUDE_API_KEY to your .env file')
    }
  } else {
    amplitude.init(apiKey, {
      defaultTracking: {
        pageViews: true,
        sessions: true,
        formInteractions: true,
        fileDownloads: true,
      },
    })
  }

  if (secondaryKey) {
    secondaryInstance = createInstance()
    secondaryInstance.init(secondaryKey, {
      defaultTracking: {
        pageViews: true,
        sessions: true,
        formInteractions: true,
        fileDownloads: true,
      },
    })
  }
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
  
  if (secondaryInstance) {
    secondaryInstance.track(eventName, enrichedProperties)
  }
}

// Set user properties (uses identify internally)
export function setUserProperties(properties: Record<string, any>) {
  const identifyObj = new amplitude.Identify()
  Object.entries(properties).forEach(([key, value]) => {
    identifyObj.set(key, value)
  })
  amplitude.identify(identifyObj)

  if (secondaryInstance) {
    const secondaryIdentifyObj = new amplitude.Identify()
    Object.entries(properties).forEach(([key, value]) => {
      secondaryIdentifyObj.set(key, value)
    })
    secondaryInstance.identify(secondaryIdentifyObj)
  }
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

  if (secondaryInstance) {
    secondaryInstance.setUserId(userId)
    const secondaryIdentifyObj = new amplitude.Identify()
    if (userProperties) {
      Object.entries(userProperties).forEach(([key, value]) => {
        secondaryIdentifyObj.set(key, value)
      })
    }
    secondaryInstance.identify(secondaryIdentifyObj)
  }
}

// Reset user (for logout)
export function reset() {
  amplitude.reset()
  if (secondaryInstance) {
    secondaryInstance.reset()
  }
}

// Flush all events on both instances
export async function flushEvents() {
  const promises = []
  
  try {
    promises.push(amplitude.flush().promise)
  } catch (err) {
    console.error('Failed to flush primary Amplitude instance:', err)
  }

  if (secondaryInstance) {
    try {
      promises.push(secondaryInstance.flush().promise)
    } catch (err) {
      console.error('Failed to flush secondary Amplitude instance:', err)
    }
  }

  await Promise.all(promises)
}

// Get the amplitude instance (for advanced usage)
export function getAmplitude() {
  return amplitude
}
