'use client'

import { useState } from 'react'
import { QuickCapture, QuickCaptureQuizResponse, MainPointWithQuizzes, SubPointWithQuizzes, DetailWithQuizzes, Quiz } from '@/lib/types'
import { BookOpen, ChevronDown, ChevronRight, Target, CheckCircle2, Clock, DollarSign, AlertCircle } from 'lucide-react'
import { apiClient } from '@/lib/api'

interface CaptureDetailContentProps {
  capture: QuickCapture
  quizData?: QuickCaptureQuizResponse | null
}

export default function CaptureDetailContent({ capture, quizData }: CaptureDetailContentProps) {
  const [expandedMainPoints, setExpandedMainPoints] = useState<Set<number>>(new Set())
  const [expandedSubPoints, setExpandedSubPoints] = useState<Set<number>>(new Set())
  const [expandedDetails, setExpandedDetails] = useState<Set<number>>(new Set())
  const [loadedSubPoints, setLoadedSubPoints] = useState<Record<number, SubPointWithQuizzes[]>>({})
  const [loadedDetails, setLoadedDetails] = useState<Record<number, DetailWithQuizzes[]>>({})
  const [loadingSubPoints, setLoadingSubPoints] = useState<Set<number>>(new Set())
  const [loadingDetails, setLoadingDetails] = useState<Set<number>>(new Set())

  const toggleMainPoint = (mpId: number) => {
    const newExpanded = new Set(expandedMainPoints)
    if (newExpanded.has(mpId)) {
      newExpanded.delete(mpId)
    } else {
      newExpanded.add(mpId)
      // Load subpoints if not already loaded and has_subpoints is true
      const mainPoint = quizData?.main_points.find(mp => mp.id === mpId)
      if (mainPoint && mainPoint.has_subpoints && !loadedSubPoints[mpId]) {
        loadSubPoints(mpId)
      }
    }
    setExpandedMainPoints(newExpanded)
  }

  const toggleSubPoint = (spId: number, mpId: number) => {
    const newExpanded = new Set(expandedSubPoints)
    if (newExpanded.has(spId)) {
      newExpanded.delete(spId)
    } else {
      newExpanded.add(spId)
      // Load details if not already loaded
      const subPoint = loadedSubPoints[mpId]?.find(sp => sp.id === spId) || 
                      quizData?.main_points.find(mp => mp.id === mpId)?.subpoints.find(sp => sp.id === spId)
      if (subPoint && subPoint.has_details && !loadedDetails[spId]) {
        loadDetails(spId)
      }
    }
    setExpandedSubPoints(newExpanded)
  }

  const toggleDetail = (detailId: number) => {
    const newExpanded = new Set(expandedDetails)
    if (newExpanded.has(detailId)) {
      newExpanded.delete(detailId)
    } else {
      newExpanded.add(detailId)
    }
    setExpandedDetails(newExpanded)
  }

  const loadSubPoints = async (mainPointId: number) => {
    if (loadingSubPoints.has(mainPointId)) return
    
    setLoadingSubPoints(prev => new Set(prev).add(mainPointId))
    try {
      const response = await apiClient.getSubPointsAndQuizzes(mainPointId)
      const subpoints = response.subpoints || []
      setLoadedSubPoints(prev => ({ ...prev, [mainPointId]: subpoints }))
    } catch (err) {
      console.error('Failed to load subpoints:', err)
    } finally {
      setLoadingSubPoints(prev => {
        const newSet = new Set(prev)
        newSet.delete(mainPointId)
        return newSet
      })
    }
  }

  const loadDetails = async (subPointId: number) => {
    if (loadingDetails.has(subPointId)) return
    
    setLoadingDetails(prev => new Set(prev).add(subPointId))
    try {
      const response = await apiClient.getDetailsAndQuizzes(subPointId)
      const details = response.details || []
      setLoadedDetails(prev => ({ ...prev, [subPointId]: details }))
    } catch (err) {
      console.error('Failed to load details:', err)
    } finally {
      setLoadingDetails(prev => {
        const newSet = new Set(prev)
        newSet.delete(subPointId)
        return newSet
      })
    }
  }

  const renderQuiz = (quiz: Quiz) => {
    return (
      <div key={quiz.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-2">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {quiz.quiz_type}
          </span>
          {quiz.state?.mastery_level !== undefined && (
            <span className="text-xs text-gray-500">
              Mastery: {quiz.state.mastery_level.toFixed(0)}%
            </span>
          )}
        </div>
        {quiz.question_text && (
          <p className="text-sm font-medium text-gray-900 mb-1">{quiz.question_text}</p>
        )}
        {quiz.statement && (
          <p className="text-sm font-medium text-gray-900 mb-1">{quiz.statement}</p>
        )}
        {quiz.choices && quiz.choices.length > 0 && (
          <div className="mt-2 space-y-1">
            {quiz.choices.map((choice, idx) => (
              <div
                key={idx}
                className={`text-xs p-2 rounded ${
                  idx === quiz.correctAnswerIndex
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-white border border-gray-200 text-gray-700'
                }`}
              >
                {idx === quiz.correctAnswerIndex && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                {choice}
              </div>
            ))}
          </div>
        )}
        {quiz.explanation && (
          <p className="text-xs text-gray-600 mt-2 italic">{quiz.explanation}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Capture Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {capture.short_description || capture.summary || 'Untitled Capture'}
        </h2>
        
        {capture.summary && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Summary</h3>
            <p className="text-blue-800">{capture.summary}</p>
          </div>
        )}

        {capture.content && (
          <div className="prose max-w-none mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Content</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{capture.content}</p>
          </div>
        )}

        {capture.context && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Context</h3>
            <p className="text-gray-600">{capture.context}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          {quizData?.total_quiz_count !== undefined && (
            <div>
              <p className="text-sm text-gray-500">Total Quizzes</p>
              <p className="text-lg font-semibold text-gray-900">{quizData.total_quiz_count}</p>
            </div>
          )}
          {quizData?.overdue_quiz_count !== undefined && quizData.overdue_quiz_count > 0 && (
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-lg font-semibold text-red-600">{quizData.overdue_quiz_count}</p>
            </div>
          )}
          {quizData?.total_cost !== undefined && (
            <div>
              <p className="text-sm text-gray-500">Total Cost</p>
              <p className="text-lg font-semibold text-gray-900">${quizData.total_cost.toFixed(4)}</p>
            </div>
          )}
          {quizData?.total_processing_time_seconds !== undefined && (
            <div>
              <p className="text-sm text-gray-500">Processing Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {quizData.total_processing_time_seconds.toFixed(1)}s
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Direct Quizzes */}
      {quizData && quizData.direct_quizzes && quizData.direct_quizzes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Direct Quizzes ({quizData.direct_quizzes.length})
          </h3>
          <div className="space-y-2">
            {quizData.direct_quizzes.map(renderQuiz)}
          </div>
        </div>
      )}

      {/* Main Points */}
      {quizData && quizData.main_points && quizData.main_points.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Main Points ({quizData.main_points.length})
          </h3>
          
          {quizData.main_points.map((mp: MainPointWithQuizzes) => {
            const isExpanded = expandedMainPoints.has(mp.id)
            const subpoints = loadedSubPoints[mp.id] || mp.subpoints || []
            const isLoading = loadingSubPoints.has(mp.id)

            return (
              <div key={mp.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Main Point Header */}
                <button
                  onClick={() => toggleMainPoint(mp.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{mp.text}</h4>
                      {mp.quizzes && mp.quizzes.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {mp.quizzes.length} quiz{mp.quizzes.length !== 1 ? 'zes' : ''}
                        </span>
                      )}
                    </div>
                    {mp.context && (
                      <p className="text-sm text-gray-600 mb-2">{mp.context}</p>
                    )}
                    {mp.supporting_text && (
                      <p className="text-sm text-gray-500 italic">{mp.supporting_text}</p>
                    )}
                    {mp.state?.mastery_level !== undefined && (
                      <p className="text-xs text-gray-500 mt-2">
                        Mastery: {mp.state.mastery_level.toFixed(0)}%
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Main Point Content (when expanded) */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    {/* Main Point Quizzes */}
                    {mp.quizzes && mp.quizzes.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Quizzes</h5>
                        <div className="space-y-2">
                          {mp.quizzes.map(renderQuiz)}
                        </div>
                      </div>
                    )}

                    {/* Subpoints */}
                    {(mp.has_subpoints || subpoints.length > 0) && (
                      <div className="mt-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">
                          Subpoints {isLoading && <span className="text-xs text-gray-400">(Loading...)</span>}
                        </h5>
                        {isLoading ? (
                          <div className="text-sm text-gray-500">Loading subpoints...</div>
                        ) : subpoints.length > 0 ? (
                          <div className="space-y-3 ml-4 border-l-2 border-purple-200 pl-4">
                            {subpoints.map((sp: SubPointWithQuizzes) => {
                              const isSpExpanded = expandedSubPoints.has(sp.id)
                              const details = loadedDetails[sp.id] || sp.details || []
                              const isLoadingDetails = loadingDetails.has(sp.id)

                              return (
                                <div key={sp.id} className="bg-gray-50 rounded-lg p-4">
                                  <button
                                    onClick={() => toggleSubPoint(sp.id, mp.id)}
                                    className="w-full text-left flex items-start justify-between mb-2"
                                  >
                                    <div className="flex-1">
                                      <h6 className="font-semibold text-gray-800">{sp.text}</h6>
                                      {sp.context && (
                                        <p className="text-xs text-gray-600 mt-1">{sp.context}</p>
                                      )}
                                      {sp.quizzes && sp.quizzes.length > 0 && (
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded mt-1 inline-block">
                                          {sp.quizzes.length} quiz{sp.quizzes.length !== 1 ? 'zes' : ''}
                                        </span>
                                      )}
                                    </div>
                                    {isSpExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
                                    )}
                                  </button>

                                  {isSpExpanded && (
                                    <div className="mt-3 space-y-3">
                                      {/* Subpoint Quizzes */}
                                      {sp.quizzes && sp.quizzes.length > 0 && (
                                        <div>
                                          <p className="text-xs font-semibold text-gray-600 mb-2">Quizzes</p>
                                          <div className="space-y-2">
                                            {sp.quizzes.map(renderQuiz)}
                                          </div>
                                        </div>
                                      )}

                                      {/* Details */}
                                      {(sp.has_details || details.length > 0) && (
                                        <div>
                                          <p className="text-xs font-semibold text-gray-600 mb-2">
                                            Details {isLoadingDetails && <span className="text-gray-400">(Loading...)</span>}
                                          </p>
                                          {isLoadingDetails ? (
                                            <div className="text-xs text-gray-500">Loading details...</div>
                                          ) : details.length > 0 ? (
                                            <div className="space-y-2 ml-4 border-l-2 border-green-200 pl-4">
                                              {details.map((detail: DetailWithQuizzes) => {
                                                const isDetailExpanded = expandedDetails.has(detail.id)
                                                return (
                                                  <div key={detail.id} className="bg-white rounded p-3">
                                                    <button
                                                      onClick={() => toggleDetail(detail.id)}
                                                      className="w-full text-left flex items-start justify-between"
                                                    >
                                                      <p className="text-sm text-gray-700 flex-1">{detail.content}</p>
                                                      {isDetailExpanded ? (
                                                        <ChevronDown className="w-3 h-3 text-gray-400 ml-2" />
                                                      ) : (
                                                        <ChevronRight className="w-3 h-3 text-gray-400 ml-2" />
                                                      )}
                                                    </button>
                                                    {isDetailExpanded && detail.quizzes && detail.quizzes.length > 0 && (
                                                      <div className="mt-2 space-y-2">
                                                        {detail.quizzes.map(renderQuiz)}
                                                      </div>
                                                    )}
                                                  </div>
                                                )
                                              })}
                                            </div>
                                          ) : null}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 ml-4">No subpoints</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* No Data State */}
      {(!quizData || !quizData.main_points || quizData.main_points.length === 0) && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">This capture is still being processed.</p>
          <p className="text-sm text-gray-500">Main points and quizzes will appear here once ready.</p>
        </div>
      )}
    </div>
  )
}

