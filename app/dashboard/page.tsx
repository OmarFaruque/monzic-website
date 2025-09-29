"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/hooks/use-notifications"
import { NotificationContainer } from "@/components/notification"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { PoliciesSection } from "@/components/dashboard/policies-section"
import { AccountSection } from "@/components/dashboard/account-section"
import { UserTicketsSection } from "@/components/dashboard/user-tickets-section"
import { LogoutDialog } from "@/components/dashboard/logout-dialog"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth"
import { LogOut } from "lucide-react"

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<"policies" | "account" | "tickets">("policies")
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const { notifications, removeNotification, showSuccess } = useNotifications()
  const router = useRouter()
  const { isAuthenticated, loading, user, logout } = useAuth()

  // Redirect to login if not authenticated


  useEffect(() => {
      if (loading === false) {
        if (!isAuthenticated) {
          // Now, this will only run if loading is done AND the user is truly not logged in.
          router.push("/login")
        }
      }
  }, [isAuthenticated, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-teal-700">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  const handleLogout = () => {
    logout();
    showSuccess("Logged Out Successfully", "You have been logged out of your account.", 5000)
    setShowLogoutDialog(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex flex-col">
      {/* Header */}
      <header className="bg-teal-600 px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-white cursor-pointer hover:text-teal-100 transition-colors">
              MONZIC
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {user && <span className="text-white text-sm hidden sm:block">Welcome, {user.firstName || user.email}</span>}
          <Link href="/contact">
            <Button
              variant="outline"
              className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent"
            >
              Contact
            </Button>
          </Link>
          <Button
            onClick={() => setShowLogoutDialog(true)}
            variant="outline"
            className="border-teal-400 text-white hover:bg-red-500 hover:border-white bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <DashboardSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onLogoutClick={() => setShowLogoutDialog(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {activeSection === "policies" && <PoliciesSection />}
            {activeSection === "tickets" && <UserTicketsSection />}
            {activeSection === "account" && <AccountSection />}
          </div>
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutDialog isOpen={showLogoutDialog} onClose={() => setShowLogoutDialog(false)} onConfirm={handleLogout} />

      {/* Notification Container */}
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
    </div>
  )
}
