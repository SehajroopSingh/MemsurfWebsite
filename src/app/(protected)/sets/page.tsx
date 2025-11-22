import ProtectedRoute from '@/components/shared/ProtectedRoute'
import SetsView from '@/components/app/SetsView'

export default function SetsPage() {
  return (
    <ProtectedRoute>
      <SetsView />
    </ProtectedRoute>
  )
}

