"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Save,
  RefreshCw,
  Clock,
  FileText,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Copy,
  Eye,
  Send,
  ExternalLink,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Default templates
const defaultTemplates = {
  policyConfirmation: {
    subject: "Your Policy Confirmation - {{policyNumber}}",
    content: `Dear {{firstName}} {{lastName}},

Thank you for purchasing a policy with MONZIC. Your policy is now active.

Policy Details:
- Policy Number: {{policyNumber}}
- Coverage Type: {{coverageType}}
- Start Date: {{startDate}}
- End Date: {{endDate}}
- Premium: £{{premium}}

Vehicle Details:
- Registration: {{vehicleReg}}
- Make: {{vehicleMake}}
- Model: {{vehicleModel}}
- Year: {{vehicleYear}}

You can view your policy details and documents anytime by clicking the button below:

[View Policy Documents]({{policyViewLink}})

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The MONZIC Team`,
  },
  verificationCode: {
    subject: "Your Verification Code - MONZIC",
    content: `Dear {{firstName}},

Your verification code is: {{code}}

This code will expire in {{expiryMinutes}} minutes.

If you did not request this code, please ignore this email.

Best regards,
The MONZIC Team`,
  },
  passwordReset: {
    subject: "Password Reset Request - MONZIC",
    content: `Dear {{firstName}},

We received a request to reset your password for your MONZIC account.

Click the link below to reset your password:
{{resetLink}}

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email.

Best regards,
The MONZIC Team`,
  },
  documentPurchase: {
    subject: "Your AI Document Purchase - MONZIC",
    content: `Dear {{firstName}} {{lastName}},

Thank you for purchasing an AI-generated document from MONZIC.

Order Details:
- Order ID: {{orderId}}
- Document Type: {{documentType}}
- Date: {{orderDate}}
- Amount: £{{amount}}

You can download your document using the link below:
{{downloadLink}}

This link will expire in 7 days.

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The MONZIC Team`,
  },
  policyExpiry: {
    subject: "Your Policy is About to Expire - {{policyNumber}}",
    content: `Dear {{firstName}} {{lastName}},

This is a reminder that your policy {{policyNumber}} will expire in 10 minutes.

Policy Details:
- Policy Number: {{policyNumber}}
- Coverage Type: {{coverageType}}
- Expiry Date: {{expiryDate}}
- Expiry Time: {{expiryTime}}

To ensure continuous coverage, please renew your policy by clicking the link below:
{{renewalLink}}

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The MONZIC Team`,
  },
  contactFormConfirmation: {
    subject: "We've Received Your Message - MONZIC Support",
    content: `Dear {{firstName}} {{lastName}},

Thank you for contacting MONZIC. We have received your message and created a support ticket for you.

Your Message Details:
- Subject: {{subject}}
- Submitted: {{submittedDate}}
- Ticket ID: {{ticketId}}

What happens next:
1. Our support team will review your message within 24 hours
2. You'll receive an email notification when we respond
3. You can view and reply to our responses using your personal ticket link

Your Personal Ticket Link:
{{ticketLink}}

Please bookmark this link as you can use it to:
- View our responses to your inquiry
- Reply with additional information
- Track the status of your request
- Upload files or documents if needed

Our support team is committed to providing you with excellent service. We'll get back to you as soon as possible.

If you have any urgent concerns, please don't hesitate to contact us directly.

Best regards,
The MONZIC Support Team`,
  },
  ticketReplyNotification: {
    subject: "New Response to Your Support Request - {{ticketId}}",
    content: `Dear {{firstName}} {{lastName}},

We have responded to your support request and wanted to let you know right away.

Ticket Details:
- Ticket ID: {{ticketId}}
- Subject: {{subject}}
- Status: {{status}}
- Last Updated: {{updatedDate}}

Our Response:
{{replyMessage}}

To view the full conversation and reply:
{{ticketLink}}

You can use this link to:
- Read our complete response
- Reply with additional questions
- Upload files or documents
- Track your request status

If this resolves your inquiry, no further action is needed. If you have additional questions, simply click the link above to continue the conversation.

Thank you for choosing MONZIC!

Best regards,
The MONZIC Support Team`,
  },
}

// Sample data for preview
const sampleData = {
  firstName: "John",
  lastName: "Smith",
  policyNumber: "POL-12345678",
  coverageType: "Comprehensive",
  startDate: "01/06/2023",
  endDate: "31/05/2024",
  premium: "499.99",
  vehicleReg: "AB12 CDE",
  vehicleMake: "Ford",
  vehicleModel: "Focus",
  vehicleYear: "2020",
  code: "123456",
  expiryMinutes: "15",
  orderNumber: "AI-123456",
  documentType: "Marketing Strategy Document",
  orderDate: "15/05/2023",
  amount: "10.00",
  orderId: "ORD-87654321",
  downloadLink: "https://monzic.co.uk/documents/download/12345",
  expiryDate: "31/05/2023",
  expiryTime: "23:59:59",
  renewalLink: "https://monzic.co.uk/renew/POL-12345678",
  ticketNumber: "TKT-789123",
  ticketSubject: "Unable to download policy document",
  ticketPriority: "High",
  ticketCategory: "Technical",
  createdDate: "15/05/2023 10:30 AM",
  ticketStatus: "In Progress",
  updatedDate: "16/05/2023 2:15 PM",
  assignedTo: "Support Team",
  replyMessage:
    "We've identified the issue and are working on a fix. Your document will be available for download within the next hour.",
  nextSteps: "We'll send you an email with the download link once the issue is resolved.",
  subject: "Unable to access my policy documents",
  submittedDate: "15/05/2023 10:30 AM",
  ticketId: "TKT-789123",
  ticketLink: "https://monzic.co.uk/ticket/TKT-789123-abc123",
  status: "Open",
  policyViewLink: "https://monzic.co.uk/policy/view?number=POL-12345678",
  resetLink: "https://monzic.co.uk/reset-password/abc123",
}

