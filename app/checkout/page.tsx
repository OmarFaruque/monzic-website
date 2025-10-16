"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { CreditCard, X, ChevronDown, ChevronUp, Shield, Clock, RefreshCw } from "lucide-react"
import { useAuth } from "@/context/auth"
import { useNotifications } from "@/hooks/use-notifications"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import usePaddle from "@/hooks/use-paddle"
import { AuthDialog } from "@/components/auth/auth-dialog"

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
  promoCode?: string;
}

interface Coupon {
  id: number;
  promoCode: string;
  discount: { type: 'percentage' | 'fixed'; value: number };
  minSpent: string | null;
  maxDiscount: string | null;
  quotaAvailable: string;
  usedQuota: string;
  totalUsage: string;
  expires: string | null;
  isActive: boolean;
  restrictions: {
    firstTimeOnly: boolean;
    maxUsesPerUser: number;
    validDays: string[];
    validHours: { start: string; end: string };
  } | null;
  matches: {
    lastName: string;
    dateOfBirth: string;
    registrations: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export default function CheckoutPage() {
  const { isAuthenticated, login, user } = useAuth()
  const { addNotification } = useNotifications()
  const router = useRouter()
  const { paddle, loading: isPaddleLoading } = usePaddle()
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null)
  const [useSameAddress, setUseSameAddress] = useState(true)
  const [showQuoteSummary, setShowQuoteSummary] = useState(false)
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [promo, setPromo] = useState<Coupon | null>(null)
  const [discountedTotal, setDiscountedTotal] = useState<number | null>(null)

  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState(Array(6).fill(""))
  const [timeLeft, setTimeLeft] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const [userEmail, setUserEmail] = useState("")

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
      const parsedData = JSON.parse(storedQuoteData)
      setQuoteData(parsedData)
      setDiscountedTotal(parsedData.total)
    } else {
      // Redirect back to quote page if no data found
      router.push("/get-quote")
    }
  }, [router])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (showVerification && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setCanResend(true)
            clearInterval(interval)
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [showVerification, timeLeft])

    

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateDiscountedTotal = (total: number, promo: Coupon | null) => {
    if (!promo || !promo.discount) {
      return total;
    }
  
    let discountAmount = 0;
    if (promo.discount.type === 'percentage') {
      discountAmount = total * (promo.discount.value / 100);
    } else if (promo.discount.type === 'fixed') {
      discountAmount = promo.discount.value;
    }
  
    if (promo.maxDiscount) {
      const maxDiscount = parseFloat(promo.maxDiscount);
      if (discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
      }
    }
  
    const newTotal = total - discountAmount;
    return newTotal > 0 ? newTotal : 0;
  }

  const handlePromoCode = async () => {
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

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promoCode: formData.promoCode,
          total: quoteData?.total,
        }),
      })

      const data = await response.json()

      console.log('dataiscoupon: ', data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to validate promo code")
      }

      const coupon: Coupon = data;
      if (typeof coupon.discount === 'string') {
        coupon.discount = JSON.parse(coupon.discount);
      }

      setPromo(coupon)

      if (quoteData) {
        const newTotal = calculateDiscountedTotal(quoteData.total, coupon)
        setDiscountedTotal(newTotal)

        const newQuoteData = { ...quoteData, promoCode: coupon.promoCode };
        setQuoteData(newQuoteData);
        localStorage.setItem('quoteData', JSON.stringify(newQuoteData));
      }

      addNotification({
        type: "success",
        title: "Promo Code Applied",
        message: `Successfully applied promo code ${data.promoCode}`,
      })
    } catch (error: any) {
      setPromo(null)
      if (quoteData) {
        setDiscountedTotal(quoteData.total)
        const newQuoteData = { ...quoteData, promoCode: undefined };
        setQuoteData(newQuoteData);
        localStorage.setItem('quoteData', JSON.stringify(newQuoteData));
      }
      addNotification({
        type: "error",
        title: "Invalid Code",
        message: error.message || "The promo code you entered is invalid or expired",
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleVerificationCodeChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleVerificationKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleResendCode = async () => {
    if (!userEmail) return;
    try {
      await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      setTimeLeft(300); // Reset timer to 5 minutes
      setCanResend(false);
      setVerificationCode(Array(6).fill(""));
      addNotification({type: "info", title: "Verification Code Resent", message: "A new verification code has been sent to your email."});
    } catch (error) {
      addNotification({type: "error", title: "Error", message: "Failed to resend code. Please try again."});
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = verificationCode.join("");

    console.log('code inside verrifycation submit: ', code)
    if (code.length !== 6) {
      addNotification({type: "warning", title: "Incomplete Code", message: "Please enter the complete 6-digit verification code."});
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, code }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        addNotification({type: "error", title: "Verification Failed", message: data.error || "An unknown error occurred."});
        setVerificationCode(Array(6).fill(""));
        document.getElementById("code-0")?.focus();
      } else {
        login({ user: data.user, token: data.token });
        addNotification({type: "success", title: "Email Verified!", message: "Your account is now active. Proceeding to payment..."});
        setShowVerification(false);
        
        await proceedToPayment(data.user);
      }
    } catch (error) {
      addNotification({type: "error", title: "Error", message: "An error occurred during verification."});
    }
  }

  const proceedToPayment = async (currentUser: any) => {
    addNotification({
      type: "info",
      title: "Redirecting",
      message: "Redirecting to payment processor...",
    });

    const activeProcessor = await getActivePaymentProcessor();
    
    switch (activeProcessor) {
      case "paddle":
        await redirectToPaddle(currentUser);
        break;
      case "stripe":
        redirectToStripe();
        break;
      case "mollie":
        redirectToMollie();
        break;
      default:
        break;
    }
    setIsSubmitting(false);
  }

  const handleCompletePayment = async () => {
    setIsSubmitting(true);

    if (!isAuthenticated) {
      if (!formData.email || !formData.password) {
        addNotification({
          type: "error",
          title: "Missing Information",
          message: "Please enter your email and password to create an account.",
        });
        setIsSubmitting(false);
        return;
      }

      try {
        const regResponse = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: quoteData?.customerData.firstName,
            lastName: quoteData?.customerData.lastName,
            email: formData.email,
            password: formData.password,
          }),
        });

        const regData = await regResponse.json();

        if (!regResponse.ok) {
          throw new Error(regData.error || "Registration failed");
        }
        
        addNotification({type: "info", title: "Verification Required", message: "Please check your email for a 6-digit verification code."});
        setUserEmail(formData.email);
        setShowVerification(true);
        setTimeLeft(300);
        setCanResend(false);
        setIsSubmitting(false);

      } catch (error: any) {
        addNotification({
          type: "error",
          title: "Registration Error",
          message: error.message,
        });
        setIsSubmitting(false);
      }
      return;
    }

    if (!formData.termsAccepted || !formData.accuracyConfirmed) {
      addNotification({
        type: "error",
        title: "Missing Information",
        message: "Please accept the terms and confirm accuracy before proceeding.",
      });
      setIsSubmitting(false);
      return;
    }

    await proceedToPayment(user);
  };

  const getActivePaymentProcessor = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      const data = await response.json()
      return data.settings?.payment?.activeProcessor || "paddle"
    } catch (error) {
      return "paddle" // fallback
    }
  }

  const redirectToPaddle = async (currentUser: any) => {
    if (!paddle) {
      addNotification({
        type: "error",
        title: "Payment Error",
        message: "Paddle is not available. Please try again later.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteData: {
            ...quoteData,
            total: discountedTotal,
          },
          user: currentUser,
        }),
      });

      const data = await response.json();

      if (data.priceId) {
        paddle.Checkout.open({
          items: [
            {
              priceId: data.priceId,
              quantity: 1,
            },
          ],
          customer: {
            email: currentUser.email,
          },
        });
      } else {
        addNotification({
          type: "error",
          title: "Payment Error",
          message: data.error || "Could not initiate payment. Please try again.",
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      addNotification({
        type: "error",
        title: "Payment Error",
        message: "An unexpected error occurred. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

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
                <div className="text-sm text-gray-500">Total: £{discountedTotal !== null ? discountedTotal.toFixed(2) : quoteData.total.toFixed(2)}</div>
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
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-medium">£{quoteData.total.toFixed(2)}</span>
                  </div>
                  {promo && discountedTotal !== null && (
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-gray-600">Discount ({promo.promoCode})</span>
                      <span className="text-gray-600">-£{(quoteData.total - discountedTotal).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>
                      £{discountedTotal !== null ? discountedTotal.toFixed(2) : quoteData.total.toFixed(2)}
                    </span>
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
                        <span className="font-medium text-blue-600">
                          {user?.firstName} {user?.lastName} ({user?.email})
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Already have an account with us?{" "}
                        <button
                          onClick={() => setIsAuthDialogOpen(true)}
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
                    <span className="text-xl font-bold">
                      £{discountedTotal !== null ? discountedTotal.toFixed(2) : quoteData.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Have promo code? </label>
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
                disabled={
                  !formData.termsAccepted || 
                  !formData.accuracyConfirmed || 
                  isSubmitting || 
                  isPaddleLoading || 
                  (!isAuthenticated && (!formData.email || !formData.password))
                }
              >
                {isPaddleLoading
                  ? 'Initializing Payment...'
                  : isSubmitting
                  ? 'Processing...'
                  : !isAuthenticated
                  ? 'Create Account & Pay'
                  : 'Complete Payment'}
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
                  {promo && discountedTotal !== null && (
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-gray-600">Discount ({promo.promoCode})</span>
                      <span className="text-gray-600">-£{(quoteData.total - discountedTotal).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>
                      £{discountedTotal !== null ? discountedTotal.toFixed(2) : quoteData.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Email Verification Popup */}
      {showVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm sm:max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h3>
              <p className="text-gray-600 text-sm">We've sent a 6-digit verification code to:</p>
              <p className="font-semibold text-teal-600 mt-1 break-all">{userEmail}</p>
            </div>

            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Enter Verification Code
                </label>
                <div className="flex justify-center space-x-2 flex-wrap">
                  {verificationCode.map((digit, index) => (
                    <Input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                      className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-200 focus:border-teal-500 rounded-lg"
                      autoComplete="off"
                    />
                  ))}
                </div>
              </div>

              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-teal-600 hover:text-teal-700 font-semibold underline flex items-center justify-center space-x-2 mx-auto text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Resend Code</span>
                  </button>
                ) : (
                  <p className="text-gray-500 text-sm flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Resend available in {formatTime(timeLeft)}</span>
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white h-12 font-semibold"
              >
                Verify Email
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setShowVerification(false)}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Cancel and go back
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        title="Welcome Back"
        description="Please enter your login details below."
        onSuccess={() => {
          setIsAuthDialogOpen(false);
        }}
      />
    </div>
  )
}