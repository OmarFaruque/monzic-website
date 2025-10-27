"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, FileText, User, LogOut, ChevronRight } from "lucide-react"
import { useAuth } from "@/context/auth"
import { useNotifications } from "@/hooks/use-notifications"
import { LogoutDialog } from "@/components/dashboard/logout-dialog"
import { useSettings } from "@/context/settings"

export function DashboardSidebar({
  activeSection,
  setActiveSection,
}: {
  activeSection: "policies" | "account"
  setActiveSection: (section: "policies" | "account") => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const { logout } = useAuth()
  const { showSuccess } = useNotifications()
  const settings = useSettings()

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

  const handleSectionChange = (section: "policies" | "account") => {
    setActiveSection(section)
    closeSidebar()
  }

  const handleLogoutConfirm = () => {
    logout()
    showSuccess("Logged Out Successfully", "You have been logged out of your account.", 5000)
    setShowLogoutDialog(false)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-16 left-0 z-30 p-4">
        <Button variant="outline" size="icon" onClick={toggleSidebar} className="bg-white border-gray-200 shadow-md">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isOpen && <div className="fixed inset-0 bg-black/50 z-20" onClick={closeSidebar} />}

      {/* Sidebar */}
      <div
        className={`fixed md:sticky top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-30
          ${isOpen || !isMobile ? "left-0" : "-left-64"}
          w-64 md:w-64 md:left-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">{settings.siteName || 'TEMPNOW'}</h2>
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={closeSidebar}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleSectionChange("policies")}
                  className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors touch-manipulation
                    ${
                      activeSection === "policies"
                        ? "bg-teal-50 text-teal-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <FileText className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>My Policies</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSectionChange("account")}
                  className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors touch-manipulation
                    ${
                      activeSection === "account"
                        ? "bg-teal-50 text-teal-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <User className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Edit Account</span>
                </button>
              </li>
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-3 md:p-4 border-t border-gray-200">
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="flex items-center w-full px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors touch-manipulation"
            >
              <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      <LogoutDialog isOpen={showLogoutDialog} onClose={() => setShowLogoutDialog(false)} onConfirm={handleLogoutConfirm} />
    </>
  )
}

// Also export as Sidebar for new code
export { DashboardSidebar as Sidebar }
