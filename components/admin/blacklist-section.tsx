'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Trash2, AlertTriangle, X, Plus, Shield, MapPin, Globe, Car, Loader2, Edit } from 'lucide-react';
import { createBlacklistItem, deleteBlacklistItem, updateBlacklistItem } from '@/lib/blacklist-actions';

export function BlacklistSection({ blacklistData }: { blacklistData: any }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [createType, setCreateType] = useState('user');
  const [isPending, startTransition] = useTransition();

  const [newBlacklist, setNewBlacklist] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    operator: 'AND',
    ipAddress: '',
    postcode: '',
    regNumber: '', // Added regNumber
    reason: '',
  });

  const resetForm = () => {
    setNewBlacklist({
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      operator: 'AND',
      ipAddress: '',
      postcode: '',
      regNumber: '', // Added regNumber
      reason: '',
    });
  };

  const handleCreate = () => {
    startTransition(async () => {
      const dataToSave = { type: createType, ...newBlacklist };
      
      const result = await createBlacklistItem(dataToSave);
      if (result.success) {
        toast.success(result.message);
        setIsCreateDialogOpen(false);
        resetForm();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    startTransition(async () => {
      const result = await deleteBlacklistItem(selectedItem.id);
      if (result.success) {
        toast.success(result.message);
        setIsDeleteDialogOpen(false);
        setSelectedItem(null);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleEditClick = (item: any) => {
    setEditingItem({ ...item }); // Create a copy to avoid direct state mutation
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingItem) return;
    // console.log('Updating blacklist item with:', editingItem);
    startTransition(async () => {
      const result = await updateBlacklistItem(editingItem.id, editingItem);
      if (result.success) {
        toast.success(result.message);
        setIsEditDialogOpen(false);
        setEditingItem(null);
      } else {
        toast.error(result.message);
      }
    });
  };

  const getFilteredData = () => {
    const data = blacklistData[activeTab] || [];
    return data.filter((item: any) => {
      const searchLower = searchTerm.toLowerCase();
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchLower)
      );
    });
  };

  const getStatusBadge = (item: any) => {
    switch (item.type) {
      case 'user':
        return <Badge className="bg-red-100 text-red-800">User</Badge>;
      case 'ip':
        return <Badge className="bg-orange-100 text-orange-800">IP Address</Badge>;
      case 'postcode':
        return <Badge className="bg-purple-100 text-purple-800">Postcode</Badge>;
      case 'reg_number':
        return <Badge className="bg-blue-100 text-blue-800">Vehicle Reg.</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const renderUserForm = (currentState: any, setState: Function) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" value={currentState.firstName || ''} onChange={(e) => setState({ ...currentState, firstName: e.target.value })} placeholder="Optional" />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" value={currentState.lastName || ''} onChange={(e) => setState({ ...currentState, lastName: e.target.value })} placeholder="Optional" />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" value={currentState.email || ''} onChange={(e) => setState({ ...currentState, email: e.target.value })} placeholder="Optional" />
      </div>
      <div>
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input id="dateOfBirth" type="date" value={currentState.dateOfBirth || ''} onChange={(e) => setState({ ...currentState, dateOfBirth: e.target.value || null })} />
        {currentState.dateOfBirth && (
          <Button variant="ghost" size="sm" onClick={() => setState({ ...currentState, dateOfBirth: null })} className="mt-1">
            <X className="h-3 w-3 mr-1" /> Clear DOB
          </Button>
        )}
      </div>
      <div>
        <Label htmlFor="operator">Field Matching</Label>
        <Select value={currentState.operator} onValueChange={(value) => setState({ ...currentState, operator: value })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND (All fields must match)</SelectItem>
            <SelectItem value="OR">OR (Any field can match)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">Choose how the fields should be matched when checking against users</p>
      </div>
    </div>
  );

  const renderIPForm = (currentState: any, setState: Function) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ipAddress">IP Address</Label>
        <Input id="ipAddress" value={currentState.ipAddress || ''} onChange={(e) => setState({ ...currentState, ipAddress: e.target.value })} placeholder="e.g., 192.168.1.100 or 192.168.1.0/24" />
        <p className="text-xs text-gray-500 mt-1">You can enter a single IP address or a CIDR range</p>
      </div>
    </div>
  );

  const renderPostcodeForm = (currentState: any, setState: Function) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="postcode">Postcode</Label>
        <Input id="postcode" value={currentState.postcode || ''} onChange={(e) => setState({ ...currentState, postcode: e.target.value.toUpperCase() })} placeholder="e.g., SW1A 1AA" />
        <p className="text-xs text-gray-500 mt-1">Enter the postcode to blacklist (partial matches supported)</p>
      </div>
    </div>
  );

  const renderRegNumberForm = (currentState: any, setState: Function) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="regNumber">Vehicle Registration Number</Label>
        <Input id="regNumber" value={currentState.regNumber || ''} onChange={(e) => setState({ ...currentState, regNumber: e.target.value.toUpperCase() })} placeholder="e.g., AB12 CDE" />
        <p className="text-xs text-gray-500 mt-1">Enter the vehicle registration number to blacklist</p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-red-600" />Blacklist Management</CardTitle>
        <CardDescription>Manage blacklisted users, IP addresses, postcodes, and vehicle registration numbers</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <TabsList className="grid grid-cols-4 w-full md:w-auto">
              <TabsTrigger value="users" className="flex items-center gap-2"><Shield className="w-4 h-4" />Users ({blacklistData.users.length})</TabsTrigger>
              <TabsTrigger value="ips" className="flex items-center gap-2"><Globe className="w-4 h-4" />IP Addresses ({blacklistData.ips.length})</TabsTrigger>
              <TabsTrigger value="postcodes" className="flex items-center gap-2"><MapPin className="w-4 h-4" />Postcodes ({blacklistData.postcodes.length})</TabsTrigger>
              <TabsTrigger value="regNumbers" className="flex items-center gap-2"><Car className="w-4 h-4" />Vehicle Reg. ({blacklistData?.regNumbers?.length ?? 0})</TabsTrigger>
            </TabsList>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1 w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search blacklist..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Button onClick={() => { 
                let typeToSet = activeTab.slice(0, -1);
                if (activeTab === 'regNumbers') { typeToSet = 'reg_number'; }
                setCreateType(typeToSet);
                setIsCreateDialogOpen(true); 
              }} className="bg-red-600 hover:bg-red-700">
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
                          {item.firstName && item.lastName && <div className="font-medium">{item.firstName} {item.lastName}</div>}
                          {item.email && <div className="text-sm text-gray-600">{item.email}</div>}
                          {item.dateOfBirth && <div className="text-sm text-gray-600">DOB: {item.dateOfBirth}</div>}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={item.operator === "AND" ? "default" : "secondary"}>{item.operator}</Badge></TableCell>
                      <TableCell className="text-sm">{item.reason}</TableCell>
                      <TableCell className="text-sm">{new Date(item.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setSelectedItem(item); setIsDeleteDialogOpen(true); }}>
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
                      <TableCell className="text-sm">{new Date(item.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setSelectedItem(item); setIsDeleteDialogOpen(true); }}>
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
                      <TableCell className="text-sm">{new Date(item.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setSelectedItem(item); setIsDeleteDialogOpen(true); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="regNumbers" className="space-y-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader className="bg-blue-50">
                  <TableRow>
                    <TableHead className="text-blue-800 font-medium">Type</TableHead>
                    <TableHead className="text-blue-800 font-medium">Vehicle Reg. Number</TableHead>
                    <TableHead className="text-blue-800 font-medium">Reason</TableHead>
                    <TableHead className="text-blue-800 font-medium">Created</TableHead>
                    <TableHead className="text-blue-800 font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredData().map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{getStatusBadge(item)}</TableCell>
                      <TableCell className="font-mono">{item.regNumber}</TableCell>
                      <TableCell className="text-sm">{item.reason}</TableCell>
                      <TableCell className="text-sm">{new Date(item.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setSelectedItem(item); setIsDeleteDialogOpen(true); }}>
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

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add to Blacklist</DialogTitle>
              <DialogDescription>Add a new entry to the blacklist to prevent access or transactions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select value={createType} onValueChange={setCreateType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User Details</SelectItem>
                  <SelectItem value="ip">IP Address</SelectItem>
                  <SelectItem value="postcode">Postcode</SelectItem>
                  <SelectItem value="reg_number">Vehicle Reg. Number</SelectItem>
                </SelectContent>
              </Select>
              {createType === 'user' && renderUserForm(newBlacklist, setNewBlacklist)}
              {createType === 'ip' && renderIPForm(newBlacklist, setNewBlacklist)}
              {createType === 'postcode' && renderPostcodeForm(newBlacklist, setNewBlacklist)}
              {createType === 'reg_number' && renderRegNumberForm(newBlacklist, setNewBlacklist)}
              <div>
                <Label htmlFor="reason">Reason for Blacklisting</Label>
                <Input id="reason" value={newBlacklist.reason} onChange={(e) => setNewBlacklist({ ...newBlacklist, reason: e.target.value })} placeholder="e.g., Fraudulent activity, Spam, etc." required />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isPending} className="bg-red-600 hover:bg-red-700">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add to Blacklist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Blacklist Item</DialogTitle>
              <DialogDescription>Modify the details of the selected blacklist entry.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {editingItem?.type === 'user' && renderUserForm(editingItem, setEditingItem)}
              {editingItem?.type === 'ip' && renderIPForm(editingItem, setEditingItem)}
              {editingItem?.type === 'postcode' && renderPostcodeForm(editingItem, setEditingItem)}
              {editingItem?.type === 'reg_number' && renderRegNumberForm(editingItem, setEditingItem)}
              <div>
                <Label htmlFor="editReason">Reason for Blacklisting</Label>
                <Input id="editReason" value={editingItem?.reason || ''} onChange={(e) => setEditingItem({ ...editingItem, reason: e.target.value })} placeholder="e.g., Fraudulent activity, Spam, etc." required />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={isPending} className="bg-red-600 hover:bg-red-700">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500" />Remove from Blacklist</DialogTitle>
              <DialogDescription>Are you sure you want to remove this entry? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}