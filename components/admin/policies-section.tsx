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
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  AlertTriangle,
  Plus,
  ArrowUpDown,
  User,
  Car,
  CheckCircle,
  RefreshCw,
} from "lucide-react"




// Function to determine policy status based on dates and times
const calculatePolicyStatus = (startDate: string, startTime: string, endDate: string, endTime: string) => {
  const now = new Date()
  const start = new Date(`${startDate}T${startTime}`)
  const end = new Date(`${endDate}T${endTime}`)

  if (now < start) {
    return "Upcoming"
  } else if (now >= start && now <= end) {
    return "Active"
  } else {
    return "Expired"
  }
}



const DEMO_REGISTRATIONS = [
  "LX61 JYE - Volkswagen Golf 2017",
  "FG34 HIJ - BMW 3 Series 2019",
  "KL56 MNO - Audi A4 2020",
  "CD78 EFG - Ford Focus 2018",
  "MN90 PQR - Toyota Corolla 2021",
  "ST12 UVW - Mercedes-Benz C-Class 2020",
  "XY34 ZAB - Nissan Qashqai 2019",
]

export function PoliciesSection() {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));


  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("latest")
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false)

  // Add these state variables after the existing state declarations:
  const [customerSearch, setCustomerSearch] = useState("")
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([])
  const [selectedCustomerForPolicy, setSelectedCustomerForPolicy] = useState<any | null>(null)
  const [customerDetailsLocked, setCustomerDetailsLocked] = useState(false)

  // Add occupation states
  const [occupationSearch, setOccupationSearch] = useState("")
  const [showOccupationDropdown, setShowOccupationDropdown] = useState(false)
  const [filteredOccupations, setFilteredOccupations] = useState<string[]>([])

  // Vehicle lookup states
  const [vehicleLookupLoading, setVehicleLookupLoading] = useState(false)
  const [vehicleLookupError, setVehicleLookupError] = useState("")
  const [foundVehicle, setFoundVehicle] = useState<VehicleData | null>(null)
  const [editVehicleLookupLoading, setEditVehicleLookupLoading] = useState(false)
  const [editVehicleLookupError, setEditVehicleLookupError] = useState("")
  const [editFoundVehicle, setEditFoundVehicle] = useState<VehicleData | null>(null)

  // Edit policy states
  const [editPolicy, setEditPolicy] = useState<any | null>(null)

  const [newPolicy, setNewPolicy] = useState<any>({
    customerId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    postcode: "",
    occupation: "",
    vehicleReg: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleValue: "",
    amount: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    reason: "",
    licenseType: "",
    licenseHeld: "",
  })

  // Add address lookup states for new policy form:
  const [addresses, setAddresses] = useState<string[]>([])
  const [showAddresses, setShowAddresses] = useState(false)
  const [postcodeError, setPostcodeError] = useState("")

  // Add address lookup states for edit form:
  const [editAddresses, setEditAddresses] = useState<string[]>([])
  const [showEditAddresses, setShowEditAddresses] = useState(false)
  const [editPostcodeError, setEditPostcodeError] = useState("")

  // Get data
  const [policies, setPolicies] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch policies from the API
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/policies");
        const data = await response.json();
        setPolicies(data);
      } catch (err) {
        setError("Failed to fetch policies");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  const sortedPolicies = [...policies].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "expiring-soon":
        const aEnd = new Date(`${a.endDate}T${a.endTime}`)
        const bEnd = new Date(`${b.endDate}T${b.endTime}`)
        return aEnd.getTime() - bEnd.getTime()
      case "amount-high":
        return b.premium - a.premium
      case "amount-low":
        return a.premium - b.premium
      case "alphabetical":
        return `${a.customerFirstName} ${a.customerSurname}`.localeCompare(
          `${b.customerFirstName} ${b.customerSurname}`,
        )
      default:
        return 0
    }
  })

  const filteredPolicies = sortedPolicies.filter(
    (policy) =>
      `${policy.firstName} ${policy.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (policy: any) => {
    if (!policy || !policy.startDate || !policy.endDate) {
      return <Badge variant="secondary">Unknown</Badge>
    }

    const status = calculatePolicyStatus(policy.startDate, '00:00', policy.endDate, '23:59')

    switch (status) {
      case "Upcoming":
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "Expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDateTime = (date: string, time: string) => {
    return `${date} ${time}`
  }

  const handleViewPolicy = (policy: any) => {
    // Open policy view page in new tab
    window.open(`/policy/view?number=${policy.policyNumber}`, "_blank")
  }

  const handleViewCustomer = (policy: any) => {
    const customer = customers.find(
      (c) =>
        c.firstName === policy.firstName &&
        c.lastName === policy.lastName &&
        c.dateOfBirth === policy.dateOfBirth,
    )
    if (customer) {
      setSelectedCustomer(customer)
      setIsCustomerDialogOpen(true)
    }
  }

  // Add these functions after handleEditVehicleLookup:

  const handleCustomerSearch = (searchTerm: string) => {
    setCustomerSearch(searchTerm)

    if (searchTerm.trim() === "") {
      setFilteredCustomers([])
      setShowCustomerDropdown(false)
      return
    }

    const filtered = customers.filter(
      (customer) =>
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    setFilteredCustomers(filtered.slice(0, 10)) // Limit to 10 results
    setShowCustomerDropdown(true)
  }

  const selectCustomerForPolicy = (customer: any) => {
    setSelectedCustomerForPolicy(customer)
    setCustomerSearch(`${customer.firstName} ${customer.lastName} (${customer.email})`)
    setShowCustomerDropdown(false)
    setCustomerDetailsLocked(false) // Allow editing by default

    // Auto-populate customer fields
    setNewPolicy({
      ...newPolicy,
      customerId: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phoneNumber: customer.phone,
      dateOfBirth: customer.dateOfBirth,
      address: customer.address,
      postcode: customer.postcode,
      occupation: customer.occupation,
      licenseType: customer.licenseType,
      licenseHeld: customer.licenseHeld,
    })
  }

  const handleOccupationSearch = (searchTerm: string) => {
    setOccupationSearch(searchTerm)

    if (searchTerm.trim() === "") {
      setFilteredOccupations([])
      setShowOccupationDropdown(false)
      return
    }

    // You'll need to import occupations from the quote page
    const occupationsList = [
      "Accountant",
      "Actor",
      "Architect",
      "Artist",
      "Baker",
      "Barber",
      "Carpenter",
      "Chef",
      "Dentist",
      "Designer",
      "Doctor",
      "Driver",
      "Electrician",
      "Engineer",
      "Farmer",
      "Firefighter",
      "Journalist",
      "Lawyer",
      "Manager",
      "Mechanic",
      "Nurse",
      "Pharmacist",
      "Photographer",
      "Pilot",
      "Plumber",
      "Police Officer",
      "Professor",
      "Programmer",
      "Receptionist",
      "Retired",
      "Sales Representative",
      "Scientist",
      "Self Employed",
      "Student",
      "Teacher",
      "Veterinarian",
      "Waiter/Waitress",
      "Writer",
    ]

    const filtered = occupationsList.filter((occupation) => occupation.toLowerCase().includes(searchTerm.toLowerCase()))

    setFilteredOccupations(filtered.slice(0, 10))
    setShowOccupationDropdown(true)
  }

  const selectOccupation = (occupation: string) => {
    setNewPolicy({ ...newPolicy, occupation })
    setOccupationSearch(occupation)
    setShowOccupationDropdown(false)
  }

  // Vehicle lookup for new policy
  const handleVehicleLookup = async () => {
    if (!newPolicy.vehicleReg.trim()) {
      setVehicleLookupError("Please enter a vehicle registration")
      return
    }

    if (!isValidUKRegistration(newPolicy.vehicleReg)) {
      setVehicleLookupError("Please enter a valid UK registration format")
      return
    }

    setVehicleLookupLoading(true)
    setVehicleLookupError("")
    setFoundVehicle(null)

    try {
      const result = await lookupVehicle(newPolicy.vehicleReg)

      if (result.success && result.vehicle) {
        setFoundVehicle(result.vehicle)
        setNewPolicy({
          ...newPolicy,
          vehicleMake: result.vehicle.make,
          vehicleModel: result.vehicle.model,
          vehicleYear: result.vehicle.year,
        })
      } else {
        setVehicleLookupError(result.error || "Vehicle not found")
      }
    } catch (error) {
      setVehicleLookupError("Failed to lookup vehicle. Please try again.")
    } finally {
      setVehicleLookupLoading(false)
    }
  }

  // Vehicle lookup for edit policy
  const handleEditVehicleLookup = async (registration: string) => {
    if (!registration.trim()) {
      setEditVehicleLookupError("Please enter a vehicle registration")
      return
    }

    if (!isValidUKRegistration(registration)) {
      setEditVehicleLookupError("Please enter a valid UK registration format")
      return
    }

    setEditVehicleLookupLoading(true)
    setEditVehicleLookupError("")
    setEditFoundVehicle(null)

    try {
      const result = await lookupVehicle(registration)

      if (result.success && result.vehicle && editPolicy) {
        setEditFoundVehicle(result.vehicle)
        setEditPolicy({
          ...editPolicy,
          vehicleMake: result.vehicle.make,
          vehicleModel: result.vehicle.model,
          vehicleYear: result.vehicle.year,
        })
      } else {
        setEditVehicleLookupError(result.error || "Vehicle not found")
      }
    } catch (error) {
      setEditVehicleLookupError("Failed to lookup vehicle. Please try again.")
    } finally {
      setEditVehicleLookupLoading(false)
    }
  }

  const resetNewPolicyForm = () => {
    setNewPolicy({
      customerId: "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      address: "",
      postcode: "",
      occupation: "",
      vehicleReg: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      vehicleValue: "",
      amount: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      reason: "",
      licenseType: "",
      licenseHeld: "",
    })
    setFoundVehicle(null)
    setVehicleLookupError("")
    setSelectedCustomerForPolicy(null)
    setCustomerSearch("")
    setShowCustomerDropdown(false)
    setOccupationSearch("")
    setShowOccupationDropdown(false)
    setCustomerDetailsLocked(false)
    setAddresses([])
    setShowAddresses(false)
    setPostcodeError("")
  }

  const handleCreatePolicy = async () => {
    try {
      const response = await fetch("/api/admin/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPolicy),
      });
      const createdPolicy = await response.json();
      setPolicies((prev) => [...prev, createdPolicy]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create policy:", error);
    }
  };

  const handleUpdatePolicy = async () => {
    if (!editPolicy) return;

    // Map the form state back to the database schema format
    const policyDataForDb = {
      firstName: editPolicy.firstName,
      lastName: editPolicy.lastName,
      middleName: editPolicy.middleName,
      phone: editPolicy.phone,
      dateOfBirth: `${editPolicy.dateOfBirth} 00:00:00`,
      postCode: editPolicy.postCode,
      address: editPolicy.address,
      occupation: editPolicy.occupation,
      regNumber: editPolicy.regNumber,
      vehicleMake: editPolicy.vehicleMake,
      vehicleModel: editPolicy.vehicleModel,
      vehicleValue: editPolicy.vehicleValue,
      coverReason: editPolicy.reason,
      licenceType: editPolicy.licenseType,
      licencePeriod: editPolicy.licenseHeld,
      startDate: `${editPolicy.startDate} ${editPolicy.startTime || '00:00'}:00`,
      endDate: `${editPolicy.endDate} ${editPolicy.endTime || '00:00'}:00`,
      cpw: String(editPolicy.premium),
    };

    try {
      const response = await fetch("/api/admin/policies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policyId: editPolicy.id, policyData: policyDataForDb }),
      });
      const updatedPolicy = await response.json();
      setPolicies((prev) =>
        prev.map((policy) => (policy.id === updatedPolicy.id ? updatedPolicy : policy))
      );
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update policy:", error);
    }
  };

  const handleDeletePolicy = async () => {
    if (!selectedPolicy) return;
    try {
      await fetch("/api/admin/policies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policyId: selectedPolicy.id }),
      });
      setPolicies((prev) => prev.filter((policy) => policy.id !== selectedPolicy.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete policy:", error);
    }
  };


  const handlePostcodeLookup = async () => {
    
    // Reset any previous errors
    setPostcodeError("");

    // Check if postcode is empty
    if (!editPolicy.postCode.trim()) {
      setPostcodeError("Please enter a postcode before searching");
      return;
    }

    try {
      const response = await fetch(`/api/postcode-lookup?postcode=${encodeURIComponent(editPolicy.postCode)}`);

      if (response.ok) {
        const data = await response.json();

        console.log('Postcode lookup data: ', data);

        if (data.addresses && data.addresses.length > 0) {
          setEditAddresses(data.addresses);
          setShowEditAddresses(true);
        } else {
          setPostcodeError("No addresses found for this postcode.");
          setEditAddresses([]);
          setShowEditAddresses(false);
        }
      } else {
        setPostcodeError("Failed to fetch addresses. Please try again.");
        setShowEditAddresses(false);
      }
    } catch (error) {
      console.error("An error occurred during postcode lookup", error);
      setPostcodeError("An unexpected error occurred. Please try again.");
      setShowEditAddresses(false);
    }
  }


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Policies</CardTitle>
        <CardDescription>Manage all document policies purchased through your platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search policies..."
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
                <SelectItem value="latest">Latest Purchased</SelectItem>
                <SelectItem value="oldest">Oldest Purchased</SelectItem>
                <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                <SelectItem value="amount-high">Highest Amount</SelectItem>
                <SelectItem value="amount-low">Lowest Amount</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Policy
            </Button>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {policy.firstName} {policy.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{policy.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {policy.vehicleMake} {policy.vehicleModel}
                  </TableCell>
                  <TableCell className="font-mono">{policy.regNumber}</TableCell>
                  <TableCell>£{Number(policy.cpw || 0).toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(policy)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDateTime(policy.startDate, '00:00')}</div>
                      <div className="text-gray-500">to {formatDateTime(policy.endDate, '23:59')}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const parseDateTime = (dt) => {
                            if (!dt || typeof dt !== 'string') return { date: '', time: '' };
                            const [date, time] = dt.split(' ');
                            return { date: date || '', time: time ? time.substring(0, 5) : '' };
                          };

                          setSelectedPolicy(policy);
                          setEditFoundVehicle(null);
                          setEditVehicleLookupError("");
                          setEditPolicy({
                            id: policy.id,
                            policyNumber: policy.policyNumber,
                            firstName: policy.firstName || '',
                            middleName: policy.middleName || '',
                            lastName: policy.lastName || '',
                            email: policy.email || '',
                            phone: policy.phone || '',
                            dateOfBirth: parseDateTime(policy.dateOfBirth).date,
                            postCode: policy.postCode || '',
                            address: policy.address || '',
                            occupation: policy.occupation || '',
                            regNumber: policy.regNumber || '',
                            vehicleMake: policy.vehicleMake || '',
                            vehicleModel: policy.vehicleModel || '',
                            vehicleYear: policy.vehicleYear || '',
                            vehicleValue: policy.vehicleValue || '',
                            reason: policy.coverReason || '',
                            licenseType: policy.licenceType || '',
                            licenseHeld: policy.licencePeriod || '',
                            startDate: parseDateTime(policy.startDate).date,
                            startTime: parseDateTime(policy.startDate).time,
                            endDate: parseDateTime(policy.endDate).date,
                            endTime: parseDateTime(policy.endDate).time,
                            premium: parseFloat(policy.cpw) || 0,
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPolicy(policy)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewPolicy(policy)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewCustomer(policy)}>
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Edit Policy Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Policy</DialogTitle>
              <DialogDescription>Update policy details for {selectedPolicy?.policyNumber}</DialogDescription>
            </DialogHeader>
            {editPolicy && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="editFirstName">First Name</Label>
                    <Input
                      id="editFirstName"
                      value={editPolicy.firstName}
                      onChange={(e) => setEditPolicy({ ...editPolicy, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editMiddleName">Middle Name</Label>
                    <Input
                      id="editMiddleName"
                      value={editPolicy.middleName}
                      onChange={(e) => setEditPolicy({ ...editPolicy, middleName: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLastName">Last Name</Label>
                    <Input
                      id="editLastName"
                      value={editPolicy.lastName}
                      onChange={(e) => setEditPolicy({ ...editPolicy, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="editEmail">Email (Read-only)</Label>
                  <Input id="editEmail" type="email" value={editPolicy.email} className="bg-gray-50" readOnly />
                  <p className="text-xs text-gray-500 mt-1">Customer assignment cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    value={editPolicy.phone}
                    onChange={(e) => setEditPolicy({ ...editPolicy, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Input
                        type="text"
                        value={editPolicy.dateOfBirth.split('-')[2] || ''}
                        onChange={(e) => {
                          const day = e.target.value.replace(/\D/g, "").slice(0, 2)
                          const month = editPolicy.dateOfBirth.split('-')[1] || ''
                          const year = editPolicy.dateOfBirth.split('-')[0] || ''
                          setEditPolicy({ ...editPolicy, dateOfBirth: `${year}-${month}-${day}` })
                        }}
                        placeholder="DD"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        value={editPolicy.dateOfBirth.split('-')[1] || ''}
                        onChange={(e) => {
                          const day = editPolicy.dateOfBirth.split('-')[2] || ''
                          const month = e.target.value.replace(/\D/g, "").slice(0, 2)
                          const year = editPolicy.dateOfBirth.split('-')[0] || ''
                          setEditPolicy({ ...editPolicy, dateOfBirth: `${year}-${month}-${day}` })
                        }}
                        placeholder="MM"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        value={editPolicy.dateOfBirth.split('-')[0] || ''}
                        onChange={(e) => {
                          const day = editPolicy.dateOfBirth.split('-')[2] || ''
                          const month = editPolicy.dateOfBirth.split('-')[1] || ''
                          const year = e.target.value.replace(/\D/g, "").slice(0, 4)
                          setEditPolicy({ ...editPolicy, dateOfBirth: `${year}-${month}-${day}` })
                        }}
                        placeholder="YYYY"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="editPostcode">Postcode</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="editPostcode"
                      value={editPolicy.postCode}
                      onChange={(e) => {
                        setEditPolicy({ ...editPolicy, postCode: e.target.value.toUpperCase() })
                        setEditPostcodeError("")
                      }}
                      placeholder="Enter postcode"
                    />
                    <Button
                      type="button"
                      onClick={handlePostcodeLookup}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                  {editPostcodeError && <p className="text-red-600 text-sm mt-2">{editPostcodeError}</p>}
                </div>

                {showEditAddresses && editAddresses.length > 0 && (
                  <div>
                    <Label htmlFor="editAddress">Select Address</Label>
                    <select
                      id="editAddress"
                      value={editPolicy.address}
                      onChange={(e) => setEditPolicy({ ...editPolicy, address: e.target.value })}
                      className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="">Select an address...</option>
                      {editAddresses.map((address: any, index) => (
                          <option key={index} value={address.address_selector}>
                            {address.address_selector}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="relative">
                  <Label htmlFor="editOccupation">Occupation</Label>
                  <Input
                    id="editOccupation"
                    value={editPolicy.occupation}
                    onChange={(e) => {
                      setEditPolicy({ ...editPolicy, occupation: e.target.value })
                      handleOccupationSearch(e.target.value)
                    }}
                    onFocus={() => {
                      if (editPolicy.occupation && filteredOccupations.length > 0) {
                        setShowOccupationDropdown(true)
                      }
                    }}
                    placeholder="Start typing occupation..."
                  />

                  {showOccupationDropdown && filteredOccupations.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {filteredOccupations.map((occupation) => (
                        <button
                          key={occupation}
                          type="button"
                          onClick={() => {
                            setEditPolicy({ ...editPolicy, occupation })
                            setShowOccupationDropdown(false)
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                        >
                          {occupation}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vehicle Lookup Section for Edit */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editRegistration">Vehicle Registration</Label>
                    <div className="flex gap-2">
                      <Input
                        id="editRegistration"
                        value={editPolicy.regNumber}
                        onChange={(e) => {
                          setEditPolicy({ ...editPolicy, regNumber: e.target.value.toUpperCase() })
                          setEditVehicleLookupError("")
                          setEditFoundVehicle(null)
                        }}
                        placeholder="Enter registration (e.g., AB12 CDE)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => handleEditVehicleLookup(editPolicy.regNumber)}
                        disabled={editVehicleLookupLoading}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-6 flex items-center space-x-2"
                      >
                        {editVehicleLookupLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Finding...</span>
                          </>
                        ) : (
                          <>
                            <Car className="w-4 h-4" />
                            <span>Find</span>
                          </>
                        )}
                      </Button>
                    </div>
                    {editVehicleLookupError && <p className="text-red-600 text-sm mt-2">{editVehicleLookupError}</p>}
                  </div>

                  {editFoundVehicle && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Vehicle Found</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Make:</span> {editFoundVehicle.make}
                        </div>
                        <div>
                          <span className="font-medium">Model:</span> {editFoundVehicle.model}
                        </div>
                        <div>
                          <span className="font-medium">Engine:</span> {editFoundVehicle.engineSize}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="editVehicleMake">Make</Label>
                      <Input
                        id="editVehicleMake"
                        value={editPolicy.vehicleMake}
                        onChange={(e) => setEditPolicy({ ...editPolicy, vehicleMake: e.target.value })}
                        readOnly={!!editFoundVehicle}
                        className={editFoundVehicle ? "bg-gray-50" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editVehicleModel">Model</Label>
                      <Input
                        id="editVehicleModel"
                        value={editPolicy.vehicleModel}
                        onChange={(e) => setEditPolicy({ ...editPolicy, vehicleModel: e.target.value })}
                        readOnly={!!editFoundVehicle}
                        className={editFoundVehicle ? "bg-gray-50" : ""}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editVehicleValue">Vehicle Value</Label>
                    <Select
                      value={editPolicy.vehicleValue}
                      onValueChange={(value) => setEditPolicy({ ...editPolicy, vehicleValue: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="£1,000 - £5,000">£1,000 - £5,000</SelectItem>
                        <SelectItem value="£5,000 - £10,000">£5,000 - £10,000</SelectItem>
                        <SelectItem value="£10,000 - £20,000">£10,000 - £20,000</SelectItem>
                        <SelectItem value="£20,000 - £30,000">£20,000 - £30,000</SelectItem>
                        <SelectItem value="£30,000 - £50,000">£30,000 - £50,000</SelectItem>
                        <SelectItem value="£50,000 - £80,000">£50,000 - £80,000</SelectItem>
                        <SelectItem value="£80,000+">£80,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editReason">Reason</Label>
                    <Select
                      value={editPolicy.reason}
                      onValueChange={(value) => setEditPolicy({ ...editPolicy, reason: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Borrowing">Borrowing</SelectItem>
                        <SelectItem value="Buying/Selling/Testing">Buying/Selling/Testing</SelectItem>
                        <SelectItem value="Learning">Learning</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editLicenseType">License Type</Label>
                    <Select
                      value={editPolicy.licenseType}
                      onValueChange={(value) => setEditPolicy({ ...editPolicy, licenseType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full UK License">Full UK License</SelectItem>
                        <SelectItem value="Provisional License">Provisional License</SelectItem>
                        <SelectItem value="International License">International License</SelectItem>
                        <SelectItem value="EU License">EU License</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editLicenseHeld">License Held</Label>
                    <Select
                      value={editPolicy.licenseHeld}
                      onValueChange={(value) => setEditPolicy({ ...editPolicy, licenseHeld: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Under 1 Year">Under 1 Year</SelectItem>
                        <SelectItem value="1-2 Years">1-2 Years</SelectItem>
                        <SelectItem value="2-4 Years">2-4 Years</SelectItem>
                        <SelectItem value="5-10 Years">5-10 Years</SelectItem>
                        <SelectItem value="10+ Years">10+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editStartDate">Start Date</Label>
                    <Input
                      id="editStartDate"
                      type="date"
                      value={editPolicy.startDate}
                      onChange={(e) => setEditPolicy({ ...editPolicy, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editEndDate">End Date</Label>
                    <Input
                      id="editEndDate"
                      type="date"
                      value={editPolicy.endDate}
                      onChange={(e) => setEditPolicy({ ...editPolicy, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <div className="flex gap-2">
                      <Select
                        value={editPolicy.startTime?.split(':')[0] || ''}
                        onValueChange={(hour) => {
                          const minute = editPolicy.startTime?.split(':')[1] || '00';
                          setEditPolicy({ ...editPolicy, startTime: `${hour}:${minute}` });
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger>
                        <SelectContent>
                          {hours.map(h => <SelectItem key={`start-h-${h}`} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select
                        value={editPolicy.startTime?.split(':')[1] || ''}
                        onValueChange={(minute) => {
                          const hour = editPolicy.startTime?.split(':')[0] || '00';
                          setEditPolicy({ ...editPolicy, startTime: `${hour}:${minute}` });
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Minute" /></SelectTrigger>
                        <SelectContent>
                          {minutes.map(m => <SelectItem key={`start-m-${m}`} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <div className="flex gap-2">
                      <Select
                        value={editPolicy.endTime?.split(':')[0] || ''}
                        onValueChange={(hour) => {
                          const minute = editPolicy.endTime?.split(':')[1] || '00';
                          setEditPolicy({ ...editPolicy, endTime: `${hour}:${minute}` });
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger>
                        <SelectContent>
                          {hours.map(h => <SelectItem key={`end-h-${h}`} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select
                        value={editPolicy.endTime?.split(':')[1] || ''}
                        onValueChange={(minute) => {
                          const hour = editPolicy.endTime?.split(':')[0] || '00';
                          setEditPolicy({ ...editPolicy, endTime: `${hour}:${minute}` });
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Minute" /></SelectTrigger>
                        <SelectContent>
                          {minutes.map(m => <SelectItem key={`end-m-${m}`} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="editAmount">Amount (£)</Label>
                  <Input
                    id="editAmount"
                    type="number"
                    step="0.01"
                    value={editPolicy.premium}
                    onChange={(e) => setEditPolicy({ ...editPolicy, premium: Number.parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-2">
                    {selectedPolicy ? getStatusBadge(selectedPolicy) : <Badge variant="secondary">Unknown</Badge>}
                    <span className="text-sm text-gray-500 ml-2">
                      (Automatically determined based on dates and times)
                    </span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePolicy}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Policy Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Delete Policy
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete policy {selectedPolicy?.policyNumber}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePolicy}>
                Delete Policy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create New Policy Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Policy</DialogTitle>
              <DialogDescription>Add a new document policy for a customer</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Customer Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Selection</h3>

                <div className="relative">
                  <Label htmlFor="customerSearch">Search Existing Customer</Label>
                  <Input
                    id="customerSearch"
                    value={customerSearch}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    onFocus={() => {
                      if (customerSearch && filteredCustomers.length > 0) {
                        setShowCustomerDropdown(true)
                      }
                    }}
                    placeholder="Type customer name or email..."
                    className="w-full"
                  />

                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => selectCustomerForPolicy(customer)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedCustomerForPolicy && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Customer Selected</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCustomerDetailsLocked(!customerDetailsLocked)}
                        className="text-xs flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        {customerDetailsLocked ? "Unlock Details" : "Lock Details"}
                      </Button>
                    </div>
                    <div className="text-sm text-gray-700">
                      <p>
                        <strong>Name:</strong> {selectedCustomerForPolicy.firstName}{" "}
                        {selectedCustomerForPolicy.lastName}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedCustomerForPolicy.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {selectedCustomerForPolicy.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Information (Auto-filled from selection) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="newFirstName">First Name</Label>
                    <Input
                      id="newFirstName"
                      value={newPolicy.firstName}
                      onChange={(e) => setNewPolicy({ ...newPolicy, firstName: e.target.value })}
                      className={customerDetailsLocked ? "bg-gray-50" : ""}
                      readOnly={customerDetailsLocked}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newMiddleName">Middle Name</Label>
                    <Input
                      id="newMiddleName"
                      value={newPolicy.middleName}
                      onChange={(e) => setNewPolicy({ ...newPolicy, middleName: e.target.value })}
                      className={customerDetailsLocked ? "bg-gray-50" : ""}
                      readOnly={customerDetailsLocked}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newLastName">Last Name</Label>
                    <Input
                      id="newLastName"
                      value={newPolicy.lastName}
                      onChange={(e) => setNewPolicy({ ...newPolicy, lastName: e.target.value })}
                      className={customerDetailsLocked ? "bg-gray-50" : ""}
                      readOnly={customerDetailsLocked}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newEmail">Email</Label>
                    <Input id="newEmail" type="email" value={newPolicy.email} className="bg-gray-50" readOnly />
                    {selectedCustomerForPolicy && (
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed after customer selection</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="newPhone">Phone Number</Label>
                    <Input
                      id="newPhone"
                      value={newPolicy.phoneNumber}
                      onChange={(e) => setNewPolicy({ ...newPolicy, phoneNumber: e.target.value })}
                      className={customerDetailsLocked ? "bg-gray-50" : ""}
                      readOnly={customerDetailsLocked}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newDateOfBirth">Date of Birth</Label>
                    <Input
                      id="newDateOfBirth"
                      type="date"
                      value={newPolicy.dateOfBirth}
                      onChange={(e) => setNewPolicy({ ...newPolicy, dateOfBirth: e.target.value })}
                      className={customerDetailsLocked ? "bg-gray-50" : ""}
                      readOnly={customerDetailsLocked}
                    />
                  </div>
                  <div className="relative">
                    <Label htmlFor="newOccupation">Occupation</Label>
                    <Input
                      id="newOccupation"
                      value={customerDetailsLocked ? newPolicy.occupation : occupationSearch || newPolicy.occupation}
                      onChange={(e) => {
                        if (!customerDetailsLocked) {
                          handleOccupationSearch(e.target.value)
                          setNewPolicy({ ...newPolicy, occupation: e.target.value })
                        }
                      }}
                      onFocus={() => {
                        if (!customerDetailsLocked && occupationSearch && filteredOccupations.length > 0) {
                          setShowOccupationDropdown(true)
                        }
                      }}
                      placeholder="Start typing occupation..."
                      className={customerDetailsLocked ? "bg-gray-50" : ""}
                      readOnly={customerDetailsLocked}
                    />

                    {showOccupationDropdown && filteredOccupations.length > 0 && !customerDetailsLocked && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {filteredOccupations.map((occupation) => (
                          <button
                            key={occupation}
                            type="button"
                            onClick={() => selectOccupation(occupation)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                          >
                            {occupation}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPostcode">Postcode</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="newPostcode"
                      value={newPolicy.postcode}
                      onChange={(e) => {
                        setNewPolicy({ ...newPolicy, postcode: e.target.value.toUpperCase() })
                        setPostcodeError("")
                      }}
                      placeholder="Enter postcode"
                      className={customerDetailsLocked ? "bg-gray-50" : ""}
                      readOnly={customerDetailsLocked}
                    />
                    <Button
                      type="button"
                      onClick={handlePostcodeLookup}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6"
                      disabled={customerDetailsLocked}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                  {postcodeError && <p className="text-red-600 text-sm mt-2">{postcodeError}</p>}
                </div>

                {showAddresses && addresses.length > 0 && (
                  <div>
                    <Label htmlFor="newAddress">Select Address</Label>
                    <select
                      id="newAddress"
                      value={newPolicy.address}
                      onChange={(e) => setNewPolicy({ ...newPolicy, address: e.target.value })}
                      className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      disabled={customerDetailsLocked}
                    >
                      <option value="">Select an address...</option>
                      {addresses.map((address, index) => (
                        <option key={index} value={address}>
                          {address}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* License Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">License Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newLicenseType">License Type</Label>
                    <Select
                      value={newPolicy.licenseType}
                      onValueChange={(value) => setNewPolicy({ ...newPolicy, licenseType: value })}
                      disabled={customerDetailsLocked}
                    >
                      <SelectTrigger className={customerDetailsLocked ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select license type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full UK License">Full UK License</SelectItem>
                        <SelectItem value="Provisional License">Provisional License</SelectItem>
                        <SelectItem value="International License">International License</SelectItem>
                        <SelectItem value="EU License">EU License</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="newLicenseHeld">License Held</Label>
                    <Select
                      value={newPolicy.licenseHeld}
                      onValueChange={(value) => setNewPolicy({ ...newPolicy, licenseHeld: value })}
                      disabled={customerDetailsLocked}
                    >
                      <SelectTrigger className={customerDetailsLocked ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Under 1 Year">Under 1 Year</SelectItem>
                        <SelectItem value="1-2 Years">1-2 Years</SelectItem>
                        <SelectItem value="2-4 Years">2-4 Years</SelectItem>
                        <SelectItem value="5-10 Years">5-10 Years</SelectItem>
                        <SelectItem value="10+ Years">10+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Vehicle Information with Lookup */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vehicle Information</h3>

                {/* Vehicle Registration Lookup */}
                <div>
                  <Label htmlFor="newVehicleReg">Vehicle Registration</Label>
                  <div className="flex gap-2">
                    <Input
                      id="newVehicleReg"
                      value={newPolicy.vehicleReg}
                      onChange={(e) => {
                        setNewPolicy({ ...newPolicy, vehicleReg: e.target.value.toUpperCase() })
                        setVehicleLookupError("")
                        setFoundVehicle(null)
                      }}
                      placeholder="Enter registration (e.g., AB12 CDE)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleVehicleLookup}
                      disabled={vehicleLookupLoading || !newPolicy.vehicleReg.trim()}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6 flex items-center space-x-2"
                    >
                      {vehicleLookupLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Finding...</span>
                        </>
                      ) : (
                        <>
                          <Car className="w-4 h-4" />
                          <span>Find</span>
                        </>
                      )}
                    </Button>
                  </div>
                  {vehicleLookupError && <p className="text-red-600 text-sm mt-2">{vehicleLookupError}</p>}
                </div>

                {/* Vehicle Found Display */}
                {foundVehicle && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Vehicle Found</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Make:</span> {foundVehicle.make}
                      </div>
                      <div>
                        <span className="font-medium">Model:</span> {foundVehicle.model}
                      </div>
                      <div>
                        <span className="font-medium">Engine:</span> {foundVehicle.engineSize}
                      </div>
                      <div>
                        <span className="font-medium">Fuel Type:</span> {foundVehicle.fuelType}
                      </div>
                      <div>
                        <span className="font-medium">Colour:</span> {foundVehicle.colour}
                      </div>
                    </div>
                  </div>
                )}

                {/* Demo Registrations Helper */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Demo Registrations (for testing):</p>
                    <div className="grid grid-cols-1 gap-1">
                      {DEMO_REGISTRATIONS.map((demo, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            const reg = demo.split(" - ")[0]
                            setNewPolicy({ ...newPolicy, vehicleReg: reg })
                            setVehicleLookupError("")
                            setFoundVehicle(null)
                          }}
                          className="text-left hover:bg-blue-100 px-2 py-1 rounded text-xs"
                        >
                          {demo}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vehicle Details (Auto-filled or Manual) */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="newVehicleMake">Make</Label>
                    <Input
                      id="newVehicleMake"
                      value={newPolicy.vehicleMake}
                      onChange={(e) => setNewPolicy({ ...newPolicy, vehicleMake: e.target.value })}
                      readOnly={!!foundVehicle}
                      className={foundVehicle ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newVehicleModel">Model</Label>
                    <Input
                      id="newVehicleModel"
                      value={newPolicy.vehicleModel}
                      onChange={(e) => setNewPolicy({ ...newPolicy, vehicleModel: e.target.value })}
                      readOnly={!!foundVehicle}
                      className={foundVehicle ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="newVehicleValue">Vehicle Value</Label>
                  <Select
                    value={newPolicy.vehicleValue}
                    onValueChange={(value) => setNewPolicy({ ...newPolicy, vehicleValue: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select value range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="£1,000 - £5,000">£1,000 - £5,000</SelectItem>
                      <SelectItem value="£5,000 - £10,000">£5,000 - £10,000</SelectItem>
                      <SelectItem value="£10,000 - £20,000">£10,000 - £20,000</SelectItem>
                      <SelectItem value="£20,000 - £30,000">£20,000 - £30,000</SelectItem>
                      <SelectItem value="£30,000 - £50,000">£30,000 - £50,000</SelectItem>
                      <SelectItem value="£50,000 - £80,000">£50,000 - £80,000</SelectItem>
                      <SelectItem value="£80,000+">£80,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Policy Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Policy Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newStartDate">Start Date</Label>
                    <Input
                      id="newStartDate"
                      type="date"
                      value={newPolicy.startDate}
                      onChange={(e) => setNewPolicy({ ...newPolicy, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newEndDate">End Date</Label>
                    <Input
                      id="newEndDate"
                      type="date"
                      value={newPolicy.endDate}
                      onChange={(e) => setNewPolicy({ ...newPolicy, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newStartTime">Start Time</Label>
                    <Input
                      id="newStartTime"
                      type="time"
                      value={newPolicy.startTime}
                      onChange={(e) => setNewPolicy({ ...newPolicy, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newEndTime">End Time</Label>
                    <Input
                      id="newEndTime"
                      type="time"
                      value={newPolicy.endTime}
                      onChange={(e) => setNewPolicy({ ...newPolicy, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newAmount">Amount (£)</Label>
                    <Input
                      id="newAmount"
                      type="number"
                      step="0.01"
                      value={newPolicy.amount}
                      onChange={(e) => setNewPolicy({ ...newPolicy, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newReason">Reason</Label>
                    <Select
                      value={newPolicy.reason}
                      onValueChange={(value) => setNewPolicy({ ...newPolicy, reason: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Borrowing">Borrowing</SelectItem>
                        <SelectItem value="Buying/Selling/Testing">Buying/Selling/Testing</SelectItem>
                        <SelectItem value="Learning">Learning</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  resetNewPolicyForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePolicy}>
                Create Policy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Customer Details Dialog */}
        <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>
                Complete customer information and policy history for {selectedCustomer?.firstName}{" "}
                {selectedCustomer?.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>
                        {selectedCustomer?.firstName} {selectedCustomer?.middleName} {selectedCustomer?.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{selectedCustomer?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{selectedCustomer?.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Date of Birth:</span>
                      <span>{selectedCustomer?.dateOfBirth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Address:</span>
                      <span className="text-right">{selectedCustomer?.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Postcode:</span>
                      <span>{selectedCustomer?.postCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Occupation:</span>
                      <span>{selectedCustomer?.occupation}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Account Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Customer Since:</span>
                      <span>{selectedCustomer?.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Policies:</span>
                      <span>{selectedCustomer?.quotes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Spent:</span>
                      <span>£{selectedCustomer?.totalSpent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">License Type:</span>
                      <span>{selectedCustomer?.licenseType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">License Held:</span>
                      <span>{selectedCustomer?.licenseHeld}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy History */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Policy History</h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Policy Number</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Registration</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCustomer?.quotes.map((policy:any) => (
                        <TableRow key={policy.id}>
                          <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                          <TableCell>
                            {policy.vehicleMake} {policy.vehicleModel}
                          </TableCell>
                          <TableCell className="font-mono">{policy.regNumber}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDateTime(policy.startDate, '00:00')}</div>
                              <div className="text-gray-500">to {formatDateTime(policy.endDate, '23:59')}</div>
                            </div>
                          </TableCell>
                          <TableCell>£{policy.cpw.toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(policy)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => handleViewPolicy(policy)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsCustomerDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
