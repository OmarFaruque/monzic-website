"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { useNotifications } from "@/hooks/use-notifications"
import { NotificationContainer } from "@/components/notification"
import { Shield, AlertCircle, ArrowLeft } from "lucide-react"

export default function PolicyViewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { notifications, addNotification, removeNotification } = useNotifications()
  const policyNumber = searchParams.get("number")
  const [isMounted, setIsMounted] = useState(false)

  const [formData, setFormData] = useState({
    surname: "",
    dateOfBirthDay: "",
    dateOfBirthMonth: "",
    dateOfBirthYear: "",
    postcode: "",
  })

  const DEMO_POLICIES = [
    "POL-001234 - John SMITH, DOB: 15/03/1985, Postcode: SW1A 1AA",
    "POL-001235 - Sarah JOHNSON, DOB: 22/07/1990, Postcode: M1 1AA",
    "POL-001236 - Michael WILLIAMS, DOB: 08/11/1978, Postcode: B1 1AA",
  ]

  const [isVerifying, setIsVerifying] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Refs for auto-advance functionality
  const dayRef = useRef<HTMLInputElement>(null)
  const monthRef = useRef<HTMLInputElement>(null)
  const yearRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // If no policy number is provided, redirect to home
  useEffect(() => {
    if (isMounted && !policyNumber) {
      router.push("/")
    }
  }, [policyNumber, router, isMounted])

  if (!isMounted) {
    return null
  }

  const handleInputChange = (field: string, value: string) => {
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    setFormData((prev) => ({ ...prev, [field]: value }))

    // Auto-advance logic for date fields
    if (field === "dateOfBirthDay" && value.length === 2 && monthRef.current) {
      monthRef.current.focus()
    } else if (field === "dateOfBirthMonth" && value.length === 2 && yearRef.current) {
      yearRef.current.focus()
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate surname
    if (!formData.surname.trim()) {
      newErrors.surname = "Surname is required"
    }

    // Validate date of birth
    if (!formData.dateOfBirthDay) {
      newErrors.dateOfBirthDay = "Day is required"
    } else if (Number.parseInt(formData.dateOfBirthDay) < 1 || Number.parseInt(formData.dateOfBirthDay) > 31) {
      newErrors.dateOfBirthDay = "Day must be between 1 and 31"
    }

    if (!formData.dateOfBirthMonth) {
      newErrors.dateOfBirthMonth = "Month is required"
    } else if (Number.parseInt(formData.dateOfBirthMonth) < 1 || Number.parseInt(formData.dateOfBirthMonth) > 12) {
      newErrors.dateOfBirthMonth = "Month must be between 1 and 12"
    }

    if (!formData.dateOfBirthYear) {
      newErrors.dateOfBirthYear = "Year is required"
    } else if (
      Number.parseInt(formData.dateOfBirthYear) < 1900 ||
      Number.parseInt(formData.dateOfBirthYear) > new Date().getFullYear()
    ) {
      newErrors.dateOfBirthYear = "Please enter a valid year"
    }

    // Validate postcode
    if (!formData.postcode.trim()) {
      newErrors.postcode = "Postcode is required"
    } else if (!/^[A-Z0-9]{1,4}\s?[A-Z0-9]{1,3}$/i.test(formData.postcode.trim())) {
      newErrors.postcode = "Please enter a valid UK postcode"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please correct the errors in the form.",
      })
      return
    }

    setIsVerifying(true)

    // Simulate a small delay for better UX
    
      try {
        const dateOfBirth = `${formData.dateOfBirthYear}-${formData.dateOfBirthMonth.padStart(2, "0")}-${formData.dateOfBirthDay.padStart(2, "0")}`

        // Call the new API route
        const response = await fetch('/api/policy/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            policyNumber: policyNumber!,
            surname: formData.surname,
            dateOfBirth,
            postcode: formData.postcode,
          }),
        });

        const result = await response.json();

        if (response.ok && result.isValid) {
          sessionStorage.setItem(`policy_verified_${policyNumber}`, "true")
          addNotification({
            type: "success",
            title: "Verification Successful",
            message: "Policy details verified successfully.",
          })
          setTimeout(() => {
          router.push(`/policy/details?number=${policyNumber}`)
        }, 1500)
      } else {
        addNotification({
          type: "error",
          title: "Verification Failed",
          message: "The information provided does not match our records. Please check your details and try again.",
        })
      }
    } catch (error) {
      console.error("Verification error:", error)
      addNotification({
        type: "error",
        title: "Verification Error",
        message: "An error occurred during verification. Please try again.",
      })
    } finally {
      setIsVerifying(false)
    }
    
  }

  // Auto-fill demo data function
  const fillDemoData = () => {
    setFormData({
      surname: "SMITH",
      dateOfBirthDay: "15",
      dateOfBirthMonth: "03",
      dateOfBirthYear: "1985",
      postcode: "SW1A1AA",
    })
  }

  if (!policyNumber) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Request</h1>
            <p className="text-gray-600 mb-6">No policy number was provided.</p>
            <Button onClick={() => router.push("/")} className="bg-teal-600 hover:bg-teal-700 text-white">
              Return to Home
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="px-4 sm:px-6 py-8">
        <div className="max-w-lg mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-teal-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Retrieve Your Information</h1>
              <p className="text-gray-600 max-w-md mx-auto">
                To protect your personal data, we need to verify information about you, the customer. Please enter your
                details below.
              </p>
            </div>

            {/* Policy Number Display */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
              <div className="text-center">
                <p className="text-sm font-medium text-teal-700 mb-1">Policy Number</p>
                <p className="text-lg font-bold text-teal-900">{policyNumber}</p>
              </div>
            </div>

            

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-2">
                  Surname *
                </label>
                <Input
                  id="surname"
                  type="text"
                  value={formData.surname}
                  onChange={(e) => handleInputChange("surname", e.target.value)}
                  className={`w-full h-12 ${errors.surname ? "border-red-500" : ""}`}
                  required
                  autoComplete="family-name"
                />
                {errors.surname && <p className="text-red-500 text-xs mt-1">{errors.surname}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Input
                      ref={dayRef}
                      type="text"
                      value={formData.dateOfBirthDay}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 2)
                        handleInputChange("dateOfBirthDay", value)
                      }}
                      className={`w-full h-12 text-center ${errors.dateOfBirthDay ? "border-red-500" : ""}`}
                      placeholder="DD"
                      maxLength={2}
                      required
                      inputMode="numeric"
                      autoComplete="bday-day"
                    />
                    {errors.dateOfBirthDay && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirthDay}</p>}
                  </div>
                  <div>
                    <Input
                      ref={monthRef}
                      type="text"
                      value={formData.dateOfBirthMonth}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 2)
                        handleInputChange("dateOfBirthMonth", value)
                      }}
                      className={`w-full h-12 text-center ${errors.dateOfBirthMonth ? "border-red-500" : ""}`}
                      placeholder="MM"
                      maxLength={2}
                      required
                      inputMode="numeric"
                      autoComplete="bday-month"
                    />
                    {errors.dateOfBirthMonth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirthMonth}</p>}
                  </div>
                  <div>
                    <Input
                      ref={yearRef}
                      type="text"
                      value={formData.dateOfBirthYear}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                        handleInputChange("dateOfBirthYear", value)
                      }}
                      className={`w-full h-12 text-center ${errors.dateOfBirthYear ? "border-red-500" : ""}`}
                      placeholder="YYYY"
                      maxLength={4}
                      required
                      inputMode="numeric"
                      autoComplete="bday-year"
                    />
                    {errors.dateOfBirthYear && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirthYear}</p>}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Format: DD/MM/YYYY (e.g., 01/01/1980)</p>
              </div>

              <div>
                <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-2">
                  Postcode *
                </label>
                <Input
                  id="postcode"
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => handleInputChange("postcode", e.target.value.toUpperCase())}
                  className={`w-full h-12 ${errors.postcode ? "border-red-500" : ""}`}
                  required
                  autoComplete="postal-code"
                />
                {errors.postcode && <p className="text-red-500 text-xs mt-1">{errors.postcode}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 h-12 text-base font-semibold"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Verifying...
                  </>
                ) : (
                  "Access Documents"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Having trouble accessing your policy?{" "}
                <a href="/contact" className="text-teal-600 hover:text-teal-700">
                  Contact our support team
                </a>
              </p>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-3">Need Help?</h2>
            <div className="space-y-4 text-sm">
              <p>If you're having trouble accessing your policy documents, please ensure:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Your surname is entered exactly as it appears on your policy</li>
                <li>Your date of birth is in the correct format (DD/MM/YYYY)</li>
                <li>Your postcode is entered in capital letters with no spaces</li>
              </ul>
              <p>
                For further assistance, please{" "}
                <a href="/contact" className="text-teal-600 hover:underline">
                  fill out the contact form on our website
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Notification Container - This renders the actual popup notifications */}
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
    </div>
  )
}
