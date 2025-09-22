"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { CreditCard, X, ChevronDown, ChevronUp } from "lucide-react"
import { useAuth } from "../auth-provider"
import { useNotifications } from "@/hooks/use-notifications"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"

interface QuoteData {
  total: number
  startTime: string
  expiryTime: string
  breakdown: {
    duration: string
    reason: string
  }
  customerData: {
    firstName: string
    middleName: string
    lastName: string
    dateOfBirth: string
    phoneNumber: string
    occupation: string
    address: string
    licenseType: string
    licenseHeld: string
    vehicleValue: string
    reason: string
    duration: string
    registration: string
    vehicle: {
      make: string
      model: string
      year: string
      engineCC: string
    }
  }
}

export default function CheckoutPage() {
  const { isAuthenticated, login } = useAuth()
  const { addNotification } = useNotifications()
  const router = useRouter()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null)
  const [useSameAddress, setUseSameAddress] = useState(true)
  const [showQuoteSummary, setShowQuoteSummary] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    promoCode: "",
    termsAccepted: false,
    accuracyConfirmed: false,
    cardNumber: "",
    nameOnCard: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    billingAddress1: "",
    billingAddress2: "",
    billingCity: "",
    billingPostcode: "",
    billingCountry: "United Kingdom",
  })

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  // Load quote data from localStorage on component mount
  useEffect(() => {
    const storedQuoteData = localStorage.getItem("quoteData")
    if (storedQuoteData) {
      setQuoteData(JSON.parse(storedQuoteData))
    } else {
      // Redirect back to quote page if no data found
      router.push("/get-quote")
    }
  }, [router])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePromoCode = () => {
    if (!formData.promoCode) {
      addNotification({
        type: "error",
        title: "Error",
        message: "Please enter a promo code",
      })
      return
    }

    addNotification({
      type: "info",
      title: "Processing",
      message: "Checking promo code...",
    })

    // Simulate API call
    setTimeout(() => {
      addNotification({
        type: "error",
        title: "Invalid Code",
        message: "The promo code you entered is invalid or expired",
      })
    }, 1500)
  }

  const handleCompletePayment = async () => {
    // Basic validation only
    if (!isAuthenticated && !formData.email) {
      addNotification({
        type: "error",
        title: "Missing Information",
        message: "Please enter your email address.",
      })
      return
    }

    if (!isAuthenticated && !formData.password) {
      addNotification({
        type: "error",
        title: "Missing Information",
        message: "Please enter a password to create your account.",
      })
      return
    }

    if (!formData.termsAccepted || !formData.accuracyConfirmed) {
      addNotification({
        type: "error",
        title: "Missing Information",
        message: "Please accept the terms and confirm accuracy before proceeding.",
      })
      return
    }

    addNotification({
      type: "info",
      title: "Redirecting",
      message: "Redirecting to payment processor...",
    })

    // Get active payment processor from settings
    const activeProcessor = await getActivePaymentProcessor()

    // Capture IP address for audit
    const ipAddress = await fetch("/api/get-client-ip")
      .then((r) => r.json())
      .then((d) => d.ip)

    // Redirect based on active processor
    switch (activeProcessor) {
      case "paddle":
        redirectToPaddle()
        break
      case "stripe":
        redirectToStripe()
        break
      case "mollie":
        redirectToMollie()
        break
      default:
        router.push("/payment-confirmation")
    }
  }

  const getActivePaymentProcessor = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      const data = await response.json()
      return data.settings?.payment?.activeProcessor || "paddle"
    } catch (error) {
      return "paddle" // fallback
    }
  }

  const redirectToPaddle = () => {
    setTimeout(() => {
      router.push("/payment-confirmation")
    }, 1500)
  }

  const redirectToStripe = () => {
    setTimeout(() => {
      router.push("/payment-confirmation")
    }, 1500)
  }

  const redirectToMollie = () => {
    setTimeout(() => {
      router.push("/payment-confirmation")
    }, 1500)
  }

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "")
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ")
    return formatted.slice(0, 19)
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    handleInputChange("cardNumber", formatted)
  }

  // Generate array of months (01-12)
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    return month < 10 ? `0${month}` : `${month}`
  })

  // Generate array of years (current year + 10 years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => `${currentYear + i}`)

  // Show loading if quote data hasn't loaded yet
  if (!quoteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Quote Summary Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowQuoteSummary(!showQuoteSummary)}
              className="w-full bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex justify-between items-center"
            >
              <div className="text-left">
                <div className="font-medium text-gray-900">Order Summary</div>
                <div className="text-sm text-gray-500">Total: £{quoteData.total.toFixed(2)}</div>
              </div>
              {showQuoteSummary ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showQuoteSummary && (
              <div className="mt-4 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">DETAILS</h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-600">Registration:</span>
                    <span className="font-medium text-blue-600">{quoteData.customerData.registration}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">
                      {quoteData.customerData.vehicle.make} {quoteData.customerData.vehicle.model}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-600">Start Time:</span>
                    <span className="font-medium">{quoteData.startTime}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-600">End Time:</span>
                    <span className="font-medium">{quoteData.expiryTime}</span>
                  </div>
                </div>
                <div className="border-t border-gray-300 mt-4 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>£{quoteData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Checkout Form */}
            <div className="space-y-6 lg:space-y-8">
              {/* Information Section */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">INFORMATION</h2>
                <div className="space-y-4">
                  {isAuthenticated ? (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        You are currently logged in as:{" "}
                        <span className="font-medium text-blue-600">John Doe (john.doe@example.com)</span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Already have an account with us?{" "}
                        <button
                          onClick={() => setLoginModalOpen(true)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Login
                        </button>
                      </p>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Email Address"
                        className="w-full h-12 text-base"
                        required
                      />
                    </div>
                  )}
                  {!isAuthenticated && (
                    <p className="text-sm text-gray-600">If you do not have an account, we will create one for you</p>
                  )}
                </div>
              </div>

              {/* Payment Section */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">PAYMENT</h2>
                <p className="text-sm text-gray-600 mb-4">All transactions are secure and encrypted.</p>

                {/* Amount */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">Amount:</span>
                    <span className="text-xl font-bold">£{quoteData.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Have promo code?</label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Input
                      type="text"
                      value={formData.promoCode}
                      onChange={(e) => handleInputChange("promoCode", e.target.value)}
                      placeholder="Promo code"
                      className="flex-1 h-12 text-base"
                    />
                    <Button
                      onClick={handlePromoCode}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 h-12 w-full sm:w-auto"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-4 h-4 border-2 border-blue-600 rounded-full bg-blue-600"></div>
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Credit/Debit Payment</span>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 text-center">
                      You will be redirected to our secure payment processor to complete your transaction.
                    </p>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="space-y-4 mb-6">
                  <h3 className="font-medium text-gray-900">Billing Address</h3>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="same-address"
                      checked={useSameAddress}
                      onCheckedChange={(checked) => setUseSameAddress(checked as boolean)}
                    />
                    <label htmlFor="same-address" className="text-sm text-gray-700">
                      Use same as personal address
                    </label>
                  </div>

                  {!useSameAddress && (
                    <div className="space-y-4">
                      <div>
                        <Input
                          type="text"
                          value={formData.billingAddress1}
                          onChange={(e) => handleInputChange("billingAddress1", e.target.value)}
                          className="w-full h-12 text-base"
                          placeholder="Address Line 1"
                          required
                        />
                      </div>

                      <div>
                        <Input
                          type="text"
                          value={formData.billingAddress2}
                          onChange={(e) => handleInputChange("billingAddress2", e.target.value)}
                          className="w-full h-12 text-base"
                          placeholder="Address Line 2 (Optional)"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          type="text"
                          value={formData.billingCity}
                          onChange={(e) => handleInputChange("billingCity", e.target.value)}
                          className="w-full h-12 text-base"
                          placeholder="City"
                          required
                        />

                        <Input
                          type="text"
                          value={formData.billingPostcode}
                          onChange={(e) => handleInputChange("billingPostcode", e.target.value)}
                          className="w-full h-12 text-base"
                          placeholder="Postcode"
                          required
                        />
                      </div>

                      <div>
                        <Select
                          value={formData.billingCountry}
                          onValueChange={(value) => handleInputChange("billingCountry", value)}
                        >
                          <SelectTrigger className="w-full h-12 text-base">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                            <SelectItem value="United States">United States</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                            <SelectItem value="France">France</SelectItem>
                            <SelectItem value="Germany">Germany</SelectItem>
                            <SelectItem value="Spain">Spain</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Important Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Important Notice:</strong> Please avoid using an <strong>@outlook.com</strong> or{" "}
                    <strong>@icloud.com</strong> email address for your order. We are currently experiencing issues with
                    sending emails to these domains. Thank you for your understanding.
                  </p>
                </div>
              </div>

              {/* Create Account Password */}
              {!isAuthenticated && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">CREATE AN ACCOUNT PASSWORD</h2>
                  <div className="space-y-4">
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Password"
                      className="w-full h-12 text-base"
                      required
                    />
                    <p className="text-sm text-gray-600">
                      Your personal data will be used to process your order, support your experience throughout this
                      website, and for other purposes described in our{" "}
                      <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-700">
                        privacy policy
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => handleInputChange("termsAccepted", checked as boolean)}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                    I confirm I've read and agree to the{" "}
                    <Link href="/terms-of-services" className="text-blue-600 hover:text-blue-700">
                      Terms of Service
                    </Link>{" "}
                    and understand this is a non-refundable digital document service. *
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="accuracy"
                    checked={formData.accuracyConfirmed}
                    onCheckedChange={(checked) => handleInputChange("accuracyConfirmed", checked as boolean)}
                    className="mt-1"
                  />
                  <label htmlFor="accuracy" className="text-sm text-gray-700 leading-relaxed">
                    I acknowledge that all purchases are final and the information I have entered is accurate *
                  </label>
                </div>
              </div>

              {/* Complete Payment Button */}
              <Button
                onClick={handleCompletePayment}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 text-lg font-semibold h-14"
                disabled={!formData.termsAccepted || !formData.accuracyConfirmed}
              >
                Complete Payment
              </Button>
            </div>

            {/* Right Column - Quote Summary (Desktop Only) */}
            <div className="hidden lg:block">
              <div className="bg-gray-100 rounded-lg p-6 sticky top-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">DETAILS</h2>

                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-600">Registration Number:</span>
                    <span className="font-medium text-blue-600">{quoteData.customerData.registration}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-600">Vehicle Make:</span>
                    <span className="font-medium">{quoteData.customerData.vehicle.make}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-600">Vehicle Model:</span>
                    <span className="font-medium">{quoteData.customerData.vehicle.model}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-600">Start Time:</span>
                    <span className="font-medium">{quoteData.startTime}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-600">End Time:</span>
                    <span className="font-medium">{quoteData.expiryTime}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-600">Date of Birth:</span>
                    <span className="font-medium">{quoteData.customerData.dateOfBirth}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-600">Name(s):</span>
                    <span className="font-medium">
                      {quoteData.customerData.firstName} {quoteData.customerData.lastName}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">{quoteData.customerData.address}</span>
                  </div>
                </div>

                <div className="border-t border-gray-300 mt-6 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-medium">£{quoteData.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>£{quoteData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Login Modal */}
      {loginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">WELCOME BACK</h2>
                <button onClick={() => setLoginModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6">Please enter your login details below.</p>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()

                  // Simulate login process
                  if (loginData.email && loginData.password) {
                    addNotification({
                      type: "info",
                      title: "Logging in",
                      message: "Please wait...",
                    })

                    // Simulate API call
                    setTimeout(() => {
                      // For demo purposes, accept any email/password
                      login() // This calls the login function from useAuth
                      addNotification({
                        type: "success",
                        title: "Login Successful",
                        message: "Welcome back!",
                      })
                      setLoginModalOpen(false)

                      // Reset form
                      setLoginData({
                        email: "",
                        password: "",
                        rememberMe: false,
                      })
                    }, 1000)
                  } else {
                    addNotification({
                      type: "error",
                      title: "Missing Information",
                      message: "Please enter both email and password",
                    })
                  }
                }}
              >
                <div>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-12 text-base"
                    value={loginData.email}
                    onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    className="w-full h-12 text-base"
                    value={loginData.password}
                    onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={loginData.rememberMe}
                      onCheckedChange={(checked) =>
                        setLoginData((prev) => ({ ...prev, rememberMe: checked as boolean }))
                      }
                    />
                    <label htmlFor="remember-me" className="text-sm text-gray-700">
                      Remember Me
                    </label>
                  </div>

                  <button type="button" className="text-sm text-blue-600 hover:text-blue-700 text-left sm:text-right">
                    Forgot Password?
                  </button>
                </div>

                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 text-base">
                  Login
                </Button>

                <Button
                  type="button"
                  onClick={() => setLoginModalOpen(false)}
                  variant="outline"
                  className="w-full h-12"
                >
                  Close
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
