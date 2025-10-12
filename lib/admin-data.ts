import { db } from '@/lib/db';
import { users, quotes, tickets, settings, blacklist } from '@/lib/schema';
import { count, sum, sql } from 'drizzle-orm';

// Helper function to calculate percentage change
function calculateChange(current: number, previous: number) {
  if (previous === 0) {
    return { change: current > 0 ? '100%' : '0%', changeType: current > 0 ? 'positive' : 'neutral' as const };
  }
  const percentageChange = ((current - previous) / previous) * 100;
  return {
    change: `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(0)}%`,
    changeType: percentageChange >= 0 ? 'positive' : 'negative' as const,
  };
}

export async function getOverviewStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));
  const sixtyDaysAgo = new Date(new Date().setDate(now.getDate() - 60));

  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();
  const sixtyDaysAgoISO = sixtyDaysAgo.toISOString();

  // Parallelize all database queries
  const [
    totalUsersResult,
    newUsersCurrentPeriodResult,
    newUsersPreviousPeriodResult,
    totalPoliciesResult,
    policiesCurrentPeriodResult,
    policiesPreviousPeriodResult,
    openTicketsResult,
    activePoliciesResult,
    revenueCurrentPeriodResult,
    revenuePreviousPeriodResult,
  ] = await Promise.all([
    // Totals
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(users).where(sql`created_at >= ${thirtyDaysAgoISO}`),
    db.select({ value: count() }).from(users).where(sql`created_at >= ${sixtyDaysAgoISO} AND created_at < ${thirtyDaysAgoISO}`),

    db.select({ value: count() }).from(quotes),
    db.select({ value: count() }).from(quotes).where(sql`created_at >= ${thirtyDaysAgoISO}`),
    db.select({ value: count() }).from(quotes).where(sql`created_at >= ${sixtyDaysAgoISO} AND created_at < ${thirtyDaysAgoISO}`),

    db.select({ value: count() }).from(tickets).where(sql`status = 'open'`),
    db.select({ value: count() }).from(quotes).where(sql`end_date > NOW()`),

    // Revenue periods
    db.select({ value: sum(sql`CASE WHEN update_price IS NOT NULL AND update_price != 'false' THEN CAST(update_price AS numeric) ELSE CAST(cpw AS numeric) END`) }).from(quotes).where(sql`status = 'completed' AND created_at >= ${thirtyDaysAgoISO}`),
    db.select({ value: sum(sql`CASE WHEN update_price IS NOT NULL AND update_price != 'false' THEN CAST(update_price AS numeric) ELSE CAST(cpw AS numeric) END`) }).from(quotes).where(sql`status = 'completed' AND created_at >= ${sixtyDaysAgoISO} AND created_at < ${thirtyDaysAgoISO}`),
  ]);

  // Extract values and calculate changes
  const totalUsers = totalUsersResult[0].value;
  const newUsersCurrent = newUsersCurrentPeriodResult[0].value;
  const newUsersPrevious = newUsersPreviousPeriodResult[0].value;
  const usersChange = calculateChange(newUsersCurrent, newUsersPrevious);

  const totalPolicies = totalPoliciesResult[0].value;
  const policiesCurrent = policiesCurrentPeriodResult[0].value;
  const policiesPrevious = policiesPreviousPeriodResult[0].value;
  const policiesChange = calculateChange(policiesCurrent, policiesPrevious);

  const openTickets = openTicketsResult[0].value;
  const activePolicies = activePoliciesResult[0].value;

  const revenueCurrent = parseFloat(revenueCurrentPeriodResult[0].value?.toString() || '0');
  const revenuePrevious = parseFloat(revenuePreviousPeriodResult[0].value?.toString() || '0');
  const revenueChange = calculateChange(revenueCurrent, revenuePrevious);

  return {
    totalUsers: { value: totalUsers, ...usersChange },
    totalPolicies: { value: totalPolicies, ...policiesChange },
    openTickets: { value: openTickets, change: '-5%', changeType: 'positive' as const }, // Change for open tickets is not time-based
    totalRevenue: { value: revenueCurrent, ...revenueChange },
    activePolicies: { value: activePolicies, change: '+8%', changeType: 'positive' as const }, // Change for active policies is complex
  };
}

export async function getRecentActivity() {
    const recentUsers = await db.select({
        id: users.userId,
        message: sql`'New user registration: ' || ${users.email}`,
        time: users.createdAt,
        type: sql`'user'`
    }).from(users).orderBy(sql`${users.createdAt} DESC`).limit(5);

    const recentPolicies = await db.select({
        id: quotes.id,
        message: sql`'New policy created for ' || ${quotes.firstName} || ' ' || ${quotes.lastName}`,
        time: quotes.createdAt,
        type: sql`'policy'`
    }).from(quotes).orderBy(sql`${quotes.createdAt} DESC`).limit(5);

    const recentTickets = await db.select({
        id: tickets.id,
        message: sql`'New support ticket: ' || ${tickets.subject}`,
        time: tickets.createdAt,
        type: sql`'ticket'`
    }).from(tickets).orderBy(sql`${tickets.createdAt} DESC`).limit(5);

    const combined = [...recentUsers, ...recentPolicies, ...recentTickets];

    // Sort all activities by time and take the 5 most recent
    const sortedActivities = combined.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

    return sortedActivities;
}

