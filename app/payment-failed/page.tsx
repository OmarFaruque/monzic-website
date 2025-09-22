"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Header } from "@/components/header"

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="px-4 sm:px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
            <p className="text-lg text-gray-600 mb-8">
              We were unable to process your payment. Please check your payment details and try again.
            </p>

            <div className="bg-red-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-red-900 mb-2">Common Issues</h2>
              <ul className="text-sm text-red-800 text-left space-y-1">
                <li>• Insufficient funds in your account</li>
                <li>• Incorrect card details entered</li>
                <li>• Card expired or blocked</li>
                <li>• Network connection issues</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </Button>

              <Link href="/contact">
                <Button variant="outline" className="flex items-center space-x-2">
                  <span>Contact Support</span>
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link href="/">
                <Button variant="ghost" className="flex items-center space-x-2 mx-auto">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
