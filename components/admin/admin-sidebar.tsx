"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Menu } from "lucide-react"
import { useState } from "react"
import type { LucideIcon } from "lucide-react"

interface NavigationItem {
  id: string
  label: string
  icon: LucideIcon
  badge?: number
}

interface AdminSidebarProps {
  items: NavigationItem[]
  selectedItem: string
  onSelectItem: (itemId: string) => void
}

export function AdminSidebar({ items, selectedItem, onSelectItem }: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleItemSelect = (itemId: string) => {
    onSelectItem(itemId)
    setIsMobileMenuOpen(false) // Close mobile menu when item is selected
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button onClick={toggleMobileMenu} variant="outline" size="sm" className="bg-white shadow-lg">
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r transform transition-transform duration-300 ease-in-out lg:transform-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-4 lg:p-6 border-b flex justify-between items-center">
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs lg:text-sm text-gray-500 mt-1">Monzic Insurance</p>
          </div>

          {/* Mobile Close Button */}
          <Button onClick={() => setIsMobileMenuOpen(false)} variant="ghost" size="sm" className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]">
          {items.map((item) => {
            const Icon = item.icon
            const isSelected = selectedItem === item.id

            return (
              <Button
                key={item.id}
                variant={isSelected ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-12 lg:h-10 text-left",
                  isSelected ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-700 hover:bg-gray-100",
                )}
                onClick={() => handleItemSelect(item.id)}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left text-sm lg:text-base">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge
                    variant={isSelected ? "secondary" : "default"}
                    className={cn("ml-auto text-xs", isSelected ? "bg-white text-blue-600" : "bg-red-500 text-white")}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            )
          })}
        </nav>

        {/* Footer */}
        {/* <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xs text-gray-500 text-center">Admin Dashboard v1.0</div>
        </div> */}
      </div>
    </>
  )
}
