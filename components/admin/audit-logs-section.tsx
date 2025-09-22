"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Shield, Clock, User, Globe } from "lucide-react"

// Mock audit log data
const mockAuditLogs = [
  {
    id: "audit_001",
    userId: "admin_001",
    userEmail: "admin@monzic.com",
    action: "CREATE",
    resource: "ADMIN_USER",
    details: { name: "John Manager", email: "john.manager@monzic.com", role: "Manager" },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
  },
  {
    id: "audit_002",
    userId: "admin_001",
    userEmail: "admin@monzic.com",
    action: "UPDATE",
    resource: "COUPON",
    details: { promoCode: "WELCOME10", field: "quotaAvailable", oldValue: 100, newValue: 95 },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
  },
  {
    id: "audit_003",
    userId: "manager_001",
    userEmail: "john.manager@monzic.com",
    action: "DELETE",
    resource: "BLACKLIST_ENTRY",
    details: { matches: '{"email":"test@example.com"}' },
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    id: "audit_004",
    userId: "admin_001",
    userEmail: "admin@monzic.com",
    action: "VIEW",
    resource: "USER_DETAILS",
    details: { userId: "user_123", userEmail: "customer@example.com" },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
  },
  {
    id: "audit_005",
    userId: "admin_001",
    userEmail: "admin@monzic.com",
    action: "LOGIN",
    resource: "ADMIN_PANEL",
    details: { loginMethod: "email_password", rememberMe: false },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    timestamp: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
  },
]

export function AuditLogsSection() {
  const [logs, setLogs] = useState(mockAuditLogs)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [resourceFilter, setResourceFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("24h")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm)

    const matchesAction = actionFilter === "all" || log.action === actionFilter
    const matchesResource = resourceFilter === "all" || log.resource === resourceFilter

    const now = Date.now()
    let matchesTime = true

    switch (timeFilter) {
      case "1h":
        matchesTime = now - log.timestamp <= 60 * 60 * 1000
        break
      case "24h":
        matchesTime = now - log.timestamp <= 24 * 60 * 60 * 1000
        break
      case "7d":
        matchesTime = now - log.timestamp <= 7 * 24 * 60 * 60 * 1000
        break
      case "30d":
        matchesTime = now - log.timestamp <= 30 * 24 * 60 * 60 * 1000
        break
    }

    return matchesSearch && matchesAction && matchesResource && matchesTime
  })

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return <Badge className="bg-green-100 text-green-800">CREATE</Badge>
      case "UPDATE":
        return <Badge className="bg-blue-100 text-blue-800">UPDATE</Badge>
      case "DELETE":
        return <Badge className="bg-red-100 text-red-800">DELETE</Badge>
      case "VIEW":
        return <Badge className="bg-gray-100 text-gray-800">VIEW</Badge>
      case "LOGIN":
        return <Badge className="bg-purple-100 text-purple-800">LOGIN</Badge>
      case "LOGOUT":
        return <Badge className="bg-orange-100 text-orange-800">LOGOUT</Badge>
      default:
        return <Badge variant="secondary">{action}</Badge>
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }

  const exportLogs = () => {
    const csvContent = [
      ["Timestamp", "User", "Action", "Resource", "IP Address", "Details"].join(","),
      ...filteredLogs.map((log) =>
        [
          formatTimestamp(log.timestamp),
          log.userEmail,
          log.action,
          log.resource,
          log.ipAddress,
          JSON.stringify(log.details).replace(/"/g, '""'),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Audit Logs
        </CardTitle>
        <CardDescription>Track all administrative actions and system access for security compliance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by user, action, resource, or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
              <SelectItem value="VIEW">View</SelectItem>
              <SelectItem value="LOGIN">Login</SelectItem>
              <SelectItem value="LOGOUT">Logout</SelectItem>
            </SelectContent>
          </Select>

          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Resource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="ADMIN_USER">Admin User</SelectItem>
              <SelectItem value="USER_DETAILS">User Details</SelectItem>
              <SelectItem value="POLICY">Policy</SelectItem>
              <SelectItem value="COUPON">Coupon</SelectItem>
              <SelectItem value="BLACKLIST_ENTRY">Blacklist</SelectItem>
              <SelectItem value="ADMIN_PANEL">Admin Panel</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportLogs} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium">{formatTimeAgo(log.timestamp)}</div>
                        <div className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-gray-400" />
                      <div className="text-sm">{log.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{log.resource}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-gray-400" />
                      <code className="text-xs">{log.ipAddress}</code>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <details className="cursor-pointer">
                        <summary className="text-xs text-blue-600 hover:text-blue-800">View Details</summary>
                        <pre className="text-xs bg-gray-50 p-2 mt-1 rounded overflow-auto max-h-32">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No audit logs found matching your criteria.</p>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p>
            Showing {filteredLogs.length} of {logs.length} audit log entries
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
