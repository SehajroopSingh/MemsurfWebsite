'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { ScheduledQuiz, Quiz, QuizSession } from '@/lib/types'
import { CheckCircle2, X, Loader2, Target, ArrowLeft } from 'lucide-react'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

interface DailyPracticeViewProps {
  onBack?: () => void
}

export default function DailyPracticeView({ onBack }: DailyPracticeViewProps = {}) {
  const [quizzes, setQuizzes] = useState<ScheduledQuiz[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: any }>({})
  const [results, setResults] = useState<{ [key: number]: boolean }>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await apiClient.getScheduledQuizzes()
        setQuizzes(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load quizzes')
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  const handleAnswer = (quizId: number, answer: any) => {
    setUserAnswers({ ...userAnswers, [quizId]: answer })
  }

  const handleSubmit = async () => {
    if (quizzes.length === 0) return

    setSubmitting(true)
    try {
      const sessions: QuizSession[] = quizzes.map((sq) => ({
        quiz_id: sq.quiz.id,
        user_answer: userAnswers[sq.quiz.id],
        time_taken: 0,
      }))

      const response = await apiClient.submitQuizSession(sessions)
      
      // Process results
      const newResults: { [key: number]: boolean } = {}
      if (response.results) {
        response.results.forEach((r: any) => {
          newResults[r.quiz_id] = r.is_correct
        })
      }
      setResults(newResults)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

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

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Quizzes Scheduled</h2>
            <p className="text-gray-600 mb-6">
              You're all caught up! New quizzes will appear here when they're due for review.
            </p>
            <a
              href="/capture/new"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Create New Capture
            </a>
          </div>
        </div>
      </div>
    )
  }

  const currentQuiz = quizzes[currentIndex]
  const quiz = currentQuiz.quiz
  const isAnswered = userAnswers[quiz.id] !== undefined
  const isCorrect = results[quiz.id]
  const showResult = submitted && results[quiz.id] !== undefined

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Daily Practice</h1>
            <p className="text-gray-600">
              Question {currentIndex + 1} of {quizzes.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-blue-600 uppercase">
                {quiz.quiz_type.replace(/_/g, ' ')}
              </span>
              {showResult && (
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-semibold">Correct!</span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5 text-red-600" />
                      <span className="text-red-600 font-semibold">Incorrect</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {quiz.question_text || quiz.statement || quiz.fillBlankQuestion || 'Question'}
            </h2>
          </div>

          {quiz.quiz_type === 'multiple_choice' && quiz.choices && (
            <div className="space-y-3">
              {quiz.choices.map((choice, idx) => {
                const isSelected = userAnswers[quiz.id] === idx
                const isCorrectChoice = idx === quiz.correctAnswerIndex
                return (
                  <button
                    key={idx}
                    onClick={() => !submitted && handleAnswer(quiz.id, idx)}
                    disabled={submitted}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      showResult && isCorrectChoice
                        ? 'border-green-500 bg-green-50'
                        : showResult && isSelected && !isCorrectChoice
                        ? 'border-red-500 bg-red-50'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className="text-gray-900">{choice}</span>
                      {showResult && isCorrectChoice && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {quiz.quiz_type === 'true_false' && (
            <div className="space-y-3">
              {['True', 'False'].map((option) => {
                const isSelected = userAnswers[quiz.id] === option.toLowerCase()
                const isCorrect = option.toLowerCase() === quiz.trueFalseAnswer?.toLowerCase()
                return (
                  <button
                    key={option}
                    onClick={() => !submitted && handleAnswer(quiz.id, option.toLowerCase())}
                    disabled={submitted}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      showResult && isCorrect
                        ? 'border-green-500 bg-green-50'
                        : showResult && isSelected && !isCorrect
                        ? 'border-red-500 bg-red-50'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {option}
                    {showResult && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto inline-block" />
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {quiz.quiz_type === 'fill_in_the_blank' && (
            <div>
              <input
                type="text"
                value={userAnswers[quiz.id] || ''}
                onChange={(e) => !submitted && handleAnswer(quiz.id, e.target.value)}
                disabled={submitted}
                placeholder="Enter your answer"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              {showResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Correct answer: {quiz.fillBlankAnswer}</p>
                </div>
              )}
            </div>
          )}

          {quiz.explanation && showResult && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-1">Explanation</p>
              <p className="text-blue-800">{quiz.explanation}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentIndex === quizzes.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || !isAnswered}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit All'
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(Math.min(quizzes.length - 1, currentIndex + 1))}
              disabled={currentIndex === quizzes.length - 1}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

