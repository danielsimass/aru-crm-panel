import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import Login from '../pages/login'
import RecoveryPassword from '../pages/recovery-password'
import FirstLogin from '../pages/first-login'
import UsersPage from '../pages/users'
import AthletesPage from '../pages/athletes'
import HomePage from '../pages/home'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/recovery-password" element={<RecoveryPassword />} />
      <Route path="/first-login" element={<FirstLogin />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/athletes"
        element={
          <ProtectedRoute>
            <AthletesPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
