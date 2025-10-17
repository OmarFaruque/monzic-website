"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CreditCard,
  Key,
  Database,
  Brain,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Save,
  TestTube,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Clock,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

function EmailTemplatesTab() {
  const [templates, setTemplates] = useState({
    policyConfirmation: {
      subject: "Your Policy Confirmation - {{policyNumber}}",
      content: `Dear {{firstName}} {{lastName}},

Thank you for choosing Tempnow! Your policy has been successfully created.

Policy Details:
- Policy Number: {{policyNumber}}
- Coverage Type: {{coverageType}}
- Start Date: {{startDate}}
- End Date: {{endDate}}
- Premium: £{{premium}}

Vehicle Details:
- Registration: {{vehicleReg}}
- Make & Model: {{vehicleMake}} {{vehicleModel}}
- Year: {{vehicleYear}}

You can view your policy details anytime by visiting our customer portal.

If you have any questions, please don't hesitate to contact us.

Best regards,
The Tempnow Team`,
    },
    verificationCode: {
      subject: "Your Verification Code - Tempnow",
      content: `Dear {{firstName}},

Your verification code is: {{code}}

This code will expire in {{expiryMinutes}} minutes.

If you did not request this code, please ignore this email.

Best regards,
The Tempnow Team`,
    },
    passwordReset: {
      subject: "Password Reset Request - Tempnow",
      content: `Dear {{firstName}},

We received a request to reset your password for your Tempnow account.

Click the link below to reset your password:
{{resetLink}}

This link will expire in {{expiryMinutes}} minutes.

If you did not request this password reset, please ignore this email and your password will remain unchanged.

Best regards,
The Tempnow Team`,
    },
    documentPurchase: {
      subject: "Your AI Document Purchase - Tempnow",
      content: `Dear {{firstName}} {{lastName}},

Thank you for purchasing an AI-generated document from Tempnow.

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
The Tempnow Team`,
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
The Tempnow Team`,
    },
    adminNotification: {
      subject: "New Purchase Notification - {{typeLabel}}",
      content: `A new {{typeLabel}} has been purchased on Tempnow.\n\nPurchase Details:\n- Customer: {{customerName}}\n- Email: {{customerEmail}}\n- Amount: £{{amount}}\n- Type: {{typeLabel}}\n- Time: {{time}}\n- Details: {{details}}\n\nPlease review this purchase in the admin dashboard if needed.`
    },
    ticketConfirmation: {
      subject: "Support Ticket Confirmation - {{ticketId}}",
      content: `Hello {{name}},\n\nThank you for contacting us. We have successfully received your support request and a ticket has been created for you.\n\nYour Ticket Details:\n- Ticket ID: {{ticketId}}\n- Status: Open\n- Next Step: Our team will review your request and get back to you shortly.\n\nYou can reference this ticket ID in any future communication with us regarding this matter. We aim to respond to all inquiries within 24 hours.\n\nBest regards,\nThe Tempnow Team`
    },
    ticketReply: {
      subject: "New Reply to Your Support Ticket - {{ticketId}}",
      content: `Hello {{name}},\n\nA support agent has replied to your ticket with the ID: {{ticketId}}.\n\nReply:\n{{message}}\n\nPlease contact us if you have further questions. We appreciate your patience.\n\nBest regards,\nThe Tempnow Team`
    },
    directEmail: {
      subject: "{{subject}}",
      content: `{{message}}`
    }
  })
  const [activeTemplate, setActiveTemplate] = useState("policyConfirmation")
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{
    success?: boolean
    message?: string
    timestamp?: string
  } | null>(null)

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/admin/email-templates");
      if (response.ok) {
        const data = await response.json();
        if (data.success && Object.keys(data.templates).length > 0) {
          setTemplates(data.templates);
        }
      }
    } catch (error) {
      console.error("Failed to load email templates:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templates }),
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus({
          success: true,
          message: "Email templates saved successfully",
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      setSaveStatus({
        success: false,
        message: "Failed to save email templates",
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

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
    resetLink: "https://monzic.co.uk/reset-password?token=abc123",
    orderId: "ORD-87654321",
    documentType: "Legal Document",
    orderDate: "15/05/2023",
    amount: "29.99",
    downloadLink: "https://monzic.co.uk/documents/download/12345",
    expiryDate: "31/05/2023",
    expiryTime: "23:59:59",
    renewalLink: "https://monzic.co.uk/renew/POL-12345678",
  }

  const replaceVariables = (text: string) => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return sampleData[variable as keyof typeof sampleData] || match
    })
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

      setTimeout(() => {
        textarea.focus()
        textarea.selectionStart = start + variable.length + 4
        textarea.selectionEnd = start + variable.length + 4
      }, 0)
    }
  }

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
        ]
      case "verificationCode":
        return ["firstName", "code", "expiryMinutes"]
      case "passwordReset":
        return ["firstName", "resetLink", "expiryMinutes"]
      case "documentPurchase":
        return ["firstName", "lastName", "orderId", "documentType", "orderDate", "amount", "downloadLink"]
      case "policyExpiry":
        return ["firstName", "lastName", "policyNumber", "coverageType", "expiryDate", "expiryTime", "renewalLink"]
      case "adminNotification":
        return ["typeLabel", "customerName", "customerEmail", "amount", "time", "details"]
      case "ticketConfirmation":
        return ["name", "ticketId"]
      case "ticketReply":
        return ["name", "ticketId", "message"]
      case "directEmail":
        return ["subject", "message"]
      default:
        return []
    }
  }

  const getTemplateIcon = (templateKey: string) => {
    switch (templateKey) {
      case "policyConfirmation":
        return <CheckCircle className="h-4 w-4" />
      case "verificationCode":
        return <Shield className="h-4 w-4" />
      case "passwordReset":
        return <Key className="h-4 w-4" />
      case "documentPurchase":
        return <CreditCard className="h-4 w-4" />
      case "policyExpiry":
        return <Clock className="h-4 w-4" />
      case "adminNotification":
        return <AlertTriangle className="h-4 w-4" />
      case "ticketConfirmation":
        return <CheckCircle className="h-4 w-4" />
      case "ticketReply":
        return <Mail className="h-4 w-4" />
      case "directEmail":
        return <Mail className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  const getTemplateTitle = (templateKey: string) => {
    switch (templateKey) {
      case "policyConfirmation":
        return "Policy Confirmation"
      case "verificationCode":
        return "Verification Code"
      case "passwordReset":
        return "Password Reset"
      case "documentPurchase":
        return "Document Purchase"
      case "policyExpiry":
        return "Policy Expiry"
      case "adminNotification":
        return "Admin Notification"
      case "ticketConfirmation":
        return "Ticket Confirmation"
      case "ticketReply":
        return "Ticket Reply"
      case "directEmail":
        return "Direct Email"
      default:
        return templateKey
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          Email Templates
        </CardTitle>
        <CardDescription>Customize email templates sent to customers for various events</CardDescription>
      </CardHeader>
      <CardContent>
        {saveStatus && (
          <div
            className={`mb-4 bg-${saveStatus.success ? "green" : "red"}-50 border border-${saveStatus.success ? "green" : "red"}-200 rounded-lg p-4`}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template List */}
          <div className="space-y-4">
            <h3 className="font-semibold">Templates</h3>
            <div className="space-y-2">
              {Object.keys(templates).map((templateKey) => (
                <Card
                  key={templateKey}
                  className={`cursor-pointer transition-colors ${
                    activeTemplate === templateKey ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTemplate(templateKey)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {getTemplateIcon(templateKey)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{getTemplateTitle(templateKey)}</h4>
                        <p className="text-xs text-gray-500 truncate">
                          {templateKey === "policyConfirmation" && "Sent when a new policy is created"}
                          {templateKey === "verificationCode" && "Sent when user requests verification"}
                          {templateKey === "passwordReset" && "Sent when user requests password reset"}
                          {templateKey === "documentPurchase" && "Sent after AI document purchase"}
                          {templateKey === "policyExpiry" && "Sent 10 minutes before policy expires"}
                          {templateKey === "adminNotification" && "Sent to admin on new purchase"}
                          {templateKey === "ticketConfirmation" && "Sent to user on new ticket"}
                          {templateKey === "ticketReply" && "Sent to user on ticket reply"}
                          {templateKey === "directEmail" && "Used for sending direct emails"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Edit Template: {getTemplateTitle(activeTemplate)}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? "Edit" : "Preview"}
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>

            {!showPreview ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={templates[activeTemplate as keyof typeof templates].subject}
                    onChange={(e) =>
                      setTemplates({
                        ...templates,
                        [activeTemplate]: {
                          ...templates[activeTemplate as keyof typeof templates],
                          subject: e.target.value,
                        },
                      })
                    }
                    placeholder="Email subject..."
                  />
                </div>

                <div>
                  <Label htmlFor="email-content">Email Content</Label>
                  <Textarea
                    id="email-content"
                    value={templates[activeTemplate as keyof typeof templates].content}
                    onChange={(e) =>
                      setTemplates({
                        ...templates,
                        [activeTemplate]: {
                          ...templates[activeTemplate as keyof typeof templates],
                          content: e.target.value,
                        },
                      })
                    }
                    placeholder="Email content..."
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label>Available Variables</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getAvailableVariables().map((variable) => (
                      <Badge
                        key={variable}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50"
                        onClick={() => insertVariable(variable)}
                      >
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Click on a variable to insert it at your cursor position</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Preview Subject</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="font-medium">
                      {replaceVariables(templates[activeTemplate as keyof typeof templates].subject)}
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Preview Content</Label>
                  <div className="p-4 bg-white border rounded-md max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-sans">
                      {replaceVariables(templates[activeTemplate as keyof typeof templates].content)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SettingsSection() {
  const [settings, setSettings] = useState({
    payment: {
      activeProcessor: "mollie", // Changed from "paddle" to "mollie"
    },
    paddle: {
      vendorId: "",
      apiKey: "",
      publicKey: "",
      webhookKey: "",
      environment: "production",
    },
    stripe: {
      publishableKey: "",
      secretKey: "",
      webhookSecret: "",
      environment: "production",
    },
    mollie: {
      apiKey: "test_JdvHNhyqCRGaPFhGfj8FRANGbP6UUk", // Added the test API key
      webhookSecret: "",
      environment: "test", // Changed to "test" since we're using test API key
    },
    square: {
      appId: "",
      appLocationId: "",
      accessToken: "",
      environment: "sandbox",
      paymentMethods: {
        card: true,
        googlePay: false,
        applePay: false,
      },
    },
    openai: {
      apiKey: "",
      model: "gpt-4",
      price: 2048,
      temperature: 0.7,
    },
    resend: {
      apiKey: "",
      domain: "monzic.co.uk",
      fromEmail: "noreply@monzic.co.uk",
    },
    vehicleApi: {
      apiKey: "",
      provider: "dvla",
      endpoint: "https://api.vehicledata.com",
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      requireTwoFactor: false,
      allowedDomains: ["monzic.co.uk"],
    },
    general: {
      siteName: "MONZIC",
      supportEmail: "support@tempnow.uk",
      adminEmail: "admin@tempnow.uk",
      timezone: "Europe/London",
      currency: "GBP",
      policyScheduleVisible: true,
      carSearchApiProvider: "dayinsure",
    },
    bank: {
      show: false,
      name: "",
      sortCode: "",
      accountNumber: "",
      reference: "Use your quote ID as the payment reference.",
      info: "Your payment will be processed within 2 business days.",
      discountPercentage: 0,
    },
    airwallex: {
      client_id: "",
      apikey: "",
      environment: "test",
    },
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load settings on component mount
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/settings")

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${await response.text()}`)
      }

      const result = await response.json()

      if (result.success && result.settings) {
        // Merge with defaults to ensure all properties exist
        setSettings((prevSettings) => ({
          ...prevSettings,
          ...result.settings,
          payment: {
            ...prevSettings.payment,
            ...result.settings.payment,
          },
        }))
      } else {
        setError(result.error || "Unknown error occurred")
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
      setError(error instanceof Error ? error.message : "Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const [showKeys, setShowKeys] = useState({
    paddle: false,
    stripe: false,
    mollie: false,
    square: false,
    openai: false,
    resend: false,
    vehicleApi: false,
  })

  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [testing, setTesting] = useState<Record<string, boolean>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false);

  const updateSetting = (section: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
    setHasChanges(true)
  }

  const updateSquarePaymentMethod = (method: 'card' | 'googlePay' | 'applePay', checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      square: {
        ...prev.square,
        paymentMethods: {
          ...prev.square.paymentMethods,
          [method]: checked,
        },
      },
    }));
    setHasChanges(true)
  }

  const toggleKeyVisibility = (section: string) => {
    setShowKeys((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const testConnection = async (service: string) => {
    setTesting((prev) => ({ ...prev, [service]: true }))

    try {
      const response = await fetch("/api/admin/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service,
          config: settings[service as keyof typeof settings],
        }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const result = await response.json()

      setTestResults((prev) => ({
        ...prev,
        [service]: {
          success: result.success,
          message: result.message,
          timestamp: new Date().toLocaleTimeString(),
        },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [service]: {
          success: false,
          message: error instanceof Error ? error.message : "Connection test failed",
          timestamp: new Date().toLocaleTimeString(),
        },
      }))
    } finally {
      setTesting((prev) => ({ ...prev, [service]: false }))
    }
  }

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setHasChanges(false)
        setTestResults((prev) => ({
          ...prev,
          save: {
            success: true,
            message: "Settings saved successfully",
            timestamp: new Date().toLocaleTimeString(),
          },
        }))
      } else {
        setTestResults((prev) => ({
          ...prev,
          save: {
            success: false,
            message: result.error || "Failed to save settings",
            timestamp: new Date().toLocaleTimeString(),
          },
        }))
      }
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        save: {
          success: false,
          message: error instanceof Error ? error.message : "Failed to save settings",
          timestamp: new Date().toLocaleTimeString(),
        },
      }))
    } finally {
      setIsSaving(false);
    }
  }

  const maskApiKey = (key: string) => {
    if (!key) return ""
    if (key.length <= 8) return "*".repeat(key.length)
    return key.substring(0, 4) + "*".repeat(key.length - 8) + key.substring(key.length - 4)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-8 h-8 border-4 border-t-teal-600 border-teal-200 rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings & Configuration</h2>
          <p className="text-gray-600">Manage API keys, integrations, and system settings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSettings} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={saveSettings} disabled={!hasChanges || isSaving} className="bg-teal-600 hover:bg-teal-700">
            {isSaving ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                </>
            ) : (
                <>
                    <Save className="h-4 w-4 mr-2" />
                    Save All Changes
                </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button variant="link" onClick={loadSettings} className="p-0 h-auto font-normal ml-2">
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {testResults.save && (
        <div
          className={`bg-${testResults.save.success ? "green" : "red"}-50 border border-${testResults.save.success ? "green" : "red"}-200 rounded-lg p-4`}
        >
          <div className="flex items-center space-x-2">
            {testResults.save.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <span className={`${testResults.save.success ? "text-green-800" : "text-red-800"} font-medium`}>
              {testResults.save.message}
            </span>
            <span className={`${testResults.save.success ? "text-green-600" : "text-red-600"} text-sm`}>
              ({testResults.save.timestamp})
            </span>
          </div>
        </div>
      )}

      <Tabs defaultValue="payment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          {/* <TabsTrigger value="vehicle" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Vehicle</span>
          </TabsTrigger> */}
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-6">
          {/* Payment Processor Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Payment Processor Selection
              </CardTitle>
              <CardDescription>Choose which payment processor to use for checkout</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="active-processor">Active Payment Processor</Label>
                  <Select
                    value={settings.payment.activeProcessor}
                    onValueChange={(value) => updateSetting("payment", "activeProcessor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paddle">
                        Paddle
                        <Badge className="ml-2 bg-blue-100 text-blue-800">Recommended</Badge>
                      </SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="mollie">Mollie</SelectItem>
                      <SelectItem value="airwallex">AirWallex</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    This processor will be used for all checkout transactions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paddle Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Paddle Payment Settings
                {settings.payment.activeProcessor === "paddle" && (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                )}
              </CardTitle>
              <CardDescription>Configure your Paddle payment processor integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paddle-vendor-id">Vendor ID</Label>
                  <Input
                    id="paddle-vendor-id"
                    placeholder="Enter your Paddle Vendor ID"
                    value={settings.paddle.vendorId}
                    onChange={(e) => updateSetting("paddle", "vendorId", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="paddle-environment">Environment</Label>
                  <Select
                    value={settings.paddle.environment}
                    onValueChange={(value) => updateSetting("paddle", "environment", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">
                        Sandbox
                        <Badge className="ml-2 bg-yellow-100 text-yellow-800">Test</Badge>
                      </SelectItem>
                      <SelectItem value="production">
                        Production
                        <Badge className="ml-2 bg-green-100 text-green-800">Live</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="paddle-api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="paddle-api-key"
                    type={showKeys.paddle ? "text" : "password"}
                    placeholder="Enter your Paddle API Key"
                    value={showKeys.paddle ? settings.paddle.apiKey : maskApiKey(settings.paddle.apiKey)}
                    onChange={(e) => updateSetting("paddle", "apiKey", e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleKeyVisibility("paddle")}>
                    {showKeys.paddle ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="paddle-client-token">Client Token</Label>
                <div className="flex gap-2">
                  <Input
                    id="paddle-client-token"
                    type={showKeys.paddle ? "text" : "password"}
                    placeholder="Enter your Paddle Client Token"
                    value={showKeys.paddle ? settings.paddle.clientToken : maskApiKey(settings.paddle.clientToken)}
                    onChange={(e) => updateSetting("paddle", "clientToken", e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleKeyVisibility("paddle")}>
                    {showKeys.paddle ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => testConnection("paddle")}
                disabled={testing.paddle || !settings.paddle.apiKey}
                variant="outline"
                className="w-full"
              >
                {testing.paddle ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Paddle Connection
                  </>
                )}
              </Button>

              {testResults.paddle && (
                <div
                  className={`p-3 rounded-lg border ${testResults.paddle.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                >
                  <div className="flex items-center space-x-2">
                    {testResults.paddle.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm font-medium ${testResults.paddle.success ? "text-green-800" : "text-red-800"}`}
                    >
                      {testResults.paddle.message}
                    </span>
                    <span className="text-xs text-gray-500">({testResults.paddle.timestamp})</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stripe Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
                Stripe Payment Settings
                {settings.payment.activeProcessor === "stripe" && (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                )}
              </CardTitle>
              <CardDescription>Configure your Stripe payment processor integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stripe-environment">Environment</Label>
                <Select
                  value={settings.stripe.environment}
                  onValueChange={(value) => updateSetting("stripe", "environment", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">
                      Test Mode
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800">Test</Badge>
                    </SelectItem>
                    <SelectItem value="production">
                      Live Mode
                      <Badge className="ml-2 bg-green-100 text-green-800">Live</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="stripe-publishable-key">Publishable Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="stripe-publishable-key"
                    type={showKeys.stripe ? "text" : "password"}
                    placeholder="pk_test_... or pk_live_..."
                    value={
                      showKeys.stripe ? settings.stripe.publishableKey : maskApiKey(settings.stripe.publishableKey)
                    }
                    onChange={(e) => updateSetting("stripe", "publishableKey", e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleKeyVisibility("stripe")}>
                    {showKeys.stripe ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="stripe-secret-key">Secret Key</Label>
                <Input
                  id="stripe-secret-key"
                  type="password"
                  placeholder="sk_test_... or sk_live_..."
                  value={settings.stripe.secretKey}
                  onChange={(e) => updateSetting("stripe", "secretKey", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="stripe-webhook-secret">Webhook Secret</Label>
                <Input
                  id="stripe-webhook-secret"
                  type="password"
                  placeholder="sk_test_... or sk_live_..."
                  value={settings.stripe.webhookSecret}
                  onChange={(e) => updateSetting("stripe", "webhookSecret", e.target.value)}
                />
                <small> This is used to verify webhook events from Stripe. <i>Webhook URL: {process.env.NEXT_PUBLIC_BASE_URL}/api/stripe-webhook</i></small>
              </div>

              <Button
                onClick={() => testConnection("stripe")}
                disabled={testing.stripe || !settings.stripe.secretKey}
                variant="outline"
                className="w-full"
              >
                {testing.stripe ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Stripe Connection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Airwallex Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
                Airwallex Payment Settings
              </CardTitle>
              <CardDescription>Configure your Airwallex payment processor integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="airwallex-environment">Environment</Label>
                <Select
                  value={settings?.airwallex?.environment}
                  onValueChange={(value) => updateSetting("airwallex", "environment", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">
                      Test Mode
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800">Test</Badge>
                    </SelectItem>
                    <SelectItem value="production">
                      Live Mode
                      <Badge className="ml-2 bg-green-100 text-green-800">Live</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="airwallex-publishable-key">Airwallex Client ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="airwallex-publishable-key"
                    type={showKeys.airwallex ? "text" : "password"}
                    placeholder="client id..."
                    value={
                      showKeys.airwallex ? settings?.airwallex?.client_id : maskApiKey(settings?.airwallex?.client_id)
                    }
                    onChange={(e) => updateSetting("airwallex", "client_id", e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleKeyVisibility("airwallex")}>
                    {showKeys.airwallex ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="airwallex-secret-key">API Key</Label>
                <Input
                  id="airwallex-secret-key"
                  type="password"
                  placeholder="apikey..."
                  value={settings?.airwallex?.apikey}
                  onChange={(e) => updateSetting("airwallex", "apikey", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="airwallex-webhook-secret">Webhook Secret</Label>
                <Input
                  id="airwallex-webhook-secret"
                  type="password"
                  placeholder="webhook secret..."
                  value={settings?.airwallex?.webhookSecret}
                  onChange={(e) => updateSetting("airwallex", "webhookSecret", e.target.value)}
                />
                <small> This is used to verify webhook events from Airwallex. <i>Webhook URL: {process.env.NEXT_PUBLIC_BASE_URL}/api/airwallex-webhook</i></small>
              </div>

              <Button
                onClick={() => testConnection("airwallex")}
                disabled={testing.airwallex || !settings?.airwallex?.apikey}
                variant="outline"
                className="w-full"
              >
                {testing.airwallex ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Airwallex Connection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Square Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-800" />
                Square Payment Settings
                {settings.payment.activeProcessor === "square" && (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                )}
              </CardTitle>
              <CardDescription>Configure your Square payment processor integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="square-environment">Environment</Label>
                <Select
                  value={settings.square.environment}
                  onValueChange={(value) => updateSetting("square", "environment", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">
                      Sandbox
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800">Test</Badge>
                    </SelectItem>
                    <SelectItem value="production">
                      Production
                      <Badge className="ml-2 bg-green-100 text-green-800">Live</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="square-app-id">App ID</Label>
                  <Input
                    id="square-app-id"
                    placeholder="Enter your Square App ID"
                    value={settings.square.appId}
                    onChange={(e) => updateSetting("square", "appId", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="square-location-id">App Location ID</Label>
                  <Input
                    id="square-location-id"
                    placeholder="Enter your Square Location ID"
                    value={settings.square.appLocationId}
                    onChange={(e) => updateSetting("square", "appLocationId", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="square-access-token">App Access Token</Label>
                <Input
                  id="square-access-token"
                  type={showKeys.square ? "text" : "password"}
                  placeholder="Enter your Square Access Token"
                  value={showKeys.square ? settings.square.accessToken : maskApiKey(settings.square.accessToken)}
                  onChange={(e) => updateSetting("square", "accessToken", e.target.value)}
                />
              </div>

              <div>
                <Label>Square Payment Methods</Label>
                <div className="mt-2 space-y-2 rounded-md border p-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="square-card" checked={settings.square.paymentMethods.card} onCheckedChange={(checked) => updateSquarePaymentMethod('card', !!checked)} />
                    <Label htmlFor="square-card">Card Payment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="square-google" checked={settings.square.paymentMethods.googlePay} onCheckedChange={(checked) => updateSquarePaymentMethod('googlePay', !!checked)} />
                    <Label htmlFor="square-google">Google Pay</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="square-apple" checked={settings.square.paymentMethods.applePay} onCheckedChange={(checked) => updateSquarePaymentMethod('applePay', !!checked)} />
                    <Label htmlFor="square-apple">Apple Pay</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mollie Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-600" />
                Mollie Payment Settings
                {settings.payment.activeProcessor === "mollie" && (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                )}
              </CardTitle>
              <CardDescription>Configure your Mollie payment processor integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mollie-environment">Environment</Label>
                <Select
                  value={settings.mollie.environment}
                  onValueChange={(value) => updateSetting("mollie", "environment", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">
                      Test Mode
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800">Test</Badge>
                    </SelectItem>
                    <SelectItem value="production">
                      Live Mode
                      <Badge className="ml-2 bg-green-100 text-green-800">Live</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mollie-api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="mollie-api-key"
                    type={showKeys.mollie ? "text" : "password"}
                    placeholder="test_... or live_..."
                    value={showKeys.mollie ? settings.mollie.apiKey : maskApiKey(settings.mollie.apiKey)}
                    onChange={(e) => updateSetting("mollie", "apiKey", e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleKeyVisibility("mollie")}>
                    {showKeys.mollie ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => testConnection("mollie")}
                disabled={testing.mollie || !settings.mollie.apiKey}
                variant="outline"
                className="w-full"
              >
                {testing.mollie ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Mollie Connection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Bank Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Bank Payment Settings
              </CardTitle>
              <CardDescription>
                Configure settings for manual bank transfers. This option will appear alongside your active payment processor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Checkbox
                  id="show-bank-payment"
                  checked={settings.bank.show}
                  onCheckedChange={(checked) => updateSetting("bank", "show", !!checked)}
                />
                <Label htmlFor="show-bank-payment" className="font-medium text-blue-800">
                  Enable Bank Payment option at checkout
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank-account-name">Account Name</Label>
                  <Input
                    id="bank-account-name"
                    placeholder="Enter your Bank Account Name"
                    value={settings.bank.name}
                    onChange={(e) => updateSetting("bank", "name", e.target.value)}
                    disabled={!settings.bank.show}
                  />
                </div>
                <div>
                  <Label htmlFor="bank-account-number">Account Number</Label>
                  <Input
                    id="bank-account-number"
                    placeholder="Enter your Bank Account Number"
                    value={settings.bank.accountNumber}
                    onChange={(e) => updateSetting("bank", "accountNumber", e.target.value)}
                    disabled={!settings.bank.show}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank-sort-code">Sort Code</Label>
                  <Input
                    id="bank-sort-code"
                    placeholder="e.g., 04-00-04"
                    value={settings.bank.sortCode}
                    onChange={(e) => updateSetting("bank", "sortCode", e.target.value)}
                    disabled={!settings.bank.show}
                  />
                </div>
                <div>
                  <Label htmlFor="bank-reference">Reference Information</Label>
                  <Input
                    id="bank-reference"
                    placeholder="e.g., Use your quote ID as the payment reference."
                    value={settings.bank.reference}
                    onChange={(e) => updateSetting("bank", "reference", e.target.value)}
                    disabled={!settings.bank.show}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bank-info-text">Additional Info Text</Label>
                <Textarea
                  id="bank-info-text"
                  placeholder="e.g., Your quote will be marked as paid once we confirm receipt of your payment."
                  value={settings.bank.info}
                  onChange={(e) => updateSetting("bank", "info", e.target.value)}
                  disabled={!settings.bank.show}
                />
              </div>
              <div>
                <Label htmlFor="bank-discount">Percentage Off for Bank Payment (%)</Label>
                <Input id="bank-discount" type="number" value={settings.bank.discountPercentage} onChange={(e) => updateSetting("bank", "discountPercentage", Number(e.target.value))} disabled={!settings.bank.show} />
                <p className="text-xs text-gray-500 mt-1">Apply a discount for customers who choose to pay via bank transfer. Enter 0 for no discount.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                OpenAI Settings
              </CardTitle>
              <CardDescription>Configure OpenAI for document generation and AI features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="openai-api-key"
                    type={showKeys.openai ? "text" : "password"}
                    placeholder="sk-..."
                    value={showKeys.openai ? settings.openai.apiKey : maskApiKey(settings.openai.apiKey)}
                    onChange={(e) => updateSetting("openai", "apiKey", e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleKeyVisibility("openai")}>
                    {showKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="openai-model">Model</Label>
                  <Select
                    value={settings.openai.model}
                    onValueChange={(value) => updateSetting("openai", "model", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">
                        GPT-4 <Badge className="ml-2 bg-green-100 text-green-800">Recommended</Badge>
                      </SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="openai-max-tokens">Price</Label>
                  <Input
                    id="openai-max-tokens"
                    type="number"
                    placeholder="2048"
                    value={settings.openai.price}
                    onChange={(e) => updateSetting("openai", "price", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button
                onClick={() => testConnection("openai")}
                disabled={testing.openai || !settings.openai.apiKey}
                variant="outline"
                className="w-full"
              >
                {testing.openai ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test AI Connection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
                
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-600" />
                Email Service (Resend)
              </CardTitle>
              <CardDescription>Configure email sending service for notifications and receipts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resend-api-key">Resend API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="resend-api-key"
                    type={showKeys.resend ? "text" : "password"}
                    placeholder="re_..."
                    value={showKeys.resend ? settings.resend.apiKey : maskApiKey(settings.resend.apiKey)}
                    onChange={(e) => updateSetting("resend", "apiKey", e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleKeyVisibility("resend")}>
                    {showKeys.resend ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resend-domain">Email Domain</Label>
                  <Input
                    id="resend-domain"
                    placeholder="monzic.co.uk"
                    value={settings.resend.domain}
                    onChange={(e) => updateSetting("resend", "domain", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="resend-from-email">From Email</Label>
                  <Input
                    id="resend-from-email"
                    placeholder="noreply@monzic.co.uk"
                    value={settings.resend.fromEmail}
                    onChange={(e) => updateSetting("resend", "fromEmail", e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={() => testConnection("resend")}
                disabled={testing.resend || !settings.resend.apiKey}
                variant="outline"
                className="w-full"
              >
                {testing.resend ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Email Service
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <EmailTemplatesTab />
        </TabsContent>

        <TabsContent value="vehicle" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-orange-600" />
                Vehicle Data API
              </CardTitle>
              <CardDescription>Configure vehicle data fetching service for insurance quotes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vehicle-api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="vehicle-api-key"
                    type={showKeys.vehicleApi ? "text" : "password"}
                    placeholder="Enter your Vehicle Data API Key"
                    value={showKeys.vehicleApi ? settings.vehicleApi.apiKey : maskApiKey(settings.vehicleApi.apiKey)}
                    onChange={(e) => updateSetting("vehicleApi", "apiKey", e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleKeyVisibility("vehicleApi")}>
                    {showKeys.vehicleApi ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => testConnection("vehicleApi")}
                disabled={testing.vehicleApi || !settings.vehicleApi.apiKey}
                variant="outline"
                className="w-full"
              >
                {testing.vehicleApi ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Vehicle API
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-gray-600" />
                General Settings
              </CardTitle>
              <CardDescription>Configure general application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting("general", "siteName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.general.currency}
                    onValueChange={(value) => updateSetting("general", "currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="policy-schedule-visible">Policy Schedule Document</Label>
                <Select
                  value={settings.general.policyScheduleVisible ? "visible" : "hidden"}
                  onValueChange={(value) => updateSetting("general", "policyScheduleVisible", value === "visible")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visible">Visible to customers</SelectItem>
                    <SelectItem value="hidden">Hidden from customers</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Control whether the Policy Schedule document appears in customer policy documents
                </p>
              </div>

              <div>
                <Label htmlFor="car-search-provider">Car Search API Provider</Label>
                <Select
                  value={settings.general.carSearchApiProvider}
                  onValueChange={(value) => updateSetting("general", "carSearchApiProvider", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dayinsure">Dayinsure</SelectItem>
                    <SelectItem value="mot">MOT</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the provider for vehicle registration lookups.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => updateSetting("general", "supportEmail", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={settings.general.adminEmail}
                    onChange={(e) => updateSetting("general", "adminEmail", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="site-domain">Site domain</Label>
                  <Input
                    id="site-domain"
                    type="text"
                    value={settings.general.siteDomain}
                    onChange={(e) => updateSetting("general", "siteDomain", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    type="text"
                    value={settings.general.companyName}
                    onChange={(e) => updateSetting("general", "companyName", e.target.value)}
                  />
                </div>

              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="company-registration">Company Registration</Label>
                    <Input
                      id="company-registration"
                      type="text"
                      value={settings.general.companyRegistration}
                      onChange={(e) => updateSetting("general", "companyRegistration", e.target.value)}
                    />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="company-registration">Checkbox content at checkout page</Label>
                    <Textarea
                      id="company-registration"
                      placeholder='e.g., I confirm I’ve read and agree to the <a href="/customer-terms-of-business" target="_blank">Terms of Service</a> and understand this is a non-refundable digital document service. || I acknowledge that all purchases are final and the information I have entered is accurate'
                      value={settings.general?.checkoutCheckboxContent}
                      onChange={(e) => updateSetting("general", "checkoutCheckboxContent", e.target.value)}
                    />
                    <small>Each entry should be separeted by ||</small>
                  </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>



      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">You have unsaved changes</span>
            </div>
            <Button onClick={saveSettings} size="sm" className="bg-yellow-600 hover:bg-yellow-700 w-full sm:w-auto" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Now'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
