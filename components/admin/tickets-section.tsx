"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  MessageSquare,
  Clock,
  ArrowUpDown,
  Paperclip,
  X,
  Send,
  Download,
  Eye,
  Mail,
  Users,
  ExternalLink,
} from "lucide-react"
import { Label } from "@/components/ui/label"

import { getCustomerData } from "@/lib/policy-data"

// Mock ticket data - now includes contact form submissions
const mockTickets = [
  {
    id: "TKT-001",
    subject: "Policy Cancellation Request",
    customer: {
      name: "John Smith",
      email: "john.smith@example.com",
    },
    status: "Open",
    priority: "High",
    category: "Policy",
    type: "contact_form",
    createdAt: "2023-05-28T10:30:00",
    updatedAt: "2023-05-28T14:45:00",
    unreadMessages: 2,
    ticketLink: "https://monzic.co.uk/ticket/TKT-001-abc123",
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
        read: false,
        attachments: [],
      },
      {
        id: "MSG-004",
        sender: "customer",
        content: "I've also attached the vehicle transfer document for your reference.",
        timestamp: "2023-05-28T13:22:00",
        read: false,
        attachments: [
          {
            id: "ATT-002",
            name: "transfer_document.pdf",
            size: "320 KB",
            type: "application/pdf",
            url: "#",
          },
        ],
      },
    ],
  },
  {
    id: "TKT-002",
    subject: "General Inquiry - AI Document Services",
    customer: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
    },
    status: "Open",
    priority: "Medium",
    category: "General",
    type: "contact_form",
    createdAt: "2023-05-27T09:15:00",
    updatedAt: "2023-05-27T16:30:00",
    unreadMessages: 0,
    ticketLink: "https://monzic.co.uk/ticket/TKT-002-def456",
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
        attachments: [],
      },
    ],
  },
  {
    id: "TKT-003",
    subject: "Payment Issue",
    customer: {
      name: "Michael Brown",
      email: "m.brown@example.com",
    },
    status: "Pending",
    priority: "High",
    category: "Billing",
    type: "contact_form",
    createdAt: "2023-05-26T14:20:00",
    updatedAt: "2023-05-26T17:45:00",
    unreadMessages: 1,
    ticketLink: "https://monzic.co.uk/ticket/TKT-003-ghi789",
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
        id: "MSG-012",
        sender: "customer",
        content: "It's been 5 business days and I still haven't received the refund. Can you please check on this?",
        timestamp: "2023-05-26T17:45:00",
        read: false,
        attachments: [],
      },
    ],
  },
  {
    id: "TKT-004",
    subject: "Data Protection Inquiry",
    customer: {
      name: "Emma Wilson",
      email: "emma.w@example.com",
    },
    status: "Closed",
    priority: "Low",
    category: "Data Protection",
    type: "contact_form",
    createdAt: "2023-05-25T11:10:00",
    updatedAt: "2023-05-25T14:30:00",
    unreadMessages: 0,
    ticketLink: "https://monzic.co.uk/ticket/TKT-004-jkl012",
    messages: [
      {
        id: "MSG-013",
        sender: "customer",
        content: "I would like to know what personal data you have stored about me and request a copy under GDPR.",
        timestamp: "2023-05-25T11:10:00",
        read: true,
        attachments: [],
      },
      {
        id: "MSG-014",
        sender: "admin",
        content:
          "Thank you for your data protection request. I've prepared a comprehensive report of all personal data we have on file for you. Please find it attached. If you have any questions about this data or would like to make any changes, please let me know.",
        timestamp: "2023-05-25T12:45:00",
        read: true,
        attachments: [
          {
            id: "ATT-004",
            name: "personal_data_report.pdf",
            size: "156 KB",
            type: "application/pdf",
            url: "#",
          },
        ],
      },
      {
        id: "MSG-015",
        sender: "customer",
        content: "Thank you so much! This is exactly what I needed.",
        timestamp: "2023-05-25T13:20:00",
        read: true,
        attachments: [],
      },
    ],
  },
]

