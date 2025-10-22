"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Paperclip,
  Send,
  Download,
  Eye,
  X,
  Clock,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowLeft,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Header } from "@/components/header"
import { useSettings } from "@/context/settings";

// Mock ticket data for testing
const mockTicketData: { [key: string]: any } = {
  "TKT-001-abc123": {
    id: "TKT-001",
    subject: "Policy Cancellation Request",
    customer: {
      name: "John Smith",
      email: "john.smith@example.com",
    },
    status: "Open",
    priority: "High",
    category: "Policy",
    createdAt: "2023-05-28T10:30:00",
    updatedAt: "2023-05-28T14:45:00",
    messages: [
      {
        id: "MSG-001",
        sender: "customer",
        content:
          "I would like to cancel my policy POL-123456 as I've sold my vehicle. Can you please process this and let me know if I'm eligible for any refund?",
        timestamp: "2023-05-28T10:30:00",
        read: true,
        attachments: [
          {
            id: "ATT-001",
            name: "sale_receipt.pdf",
            size: "245 KB",
            type: "application/pdf",
            url: "#",
          },
        ],
      },
      {
        id: "MSG-002",
        sender: "admin",
        content:
          "Thank you for your message. I can help you with cancelling your policy. Could you please confirm your policy number and the date you sold the vehicle?",
        timestamp: "2023-05-28T11:15:00",
        read: true,
        attachments: [],
      },
      {
        id: "MSG-003",
        sender: "customer",
        content: "My policy number is POL-123456 and I sold the vehicle on May 25th, 2023.",
        timestamp: "2023-05-28T13:20:00",
        read: true,
        attachments: [],
      },
    ],
  },
  "TKT-002-def456": {
    id: "TKT-002",
    subject: "General Inquiry - AI Document Services",
    customer: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
    },
    status: "Open",
    priority: "Medium",
    category: "General",
    createdAt: "2023-05-27T09:15:00",
    updatedAt: "2023-05-27T16:30:00",
    messages: [
      {
        id: "MSG-005",
        sender: "customer",
        content:
          "Hi, I'm interested in your AI document generation services. Can you tell me more about what types of documents you can create and the pricing?",
        timestamp: "2023-05-27T09:15:00",
        read: true,
        attachments: [],
      },
      {
        id: "MSG-006",
        sender: "admin",
        content:
          "Thank you for your interest! Our AI can generate various business documents including contracts, proposals, reports, and marketing materials. Pricing starts at £10 per document. Would you like me to send you our full service catalog?",
        timestamp: "2023-05-27T10:45:00",
        read: true,
        attachments: [
          {
            id: "ATT-005",
            name: "service_catalog.pdf",
            size: "1.2 MB",
            type: "application/pdf",
            url: "#",
          },
        ],
      },
    ],
  },
  "TKT-003-ghi789": {
    id: "TKT-003",
    subject: "Payment Issue",
    customer: {
      name: "Michael Brown",
      email: "m.brown@example.com",
    },
    status: "Resolved",
    priority: "High",
    category: "Billing",
    createdAt: "2023-05-26T14:20:00",
    updatedAt: "2023-05-26T17:45:00",
    messages: [
      {
        id: "MSG-009",
        sender: "customer",
        content: "I was charged twice for my policy renewal. Can you please check and refund the extra payment?",
        timestamp: "2023-05-26T14:20:00",
        read: true,
        attachments: [
          {
            id: "ATT-003",
            name: "bank_statement.jpg",
            size: "180 KB",
            type: "image/jpeg",
            url: "#",
          },
        ],
      },
      {
        id: "MSG-010",
        sender: "admin",
        content:
          "I apologize for the inconvenience. I can see that there was indeed a duplicate charge on your account. I've initiated a refund for the extra payment, which should be back in your account within 3-5 business days. Please let me know if you don't receive it by then.",
        timestamp: "2023-05-26T15:30:00",
        read: true,
        attachments: [],
      },
      {
        id: "MSG-011",
        sender: "customer",
        content: "Thank you for the quick response. I'll keep an eye out for the refund.",
        timestamp: "2023-05-26T16:15:00",
        read: true,
        attachments: [],
      },
      {
        id: "MSG-012",
        sender: "admin",
        content:
          "Great news! I've confirmed that the refund has been processed successfully. You should see it in your account within 1-2 business days. Is there anything else I can help you with?",
        timestamp: "2023-05-26T17:45:00",
        read: true,
        attachments: [],
      },
    ],
  },
}

