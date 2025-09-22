"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, FileText, ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { useRouter } from "next/navigation"

export default function PaymentConfirmationPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)
  const [policyNumber, setPolicyNumber] = useState("")

  useEffect(() => {
    // Generate random policy number
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString()
    const generatedPolicyNumber = `POL-${randomDigits}`
    setPolicyNumber(generatedPolicyNumber)

    // Store policy number in localStorage for later use
    localStorage.setItem("latestPolicyNumber", generatedPolicyNumber)

    // Simulate payment processing
    const timer = setTimeout(() => {
      setIsProcessing(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
            <p className="text-gray-600">Please wait while we process your payment...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="px-4 sm:px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Your document has been purchased successfully. You should receive an email confirmation shortly.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Policy Number:</span>
                  <span className="font-medium">{policyNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString("en-GB")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium">£10.18</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/policy/view?number=${policyNumber}`}>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>View Documents</span>
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
