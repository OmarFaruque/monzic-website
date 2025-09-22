"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Trash2, AlertTriangle, X, Plus, Shield, MapPin, Globe } from "lucide-react"

// Mock blacklist data
const mockBlacklist = {
  users: [
    {
      id: 1,
      type: "user",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@spam.com",
      dateOfBirth: "1990-01-01",
      operator: "AND",
      createdAt: "26-05-25 01:01:16",
      reason: "Fraudulent activity",
    },
    {
      id: 2,
      type: "user",
      email: "scammer@fake.com",
      operator: "OR",
      createdAt: "25-05-25 14:30:22",
      reason: "Multiple failed payments",
    },
  ],
  ips: [
    {
      id: 3,
      type: "ip",
      ipAddress: "192.168.1.100",
      createdAt: "24-05-25 09:15:33",
      reason: "Suspicious activity",
    },
    {
      id: 4,
      type: "ip",
      ipAddress: "10.0.0.50",
      createdAt: "23-05-25 16:45:12",
      reason: "Bot traffic",
    },
  ],
  postcodes: [
    {
      id: 5,
      type: "postcode",
      postcode: "SW1A 1AA",
      createdAt: "22-05-25 11:20:45",
      reason: "High fraud area",
    },
    {
      id: 6,
      type: "postcode",
      postcode: "M1 1AA",
      createdAt: "21-05-25 08:30:18",
      reason: "Restricted region",
    },
  ],
}

