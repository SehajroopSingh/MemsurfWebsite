import ProtectedRoute from '@/components/shared/ProtectedRoute'
import DailyPracticeView from '@/components/app/DailyPracticeView'

export default function PracticePage() {
  return (
    <ProtectedRoute>
      <DailyPracticeView />
    </ProtectedRoute>
  )
}

