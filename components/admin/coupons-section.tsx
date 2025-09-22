"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Search, Plus, AlertTriangle, X } from "lucide-react"

// Mock data for coupons
const mockCoupons = [
  {
    id: 1,
    promoCode: "MAZHAR",
    discount: { type: "percentage", value: 15 },
    minSpent: 0,
    maxDiscount: null,
    quotaAvailable: 19,
    usedQuota: 1,
    totalUsage: 1,
    expires: "2025-12-23 23:59:59",
    createdAt: "14-05-25 08:17:11 AM",
    isActive: true,
    restrictions: {
      firstTimeOnly: false,
      maxUsesPerUser: 1,
      validDays: [],
      validHours: { start: "00:00", end: "23:59" },
    },
    matches: {
      lastName: "",
      dateOfBirth: "",
      registrations: [],
    },
  },
  {
    id: 2,
    promoCode: "X8978DF",
    discount: { type: "percentage", value: 20 },
    minSpent: 0,
    maxDiscount: null,
    quotaAvailable: 0,
    usedQuota: 0,
    totalUsage: 0,
    expires: "2025-12-23 23:59:59",
    createdAt: "14-05-25 06:11:29 PM",
    isActive: true,
    restrictions: {
      firstTimeOnly: false,
      maxUsesPerUser: 1,
      validDays: [],
      validHours: { start: "00:00", end: "23:59" },
    },
    matches: {
      lastName: "",
      dateOfBirth: "",
      registrations: [],
    },
  },
  {
    id: 3,
    promoCode: "FRIDAY35",
    discount: { type: "percentage", value: 30 },
    minSpent: 0,
    maxDiscount: null,
    quotaAvailable: 5,
    usedQuota: 5,
    totalUsage: 5,
    expires: "2025-12-23 23:59:59",
    createdAt: "29-05-25 05:53:30 PM",
    isActive: true,
    restrictions: {
      firstTimeOnly: false,
      maxUsesPerUser: 1,
      validDays: [],
      validHours: { start: "00:00", end: "23:59" },
    },
    matches: {
      lastName: "",
      dateOfBirth: "",
      registrations: [],
    },
  },
  {
    id: 4,
    promoCode: "WELCOME10",
    discount: { type: "percentage", value: 10 },
    minSpent: 0,
    maxDiscount: null,
    quotaAvailable: 0,
    usedQuota: 0,
    totalUsage: 0,
    expires: "2025-12-23 23:59:59",
    createdAt: "30-05-25 11:53:14 AM",
    isActive: true,
    restrictions: {
      firstTimeOnly: false,
      maxUsesPerUser: 1,
      validDays: [],
      validHours: { start: "00:00", end: "23:59" },
    },
    matches: {
      lastName: "",
      dateOfBirth: "",
      registrations: [],
    },
  },
]

