"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Shield, Clock, RefreshCw, KeyRound, Menu, X } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { NotificationContainer } from "@/components/notification"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth"

// Test accounts for validation
const TEST_ACCOUNTS = [
  { email: "test@monzic.com", password: "test123", isAdmin: false },
  { email: "admin@monzic.com", password: "admin123", isAdmin: true },
  { email: "user@monzic.com", password: "user123", isAdmin: false },
]

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [resetTimeLeft, setResetTimeLeft] = useState(60)
  const [canResendReset, setCanResendReset] = useState(false)
  const [resetRequestSubmitted, setResetRequestSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<(typeof TEST_ACCOUNTS)[0] | null>(null)

  const router = useRouter()
  const { login } = useAuth()
  const { notifications, removeNotification, showSuccess, showError, showInfo, showWarning } = useNotifications()

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

  // Timer for password reset resend
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (showForgotPassword && resetRequestSubmitted && resetTimeLeft > 0) {
      interval = setInterval(() => {
        setResetTimeLeft((time) => {
          if (time <= 1) {
            setCanResendReset(true)
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [showForgotPassword, resetRequestSubmitted, resetTimeLeft])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Validate credentials against test accounts
  const validateCredentials = (email: string, password: string) => {
    const account = TEST_ACCOUNTS.find((acc) => acc.email.toLowerCase() === email.toLowerCase())

    if (!account) {
      return { valid: false, message: "Account not found. Please check your email." }
    }

    if (account.password !== password) {
      return { valid: false, message: "Incorrect password. Please try again." }
    }

    return { valid: true, account }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form
      if (!formData.email || !formData.password) {
        showError("Missing Information", "Please fill in all required fields.")
        setIsLoading(false)
        return
      }

       // --- REGISTRATION LOGIC ---
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          showError("Password Mismatch", "The passwords you entered do not match.");
          setIsLoading(false);
          return;
        }
        if (!formData.agreeToTerms) {
          showWarning("Terms Required", "Please agree to the Terms of Service and Privacy Policy.");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          showError("Registration Failed", data.error || "An unknown error occurred.");
        } else {
          // Use the auth context to set user state and handle token
          login({
            id: data.user.id,
            email: data.user.email,
            isAdmin: data.user.role === "admin",
          }, data.token);

          showSuccess("Account Created!", "Your account has been created successfully!");
          setTimeout(() => router.push("/dashboard"), 1500);
        }
      }
      // For login, validate credentials
      else {
        if (!formData.email || !formData.password) {
          showError("Missing Information", "Please fill in all required fields.");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          showError("Authentication Failed", data.error || "Invalid credentials.");
        } else {
          // Use the auth context to set user state and handle token
          login({
            id: data.user.id,
            email: data.user.email,
            isAdmin: data.user.role === "admin",
          }, data.token);

          showSuccess("Login Successful!", "Welcome back! Redirecting...");
          setTimeout(() => router.push("/dashboard"), 1500);
        }
      }
    } catch (error) {
      console.error("Form submission error:", error)
      showError("Error", "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()

    if (!forgotPasswordEmail.trim()) {
      showError("Email Required", "Please enter your email address.")
      return
    }

    // Check if email exists in test accounts
    const accountExists = TEST_ACCOUNTS.some((acc) => acc.email.toLowerCase() === forgotPasswordEmail.toLowerCase())

    if (!accountExists) {
      showError("Account Not Found", "No account found with this email address.")
      return
    }

    showSuccess("Reset Email Sent", `Password reset instructions have been sent to ${forgotPasswordEmail}.`, 8000)

    setResetRequestSubmitted(true)
    setResetTimeLeft(60)
    setCanResendReset(false)
  }

  const handleResendPasswordReset = () => {
    setResetTimeLeft(60)
    setCanResendReset(false)
    showInfo("Reset Email Resent", "Password reset instructions have been sent again.")
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

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = verificationCode.join("")

    if (code.length !== 6) {
      showWarning("Incomplete Code", "Please enter the complete 6-digit verification code.")
      return
    }

    if (code === "000000" && currentUser) {
      try {
        // Set authentication cookies
        const expires = new Date()
        expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000) // 24 hours

        document.cookie = `userLoggedIn=true; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
        document.cookie = `userIsAdmin=${currentUser.isAdmin}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
        document.cookie = `userEmail=${currentUser.email}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`

        // Store in localStorage if remember me is checked
        if (rememberMe) {
          localStorage.setItem("userLoggedIn", "true")
          localStorage.setItem("userEmail", currentUser.email)
          localStorage.setItem("userIsAdmin", String(currentUser.isAdmin))
          localStorage.setItem("rememberMe", "true")
        } else {
          sessionStorage.setItem("userLoggedIn", "true")
          sessionStorage.setItem("userEmail", currentUser.email)
          sessionStorage.setItem("userIsAdmin", String(currentUser.isAdmin))
        }

        // Use the auth context
        login({
          id: `user-${Date.now()}`,
          email: currentUser.email,
          isAdmin: currentUser.isAdmin,
        })

        showSuccess(
          isLogin ? "Login Successful!" : "Account Created!",
          isLogin ? "Welcome back! Redirecting to dashboard..." : "Your account has been created successfully!",
        )

        setShowVerification(false)

        // Redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } catch (error) {
        console.error("Authentication error:", error)
        showError("Authentication Error", "An error occurred during authentication.")
      }
    } else {
      showError("Invalid Code", "The verification code is incorrect. Please try again.")
      setVerificationCode(["", "", "", "", "", ""])
      const firstInput = document.getElementById("code-0")
      firstInput?.focus()
    }
  }

  const handleResendCode = () => {
    setTimeLeft(60)
    setCanResend(false)
    setVerificationCode(["", "", "", "", "", ""])
    showInfo("Verification Code Resent", "A new verification code has been sent to your email.")
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
    setShowVerification(false)
    setShowForgotPassword(false)
    setRememberMe(false)
    setCurrentUser(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex flex-col">
      {/* Header */}
      <header className="bg-teal-600 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center shadow-md relative">
        <div className="flex items-center">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-white hover:text-teal-100 transition-colors">
            MONZIC
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-3">
          <Link href="/ai-documents">
            <Button className="bg-white hover:bg-gray-100 text-teal-600 font-medium">AI Documents</Button>
          </Link>
          <Link href="/contact">
            <Button
              variant="outline"
              className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent"
            >
              Contact
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-white hover:bg-teal-700 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-teal-600 border-t border-teal-500 md:hidden z-50">
            <div className="px-4 py-3 space-y-2">
              <Link href="/ai-documents" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-white hover:bg-gray-100 text-teal-600 font-medium justify-start h-12">
                  AI Documents
                </Button>
              </Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent justify-start h-12"
                >
                  Contact
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-6 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">{isLogin ? "Welcome Back" : "Join MONZIC"}</h2>
              <p className="text-teal-100 text-sm">
                {isLogin ? "Sign in to your account" : "Create your account to get started"}
              </p>
            </div>

            {/* Testing Credentials Notice */}
            {isLogin && (
              <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Testing Credentials</p>
                    <p className="mb-1">
                      <strong>Email:</strong> test@monzic.com
                    </p>
                    <p>
                      <strong>Password:</strong> test123
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Content */}
            <div className="px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name fields for signup */}
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          placeholder="John"
                          className="pl-10 h-12 border-2 border-gray-200 focus:border-teal-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          placeholder="Doe"
                          className="pl-10 h-12 border-2 border-gray-200 focus:border-teal-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Email field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your@email.com"
                      className="pl-11 h-12 border-2 border-gray-200 focus:border-teal-500"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder={isLogin ? "Enter password" : "Create password"}
                      className="pl-11 pr-11 h-12 border-2 border-gray-200 focus:border-teal-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me checkbox for login */}
                {isLogin && (
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-5 w-5 text-teal-600 border-2 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="remember-me" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Keep me signed in
                    </label>
                    <Shield className="w-4 h-4 text-teal-600 ml-auto" />
                  </div>
                )}

                {/* Confirm Password field for signup */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        placeholder="Confirm password"
                        className="pl-11 pr-11 h-12 border-2 border-gray-200 focus:border-teal-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Terms agreement for signup */}
                {!isLogin && (
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms-agreement"
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                      className="mt-1 h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 flex-shrink-0"
                      required
                    />
                    <label htmlFor="terms-agreement" className="text-sm text-gray-600 leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms-of-services" className="text-teal-600 hover:text-teal-700 underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy-policy" className="text-teal-600 hover:text-teal-700 underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                )}

                {/* Forgot password for login */}
                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true)
                        setResetRequestSubmitted(false)
                      }}
                      className="text-sm text-teal-600 hover:text-teal-700 underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Toggle between login/signup */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button onClick={toggleMode} className="text-teal-600 hover:text-teal-700 font-semibold underline">
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Popup */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h3>
              <p className="text-gray-600 text-sm">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-11 h-12 border-2 border-gray-200 focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Testing Mode</p>
                    <p>Password reset emails are simulated. Check console for logs.</p>
                  </div>
                </div>
              </div>

              {resetRequestSubmitted && (
                <div className="text-center">
                  {canResendReset ? (
                    <button
                      type="button"
                      onClick={handleResendPasswordReset}
                      className="text-orange-600 hover:text-orange-700 font-semibold underline flex items-center justify-center space-x-2 mx-auto text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Resend Reset Email</span>
                    </button>
                  ) : (
                    <p className="text-gray-500 text-sm flex items-center justify-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Resend available in {formatTime(resetTimeLeft)}</span>
                    </p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white h-12 font-semibold"
              >
                Send Reset Instructions
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowForgotPassword(false)
                  setForgotPasswordEmail("")
                  setResetTimeLeft(60)
                  setCanResendReset(false)
                  setResetRequestSubmitted(false)
                }}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      )}

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

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Testing Mode</p>
                    <p>
                      For testing purposes, use code: <strong>000000</strong>
                    </p>
                  </div>
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

      {/* Notification Container */}
      <NotificationContainer notifications={notifications} onClose={removeNotification} />

      {/* Footer */}
      <footer className="bg-teal-600 py-4 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-white">
            <Link href="/privacy-policy" className="hover:text-teal-200 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-services" className="hover:text-teal-200 transition-colors">
              Terms of Services
            </Link>
            <Link href="/return-policy" className="hover:text-teal-200 transition-colors">
              Return Policy
            </Link>
          </div>
          <div className="text-center mt-2 text-xs text-teal-100">
            © 2025 Monzic Solutions Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
