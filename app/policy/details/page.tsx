"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { useNotifications } from "@/hooks/use-notifications"
import { getPolicyByNumber } from "@/lib/policy-server"
import { FileText, Download, User, Car, Calendar, X, MessageSquare, ArrowLeft, Shield } from "lucide-react"

import { useSettings } from "@/context/settings";

export default function PolicyDetailsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addNotification } = useNotifications()
  const policyNumber = searchParams.get("number")
  const settings = useSettings();

  const [isVerified, setIsVerified] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [isDownloading, setIsDownloading] = useState(false)
  const [policyData, setPolicyData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is verified and load policy data
  useEffect(() => {
    const fetchPolicyData = async () => {
      if (!policyNumber) {
        router.push("/")
        return
      }

      const verified = sessionStorage.getItem(`policy_verified_${policyNumber}`)
      if (verified !== "true") {
        router.push(`/policy/view?number=${policyNumber}`)
        return
      }

      setIsVerified(true)

      try {
        // Load policy data
        const policy = await getPolicyByNumber(policyNumber)
        if (policy) {
          setPolicyData(policy)
        } else {
          addNotification({
            type: "error",
            title: "Policy Not Found",
            message: "The requested policy could not be found.",
          })
          router.push("/")
        }
      } catch (error) {
        console.error("Error loading policy:", error)
        addNotification({
          type: "error",
          title: "Error",
          message: "Failed to load policy details.",
        })
      } finally {
        setIsLoading(false)
      }
  }

  fetchPolicyData()
  }, [policyNumber, router, addNotification])

  const handleDownloadPDF = async () => {
    setIsDownloading(true)

    try {
      // Dynamically import jsPDF
      const { jsPDF } = await import("jspdf")

      // Create new PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Set font
      doc.setFont("helvetica")

      // Header
      doc.setFontSize(20)
      doc.setTextColor(13, 148, 136) // Teal color
      doc.text("Certificate of Motor Insurance", 105, 20, { align: "center" })

      doc.setFontSize(9)
      doc.setTextColor(102, 102, 102)
      doc.text(
        "Here is your insurance certificate and Schedule. Extensions are visible even after the expiration date",
        105,
        26,
        { align: "center" },
      )

      // Reset color for content
      doc.setTextColor(51, 51, 51)

      let yPosition = 40

      // Policy Information Box (Right side)
      doc.setFillColor(248, 249, 250)
      doc.rect(130, yPosition - 2, 65, 20, "F")
      doc.setDrawColor(229, 231, 235)
      doc.rect(130, yPosition - 2, 65, 20, "S")

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(13, 148, 136)
      doc.text("Policy Information", 132, yPosition + 2)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(51, 51, 51)
      doc.text(`Policy Number: ${policyData.policyNumber}`, 132, yPosition + 6)
      doc.text(`Valid From: ${formatDateTime(policyData.startDate, policyData.startDate.split(" ")[1])}`, 132, yPosition + 10)
      doc.text(`Valid Until: ${formatDateTime(policyData.endDate, policyData.endDate.split(" ")[1])}`, 132, yPosition + 14)

      // Holder Section (Left side)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(13, 148, 136)
      doc.text("Holder", 20, yPosition + 2)

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(51, 51, 51)
      doc.text(`Name: ${policyData.firstName} ${policyData.lastName}`, 20, yPosition + 7)
      doc.text(
        `Date of Birth: ${new Date(policyData.dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}`,
        20,
        yPosition + 12,
      )

      yPosition += 25

      // Vehicle Information Box (Right side)
      doc.setFillColor(248, 249, 250)
      doc.rect(130, yPosition - 2, 65, 22, "F")
      doc.setDrawColor(229, 231, 235)
      doc.rect(130, yPosition - 2, 65, 22, "S")

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(13, 148, 136)
      doc.text("Vehicle", 132, yPosition + 2)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(51, 51, 51)
      doc.text(`Make: ${policyData.vehicleMake}`, 132, yPosition + 6)
      doc.text(`Model: ${policyData.vehicleModel}`, 132, yPosition + 10)
      doc.text(`Registration: ${policyData.regNumber}`, 132, yPosition + 14)

      // Coverage Section (Left side)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(13, 148, 136)
      doc.text("Coverage", 20, yPosition + 2)

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(51, 51, 51)
      const coverageText =
        "The insurance policy provides comprehensive coverage for social, domestic, and pleasure purposes, including commuting. Additionally, it includes Class 1 business use."
      const splitCoverage = doc.splitTextToSize(coverageText, 100)
      doc.text(splitCoverage, 20, yPosition + 7)

      yPosition += 30

      // Restrictions & Exclusions
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(13, 148, 136)
      doc.text("Restrictions & Exclusions", 20, yPosition)

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(51, 51, 51)

      const restrictions = [
        "• Does not cover the carriage of passengers or goods for hire or reward.",
        "• Only provides coverage for the policyholder to drive the vehicle.",
        "• Does not provide coverage for the recovery of an impounded vehicle.",
        "• Please refer to your full policy document to familiarize yourself with any",
        "  specific restrictions and exclusions that may apply to your insurance coverage.",
      ]

      let restrictionY = yPosition + 5
      restrictions.forEach((restriction) => {
        const splitRestriction = doc.splitTextToSize(restriction, 170)
        doc.text(splitRestriction, 20, restrictionY)
        restrictionY += splitRestriction.length * 3.5
      })

      yPosition = restrictionY + 8

      // Endorsements
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(13, 148, 136)
      doc.text("Endorsements", 20, yPosition)

      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(51, 51, 51)
      doc.text("- Accidental Damage Fire & Theft Excess (001) -", 20, yPosition + 5)

      doc.setFont("helvetica", "normal")
      const endorsementText =
        "We will not be liable to cover the initial amount, as indicated below, for any claims or series of claims arising from a single event covered by the Accidental Damage Section and/or Fire and Theft Section of your policy."
      const splitEndorsement = doc.splitTextToSize(endorsementText, 170)
      doc.text(splitEndorsement, 20, yPosition + 10)

      yPosition += 20

      // Excess
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(13, 148, 136)
      doc.text("Excess", 20, yPosition)

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(51, 51, 51)
      doc.text("The mandatory excess for accidental damage, fire, and theft is set at", 20, yPosition + 5)

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(13, 148, 136)
      doc.text(`£250`, 20, yPosition + 12)

      yPosition += 20

      // Contact
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(13, 148, 136)
      doc.text("Contact", 20, yPosition)

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(51, 51, 51)
      const contactText =
        "For any inquiries or if you need to contact TEMPNOW regarding your policy, please fill out the contact form on our website. We will respond to your message as promptly as possible."
      const splitContact = doc.splitTextToSize(contactText, 170)
      doc.text(splitContact, 20, yPosition + 5)

      yPosition += 15

      // Underwriter Declaration
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(13, 148, 136)
      doc.text("Underwriter Declaration", 20, yPosition)

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(51, 51, 51)
      const declarationText =
        "I confirm that the insurance mentioned in this Certificate complies with the applicable laws in Great Britain, Northern Ireland, the Isle of Man, the Island of Guernsey, the Island of Jersey, and the Island of Alderney. This certification is provided on behalf of the authorizing insurers, Mulsanne Insurance Company Limited. Mulsanne Insurance Company Limited is licensed by the Financial Services Commission in Gibraltar to conduct insurance operations under the Financial Services (Insurance Companies) Act."
      const splitDeclaration = doc.splitTextToSize(declarationText, 170)
      doc.text(splitDeclaration, 20, yPosition + 5)

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(102, 102, 102)
      doc.text(`Certificate Generated on ${new Date().toLocaleDateString()}`, 105, 280, {
        align: "center",
      })

      // Save the PDF
      doc.save(`Certificate-${policyData.policyNumber}.pdf`)

      addNotification({
        type: "success",
        title: "PDF Downloaded",
        message: "Your certificate has been downloaded as a PDF file.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      addNotification({
        type: "error",
        title: "Download Failed",
        message: "There was an error generating the PDF. Please try again.",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear().toString().slice(-2)
    return `${day}/${month}/${year} ${timeString}`
  }

  const getPolicyStatus = (policy) => {
    if (!policy || !policy.startDate || !policy.endDate) {
        return "Unknown";
    }
    const now = new Date();
    const startDate = new Date(policy.startDate);
    const endDate = new Date(policy.endDate);

    if (endDate < now) {
      return "Expired";
    }
    if (startDate > now) {
      return "Upcoming";
    }
    return "Active";
  };

  const policyStatus = getPolicyStatus(policyData);


  console.log('settings: ', settings)


  if (isLoading || !isVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading policy details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!policyData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Policy Not Found</h1>
            <p className="text-gray-600 mb-6">The requested policy could not be found.</p>
            <Button onClick={() => router.push("/")} className="bg-teal-600 hover:bg-teal-700 text-white">
              Return to Home
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="px-3 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4 text-gray-600 hover:text-gray-900"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="bg-white rounded-xl p-3 sm:p-6 shadow-lg border border-gray-200">
            <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Policy {policyNumber}</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {policyData.customerFirstName} {policyData.customerSurname}
                </p>
              </div>
              <div className="flex justify-start">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    policyStatus === "Active"
                      ? "bg-green-100 text-green-800"
                      : policyStatus === "Expired"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {policyStatus}
                </span>
              </div>
            </div>

            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 sm:mb-6 w-full grid grid-cols-2">
                <TabsTrigger value="details" className="text-sm sm:text-base">
                  Policy Details
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-sm sm:text-base">
                  Documents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-2 sm:mb-3">
                      <Car className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mr-2" />
                      <h2 className="text-base sm:text-lg font-semibold">Vehicle Information</h2>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registration:</span>
                        <span className="font-medium">{policyData.regNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Make:</span>
                        <span className="font-medium">{policyData.vehicleMake}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model:</span>
                        <span className="font-medium">{policyData.vehicleModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Value:</span>
                        <span className="font-medium">{JSON.parse(policyData.quoteData)?.customerData?.vehicleValue}</span>
                        
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-2 sm:mb-3">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mr-2" />
                      <h2 className="text-base sm:text-lg font-semibold">Personal Details</h2>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium text-right">
                          {policyData.firstName} {policyData.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date of Birth:</span>
                        <span className="font-medium">{policyData.dateOfBirth ? new Date(policyData.dateOfBirth).toLocaleDateString() : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{policyData.phone}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium text-right">{policyData.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2 sm:mb-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mr-2" />
                    <h2 className="text-base sm:text-lg font-semibold">Policy Information</h2>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="flex justify-between sm:flex-col">
                        <span className="text-gray-600 text-sm">Policy Number:</span>
                        <span className="font-medium text-sm">{policyData.policyNumber}</span>
                      </div>
                      <div className="flex justify-between sm:flex-col">
                        
                      </div>
                      <div className="flex justify-between sm:flex-col">
                        <span className="text-gray-600 text-sm">Premium:</span>
                        <span className="font-medium text-sm">£{Number(policyData.update_price ?? policyData.cpw).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      <div className="flex justify-between sm:flex-col">
                        <span className="text-gray-600 text-sm">Valid From:</span>
                        <span className="font-medium text-sm text-right sm:text-left">
                          {formatDateTime(policyData.startDate, policyData.startDate.split(" ")[1])}
                        </span>
                      </div>
                      <div className="flex justify-between sm:flex-col">
                        <span className="text-gray-600 text-sm">Valid Until:</span>
                        <span className="font-medium text-sm text-right sm:text-left">
                          {formatDateTime(policyData.endDate, policyData.endDate.split(" ")[1])}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-3">
                    <MessageSquare className="w-5 h-5 text-teal-600 mr-2" />
                    <h2 className="text-lg font-semibold">Need Help?</h2>
                  </div>
                  <div className="space-y-3 text-sm">
                    <p>
                      For any inquiries or if you need assistance regarding your policy, please fill out the contact
                      form on our website. We will respond to your message as promptly as possible.
                    </p>
                    <div>
                      <a
                        href="/contact"
                        className="inline-flex items-center text-teal-600 hover:text-teal-700 hover:underline"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Form
                      </a>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                  <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Available Documents</h2>

                  <div className="space-y-2 sm:space-y-3">
                    <div
                      className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setShowCertificate(true)}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mr-2 sm:mr-3 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base truncate">Certificate of Motor Insurance</p>
                          <p className="text-xs text-gray-500">Insurance Certificate PDF</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-teal-600 ml-2 flex-shrink-0">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </div>
                    {settings?.policyScheduleVisible && (
                                              <div
                                                className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer"
                                                onClick={() =>
                                                  window.open(
                                                    `/api/generate-policy-schedule?number=${policyNumber}`,
                                                    "_blank"
                                                  )
                                                }
                                              >                        
                          <div className="flex items-center flex-1 min-w-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">Policy Schedule</p>
                            <p className="text-xs text-gray-500">Detailed policy terms and conditions</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-blue-600 ml-2 flex-shrink-0">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </div>
                    )}



                    {settings?.productInformationVisible && (
                      <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            window.open(
                              `${process.env.NEXT_PUBLIC_BASE_URL}/.pdf/monzit.pdf`,
                              "_blank"
                            )
                          }
                                              >                        
                          <div className="flex items-center flex-1 min-w-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 mr-2 sm:mr-3 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">Product Information</p>
                            <p className="text-xs text-gray-500">Detailed product information</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-pink-600 ml-2 flex-shrink-0">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </div>
                    )}


                    {settings?.statementOfFactVisible && (
                      <div
                        className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          window.open(
                            `/api/generate-statement-of-fact?number=${policyNumber}`,
                            "_blank"
                          )
                        }
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-2 sm:mr-3 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">Statement of Fact</p>
                            <p className="text-xs text-gray-500">View your statement of fact document</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-purple-600 ml-2 flex-shrink-0">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {showCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b">
              <h2 className="text-lg sm:text-xl font-bold">Certificate of Motor Insurance</h2>
              <button onClick={() => setShowCertificate(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-2 sm:p-4">
              <div className="bg-white border border-gray-300 rounded-lg p-3 sm:p-6 max-w-3xl mx-auto">
                <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {/* Mobile-first layout */}
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-teal-700 mb-2">Certificate of Motor Insurance</h1>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                      Here is your insurance certificate and Schedule. Extensions are visible even after the expiration
                      date
                    </p>

                    {/* Policy Information - Mobile first */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4">
                      <p className="text-xs sm:text-sm mb-1">
                        <span className="font-medium">Policy Number:</span> {policyData.policyNumber}
                      </p>
                      <p className="text-xs sm:text-sm mb-1">
                        <span className="font-medium">Valid From:</span>{" "}
                        {formatDateTime(policyData.startDate, policyData.startDate.split(" ")[1])}
                      </p>
                      <p className="text-xs sm:text-sm">
                        <span className="font-medium">Valid Until:</span>{" "}
                        {formatDateTime(policyData.endDate, policyData.endDate.split(" ")[1])}
                      </p>
                    </div>

                    {/* Vehicle Information - Mobile first */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-teal-700 mb-2">Vehicle</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                        <div>
                          <span className="font-medium">Make:</span> {policyData.vehicleMake}
                        </div>
                        <div>
                          <span className="font-medium">Model:</span> {policyData.vehicleModel}
                        </div>
                        <div>
                          <span className="font-medium">Registration:</span> {policyData.regNumber}
                        </div>
                      </div>
                    </div>

                    {/* Rest of certificate content with mobile-optimized text sizes */}
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-base sm:text-lg font-semibold text-teal-700 mb-2">Holder</h2>
                        <p className="text-xs sm:text-sm mb-1">
                          <span className="font-medium">Name:</span> {policyData.firstName}{" "}
                          {policyData.lastName}
                        </p>
                        <p className="text-xs sm:text-sm">
                          <span className="font-medium">Date of Birth:</span>{" "}
                          {new Date(policyData.dateOfBirth).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div>
                        <h2 className="text-base sm:text-lg font-semibold text-teal-700 mb-2">Coverage</h2>
                        <p className="text-xs sm:text-sm">
                          The insurance policy provides comprehensive coverage for social, domestic, and pleasure
                          purposes, including commuting. Additionally, it includes Class 1 business use.
                        </p>
                      </div>

                      <div>
                        <h2 className="text-base sm:text-lg font-semibold text-teal-700 mb-2">
                          Restrictions & Exclusions
                        </h2>
                        <ul className="text-xs sm:text-sm space-y-1">
                          <li>- Does not cover the carriage of passengers or goods for hire or reward.</li>
                          <li>- Only provides coverage for the policyholder to drive the vehicle.</li>
                          <li>- Does not provide coverage for the recovery of an impounded vehicle.</li>
                          <li>
                            - Please refer to your full policy document to familiarize yourself with any specific
                            restrictions and exclusions that may apply to your insurance coverage.
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h2 className="text-base sm:text-lg font-semibold text-teal-700 mb-2">Endorsements</h2>
                        <p className="text-xs sm:text-sm">
                          - Accidental Damage Fire & Theft Excess (001) -<br />
                          We will not be liable to cover the initial amount, as indicated below, for any claims or
                          series of claims arising from a single event covered by the Accidental Damage Section and/or
                          Fire and Theft Section of your policy.
                        </p>
                      </div>

                      <div>
                        <h2 className="text-base sm:text-lg font-semibold text-teal-700 mb-2">Excess</h2>
                        <p className="text-xs sm:text-sm">
                          The mandatory excess for accidental damage, fire, and theft is set at
                          <br />
                          <span className="font-bold text-sm sm:text-base">£250</span>
                        </p>
                      </div>

                      <div>
                        <h2 className="text-base sm:text-lg font-semibold text-teal-700 mb-2">Contact</h2>
                        <p className="text-xs sm:text-sm">
                          For any inquiries or if you need to contact TEMPNOW regarding your policy, please fill out the
                          contact form on our website. We will respond to your message as promptly as possible.
                        </p>
                      </div>

                      <div>
                        <h2 className="text-base sm:text-lg font-semibold text-teal-700 mb-2">
                          Underwriter Declaration
                        </h2>
                        <p className="text-xs sm:text-sm">
                          I confirm that the insurance mentioned in this Certificate complies with the applicable laws
                          in Great Britain, Northern Ireland, the Isle of Man, the Island of Guernsey, the Island of
                          Jersey, and the Island of Alderney. This certification is provided on behalf of the
                          authorizing insurers, Mulsanne Insurance Company Limited. Mulsanne Insurance Company Limited
                          is licensed by the Financial Services Commission in Gibraltar to conduct insurance operations
                          under the Financial Services (Insurance Companies) Act.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 border-t flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <Button variant="outline" onClick={() => setShowCertificate(false)} className="w-full sm:w-auto">
                  Close
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