export async function getSystemStatus() {
  const checks = await Promise.allSettled([
    // Database Check
    (async () => {
      await db.execute(sql`SELECT 1`);
      return { service: 'Database', status: 'Healthy', details: 'Connected' };
    })(),

    // Email Service Check
    Promise.resolve((() => {
      if (process.env.NODE_ENV === 'development') {
        return { service: 'Email Service', status: 'Active', details: 'Using MailHog for local development' };
      }
      return {
        service: 'Email Service',
        status: process.env.RESEND_API_KEY ? 'Active' : 'Not Configured',
        details: process.env.RESEND_API_KEY ? 'Resend API key is set' : 'Missing RESEND_API_KEY'
      };
    })()),

    // Payment Gateway Check
    (async () => {
      const paymentSetting = await db.select().from(settings).where(sql`param = 'payment'`);
      if (!paymentSetting.length || !paymentSetting[0].value) {
        return { service: 'Payment Gateway', status: 'Not Configured', details: 'Active processor setting not found' };
      }
      
      const activeProcessor = JSON.parse(paymentSetting[0].value).activeProcessor;
      if (!activeProcessor) {
        return { service: 'Payment Gateway', status: 'Not Configured', details: 'Active processor not defined' };
      }

      const processorSettings = await db.select().from(settings).where(sql`param = ${activeProcessor}`);
      if (!processorSettings.length || !processorSettings[0].value) {
        return { service: 'Payment Gateway', status: 'Not Configured', details: `Settings for ${activeProcessor} not found` };
      }

      const credentials = JSON.parse(processorSettings[0].value);
      if (credentials.secretKey) {
        return { service: 'Payment Gateway', status: 'Connected', details: `Active processor: ${activeProcessor}` };
      } else {
        return { service: 'Payment Gateway', status: 'Not Configured', details: `Missing secret key for ${activeProcessor}` };
      }
    })(),
  ]);

  const statuses = checks.map(result => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    // For rejected promises (like the DB check failing)
    return {
      service: 'Unknown Service',
      status: 'Unhealthy',
      details: result.reason.message
    };
  });

  return statuses;
}

export async function getAnalyticsData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const overviewStats = await getOverviewStats();

  const salesByDay = await db.select({
    date: sql<string>`DATE_TRUNC('day', created_at)::date`,
    sales: sum(sql`CASE WHEN update_price IS NOT NULL AND update_price != 'false' THEN CAST(update_price AS numeric) ELSE CAST(cpw AS numeric) END`.mapWith(Number)),
    policies: count(quotes.id)
  })
  .from(quotes)
  .where(sql`created_at >= ${thirtyDaysAgo.toISOString()} AND status = 'completed'`)
  .groupBy(sql`DATE_TRUNC('day', created_at)::date`)
  .orderBy(sql`DATE_TRUNC('day', created_at)::date ASC`);

  const topSpenders = await db.select({
    name: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
    email: users.email,
    totalSpent: sum(sql`CASE WHEN ${quotes.updatePrice} IS NOT NULL AND ${quotes.updatePrice} != 'false' THEN CAST(${quotes.updatePrice} AS numeric) ELSE CAST(${quotes.cpw} AS numeric) END`.mapWith(Number)),
    policies: count(quotes.id)
  })
  .from(quotes)
  .leftJoin(users, sql`CAST(${quotes.userId} as integer) = ${users.userId}`)
  .where(sql`${quotes.status} = 'completed'`)
  .groupBy(users.email, users.firstName, users.lastName)
  .orderBy(sql`sum(CASE WHEN ${quotes.updatePrice} IS NOT NULL AND ${quotes.updatePrice} != 'false' THEN CAST(${quotes.updatePrice} AS numeric) ELSE CAST(${quotes.cpw} AS numeric) END) DESC`)
  .limit(5);

  const recentActivity = await getRecentActivity();

  return {
    overview: {
      totalUsers: overviewStats.totalUsers.value,
      totalPolicies: overviewStats.totalPolicies.value,
      totalRevenue: overviewStats.totalRevenue.value,
      trends: {
        users: parseFloat(overviewStats.totalUsers.change.replace('%','')),
        policies: parseFloat(overviewStats.totalPolicies.change.replace('%','')),
        revenue: parseFloat(overviewStats.totalRevenue.change.replace('%','')),
      }
    },
    salesData: {
      daily: salesByDay.map(s => ({ ...s, date: new Date(s.date).toLocaleDateString('en-GB') })),
      weekly: [], // Placeholder
      monthly: [], // Placeholder
    },
    topSpenders,
    recentActivity: recentActivity.map(a => ({...a, type: a.type + '_created', user: a.message, amount: 0, timestamp: new Date(a.time).getTime()})), // Adapt to fit component
  };
}

export async function getBlacklistData() {
  const allItems = await db.select().from(blacklist).orderBy(sql`${blacklist.createdAt} DESC`);
  
  const users = allItems.filter(item => item.type === 'user');
  const ips = allItems.filter(item => item.type === 'ip');
  const postcodes = allItems.filter(item => item.type === 'postcode');

  return { users, ips, postcodes };
}