export default function TicketPage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<any>(null)
  const [newMessage, setNewMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const settings = useSettings();

  useEffect(() => {
    // Load ticket data based on ID
    const ticketData = mockTicketData[params.id]
    if (ticketData) {
      setTicket(ticketData)
    }
  }, [params.id])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [ticket?.messages])

  const handleSubmitMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add new message to ticket
      const newMsg = {
        id: `MSG-${Date.now()}`,
        sender: "customer",
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: true,
        attachments: attachments.map((file, index) => ({
          id: `ATT-${Date.now()}-${index}`,
          name: file.name,
          size: `${Math.round(file.size / 1024)} KB`,
          type: file.type,
          url: "#",
        })),
      }

      setTicket({
        ...ticket,
        messages: [...ticket.messages, newMsg],
        updatedAt: new Date().toISOString(),
      })

      setNewMessage("")
      setAttachments([])
      setSubmitSuccess(true)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Failed to submit message:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachments([...attachments, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Open</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Closed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 border-red-200">High Priority</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium Priority</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low Priority</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        <Header />

        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Support Ticket Not Found</h2>
              <p className="text-gray-600 mb-6">
                The support ticket you're looking for doesn't exist or the link may have expired.
              </p>
              <div className="space-y-3">
                <Link href="/contact">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700">Submit New Support Request</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Return to Homepage
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer - Copied from home page */}
        <footer className="bg-teal-600 py-4 sm:py-6 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-white">
              <Link href="/privacy-policy" className="hover:text-teal-200 transition-colors text-center sm:text-left">
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-services"
                className="hover:text-teal-200 transition-colors text-center sm:text-left"
              >
                Terms of Services
              </Link>
              <Link href="/return-policy" className="hover:text-teal-200 transition-colors text-center sm:text-left">
                Return Policy
              </Link>
            </div>
            <div className="text-center mt-3 sm:mt-4 text-xs text-teal-100">© {new Date().getFullYear()} {settings?.companyName || 'Mozero AI Ltd'}. All rights reserved.</div>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-teal-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/contact" className="hover:text-teal-600">
              Support
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Ticket {ticket.id}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Back Button */}
          <div>
            <Link href="/contact">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Contact
              </Button>
            </Link>
          </div>

          {/* Ticket Header */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    Support Ticket #{ticket.id}
                  </CardTitle>
                  <CardDescription className="text-teal-100 mt-2 text-lg">{ticket.subject}</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                  <div className="space-y-1 text-gray-600">
                    <p>
                      <span className="font-medium">Name:</span> {ticket.customer.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {ticket.customer.email}
                    </p>
                    <p>
                      <span className="font-medium">Category:</span> {ticket.category}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Ticket Details</h4>
                  <div className="space-y-1 text-gray-600">
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Created:</span> {formatDate(ticket.createdAt)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Last Updated:</span> {formatDate(ticket.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="h-5 w-5 text-teal-600" />
                Conversation History
              </CardTitle>
              <CardDescription>
                You can reply to this conversation and our MONZIC support team will be notified immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6 mb-8">
                {ticket.messages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "admin" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                        message.sender === "admin"
                          ? "bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200"
                          : "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              message.sender === "admin" ? "bg-teal-600 text-white" : "bg-gray-600 text-white"
                            }`}
                          >
                            {message.sender === "admin"
                              ? "MS"
                              : ticket.customer.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                          </div>
                          <span className="font-semibold text-sm">
                            {message.sender === "admin" ? "MONZIC Support" : ticket.customer.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{message.content}</p>

                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Attachments:
                          </div>
                          {message.attachments.map((attachment: any) => (
                            <div
                              key={attachment.id}
                              className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
                            >
                              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-4 w-4 text-teal-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                                <p className="text-xs text-gray-500">{attachment.size}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-teal-50">
                                  <Eye className="h-4 w-4 text-teal-600" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-teal-50">
                                  <Download className="h-4 w-4 text-teal-600" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Success Message */}
              {submitSuccess && (
                <Alert className="mb-6 bg-green-50 border-green-200 shadow-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Message sent successfully!</strong> Our MONZIC support team will respond to your inquiry
                    soon.
                  </AlertDescription>
                </Alert>
              )}

              {/* Reply Form */}
              {ticket.status.toLowerCase() !== "closed" && (
                <div className="space-y-6 border-t border-gray-100 pt-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Send a Reply</h3>
                    <div>
                      <Label htmlFor="reply-message" className="text-sm font-medium text-gray-700">
                        Your Message
                      </Label>
                      <Textarea
                        id="reply-message"
                        placeholder="Type your message here... Our support team will be notified immediately."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="mt-2 min-h-[120px] focus:ring-teal-500 focus:border-teal-500"
                        rows={5}
                      />
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Attachments (optional)</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-teal-300 text-teal-700 hover:bg-teal-50"
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Add Files
                      </Button>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                      <span className="text-sm text-gray-500">Maximum 10MB per file</span>
                    </div>

                    {/* Attachment Preview */}
                    {attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200"
                          >
                            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-4 w-4 text-teal-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                              className="h-8 w-8 p-0 hover:bg-red-50 text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitMessage}
                      disabled={(!newMessage.trim() && attachments.length === 0) || isSubmitting}
                      className="bg-teal-600 hover:bg-teal-700 px-8 py-2 text-white font-medium shadow-lg"
                      size="lg"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Sending Reply..." : "Send Reply"}
                    </Button>
                  </div>
                </div>
              )}

              {ticket.status.toLowerCase() === "closed" && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>This support ticket has been closed.</strong> If you need further assistance, please{" "}
                    <Link href="/contact" className="underline font-medium hover:text-amber-900">
                      submit a new support request
                    </Link>
                    .
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer - Copied from home page */}
      <footer className="bg-teal-600 py-4 sm:py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-white">
            <Link href="/privacy-policy" className="hover:text-teal-200 transition-colors text-center sm:text-left">
              Privacy Policy
            </Link>
            <Link href="/terms-of-services" className="hover:text-teal-200 transition-colors text-center sm:text-left">
              Terms of Services
            </Link>
            <Link href="/return-policy" className="hover:text-teal-200 transition-colors text-center sm:text-left">
              Return Policy
            </Link>
          </div>
          <div className="text-center mt-3 sm:mt-4 text-xs text-teal-100">© {new Date().getFullYear()} {settings?.companyName || 'Mozero AI Ltd'}. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
