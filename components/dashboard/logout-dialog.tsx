"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface LogoutDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function LogoutDialog({ isOpen, onClose, onConfirm }: LogoutDialogProps) {
  const handleConfirm = () => {
    // Clear authentication status
    localStorage.removeItem("userLoggedIn")
    onConfirm()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
          <p className="text-gray-600">Are you sure you want to log out of your account?</p>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="destructive" className="flex-1">
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
