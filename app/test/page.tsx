"use client"

import { AuthProvider, useAuth } from "@/context/auth"

function DisplayAuth() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div>
      <h2>Auth Status</h2>
      <p>Is Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
      <p>User: {user ? user.email : "Not logged in"}</p>
    </div>
  )
}

export default function TestPage() {
  return (
    <AuthProvider>
      <h1>Test Page</h1>
      <DisplayAuth />
    </AuthProvider>
  )
}
