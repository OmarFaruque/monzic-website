"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  CreditCard,
  DollarSign,
  Activity,
  Download,
  Calendar,
  Crown,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock analytics data with current dates
const mockAnalytics = {
  overview: {
    totalUsers: 1247,
    totalPolicies: 892,
    totalRevenue: 23456.78,
    trends: {
      users: 12.5,
      policies: 8.3,
      revenue: 15.7,
    },
  },
  salesData: {
    daily: [
      { date: "01/06/2025", sales: 856.5, policies: 32 },
      { date: "02/06/2025", sales: 1024.75, policies: 38 },
      { date: "03/06/2025", sales: 945.25, policies: 35 },
      { date: "04/06/2025", sales: 1156.8, policies: 42 },
      { date: "05/06/2025", sales: 1087.45, policies: 39 },
      { date: "06/06/2025", sales: 1134.6, policies: 41 },
      { date: "07/06/2025", sales: 1245.9, policies: 44 },
    ],
    weekly: [
      { period: "Week 1", sales: 6789.45, policies: 245 },
      { period: "Week 2", sales: 6234.8, policies: 221 },
      { period: "Week 3", sales: 7456.25, policies: 267 },
      { period: "Week 4", sales: 4976.28, policies: 159 },
    ],
    monthly: [
      { period: "Oct 2024", sales: 22456.78, policies: 834 },
      { period: "Nov 2024", sales: 21234.45, policies: 798 },
      { period: "Dec 2024", sales: 23456.78, policies: 892 },
      { period: "Jan 2025", sales: 22789.34, policies: 823 },
    ],
  },
  topSpenders: [
    { name: "John Smith", email: "john.smith@email.com", totalSpent: 2456.78, policies: 12 },
    { name: "Sarah Johnson", email: "sarah.j@email.com", totalSpent: 1987.45, policies: 8 },
    { name: "Michael Brown", email: "m.brown@email.com", totalSpent: 1756.23, policies: 9 },
    { name: "Emma Wilson", email: "emma.w@email.com", totalSpent: 1534.67, policies: 7 },
    { name: "David Lee", email: "david.l@email.com", totalSpent: 1423.89, policies: 6 },
  ],
  recentActivity: [
    { type: "policy_created", user: "john.smith@email.com", amount: 25.5, timestamp: Date.now() - 1000 * 60 * 15 },
    { type: "payment_completed", user: "sarah.j@email.com", amount: 18.75, timestamp: Date.now() - 1000 * 60 * 32 },
    { type: "user_registered", user: "mike.w@email.com", amount: 0, timestamp: Date.now() - 1000 * 60 * 45 },
    { type: "policy_created", user: "emma.davis@email.com", amount: 32.25, timestamp: Date.now() - 1000 * 60 * 67 },
    { type: "payment_failed", user: "test@example.com", amount: 15.5, timestamp: Date.now() - 1000 * 60 * 89 },
  ],
}

export function AnalyticsSection() {
  const [timeRange, setTimeRange] = useState("daily")
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [analytics, setAnalytics] = useState(mockAnalytics)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
  }

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    )
  }

  const getTrendColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600"
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "policy_created":
        return <FileText className="w-4 h-4 text-blue-600" />
      case "payment_completed":
        return <CreditCard className="w-4 h-4 text-green-600" />
      case "payment_failed":
        return <CreditCard className="w-4 h-4 text-red-600" />
      case "user_registered":
        return <Users className="w-4 h-4 text-purple-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (minutes < 60) {
      return `${minutes}m ago`
    } else {
      return `${hours}h ago`
    }
  }

  const exportAnalytics = () => {
    const csvData = [
      ["Metric", "Value", "Trend"],
      ["Total Users", analytics.overview.totalUsers.toString(), formatPercentage(analytics.overview.trends.users)],
      [
        "Total Policies",
        analytics.overview.totalPolicies.toString(),
        formatPercentage(analytics.overview.trends.policies),
      ],
      [
        "Total Revenue",
        formatCurrency(analytics.overview.totalRevenue),
        formatPercentage(analytics.overview.trends.revenue),
      ],
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getSalesData = () => {
    switch (timeRange) {
      case "daily":
        return analytics.salesData.daily
      case "weekly":
        return analytics.salesData.weekly
      case "monthly":
        return analytics.salesData.monthly
      default:
        return analytics.salesData.daily
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights into your platform performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards - Remove conversion rate card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalUsers.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {getTrendIcon(analytics.overview.trends.users)}
              <span className={`ml-1 text-sm font-medium ${getTrendColor(analytics.overview.trends.users)}`}>
                {formatPercentage(analytics.overview.trends.users)}
              </span>
              <span className="ml-1 text-sm text-gray-600">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Policies</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalPolicies.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {getTrendIcon(analytics.overview.trends.policies)}
              <span className={`ml-1 text-sm font-medium ${getTrendColor(analytics.overview.trends.policies)}`}>
                {formatPercentage(analytics.overview.trends.policies)}
              </span>
              <span className="ml-1 text-sm text-gray-600">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.overview.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {getTrendIcon(analytics.overview.trends.revenue)}
              <span className={`ml-1 text-sm font-medium ${getTrendColor(analytics.overview.trends.revenue)}`}>
                {formatPercentage(analytics.overview.trends.revenue)}
              </span>
              <span className="ml-1 text-sm text-gray-600">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart and Top Spenders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sales Overview</CardTitle>
              <div className="flex gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CardDescription>Revenue and policy trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Custom Date Range */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <Label htmlFor="start-date" className="text-xs">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="end-date" className="text-xs">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="flex items-end">
                <Button variant="outline" size="sm">
                  Apply
                </Button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getSalesData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={timeRange === "daily" ? "date" : "period"} />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "sales" ? formatCurrency(value as number) : value,
                    name === "sales" ? "Revenue" : "Policies",
                  ]}
                />
                <Line type="monotone" dataKey="sales" stroke="#0d9488" strokeWidth={2} />
                <Line type="monotone" dataKey="policies" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Spenders Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Top Spenders Leaderboard
            </CardTitle>
            <CardDescription>Highest spending customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topSpenders.map((spender, index) => (
                <div key={spender.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-800"
                          : index === 1
                            ? "bg-gray-100 text-gray-800"
                            : index === 2
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{spender.name}</p>
                      <p className="text-xs text-gray-600">{spender.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(spender.totalSpent)}</p>
                    <p className="text-xs text-gray-600">{spender.policies} policies</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform activities and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getActivityIcon(activity.type)}
                  <div>
                    <p className="font-medium text-sm">
                      {activity.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-gray-600">{activity.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.amount > 0 && <p className="font-medium text-sm">{formatCurrency(activity.amount)}</p>}
                  <p className="text-xs text-gray-600">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
