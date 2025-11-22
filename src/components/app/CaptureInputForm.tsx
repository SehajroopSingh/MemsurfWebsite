'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Set } from '@/lib/types'
import { FileText, Loader2, Send } from 'lucide-react'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function CaptureInputForm() {
  const [content, setContent] = useState('')
  const [context, setContext] = useState('')
  const [difficulty, setDifficulty] = useState('Medium')
  const [masteryTime, setMasteryTime] = useState('1 month')
  const [selectedSet, setSelectedSet] = useState<number | null>(null)
  const [sets, setSets] = useState<Set[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSets, setLoadingSets] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const data = await apiClient.getSets()
        setSets(data)
        if (data.length > 0) {
          setSelectedSet(data[0].id)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load sets')
      } finally {
        setLoadingSets(false)
      }
    }

    fetchSets()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      setError('Content is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await apiClient.createQuickCapture({
        content: content.trim(),
        context: context.trim() || undefined,
        difficulty,
        mastery_time: masteryTime,
        set: selectedSet || undefined,
      })
      
      router.push(`/captures/${response.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create capture')
    } finally {
      setLoading(false)
    }
  }

  if (loadingSets) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Capture</h1>
          <p className="text-gray-600">Add new content to learn and practice</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                placeholder="Paste or type the content you want to learn..."
              />
              <p className="mt-2 text-sm text-gray-500">
                {content.length} characters
              </p>
            </div>

            <div>
              <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
                Context (Optional)
              </label>
              <textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Add any additional context or notes..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Medium-Hard">Medium-Hard</option>
                  <option value="Hard">Hard</option>
                  <option value="Hardest">Hardest</option>
                </select>
              </div>

              <div>
                <label htmlFor="masteryTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Mastery Time
                </label>
                <select
                  id="masteryTime"
                  value={masteryTime}
                  onChange={(e) => setMasteryTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="1 year">1 year</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="set" className="block text-sm font-medium text-gray-700 mb-2">
                Set (Optional)
              </label>
              <select
                id="set"
                value={selectedSet || ''}
                onChange={(e) => setSelectedSet(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">No set (will use default)</option>
                {sets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Create Capture
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

