"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { useSettings } from "@/context/settings";

export default function TermsOfServicesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const settings = useSettings();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Mobile-Optimized Header */}
      <header className="bg-teal-600 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center shadow-md relative">
        <div className="flex items-center">
          <Link href="/">
            <h1 className="text-xl sm:text-2xl font-bold text-white cursor-pointer hover:text-teal-100 transition-colors">
              {settings.siteName}
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

      {/* Main Content - Add mobile responsive classes throughout */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-12 bg-gradient-to-br from-teal-50 to-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 sm:px-8 py-6 sm:py-8 text-white">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">Terms of Services</h1>
                  <p className="text-slate-200 mt-1 text-sm sm:text-base">
                    Legal agreement governing use of our services
                  </p>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="font-medium">Company</p>
                    <p className="text-slate-200">{settings.companyName}</p>
                  </div>
                  <div>
                    <p className="font-medium">Registration</p>
                    <p className="text-slate-200">{settings.companyRegistration}</p>
                  </div>
                  <div>
                    <p className="font-medium">Effective Date</p>
                    <p className="text-slate-200">{new Date(settings.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section - Add mobile responsive typography and spacing */}
            <div className="px-4 sm:px-8 py-6 sm:py-8">
              <div className="prose prose-sm sm:prose-lg max-w-none text-gray-700 space-y-6 sm:space-y-8">
                <section className="border-l-4 border-slate-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm mr-3">
                      1
                    </span>
                    Agreement and Company Information
                  </h2>
                  <div className="bg-slate-50 rounded-lg p-6 mb-4">
                    <p className="font-semibold text-gray-900 mb-2">Contracting Entity:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p>
                          <strong>Legal Name:</strong> {settings?.companyName}
                        </p>
                        <p>
                          <strong>Company Number:</strong> {settings?.companyRegistration}
                        </p>
                        <p>
                          <strong>Jurisdiction:</strong> England and Wales
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Business Activity:</strong> {settings?.businessActivity} 
                          {/* AI Document Generation Services */}
                        </p>
                        <p>
                          <strong>Service Brand:</strong> {settings?.siteName}
                        </p>
                        <p>
                          <strong>Contact Method:</strong> Website contact form
                        </p>
                      </div>
                    </div>
                  </div>
                  <p>
                    These Terms of Services ("Terms") constitute a legally binding agreement between you ("User,"
                    "Customer," "you," or "your") and Tempnow Solutions Ltd (Company Registration Number: {settings.companyRegistration}), a
                    company incorporated in England and Wales ({settings.aliases}).
                  </p>
                  <p>
                    By accessing, browsing, or using our artificial intelligence-powered document generation services,
                    website, and related platforms (collectively, the "Services"), you acknowledge that you have read,
                    understood, and agree to be bound by these Terms and our Privacy Policy.
                  </p>
                </section>

                <section className="border-l-4 border-slate-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm mr-3">
                      2
                    </span>
                    Service Description and Limitations
                  </h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                      Our AI Document Generation Services Include:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>AI-powered document creation
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Professional document
                          formatting
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Instant PDF generation and
                          download
                        </li>
                      </ul>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Template-based document
                          creation
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Customer support services
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Secure payment processing
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-amber-900 mb-3">⚠️ Important Service Limitations</h3>
                    <p className="text-sm text-amber-800 mb-3">
                      <strong>Educational and Reference Use Only:</strong> All generated documents are intended for
                      reference, educational, and informational purposes only. Users are solely responsible for
                      reviewing, verifying, and validating all generated content before use in any professional, legal,
                      or official capacity.
                    </p>
                    <p className="text-sm text-amber-800">
                      <strong>No Professional Advice:</strong> Our Services do not constitute legal, financial, medical,
                      or professional advice of any kind. Users should consult qualified professionals for specific
                      advice.
                    </p>
                  </div>
                </section>

                <section className="border-l-4 border-slate-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm mr-3">
                      3
                    </span>
                    Payment Terms and Pricing
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Pricing Structure</h3>
                      <div className="space-y-3">
                        <p className="text-sm text-green-800">
                          Our AI document generation services are offered on a per-document basis. Current pricing is
                          displayed on our website at the time of purchase.
                        </p>
                        <div className="text-xs text-green-700 border-t border-green-200 pt-2">
                          * All prices exclude applicable VAT and taxes
                          <br />* Pricing subject to change with reasonable notice
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-3">Payment Requirements</h3>
                      <ul className="space-y-2 text-sm text-purple-800">
                        <li>• Payment required before document download</li>
                        <li>• Secure third-party payment processing</li>
                        <li>• All major credit and debit cards accepted</li>
                        <li>• Prices displayed at checkout are final</li>
                        <li>• We reserve the right to modify pricing with reasonable notice</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Pricing Policy</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      <strong>Dynamic Pricing:</strong> Our service pricing may vary based on market conditions, service
                      enhancements, operational costs, and other business factors. All prices are clearly displayed on
                      our website before purchase.
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Price Changes:</strong> We reserve the right to modify our pricing structure at any time.
                      Current customers will not be affected by price changes for services already purchased. New
                      pricing will apply to future purchases only.
                    </p>
                  </div>
                </section>

                <section className="border-l-4 border-slate-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm mr-3">
                      4
                    </span>
                    User Obligations and Prohibited Activities
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">✓ Permitted Uses</h3>
                      <ul className="space-y-2 text-sm text-green-800">
                        <li>• Educational and reference purposes</li>
                        <li>• Personal learning and development</li>
                        <li>• Template creation for inspiration</li>
                        <li>• Research and academic study</li>
                        <li>• Compliance with all applicable laws</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-900 mb-3">✗ Prohibited Activities</h3>
                      <ul className="space-y-2 text-sm text-red-800">
                        <li>• Creating illegal, harmful, or discriminatory content</li>
                        <li>• Reverse engineering our AI technology</li>
                        <li>• Generating fraudulent or deceptive documents</li>
                        <li>• Violating intellectual property rights</li>
                        <li>• Attempting unauthorized system access</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-slate-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm mr-3">
                      5
                    </span>
                    Intellectual Property and Ownership
                  </h2>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Tempnow Solutions Ltd Owns</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li>• AI algorithms and technology</li>
                          <li>• Platform software and infrastructure</li>
                          <li>• {settings.siteName} brand and trademarks</li>
                          <li>• Website design and content</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">You Own</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li>• Your input content and specifications</li>
                          <li>• Generated documents (subject to these Terms)</li>
                          <li>• Your account data and preferences</li>
                          <li>• Rights to use generated content appropriately</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-slate-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm mr-3">
                      6
                    </span>
                    Disclaimers and Limitation of Liability
                  </h2>
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-red-900 mb-4">IMPORTANT LEGAL DISCLAIMERS</h3>
                    <div className="space-y-4 text-sm text-red-800">
                      <div>
                        <h4 className="font-semibold mb-2">Service Warranty Disclaimer</h4>
                        <p>
                          OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER
                          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                          PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Limitation of Liability</h4>
                        <p>
                          TO THE MAXIMUM EXTENT PERMITTED BY LAW, MONZIC SOLUTIONS LTD SHALL NOT BE LIABLE FOR ANY
                          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED
                          TO LOSS OF PROFITS, DATA, USE, OR GOODWILL.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Maximum Liability Cap</h4>
                        <p>
                          OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE
                          TWELVE (12) MONTHS PRECEDING THE CLAIM, OR £100, WHICHEVER IS GREATER.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-slate-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm mr-3">
                      7
                    </span>
                    Governing Law and Jurisdiction
                  </h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-3">Applicable Law</h4>
                        <p className="text-sm text-blue-800">
                          These Terms shall be governed by and construed in accordance with the laws of England and
                          Wales, without regard to conflict of law principles.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-3">Jurisdiction</h4>
                        <p className="text-sm text-blue-800">
                          Any disputes arising out of or relating to these Terms or our Services shall be subject to the
                          exclusive jurisdiction of the courts of England and Wales.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-slate-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm mr-3">
                      8
                    </span>
                    Contact and Legal Notices
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Legal Inquiries</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          For questions regarding these Terms, legal matters, or compliance issues, please contact us
                          through our website contact form and mark your inquiry as "Legal" or "Terms of Service."
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Company Information</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>Tempnow Solutions Ltd</strong>
                          </p>
                          <p>Company Registration: 16414928</p>
                          <p>Registered in England and Wales</p>
                          <p>Contact: Website contact form</p>
                        </div>
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
                    <strong>Tempnow Solutions Ltd</strong> • Company Registration: 16414928 • Registered in England and
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
            © {new Date().getFullYear()} {settings?.companyName || 'Mozero AI Ltd'}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
