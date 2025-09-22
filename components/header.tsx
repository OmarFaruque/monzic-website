"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useCallback } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/app/auth-provider"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated: authIsAuthenticated, loading } = useAuth()

  // Check both localStorage and auth context for authentication
  const checkAuth = useCallback(() => {
    const localStorageAuth = localStorage.getItem("userLoggedIn") === "true"
    const contextAuth = authIsAuthenticated
    setIsAuthenticated(localStorageAuth || contextAuth)
  }, [authIsAuthenticated])

  useEffect(() => {
    if (!loading) {
      checkAuth()
    }

    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [checkAuth, loading])

  return (
    <header className="bg-teal-600 px-4 sm:px-6 py-3 sm:py-4 shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-white hover:text-teal-100 transition-colors">
            MONZIC
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-3">
          <Link href="/ai-documents">
            <Button className="bg-white hover:bg-gray-100 text-teal-600 font-medium">AI Documents</Button>
          </Link>
          {pathname !== "/contact" && (
            <Link href="/contact">
              <Button
                variant="outline"
                className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent"
              >
                Contact
              </Button>
            </Link>
          )}
          <Link href={isAuthenticated ? "/dashboard" : "/login"}>
            <Button
              variant="outline"
              className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent"
            >
              {isAuthenticated ? "Dashboard" : "Sign In"}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            className="p-1 text-white hover:bg-teal-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-teal-500 flex flex-col gap-2">
          <Link href="/ai-documents" onClick={() => setMobileMenuOpen(false)}>
            <Button className="w-full bg-white hover:bg-gray-100 text-teal-600 font-medium">AI Documents</Button>
          </Link>
          {pathname !== "/contact" && (
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="outline"
                className="w-full border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent"
              >
                Contact
              </Button>
            </Link>
          )}
          <Link href={isAuthenticated ? "/dashboard" : "/login"} onClick={() => setMobileMenuOpen(false)}>
            <Button
              variant="outline"
              className="w-full border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent"
            >
              {isAuthenticated ? "Dashboard" : "Sign In"}
            </Button>
          </Link>
        </div>
      )}
    </header>
  )
}
