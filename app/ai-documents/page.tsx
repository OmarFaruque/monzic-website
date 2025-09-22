"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  Download,
  Sparkles,
  Paperclip,
  Edit3,
  FileText,
  Tag,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  Shield,
  X,
  Menu,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react"

// Test accounts for validation
const TEST_ACCOUNTS = [
  { email: "test@monzic.com", password: "test123", isAdmin: false },
  { email: "admin@monzic.com", password: "admin123", isAdmin: true },
  { email: "user@monzic.com", password: "user123", isAdmin: false },
]

export default function AIDocumentsPage() {
  const [documentRequest, setDocumentRequest] = useState("")
  const [generatedText, setGeneratedText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showOutput, setShowOutput] = useState(false)
  const [showPaymentPopup, setShowPaymentPopup] = useState(false)
  const [showSignInPopup, setShowSignInPopup] = useState(false)
  const [tipAmount, setTipAmount] = useState(0)
  const [discountCode, setDiscountCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState(null)
  const [expandedSection, setExpandedSection] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Sign in form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [signInError, setSignInError] = useState("")
  const [showSignUp, setShowSignUp] = useState(false)
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [signUpError, setSignUpError] = useState("")
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState("")

  // Card details
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [postalCode, setPostalCode] = useState("")

  const documentPrice = 10

  // Memoize discount codes to prevent re-creation
  const discountCodes = useMemo(
    () => ({
      WELCOME10: { type: "percentage", value: 10, description: "10% off" },
      SAVE5: { type: "fixed", value: 5, description: "£5 off" },
      STUDENT: { type: "percentage", value: 20, description: "20% student discount" },
      FIRST: { type: "percentage", value: 15, description: "15% first-time user" },
    }),
    [],
  )

  // Memoize quick templates
  const quickTemplates = useMemo(
    () => [
      "Write a comprehensive marketing strategy for a new mobile app",
      "Create a detailed technical specification for a web platform",
      "Draft a professional investor pitch deck for a fintech startup",
      "Develop a strategic business expansion plan for international markets",
    ],
    [],
  )

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("userLoggedIn") === "true"
      setIsAuthenticated(isLoggedIn)
    }

    checkAuth()

    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const handleTemplateClick = useCallback((template: string) => {
    setDocumentRequest(template)
  }, [])

  // Separate function for the actual document generation logic
  const generateDocument = useCallback(async () => {
    if (!documentRequest.trim()) return

    setIsGenerating(true)

    // Simulate AI generation with optimized content
    setTimeout(() => {
      setGeneratedText(
        `# Marketing Strategy: Mobile App Launch

## Executive Overview

This comprehensive marketing strategy outlines the approach for successfully launching our new mobile application in the competitive digital marketplace. The plan addresses target audience identification, competitive positioning, marketing channels, budget allocation, and success metrics to ensure maximum market penetration and user acquisition.

## Target Audience Analysis

Our primary audience consists of tech-savvy professionals aged 25-45 who value efficiency and digital solutions in their daily workflows. These individuals typically work in corporate environments, manage multiple projects simultaneously, and seek tools that enhance productivity while maintaining work-life balance.

## Market Positioning

The application will be positioned as an intuitive, feature-rich solution that addresses specific pain points not currently solved by existing offerings in the marketplace. Our unique value proposition centers on seamless integration capabilities with existing business tools and enhanced security features.

## Marketing Channels & Tactics

### Digital Marketing Strategy

Our comprehensive digital approach will leverage multiple touchpoints including search engine optimization focusing on solution-based keywords, targeted pay-per-click campaigns, and strategic content marketing through industry publications.

### Social Media Strategy

Platform-specific approaches will include LinkedIn for thought leadership content, Twitter for real-time product updates, and Instagram for visual demonstrations that showcase the application's benefits.

## Launch Timeline and Implementation

The marketing rollout will follow a carefully planned phased approach designed to maximize impact and user adoption:

- **Pre-launch phase (4 weeks):** Comprehensive teaser campaign and early access registration
- **Launch week:** Coordinated press releases and strategic influencer partnerships
- **Post-launch phase (8 weeks):** Sustained engagement campaigns and user feedback collection

## Budget Allocation and Resource Distribution

The initial marketing budget of $75,000 will be strategically distributed across multiple channels: digital advertising campaigns (40%), professional content creation (25%), public relations (20%), analytics tools (10%), and contingency fund (5%).

## Success Metrics and Key Performance Indicators

Critical performance indicators will include specific download targets of 10,000 users in the first month, user retention rates of 40% after 30 days, conversion rates of 5% from free to premium subscriptions, and maintaining customer acquisition costs below $2.50 per user.`,
      )
      setIsGenerating(false)
      setShowOutput(true)
    }, 2000)
  }, [documentRequest])

  const handleGenerateDocument = useCallback(async () => {
    if (!documentRequest.trim()) return

    if (!isAuthenticated) {
      setShowSignInPopup(true)
      return
    }

    await generateDocument()
  }, [documentRequest, isAuthenticated, generateDocument])

  const handleEditRequest = useCallback(() => {
    setShowOutput(false)
  }, [])

  const handleDownloadPDF = useCallback(() => {
    setShowPaymentPopup(true)
  }, [])

  const handlePayment = useCallback(() => {
    // Store document content and type for the confirmation page
    localStorage.setItem("aiDocumentContent", generatedText)
    localStorage.setItem("aiDocumentType", documentRequest.substring(0, 100) + "...")

    setShowPaymentPopup(false)

    // Redirect to AI payment confirmation page
    window.location.href = "/ai-payment-confirmation"
  }, [generatedText, documentRequest])

  const generatePDFForDownload = useCallback(async () => {
    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()

      doc.setProperties({
        title: "Monzic Generated Document",
        subject: "AI Generated Document",
        author: "Monzic AI Documents",
        creator: "Monzic Solutions Ltd",
      })

      // Add header
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("Monzic - Generated Document", 20, 20)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30)

      doc.line(20, 35, 190, 35)

      let yPosition = 45
      const pageHeight = doc.internal.pageSize.height
      const margin = 20
      const lineHeight = 6
      const maxWidth = 170

      const lines = generatedText.split("\n")

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        if (line === "") {
          yPosition += lineHeight / 2
          continue
        }

        if (yPosition > pageHeight - 30) {
          doc.addPage()
          yPosition = 20
        }

        if (line.startsWith("# ")) {
          doc.setFontSize(16)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(15, 116, 108)
          const text = line.substring(2)
          const splitText = doc.splitTextToSize(text, maxWidth)
          doc.text(splitText, margin, yPosition)
          yPosition += splitText.length * lineHeight + 5
        } else if (line.startsWith("## ")) {
          doc.setFontSize(14)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(13, 148, 136)
          const text = line.substring(3)
          const splitText = doc.splitTextToSize(text, maxWidth)
          doc.text(splitText, margin, yPosition)
          yPosition += splitText.length * lineHeight + 3
        } else if (line.startsWith("### ")) {
          doc.setFontSize(12)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(13, 148, 136)
          const text = line.substring(4)
          const splitText = doc.splitTextToSize(text, maxWidth)
          doc.text(splitText, margin, yPosition)
          yPosition += splitText.length * lineHeight + 2
        } else if (line.startsWith("- ")) {
          doc.setFontSize(10)
          doc.setFont("helvetica", "normal")
          doc.setTextColor(55, 65, 81)
          const text = `• ${line.substring(2)}`
          const splitText = doc.splitTextToSize(text, maxWidth - 5)
          doc.text(splitText, margin + 5, yPosition)
          yPosition += splitText.length * lineHeight
        } else {
          doc.setFontSize(10)
          doc.setFont("helvetica", "normal")
          doc.setTextColor(55, 65, 81)

          if (line.includes("**")) {
            const parts = line.split("**")
            let currentX = margin

            for (let j = 0; j < parts.length; j++) {
              if (j % 2 === 1) {
                doc.setFont("helvetica", "bold")
                doc.setTextColor(17, 24, 39)
              } else {
                doc.setFont("helvetica", "normal")
                doc.setTextColor(55, 65, 81)
              }

              const textWidth = doc.getTextWidth(parts[j])
              if (currentX + textWidth > margin + maxWidth) {
                yPosition += lineHeight
                currentX = margin
              }

              doc.text(parts[j], currentX, yPosition)
              currentX += textWidth
            }
            yPosition += lineHeight + 2
          } else {
            const splitText = doc.splitTextToSize(line, maxWidth)
            doc.text(splitText, margin, yPosition)
            yPosition += splitText.length * lineHeight + 2
          }
        }
      }

      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
        doc.text("Generated by Monzic AI Documents", margin, pageHeight - 15)
        doc.text("© 2025 Monzic Solutions Ltd", margin, pageHeight - 10)
        doc.text(`Page ${i} of ${totalPages}`, 190 - 30, pageHeight - 10)
      }

      doc.save("monzic-generated-document.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)

      const textContent = `Monzic - Generated Document
Generated on: ${new Date().toLocaleDateString()}

${generatedText.replace(/[#*]/g, "")}

---
Generated by Monzic AI Documents
© 2025 Monzic Solutions Ltd`

      const blob = new Blob([textContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "monzic-generated-document.txt"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }, [generatedText])

  const applyDiscountCode = useCallback(() => {
    const code = discountCode.toUpperCase()
    if (discountCodes[code]) {
      setAppliedDiscount(discountCodes[code])
    } else {
      setAppliedDiscount({ error: "Invalid discount code" })
    }
  }, [discountCode, discountCodes])

  const removeDiscount = useCallback(() => {
    setAppliedDiscount(null)
    setDiscountCode("")
  }, [])

  const calculateDiscountedPrice = useCallback(() => {
    if (!appliedDiscount || appliedDiscount.error) return documentPrice

    if (appliedDiscount.type === "percentage") {
      return documentPrice - (documentPrice * appliedDiscount.value) / 100
    } else {
      return Math.max(0, documentPrice - appliedDiscount.value)
    }
  }, [appliedDiscount, documentPrice])

  const getDiscountAmount = useCallback(() => {
    if (!appliedDiscount || appliedDiscount.error) return 0

    if (appliedDiscount.type === "percentage") {
      return (documentPrice * appliedDiscount.value) / 100
    } else {
      return Math.min(documentPrice, appliedDiscount.value)
    }
  }, [appliedDiscount, documentPrice])

  const finalPrice = calculateDiscountedPrice()
  const totalWithTip = finalPrice + tipAmount

  const toggleSection = useCallback((section: string) => {
    setExpandedSection((prev) => (prev === section ? "" : section))
  }, [])

  const formatCardNumber = useCallback((value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    return parts.length ? parts.join(" ") : value
  }, [])

  const formatExpiry = useCallback((value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    return v.length >= 2 ? `${v.substring(0, 2)} / ${v.substring(2, 4)}` : v
  }, [])

  // Handle sign in
  const handleSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSignInError("")
      setIsSigningIn(true)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Validate credentials against test accounts
        if (!email || !password) {
          setSignInError("Please enter both email and password")
          setIsSigningIn(false)
          return
        }

        // Check if account exists
        const account = TEST_ACCOUNTS.find((acc) => acc.email.toLowerCase() === email.toLowerCase())

        if (!account) {
          setSignInError("Account not found. Please check your email address.")
          setIsSigningIn(false)
          return
        }

        if (account.password !== password) {
          setSignInError("Incorrect password. Please try again.")
          setIsSigningIn(false)
          return
        }

        // Credentials are valid, show verification step
        setShowVerification(true)
        setIsSigningIn(false)
      } catch (error) {
        console.error("Sign in error:", error)
        setSignInError("An error occurred during sign in. Please try again.")
        setIsSigningIn(false)
      }
    },
    [email, password],
  )

  const handleVerificationCodeChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`ai-code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleVerificationKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`ai-code-${index - 1}`)
      prevInput?.focus()
    }
  }

  // Handle verification
  const handleVerification = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setVerificationError("")

      const code = verificationCode.join("")
      if (code.length !== 6) {
        setVerificationError("Please enter the complete 6-digit verification code")
        return
      }

      setIsVerifying(true)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // For demo purposes, accept any 6-digit code
        if (verificationCode.join("").length === 6) {
          // Set auth cookies and localStorage
          document.cookie = `userLoggedIn=true; path=/; max-age=86400`
          localStorage.setItem("userLoggedIn", "true")

          // Use the appropriate email based on whether it's sign-in or sign-up
          const userEmailToStore = showSignUp ? signUpEmail : email
          localStorage.setItem("userEmail", userEmailToStore)

          if (rememberMe) {
            localStorage.setItem("rememberMe", "true")
          }

          setIsAuthenticated(true)
          setShowSignInPopup(false)
          setShowVerification(false)
          setShowSignUp(false)

          // Continue with document generation if that's what triggered the sign in
          if (documentRequest.trim()) {
            // Call the generation function directly instead of the handler
            await generateDocument()
          }
        } else {
          setVerificationError("Invalid verification code. Please enter a 6-digit code.")
        }
      } catch (error) {
        console.error("Verification error:", error)
        setVerificationError("An error occurred during verification. Please try again.")
      } finally {
        setIsVerifying(false)
      }
    },
    [verificationCode, signUpEmail, email, rememberMe, showSignUp, documentRequest, generateDocument],
  )

  // Toggle between sign in and sign up
  const toggleSignUpMode = useCallback(() => {
    setShowSignUp(!showSignUp)
    setSignInError("")
    setSignUpError("")
    setVerificationError("")
    setShowVerification(false)
    setVerificationCode(["", "", "", "", "", ""])
  }, [showSignUp])

  const handleSignUp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSignUpError("")

      if (!signUpEmail) {
        setSignUpError("Please enter your email")
        return
      }

      if (!signUpPassword) {
        setSignUpError("Please enter a password")
        return
      }

      if (signUpPassword !== signUpConfirmPassword) {
        setSignUpError("Passwords do not match")
        return
      }

      setIsSigningUp(true)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // For demo purposes, accept any email and password
        setShowVerification(true)
        setIsSigningUp(false)
      } catch (error) {
        console.error("Sign up error:", error)
        setSignUpError("An error occurred during sign up. Please try again.")
        setIsSigningUp(false)
      }
    },
    [signUpEmail, signUpPassword, signUpConfirmPassword],
  )

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-teal-600 px-4 sm:px-6 py-3 sm:py-4 shadow-md flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-white hover:text-teal-100 transition-colors">
              MONZIC
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex gap-2 md:gap-3">
            <Link href="/contact">
              <Button
                variant="outline"
                className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent text-sm md:text-base px-3 md:px-4"
              >
                Contact
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent text-sm md:text-base px-3 md:px-4"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent text-sm md:text-base px-3 md:px-4"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-white hover:bg-teal-700 rounded-md transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 pb-4 border-t border-teal-500 pt-4">
            <div className="flex flex-col space-y-3">
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent"
                >
                  Contact
                </Button>
              </Link>
              {isAuthenticated ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 bg-teal-100 text-teal-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>AI-Powered Document Generation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight px-4">
              Transform Ideas into
              <span className="text-teal-600 block">Professional Documents</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
              Our advanced AI technology creates high-quality, personalized documents in seconds. From business
              proposals to technical specifications, get professionally formatted content instantly.
            </p>

            {/* Feature highlights */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 mt-4 px-4">
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                <span className="text-sm sm:text-base">Instant Generation</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                <span className="text-sm sm:text-base">Professional Quality</span>
              </div>
            </div>

            {/* Pricing Comparison */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mt-4">
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-2">How It Works</h2>
                <p className="text-sm text-gray-600">Generate unlimited documents for free, download when ready</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* Free Section */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200 relative">
                  <div className="absolute -top-2 left-4">
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">FREE</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Eye className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Generate & Preview</h3>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-1.5">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>Unlimited document generation</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>Full preview & editing</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>No time limits</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Paid Section */}
                <div className="bg-teal-50 rounded-lg p-4 border border-teal-200 relative">
                  <div className="absolute -top-2 left-4">
                    <span className="bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded">£10</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
                        <Download className="w-4 h-4 text-teal-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Professional PDF</h3>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-1.5">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                        <span>High-quality PDF format</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                        <span>Print-ready quality</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                        <span>Instant download</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 mt-4 max-w-2xl mx-auto">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    <span className="font-medium">Perfect for trying before buying:</span> Generate and perfect your
                    document completely free, then pay only when you're satisfied and ready to download.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Document Generation Section */}
          {!showOutput && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-4 sm:px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Generate Your Document</h2>
                    <p className="text-teal-100 text-sm sm:text-base">
                      Describe what you need and let our AI create it for you
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                <div className="relative">
                  <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-3">
                    What type of document do you need?
                  </label>
                  <div className="relative">
                    <Textarea
                      value={documentRequest}
                      onChange={(e) => setDocumentRequest(e.target.value)}
                      placeholder="e.g., A comprehensive business proposal for a tech startup, a detailed marketing strategy for a mobile app launch, a technical specification document..."
                      className="min-h-20 sm:min-h-24 resize-none text-sm sm:text-base border-2 border-gray-200 focus:border-teal-500 rounded-xl"
                      disabled={isGenerating}
                    />
                    <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-teal-600 hover:bg-teal-50 hover:text-teal-700 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                      >
                        <Paperclip className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Attach Files</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Templates */}
                <div className="space-y-3">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Quick Start Templates</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {quickTemplates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => handleTemplateClick(template)}
                        className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all duration-200 text-left group touch-manipulation"
                        disabled={isGenerating}
                      >
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-teal-200 transition-colors">
                          <FileText className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium text-sm leading-relaxed">{template}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateDocument}
                  disabled={!documentRequest.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
                >
                  {isGenerating ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Your Document...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Document</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Generated Document Section */}
          {showOutput && generatedText && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Document Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 sm:px-6 py-4 flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Your Document is Ready!</h3>
                    <p className="text-emerald-100 text-sm sm:text-base">Review your generated content below</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <Button
                    onClick={handleEditRequest}
                    variant="outline"
                    className="border-teal-300 text-teal-100 hover:bg-teal-500 hover:border-white bg-transparent flex items-center justify-center space-x-2 text-sm sm:text-base h-12 touch-manipulation"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Request</span>
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    className="bg-white text-teal-700 hover:bg-gray-50 flex items-center justify-center space-x-2 font-semibold text-sm sm:text-base h-12 touch-manipulation"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF - £10</span>
                  </Button>
                </div>
              </div>

              {/* Document Content */}
              <div className="p-4 sm:p-6">
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 max-h-[60vh] overflow-y-auto border border-gray-200">
                  <div className="prose prose-sm sm:prose-lg max-w-none">
                    {generatedText.split("\n").map((line, index) => {
                      if (line.startsWith("# ")) {
                        return (
                          <h1
                            key={index}
                            className="text-xl sm:text-3xl font-bold text-teal-700 mb-3 sm:mb-4 mt-3 sm:mt-4 first:mt-0"
                          >
                            {line.substring(2)}
                          </h1>
                        )
                      } else if (line.startsWith("## ")) {
                        return (
                          <h2
                            key={index}
                            className="text-lg sm:text-2xl font-semibold text-teal-600 mb-2 sm:mb-3 mt-4 sm:mt-6"
                          >
                            {line.substring(3)}
                          </h2>
                        )
                      } else if (line.startsWith("### ")) {
                        return (
                          <h3
                            key={index}
                            className="text-base sm:text-xl font-semibold text-teal-600 mb-2 mt-3 sm:mt-4"
                          >
                            {line.substring(4)}
                          </h3>
                        )
                      } else if (line.startsWith("- ")) {
                        return (
                          <li key={index} className="text-sm sm:text-base text-gray-700 mb-1 ml-4 sm:ml-6">
                            {line.substring(2)}
                          </li>
                        )
                      } else if (line.includes("**") && line.split("**").length > 2) {
                        const parts = line.split("**")
                        return (
                          <p key={index} className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-3 leading-relaxed">
                            {parts.map((part, i) =>
                              i % 2 === 1 ? (
                                <strong key={i} className="font-semibold text-gray-900">
                                  {part}
                                </strong>
                              ) : (
                                part
                              ),
                            )}
                          </p>
                        )
                      } else if (line.trim() === "") {
                        return <div key={index} className="h-2 sm:h-3"></div>
                      } else {
                        return (
                          <p key={index} className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-3 leading-relaxed">
                            {line}
                          </p>
                        )
                      }
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sign In Required Popup */}
          {showSignInPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowSignInPopup(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Sign In Form */}
                {!showSignUp && !showVerification && (
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                      Sign In to Generate Documents
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                      Sign in to your account to access our AI document generation service.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-800">
                          <p className="font-medium mb-1">Test Credentials</p>
                          <p>
                            <strong>Email:</strong> test@monzic.com
                          </p>
                          <p>
                            <strong>Password:</strong> test123
                          </p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-4 text-left">
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="pl-10 h-12 text-gray-900"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="pl-10 pr-10 h-12 text-gray-900"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          />
                          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                            Remember me
                          </label>
                        </div>
                        <div className="text-sm">
                          <a href="#" className="font-medium text-teal-600 hover:text-teal-500">
                            Forgot password?
                          </a>
                        </div>
                      </div>

                      {signInError && (
                        <div className="bg-red-50 p-3 rounded-md flex items-start space-x-2">
                          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-600">{signInError}</p>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium h-12 touch-manipulation"
                        disabled={isSigningIn}
                      >
                        {isSigningIn ? (
                          <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Signing In...</span>
                          </div>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>

                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <button onClick={toggleSignUpMode} className="font-medium text-teal-600 hover:text-teal-500">
                          Sign up
                        </button>
                      </p>
                    </div>
                  </div>
                )}

                {/* Sign Up Form */}
                {showSignUp && !showVerification && (
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Create Your Account</h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                      Sign up to access our AI document generation service.
                    </p>

                    <form onSubmit={handleSignUp} className="space-y-4 text-left">
                      <div className="space-y-2">
                        <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-email"
                            type="email"
                            value={signUpEmail}
                            onChange={(e) => setSignUpEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="pl-10 h-12 text-gray-900"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-password"
                            type={showSignUpPassword ? "text" : "password"}
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            placeholder="Create a password"
                            className="pl-10 pr-10 h-12 text-gray-900"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirm-password"
                            type="password"
                            value={signUpConfirmPassword}
                            onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            className="pl-10 h-12 text-gray-900"
                            required
                          />
                        </div>
                      </div>

                      {signUpError && (
                        <div className="bg-red-50 p-3 rounded-md flex items-start space-x-2">
                          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-600">{signUpError}</p>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium h-12 touch-manipulation"
                        disabled={isSigningUp}
                      >
                        {isSigningUp ? (
                          <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Creating Account...</span>
                          </div>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>

                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <button onClick={toggleSignUpMode} className="font-medium text-teal-600 hover:text-teal-500">
                          Sign in
                        </button>
                      </p>
                    </div>
                  </div>
                )}

                {/* Verification Form */}
                {showVerification && (
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Verify Your Email</h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                      We've sent a 6-digit verification code to your email. Please enter it below to complete your
                      registration.
                    </p>

                    <form onSubmit={handleVerification} className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                          Enter Verification Code
                        </label>
                        <div className="flex justify-center space-x-2">
                          {verificationCode.map((digit, index) => (
                            <Input
                              key={index}
                              id={`ai-code-${index}`}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                              onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                              className="w-10 h-12 sm:w-12 sm:h-12 text-center text-xl font-bold border-2 border-gray-200 focus:border-teal-500 rounded-lg"
                              autoComplete="off"
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2">
                          For demo purposes, enter any 6-digit code (e.g., 123456)
                        </p>
                      </div>

                      {verificationError && (
                        <div className="bg-red-50 p-3 rounded-md flex items-start space-x-2">
                          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-600">{verificationError}</p>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium h-12 touch-manipulation"
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Verifying...</span>
                          </div>
                        ) : (
                          "Verify & Continue"
                        )}
                      </Button>
                    </form>

                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        Didn't receive the code?{" "}
                        <button className="font-medium text-teal-600 hover:text-teal-500">Resend code</button>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Popup */}
          {showPaymentPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Download className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Your document is ready! Complete your purchase to download the PDF.
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">AI Generated Document</span>
                      <span className="font-semibold text-gray-900">£{documentPrice.toFixed(2)}</span>
                    </div>

                    {appliedDiscount && !appliedDiscount.error && (
                      <div className="flex justify-between items-center text-green-600 text-xs sm:text-sm">
                        <span>Discount ({appliedDiscount.description})</span>
                        <span>-£{getDiscountAmount().toFixed(2)}</span>
                      </div>
                    )}

                    {tipAmount > 0 && (
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span>Tip</span>
                        <span>£{tipAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center font-bold text-base sm:text-lg">
                        <span>Total</span>
                        <span className="text-teal-600">£{totalWithTip.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Discount Code Section */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Discount Code</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                          placeholder="Enter discount code"
                          className="pl-10 h-12 text-sm sm:text-base text-gray-900"
                          disabled={appliedDiscount && !appliedDiscount.error}
                        />
                      </div>
                      {appliedDiscount && !appliedDiscount.error ? (
                        <Button
                          onClick={removeDiscount}
                          variant="outline"
                          className="text-red-600 border-red-300 h-12 text-sm sm:text-base touch-manipulation"
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          onClick={applyDiscountCode}
                          variant="outline"
                          disabled={!discountCode.trim()}
                          className="h-12 text-sm sm:text-base touch-manipulation"
                        >
                          Apply
                        </Button>
                      )}
                    </div>

                    {appliedDiscount?.error && <p className="text-xs text-red-600">{appliedDiscount.error}</p>}

                    {appliedDiscount && !appliedDiscount.error && (
                      <p className="text-xs text-green-600">✓ {appliedDiscount.description} applied successfully!</p>
                    )}
                  </div>

                  {/* Collapsible Tip Section */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection("tip")}
                      className="w-full flex justify-between items-center p-4 text-left bg-white hover:bg-gray-50 transition-colors touch-manipulation"
                    >
                      <div className="flex items-center">
                        <span className="font-medium text-sm sm:text-base">
                          {tipAmount > 0 ? `Tip: £${tipAmount}` : "Tip (optional)"}
                        </span>
                      </div>
                      {expandedSection === "tip" ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    {expandedSection === "tip" && (
                      <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <p className="text-xs text-gray-600 mb-3">
                          Add a tip to show your appreciation for our service. Your support helps us continue providing
                          high-quality document generation.
                        </p>
                        <input
                          type="range"
                          min="0"
                          max="500"
                          value={Math.min(tipAmount, 500)}
                          onChange={(e) => setTipAmount(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${(Math.min(tipAmount, 500) / 500) * 100}%, #e5e7eb ${(Math.min(tipAmount, 500) / 500) * 100}%, #e5e7eb 100%)`,
                          }}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                          <span>£0</span>
                          <span>£500</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-700">£</span>
                          <input
                            type="number"
                            min="0"
                            max="999"
                            value={tipAmount}
                            onChange={(e) => {
                              const value = Math.max(0, Math.min(999, Number(e.target.value) || 0))
                              setTipAmount(value)
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base text-gray-900 h-12"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-4 border-2 border-blue-100 rounded-xl p-4 sm:p-6 bg-white shadow-sm">
                    <div className="flex items-center space-x-2 mb-4">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Pay with Card</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card number</label>
                        <div className="relative">
                          <Input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="1234 1234 1234 1234"
                            className="h-12 pr-20 sm:pr-24 text-sm sm:text-base text-gray-900"
                            maxLength={19}
                          />
                          <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                            {/* Real Visa Logo */}
                            <svg width="24" height="16" viewBox="0 0 32 20" className="rounded">
                              <rect width="32" height="20" fill="#1434CB" rx="2" />
                              <text x="16" y="14" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
                                VISA
                              </text>
                            </svg>
                            {/* Real Mastercard Logo */}
                            <svg width="24" height="16" viewBox="0 0 32 20" className="rounded">
                              <rect width="32" height="20" fill="#EB001B" rx="2" />
                              <circle cx="12" cy="10" r="6" fill="#FF5F00" />
                              <circle cx="20" cy="10" r="6" fill="#F79E1B" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry date</label>
                          <Input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                            placeholder="MM / YY"
                            className="h-12 text-sm sm:text-base text-gray-900"
                            maxLength={7}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Security code</label>
                          <div className="relative">
                            <Input
                              type="text"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                              placeholder="123"
                              className="h-12 text-sm sm:text-base text-gray-900"
                              maxLength={4}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postal code</label>
                        <Input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
                          placeholder="SW1A 1AA"
                          className="h-12 text-sm sm:text-base text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <Button
                    onClick={() => setShowPaymentPopup(false)}
                    variant="outline"
                    className="flex-1 h-12 text-sm sm:text-base touch-manipulation"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePayment}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white h-12 text-sm sm:text-base font-semibold touch-manipulation"
                  >
                    Pay £{totalWithTip.toFixed(2)}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
