"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTickets } from "@/hooks/use-tickets"
import { useAuth } from "@/context/auth"
import { TicketDetailView } from "./ticket-detail-view"
import {
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ticket,
  Plus,
  Paperclip,
  X,
  FileText,
  ImageIcon,
  Eye,
  MessageSquare,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function UserTicketsSection() {
  const { data: tickets, loading, error, markTicketAsRead, addMessageToTicket } = useTickets()
  const { user } = useAuth()
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "General Inquiry",
  })
  const [newTicketAttachments, setNewTicketAttachments] = useState<File[]>([])

  // Filter tickets for current user
  const userTickets = tickets.filter((ticket) => ticket.customer.email === user?.email)
  const selectedTicket = userTickets.find((ticket) => ticket.id === selectedTicketId)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-3 h-3 text-red-500" />
      case "in-progress":
        return <Clock className="w-3 h-3 text-yellow-500" />
      case "resolved":
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case "closed":
        return <XCircle className="w-3 h-3 text-gray-500" />
      default:
        return <MessageCircle className="w-3 h-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-50 text-red-700 border-red-200"
      case "in-progress":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "resolved":
        return "bg-green-50 text-green-700 border-green-200"
      case "closed":
        return "bg-gray-50 text-gray-700 border-gray-200"
      default:
        return "bg-blue-50 text-blue-700 border-blue-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-50 text-red-700 border-red-200"
      case "high":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const handleNewTicketFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setNewTicketAttachments((prev) => [...prev, ...files])
  }

  const removeNewTicketAttachment = (index: number) => {
    setNewTicketAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreateTicket = () => {
    if (!newTicket.title.trim() || !newTicket.description.trim()) return

    // Here you would typically create the ticket via API
    console.log("Creating new ticket:", newTicket, newTicketAttachments)

    // Reset form
    setNewTicket({
      title: "",
      description: "",
      priority: "medium",
      category: "General Inquiry",
    })
    setNewTicketAttachments([])
    setShowCreateDialog(false)

    // Show success notification
    alert("Support ticket created successfully!")
  }

  const handleSendMessage = (ticketId: string, message: string, attachments: File[]) => {
    addMessageToTicket(ticketId, message, attachments)
  }

  const handleMarkAsRead = (ticketId: string) => {
    markTicketAsRead(ticketId)
  }

  // If viewing a specific ticket, show the detail view
  if (selectedTicket) {
    return (
      <TicketDetailView
        ticket={selectedTicket}
        onBack={() => setSelectedTicketId(null)}
        onSendMessage={handleSendMessage}
        onMarkAsRead={handleMarkAsRead}
      />
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Tickets</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your support requests and get help from our team</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>Describe your issue and we'll help you resolve it quickly.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ticket-title">Subject *</Label>
                <Input
                  id="ticket-title"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="Brief description of your issue"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticket-priority">Priority</Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ticket-category">Category</Label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Billing">Billing</SelectItem>
                      <SelectItem value="Account">Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="ticket-description">Description *</Label>
                <Textarea
                  id="ticket-description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Please provide detailed information about your issue..."
                  rows={4}
                />
              </div>

              {/* File Attachments for New Ticket */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="new-ticket-file-upload" className="text-sm text-gray-600">
                    Attachments (optional)
                  </Label>
                  <Input
                    id="new-ticket-file-upload"
                    type="file"
                    multiple
                    onChange={handleNewTicketFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("new-ticket-file-upload")?.click()}
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Attach Files
                  </Button>
                </div>

                {newTicketAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newTicketAttachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2 text-sm">
                        {file.type.startsWith("image/") ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                        <span className="truncate max-w-24">{file.name}</span>
                        <button
                          onClick={() => removeNewTicketAttachment(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateTicket}
                  disabled={!newTicket.title.trim() || !newTicket.description.trim()}
                  className="flex-1"
                >
                  Create Ticket
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {userTickets.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Support Tickets</h3>
              <p className="text-gray-600 mb-4">You don't have any support tickets yet.</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {userTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="hover:shadow-sm transition-shadow border-l-4 border-l-teal-500 cursor-pointer"
              onClick={() => setSelectedTicketId(ticket.id)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{ticket.title}</h3>
                        <span className="text-xs text-gray-500">#{ticket.id}</span>
                        {ticket.hasUnreadReplies && (
                          <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">New Reply</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-xs ${getStatusColor(ticket.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(ticket.status)}
                            <span className="capitalize">{ticket.status.replace("-", " ")}</span>
                          </div>
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                          <span className="capitalize">{ticket.priority}</span>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {ticket.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500 ml-4">
                      <div>{new Date(ticket.createdAt).toLocaleDateString()}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{ticket.messages.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 line-clamp-2">{ticket.description}</p>

                  {/* View Action */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      Last updated: {new Date(ticket.updatedAt).toLocaleDateString()}
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      View Conversation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