export function BlacklistSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("users")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [createType, setCreateType] = useState("user")

  const [newBlacklist, setNewBlacklist] = useState({
    // User fields
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    operator: "AND",
    // IP fields
    ipAddress: "",
    // Postcode fields
    postcode: "",
    // Common fields
    reason: "",
  })

  const resetForm = () => {
    setNewBlacklist({
      firstName: "",
      lastName: "",
      email: "",
      dateOfBirth: "",
      operator: "AND",
      ipAddress: "",
      postcode: "",
      reason: "",
    })
  }

  const getFilteredData = () => {
    const data = mockBlacklist[activeTab as keyof typeof mockBlacklist] || []
    return data.filter((item: any) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        (item.firstName && item.firstName.toLowerCase().includes(searchLower)) ||
        (item.lastName && item.lastName.toLowerCase().includes(searchLower)) ||
        (item.email && item.email.toLowerCase().includes(searchLower)) ||
        (item.ipAddress && item.ipAddress.toLowerCase().includes(searchLower)) ||
        (item.postcode && item.postcode.toLowerCase().includes(searchLower)) ||
        (item.reason && item.reason.toLowerCase().includes(searchLower))
      )
    })
  }

  const getStatusBadge = (item: any) => {
    switch (item.type) {
      case "user":
        return <Badge className="bg-red-100 text-red-800">User</Badge>
      case "ip":
        return <Badge className="bg-orange-100 text-orange-800">IP Address</Badge>
      case "postcode":
        return <Badge className="bg-purple-100 text-purple-800">Postcode</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const renderUserForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={newBlacklist.firstName}
            onChange={(e) => setNewBlacklist({ ...newBlacklist, firstName: e.target.value })}
            placeholder="Optional"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={newBlacklist.lastName}
            onChange={(e) => setNewBlacklist({ ...newBlacklist, lastName: e.target.value })}
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={newBlacklist.email}
          onChange={(e) => setNewBlacklist({ ...newBlacklist, email: e.target.value })}
          placeholder="Optional"
        />
      </div>

      <div>
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={newBlacklist.dateOfBirth}
          onChange={(e) => setNewBlacklist({ ...newBlacklist, dateOfBirth: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="operator">Field Matching</Label>
        <Select
          value={newBlacklist.operator}
          onValueChange={(value) => setNewBlacklist({ ...newBlacklist, operator: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND (All fields must match)</SelectItem>
            <SelectItem value="OR">OR (Any field can match)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          Choose how the fields should be matched when checking against users
        </p>
      </div>
    </div>
  )

  const renderIPForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ipAddress">IP Address</Label>
        <Input
          id="ipAddress"
          value={newBlacklist.ipAddress}
          onChange={(e) => setNewBlacklist({ ...newBlacklist, ipAddress: e.target.value })}
          placeholder="e.g., 192.168.1.100 or 192.168.1.0/24"
        />
        <p className="text-xs text-gray-500 mt-1">You can enter a single IP address or a CIDR range</p>
      </div>
    </div>
  )

  const renderPostcodeForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="postcode">Postcode</Label>
        <Input
          id="postcode"
          value={newBlacklist.postcode}
          onChange={(e) => setNewBlacklist({ ...newBlacklist, postcode: e.target.value.toUpperCase() })}
          placeholder="e.g., SW1A 1AA"
        />
        <p className="text-xs text-gray-500 mt-1">Enter the postcode to blacklist (partial matches supported)</p>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          Blacklist Management
        </CardTitle>
        <CardDescription>Manage blacklisted users, IP addresses, and postcodes</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Users ({mockBlacklist.users.length})
              </TabsTrigger>
              <TabsTrigger value="ips" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                IP Addresses ({mockBlacklist.ips.length})
              </TabsTrigger>
              <TabsTrigger value="postcodes" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Postcodes ({mockBlacklist.postcodes.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search blacklist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => {
                  setCreateType(activeTab.slice(0, -1)) // Remove 's' from plural
                  setIsCreateDialogOpen(true)
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Blacklist
              </Button>
            </div>
          </div>

          <TabsContent value="users" className="space-y-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader className="bg-red-50">
                  <TableRow>
                    <TableHead className="text-red-800 font-medium">Type</TableHead>
                    <TableHead className="text-red-800 font-medium">Details</TableHead>
                    <TableHead className="text-red-800 font-medium">Operator</TableHead>
                    <TableHead className="text-red-800 font-medium">Reason</TableHead>
                    <TableHead className="text-red-800 font-medium">Created</TableHead>
                    <TableHead className="text-red-800 font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredData().map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{getStatusBadge(item)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {item.firstName && item.lastName && (
                            <div className="font-medium">
                              {item.firstName} {item.lastName}
                            </div>
                          )}
                          {item.email && <div className="text-sm text-gray-600">{item.email}</div>}
                          {item.dateOfBirth && <div className="text-sm text-gray-600">DOB: {item.dateOfBirth}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.operator === "AND" ? "default" : "secondary"}>{item.operator}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.reason}</TableCell>
                      <TableCell className="text-sm">{item.createdAt}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="ips" className="space-y-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader className="bg-orange-50">
                  <TableRow>
                    <TableHead className="text-orange-800 font-medium">Type</TableHead>
                    <TableHead className="text-orange-800 font-medium">IP Address</TableHead>
                    <TableHead className="text-orange-800 font-medium">Reason</TableHead>
                    <TableHead className="text-orange-800 font-medium">Created</TableHead>
                    <TableHead className="text-orange-800 font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredData().map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{getStatusBadge(item)}</TableCell>
                      <TableCell className="font-mono">{item.ipAddress}</TableCell>
                      <TableCell className="text-sm">{item.reason}</TableCell>
                      <TableCell className="text-sm">{item.createdAt}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="postcodes" className="space-y-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader className="bg-purple-50">
                  <TableRow>
                    <TableHead className="text-purple-800 font-medium">Type</TableHead>
                    <TableHead className="text-purple-800 font-medium">Postcode</TableHead>
                    <TableHead className="text-purple-800 font-medium">Reason</TableHead>
                    <TableHead className="text-purple-800 font-medium">Created</TableHead>
                    <TableHead className="text-purple-800 font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredData().map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{getStatusBadge(item)}</TableCell>
                      <TableCell className="font-mono">{item.postcode}</TableCell>
                      <TableCell className="text-sm">{item.reason}</TableCell>
                      <TableCell className="text-sm">{item.createdAt}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Blacklist Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Add to Blacklist</DialogTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsCreateDialogOpen(false)} className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <DialogDescription>Add a new entry to the blacklist to prevent access or transactions</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="blacklist-type">Blacklist Type</Label>
                <Select value={createType} onValueChange={setCreateType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User Details</SelectItem>
                    <SelectItem value="ip">IP Address</SelectItem>
                    <SelectItem value="postcode">Postcode</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createType === "user" && renderUserForm()}
              {createType === "ip" && renderIPForm()}
              {createType === "postcode" && renderPostcodeForm()}

              <div>
                <Label htmlFor="reason">Reason for Blacklisting</Label>
                <Input
                  id="reason"
                  value={newBlacklist.reason}
                  onChange={(e) => setNewBlacklist({ ...newBlacklist, reason: e.target.value })}
                  placeholder="e.g., Fraudulent activity, Spam, etc."
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  resetForm()
                }}
              >
                Add to Blacklist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Item Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Remove from Blacklist
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this entry from the blacklist? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(false)}>
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
