import ProtectedRoute from '@/components/shared/ProtectedRoute'
import SpacesView from '@/components/app/SpacesView'

export default function SpacesPage() {
  return (
    <ProtectedRoute>
      <SpacesView />
    </ProtectedRoute>
  )
}

