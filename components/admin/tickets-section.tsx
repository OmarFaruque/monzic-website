"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
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
  Loader2,
} from "lucide-react"
import { Label } from "@/components/ui/label"

type Message = {
  id: number
  ticketId: number
  messageId: string
  message: string
  isAdmin: boolean
  createdAt: string
  updatedAt: string
}

type Ticket = {
  id: number
  user_id: string | null
  first_name: string
  last_name: string
  email: string
  token: string
  policy_number: string | null
  unread: boolean
  is_closed: boolean
  subject: string
  status: string
  priority: string
  assigned_to: string | null
  created_at: string
  updated_at: string
  messages: Message[]
}

import { useTickets } from "@/hooks/use-tickets";

// ... (rest of the imports)

export function TicketsSection() {
  const { data: tickets, loading, error: ticketsError } = useTickets();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
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
  const [userSearch, setUserSearch] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users")
        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }
        const data = await response.json()
        setUsers(data.users || data)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return <div>Loading tickets...</div>;
  }

  if (ticketsError) {
    return <div>Error: {ticketsError}</div>;
  }

  const handleUserSearch = (searchTerm: string) => {
    setUserSearch(searchTerm)

    if (searchTerm.trim() === "") {
      setFilteredUsers([])
      setShowUserDropdown(false)
      return
    }

    const filtered = users.filter(
      (user) =>
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.firstName &&
          user.lastName &&
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    setFilteredUsers(filtered.slice(0, 10))
    setShowUserDropdown(true)
  }

  const selectUser = (user: any) => {
    const currentTo = emailData.to.split(",").map((e) => e.trim()).filter((e) => e)
    if (!currentTo.includes(user.email)) {
      const newTo = [...currentTo, user.email].join(", ")
      setEmailData({ ...emailData, to: newTo })
    }
    setUserSearch("")
    setShowUserDropdown(false)
  }

  const handleSendEmail = async () => {
    if (!emailData.to || !emailData.subject || !emailData.message) {
      alert("Please fill in all required fields: To, Subject, and Message.");
      return;
    }

    setIsSending(true);

    const recipients = emailData.to.split(",").map(email => email.trim()).filter(email => email);

    const emailPromises = recipients.map(recipient => {
      const formData = new FormData();
      formData.append('to', recipient);
      formData.append('subject', emailData.subject);
      formData.append('message', emailData.message);
      emailData.attachments.forEach(file => {
        formData.append('attachments', file);
      });

      return fetch('/api/send-email', {
        method: 'POST',
        body: formData,
      });
    });

    try {
      const results = await Promise.all(emailPromises);
      const failedDeliveries = results.filter(res => !res.ok);

      if (failedDeliveries.length > 0) {
        alert(`Failed to send email to ${failedDeliveries.length} recipient(s). Please check the console for details.`);
        console.error('Failed deliveries:', failedDeliveries);
      } else {
        alert(`Email successfully sent to ${recipients.length} recipient(s).`);
      }

      setIsEmailDialogOpen(false);
      setEmailData({ to: "", subject: "", message: "", attachments: [] });
      setUserSearch("");
    } catch (error) {
      console.error("Failed to send emails:", error);
      alert("An error occurred while sending the emails. Please try again.");
    } finally {
      setIsSending(false);
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

  const handleEmailAllUsers = () => {
    const allEmails = users.map((c) => c.email).join(", ")
    setEmailData({ ...emailData, to: allEmails })
    setIsEmailDialogOpen(true)
  }

  // Filter and sort tickets
  const filteredTickets = tickets
    .filter((ticket) => {
      // Apply status filter
      if (statusFilter !== "all" && ticket.status.toLowerCase() !== statusFilter) {
        return false
      }

      // Apply search filter
      return (
        ticket.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${ticket.first_name} ${ticket.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case "oldest":
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        case "priority-high":
          const priorityOrder = { high: 3, normal: 2, low: 1 }
          return (
            priorityOrder[b.priority as keyof typeof priorityOrder] -
            priorityOrder[a.priority as keyof typeof priorityOrder]
          )
        case "priority-low":
          const priorityOrderReverse = { low: 3, normal: 2, high: 1 }
          return (
            priorityOrderReverse[b.priority as keyof typeof priorityOrderReverse] -
            priorityOrderReverse[a.priority as keyof typeof priorityOrderReverse]
          )
        case "alphabetical":
          return a.subject.localeCompare(b.subject)
        default:
          return 0
      }
    })

  const handleOpenTicket = async (ticket: Ticket) => {
    try {
      const response = await fetch(`/api/admin/tickets/${ticket.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch ticket details")
      }
      const data = await response.json()
      setSelectedTicket(data)
      setIsTicketDialogOpen(true)
      setNewMessage("")
      setAttachments([])

      // Scroll to bottom of messages after dialog opens
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } catch (error) {
      console.error(error)
      alert("Failed to load ticket details.")
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return
    if (!selectedTicket) return

    try {
      // Save the message to the database
      const response = await fetch(`/api/admin/tickets/${selectedTicket.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: newMessage }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to send reply")
      }

      // Send email notification in the background with attachments
      const formData = new FormData();
      formData.append("to", selectedTicket.email);
      formData.append("name", `${selectedTicket.first_name} ${selectedTicket.last_name}`);
      formData.append("ticketId", selectedTicket.token);
      formData.append("message", newMessage);

      // Append attachments to the FormData
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      console.log("FormData content:", Array.from(formData.entries()));

      fetch("/api/admin/tickets/send-reply-email", {
        method: "POST",
        body: formData,
      });

      // Refetch ticket data to show the new message
      await handleOpenTicket(selectedTicket);
      setNewMessage("");
      setAttachments([]);
    } catch (error) {
      console.error(error);
      alert("Failed to send reply.");
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
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return "Invalid Date"; // Fallback for invalid date values
    }

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
                Email User
              </Button>
              <Button variant="outline" onClick={handleEmailAllUsers}>
                <Users className="h-4 w-4 mr-2" />
                Email All Users
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
                        {ticket.unread && (
                          <Badge className="bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center p-0 text-xs">
                            1
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{`${ticket.first_name} ${ticket.last_name}`}</div>
                        <div className="text-sm text-gray-500">{ticket.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(ticket.updated_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenTicket(ticket)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyTicketLink(`https://monzic.co.uk/ticket/${ticket.token}`)}
                        >
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyTicketLink(`https://monzic.co.uk/ticket/${selectedTicket.token}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </DialogTitle>
              <DialogDescription>
                <div className="flex items-center justify-between">
                  <div>
                    From: {selectedTicket?.firstName} {selectedTicket?.lastName} ({selectedTicket?.email})
                  </div>
                  <div>Created: {selectedTicket && formatDate(selectedTicket.createdAt)}</div>
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  Customer Link: {selectedTicket && `https://monzic.co.uk/ticket/${selectedTicket.token}`}
                </div>
              </DialogDescription>
            </DialogHeader>

            {selectedTicket && (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Message Thread */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-md mb-4">
                  {selectedTicket.messages.map((message: Message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.isAdmin ? "bg-blue-100 text-blue-900" : "bg-white border border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            {message.isAdmin
                              ? "Support Agent"
                              : `${selectedTicket.firstName} ${selectedTicket.lastName}`}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">{formatDate(message.createdAt)}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{message.message}</p>
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
                          <SelectItem value="normal">Normal</SelectItem>
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
              <DialogTitle>Email User</DialogTitle>
              <DialogDescription>Send an email to users with attachments</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative">
                <Label htmlFor="userSearch">Search User</Label>
                <Input
                  id="userSearch"
                  autoComplete="new-user-search"
                  value={userSearch}
                  onChange={(e) => handleUserSearch(e.target.value)}
                  onFocus={() => {
                    if (userSearch && filteredUsers.length > 0) {
                      setShowUserDropdown(true)
                    }
                  }}
                  placeholder="Type user name or email..."
                  className="w-full"
                />

                {showUserDropdown && filteredUsers.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {filteredUsers.map((user: any) => (
                      <button
                        key={user.email}
                        type="button"
                        onClick={() => selectUser(user)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
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
                  placeholder="customer@email.com, another@email.com"
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
              <Button onClick={handleSendEmail} disabled={isSending}>
                {isSending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" />Send Email</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}