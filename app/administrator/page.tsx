"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Brain,
  FileText,
  MessageSquare,
  Settings,
  Shield,
  Tag,
  TrendingUp,
  UserCheck,
  Users,
  Loader2,
  LogOut,
} from "lucide-react"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { OverviewSection } from "@/components/admin/overview-section"
import { UsersSection } from "@/components/admin/users-section"
import { PoliciesSection } from "@/components/admin/policies-section"
import { TicketsSection } from "@/components/admin/tickets-section"
import { AnalyticsSection } from "@/components/admin/analytics-section"
import { CouponsSection } from "@/components/admin/coupons-section"
import { BlacklistSection } from "@/components/admin/blacklist-section"
import { AdminsSection } from "@/components/admin/admins-section"
import { AiConfigSection } from "@/components/admin/ai-config-section"
import { SettingsSection } from "@/components/admin/settings-section"
import { useTickets } from "@/hooks/use-tickets"
import { useAdminAuth } from "@/context/admin-auth"
import { Button } from "@/components/ui/button"

const navigationItems = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "policies", label: "Policies", icon: FileText },
  { id: "tickets", label: "Tickets", icon: MessageSquare, badge: 0 },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "coupons", label: "Coupons", icon: Tag },
  { id: "blacklist", label: "Blacklist", icon: Shield },
  { id: "admins", label: "Admins", icon: UserCheck },
  { id: "ai-config", label: "AI Config", icon: Brain },
  { id: "settings", label: "Settings", icon: Settings },
]

const AdministratorPage = () => {
  const [selectedItem, setSelectedItem] = useState(navigationItems[0].id)
  const { data: tickets } = useTickets()
  const { isAdminAuthenticated, adminUser, adminLogout, loading } = useAdminAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {

    console.log("Auth status:", { isAdminAuthenticated, loading })

    if (!loading && !isAdminAuthenticated) {
      router.push("/admin-login")
    }
  }, [isAdminAuthenticated, loading, router])

  const unreadTickets = tickets?.filter((ticket) => ticket.status === "open").length || 0
  navigationItems.find((item) => item.id === "tickets")!.badge = unreadTickets

  const renderContent = (itemId: string) => {
    switch (itemId) {
      case "overview":
        return <OverviewSection />
      case "users":
        return <UsersSection />
      case "policies":
        return <PoliciesSection />
      case "tickets":
        return <TicketsSection />
      case "analytics":
        return <AnalyticsSection />
      case "coupons":
        return <CouponsSection />
      case "blacklist":
        return <BlacklistSection />
      case "admins":
        return <AdminsSection />
      case "ai-config":
        return <AiConfigSection />
      case "settings":
        return <SettingsSection />
      default:
        return <div>Content for {itemId}</div>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading admin dashboard...</span>
        </div>
      </div>
    )
  }

  if (!isAdminAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar items={navigationItems} selectedItem={selectedItem} onSelectItem={setSelectedItem} />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden lg:ml-0">
        {/* Mobile Header Spacer */}
        <div className="h-16 lg:h-0"></div>

        {/* Content Area */}
        <div className="h-full overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Admin Header */}
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Administrator Dashboard</h1>
                <p className="text-gray-600 mt-2">
                  Welcome back, {adminUser?.email} ({adminUser?.role})
                </p>
              </div>
              <Button
                onClick={adminLogout}
                variant="outline"
                className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>

            {renderContent(selectedItem)}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdministratorPage
