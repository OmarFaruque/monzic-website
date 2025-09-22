"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Eye, Download, ArrowUpDown, AlertTriangle, Trash2 } from "lucide-react"
import { getCustomerData, type CustomerData } from "@/lib/policy-data"

export function UsersSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedUser, setSelectedUser] = useState<CustomerData | null>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isBlacklistDialogOpen, setIsBlacklistDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUserForBlacklist, setSelectedUserForBlacklist] = useState<CustomerData | null>(null)
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<CustomerData | null>(null)

  const handleBlacklistUser = (user: CustomerData) => {
    setSelectedUserForBlacklist(user)
    setIsBlacklistDialogOpen(true)
  }

  const handleDeleteUser = (user: CustomerData) => {
    setSelectedUserForDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const confirmBlacklist = () => {
    if (selectedUserForBlacklist) {
      // In a real app, you would send this to your blacklist API
      console.log("Blacklisting user:", selectedUserForBlacklist)
      alert(`User ${selectedUserForBlacklist.firstName} ${selectedUserForBlacklist.lastName} has been blacklisted`)
      setIsBlacklistDialogOpen(false)
      setSelectedUserForBlacklist(null)
    }
  }

  const confirmDelete = () => {
    if (selectedUserForDelete) {
      // In a real app, you would send this to your delete API
      console.log("Deleting user:", selectedUserForDelete)
      alert(`User ${selectedUserForDelete.firstName} ${selectedUserForDelete.lastName} has been deleted`)
      setIsDeleteDialogOpen(false)
      setSelectedUserForDelete(null)
    }
  }

  // Get customer data
  const mockUsers = getCustomerData()

  // Sort users based on selected criteria
  const sortedUsers = [...mockUsers].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
      case "oldest":
        return new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime()
      case "highest-spent":
        return b.totalSpent - a.totalSpent
      case "lowest-spent":
        return a.totalSpent - b.totalSpent
      case "most-policies":
        return b.totalPolicies - a.totalPolicies
      case "least-policies":
        return a.totalPolicies - b.totalPolicies
      case "alphabetical":
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      default:
        return 0
    }
  })

  const filteredUsers = sortedUsers.filter(
    (user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View and manage all registered users ({mockUsers.length} total users)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
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
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest-spent">Highest Spent</SelectItem>
                <SelectItem value="lowest-spent">Lowest Spent</SelectItem>
                <SelectItem value="most-policies">Most Policies</SelectItem>
                <SelectItem value="least-policies">Least Policies</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Users
            </Button>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Last Policy</TableHead>
                <TableHead>Policies</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.customerId}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.firstName} {user.middleName && `${user.middleName} `}
                        {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>
                    {user && user.policies && user.policies.length > 0
                      ? user.policies
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
                          .createdAt.split(" ")[0]
                      : "Never"}
                  </TableCell>
                  <TableCell>{user.totalPolicies}</TableCell>
                  <TableCell>£{user.totalSpent.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsUserDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBlacklistUser(user)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        Blacklist
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* User Details Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Detailed information for {selectedUser?.firstName} {selectedUser?.middleName} {selectedUser?.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>
                        {selectedUser?.firstName} {selectedUser?.middleName} {selectedUser?.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{selectedUser?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{selectedUser?.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Date of Birth:</span>
                      <span>{selectedUser?.dateOfBirth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Address:</span>
                      <span className="text-right">{selectedUser?.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Postcode:</span>
                      <span>{selectedUser?.postcode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Occupation:</span>
                      <span>{selectedUser?.occupation}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Account Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Join Date:</span>
                      <span>{selectedUser?.joinDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Policies:</span>
                      <span>{selectedUser?.totalPolicies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Spent:</span>
                      <span>£{selectedUser?.totalSpent?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">License Type:</span>
                      <span>{selectedUser?.licenseType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">License Held:</span>
                      <span>{selectedUser?.licenseHeld}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy History */}
              {selectedUser && selectedUser.policies.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Recent Policies</h4>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Policy Number</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser.policies.slice(0, 5).map((policy) => (
                          <TableRow key={policy.policyNumber}>
                            <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                            <TableCell>
                              {policy.vehicleMake} {policy.vehicleModel}
                            </TableCell>
                            <TableCell>{policy.createdAt.split(" ")[0]}</TableCell>
                            <TableCell>£{policy.premium.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Blacklist Confirmation Dialog */}
        <Dialog open={isBlacklistDialogOpen} onOpenChange={setIsBlacklistDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Blacklist User
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to blacklist {selectedUserForBlacklist?.firstName}{" "}
                {selectedUserForBlacklist?.lastName}? This will prevent them from accessing the website using any of
                their details.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>This action will blacklist:</strong>
              </p>
              <ul className="text-sm text-orange-700 mt-2 space-y-1">
                <li>• Email: {selectedUserForBlacklist?.email}</li>
                <li>• Phone: {selectedUserForBlacklist?.phoneNumber}</li>
                <li>• Address: {selectedUserForBlacklist?.postcode}</li>
                <li>
                  • Name: {selectedUserForBlacklist?.firstName} {selectedUserForBlacklist?.lastName}
                </li>
              </ul>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBlacklistDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmBlacklist}>
                Confirm Blacklist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Delete User
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete {selectedUserForDelete?.firstName}{" "}
                {selectedUserForDelete?.lastName}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>This will permanently delete:</strong>
              </p>
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                <li>• User account and profile</li>
                <li>• All associated policies</li>
                <li>• Purchase history</li>
                <li>• Support tickets</li>
                <li>• All personal data</li>
              </ul>
              <p className="text-sm text-red-800 mt-3 font-medium">
                This action is irreversible and complies with data deletion requests.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
