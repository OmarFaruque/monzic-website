"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  email: string
  name?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  loading: boolean
  user: User | null
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  user: null,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is logged in from localStorage or sessionStorage
    const checkAuth = () => {
      const localStorageAuth = localStorage.getItem("userLoggedIn") === "true"
      const sessionStorageAuth = sessionStorage.getItem("userLoggedIn") === "true"
      const userEmail = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail")

      if (localStorageAuth || sessionStorageAuth) {
        setIsAuthenticated(true)
        setUser({
          email: userEmail || "user@example.com",
        })
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
      setLoading(false)
    }

    checkAuth()

    // Listen for storage events (for multi-tab support)
    window.addEventListener("storage", checkAuth)
    return () => {
      window.removeEventListener("storage", checkAuth)
    }
  }, [])

  const login = () => {
    setIsAuthenticated(true)
    const userEmail = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail")
    setUser({
      email: userEmail || "user@example.com",
    })
  }

  const logout = () => {
    localStorage.removeItem("userLoggedIn")
    sessionStorage.removeItem("userLoggedIn")
    localStorage.removeItem("userEmail")
    sessionStorage.removeItem("userEmail")
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, login, logout }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
