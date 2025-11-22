import ProtectedRoute from '@/components/shared/ProtectedRoute'
import CaptureDetailView from '@/components/app/CaptureDetailView'

export default function CaptureDetailPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <CaptureDetailView captureId={parseInt(params.id)} />
    </ProtectedRoute>
  )
}

