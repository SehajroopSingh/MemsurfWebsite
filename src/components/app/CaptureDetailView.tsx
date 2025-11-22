'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { QuickCapture, MainPoint, SubPoint, Quiz } from '@/lib/types'
import { ArrowLeft, FileText, BookOpen, Target, CheckCircle2 } from 'lucide-react'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function CaptureDetailView({ captureId }: { captureId: number }) {
  const [capture, setCapture] = useState<QuickCapture | null>(null)
  const [mainPoints, setMainPoints] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [captureData, mainPointsData] = await Promise.all([
          apiClient.getCaptureDetail(captureId),
          apiClient.getCaptureMainPoints(captureId).catch(() => null),
        ])
        setCapture(captureData)
        setMainPoints(mainPointsData)
      } catch (err: any) {
        setError(err.message || 'Failed to load capture')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [captureId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !capture) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Capture not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {capture.short_description || `Capture #${capture.id}`}
          </h1>
          {capture.summary && (
            <p className="text-lg text-gray-600 mb-6">{capture.summary}</p>
          )}
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{capture.content}</p>
          </div>
          {capture.context && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Context</h3>
              <p className="text-blue-800">{capture.context}</p>
            </div>
          )}
        </div>

        {mainPoints && mainPoints.main_points && mainPoints.main_points.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Main Points
            </h2>
            {mainPoints.main_points.map((mp: MainPoint & { sub_points?: SubPoint[]; quizzes?: Quiz[] }) => (
              <div key={mp.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{mp.title}</h3>
                
                {mp.sub_points && mp.sub_points.length > 0 && (
                  <div className="ml-4 space-y-4 mb-4">
                    {mp.sub_points.map((sp: SubPoint & { details?: any[]; quizzes?: Quiz[] }) => (
                      <div key={sp.id} className="border-l-2 border-purple-200 pl-4">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">{sp.title}</h4>
                        {sp.details && sp.details.length > 0 && (
                          <div className="ml-4 space-y-2">
                            {sp.details.map((detail: any) => (
                              <p key={detail.id} className="text-gray-600 text-sm">
                                {detail.content}
                              </p>
                            ))}
                          </div>
                        )}
                        {sp.quizzes && sp.quizzes.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-2">Quizzes: {sp.quizzes.length}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {mp.quizzes && mp.quizzes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Quizzes: {mp.quizzes.length}
                    </p>
                    <div className="space-y-2">
                      {mp.quizzes.slice(0, 3).map((quiz: Quiz) => (
                        <div key={quiz.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            {quiz.question_text || quiz.statement || 'Quiz question'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Type: {quiz.quiz_type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {(!mainPoints || !mainPoints.main_points || mainPoints.main_points.length === 0) && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">This capture is still being processed. Main points will appear here once ready.</p>
          </div>
        )}
      </div>
    </div>
  )
}

