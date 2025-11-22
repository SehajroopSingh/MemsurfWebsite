'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Group, Set } from '@/lib/types'
import { BookOpen, FileText, ChevronRight, ArrowLeft } from 'lucide-react'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function GroupsView() {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const groupId = searchParams.get('groupId')
  const spaceId = searchParams.get('spaceId')

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await apiClient.getGroups()
        const filtered = spaceId
          ? data.filter((g: Group) => g.space === parseInt(spaceId))
          : data
        setGroups(filtered)
        
        if (groupId) {
          const group = filtered.find((g: Group) => g.id === parseInt(groupId))
          if (group) setSelectedGroup(group)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load groups')
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [groupId, spaceId])

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

  if (selectedGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setSelectedGroup(null)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Groups
          </button>
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{selectedGroup.name}</h1>
            <p className="text-gray-600">{selectedGroup.sets?.length || 0} sets</p>
          </div>
          <div className="space-y-4">
            {selectedGroup.sets && selectedGroup.sets.length > 0 ? (
              selectedGroup.sets.map((set) => (
                <div
                  key={set.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/sets?setId=${set.id}&groupId=${selectedGroup.id}`)}
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
                <p className="text-gray-600">No sets in this group yet.</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Groups</h1>
          <p className="text-gray-600">Select a group to view its sets</p>
        </div>
        <div className="space-y-4">
          {groups.length > 0 ? (
            groups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedGroup(group)}
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
              <p className="text-gray-600">No groups found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

