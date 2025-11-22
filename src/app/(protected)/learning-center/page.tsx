import ProtectedRoute from '@/components/shared/ProtectedRoute'
import LearningCenter from '@/components/app/LearningCenter'

export default function LearningCenterPage() {
  return (
    <ProtectedRoute>
      <LearningCenter />
    </ProtectedRoute>
  )
}

