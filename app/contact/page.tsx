"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Clock, ShieldCheck, Shield, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth"

export default function ContactPage() {
  const [isVerified, setIsVerified] = useState(false)
  const [verificationAnswer, setVerificationAnswer] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState({ question: "", answer: "" })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated, loading } = useAuth()

  // Pool of verification questions
  const verificationQuestions = [
    { question: "What is 7 + 3?", answer: "10" },
    { question: "What is 5 × 2?", answer: "10" },
    { question: "What is 15 - 6?", answer: "9" },
    { question: "What is 4 + 8?", answer: "12" },
    { question: "What is 3 × 4?", answer: "12" },
    { question: "What is 20 - 5?", answer: "15" },
    { question: "What is 6 + 7?", answer: "13" },
    { question: "What is 2 × 8?", answer: "16" },
    { question: "What is 18 - 9?", answer: "9" },
    { question: "What is 5 + 6?", answer: "11" },
    { question: "What is 3 × 5?", answer: "15" },
    { question: "What is 14 - 8?", answer: "6" },
    { question: "What is 9 + 4?", answer: "13" },
    { question: "What is 7 × 2?", answer: "14" },
    { question: "What is 16 - 7?", answer: "9" },
  ]

  // Select a random question on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * verificationQuestions.length)
    setCurrentQuestion(verificationQuestions[randomIndex])
  }, [])

  const handleVerification = (answer: string) => {
    setVerificationAnswer(answer)
    setIsVerified(answer === currentQuestion.answer)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isVerified) {
      alert("Please complete the robot verification before submitting.")
      return
    }
    // Handle form submission here
    alert("Message sent successfully!")
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Mobile-Optimized Header */}
      <header className="bg-teal-600 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center shadow-md relative">
        <div className="flex items-center">
          <Link href="/">
            <h1 className="text-xl sm:text-2xl font-bold text-white cursor-pointer hover:text-teal-100 transition-colors">
              MONZIC
            </h1>
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
          <Link href={isAuthenticated ? "/dashboard" : "/login"}>
            <Button
              variant="outline"
              className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent"
              disabled={loading}
            >
              {loading ? "..." : isAuthenticated ? "Dashboard" : "Sign In"}
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
              <Link href={isAuthenticated ? "/dashboard" : "/login"} onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent justify-start h-12"
                  disabled={loading}
                >
                  {loading ? "..." : isAuthenticated ? "Dashboard" : "Sign In"}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 bg-teal-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-6 sm:gap-8">
            {/* Contact Form */}
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-teal-100">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Contact Us</h1>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                Get in touch with our team. We're here to help with any questions about our AI document generation
                services.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <Input
                      type="text"
                      required
                      className="w-full h-10 sm:h-12 text-sm sm:text-base"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <Input
                      type="text"
                      required
                      className="w-full h-10 sm:h-12 text-sm sm:text-base"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <Input
                    type="email"
                    required
                    className="w-full h-10 sm:h-12 text-sm sm:text-base"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <Input
                    type="text"
                    required
                    className="w-full h-10 sm:h-12 text-sm sm:text-base"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <Textarea
                    required
                    className="w-full min-h-24 sm:min-h-32 resize-none text-sm sm:text-base"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                {/* Robot Verification */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Robot Verification</h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Please solve this simple math problem to verify you're human:
                    </p>
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                      <span className="text-base sm:text-lg font-semibold text-gray-900">
                        {currentQuestion.question}
                      </span>
                      <span className="text-gray-500">=</span>
                      <Input
                        type="text"
                        value={verificationAnswer}
                        onChange={(e) => handleVerification(e.target.value)}
                        className={`w-16 sm:w-20 h-8 sm:h-10 text-center ${
                          verificationAnswer
                            ? isVerified
                              ? "border-green-500 bg-green-50"
                              : "border-red-500 bg-red-50"
                            : ""
                        }`}
                        placeholder="?"
                      />
                      {verificationAnswer && (
                        <span className={`text-xs sm:text-sm ${isVerified ? "text-green-600" : "text-red-600"}`}>
                          {isVerified ? "✓ Correct" : "✗ Incorrect"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="privacy-consent"
                    required
                    className="mt-1 h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 flex-shrink-0"
                  />
                  <label htmlFor="privacy-consent" className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <Link href="/privacy-policy" className="text-teal-600 hover:text-teal-700 underline">
                      Privacy Policy
                    </Link>{" "}
                    and consent to the processing of my personal data for the purpose of responding to my inquiry. *
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={!isVerified}
                  className={`w-full py-3 sm:py-4 rounded-md font-medium text-base sm:text-lg transition-colors h-12 sm:h-14 ${
                    isVerified
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isVerified ? "Send Message" : "Complete Verification to Send"}
                </Button>
              </form>
            </div>

            {/* Support Information */}
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-teal-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Support Information</h2>

              <div className="space-y-6 sm:space-y-8">
                {/* Response Time */}
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Response Time</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Our email support services are available 24/7. We aim to respond to all inquiries within 24 hours.
                    </p>
                  </div>
                </div>

                {/* Data Protection */}
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Data Protection</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      For data protection inquiries, please mark your message as "Data Protection" in the subject line.
                      Our Data Protection Officer will review your request in accordance with applicable privacy laws.
                    </p>
                  </div>
                </div>
              </div>

              {/* Priority Support Notice */}
              <div className="bg-teal-50 p-4 sm:p-6 rounded-xl border border-teal-200 mt-6 sm:mt-8">
                <h3 className="font-semibold text-teal-900 mb-2 text-sm sm:text-base">Urgent Support</h3>
                <p className="text-teal-700 text-xs sm:text-sm">
                  For urgent technical issues, please mark your message as "Urgent" in the subject line. While we
                  process all inquiries as quickly as possible, this helps us prioritize time-sensitive matters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-teal-600 py-4 sm:py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-white">
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
          <div className="text-center mt-2 sm:mt-4 text-xs text-teal-100">
            © 2025 Monzic Solutions Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
