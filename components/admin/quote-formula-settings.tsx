"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DollarSign, Percent } from "lucide-react"

export function QuoteFormulaSettings({ settings, updateSetting }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Formula</CardTitle>
        <CardDescription>Manage the pricing formula for quotes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">Base Rates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="base-hourly-rate">Base Hourly Rate</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="base-hourly-rate"
                  type="number"
                  value={settings.baseHourlyRate}
                  onChange={(e) => updateSetting("quoteFormula", "baseHourlyRate", Number(e.target.value))}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="base-daily-rate">Base Daily Rate</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="base-daily-rate"
                  type="number"
                  value={settings.baseDailyRate}
                  onChange={(e) => updateSetting("quoteFormula", "baseDailyRate", Number(e.target.value))}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Duration Discounts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="multi-day-discount">Multi-Day Discount</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="multi-day-discount"
                  type="number"
                  value={settings.multiDayDiscountPercentage}
                  onChange={(e) =>
                    updateSetting("quoteFormula", "multiDayDiscountPercentage", Number(e.target.value))
                  }
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="multi-week-discount">Multi-Week Discount</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="multi-week-discount"
                  type="number"
                  value={settings.multiWeekDiscountPercentage}
                  onChange={(e) =>
                    updateSetting("quoteFormula", "multiWeekDiscountPercentage", Number(e.target.value))
                  }
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Age Discounts</h3>
          {settings.ageDiscounts.map((discount, index) => (
            <div key={index} className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="Age"
                value={discount.age}
                onChange={(e) => {
                  const newDiscounts = [...settings.ageDiscounts];
                  newDiscounts[index].age = Number(e.target.value);
                  updateSetting("quoteFormula", "ageDiscounts", newDiscounts);
                }}
              />
              <Input
                type="number"
                placeholder="Discount %"
                value={discount.discount}
                onChange={(e) => {
                  const newDiscounts = [...settings.ageDiscounts];
                  newDiscounts[index].discount = Number(e.target.value);
                  updateSetting("quoteFormula", "ageDiscounts", newDiscounts);
                }}
              />
              <Button
                variant="destructive"
                onClick={() => {
                  const newDiscounts = settings.ageDiscounts.filter((_, i) => i !== index);
                  updateSetting("quoteFormula", "ageDiscounts", newDiscounts);
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            onClick={() => {
              const newDiscounts = [...settings.ageDiscounts, { age: 0, discount: 0 }];
              updateSetting("quoteFormula", "ageDiscounts", newDiscounts);
            }}
          >
            Add Age Discount
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">License Held Discounts (in months)</h3>
          {settings.licenseHeldDiscounts.map((discount, index) => (
            <div key={index} className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="Months"
                value={discount.months}
                onChange={(e) => {
                  const newDiscounts = [...settings.licenseHeldDiscounts];
                  newDiscounts[index].months = Number(e.target.value);
                  updateSetting("quoteFormula", "licenseHeldDiscounts", newDiscounts);
                }}
              />
              <Input
                type="number"
                placeholder="Discount %"
                value={discount.discount}
                onChange={(e) => {
                  const newDiscounts = [...settings.licenseHeldDiscounts];
                  newDiscounts[index].discount = Number(e.target.value);
                  updateSetting("quoteFormula", "licenseHeldDiscounts", newDiscounts);
                }}
              />
              <Button
                variant="destructive"
                onClick={() => {
                  const newDiscounts = settings.licenseHeldDiscounts.filter((_, i) => i !== index);
                  updateSetting("quoteFormula", "licenseHeldDiscounts", newDiscounts);
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            onClick={() => {
              const newDiscounts = [...settings.licenseHeldDiscounts, { months: 0, discount: 0 }];
              updateSetting("quoteFormula", "licenseHeldDiscounts", newDiscounts);
            }}
          >
            Add License Discount
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
