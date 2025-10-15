"use client"

import { useState, useEffect } from "react"
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
import { Search, Plus, Trash2, Shield, AlertTriangle, Clock, Loader2 } from "lucide-react"
import { validateInput, adminUserSchema } from "@/lib/validation"

export function AdminsSection() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", role: "Admin", password: "" });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);;

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/admins');
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      } else {
        console.error('Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };;

  const filteredAdmins = admins.filter(
    (admin) =>
      (admin.fname + ' ' + admin.lname).toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "Inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleAddAdmin = async () => {
    // Basic validation can be done here or rely on server validation
    setValidationErrors([]);
    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      });

      if (response.ok) {
        fetchAdmins(); // Refresh list
        setIsAddDialogOpen(false);
        setNewAdmin({ name: "", email: "", role: "Admin", password: "" });
      } else {
        const errorData = await response.json();
        setValidationErrors([errorData.error || 'Failed to add admin.']);
      }
    } catch (error) {
      setValidationErrors(['An unexpected error occurred.']);
    }
  }

  const handleDeleteAdmin = async () => {
    if (selectedAdmin) {
      try {
        const response = await fetch(`/api/admin/admins/${selectedAdmin.adminId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchAdmins(); // Refresh list
          setIsDeleteDialogOpen(false);
          setSelectedAdmin(null);
        } else {
          // Handle error
          console.error('Failed to delete admin');
        }
      } catch (error) {
        console.error('Error deleting admin:', error);
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Management</CardTitle>
        <CardDescription>
          Manage administrator accounts and permissions (Support role removed for security)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
              <div className="flex items-center space-x-2 text-gray-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Loading...</span>
              </div>
            </div>
          )}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1 w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Enhanced Security</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Admin sessions automatically timeout after 30 minutes of inactivity</li>
                <li>All admin actions are logged for audit purposes</li>
                <li>Only Admin role is available for maximum security</li>
                <li>Single admin role ensures clear responsibility</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Session Timeout</TableHead>
                <TableHead>Added At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.adminId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-medium">{admin.fname} {admin.lname}</div>
                        <div className="text-sm text-gray-500">{admin.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(admin.role)}</TableCell>
                  <TableCell>{getStatusBadge("Active")}</TableCell> {/* Status is static for now */}
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3 text-gray-400" />
                      N/A
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <AlertTriangle className="h-3 w-3" />
                      30 minutes
                    </div>
                  </TableCell>
                  <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAdmin(admin)
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

        {/* Add Admin Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>Create a new administrator account with enhanced security</DialogDescription>
            </DialogHeader>

            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Validation Errors:</p>
                  <ul className="list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="admin-name">Full Name</Label>
                <Input
                  id="admin-name"
                  placeholder="Enter full name"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="admin-email">Email Address</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="Enter email address"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="admin-role">Role</Label>
                <Select value={newAdmin.role} onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-medium mb-1">Security Notice</p>
                    <p>New admin will have a 30-minute session timeout and all actions will be audited.</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setValidationErrors([])
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddAdmin}>Add Admin</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Admin Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Remove Admin
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {selectedAdmin?.name} from the admin team? This action cannot be undone
                and will be logged for audit purposes.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAdmin}>
                Remove Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
