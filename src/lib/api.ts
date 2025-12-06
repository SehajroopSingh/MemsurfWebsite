// API service client with JWT token handling

import { User, Space, Group, Set, QuickCapture, ScheduledQuiz, QuizSession, QuickCaptureQuizResponse, SubPointWithQuizzes, DetailWithQuizzes, DashboardData, GamificationProfileResponse, CalendarResponse, Friend, FriendRequest, Activity, LeaderboardEntry, FriendStreak, FriendStreakInvitation } from './types'

// Use Next.js API proxy to avoid CORS issues
// The proxy route is at /api/proxy/[...path]
const USE_PROXY = process.env.NEXT_PUBLIC_USE_API_PROXY !== 'false' // Default to true
const PROXY_BASE_URL = '/api/proxy'
const DIRECT_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.memsurf.com/api'
const API_BASE_URL = USE_PROXY ? PROXY_BASE_URL : DIRECT_API_BASE_URL

class ApiClient {
  private baseURL: string
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Load tokens from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token')
      this.refreshToken = localStorage.getItem('refresh_token')
    }
  }

  setTokens(access: string, refresh: string) {
    this.accessToken = access
    this.refreshToken = refresh
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
    }
  }

  clearTokens() {
    this.accessToken = null
    this.refreshToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false
    }

    try {
      const response = await fetch(`${this.baseURL}/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: this.refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        this.setTokens(data.access, this.refreshToken)
        return true
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }

    this.clearTokens()
    return false
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/${endpoint.replace(/^\//, '')}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    // Add auth token if available
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    let response: Response
    try {
      response = await fetch(url, {
        ...options,
        headers,
      })
    } catch (error: any) {
      // Network error (CORS, connection refused, etc.)
      console.error('Network error:', error)
      const errorMsg = error.message || 'Failed to connect to server'
      
      // Check if it's a CORS error
      if (errorMsg.includes('CORS') || errorMsg.includes('Load failed') || errorMsg.includes('Failed to fetch')) {
        throw new Error(`CORS Error: The API at ${this.baseURL} is blocking requests from this origin. The production API needs to allow requests from http://localhost:3000 in its CORS settings.`)
      }
      
      throw new Error(`Network error: ${errorMsg}. Make sure the backend is running on ${this.baseURL}`)
    }

    // If 401, try to refresh token and retry once
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken()
      if (refreshed) {
        // Retry with new token
        headers['Authorization'] = `Bearer ${this.accessToken}`
        try {
          response = await fetch(url, {
            ...options,
            headers,
          })
        } catch (error: any) {
          throw new Error(`Network error: ${error.message || 'Failed to connect to server'}`)
        }
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.detail || errorData.message || errorMessage
      } catch {
        // If response is not JSON, try to get text
        try {
          const text = await response.text()
          if (text) errorMessage = text
        } catch {
          // Ignore
        }
      }
      throw new Error(errorMessage)
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }
    
    return {} as T
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const data = await this.request<{ access: string; refresh: string }>(
      'token/',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    )
    this.setTokens(data.access, data.refresh)
    return data
  }

  async register(username: string, email: string, password: string) {
    return this.request('accounts/register/', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    })
  }

  async getUserProfile() {
    return this.request<User>('accounts/user/profile/')
  }

  // Organizer endpoints
  async getUserStructure() {
    return this.request<Space[]>('organizer/structure/')
  }

  async getSpaces() {
    return this.request<Space[]>('organizer/spaces/')
  }

  async getGroups() {
    return this.request<Group[]>('organizer/groups/')
  }

  async getSets() {
    return this.request<Set[]>('organizer/sets/')
  }

  async getCapturesBySet(setId: number) {
    return this.request<QuickCapture[]>(`organizer/sets/${setId}/quickcaptures/`)
  }

  async getCaptureDetail(captureId: number) {
    return this.request<QuickCapture>(`organizer/quickcaptures/${captureId}/`)
  }

  async getCaptureMainPoints(captureId: number) {
    return this.request<QuickCaptureQuizResponse>(`organizer/quickcaptures/${captureId}/mainpoints_and_quizzes/`)
  }

  async getSubPointsAndQuizzes(mainPointId: number) {
    return this.request<{ main_point_id: number; subpoints: SubPointWithQuizzes[] }>(`organizer/mainpoints/${mainPointId}/subpoints_and_quizzes/`)
  }

  async getDetailsAndQuizzes(subPointId: number) {
    return this.request<{ subpoint_id: number; details: DetailWithQuizzes[] }>(`organizer/subpoints/${subPointId}/details_and_quizzes/`)
  }

  // Quiz/Scheduler endpoints
  async getScheduledQuizzes() {
    return this.request<ScheduledQuiz[]>('scheduler/scheduled-quizzes/')
  }

  async getDailyPracticeFeed() {
    return this.request<{ 
      items: any[]
      meta: any
      session_id: string | null
      starting_hearts: number
    }>('scheduler/daily-practice/')
  }

  async submitQuizSession(data: {
    session_id: string
    results: Array<{
      quiz_id: number
      was_correct: boolean
      score: number
      response_data?: any
    }>
    session_start_time?: string
    session_end_time?: string
    total_session_time_seconds?: number
  }) {
    return this.request<{ 
      message: string
      performance_percentage: number
      session_stats: any
      xp_delta?: number
      coins_delta?: number
      streak_updated?: boolean
      current_streak?: number
    }>('scheduler/submit-session/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Quick Capture endpoints
  async createQuickCapture(data: {
    content: string
    context?: string
    difficulty?: string
    mastery_time?: string
    depth_of_learning?: string
    set?: number
  }) {
    return this.request<{ id: number }>('quick-capture/quick_capture/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Dashboard endpoints
  async getDashboard() {
    return this.request<DashboardData>('user-interface/dashboard/')
  }

  // Gamification endpoints
  async getGamificationProfile() {
    return this.request<GamificationProfileResponse>('gamification/profile/')
  }

  async getCalendarData() {
    return this.request<CalendarResponse>('gamification/calendar-data/')
  }

  async getAchievements() {
    return this.request<{ success: boolean; achievements: any[]; badges: any[] }>('gamification/achievements/')
  }

  async getChallenges() {
    return this.request<{ success: boolean; challenges: any[] }>('gamification/challenges/')
  }

  // Social endpoints
  async getFriends() {
    return this.request<Friend[]>('social/friends/')
  }

  async getActivityFeed() {
    return this.request<Activity[]>('social/social/feed/')
  }

  async getIncomingRequests() {
    return this.request<FriendRequest[]>('social/friend-requests/incoming/')
  }

  async getFriendsLeaderboard() {
    return this.request<LeaderboardEntry[]>('social/leaderboards/friends/week/')
  }

  async getLeagueLeaderboard() {
    return this.request<{ leaderboard: LeaderboardEntry[]; my_rank?: number; current_tier?: number }>('social/leaderboards/league/current/')
  }

  async getFriendStreaks() {
    return this.request<FriendStreak[]>('social/friend-streaks/')
  }

  async getStreakInvitations() {
    return this.request<FriendStreakInvitation[]>('social/friend-streaks/invitations/incoming/')
  }

  async sendFriendRequest(toUsername: string) {
    return this.request<{ success: boolean }>('social/friend-requests/send/', {
      method: 'POST',
      body: JSON.stringify({ to_username: toUsername }),
    })
  }

  async respondToFriendRequest(requestId: number, action: 'accept' | 'reject') {
    return this.request<{ success: boolean }>('social/friend-requests/respond/', {
      method: 'POST',
      body: JSON.stringify({ request_id: requestId, action }),
    })
  }

  async inviteToStreak(friendId: number) {
    return this.request<{ success: boolean }>('social/friend-streaks/invite/', {
      method: 'POST',
      body: JSON.stringify({ friend_id: friendId }),
    })
  }

  async respondToStreakInvitation(invitationId: number, accept: boolean) {
    return this.request<{ success: boolean }>('social/friend-streaks/respond/', {
      method: 'POST',
      body: JSON.stringify({ invitation_id: invitationId, action: accept ? 'accept' : 'reject' }),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

