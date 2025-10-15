"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export default function PrivacyPolicyPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
          <Link href="/login">
            <Button
              variant="outline"
              className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent"
            >
              Sign In
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
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent justify-start h-12"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-12 bg-gradient-to-br from-teal-50 to-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-4 sm:px-8 py-6 sm:py-8 text-white">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">Privacy Policy</h1>
                  <p className="text-teal-100 mt-1 text-sm sm:text-base">Your privacy and data protection rights</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="font-medium">Company</p>
                    <p className="text-teal-100">Tempnow Solutions Ltd</p>
                  </div>
                  <div>
                    <p className="font-medium">Registration</p>
                    <p className="text-teal-100">16414928</p>
                  </div>
                  <div>
                    <p className="font-medium">Effective Date</p>
                    <p className="text-teal-100">January 6, 2025</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-4 sm:px-8 py-6 sm:py-8">
              <div className="prose prose-sm sm:prose-lg max-w-none text-gray-700 space-y-6 sm:space-y-8">
                <section className="border-l-4 border-teal-500 pl-4 sm:pl-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-6 h-6 sm:w-8 sm:h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-xs sm:text-sm mr-2 sm:mr-3">
                      1
                    </span>
                    Introduction and Data Controller
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4">
                    <p className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Data Controller Details:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <p>
                          <strong>Company Name:</strong> Tempnow Solutions Ltd
                        </p>
                        <p>
                          <strong>Registration Number:</strong> 16414928
                        </p>
                        <p>
                          <strong>Registered in:</strong> England and Wales
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Business Type:</strong> AI Document Generation Services
                        </p>
                        <p>
                          <strong>Contact:</strong> Via contact form on website
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed">
                    Tempnow Solutions Ltd ("Tempnow," "we," "us," or "our") is committed to protecting and respecting your
                    privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal
                    information when you access or use our artificial intelligence-powered document generation services
                    (the "Services") through our website and platform.
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed">
                    This Privacy Policy applies to all users of our Services and governs our data practices in
                    accordance with applicable data protection laws, including the UK General Data Protection Regulation
                    (UK GDPR), the Data Protection Act 2018, and other relevant privacy legislation.
                  </p>
                </section>

                {/* Continue with other sections using similar mobile optimization patterns... */}
                {/* For brevity, I'll show the pattern for the next section */}

                <section className="border-l-4 border-teal-500 pl-4 sm:pl-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-6 h-6 sm:w-8 sm:h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-xs sm:text-sm mr-2 sm:mr-3">
                      2
                    </span>
                    Information We Collect
                  </h2>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3">
                      2.1 Personal Information You Provide
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <ul className="space-y-2 text-xs sm:text-sm">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Account registration details
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Contact form submissions
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Payment information
                        </li>
                      </ul>
                      <ul className="space-y-2 text-xs sm:text-sm">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Document generation requests
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Customer support communications
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Feedback and survey responses
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">
                      2.2 Information Collected Automatically
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Device and browser information
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>IP address and location data
                        </li>
                      </ul>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Usage patterns and analytics
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Cookies and tracking
                          technologies
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-teal-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm mr-3">
                      3
                    </span>
                    Legal Basis for Processing
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">Contract Performance</h4>
                      <p className="text-sm text-purple-800">
                        Processing necessary to provide our AI document generation services
                      </p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-900 mb-2">Legitimate Interests</h4>
                      <p className="text-sm text-orange-800">Service improvement, security, and business operations</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-2">Legal Compliance</h4>
                      <p className="text-sm text-red-800">
                        Compliance with applicable laws and regulatory requirements
                      </p>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 mb-2">Consent</h4>
                      <p className="text-sm text-indigo-800">
                        Where you have provided explicit consent for specific activities
                      </p>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-teal-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm mr-3">
                      4
                    </span>
                    How We Use Your Information
                  </h2>
                  <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Service Provision</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• AI document generation and delivery</li>
                          <li>• Account management and authentication</li>
                          <li>• Payment processing and billing</li>
                          <li>• Customer support and assistance</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Business Operations</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Service improvement and optimization</li>
                          <li>• Security monitoring and fraud prevention</li>
                          <li>• Analytics and usage pattern analysis</li>
                          <li>• Legal compliance and regulatory reporting</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-teal-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm mr-3">
                      5
                    </span>
                    Data Security and Protection
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Encryption</h4>
                        <p className="text-sm text-gray-600">
                          Industry-standard encryption for data transmission and storage
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Access Controls</h4>
                        <p className="text-sm text-gray-600">Strict authentication and authorization mechanisms</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Monitoring</h4>
                        <p className="text-sm text-gray-600">Continuous security monitoring and incident response</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-teal-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm mr-3">
                      6
                    </span>
                    Your Rights Under UK GDPR
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">Right of Access</h4>
                      <p className="text-sm text-gray-600">
                        Request access to your personal information and processing details
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">Right to Rectification</h4>
                      <p className="text-sm text-gray-600">
                        Request correction of inaccurate or incomplete personal data
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">Right to Erasure</h4>
                      <p className="text-sm text-gray-600">
                        Request deletion of your personal information under certain conditions
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">Right to Data Portability</h4>
                      <p className="text-sm text-gray-600">
                        Request transfer of your data in a structured, machine-readable format
                      </p>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Exercising Your Rights:</strong> To exercise any of these rights, please contact us
                      through our contact form. We will respond to your request within one month of receipt, in
                      accordance with UK GDPR requirements.
                    </p>
                  </div>
                </section>

                <section className="border-l-4 border-teal-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm mr-3">
                      7
                    </span>
                    Contact Information and Complaints
                  </h2>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Contact Tempnow Solutions Ltd</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          For privacy-related inquiries, please use our contact form and mark your message as "Data
                          Protection" or "Privacy Inquiry".
                        </p>
                        <p className="text-sm text-gray-600">
                          We are committed to addressing your concerns promptly and transparently.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Regulatory Authority</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          If you are not satisfied with our response, you have the right to lodge a complaint with:
                        </p>
                        <p className="text-sm font-medium text-gray-800">Information Commissioner's Office (ICO)</p>
                        <p className="text-sm text-gray-600">Website: ico.org.uk</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 sm:px-8 py-4 sm:py-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-0 text-center sm:text-left">
                  <p>
                    <strong>TEMPNOW Solutions Ltd</strong> • Company Registration: 16414928 • Registered in England and
                    Wales
                  </p>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Last updated: January 6, 2025</div>
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
            © 2025 Tempnow Solutions Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
