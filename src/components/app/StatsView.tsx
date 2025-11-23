'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { GamificationProfileResponse, CalendarResponse, CalendarDayData, CalendarSummary } from '@/lib/types'
import { Zap, Gem, Flame, Calendar, TrendingUp, Award } from 'lucide-react'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function StatsView() {
  const [profile, setProfile] = useState<GamificationProfileResponse | null>(null)
  const [calendarData, setCalendarData] = useState<CalendarDayData[]>([])
  const [summary, setSummary] = useState<CalendarSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [profileData, calendarResponse] = await Promise.all([
        apiClient.getGamificationProfile(),
        apiClient.getCalendarData(),
      ])
      
      console.log('Gamification profile:', profileData)
      console.log('Calendar data:', calendarResponse)
      
      setProfile(profileData)
      if (calendarResponse.success) {
        setCalendarData(calendarResponse.calendar_data)
        setSummary(calendarResponse.summary)
      }
    } catch (err: any) {
      console.error('Failed to load stats:', err)
      setError(err.message || 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white pb-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white overflow-y-auto pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Stats</h1>
          <p className="text-gray-600">Track your learning progress and achievements</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Profile Stats */}
        {profile && profile.success && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-blue-500" />
                <span className="text-sm text-gray-600">XP</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{profile.profile.xp}</p>
              <p className="text-xs text-gray-500 mt-1">Level {profile.profile.level}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <Gem className="w-6 h-6 text-purple-500" />
                <span className="text-sm text-gray-600">Gems</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{profile.profile.coins}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <Flame className="w-6 h-6 text-orange-500" />
                <span className="text-sm text-gray-600">Streak</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{profile.profile.current_streak}</p>
              <p className="text-xs text-gray-500 mt-1">Best: {profile.profile.longest_streak}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6 text-green-500" />
                <span className="text-sm text-gray-600">Days Active</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{profile.profile.total_days_active}</p>
            </div>
          </div>
        )}

        {/* Calendar Summary */}
        {summary && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Activity Summary
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{summary.current_streak}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Longest Streak</p>
                <p className="text-2xl font-bold text-gray-900">{summary.longest_streak}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Days</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_days_active}</p>
              </div>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {calendarData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Activity Calendar
            </h2>
            <div className="grid grid-cols-7 gap-2">
              {calendarData.slice(0, 35).map((day, idx) => (
                <div
                  key={idx}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                    day.streak_active
                      ? 'bg-green-500 text-white'
                      : day.xp && day.xp > 0
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  title={`${day.date}: ${day.xp || 0} XP`}
                >
                  {day.xp ? day.xp : ''}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {profile && profile.recent_achievements && profile.recent_achievements.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Recent Achievements
            </h2>
            <div className="space-y-2">
              {profile.recent_achievements.map((achievement: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-semibold text-gray-900">{achievement.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(achievement.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {profile && profile.badges && profile.badges.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Badges
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.badges.map((badge: any, idx: number) => (
                <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg">
                  <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900 text-sm">{badge.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


