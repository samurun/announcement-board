import { Routes, Route, Navigate } from "react-router"
import { ProtectedRoute } from "@/features/auth/_components/ProtectedRoute"
import { LoginPage } from "@/features/auth/pages/LoginPage.tsx"
import { RegisterPage } from "@/features/auth/pages/RegisterPage.tsx"
import { AnnouncementsPage } from "@/features/announcements/pages/AnnouncementsPage.tsx"

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <AnnouncementsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/announcements" replace />} />
    </Routes>
  )
}
