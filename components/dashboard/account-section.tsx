"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNotifications } from "@/hooks/use-notifications"
import { User, Mail, Phone, MapPin, Lock, Save, Eye, EyeOff } from "lucide-react"

export function AccountSection() {
  const [userData, setUserData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const { showSuccess, showError } = useNotifications()

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/user")
      const data = await response.json()
      setUserData(data.user)
    }
    fetchData()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setUserData({
      ...userData,
      [field]: value,
    })
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData({
      ...passwordData,
      [field]: value,
    })
  }

  const handleSaveChanges = async () => {
    const response = await fetch("/api/user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (response.ok) {
      showSuccess("Profile Updated", "Your account information has been updated successfully.", 3000)
      setIsEditing(false)
    } else {
      showError("Update Failed", "Failed to update your account information.")
    }
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("Password Mismatch", "The new passwords you entered do not match. Please try again.")
      return
    }

    if (passwordData.newPassword.length < 6) {
      showError("Password Too Short", "Your new password must be at least 6 characters long.")
      return
    }

    // In a real app, you would send this to your API
    showSuccess("Password Updated", "Your password has been changed successfully.", 3000)
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  if (!userData) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  value={userData.firstName || ''}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={!isEditing}
                  className={`pl-10 ${!isEditing ? "bg-gray-50 text-gray-500" : ""}`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  value={userData.lastName || ''}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={!isEditing}
                  className={`pl-10 ${!isEditing ? "bg-gray-50 text-gray-500" : ""}`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  value={userData.email || ''}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  className={`pl-10 ${!isEditing ? "bg-gray-50 text-gray-500" : ""}`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="tel"
                  value={userData.phone || "N/A"}
                  disabled
                  className={`pl-10 bg-gray-50 text-gray-500`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Change Password */}
      {/* <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Button type="submit" className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Update Password</span>
              </Button>
            </div>
          </form>
        </div>
      </div> */}
    </div>
  )
}
