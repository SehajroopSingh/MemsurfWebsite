'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, ArrowRight, Heart, Zap, Flame, Gem, Target, CalendarDays, TrendingUp } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { DashboardData } from '@/lib/types'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import DailyPracticeView from './DailyPracticeView'

export default function Dashboard() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPractice, setShowPractice] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await apiClient.getDashboard()
      console.log('Dashboard data:', data)
      setDashboardData(data)
    } catch (err: any) {
      console.error('Failed to load dashboard:', err)
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (showPractice) {
    return <DailyPracticeView onBack={() => setShowPractice(false)} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white overflow-y-auto pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to your learning journey!</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {dashboardData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-sm text-gray-600">Hearts</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.hearts}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600">XP</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.xp}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-600">Streak</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.streak}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gem className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-600">Gems</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.gems}</p>
            </div>
          </div>
        )}

        {/* Quick Practice Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Daily Practice</h2>
                <p className="text-blue-100 mb-4">
                  {dashboardData?.quizzes_due_count 
                    ? `You have ${dashboardData.quizzes_due_count} quiz${dashboardData.quizzes_due_count === 1 ? '' : 'zes'} due today`
                    : 'Start practicing to improve your mastery'}
                </p>
              </div>
              <button
                onClick={() => setShowPractice(true)}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Target className="w-5 h-5" />
                Practice Now
              </button>
            </div>
          </div>
        </div>

        {/* Quick Practice Choices */}
        {dashboardData?.quick_practice_choices && dashboardData.quick_practice_choices.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Quick Practice
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.quick_practice_choices.map((choice) => (
                <div
                  key={choice.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    // Navigate to practice with this choice
                    setShowPractice(true)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">{choice.type}</p>
                      <p className="text-sm text-gray-500">ID: {choice.ref_id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pinned Items */}
        {dashboardData?.pinned_items && dashboardData.pinned_items.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pinned Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.pinned_items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push('/learning-center')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Captures */}
        {dashboardData?.recent_quick_captures && dashboardData.recent_quick_captures.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Captures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.recent_quick_captures.map((capture) => (
                <div
                  key={capture.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push('/learning-center')}
                >
                  <p className="font-semibold text-gray-900 mb-2">
                    {capture.short_description || 'Untitled Capture'}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {capture.content.substring(0, 100)}...
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(capture.created_at).toLocaleDateString()}
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

