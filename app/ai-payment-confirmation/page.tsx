"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, ArrowLeft, Download, Mail, Sparkles } from "lucide-react"
import { Header } from "@/components/header"
import { useRouter, useSearchParams } from "next/navigation"

export default function AIPaymentConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [orderNumber, setOrderNumber] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [documentType, setDocumentType] = useState("")

  useEffect(() => {
    // Generate random order number
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString()
    const generatedOrderNumber = `AI-${randomDigits}`
    setOrderNumber(generatedOrderNumber)

    // Get document content from localStorage
    const storedContent = localStorage.getItem("aiDocumentContent")
    const storedType = localStorage.getItem("aiDocumentType")

    if (storedContent) {
      setGeneratedContent(storedContent)
    }

    if (storedType) {
      setDocumentType(storedType)
    }

    // Store order number for later use
    localStorage.setItem("latestAIOrderNumber", generatedOrderNumber)

    // Simulate payment processing
    const timer = setTimeout(() => {
      setIsProcessing(false)

      // Send confirmation email (simulate API call)
      sendConfirmationEmail(generatedOrderNumber, storedType || "AI Generated Document")
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const sendConfirmationEmail = async (orderNum: string, docType: string) => {
    try {
      // In a real app, this would call your email API
      console.log(`Sending AI document confirmation email for order ${orderNum}`)

      // Simulate email sending
      const response = await fetch("/api/send-ai-document-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: orderNum,
          documentType: docType,
          customerEmail: localStorage.getItem("userEmail") || "customer@example.com",
          documentContent: generatedContent,
        }),
      })

      if (response.ok) {
        console.log("Confirmation email sent successfully")
      }
    } catch (error) {
      console.error("Failed to send confirmation email:", error)
    }
  }

  const handleDownloadPDF = async () => {
    if (!generatedContent) {
      console.error("No document content available")
      return
    }

    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()

      doc.setProperties({
        title: "Monzic AI Generated Document",
        subject: "AI Generated Document",
        author: "Monzic AI Documents",
        creator: "Monzic Solutions Ltd",
      })

      // Add header
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("Monzic - AI Generated Document", 20, 20)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30)
      doc.text(`Order Number: ${orderNumber}`, 20, 35)

      doc.line(20, 40, 190, 40)

      let yPosition = 50
      const pageHeight = doc.internal.pageSize.height
      const margin = 20
      const lineHeight = 6
      const maxWidth = 170

      const lines = generatedContent.split("\n")

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

      doc.save(`monzic-ai-document-${orderNumber}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)

      // Fallback to text download
      const textContent = `Monzic - AI Generated Document
Order Number: ${orderNumber}
Generated on: ${new Date().toLocaleDateString()}

${generatedContent.replace(/[#*]/g, "")}

---
Generated by Monzic AI Documents
© 2025 Monzic Solutions Ltd`

      const blob = new Blob([textContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `monzic-ai-document-${orderNumber}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
            <p className="text-gray-600">Please wait while we process your payment and prepare your document...</p>
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
              Your AI document has been generated and is ready for download. You should receive an email confirmation
              with the document attached shortly.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Document Type:</span>
                  <span className="font-medium">{documentType || "AI Generated Document"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString("en-GB")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium">£10.00</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button
                onClick={handleDownloadPDF}
                className="bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </Button>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h3 className="font-medium text-blue-900 mb-1">Email Confirmation Sent</h3>
                  <p className="text-sm text-blue-700">
                    We've sent a confirmation email with your document attached to your registered email address. If you
                    don't see it in your inbox, please check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/ai-documents">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Another Document</span>
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
