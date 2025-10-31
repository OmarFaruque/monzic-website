"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check, Menu, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation"
import { checkBlacklist } from "@/lib/blacklist"
import { useNotifications } from "@/hooks/use-notifications"
import { NotificationContainer } from "@/components/notification"
import { useAuth } from "@/context/auth"

import { Header } from "@/components/header"

import { useSettings } from "@/context/settings"

export default function TempnowHomepage() {
  const [message, setMessage] = useState("")
  const [mainInput, setMainInput] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false); // State for loading
  const router = useRouter()
  const { notifications, removeNotification, showError } = useNotifications()
  const settings = useSettings()



  const formatRegistration = useCallback((value: string) => {
    let formatted = value.toUpperCase()
    if (formatted.length > 7) {
      formatted = formatted.substring(0, 7)
    }
    return formatted
  }, [])

  const handleMainFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      if (!mainInput.trim()) {
        setMessage("Please enter a vehicle registration number.")
        setLoading(false)
        return
      }

      const cleanReg = mainInput.replace(/\s+/g, "").toUpperCase()

      // Check blacklist first
      try {
        const response = await fetch("/api/get-client-ip")
        const { ip } = await response.json()

        const blacklistCheck = checkBlacklist(undefined, undefined, undefined, ip)
        if (blacklistCheck.isBlacklisted) {
          showError(
            "Access Restricted",
            `Your access has been restricted. Reason: ${blacklistCheck.reason}. Please contact support@tempnow.uk for assistance.`,
          )
          return
        }
      } catch (error) {
        console.error("Failed to check blacklist:", error)
      }

      
      try {
        const vehicleResponse = await fetch('/api/check-vehicle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registration: cleanReg }),
        });

        if (!vehicleResponse.ok) {
          
          let errorData = { message: "Vehicle registration not found. Please check and try again." };
          try {
            errorData = await vehicleResponse.json();
          } catch (e) {
            // Ignore JSON parsing error if the response body is empty
          }
          setLoading(false);
          showError("Vehicle Not Found", errorData.message || "Vehicle registration not found. Please check and try again.");
          return;
        }

        // If the vehicle is found and valid, proceed to the next page.
        router.push(`/get-quote?reg=${encodeURIComponent(cleanReg)}`);

      } catch (error) {
        console.error("Vehicle check failed:", error);
        showError("Service Unavailable", "Could not verify vehicle registration at this time. Please try again later.");
      }
    },
    [mainInput, router, showError],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatRegistration(e.target.value)
      setMainInput(formatted)

      if (message) {
        setMessage("")
      }
    },
    [formatRegistration, message],
  )

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  // Memoize the features list to prevent re-renders
  const features = useMemo(
    () => [
      "Instant professional document creation",
      "Multiple formats and templates",
      "Download ready documents instantly",
    ],
    [],
  )



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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-6 sm:py-8 bg-teal-50">
        <div className="w-full max-w-sm sm:max-w-md text-center space-y-6 sm:space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-68 h-12 sm:w-56 sm:h-14">
              <Image
                src={settings?.general?.logo || "/tempnow-logo-horizontal.png"}
                alt={`${settings?.general?.siteName} Logo`}
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-medium text-teal-700 px-2">Affordable, Lightning-Fast Delivery</h2>
            <p className="text-base sm:text-lg text-teal-500">Only at {settings?.siteName || 'Tempnow'}</p>
          </div>

          {/* Message Display */}
          {message && (
            <div className="bg-white p-4 rounded-lg border border-teal-200 text-teal-700 shadow-sm text-sm sm:text-base mx-2">
              {message}
            </div>
          )}

          {/* Main Form */}
          <form
            onSubmit={handleMainFormSubmit}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-teal-100 space-y-4 mx-2 sm:mx-0"
          >
            <div className="flex border-2 border-teal-200 rounded-lg overflow-hidden">
              <div className="bg-teal-600 text-white px-3 sm:px-4 py-3 sm:py-4 font-bold text-base sm:text-lg flex items-center justify-center">
                GB
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={mainInput}
                  onChange={handleInputChange}
                  placeholder="ENTER HERE"
                  className="w-full h-full py-3 sm:py-4 px-3 sm:px-4 text-center text-xl sm:text-2xl font-bold uppercase bg-white border-0 outline-0 focus:ring-0"
                  style={{
                    border: "none",
                    outline: "none",
                    boxShadow: "none",
                    fontSize: "clamp(1.25rem, 4vw, 2rem)",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                  required
                  autoComplete="off"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 sm:py-4 rounded-md font-medium text-base sm:text-lg"
            >
              SUBMIT
            </Button>
          </form>
        </div>

        {/* AI Document Generation Card */}
        <div className="w-full max-w-sm sm:max-w-lg mt-8 sm:mt-12 mb-6 sm:mb-8 px-2 sm:px-0">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-teal-100">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">AI Document Generation</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              Transform your ideas into professional documents instantly. From business proposals to technical
              specifications, our AI creates high-quality content in seconds.
            </p>

            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => router.push("/ai-documents")}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 sm:py-4 rounded-md font-medium text-base sm:text-lg"
            >
              GET STARTED
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-teal-600 py-4 sm:py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-white">
            <Link href="/privacy-policy" className="hover:text-teal-200 transition-colors text-center sm:text-left">
              Privacy Policy
            </Link>
            <Link href="/terms-of-services" className="hover:text-teal-200 transition-colors text-center sm:text-left">
              Terms of Services
            </Link>
            <Link href="/return-policy" className="hover:text-teal-200 transition-colors text-center sm:text-left">
              Return Policy
            </Link>
          </div>
          <div className="text-center mt-3 sm:mt-4 text-xs text-teal-100">© {new Date().getFullYear()} {settings?.companyName || 'TEMPNOW'}. All rights reserved.</div>
        </div>
      </footer>

      {/* Notification Container */}
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
    </div>
  )
}