export function EmailTemplatesSection() {
  const [templates, setTemplates] = useState({ ...defaultTemplates })
  const [activeTemplate, setActiveTemplate] = useState("policyConfirmation")
  const [showPreview, setShowPreview] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{
    success?: boolean
    message?: string
    timestamp?: string
  } | null>(null)

  // Replace variables in template with sample data
  const replaceVariables = (text: string) => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return sampleData[variable as keyof typeof sampleData] || match
    })
  }

  const handleSave = async () => {
    try {
      // In a real app, save to database or API
      // For demo, just simulate a successful save
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSaveStatus({
        success: true,
        message: "Email templates saved successfully",
        timestamp: new Date().toLocaleTimeString(),
      })

      // Clear status after 5 seconds
      setTimeout(() => {
        setSaveStatus(null)
      }, 5000)
    } catch (error) {
      setSaveStatus({
        success: false,
        message: "Failed to save email templates",
        timestamp: new Date().toLocaleTimeString(),
      })
    }
  }

  const handleReset = () => {
    setTemplates({ ...defaultTemplates })
    setSaveStatus({
      success: true,
      message: "Templates reset to default",
      timestamp: new Date().toLocaleTimeString(),
    })

    // Clear status after 5 seconds
    setTimeout(() => {
      setSaveStatus(null)
    }, 5000)
  }

  const insertVariable = (variable: string) => {
    const templateType = activeTemplate as keyof typeof templates
    const currentContent = templates[templateType].content
    const textarea = document.getElementById("email-content") as HTMLTextAreaElement

    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = currentContent.substring(0, start) + `{{${variable}}}` + currentContent.substring(end)

      setTemplates({
        ...templates,
        [activeTemplate]: {
          ...templates[templateType as keyof typeof templates],
          content: newContent,
        },
      })

      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus()
        textarea.selectionStart = start + variable.length + 4 // +4 for {{ and }}
        textarea.selectionEnd = start + variable.length + 4
      }, 0)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Show a temporary success message
        const tempStatus = { ...saveStatus }
        setSaveStatus({
          success: true,
          message: "Copied to clipboard",
          timestamp: new Date().toLocaleTimeString(),
        })

        setTimeout(() => {
          setSaveStatus(tempStatus)
        }, 2000)
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err)
      })
  }

  // Get available variables for the current template
  const getAvailableVariables = () => {
    switch (activeTemplate) {
      case "policyConfirmation":
        return [
          "firstName",
          "lastName",
          "policyNumber",
          "coverageType",
          "startDate",
          "endDate",
          "premium",
          "vehicleReg",
          "vehicleMake",
          "vehicleModel",
          "vehicleYear",
          "policyViewLink",
        ]
      case "verificationCode":
        return ["firstName", "code", "expiryMinutes"]
      case "passwordReset":
        return ["firstName", "resetLink"]
      case "documentPurchase":
        return ["firstName", "lastName", "orderId", "documentType", "orderDate", "amount", "downloadLink"]
      case "policyExpiry":
        return ["firstName", "lastName", "policyNumber", "coverageType", "expiryDate", "expiryTime", "renewalLink"]
      case "contactFormConfirmation":
        return ["firstName", "lastName", "subject", "submittedDate", "ticketId", "ticketLink"]
      case "ticketReplyNotification":
        return ["firstName", "lastName", "ticketId", "subject", "status", "updatedDate", "replyMessage", "ticketLink"]
      default:
        return []
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
          <p className="text-gray-600">Customize email templates sent to customers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
            <Save className="h-4 w-4 mr-2" />
            Save Templates
          </Button>
        </div>
      </div>

      {saveStatus && (
        <div
          className={`bg-${saveStatus.success ? "green" : "red"}-50 border border-${saveStatus.success ? "green" : "red"}-200 rounded-lg p-4`}
        >
          <div className="flex items-center space-x-2">
            {saveStatus.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <span className={`${saveStatus.success ? "text-green-800" : "text-red-800"} font-medium`}>
              {saveStatus.message}
            </span>
            {saveStatus.timestamp && (
              <span className={`${saveStatus.success ? "text-green-600" : "text-red-600"} text-sm`}>
                ({saveStatus.timestamp})
              </span>
            )}
          </div>
        </div>
      )}

      <Tabs value={activeTemplate} onValueChange={setActiveTemplate} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 text-xs">
          <TabsTrigger value="policyConfirmation" className="flex items-center gap-1 px-2 py-2">
            <FileText className="h-3 w-3" />
            <span className="hidden sm:inline">Policy</span>
          </TabsTrigger>
          <TabsTrigger value="verificationCode" className="flex items-center gap-1 px-2 py-2">
            <Mail className="h-3 w-3" />
            <span className="hidden sm:inline">Verify</span>
          </TabsTrigger>
          <TabsTrigger value="passwordReset" className="flex items-center gap-1 px-2 py-2">
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </TabsTrigger>
          <TabsTrigger value="documentPurchase" className="flex items-center gap-1 px-2 py-2">
            <CreditCard className="h-3 w-3" />
            <span className="hidden sm:inline">Purchase</span>
          </TabsTrigger>
          <TabsTrigger value="policyExpiry" className="flex items-center gap-1 px-2 py-2">
            <Clock className="h-3 w-3" />
            <span className="hidden sm:inline">Expiry</span>
          </TabsTrigger>
          <TabsTrigger value="contactFormConfirmation" className="flex items-center gap-1 px-2 py-2">
            <Send className="h-3 w-3" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="ticketReplyNotification" className="flex items-center gap-1 px-2 py-2">
            <ExternalLink className="h-3 w-3" />
            <span className="hidden sm:inline">Reply</span>
          </TabsTrigger>
        </TabsList>

        {Object.keys(templates).map((templateKey) => (
          <TabsContent key={templateKey} value={templateKey} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {templateKey === "policyConfirmation" && <FileText className="h-5 w-5 text-blue-600" />}
                  {templateKey === "verificationCode" && <Mail className="h-5 w-5 text-purple-600" />}
                  {templateKey === "passwordReset" && <RefreshCw className="h-5 w-5 text-orange-600" />}
                  {templateKey === "documentPurchase" && <CreditCard className="h-5 w-5 text-green-600" />}
                  {templateKey === "policyExpiry" && <Clock className="h-5 w-5 text-red-600" />}
                  {templateKey === "contactFormConfirmation" && <Send className="h-5 w-5 text-teal-600" />}
                  {templateKey === "ticketReplyNotification" && <ExternalLink className="h-5 w-5 text-indigo-600" />}
                  {templateKey === "policyConfirmation" && "Policy Confirmation Email"}
                  {templateKey === "verificationCode" && "Verification Code Email"}
                  {templateKey === "passwordReset" && "Password Reset Email"}
                  {templateKey === "documentPurchase" && "Document Purchase Email"}
                  {templateKey === "policyExpiry" && "Policy Expiry Email"}
                  {templateKey === "contactFormConfirmation" && "Contact Form Confirmation Email"}
                  {templateKey === "ticketReplyNotification" && "Ticket Reply Notification Email"}
                </CardTitle>
                <CardDescription>
                  {templateKey === "policyConfirmation" && "Sent to customers when a new policy is created"}
                  {templateKey === "verificationCode" && "Sent when a verification code is requested"}
                  {templateKey === "passwordReset" && "Sent when user requests password reset"}
                  {templateKey === "documentPurchase" && "Sent after purchasing an AI-generated document"}
                  {templateKey === "policyExpiry" && "Sent 10 minutes before a policy expires"}
                  {templateKey === "contactFormConfirmation" && "Sent when someone submits the contact form"}
                  {templateKey === "ticketReplyNotification" && "Sent when admin replies to a contact form ticket"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email-subject">Email Subject</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email-subject"
                      value={templates[templateKey as keyof typeof templates].subject}
                      onChange={(e) =>
                        setTemplates({
                          ...templates,
                          [templateKey]: {
                            ...templates[templateKey as keyof typeof templates],
                            subject: e.target.value,
                          },
                        })
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(templates[templateKey as keyof typeof templates].subject)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="email-content">Email Content</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                      <Eye className="h-4 w-4 mr-2" />
                      {showPreview ? "Hide Preview" : "Show Preview"}
                    </Button>
                  </div>

                  {!showPreview ? (
                    <Textarea
                      id="email-content"
                      value={templates[templateKey as keyof typeof templates].content}
                      onChange={(e) =>
                        setTemplates({
                          ...templates,
                          [templateKey]: {
                            ...templates[templateKey as keyof typeof templates],
                            content: e.target.value,
                          },
                        })
                      }
                      className="min-h-[300px] font-mono text-sm"
                    />
                  ) : (
                    <div className="border rounded-md p-4 min-h-[300px] bg-white whitespace-pre-wrap">
                      {replaceVariables(templates[templateKey as keyof typeof templates].content)}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block">Available Variables</Label>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableVariables().map((variable) => (
                      <Badge
                        key={variable}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => insertVariable(variable)}
                      >
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Template Variables</AlertTitle>
                  <AlertDescription>
                    Click on a variable above to insert it into your template. Variables will be replaced with actual
                    data when the email is sent.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
