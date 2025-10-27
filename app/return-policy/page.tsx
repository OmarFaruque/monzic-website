"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { useSettings } from "@/context/settings";
import { Header } from "@/components/header"

export default function ReturnPolicyPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const settings = useSettings();


  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Mobile-Optimized Header */}
      <Header/>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-12 bg-gradient-to-br from-teal-50 to-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 sm:px-8 py-6 sm:py-8 text-white">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">Return Policy</h1>
                  <p className="text-red-100 mt-1 text-sm sm:text-base">Digital services policy and goodwill refunds</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="font-medium">Company</p>
                    <p className="text-red-100">{settings.companyName}</p>
                  </div>
                  <div>
                    <p className="font-medium">Registration</p>
                    <p className="text-red-100">{settings.companyRegistration}</p>
                  </div>
                  <div>
                    <p className="font-medium">Effective Date</p>
                    <p className="text-red-100">{new Date(settings.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-4 sm:px-8 py-6 sm:py-8">
              <div className="prose prose-sm sm:prose-lg max-w-none text-gray-700 space-y-6 sm:space-y-8">
                <section className="border-l-4 border-red-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm mr-3">
                      1
                    </span>
                    Policy Overview and Company Information
                  </h2>
                  <div className="bg-red-50 rounded-lg p-6 mb-4">
                    <p className="font-semibold text-gray-900 mb-2">Company Details:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p>
                          <strong>Legal Name:</strong> {settings.companyName}
                        </p>
                        <p>
                          <strong>Company Number:</strong> {settings.companyRegistration}
                        </p>
                        <p>
                          <strong>Jurisdiction:</strong> England and Wales
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Service Type:</strong> {settings.businessActivity}
                        </p>
                        <p>
                          <strong>Contact Method:</strong> Website contact form
                        </p>
                      </div>
                    </div>
                  </div>
                  <p>
                    This Return Policy ("Policy") governs the return and refund procedures for Tempnow Solutions Ltd's
                    ("Tempnow," "we," "us," or "our") artificial intelligence-powered document generation services. Due
                    to the digital nature of our services and immediate delivery model, this Policy establishes our
                    approach to customer satisfaction and goodwill refunds.
                  </p>
                </section>

                <section className="border-l-4 border-red-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm mr-3">
                      2
                    </span>
                    No Returns Policy
                  </h2>
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-amber-900 mb-2">Important Notice: No Returns Accepted</h3>
                        <p className="text-amber-800 text-sm mb-3">
                          <strong>
                            Tempnow Solutions Ltd does not accept returns for our digital AI document generation
                            services.
                          </strong>
                          Once a document has been generated and delivered, the service has been fully performed and
                          completed.
                        </p>
                        <p className="text-amber-800 text-sm">
                          This policy reflects the instantaneous nature of our digital service delivery and the
                          immediate value provided upon document generation and download.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-red-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm mr-3">
                      3
                    </span>
                    One-Time Goodwill Refund Policy
                  </h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Exceptional Circumstances Refund</h3>
                    <p className="text-sm text-blue-800 mb-4">
                      While we do not accept returns, Tempnow Solutions Ltd may, at our sole discretion, offer a
                      <strong> one-time goodwill refund</strong> in exceptional circumstances where a customer
                      experiences genuine dissatisfaction with our service.
                    </p>
                    <div className="bg-blue-100 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Key Conditions:</h4>
                      <ul className="space-y-1 text-sm text-blue-800">
                        <li>• Available only once per customer account</li>
                        <li>• Entirely at Tempnow's discretion</li>
                        <li>• Must be requested within 24 hours of purchase</li>
                        <li>• Requires detailed explanation of dissatisfaction</li>
                        <li>• Subject to verification and review process</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-red-900 mb-3">⚠️ Important Consequence</h3>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-900 mb-2">Service Access Termination</h4>
                        <p className="text-sm text-red-800">
                          <strong>
                            If a goodwill refund is granted, you will permanently lose access to all Tempnow Solutions
                            Ltd services.
                          </strong>
                          This includes the inability to create new accounts, access existing accounts, or use any of
                          our AI document generation services in the future.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-red-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm mr-3">
                      4
                    </span>
                    Refund Request Process
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Step 1: Initial Contact</h3>
                      <ul className="space-y-2 text-sm text-green-800">
                        <li>• Submit request via website contact form</li>
                        <li>• Mark inquiry as "Refund Request"</li>
                        <li>• Include complete order details</li>
                        <li>• Submit within 24 hours of purchase</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-3">Step 2: Documentation</h3>
                      <ul className="space-y-2 text-sm text-purple-800">
                        <li>• Provide detailed explanation of issue</li>
                        <li>• Include transaction reference number</li>
                        <li>• Describe specific service concerns</li>
                        <li>• Acknowledge service termination consequence</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Review and Decision Process</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="font-bold text-gray-600">1</span>
                        </div>
                        <p className="font-medium">Initial Review</p>
                        <p className="text-gray-600">2-3 business days</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="font-bold text-gray-600">2</span>
                        </div>
                        <p className="font-medium">Management Decision</p>
                        <p className="text-gray-600">Final determination</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="font-bold text-gray-600">3</span>
                        </div>
                        <p className="font-medium">Customer Notification</p>
                        <p className="text-gray-600">Decision communication</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-red-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm mr-3">
                      5
                    </span>
                    Non-Refundable Circumstances
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Goodwill refunds will NOT be considered for:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                          Change of mind after successful service delivery
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                          User errors in input specifications
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                          Misunderstanding of AI-generated content nature
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                          Requests submitted after 24-hour window
                        </li>
                      </ul>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                          Previous goodwill refund already granted
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                          Technical issues resolved through support
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                          Compatibility issues with user devices
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                          Dissatisfaction with AI content quality within normal parameters
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-red-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm mr-3">
                      6
                    </span>
                    Processing and Timeline
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-indigo-900 mb-3">If Goodwill Refund Approved</h3>
                      <ul className="space-y-2 text-sm text-indigo-800">
                        <li>• Processing time: 5-7 business days</li>
                        <li>• Refund to original payment method</li>
                        <li>• Full purchase amount refunded</li>
                        <li>• Immediate account termination</li>
                        <li>• Permanent service access restriction</li>
                      </ul>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-900 mb-3">If Request Declined</h3>
                      <ul className="space-y-2 text-sm text-orange-800">
                        <li>• Decision notification within 3 business days</li>
                        <li>• Detailed explanation provided</li>
                        <li>• No impact on service access</li>
                        <li>• Alternative support options offered</li>
                        <li>• Decision is final and binding</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-red-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm mr-3">
                      7
                    </span>
                    Consumer Rights and Legal Compliance
                  </h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Statutory Rights</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      This Policy does not affect your statutory rights under applicable consumer protection laws,
                      including the Consumer Rights Act 2015 and other relevant UK legislation. Where consumer
                      protection laws provide additional rights beyond those outlined in this Policy, such rights remain
                      in full effect.
                    </p>
                    <p className="text-sm text-blue-800">
                      This Policy is designed to complement, not replace, your legal rights while reflecting the unique
                      characteristics of digital service delivery and the immediate nature of our AI document generation
                      services.
                    </p>
                  </div>
                </section>

                <section className="border-l-4 border-red-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm mr-3">
                      8
                    </span>
                    Contact Information and Support
                  </h2>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Refund Requests</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          For goodwill refund requests, please use our website contact form and clearly mark your
                          inquiry as "Goodwill Refund Request." Include all required documentation and acknowledge the
                          service termination consequence.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Alternative Support</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Before requesting a refund, consider contacting our support team for technical assistance or
                          service guidance. Many concerns can be resolved through our standard support procedures.
                        </p>
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
                    <strong>{settings.companyName}</strong> • Company Registration: {settings.companyRegistration} • Registered in England and
                    Wales
                  </p>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Last updated: {new Date(settings.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
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
            © {new Date().getFullYear()} {settings.companyName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