export function TicketsSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("latest")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    message: "",
    attachments: [] as File[],
  })
  const [customerSearch, setCustomerSearch] = useState("")
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  const mockCustomers = getCustomerData()

  const handleCustomerSearch = (searchTerm: string) => {
    setCustomerSearch(searchTerm)

    if (searchTerm.trim() === "") {
      setFilteredCustomers([])
      setShowCustomerDropdown(false)
      return
    }

    const filtered = mockCustomers.filter(
      (customer) =>
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    setFilteredCustomers(filtered.slice(0, 10))
    setShowCustomerDropdown(true)
  }

  const selectCustomer = (customer: any) => {
    setEmailData({ ...emailData, to: customer.email })
    setCustomerSearch(`${customer.firstName} ${customer.lastName} (${customer.email})`)
    setShowCustomerDropdown(false)
  }

  const handleSendEmail = async () => {
    if (!emailData.to || !emailData.subject || !emailData.message) {
      alert("Please fill in all required fields")
      return
    }

    try {
      // In a real app, you would send this to your email API
      console.log("Sending email:", emailData)
      alert("Email sent successfully!")
      setIsEmailDialogOpen(false)
      setEmailData({ to: "", subject: "", message: "", attachments: [] })
      setCustomerSearch("")
    } catch (error) {
      alert("Failed to send email")
    }
  }

  const handleEmailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setEmailData({ ...emailData, attachments: [...emailData.attachments, ...newFiles] })
    }
  }

  const removeEmailAttachment = (index: number) => {
    const newAttachments = emailData.attachments.filter((_, i) => i !== index)
    setEmailData({ ...emailData, attachments: newAttachments })
  }

  const handleEmailAllCustomers = () => {
    const allEmails = mockCustomers.map((c) => c.email).join(", ")
    setEmailData({ ...emailData, to: allEmails })
    setIsEmailDialogOpen(true)
  }

  // Filter and sort tickets
  const filteredTickets = mockTickets
    .filter((ticket) => {
      // Apply status filter
      if (statusFilter !== "all" && ticket.status.toLowerCase() !== statusFilter) {
        return false
      }

      // Apply search filter
      return (
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "oldest":
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        case "priority-high":
          const priorityOrder = { High: 3, Medium: 2, Low: 1 }
          return (
            priorityOrder[b.priority as keyof typeof priorityOrder] -
            priorityOrder[a.priority as keyof typeof priorityOrder]
          )
        case "priority-low":
          const priorityOrderReverse = { High: 3, Medium: 2, Low: 1 }
          return (
            priorityOrderReverse[a.priority as keyof typeof priorityOrderReverse] -
            priorityOrderReverse[b.priority as keyof typeof priorityOrderReverse]
          )
        case "alphabetical":
          return a.subject.localeCompare(b.subject)
        default:
          return 0
      }
    })

  const handleOpenTicket = (ticket: any) => {
    setSelectedTicket({
      ...ticket,
      messages: ticket.messages.map((msg: any) => ({
        ...msg,
        read: true,
      })),
      unreadMessages: 0,
    })
    setIsTicketDialogOpen(true)
    setNewMessage("")
    setAttachments([])

    // Scroll to bottom of messages after dialog opens
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return

    // In a real app, you would send the message and attachments to the server
    // For this demo, we'll just update the local state
    const newMsg = {
      id: `MSG-${Math.floor(Math.random() * 1000)}`,
      sender: "admin",
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: true,
      attachments: attachments.map((file, index) => ({
        id: `ATT-${Math.floor(Math.random() * 1000)}`,
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        type: file.type,
        url: "#",
      })),
    }

    setSelectedTicket({
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMsg],
      updatedAt: new Date().toISOString(),
    })

    setNewMessage("")
    setAttachments([])

    // In a real app, this would trigger an email to the customer with the ticket link
    console.log("Would send email notification to:", selectedTicket.customer.email)
    console.log("Ticket link:", selectedTicket.ticketLink)

    // Scroll to bottom after sending message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
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
        return <Badge className="bg-blue-100 text-blue-800">Open</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  const copyTicketLink = (ticketLink: string) => {
    navigator.clipboard.writeText(ticketLink)
    alert("Ticket link copied to clipboard!")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Form Submissions & Support Tickets</CardTitle>
        <CardDescription>Manage customer inquiries from contact forms and support requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest Updated</SelectItem>
                  <SelectItem value="oldest">Oldest Updated</SelectItem>
                  <SelectItem value="priority-high">Highest Priority</SelectItem>
                  <SelectItem value="priority-low">Lowest Priority</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEmailDialogOpen(true)}>
                <Mail className="h-4 w-4 mr-2" />
                Email Customer
              </Button>
              <Button variant="outline" onClick={handleEmailAllCustomers}>
                <Users className="h-4 w-4 mr-2" />
                Email All
              </Button>
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {ticket.subject}
                        {ticket.unreadMessages > 0 && (
                          <Badge className="bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {ticket.unreadMessages}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ticket.customer.name}</div>
                        <div className="text-sm text-gray-500">{ticket.customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(ticket.updatedAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenTicket(ticket)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => copyTicketLink(ticket.ticketLink)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No tickets found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Ticket Dialog */}
        <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{selectedTicket?.id}</span>
                  <span className="text-gray-400">|</span>
                  <span>{selectedTicket?.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedTicket && getStatusBadge(selectedTicket.status)}
                  {selectedTicket && getPriorityBadge(selectedTicket.priority)}
                  <Button variant="outline" size="sm" onClick={() => copyTicketLink(selectedTicket.ticketLink)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </DialogTitle>
              <DialogDescription>
                <div className="flex items-center justify-between">
                  <div>
                    From: {selectedTicket?.customer.name} ({selectedTicket?.customer.email})
                  </div>
                  <div>Created: {selectedTicket && formatDate(selectedTicket.createdAt)}</div>
                </div>
                <div className="text-sm text-blue-600 mt-1">Customer Link: {selectedTicket?.ticketLink}</div>
              </DialogDescription>
            </DialogHeader>

            {selectedTicket && (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Message Thread */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-md mb-4">
                  {selectedTicket.messages.map((message: any) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.sender === "admin" ? "bg-blue-100 text-blue-900" : "bg-white border border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            {message.sender === "admin" ? "Support Agent" : selectedTicket.customer.name}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(message.timestamp)}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{message.content}</p>

                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <div className="text-xs font-medium text-gray-500">Attachments:</div>
                            {message.attachments.map((attachment: any) => (
                              <div
                                key={attachment.id}
                                className="flex items-center gap-2 bg-white rounded-md p-2 border border-gray-200"
                              >
                                <Paperclip className="h-4 w-4 text-gray-400" />
                                <span className="text-sm flex-1 truncate">{attachment.name}</span>
                                <span className="text-xs text-gray-500">{attachment.size}</span>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Download className="h-3 w-3" />
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

                {/* Reply Form */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attach Files
                      </Button>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedTicket.priority.toLowerCase()}
                        onValueChange={(value) => {
                          setSelectedTicket({
                            ...selectedTicket,
                            priority: value.charAt(0).toUpperCase() + value.slice(1),
                          })
                        }}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedTicket.status.toLowerCase()}
                        onValueChange={(value) => {
                          setSelectedTicket({
                            ...selectedTicket,
                            status: value.charAt(0).toUpperCase() + value.slice(1),
                          })
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Attachment Preview */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-white rounded-md p-2 border border-gray-200"
                        >
                          <Paperclip className="h-4 w-4 text-gray-400" />
                          <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                          <span className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your reply... (This will send an email notification to the customer with their ticket link)"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() && attachments.length === 0}
                      className="self-end"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send & Notify
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Email Dialog */}
        <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Email Customer</DialogTitle>
              <DialogDescription>Send an email to customers with attachments</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative">
                <Label htmlFor="customerSearch">Search Customer</Label>
                <Input
                  id="customerSearch"
                  value={customerSearch}
                  onChange={(e) => handleCustomerSearch(e.target.value)}
                  onFocus={() => {
                    if (customerSearch && filteredCustomers.length > 0) {
                      setShowCustomerDropdown(true)
                    }
                  }}
                  placeholder="Type customer name or email..."
                  className="w-full"
                />

                {showCustomerDropdown && filteredCustomers.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {filteredCustomers.map((customer: any) => (
                      <button
                        key={customer.customerId}
                        type="button"
                        onClick={() => selectCustomer(customer)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="emailTo">To</Label>
                <Input
                  id="emailTo"
                  value={emailData.to}
                  onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                  placeholder="customer@email.com"
                />
              </div>

              <div>
                <Label htmlFor="emailSubject">Subject</Label>
                <Input
                  id="emailSubject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  placeholder="Email subject"
                />
              </div>

              <div>
                <Label htmlFor="emailMessage">Message</Label>
                <Textarea
                  id="emailMessage"
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  placeholder="Type your message..."
                  rows={6}
                />
              </div>

              <div>
                <Label>Attachments</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("email-file-input")?.click()}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Add Files
                  </Button>
                  <input
                    id="email-file-input"
                    type="file"
                    multiple
                    onChange={handleEmailFileChange}
                    className="hidden"
                  />
                </div>

                {emailData.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {emailData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <Paperclip className="h-4 w-4 text-gray-400" />
                        <span className="text-sm flex-1">{file.name}</span>
                        <span className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</span>
                        <Button variant="ghost" size="sm" onClick={() => removeEmailAttachment(index)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail}>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
