"use client"



import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useAuth } from "@/context/auth"
import { Mail, User, ArrowRight, Shield, Clock, RefreshCw, Menu, X } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { NotificationContainer } from "@/components/notification"
import { useRouter } from "next/navigation"



import { useSettings } from "@/context/settings"

export default function LoginPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const { isAuthenticated, login, user } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showVerification, setShowVerification] = useState(false)
  const settings = useSettings()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)




  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    agreeToTerms: false,
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
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



  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.email) {
        showError("Missing Information", "Please fill in all required fields.")
        setIsLoading(false)
        return
      }

       // --- REGISTRATION LOGIC ---
      if (!isLogin) {
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
          }),
        });

        if (!response.ok) {
          showError("Registration Failed", "An unknown error occurred.");
        } else {
          showInfo("Verification Required", "Please check your email for a 6-digit verification code to complete your registration.");
          setUserEmail(formData.email); // Store email for verification modal
          setShowVerification(true); // Show the verification modal
          setTimeLeft(300); // Start 5-minute timer
          setCanResend(false);
        }
      }
      // For login, request a verification code
      else {
        if (!formData.email) {
          showError("Missing Information", "Please fill in your email address.");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/auth/request-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
          }),
        });

        if (!response.ok) {
          if (response.status === 404) {
            showError("Email Not Found", "This email is not registered. Please sign up or try a different email.");
          } else {
            showError("Authentication Failed", "Could not request verification code.");
          }
        } else {
          showInfo("Verification Required", "Please check your email for a 6-digit verification code to sign in.");
          setUserEmail(formData.email); // Store email for verification modal
          setShowVerification(true); // Show the verification modal
          setTimeLeft(300); // Start 5-minute timer
          setCanResend(false);
        }
      }
    } catch (error) {
      console.error("Form submission error:", error)
      showError("Error", "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }



  const handleVerificationCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerificationKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    if (/^\d{6}$/.test(pastedText)) {
      const newCode = pastedText.split('');
      setVerificationCode(newCode);
      const lastInput = document.getElementById('code-5');
      lastInput?.focus();
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = verificationCode.join("");

    if (code.length !== 6) {
      showWarning("Incomplete Code", "Please enter the complete 6-digit verification code.");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, code }),
      });
      
      const data = await response.json();

      console.log('data: ', data)

      if (!response.ok) {
        showError("Verification Failed", "An unknown error occurred.");
        setVerificationCode(["", "", "", "", "", ""]);
        document.getElementById("code-0")?.focus();
      } else {
        login({ user: data.user, token: data.token });
        showSuccess("Email Verified!", "Your account is now active. Proceeding to payment...");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Verification submission error:", error);
      showError("Error", "An error occurred during verification.");
    } finally {
      setIsVerifying(false);
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
      setVerificationCode(["", "", "", "", "", ""]);
      showInfo("Verification Code Resent", "A new verification code has been sent to your email.");
    } catch (error) {
      showError("Error", "Failed to resend code. Please try again.");
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      agreeToTerms: false,
    })
    setShowVerification(false)
    setRememberMe(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex flex-col">
      {/* Header */}
      <header className="bg-teal-600 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center shadow-md relative">
        <div className="flex items-center">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-white hover:text-teal-100 transition-colors">
            {settings?.siteName || "TEMPNOW"}
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
              <h2 className="text-2xl font-bold mb-2">{isLogin ? "Welcome Back" : `Join ${settings?.siteName || 'MONZIC'}`}</h2>
              <p className="text-teal-100 text-sm">
                {isLogin ? "Sign in to your account" : "Create your account to get started"}
              </p>
            </div>



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



      {/* Email Verification Popup */}
      {showVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm sm:max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h3>
              <p className="text-gray-600 text-sm">We've sent a 6-digit verification code to 6:</p>
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
                      onPaste={handlePaste}
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
                disabled={isVerifying}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white h-12 font-semibold flex items-center justify-center space-x-2"
              >
                {isVerifying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  "Verify Email"
                )}
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
            © {new Date().getFullYear()} {settings?.siteName || "Tempnow Solutions Ltd."}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
