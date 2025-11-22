import ProtectedRoute from '@/components/shared/ProtectedRoute'
import MainTabView from '@/components/app/MainTabView'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <MainTabView />
    </ProtectedRoute>
  )
}

