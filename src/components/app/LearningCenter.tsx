'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { UserStructure, Space, Group, Set, QuickCapture } from '@/lib/types'
import { Folder, BookOpen, FileText, Target, ChevronRight, ArrowLeft } from 'lucide-react'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import CaptureDetailContent from './CaptureDetailContent'

type ViewType = 'spaces' | 'groups' | 'sets' | 'captures' | 'detail'

export default function LearningCenter() {
  const [structure, setStructure] = useState<Space[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [sets, setSets] = useState<Set[]>([])
  const [captures, setCaptures] = useState<QuickCapture[]>([])
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [selectedSet, setSelectedSet] = useState<Set | null>(null)
  const [selectedCapture, setSelectedCapture] = useState<QuickCapture | null>(null)
  const [currentView, setCurrentView] = useState<ViewType>('spaces')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadStructure()
  }, [])

  const loadStructure = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await apiClient.getUserStructure()
      console.log('Structure API response:', data)
      // Ensure data is an array
      const spacesArray = Array.isArray(data) ? data : []
      console.log('Parsed spaces array:', spacesArray)
      setStructure(spacesArray)
      setCurrentView('spaces')
      setSelectedSpace(null)
      setSelectedGroup(null)
      setSelectedSet(null)
      setSelectedCapture(null)
    } catch (err: any) {
      console.error('Failed to load structure:', err)
      setError(err.message || 'Failed to load structure')
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = (spaceId: number) => {
    const space = structure.find(s => s.id === spaceId)
    console.log('Loading groups for space:', space)
    if (space && space.groups) {
      const groupsArray = Array.isArray(space.groups) ? space.groups : []
      console.log('Groups found:', groupsArray)
      setGroups(groupsArray)
      setSelectedSpace(space)
      setCurrentView('groups')
      setSelectedGroup(null)
      setSelectedSet(null)
      setSelectedCapture(null)
    } else {
      console.warn('No groups found for space:', space)
      setError('No groups found in this space')
    }
  }

  const loadSets = (groupId: number) => {
    const group = groups.find(g => g.id === groupId)
    console.log('Loading sets for group:', group)
    if (group && group.sets) {
      const setsArray = Array.isArray(group.sets) ? group.sets : []
      console.log('Sets found:', setsArray)
      setSets(setsArray)
      setSelectedGroup(group)
      setCurrentView('sets')
      setSelectedSet(null)
      setSelectedCapture(null)
    } else {
      console.warn('No sets found for group:', group)
      setError('No sets found in this group')
    }
  }

  const loadCaptures = async (setId: number) => {
    try {
      setLoading(true)
      setError('')
      const data = await apiClient.getCapturesBySet(setId)
      console.log('Captures API response:', data)
      // Ensure data is an array
      const capturesArray = Array.isArray(data) ? data : []
      setCaptures(capturesArray)
      const set = sets.find(s => s.id === setId)
      setSelectedSet(set || null)
      setCurrentView('captures')
      setSelectedCapture(null)
    } catch (err: any) {
      console.error('Failed to load captures:', err)
      setError(err.message || 'Failed to load captures')
    } finally {
      setLoading(false)
    }
  }

  const loadCaptureDetail = async (captureId: number) => {
    try {
      setLoading(true)
      setError('')
      // Load both capture details and mainpoints/quizzes
      const [captureData, quizData] = await Promise.all([
        apiClient.getCaptureDetail(captureId).catch(() => null),
        apiClient.getCaptureMainPoints(captureId).catch(() => null),
      ])
      console.log('Capture detail API response:', captureData)
      console.log('Mainpoints and quizzes API response:', quizData)
      setSelectedCapture(captureData)
      // Store quiz data in selectedCapture for now, or create separate state
      if (captureData && quizData) {
        (captureData as any).quizData = quizData
      }
      setCurrentView('detail')
    } catch (err: any) {
      console.error('Failed to load capture details:', err)
      setError(err.message || 'Failed to load capture details')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    switch (currentView) {
      case 'groups':
        loadStructure()
        break
      case 'sets':
        if (selectedSpace) loadGroups(selectedSpace.id)
        break
      case 'captures':
        if (selectedGroup) loadSets(selectedGroup.id)
        break
      case 'detail':
        if (selectedSet) loadCaptures(selectedSet.id)
        break
    }
  }

  const spaces = structure

  if (loading && currentView === 'spaces' && spaces.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white pt-16">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white overflow-y-auto pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          {currentView !== 'spaces' && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {currentView === 'spaces' && 'My Spaces'}
              {currentView === 'groups' && selectedSpace && `Groups in ${selectedSpace.name}`}
              {currentView === 'sets' && selectedGroup && `Sets in ${selectedGroup.name}`}
              {currentView === 'captures' && selectedSet && `Captures in ${selectedSet.title}`}
              {currentView === 'detail' && selectedCapture && (selectedCapture.short_description || selectedCapture.summary || 'Capture Details')}
            </h1>
            <p className="text-gray-600">
              {currentView === 'spaces' && 'Browse your learning spaces'}
              {currentView === 'groups' && 'Select a group to view sets'}
              {currentView === 'sets' && 'Select a set to view captures'}
              {currentView === 'captures' && 'Select a capture to view details'}
              {currentView === 'detail' && 'Capture details and content'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        {currentView === 'spaces' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <div
                key={space.id}
                onClick={() => loadGroups(space.id)}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Folder className="w-10 h-10 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{space.name}</h3>
                    {space.user_facing_description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {space.user_facing_description}
                      </p>
                    )}
                    {space.groups && space.groups.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {space.groups.length} {space.groups.length === 1 ? 'group' : 'groups'}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            ))}
            {spaces.length === 0 && !loading && (
              <div className="col-span-full bg-white rounded-xl p-12 border border-gray-200 text-center">
                <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No spaces yet</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'groups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => loadSets(group.id)}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <BookOpen className="w-10 h-10 text-purple-600" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                    {group.user_facing_description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {group.user_facing_description}
                      </p>
                    )}
                    {group.sets && group.sets.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {group.sets.length} {group.sets.length === 1 ? 'set' : 'sets'}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            ))}
            {groups.length === 0 && !loading && (
              <div className="col-span-full bg-white rounded-xl p-12 border border-gray-200 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No groups in this space</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'sets' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sets.map((set) => (
              <div
                key={set.id}
                onClick={() => loadCaptures(set.id)}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <FileText className="w-10 h-10 text-green-600" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{set.title}</h3>
                    {set.user_facing_description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {set.user_facing_description}
                      </p>
                    )}
                    {set.quick_captures && set.quick_captures.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {set.quick_captures.length} {set.quick_captures.length === 1 ? 'capture' : 'captures'}
                      </p>
                    )}
                    {set.mastery_level !== undefined && (
                      <p className="text-xs text-gray-400 mt-1">
                        Mastery: {set.mastery_level.toFixed(0)}%
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            ))}
            {sets.length === 0 && !loading && (
              <div className="col-span-full bg-white rounded-xl p-12 border border-gray-200 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No sets in this group</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'captures' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {captures.map((capture) => (
              <div
                key={capture.id}
                onClick={() => loadCaptureDetail(capture.id)}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Target className="w-10 h-10 text-orange-600" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {capture.short_description || capture.summary || 'Untitled Capture'}
                    </h3>
                    {capture.summary && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {capture.summary}
                      </p>
                    )}
                    {!capture.summary && capture.content && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                        {capture.content.substring(0, 150)}...
                      </p>
                    )}
                    {capture.mastery_level !== undefined && (
                      <p className="text-xs text-gray-400 mt-1">
                        Mastery: {capture.mastery_level.toFixed(0)}%
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            ))}
            {captures.length === 0 && !loading && (
              <div className="col-span-full bg-white rounded-xl p-12 border border-gray-200 text-center">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No captures in this set</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'detail' && selectedCapture && (
          <CaptureDetailContent 
            capture={selectedCapture} 
            quizData={(selectedCapture as any).quizData}
          />
        )}

        {loading && currentView !== 'spaces' && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  )
}

