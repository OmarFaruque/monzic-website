"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, ChevronDown, ChevronUp, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useNotifications } from "@/hooks/use-notifications"
import Link from "next/link"

// Mock order data
const mockOrders = [
  {
    id: "ORD-2025-001",
    date: "2025-01-15",
    time: "14:32",
    status: "Completed",
    amount: 10.0,
  },
  {
    id: "ORD-2025-002",
    date: "2025-01-20",
    time: "09:15",
    status: "Completed",
    amount: 15.0,
  },
  {
    id: "ORD-2025-003",
    date: "2025-02-03",
    time: "16:47",
    status: "Completed",
    amount: 12.5,
  },
  {
    id: "ORD-2025-004",
    date: "2025-02-10",
    time: "11:23",
    status: "Processing",
    amount: 20.0,
  },
]

export function OrdersSection() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { showSuccess } = useNotifications()

  const filteredOrders = mockOrders.filter((order) => order.id.toLowerCase().includes(searchTerm.toLowerCase()))

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const handleDownload = (orderId: string) => {
    showSuccess("Document Downloaded", "Your original document has been downloaded successfully.", 3000)
    console.log(`Downloading original document for order: ${orderId}`)

    // In a real implementation, this would fetch and download the original PDF
    // that was generated when the user made the purchase
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Documents</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 py-2"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? "No documents match your search criteria." : "You haven't created any documents yet."}
          </p>
          {!searchTerm && (
            <Link href="/ai-documents">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">Create Your First Document</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 font-medium text-sm text-gray-600">
            <div>Order ID</div>
            <div>Date & Time</div>
            <div>Status</div>
            <div>Amount</div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div key={order.id} className="text-sm">
                <div
                  className="grid grid-cols-4 gap-4 px-6 py-4 items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleOrderExpansion(order.id)}
                >
                  <div className="font-medium text-gray-900">{order.id}</div>
                  <div className="text-gray-600">
                    {order.date} at {order.time}
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">£{order.amount.toFixed(2)}</span>
                    <button
                      className="p-1 rounded-full hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleOrderExpansion(order.id)
                      }}
                    >
                      {expandedOrder === order.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order.id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                        <dl className="space-y-1 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <dt className="text-gray-500">Order ID:</dt>
                            <dd className="text-gray-900">{order.id}</dd>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <dt className="text-gray-500">Date:</dt>
                            <dd className="text-gray-900">{order.date}</dd>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <dt className="text-gray-500">Time:</dt>
                            <dd className="text-gray-900">{order.time}</dd>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <dt className="text-gray-500">Status:</dt>
                            <dd className="text-gray-900">{order.status}</dd>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <dt className="text-gray-500">Amount:</dt>
                            <dd className="text-gray-900">£{order.amount.toFixed(2)}</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Document</h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                              <FileText className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">AI Generated Document.pdf</p>
                              <p className="text-xs text-gray-500">
                                Generated on {order.date} at {order.time}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(order.id)}
                            className="flex items-center space-x-1"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
