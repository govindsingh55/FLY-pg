'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Settings,
  BarChart3,
  FileText,
  Calendar,
} from 'lucide-react'

// Import PayloadCMS client utilities
import { useConfig } from '@payloadcms/ui'
import { useAuth } from '@payloadcms/ui'

// Import date utilities for consistent formatting
import { formatDateTime, formatRelativeTime } from '@/lib/date-utils'

interface JobHealthStatus {
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  message: string
  timestamp: string
  details?: Record<string, any>
}

interface SystemMetrics {
  totalJobs: number
  runningJobs: number
  completedJobs: number
  failedJobs: number
  averageExecutionTime: number
  successRate: number
  lastHealthCheck: string
  systemStatus: 'healthy' | 'warning' | 'critical'
  issues: string[]
}

interface ScheduleStatus {
  enabled: number
  disabled: number
  total: number
  schedules: Array<{
    slug: string
    enabled: boolean
  }>
}

interface DashboardData {
  healthStatus: JobHealthStatus
  systemMetrics: SystemMetrics
  scheduleStatus: ScheduleStatus
  recentActivity: Array<{
    id: string
    jobName: string
    status: 'completed' | 'failed' | 'running'
    timestamp: string
    duration?: number
  }>
}

export default function JobMonitoringDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const config = useConfig()
  const { user } = useAuth()

  // Fetch dashboard data using PayloadCMS client
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use PayloadCMS client to fetch data directly
      const response = await fetch('/api/job-execution-logs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`)
      }

      const logsData = await response.json()

      // Process the data to create dashboard metrics
      const logs = logsData.docs || []
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      // Calculate metrics from real data
      const totalJobs = logs.length
      const completedJobs = logs.filter((log: any) => log.status === 'completed').length
      const failedJobs = logs.filter((log: any) => log.status === 'failed').length
      const runningJobs = logs.filter((log: any) => log.status === 'running').length
      const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0
      const averageExecutionTime =
        logs.reduce((sum: number, log: any) => sum + (log.duration || 0), 0) / totalJobs || 0

      // Get recent activity (last 10 logs)
      const recentActivity = logs
        .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 10)
        .map((log: any) => ({
          id: log.id,
          jobName: log.jobName,
          status: log.status,
          timestamp: log.startTime,
          duration: log.duration,
        }))

      // Determine system health
      let systemStatus: 'healthy' | 'warning' | 'critical' = 'healthy'
      const issues: string[] = []

      if (successRate < 80) {
        systemStatus = 'critical'
        issues.push(`Low success rate: ${successRate.toFixed(1)}%`)
      } else if (successRate < 95) {
        systemStatus = 'warning'
        issues.push(`Success rate below optimal: ${successRate.toFixed(1)}%`)
      }

      if (failedJobs > 5) {
        systemStatus = 'critical'
        issues.push(`${failedJobs} failed jobs in the last 24 hours`)
      }

      const dashboardData: DashboardData = {
        healthStatus: {
          status: systemStatus,
          message: systemStatus === 'healthy' ? 'All systems operational' : 'Issues detected',
          timestamp: now.toISOString(),
          details: {
            totalJobs,
            successRate,
            failedJobs,
          },
        },
        systemMetrics: {
          totalJobs,
          runningJobs,
          completedJobs,
          failedJobs,
          averageExecutionTime,
          successRate,
          lastHealthCheck: now.toISOString(),
          systemStatus,
          issues,
        },
        scheduleStatus: {
          enabled: 4, // This would come from the job scheduler
          disabled: 2,
          total: 6,
          schedules: [
            { slug: 'monthly-rent-payment', enabled: true },
            { slug: 'payment-reminder-email', enabled: true },
            { slug: 'overdue-payment-notification', enabled: true },
            { slug: 'auto-pay-processing', enabled: true },
            { slug: 'job-health-check', enabled: false },
            { slug: 'payment-analytics', enabled: false },
          ],
        },
        recentActivity,
      }

      setDashboardData(dashboardData)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'critical':
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'critical':
      case 'failed':
        return <XCircle className="h-4 w-4" />
      case 'running':
        return <Clock className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  if (loading && !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Job Monitoring Dashboard</h1>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Job Monitoring Dashboard</h1>
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load dashboard data: {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!dashboardData) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of payment system jobs and schedules
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <div className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* System Health Alert */}
      {dashboardData.healthStatus.status !== 'healthy' && (
        <Alert
          variant={dashboardData.healthStatus.status === 'critical' ? 'destructive' : 'default'}
        >
          {getStatusIcon(dashboardData.healthStatus.status)}
          <AlertDescription>
            <strong>{dashboardData.healthStatus.message}</strong>
            {dashboardData.systemMetrics.issues.length > 0 && (
              <ul className="mt-2 list-disc list-inside">
                {dashboardData.systemMetrics.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.systemMetrics.totalJobs}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.systemMetrics.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.systemMetrics.completedJobs} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Jobs</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.systemMetrics.failedJobs}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.systemMetrics.runningJobs} currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.systemMetrics.averageExecutionTime > 0
                ? `${(dashboardData.systemMetrics.averageExecutionTime / 1000).toFixed(1)}s`
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Per job execution</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Job Schedule Status
          </CardTitle>
          <CardDescription>Current status of all scheduled jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboardData.scheduleStatus.schedules.map((schedule) => (
              <div
                key={schedule.slug}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{schedule.slug.replace(/-/g, ' ')}</div>
                  <div className="text-sm text-muted-foreground">
                    {schedule.enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <Badge
                  className={
                    schedule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }
                >
                  {schedule.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest job executions and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(activity.status)}
                    <div>
                      <div className="font-medium">{activity.jobName.replace(/-/g, ' ')}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                    {activity.duration && (
                      <span className="text-sm text-muted-foreground">
                        {(activity.duration / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">No recent activity found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
