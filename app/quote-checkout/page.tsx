
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Shield, ChevronDown, ChevronUp, Lock, X, ArrowLeft, Info, RefreshCw, Clock } from "lucide-react"
import { useAuth } from "@/context/auth"
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"
import { VerificationCodeInput } from "@/components/verification-code-input"
import usePaddle from "@/hooks/use-paddle"
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

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
  restrictions: any | null;
  matches: any | null;
  createdAt: string;
  updatedAt: string;
}

function QuoteCheckoutPage() {
  const { isAuthenticated, login, user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [showSummary, setShowSummary] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [sameAsPersonal, setSameAsPersonal] = useState(true)
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null)
  const [quote, setQuote] = useState({})
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [promo, setPromo] = useState<Coupon | null>(null)
  const { paddle, loading: isPaddleLoading } = usePaddle()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPromoLoading, setIsPromoLoading] = useState(false)
  const [discountedTotal, setDiscountedTotal] = useState<number | null>(null)
  const [paymentProvider, setPaymentProvider] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();
  // Verification state
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [isLoginCompleted, setIsLoginCompleted] = useState(false)

  useEffect(() => {
    const fetchPaymentProvider = async () => {
      try {
        const response = await fetch("/api/settings/payment");
        const data = await response.json();
        if (response.ok) {
          setPaymentProvider(data.paymentProvider);
        } else {
          console.error("Failed to fetch payment provider");
        }
      } catch (error) {
        console.error("Error fetching payment provider:", error);
      }
    };

    fetchPaymentProvider();
  }, []);


  const [formData, setFormData] = useState({
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

  const [authData, setAuthData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  })

  useEffect(() => {
    if (isAuthenticated && isLoginCompleted) {
      handleCompletePayment();
      setIsLoginCompleted(false); // Reset the flag
    }
  }, [isAuthenticated, isLoginCompleted]);

  // Timer for verification resend
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (showVerification && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setCanResend(true)
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [showVerification, timeLeft])

  // Load quote data from localStorage on component mount
  useEffect(() => {
    const storedQuoteData = localStorage.getItem("quoteData")

    
    if (storedQuoteData) {
      const parsed = JSON.parse(storedQuoteData);
      if (typeof parsed.quoteData === 'string') {
        setQuoteData(JSON.parse(parsed.quoteData));
      } else {
        setQuoteData(parsed.quoteData);
      }
      setQuote(parsed)
    } else {
      // Redirect back to quote page if no data found
      router.push("/get-quote")
    }
  }, [router])



  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAuthInputChange = (field: string, value: string | boolean) => {
    setAuthData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateDiscountedTotal = (total: number, promo: Coupon) => {
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
  };

  const handlePromoCode = async () => {
    if (!formData.promoCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a promo code",
      })
      return
    }

    setIsPromoLoading(true);
    toast({
      title: "Processing",
      description: "Checking promo code...",
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

        const newQuoteData = { ...quoteData, promoCode: coupon.promoCode, update_price: newTotal };
        const updateQuote = {...quote, quoteData: newQuoteData}
        
        localStorage.setItem('quoteData', JSON.stringify(updateQuote));
        setQuoteData(updateQuote.quoteData);
        
      }

      toast({
        title: "Promo Code Applied",
        description: `Successfully applied promo code ${data.promoCode}`,
      })
    } catch (error: any) {
      setPromo(null)
      if (quoteData) {
        setDiscountedTotal(quoteData.total)
        const newQuoteData = { ...quoteData, promoCode: undefined };
        setQuoteData(newQuoteData);
        localStorage.setItem('quoteData', JSON.stringify(newQuoteData));
      }
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: error.message || "The promo code you entered is invalid or expired",
      })
    } finally {
      setIsPromoLoading(false);
    }
  }

  const handleCompletePayment = async () => {
    if (!isAuthenticated) {
      setAuthMode("signup");
      setLoginModalOpen(true);
      return;
    }

    if (!formData.termsAccepted || !formData.accuracyConfirmed) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please accept the terms and confirm accuracy before proceeding.",
      });
      return;
    }

    setIsProcessingPayment(true);

    if (paymentProvider === 'paddle') {
      toast({
        title: "Processing",
        description: "Preparing your payment...",
      });

      if (!paddle) {
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: "Paddle is not available. Please try again later.",
        });
        return;
      }

      try {
        const response = await fetch("/api/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteData: {
              ...quoteData,
              total: discountedTotal ?? quoteData?.total,
            },
            user: user,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create payment");
        }

        const data = await response.json();

        if (data.priceId) {
          paddle.Checkout.open({
            items: [
              {
                priceId: data.priceId,
                quantity: 1,
              },
            ]
          });
        } else {
          toast({
            variant: "destructive",
            title: "Payment Error",
            description: data.error || "Could not initiate payment. Please try again.",
          });
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error("Payment error:", error);
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: "There was a problem processing your payment. Please try again.",
        });
        setIsProcessingPayment(false);
      }
    } else if (paymentProvider === 'stripe') {
      if (!stripe || !elements) {
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: "Stripe is not available. Please try again later.",
        });
        setIsProcessingPayment(false);
        return;
      }

      try {
        const response = await fetch("/api/quote-checkout/create-stripe-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteData: {
              ...quoteData,
              total: discountedTotal ?? quoteData?.total,
            },
            user: user,
          }),
        });

        const { clientSecret, error: clientSecretError } = await response.json();

        if (clientSecretError) {
          toast({
            variant: "destructive",
            title: "Payment Error",
            description: clientSecretError.message || "Could not initiate payment. Please try again.",
          });
          setIsProcessingPayment(false);
          return;
        }

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
          toast({
            variant: "destructive",
            title: "Payment Error",
            description: "Card element not found. Please try again later.",
          });
          setIsProcessingPayment(false);
          return;
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

        if (error) {
          toast({
            variant: "destructive",
            title: "Payment Error",
            description: error.message || "An unexpected error occurred. Please try again.",
          });
        } else if (paymentIntent.status === 'succeeded') {
          toast({
            title: "Payment Successful",
            description: "Your payment has been processed successfully.",
          });
          window.location.href = "/payment-confirmation";
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: "An unexpected error occurred. Please try again.",
        });
      } finally {
        setIsProcessingPayment(false);
      }
    }
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "")
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ")
    return formatted.slice(0, 19)
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    handleInputChange("cardNumber", formatted)
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authData.email || !authData.password) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please enter both email and password." });
      return;
    }
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authData.email, password: authData.password }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.message === 'Please verify your email before logging in.') {
            setUserEmail(authData.email);
            setShowVerification(true);
            setLoginModalOpen(false);
        }
        throw new Error(data.error || "Login failed");
      }

      login({ user: data.user, token: data.token });
      setLoginModalOpen(false);
      setIsLoginCompleted(true); // Set login completed flag
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authData.email || !authData.password || !authData.confirmPassword) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please fill in all required fields." });
      return;
    }
    if (authData.password !== authData.confirmPassword) {
      toast({ variant: "destructive", title: "Password Mismatch", description: "Passwords do not match." });
      return;
    }
    try {
      const regResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: quoteData?.customerData.firstName,
          lastName: quoteData?.customerData.lastName,
          email: authData.email,
          password: authData.password,
        }),
      });
      const regData = await regResponse.json();
      if (!regResponse.ok) {
        throw new Error(regData.error || "Registration failed");
      }
      setUserEmail(authData.email);
      setShowVerification(true);
      setLoginModalOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: error.message });
    }
  };

  const handleVerificationCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit

    const newCode = [...verificationCode]
    newCode[index] = value

    setVerificationCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`checkout-code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleVerificationKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`checkout-code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = verificationCode.join("");

    if (code.length !== 6) {
      toast({variant: "destructive", title: "Incomplete Code", description: "Please enter the complete 6-digit verification code."});
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
        throw new Error(data.error || "Verification failed");
      }

      await login({
        user: {
          ...data.user,
          id: String(data.user.id), // convert number → string
        },
        token: data.token,
      });

      setShowVerification(false);
      setLoginModalOpen(false);
      setIsLoginCompleted(true); // Set login completed flag

    } catch (error: any) {
      toast({variant: "destructive", title: "Verification Failed", description: error.message});
      setVerificationCode(Array(6).fill(""));
      document.getElementById("checkout-code-0")?.focus();
    }
  }

  const handleResendCode = () => {
    setTimeLeft(60)
    setCanResend(false)
    setVerificationCode(["", "", "", "", "", ""])

    toast({
      title: "Verification Code Resent",
      description: "A new verification code has been sent to your email. Please check your inbox.",
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleBackToQuote = () => {
    router.push("/get-quote")
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-teal-600 px-4 sm:px-6 py-3 sm:py-4 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-xl sm:text-2xl font-bold text-white cursor-pointer hover:text-teal-100 transition-colors">
                MONZIC
              </h1>
            </Link>
          </div>

          <div className="flex gap-2 md:gap-3">
            <Link href="/contact">
              <Button
                variant="outline"
                className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent text-sm md:text-base px-3 md:px-4"
              >
                CONTACT
              </Button>
            </Link>
            {!isAuthenticated ? (
              <Button
                onClick={() => setLoginModalOpen(true)}
                className="bg-white hover:bg-gray-100 text-teal-600 font-medium text-sm md:text-base px-3 md:px-4"
              >
                SIGN IN
              </Button>
            ) : (
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent text-sm md:text-base px-3 md:px-4"
                >
                  DASHBOARD
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="mb-4 sm:mb-6">
            <Button
              onClick={handleBackToQuote}
              variant="outline"
              className="flex items-center space-x-2 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quote</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Payment & Billing */}
            <div className="lg:col-span-2 space-y-6">
              {/* Secure Checkout Header */}
              <div className="flex items-center space-x-2 mb-2">
                <Lock className="w-5 h-5 text-teal-600" />
                <h1 className="text-xl font-bold text-gray-900">Secure Checkout</h1>
              </div>

              {/* Information Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">INFORMATION</h2>

                {isAuthenticated ? (
                  <div>
                    <p className="text-gray-700">
                      You are currently logged in as <span className="font-semibold">{user?.email || "User"}</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Already have an account?{" "}
                      <button
                        onClick={() => setLoginModalOpen(true)}
                        className="text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Sign in
                      </button>
                    </p>
                    <div>
                      <Input
                        type="email"
                        value={authData.email}
                        onChange={(e) => handleAuthInputChange("email", e.target.value)}
                        placeholder="Email Address"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Input
                        type="password"
                        value={authData.password}
                        onChange={(e) => handleAuthInputChange("password", e.target.value)}
                        placeholder="Password"
                        className="w-full"
                      />
                    </div>
                    <p className="text-xs text-gray-500">We'll create an account for you to track your policy</p>
                  </div>
                )}
              </div>

              {/* Payment Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">PAYMENT</h2>

                {/* Price */}
                <div className="text-2xl font-bold text-gray-900 mb-6">£{(discountedTotal ?? quoteData?.total ?? 0).toFixed(2)}</div>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Have promo code? d</label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Input
                      type="text"
                      value={formData.promoCode}
                      onChange={(e) => handleInputChange("promoCode", e.target.value)}
                      placeholder="Promo code"
                      className="flex-1"
                    />
                    <Button onClick={handlePromoCode} variant="outline" className="px-6" disabled={isPromoLoading}>
                      {isPromoLoading ? "Applying..." : "Apply"}
                    </Button>
                  </div>
                  {promo && discountedTotal !== null && (
                    <div className="mt-2 text-sm text-green-600">
                      Discount applied: -£{((quoteData?.total ?? 0) - discountedTotal).toFixed(2)}
                    </div>
                  )}
                </div>

                {paymentProvider === 'stripe' && (
                  <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <CardElement options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }} />
                  </div>
                )}

                {/* Important Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Important Notice:</strong> Please avoid using an <strong>@outlook.com</strong> or{" "}
                    <strong>@icloud.com</strong> email address for your order. We are currently experiencing issues with
                    sending emails to these domains. Thank you for your understanding.
                  </p>
                </div>
              </div>

              {/* Billing Details Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">BILLING DETAILS</h2>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="same-address"
                      checked={sameAsPersonal}
                      onCheckedChange={(checked) => setSameAsPersonal(checked as boolean)}
                    />
                    <label htmlFor="same-address" className="text-sm text-gray-700">
                      Same as personal address
                    </label>
                  </div>

                  {!sameAsPersonal && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                        <Input
                          type="text"
                          value={formData.billingAddress1}
                          onChange={(e) => handleInputChange("billingAddress1", e.target.value)}
                          className="w-full"
                          placeholder="Street address"
                          required={!sameAsPersonal}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                        <Input
                          type="text"
                          value={formData.billingAddress2}
                          onChange={(e) => handleInputChange("billingAddress2", e.target.value)}
                          className="w-full"
                          placeholder="Apartment, suite, unit, etc. (optional)"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City/Town *</label>
                          <Input
                            type="text"
                            value={formData.billingCity}
                            onChange={(e) => handleInputChange("billingCity", e.target.value)}
                            className="w-full"
                            placeholder="City"
                            required={!sameAsPersonal}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Postcode *</label>
                          <Input
                            type="text"
                            value={formData.billingPostcode}
                            onChange={(e) => handleInputChange("billingPostcode", e.target.value)}
                            className="w-full"
                            placeholder="Postcode"
                            required={!sameAsPersonal}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                        <Select
                          value={formData.billingCountry}
                          onValueChange={(value) => handleInputChange("billingCountry", value)}
                        >
                          <SelectTrigger className="w-full">
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
              </div>

              {/* Terms and Conditions */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => handleInputChange("termsAccepted", checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I confirm I've read and agree to the{" "}
                      <Link href="/terms-of-services" className="text-teal-600 hover:text-teal-700">
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
                    />
                    <label htmlFor="accuracy" className="text-sm text-gray-700">
                      I acknowledge that all purchases are final and the information I have entered is accurate *
                    </label>
                  </div>
                </div>

                {/* Complete Payment Button */}
                <Button
                  onClick={handleCompletePayment}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-lg font-semibold mt-6"
                  disabled={
                    !formData.termsAccepted ||
                    !formData.accuracyConfirmed ||
                    isProcessingPayment ||
                    (!isAuthenticated && (!authData.email || !authData.password))
                  }
                >
                  {isProcessingPayment ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : !isAuthenticated ? (
                    'Create Account & Pay'
                  ) : (
                    `Complete Payment - £${(discountedTotal ?? quoteData?.total ?? 0).toFixed(2)}`
                  )}
                </Button>

                {/* Security Badge */}
                <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Secure & Encrypted</span>
                </div>
              </div>
            </div>

            {/* Right Column - Quote Summary */}
            <div className="lg:col-span-1">
              {/* Mobile Toggle */}
              <div className="lg:hidden mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSummary(!showSummary)}
                  className="w-full flex justify-between items-center"
                >
                  <span>Coverage Details</span>
                  {showSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>

              {/* Quote Summary - Hidden on mobile unless toggled */}
              <div className={`${showSummary ? "block" : "hidden"} lg:block`}>
                <div className="bg-white rounded-lg p-6 shadow-sm sticky top-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-base font-medium text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-teal-600">£{(discountedTotal ?? quoteData?.total ?? 0).toFixed(2)}</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-medium">
                        {quoteData?.customerData?.vehicle?.year} {quoteData?.customerData?.vehicle?.make}{" "}
                        {quoteData?.customerData?.vehicle?.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registration:</span>
                      <span className="font-medium">{quoteData.customerData.registration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{quoteData.breakdown.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Time:</span>
                      <span className="font-medium">{quoteData.startTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expiry Time:</span>
                      <span className="font-medium">{quoteData.expiryTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium">{quoteData.breakdown.reason}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-600">
                      <Info className="w-3 h-3 mr-1" />
                      <span>Need help? Contact support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Login/Signup Modal */}
      {loginModalOpen && !showVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {authMode === "login" ? "WELCOME BACK" : "CREATE ACCOUNT"}
                </h2>
                <button onClick={() => setLoginModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {authMode === "login" && (
                <p className="text-sm text-gray-600 mb-6">Please enter your login details below.</p>
              )}

              {authMode === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      value={authData.email}
                      onChange={(e) => handleAuthInputChange("email", e.target.value)}
                      placeholder="Email Address"
                      className="w-full h-12"
                      required
                    />
                  </div>

                  <div>
                    <Input
                      type="password"
                      value={authData.password}
                      onChange={(e) => handleAuthInputChange("password", e.target.value)}
                      placeholder="Password"
                      className="w-full h-12"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={authData.rememberMe}
                        onCheckedChange={(checked) => handleAuthInputChange("rememberMe", checked as boolean)}
                      />
                      <label htmlFor="remember-me" className="text-sm text-gray-700">
                        Remember Me
                      </label>
                    </div>

                    <button type="button" className="text-sm text-teal-600 hover:text-teal-700">
                      Forgot Password?
                    </button>
                  </div>

                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 text-base">
                    Login
                  </Button>

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      onClick={() => setLoginModalOpen(false)}
                      variant="outline"
                      className="flex-1 h-12"
                    >
                      Close
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      variant="outline"
                      className="flex-1 h-12"
                    >
                      Sign Up
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">Create an account to continue with your purchase.</p>

                  <div>
                    <Input
                      type="email"
                      value={authData.email}
                      onChange={(e) => handleAuthInputChange("email", e.target.value)}
                      placeholder="Email Address"
                      className="w-full h-12"
                      required
                    />
                  </div>

                  <div>
                    <Input
                      type="password"
                      value={authData.password}
                      onChange={(e) => handleAuthInputChange("password", e.target.value)}
                      placeholder="Password"
                      className="w-full h-12"
                      required
                    />
                  </div>

                  <div>
                    <Input
                      type="password"
                      value={authData.confirmPassword}
                      onChange={(e) => handleAuthInputChange("confirmPassword", e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full h-12"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me-signup"
                      checked={authData.rememberMe}
                      onCheckedChange={(checked) => handleAuthInputChange("rememberMe", checked as boolean)}
                    />
                    <label htmlFor="remember-me-signup" className="text-sm text-gray-700">
                      Remember Me
                    </label>
                  </div>

                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 text-base">
                    Create Account
                  </Button>

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      onClick={() => setLoginModalOpen(false)}
                      variant="outline"
                      className="flex-1 h-12"
                    >
                      Close
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      variant="outline"
                      className="flex-1 h-12"
                    >
                      Login
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Popup */}
      {showVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                We've sent a 6-digit verification code to:
              </p>
              <p className="font-semibold text-teal-600 mt-1 text-sm sm:text-base break-all">{userEmail}</p>
            </div>

            <form onSubmit={handleVerificationSubmit} className="space-y-4 sm:space-y-6">
              {/* Verification Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Enter Verification Code
                </label>
                <VerificationCodeInput
                  value={verificationCode}
                  onChange={handleVerificationCodeChange}
                  onKeyDown={handleVerificationKeyDown}
                  idPrefix="checkout-code"
                />
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-blue-800">
                    <p className="font-medium mb-1">Check your email inbox</p>
                    <p>
                      If you don't see the email, please check your <strong>spam/junk folder</strong>. The email may
                      take a few minutes to arrive.
                    </p>
                  </div>
                </div>
              </div>

              {/* Testing Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-yellow-800">
                    <p className="font-medium mb-1">Testing Mode</p>
                    <p>
                      For testing purposes, use code: <strong>0-0-0-0-0-0</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Resend Code */}
              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-teal-600 hover:text-teal-700 font-semibold underline flex items-center justify-center space-x-2 mx-auto text-xs sm:text-sm"
                  >
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Resend Code</span>
                  </button>
                ) : (
                  <p className="text-gray-500 text-xs sm:text-sm flex items-center justify-center space-x-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Resend available in {formatTime(timeLeft)}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white h-10 sm:h-12 font-semibold text-sm sm:text-base"
              >
                Verify Email
              </Button>
            </form>

            {/* Cancel Button */}
            <div className="mt-3 sm:mt-4 text-center">
              <button
                onClick={() => {
                  setShowVerification(false)
                  setLoginModalOpen(true)
                }}
                className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm underline"
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function QuoteCheckoutPageWrapper() {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        const stripeKeyResponse = await fetch("/api/settings/stripe");
        const stripeKeyData = await stripeKeyResponse.json();
        if (stripeKeyResponse.ok) {
          setStripePromise(loadStripe(stripeKeyData.publishableKey));
        }
      } catch (error) {
        console.error("Error fetching stripe key:", error);
      }
    };

    fetchStripeKey();
  }, []);

  return (
    <Elements stripe={stripePromise}>
      <QuoteCheckoutPage />
    </Elements>
  );
}
