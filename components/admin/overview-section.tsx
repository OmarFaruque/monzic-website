"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, MessageSquare, TrendingUp, DollarSign, Shield, Clock } from "lucide-react"

export function OverviewSection() {
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      description: "Active customers",
    },
    {
      title: "Total Policies",
      value: "4,567",
      change: "+18%",
      changeType: "positive" as const,
      icon: FileText,
      description: "All time policies",
    },
    {
      title: "Open Tickets",
      value: "23",
      change: "-15%",
      changeType: "positive" as const,
      icon: MessageSquare,
      description: "Support requests",
    },
    {
      title: "Revenue",
      value: "£45,678",
      change: "+23%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "This month",
    },
    {
      title: "Active Policies",
      value: "1,234",
      change: "+8%",
      changeType: "positive" as const,
      icon: Shield,
      description: "Currently active",
    },
    {
      title: "Avg Response Time",
      value: "2.4h",
      change: "-18%",
      changeType: "positive" as const,
      icon: Clock,
      description: "Support tickets",
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: "policy",
      message: "New policy created for John Smith",
      time: "2 minutes ago",
      status: "success",
    },
    {
      id: 2,
      type: "ticket",
      message: "Support ticket #1234 resolved",
      time: "15 minutes ago",
      status: "success",
    },
    {
      id: 3,
      type: "user",
      message: "New user registration: jane.doe@email.com",
      time: "1 hour ago",
      status: "info",
    },
    {
      id: 4,
      type: "payment",
      message: "Payment received for policy #5678",
      time: "2 hours ago",
      status: "success",
    },
    {
      id: 5,
      type: "alert",
      message: "System maintenance scheduled",
      time: "3 hours ago",
      status: "warning",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your insurance platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={stat.changeType === "positive" ? "default" : "destructive"} className="text-xs">
                    {stat.change}
                  </Badge>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === "success"
                        ? "bg-green-500"
                        : activity.status === "warning"
                          ? "bg-yellow-500"
                          : activity.status === "info"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <Badge variant="default" className="bg-green-500">
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <Badge variant="default" className="bg-green-500">
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Service</span>
                <Badge variant="default" className="bg-green-500">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Gateway</span>
                <Badge variant="default" className="bg-green-500">
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backup Status</span>
                <Badge variant="secondary">Last: 2h ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
