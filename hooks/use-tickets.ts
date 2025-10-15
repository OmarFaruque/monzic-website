"use client"

import { useState, useEffect } from "react"

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

// Mock data for demonstration
const mockTickets: Ticket[] = [
  {
    id: "1",
    title: "Unable to download policy document",
    description: "Customer cannot access their policy PDF after payment",
    status: "open",
    priority: "high",
    customer: {
      name: "John Smith",
      email: "john.smith@email.com",
    },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    category: "Technical",
    messages: [
      {
        id: "msg1",
        content: "Customer cannot access their policy PDF after payment",
        sender: "user",
        senderName: "John Smith",
        timestamp: "2024-01-15T10:30:00Z",
      },
    ],
  },
  {
    id: "2",
    title: "Question about coverage limits",
    description: "Customer needs clarification on their policy coverage",
    status: "in-progress",
    priority: "medium",
    customer: {
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
    },
    assignedTo: "Admin User",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-15T09:15:00Z",
    category: "General Inquiry",
    messages: [
      {
        id: "msg2",
        content: "Customer needs clarification on their policy coverage",
        sender: "user",
        senderName: "Sarah Johnson",
        timestamp: "2024-01-14T14:20:00Z",
      },
    ],
  },
  {
    id: "3",
    title: "Refund request",
    description: "Customer wants to cancel policy and get refund",
    status: "resolved",
    priority: "medium",
    customer: {
      name: "Mike Wilson",
      email: "mike.wilson@email.com",
    },
    assignedTo: "Admin User",
    createdAt: "2024-01-13T16:45:00Z",
    updatedAt: "2024-01-14T11:30:00Z",
    category: "Billing",
    messages: [
      {
        id: "msg3",
        content: "Customer wants to cancel policy and get refund",
        sender: "user",
        senderName: "Mike Wilson",
        timestamp: "2024-01-13T16:45:00Z",
      },
      {
        id: "msg4",
        content:
          "We've processed your refund request. You should see the refund in your account within 3-5 business days.",
        sender: "admin",
        senderName: "Support Team",
        timestamp: "2024-01-14T11:30:00Z",
      },
    ],
  },
  {
    id: "4",
    title: "AI Document Generation Issue",
    description:
      "I tried to generate an AI document but the payment went through and I didn't receive the PDF. Can you please help me get my document or process a refund?",
    status: "open",
    priority: "high",
    customer: {
      name: "Test User",
      email: "test@monzic.com",
    },
    createdAt: "2024-01-16T09:15:00Z",
    updatedAt: "2024-01-16T14:30:00Z",
    category: "Technical",
    hasUnreadReplies: true,
    lastViewedAt: "2024-01-16T09:15:00Z",
    messages: [
      {
        id: "msg5",
        content:
          "I tried to generate an AI document but the payment went through and I didn't receive the PDF. Can you please help me get my document or process a refund?",
        sender: "user",
        senderName: "Test User",
        timestamp: "2024-01-16T09:15:00Z",
      },
      {
        id: "msg6",
        content:
          "Hi Test User, I'm sorry to hear about this issue. I've located your payment and I can see the AI document generation failed on our end. I'm regenerating your document now and will send it to your email within the next few minutes. You should also receive a confirmation email once it's ready.",
        sender: "admin",
        senderName: "Support Team",
        timestamp: "2024-01-16T14:30:00Z",
      },
    ],
  },
  {
    id: "5",
    title: "Policy renewal question",
    description:
      "Hi, my policy is expiring next month and I wanted to know about the renewal process. Do I need to get a new quote or will it automatically renew?",
    status: "in-progress",
    priority: "medium",
    customer: {
      name: "Test User",
      email: "test@monzic.com",
    },
    assignedTo: "Support Team",
    createdAt: "2024-01-12T16:30:00Z",
    updatedAt: "2024-01-15T11:20:00Z",
    category: "General Inquiry",
    hasUnreadReplies: true,
    lastViewedAt: "2024-01-12T16:30:00Z",
    messages: [
      {
        id: "msg7",
        content:
          "Hi, my policy is expiring next month and I wanted to know about the renewal process. Do I need to get a new quote or will it automatically renew?",
        sender: "user",
        senderName: "Test User",
        timestamp: "2024-01-12T16:30:00Z",
      },
      {
        id: "msg8",
        content:
          "Hello! Great question about renewals. Your policy will not automatically renew - you'll need to get a new quote about 30 days before your expiration date. This ensures you get the most current rates and coverage options. Would you like me to help you start the renewal process now?",
        sender: "admin",
        senderName: "Support Team",
        timestamp: "2024-01-15T11:20:00Z",
      },
    ],
  },
]

export function useTickets() {
  const [data, setData] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/tickets");
        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }
        const data = await response.json();
        setData(data)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  const updateTicketStatus = async (ticketId: string, status: Ticket["status"]) => {
    try {
      setData((prevData) =>
        prevData.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status, updatedAt: new Date().toISOString() } : ticket,
        ),
      )
    } catch (err) {
      setError("Failed to update ticket")
    }
  }

  const assignTicket = async (ticketId: string, assignedTo: string) => {
    try {
      setData((prevData) =>
        prevData.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, assignedTo, updatedAt: new Date().toISOString() } : ticket,
        ),
      )
    } catch (err) {
      setError("Failed to assign ticket")
    }
  }

  const markTicketAsRead = async (ticketId: string) => {
    try {
      setData((prevData) =>
        prevData.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, hasUnreadReplies: false, lastViewedAt: new Date().toISOString() }
            : ticket,
        ),
      )
    } catch (err) {
      setError("Failed to mark ticket as read")
    }
  }

  const addMessageToTicket = async (ticketId: string, message: string, attachments: File[] = []) => {
    try {
      const newMessage: TicketMessage = {
        id: `msg_${Date.now()}`,
        content: message,
        sender: "user",
        senderName: "Test User", // This would come from auth context
        timestamp: new Date().toISOString(),
        attachments: attachments.map((file) => ({
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
        })),
      }

      setData((prevData) =>
        prevData.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                messages: [...ticket.messages, newMessage],
                updatedAt: new Date().toISOString(),
              }
            : ticket,
        ),
      )
    } catch (err) {
      setError("Failed to send message")
    }
  }

  return {
    data,
    loading,
    error,
    updateTicketStatus,
    assignTicket,
    markTicketAsRead,
    addMessageToTicket,
  }
}
