"use client"

import { useState, useEffect } from "react"
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

export function UsersSection() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [selectedUserPolicies, setSelectedUserPolicies] = useState<any[]>([])
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isBlacklistDialogOpen, setIsBlacklistDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUserForBlacklist, setSelectedUserForBlacklist] = useState<any | null>(null)
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<any | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleOpenUserDialog = async (user: any) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
    try {
      const response = await fetch(`/api/admin/users/${user.userId}/policies`);
      if (!response.ok) {
        throw new Error('Failed to fetch policies');
      }
      const data = await response.json();
      setSelectedUserPolicies(data);
    } catch (error) {
      console.error(error);
      // Handle error, maybe show a toast
    }
  };

  const handleBlacklistUser = (user: any) => {
    setSelectedUserForBlacklist(user)
    setIsBlacklistDialogOpen(true)
  }

  const handleDeleteUser = (user: any) => {
    setSelectedUserForDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const confirmBlacklist = async () => {
    if (selectedUserForBlacklist) {
      try {
        const response = await fetch(`/api/admin/users/${selectedUserForBlacklist.userId}`, {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Failed to blacklist user');
        }
        alert(`User ${selectedUserForBlacklist.firstName} ${selectedUserForBlacklist.lastName} has been blacklisted`);
      } catch (error) {
        console.error(error);
        alert('Failed to blacklist user.');
      } finally {
        setIsBlacklistDialogOpen(false)
        setSelectedUserForBlacklist(null)
      }
    }
  }

  const confirmDelete = async () => {
    if (selectedUserForDelete) {
      try {
        const response = await fetch(`/api/admin/users/${selectedUserForDelete.userId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete user');
        }
        setUsers(users.filter((u) => u.userId !== selectedUserForDelete.userId));
        const { firstName, lastName, email } = selectedUserForDelete;
        const displayName = firstName || lastName
                ? `${firstName ?? ''} ${lastName ?? ''}`.trim()
                : email;
        alert(`User ${displayName} has been deleted`);
      } catch (error) {
        console.error(error);
        alert('Failed to delete user.');
      } finally {
        setIsDeleteDialogOpen(false)
        setSelectedUserForDelete(null)
      }
    }
  }

  // Sort users based on selected criteria
  const sortedUsers = [...users].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View and manage all registered users ({users.length} total users)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenUserDialog(user)}
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
                Detailed information for {selectedUser?.firstName} {selectedUser?.lastName}
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
                        {selectedUser?.firstName} {selectedUser?.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{selectedUser?.email}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Account Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Join Date:</span>
                      <span>{selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy History */}
              {selectedUserPolicies.length > 0 && (
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
                        {selectedUserPolicies.slice(0, 5).map((policy) => (
                          <TableRow key={policy.policyNumber}>
                            <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                            <TableCell>
                              {policy.vehicleMake} {policy.vehicleModel}
                            </TableCell>
                            <TableCell>{new Date(policy.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>£{parseFloat(policy.updatePrice).toFixed(2)}</TableCell>
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
