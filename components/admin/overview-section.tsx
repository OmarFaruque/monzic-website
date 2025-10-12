"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, MessageSquare, TrendingUp, DollarSign, Shield, Clock } from "lucide-react"
import { formatDistanceToNow } from 'date-fns';

// Define types for the props
interface StatData {
  value: number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

interface OverviewData {
  totalUsers: StatData;
  totalPolicies: StatData;
  openTickets: StatData;
  totalRevenue: StatData;
  activePolicies: StatData;
}

interface Activity {
  id: number;
  message: string;
  time: string;
  type: string;
}

interface Status {
  service: string;
  status: string;
  details: string;
}

interface OverviewSectionProps {
  statsData: OverviewData;
  recentActivityData: Activity[];
  systemStatusData: Status[];
}

export function OverviewSection({ statsData, recentActivityData, systemStatusData }: OverviewSectionProps) {
  const [apiStatus, setApiStatus] = useState({ status: 'Checking...', details: 'Performing health check...' });

  useEffect(() => {
    fetch('/api/health')
      .then(res => {
        if (res.ok) {
          setApiStatus({ status: 'Online', details: 'API is responding normally' });
        } else {
          setApiStatus({ status: 'Offline', details: 'API is not responding' });
        }
      })
      .catch(() => {
        setApiStatus({ status: 'Offline', details: 'Failed to connect to API' });
      });
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: statsData.totalUsers.value.toLocaleString(),
      change: statsData.totalUsers.change,
      changeType: statsData.totalUsers.changeType,
      icon: Users,
      description: "vs. previous 30 days",
    },
    {
      title: "Total Policies",
      value: statsData.totalPolicies.value.toLocaleString(),
      change: statsData.totalPolicies.change,
      changeType: statsData.totalPolicies.changeType,
      icon: FileText,
      description: "vs. previous 30 days",
    },
    {
      title: "Open Tickets",
      value: statsData.openTickets.value.toLocaleString(),
      change: statsData.openTickets.change, // Note: This change is static
      changeType: statsData.openTickets.changeType,
      icon: MessageSquare,
      description: "Currently open",
    },
    {
      title: "Revenue (Last 30d)",
      value: `£${statsData.totalRevenue.value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: statsData.totalRevenue.change,
      changeType: statsData.totalRevenue.changeType,
      icon: DollarSign,
      description: "vs. previous 30 days",
    },
    {
      title: "Active Policies",
      value: statsData.activePolicies.value.toLocaleString(),
      change: statsData.activePolicies.change, // Note: This change is static
      changeType: statsData.activePolicies.changeType,
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
  ];

  const allStatuses = [
    { service: 'API Status', ...apiStatus },
    ...systemStatusData,
    { service: 'Backup Status', status: 'Last: 2h ago', details: 'Static value' }
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Online':
      case 'Healthy':
      case 'Active':
      case 'Connected':
        return 'default';
      case 'Checking...':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

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
                  <Badge variant={stat.changeType === 'negative' ? 'destructive' : 'default'} className="text-xs">
                    {stat.change}
                  </Badge>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity & System Status */}
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
              {recentActivityData.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "policy"
                        ? "bg-green-500"
                        : activity.type === "ticket"
                          ? "bg-yellow-500"
                          : activity.type === "user"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(activity.time), { addSuffix: true })}</p>
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
              {allStatuses.map(s => (
                <div key={s.service} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{s.service}</span>
                  <Badge variant={getStatusBadgeVariant(s.status)}>
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}