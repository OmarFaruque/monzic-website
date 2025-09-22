"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface AdminAuthContextType {
  isAdminAuthenticated: boolean
  adminUser: { id: string; email: string; role: string } | null
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  adminLogout: () => void
  loading: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState<{ id: string; email: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if admin is logged in on mount
    const checkAdminAuth = () => {
      try {
        const storedAdminUser = localStorage.getItem("adminUser")
        const storedAdminAuth = localStorage.getItem("isAdminAuthenticated")
        const adminToken = localStorage.getItem("adminAuthToken")

        if (storedAdminUser && storedAdminAuth === "true" && adminToken) {
          const userData = JSON.parse(storedAdminUser)
          setAdminUser(userData)
          setIsAdminAuthenticated(true)
        }
      } catch (error) {
        console.error("Admin auth check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAuth()
  }, [])

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get client IP for rate limiting
      const ipResponse = await fetch("/api/get-client-ip")
      const { ip } = await ipResponse.json()

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, clientIP: ip }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        const adminUserData = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
        }

        // Store admin auth data
        localStorage.setItem("adminUser", JSON.stringify(adminUserData))
        localStorage.setItem("isAdminAuthenticated", "true")
        localStorage.setItem("adminAuthToken", data.token || `admin-token-${Date.now()}`)

        setAdminUser(adminUserData)
        setIsAdminAuthenticated(true)

        return { success: true }
      } else {
        return { success: false, error: data.error || "Login failed" }
      }
    } catch (error) {
      console.error("Admin login error:", error)
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const adminLogout = () => {
    // Clear admin auth data
    localStorage.removeItem("adminUser")
    localStorage.removeItem("isAdminAuthenticated")
    localStorage.removeItem("adminAuthToken")

    setAdminUser(null)
    setIsAdminAuthenticated(false)

    // Redirect to admin login
    router.push("/admin-login")
  }

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminUser,
        adminLogin,
        adminLogout,
        loading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
