import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client"
import { getOverviewStats, getRecentActivity, getSystemStatus, getAnalyticsData, getBlacklistData } from "@/lib/admin-data";

// This is a Server Component
export default async function AdministratorPage() {

  // Fetch all data on the server in parallel
  const [statsData, recentActivityData, systemStatusData, analyticsData, blacklistData] = await Promise.all([
    getOverviewStats(),
    getRecentActivity(),
    getSystemStatus(),
    getAnalyticsData(),
    getBlacklistData(),
  ]);

  return (
    <AdminDashboardClient 
      statsData={statsData} 
      recentActivityData={recentActivityData} 
      systemStatusData={systemStatusData} 
      analyticsData={analyticsData}
      blacklistData={blacklistData}
    />
  )
}