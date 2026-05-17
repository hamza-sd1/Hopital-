import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function ProtectedRoute({ roles }) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return <div className="page-loader glass-card">Chargement de votre espace...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
