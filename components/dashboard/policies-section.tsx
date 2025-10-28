"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { User } from "@/lib/definitions"
import { Skeleton } from "@/components/ui/skeleton"
import {
  UserIcon,
  FileTextIcon,
  X,
  Search,
  Car,
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Shield,
} from "lucide-react"

const PoliciesSection = () => {
  const [policies, setPolicies] = useState([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/policies")
        if (!response.ok) {
          throw new Error("Failed to fetch data")
        }
        const { policies, user } = await response.json()

        setPolicies(policies)
        setUser(user || null)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "expired":
        return "bg-red-100 text-red-800 border-red-200"
      case "upcoming":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return "🟢"
      case "expired":
        return "🔴"
      case "upcoming":
        return "🟡"
      default:
        return "⚪"
    }
  }

  const getPolicyStatus = (policy) => {
    const now = new Date();
    const startDate = new Date(policy.startDate);
    const endDate = new Date(policy.endDate);

    if (endDate < now) {
      return "expired";
    }
    if (startDate > now) {
      return "upcoming";
    }
    return "active";
  };

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.vehicleMake.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.regNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffInHours = Math.round((end - start) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return diffInHours === 1 ? "1 hour" : `${diffInHours} hours`
    } else {
      const days = Math.round(diffInHours / 24)
      return days === 1 ? "1 day" : `${days} days`
    }
  }

  const openDetailsModal = (policy) => {
    setSelectedPolicy(policy)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPolicy(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Policies</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (policies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Policies Found</h3>
          <p className="text-gray-600 mb-6">You don't have any insurance policies yet.</p>
          <Link href="/">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <Shield className="w-4 h-4 mr-2" />
              Get Your First Policy
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Policies</h2>
          <p className="text-gray-600 mt-1">
            {policies.length} {policies.length === 1 ? "policy" : "policies"} found
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Policy Cards */}
      <div className="grid gap-6">
        {filteredPolicies.map((policy) => {
          const status = getPolicyStatus(policy);
          return (
          <Card key={policy.id} className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Car className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Policy {policy.policyNumber}</h3>
                    <p className="text-sm text-gray-600">Purchased on {formatDate(policy.createdAt)}</p>
                  </div>
                </div>

                <Badge className={`${getStatusColor(status)} font-medium`}>
                  <span className="mr-1">{getStatusIcon(status)}</span>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Vehicle Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Car className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Vehicle Details</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Registration</span>
                    <p className="font-medium text-gray-900">{policy.regNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Make & Model</span>
                    <p className="font-medium text-gray-900">
                      {policy.vehicleMake} {policy.vehicleModel}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Premium</span>
                    <p className="font-medium text-teal-600 text-lg">£{policy.quoteData ? JSON.parse(policy.quoteData).total.toFixed(2) : "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Policy Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Period</span>
                    <p className="font-medium text-gray-900">
                      {formatDate(policy.startDate)} - {formatDate(policy.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Duration</span>
                    <p className="font-medium text-gray-900">{calculateDuration(policy.startDate, policy.endDate)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => openDetailsModal(policy)}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  View Details
                </Button>
                <Link href={`/policy/view?number=${policy.policyNumber}`} className="flex-1">
                  <Button
                    variant="default"
                    className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700"
                  >
                    <FileTextIcon className="w-4 h-4" />
                    View Documents
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          )
        })}}
      </div>

      {/* No Search Results */}
      {filteredPolicies.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600">No policies found matching "{searchTerm}"</p>
          <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-4">
            Clear Search
          </Button>
        </div>
      )}

      {/* Enhanced Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold">Policy {selectedPolicy?.policyNumber}</DialogTitle>
                  <p className="text-sm text-gray-600">Complete policy information</p>
                </div>
              </div>
              {/* <button onClick={closeModal} className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button> */}
            </div>
          </DialogHeader>

          {selectedPolicy && (
            <div className="space-y-6 pt-6">
              {/* Policy Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(getPolicyStatus(selectedPolicy))} font-medium text-sm`}>
                    <span className="mr-1">{getStatusIcon(getPolicyStatus(selectedPolicy))}</span>
                    {getPolicyStatus(selectedPolicy).charAt(0).toUpperCase() + getPolicyStatus(selectedPolicy).slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-600">Purchased on {formatDate(selectedPolicy.createdAt)}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Premium</p>
                  <p className="text-xl font-bold text-teal-600">£{ Number(selectedPolicy.update_price ?? selectedPolicy.cpw).toFixed(2)}</p>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Personal Information</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Full Name</p>
                        <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                        <p className="font-medium text-gray-900">{selectedPolicy?.dateOfBirth ? formatDate(selectedPolicy.dateOfBirth) : "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="font-medium text-gray-900">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="font-medium text-gray-900">{selectedPolicy?.phone || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-900">{selectedPolicy?.address || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vehicle Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Vehicle Information</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Registration</p>
                        <p className="font-medium text-gray-900 text-lg">{selectedPolicy.regNumber}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Make & Model</p>
                      <p className="font-medium text-gray-900 text-lg">
                        {selectedPolicy.vehicleMake} {selectedPolicy.vehicleModel}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Policy Information */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Policy Information</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Period</p>
                        <p className="font-medium text-gray-900">{formatDateTime(selectedPolicy.startDate)}</p>
                        <p className="text-sm text-gray-600">to</p>
                        <p className="font-medium text-gray-900">{formatDateTime(selectedPolicy.endDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium text-gray-900">
                          {calculateDuration(selectedPolicy.startDate, selectedPolicy.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount Paid</p>
                        <p className="font-medium text-gray-900 text-lg">£{selectedPolicy.quoteData ? JSON.parse(selectedPolicy.quoteData).total.toFixed(2) : "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button onClick={closeModal} variant="outline" className="flex-1">
                  Close
                </Button>
                <Link href={`/policy/view?number=${selectedPolicy.policyNumber}`} className="flex-1">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700">
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    View Documents
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { PoliciesSection }
export default PoliciesSection