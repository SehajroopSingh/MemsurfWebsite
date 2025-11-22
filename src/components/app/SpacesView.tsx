'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Space, Group } from '@/lib/types'
import { Folder, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function SpacesView() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const spaceId = searchParams.get('spaceId')

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const data = await apiClient.getSpaces()
        setSpaces(data)
        
        if (spaceId) {
          const space = data.find((s: Space) => s.id === parseInt(spaceId))
          if (space) setSelectedSpace(space)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load spaces')
      } finally {
        setLoading(false)
      }
    }

    fetchSpaces()
  }, [spaceId])

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

  if (selectedSpace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setSelectedSpace(null)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Spaces
          </button>
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{selectedSpace.name}</h1>
            <p className="text-gray-600">{selectedSpace.groups?.length || 0} groups</p>
          </div>
          <div className="space-y-4">
            {selectedSpace.groups && selectedSpace.groups.length > 0 ? (
              selectedSpace.groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/groups?groupId=${group.id}&spaceId=${selectedSpace.id}`)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <BookOpen className="w-8 h-8 text-purple-600" />
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                          <p className="text-sm text-gray-600">
                            {group.sets?.length || 0} sets
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
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No groups in this space yet.</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Spaces</h1>
          <p className="text-gray-600">Select a space to view its groups</p>
        </div>
        <div className="space-y-4">
          {spaces.length > 0 ? (
            spaces.map((space) => (
              <div
                key={space.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedSpace(space)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Folder className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{space.name}</h3>
                        <p className="text-sm text-gray-600">
                          {space.groups?.length || 0} groups
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
              <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No spaces yet.</p>
              <a
                href="/capture/new"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Create First Capture
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

