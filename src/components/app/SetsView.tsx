'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Set, QuickCapture } from '@/lib/types'
import { FileText, Target, ChevronRight, ArrowLeft } from 'lucide-react'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function SetsView() {
  const [sets, setSets] = useState<Set[]>([])
  const [selectedSet, setSelectedSet] = useState<Set | null>(null)
  const [captures, setCaptures] = useState<QuickCapture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const setId = searchParams.get('setId')
  const groupId = searchParams.get('groupId')

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const data = await apiClient.getSets()
        const filtered = groupId
          ? data.filter((s: Set) => s.group === parseInt(groupId))
          : data
        setSets(filtered)
        
        if (setId) {
          const set = filtered.find((s: Set) => s.id === parseInt(setId))
          if (set) {
            setSelectedSet(set)
            const capturesData = await apiClient.getCapturesBySet(set.id)
            setCaptures(capturesData)
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load sets')
      } finally {
        setLoading(false)
      }
    }

    fetchSets()
  }, [setId, groupId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (selectedSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setSelectedSet(null)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Sets
          </button>
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{selectedSet.title}</h1>
            <p className="text-gray-600">{captures.length} captures</p>
          </div>
          <div className="space-y-4">
            {captures.length > 0 ? (
              captures.map((capture) => (
                <div
                  key={capture.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/captures/${capture.id}`)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Target className="w-8 h-8 text-orange-600" />
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {capture.short_description || `Capture #${capture.id}`}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {capture.content.substring(0, 100)}...
                          </p>
                          {capture.mastery_level !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">
                              Mastery: {Math.round(capture.mastery_level * 100)}%
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No captures in this set yet.</p>
                <a
                  href="/capture/new"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Create Capture
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sets</h1>
          <p className="text-gray-600">Select a set to view its captures</p>
        </div>
        <div className="space-y-4">
          {sets.length > 0 ? (
            sets.map((set) => (
              <div
                key={set.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedSet(set)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{set.title}</h3>
                        <p className="text-sm text-gray-600">
                          {set.quick_captures?.length || 0} captures
                          {set.mastery_level !== undefined && (
                            <span className="ml-2">
                              • Mastery: {Math.round(set.mastery_level * 100)}%
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No sets found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

