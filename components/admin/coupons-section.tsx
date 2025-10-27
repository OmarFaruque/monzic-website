"use client"

import { useState, useEffect } from "react"
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
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Search, Plus, AlertTriangle, X, Loader2 } from "lucide-react"
import { format } from "date-fns"

interface Coupon {
  id: number
  promoCode: string
  discount: { type: string; value: number }
  minSpent: string
  maxDiscount: string
  quotaAvailable: string
  expires: Date | undefined
  matches: {
    lastName: string
    dateOfBirth: string
    registrations: string
  }
  restrictions: {
    firstTimeOnly: boolean
    maxUsesPerUser: number
    validDays: string[]
    validHours: { start: string; end: string }
  }
  caseSensitive: boolean
}

export function CouponsSection() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [newCoupon, setNewCoupon] = useState<Coupon>({
    promoCode: "",
    discount: { type: "percentage", value: 0 },
    minSpent: "",
    maxDiscount: "",
    quotaAvailable: "",
    expires: null,
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
    caseSensitive: false,
  } as Coupon)
  const [isLoading, setIsLoading] = useState(true)

  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/coupons")
      const data = await response.json()
      setCoupons(data)
    } catch (error) {
      console.error("Error fetching coupons:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createCoupon = async () => {
    const formattedNewCoupon = {
      ...newCoupon,
      expires: newCoupon.expires ? format(newCoupon.expires, "yyyy-MM-dd HH:mm:ss") : "",
    }

    try {
      await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedNewCoupon),
      })
      fetchCoupons()
      resetNewCoupon()
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Error creating coupon:", error)
    }
  }

  const updateCoupon = async () => {
    if (!selectedCoupon) return
    setIsUpdating(true)

    const formattedSelectedCoupon = {
      ...selectedCoupon,
      expires: selectedCoupon.expires ? format(new Date(selectedCoupon.expires), "yyyy-MM-dd HH:mm:ss") : "",
    }

    try {
      await fetch("/api/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedSelectedCoupon),
      })
      fetchCoupons()
      setIsEditDialogOpen(false)
      setSelectedCoupon(null)
    } catch (error) {
      console.error("Error updating coupon:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteCoupon = async () => {
    if (!selectedCoupon) return
    try {
      await fetch("/api/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedCoupon.id }),
      })
      fetchCoupons()
      setIsDeleteDialogOpen(false)
      setSelectedCoupon(null)
    } catch (error) {
      console.error("Error deleting coupon:", error)
    }
  }

  const filteredCoupons = Array.isArray(coupons)
    ? coupons.filter((coupon) => coupon.promoCode.toLowerCase().includes(searchTerm.toLowerCase()))
    : []

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
      maxDiscount: "",
      quotaAvailable: "",
      expires: null,
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
      caseSensitive: false,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coupons</CardTitle>
        <CardDescription>Manage discount coupons and promotional codes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-teal-600 hover:bg-teal-700">
                Create Coupon
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search coupons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
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
                      <TableCell>{coupon.minSpent}</TableCell>
                      <TableCell>{coupon.maxDiscount}</TableCell>
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
                      <TableCell>{coupon.expires ? format(new Date(coupon.expires), "PPP HH:mm") : "N/A"}</TableCell>
                      <TableCell>{coupon.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCoupon({
                                ...coupon,
                                expires: coupon.expires ? new Date(coupon.expires) : null,
                              })
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
                  <DialogTitle className="flex items-center justify-between">Create Coupon</DialogTitle>
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

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="create-case-sensitive"
                      checked={newCoupon.caseSensitive}
                      onChange={(e) => setNewCoupon({ ...newCoupon, caseSensitive: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="create-case-sensitive">Case sensitive</Label>
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
                      <Label htmlFor="max-discount">Max. Discount - Optional</Label>
                      <Input
                        id="max-discount"
                        type="number"
                        placeholder="0.00"
                        value={newCoupon.maxDiscount}
                        onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
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
                    <Label htmlFor="expires">Expires</Label>
                    <DateTimePicker
                      date={newCoupon.expires}
                      setDate={(date) => setNewCoupon({ ...newCoupon, expires: date })}
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
                  <Button onClick={createCoupon} className="bg-teal-600 hover:bg-teal-700">
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
                {selectedCoupon && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-promo-code">Promo Code</Label>
                        <Input
                          id="edit-promo-code"
                          value={selectedCoupon?.promoCode}
                          onChange={(e) => setSelectedCoupon({ ...selectedCoupon, promoCode: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-discount">Discount</Label>
                        <div className="flex gap-2">
                          <Input
                            id="edit-discount"
                            type="number"
                            value={selectedCoupon?.discount.value}
                            onChange={(e) =>
                              setSelectedCoupon({
                                ...selectedCoupon,
                                discount: { ...selectedCoupon.discount, value: Number.parseInt(e.target.value) || 0 },
                              })
                            }
                            className="flex-1"
                          />
                          <Select
                            value={selectedCoupon?.discount.type}
                            onValueChange={(value) =>
                              setSelectedCoupon({ ...selectedCoupon, discount: { ...selectedCoupon.discount, type: value } })
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

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-case-sensitive"
                        checked={selectedCoupon.caseSensitive}
                        onChange={(e) => setSelectedCoupon({ ...selectedCoupon, caseSensitive: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="edit-case-sensitive">Case sensitive</Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-min-spent">Min. Spent</Label>
                        <Input
                          id="edit-min-spent"
                          type="number"
                          value={selectedCoupon?.minSpent}
                          onChange={(e) => setSelectedCoupon({ ...selectedCoupon, minSpent: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-max-discount">Max. Discount</Label>
                        <Input
                          id="edit-max-discount"
                          type="number"
                          value={selectedCoupon?.maxDiscount}
                          onChange={(e) => setSelectedCoupon({ ...selectedCoupon, maxDiscount: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-quota">Quota Available</Label>
                        <Input
                          id="edit-quota"
                          type="number"
                          value={selectedCoupon?.quotaAvailable}
                          onChange={(e) => setSelectedCoupon({ ...selectedCoupon, quotaAvailable: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-expires">Expires</Label>
                      <DateTimePicker
                        date={selectedCoupon?.expires ? new Date(selectedCoupon.expires) : undefined}
                        setDate={(date) => setSelectedCoupon({ ...selectedCoupon, expires: date })}
                      />
                    </div>

                    <div>
                      <Label className="text-base font-medium">Matches:</Label>
                      <div className="space-y-3 mt-2">
                        <div>
                          <Label htmlFor="edit-last-name">Last Name:</Label>
                          <Input
                            id="edit-last-name"
                            placeholder="Enter last name"
                            value={selectedCoupon.matches?.lastName || ""}
                            onChange={(e) =>
                              setSelectedCoupon({
                                ...selectedCoupon,
                                matches: { ...selectedCoupon.matches, lastName: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-date-of-birth">Date of Birth:</Label>
                          <Input
                            id="edit-date-of-birth"
                            placeholder="YYYY or YYYY-mm or YYYY-mm-dd"
                            value={selectedCoupon.matches?.dateOfBirth || ""}
                            onChange={(e) =>
                              setSelectedCoupon({
                                ...selectedCoupon,
                                matches: { ...selectedCoupon.matches, dateOfBirth: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-registrations">Registrations (Comma separated):</Label>
                          <Input
                            id="edit-registrations"
                            placeholder="GL69 RZB, GL88 RZB"
                            value={selectedCoupon.matches?.registrations || ""}
                            onChange={(e) =>
                              setSelectedCoupon({
                                ...selectedCoupon,
                                matches: { ...selectedCoupon.matches, registrations: e.target.value },
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
                          checked={selectedCoupon?.restrictions?.firstTimeOnly || false}
                          onChange={(e) =>
                            setSelectedCoupon({
                              ...selectedCoupon,
                              restrictions: { ...selectedCoupon.restrictions, firstTimeOnly: e.target.checked },
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
                          value={selectedCoupon?.restrictions?.maxUsesPerUser || ""}
                          onChange={(e) =>
                            setSelectedCoupon({
                              ...selectedCoupon,
                              restrictions: {
                                ...selectedCoupon.restrictions,
                                maxUsesPerUser: Number.parseInt(e.target.value) || 1,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={updateCoupon} disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
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
                    Are you sure you want to delete the coupon "{selectedCoupon?.promoCode}"? This action cannot be
                    undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={deleteCoupon}>
                    Delete Coupon
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  )
}
