import ProtectedRoute from '@/components/shared/ProtectedRoute'
import CaptureInputForm from '@/components/app/CaptureInputForm'

export default function NewCapturePage() {
  return (
    <ProtectedRoute>
      <CaptureInputForm />
    </ProtectedRoute>
  )
}

