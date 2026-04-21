import { Routes, Route } from "react-router"
import { ProtectedRoute } from "@/features/auth/_components/ProtectedRoute"
import { LoginPage } from "@/features/auth/pages/LoginPage.tsx"
import { RegisterPage } from "@/features/auth/pages/RegisterPage.tsx"
import { AnnouncementsPage } from "@/features/announcements/pages/AnnouncementsPage.tsx"
import { BoardPage } from "./features/board/page/BoardPage"

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <BoardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <AnnouncementsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