export function CouponsSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null)
  const [newCoupon, setNewCoupon] = useState({
    promoCode: "",
    discount: { type: "percentage", value: 0 },
    minSpent: "",
    quotaAvailable: "",
    expires: "",
    matches: {
      lastName: "",
      dateOfBirth: "",
      registrations: "",
    },
    restrictions: {
      firstTimeOnly: false,
      maxUsesPerUser: 1,
      validDays: [],
      validHours: { start: "00:00", end: "23:59" },
    },
  })

  const filteredCoupons = mockCoupons.filter((coupon) =>
    coupon.promoCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDiscount = (discount: any) => {
    if (discount.type === "percentage") {
      return `${discount.value}.00(%)`
    }
    return `£${discount.value.toFixed(2)}`
  }

  const resetNewCoupon = () => {
    setNewCoupon({
      promoCode: "",
      discount: { type: "percentage", value: 0 },
      minSpent: "",
      quotaAvailable: "",
      expires: "",
      matches: {
        lastName: "",
        dateOfBirth: "",
        registrations: "",
      },
      restrictions: {
        firstTimeOnly: false,
        maxUsesPerUser: 1,
        validDays: [],
        validHours: { start: "00:00", end: "23:59" },
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coupons</CardTitle>
        <CardDescription>Manage discount coupons and promotional codes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-teal-600 hover:bg-teal-700">
              Create Coupon
            </Button>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search:"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 w-64"
              />
            </div>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Promo Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min. Spent</TableHead>
                <TableHead>Max. Discount</TableHead>
                <TableHead>Used Quota</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Created at</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.map((coupon, index) => (
                <TableRow key={coupon.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{coupon.promoCode}</TableCell>
                  <TableCell>{formatDiscount(coupon.discount)}</TableCell>
                  <TableCell>{coupon.minSpent.toFixed(2)}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {coupon.usedQuota}/{coupon.quotaAvailable}
                      </div>
                      <div className="text-xs text-gray-500">
                        {coupon.quotaAvailable > 0
                          ? `${Math.round((coupon.usedQuota / coupon.quotaAvailable) * 100)}% used`
                          : "Unlimited"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{coupon.expires}</TableCell>
                  <TableCell>{coupon.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCoupon(coupon)
                          setIsEditDialogOpen(true)
                        }}
                        className="bg-blue-500 text-white hover:bg-blue-600"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCoupon(coupon)
                          setIsDeleteDialogOpen(true)
                        }}
                        className="bg-red-500 text-white hover:bg-red-600"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Create Coupon Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Create Coupon
                <Button variant="ghost" size="sm" onClick={() => setIsCreateDialogOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="promo-code">Promo Code</Label>
                  <Input
                    id="promo-code"
                    placeholder="Enter promo code"
                    value={newCoupon.promoCode}
                    onChange={(e) => setNewCoupon({ ...newCoupon, promoCode: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount</Label>
                  <div className="flex gap-2">
                    <Input
                      id="discount"
                      type="number"
                      placeholder="0"
                      value={newCoupon.discount.value}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          discount: { ...newCoupon.discount, value: Number.parseInt(e.target.value) || 0 },
                        })
                      }
                      className="flex-1"
                    />
                    <Select
                      value={newCoupon.discount.type}
                      onValueChange={(value) =>
                        setNewCoupon({
                          ...newCoupon,
                          discount: { ...newCoupon.discount, type: value },
                        })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="fixed">£</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-spent">Min. Spent (Minimum amount to apply) - Optional</Label>
                  <Input
                    id="min-spent"
                    type="number"
                    placeholder="0.00"
                    value={newCoupon.minSpent}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minSpent: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="quota">Quota Available</Label>
                  <Input
                    id="quota"
                    type="number"
                    placeholder="Enter quota"
                    value={newCoupon.quotaAvailable}
                    onChange={(e) => setNewCoupon({ ...newCoupon, quotaAvailable: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expires">Expires (e.g 2025-12-23 23:59:59)</Label>
                <Input
                  id="expires"
                  placeholder="YYYY-mm-dd HH:mm:ss"
                  value={newCoupon.expires}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expires: e.target.value })}
                />
              </div>

              <div>
                <Label className="text-base font-medium">Matches:</Label>
                <div className="space-y-3 mt-2">
                  <div>
                    <Label htmlFor="last-name">Last Name:</Label>
                    <Input
                      id="last-name"
                      placeholder="Enter last name"
                      value={newCoupon.matches.lastName}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          matches: { ...newCoupon.matches, lastName: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="date-of-birth">Date of Birth:</Label>
                    <Input
                      id="date-of-birth"
                      placeholder="YYYY or YYYY-mm or YYYY-mm-dd"
                      value={newCoupon.matches.dateOfBirth}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          matches: { ...newCoupon.matches, dateOfBirth: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="registrations">Registrations (Comma separated):</Label>
                    <Input
                      id="registrations"
                      placeholder="GL69 RZB, GL88 RZB"
                      value={newCoupon.matches.registrations}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          matches: { ...newCoupon.matches, registrations: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Restrictions:</Label>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="first-time-only"
                    checked={newCoupon.restrictions?.firstTimeOnly || false}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        restrictions: { ...newCoupon.restrictions, firstTimeOnly: e.target.checked },
                      })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="first-time-only">First-time customers only</Label>
                </div>

                <div>
                  <Label htmlFor="max-uses-per-user">Max uses per user:</Label>
                  <Input
                    id="max-uses-per-user"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={newCoupon.restrictions?.maxUsesPerUser || ""}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        restrictions: {
                          ...newCoupon.restrictions,
                          maxUsesPerUser: Number.parseInt(e.target.value) || 1,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  resetNewCoupon()
                  setIsCreateDialogOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  resetNewCoupon()
                  setIsCreateDialogOpen(false)
                }}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Coupon
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Coupon Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Edit Coupon
                <Button variant="ghost" size="sm" onClick={() => setIsEditDialogOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-promo-code">Promo Code</Label>
                  <Input id="edit-promo-code" defaultValue={selectedCoupon?.promoCode} />
                </div>
                <div>
                  <Label htmlFor="edit-discount">Discount</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-discount"
                      type="number"
                      defaultValue={selectedCoupon?.discount.value}
                      className="flex-1"
                    />
                    <Select defaultValue={selectedCoupon?.discount.type}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="fixed">£</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-min-spent">Min. Spent</Label>
                  <Input id="edit-min-spent" type="number" defaultValue={selectedCoupon?.minSpent} />
                </div>
                <div>
                  <Label htmlFor="edit-quota">Quota Available</Label>
                  <Input id="edit-quota" type="number" defaultValue={selectedCoupon?.quotaAvailable} />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-expires">Expires</Label>
                <Input id="edit-expires" defaultValue={selectedCoupon?.expires} />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Restrictions:</Label>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="first-time-only"
                    defaultChecked={selectedCoupon?.restrictions?.firstTimeOnly || false}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="first-time-only">First-time customers only</Label>
                </div>

                <div>
                  <Label htmlFor="max-uses-per-user">Max uses per user:</Label>
                  <Input
                    id="max-uses-per-user"
                    type="number"
                    min="1"
                    placeholder="1"
                    defaultValue={selectedCoupon?.restrictions?.maxUsesPerUser || ""}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsEditDialogOpen(false)}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Coupon Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Delete Coupon
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the coupon "{selectedCoupon?.promoCode}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(false)}>
                Delete Coupon
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
