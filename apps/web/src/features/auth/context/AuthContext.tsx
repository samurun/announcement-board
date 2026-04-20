import { createContext, useContext, useState, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = "token"
const USER_KEY = "user"

function readUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  )
  const [user, setUser] = useState<User | null>(() => readUser())

  const persist = (nextToken: string, nextUser: User) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }

  const login = async (email: string, password: string) => {
    const mockToken = "mock-token"
    const mockUser: User = { id: "1", email, name: "Mock User" }
    persist(mockToken, mockUser)
  }

  const register = async (email: string, password: string, name: string) => {
    return await new Promise<void>((resolve) => {
      const mockToken = "mock-token"
      const mockUser: User = { id: "1", email, name }
      persist(mockToken, mockUser)
      resolve()
    })
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
