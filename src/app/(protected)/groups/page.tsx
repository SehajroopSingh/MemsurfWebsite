import ProtectedRoute from '@/components/shared/ProtectedRoute'
import GroupsView from '@/components/app/GroupsView'

export default function GroupsPage() {
  return (
    <ProtectedRoute>
      <GroupsView />
    </ProtectedRoute>
  )
}

