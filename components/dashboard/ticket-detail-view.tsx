"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth"
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Paperclip,
  X,
  FileText,
  ImageIcon,
  Download,
} from "lucide-react"

interface TicketMessage {
  id: string
  content: string
  sender: "user" | "admin"
  senderName: string
  timestamp: string
  attachments?: {
    name: string
    url: string
    type: string
  }[]
}

interface Ticket {
  id: string
  title: string
  description: string
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  customer: {
    name: string
    email: string
  }
  assignedTo?: string
  createdAt: string
  updatedAt: string
  category: string
  messages: TicketMessage[]
  hasUnreadReplies?: boolean
  lastViewedAt?: string
}

interface TicketDetailViewProps {
  ticket: Ticket
  onBack: () => void
  onSendMessage: (ticketId: string, message: string, attachments: File[]) => void
  onMarkAsRead: (ticketId: string) => void
}

export function TicketDetailView({ ticket, onBack, onSendMessage, onMarkAsRead }: TicketDetailViewProps) {
  const { user } = useAuth()
  const [replyMessage, setReplyMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "closed":
        return <XCircle className="w-4 h-4 text-gray-500" />
      default:
        return <AlertCircle className="w-4 h-4" />
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments((prev) => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSendReply = () => {
    if (!replyMessage.trim()) return

    onSendMessage(ticket.id, replyMessage, attachments)
    setReplyMessage("")
    setAttachments([])
  }

  // Mark as read when viewing
  React.useEffect(() => {
    if (ticket.hasUnreadReplies) {
      onMarkAsRead(ticket.id)
    }
  }, [ticket.id, ticket.hasUnreadReplies, onMarkAsRead])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
            <span className="text-sm text-gray-500">#{ticket.id}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={getStatusColor(ticket.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(ticket.status)}
                <span className="capitalize">{ticket.status.replace("-", " ")}</span>
              </div>
            </Badge>
            <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
              <span className="capitalize">{ticket.priority}</span>
            </Badge>
            <Badge variant="outline">{ticket.category}</Badge>
            {ticket.assignedTo && <Badge variant="outline">Assigned to {ticket.assignedTo}</Badge>}
          </div>
        </div>
      </div>

      {/* Messages */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {ticket.messages.map((message, index) => (
              <div
                key={message.id}
                className={`p-4 ${index !== ticket.messages.length - 1 ? "border-b" : ""} ${
                  message.sender === "user" ? "bg-blue-50/50" : "bg-gray-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      message.sender === "user" ? "bg-blue-500 text-white" : "bg-teal-500 text-white"
                    }`}
                  >
                    {message.senderName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{message.senderName}</span>
                      <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString()}</span>
                      {message.sender === "admin" && (
                        <Badge variant="outline" className="text-xs">
                          Support
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.content}</p>

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white rounded p-2 border text-xs">
                            {attachment.type.startsWith("image/") ? (
                              <ImageIcon className="w-4 h-4 text-blue-500" />
                            ) : (
                              <FileText className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="flex-1 truncate">{attachment.name}</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reply Section */}
      {ticket.status !== "closed" && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <Label className="text-sm font-medium">Reply to this ticket</Label>
              <Textarea
                placeholder="Type your message here..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={4}
              />

              {/* File Attachments */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="file-upload" className="text-xs text-gray-600">
                    Attachments (optional)
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Attach Files
                  </Button>
                </div>

                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2 text-sm">
                        {file.type.startsWith("image/") ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                        <span className="truncate max-w-32">{file.name}</span>
                        <button onClick={() => removeAttachment(index)} className="text-gray-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim()}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Reply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
