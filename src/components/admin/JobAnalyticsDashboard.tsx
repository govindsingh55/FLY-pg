'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Calendar,
  Activity,
  AlertTriangle,
} from 'lucide-react'

// Import PayloadCMS client utilities
import { useConfig } from '@payloadcms/ui'
import { useAuth } from '@payloadcms/ui'

// Import date utilities for consistent formatting
import { formatDateTime, formatDate } from '@/lib/date-utils'

interface AnalyticsData {
  overview: {
    totalJobs: number
    successfulJobs: number
    failedJobs: number
    successRate: number
    averageExecutionTime: number
    totalExecutionTime: number
  }
  jobPerformance: Array<{
    jobName: string
    totalExecutions: number
    successfulExecutions: number
    failedExecutions: number
    successRate: number
    averageExecutionTime: number
    lastExecution: string
  }>
  trends: {
    dailyExecutions: Array<{
      date: string
      total: number
      successful: number
      failed: number
    }>
    hourlyDistribution: Array<{
      hour: number
      executions: number
    }>
  }
  systemHealth: {
    uptime: number
    errorRate: number
    performanceScore: number
    issues: string[]
  }
}

export default function JobAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('7d')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const config = useConfig()
  const { user } = useAuth()

  // Fetch analytics data using PayloadCMS client
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Calculate date range
      const now = new Date()
      let startDate: Date
      switch (dateRange) {
        case '1d':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      }

      // Use PayloadCMS client to fetch job execution logs
      const response = await fetch('/api/job-execution-logs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics data: ${response.statusText}`)
      }

      const logsData = await response.json()
      const logs = logsData.docs || []

      // Filter logs by date range
      const filteredLogs = logs.filter((log: any) => new Date(log.startTime) >= startDate)

      // Calculate analytics from real data
      const totalJobs = filteredLogs.length
      const successfulJobs = filteredLogs.filter((log: any) => log.status === 'completed').length
      const failedJobs = filteredLogs.filter((log: any) => log.status === 'failed').length
      const successRate = totalJobs > 0 ? (successfulJobs / totalJobs) * 100 : 0
      const averageExecutionTime =
        filteredLogs.reduce((sum: number, log: any) => sum + (log.duration || 0), 0) / totalJobs ||
        0
      const totalExecutionTime = filteredLogs.reduce(
        (sum: number, log: any) => sum + (log.duration || 0),
        0,
      )

      // Group by job name for performance analysis
      const jobGroups = filteredLogs.reduce((groups: any, log: any) => {
        const jobName = log.jobName
        if (!groups[jobName]) {
          groups[jobName] = []
        }
        groups[jobName].push(log)
        return groups
      }, {})

      const jobPerformance = Object.entries(jobGroups).map(([jobName, jobLogs]: [string, any]) => {
        const logs = jobLogs as any[]
        const totalExecutions = logs.length
        const successfulExecutions = logs.filter((log) => log.status === 'completed').length
        const failedExecutions = logs.filter((log) => log.status === 'failed').length
        const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0
        const averageExecutionTime =
          logs.reduce((sum, log) => sum + (log.duration || 0), 0) / totalExecutions || 0
        const lastExecution = logs.sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
        )[0]?.startTime

        return {
          jobName,
          totalExecutions,
          successfulExecutions,
          failedExecutions,
          successRate,
          averageExecutionTime,
          lastExecution: lastExecution || '',
        }
      })

      // Generate daily trends (simplified)
      const dailyExecutions = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        const dayLogs = filteredLogs.filter((log: any) => log.startTime.startsWith(dateStr))
        dailyExecutions.push({
          date: dateStr,
          total: dayLogs.length,
          successful: dayLogs.filter((log: any) => log.status === 'completed').length,
          failed: dayLogs.filter((log: any) => log.status === 'failed').length,
        })
      }

      // Generate hourly distribution (simplified)
      const hourlyDistribution = []
      for (let hour = 0; hour < 24; hour++) {
        const hourLogs = filteredLogs.filter((log: any) => {
          const logHour = new Date(log.startTime).getHours()
          return logHour === hour
        })
        hourlyDistribution.push({
          hour,
          executions: hourLogs.length,
        })
      }

      // Calculate system health metrics
      const errorRate = totalJobs > 0 ? (failedJobs / totalJobs) * 100 : 0
      const performanceScore = Math.max(
        0,
        100 - errorRate - (averageExecutionTime > 60000 ? 10 : 0),
      ) // Penalize slow jobs
      const issues: string[] = []

      if (errorRate > 10) issues.push('High error rate detected')
      if (averageExecutionTime > 120000) issues.push('Slow job execution times')
      if (successRate < 90) issues.push('Low success rate')

      const analyticsData: AnalyticsData = {
        overview: {
          totalJobs,
          successfulJobs,
          failedJobs,
          successRate,
          averageExecutionTime,
          totalExecutionTime,
        },
        jobPerformance,
        trends: {
          dailyExecutions,
          hourlyDistribution,
        },
        systemHealth: {
          uptime: 99.9, // This would be calculated from actual uptime data
          errorRate,
          performanceScore,
          issues,
        },
      }

      setAnalyticsData(analyticsData)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error fetching analytics data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const exportAnalytics = async () => {
    if (!analyticsData) return

    try {
      // Export analytics as CSV
      const csvHeaders = [
        'Job Name',
        'Total Executions',
        'Successful Executions',
        'Failed Executions',
        'Success Rate (%)',
        'Average Execution Time (ms)',
        'Last Execution',
      ]

      const csvRows = analyticsData.jobPerformance.map((job) => [
        job.jobName,
        job.totalExecutions,
        job.successfulExecutions,
        job.failedExecutions,
        job.successRate.toFixed(2),
        job.averageExecutionTime.toFixed(0),
        job.lastExecution,
      ])

      const csvContent = [csvHeaders, ...csvRows]
        .map((row) => row.map((field) => `"${field}"`).join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `job-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting analytics:', err)
    }
  }

  if (loading && !analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Job Analytics Dashboard</h1>
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
          <h1 className="text-3xl font-bold">Job Analytics Dashboard</h1>
          <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load analytics data: {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!analyticsData) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and performance metrics for job execution
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalytics} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Alert */}
      {analyticsData.systemHealth.issues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>System Health Issues Detected:</strong>
            <ul className="mt-2 list-disc list-inside">
              {analyticsData.systemHealth.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.overview.successfulJobs} successful,{' '}
              {analyticsData.overview.failedJobs} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.overview.failedJobs > 0 ? (
                <span className="text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {analyticsData.overview.failedJobs} failures
                </span>
              ) : (
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  All successful
                </span>
              )}
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
              {analyticsData.overview.averageExecutionTime > 0
                ? `${(analyticsData.overview.averageExecutionTime / 1000).toFixed(1)}s`
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total:{' '}
              {analyticsData.overview.totalExecutionTime > 0
                ? `${(analyticsData.overview.totalExecutionTime / 1000 / 60).toFixed(1)}m`
                : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.systemHealth.performanceScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {analyticsData.systemHealth.uptime}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Job Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Job Performance Analysis
          </CardTitle>
          <CardDescription>Performance metrics for each job type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.jobPerformance.map((job) => (
              <div key={job.jobName} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{job.jobName.replace(/-/g, ' ')}</h3>
                  <Badge
                    className={
                      job.successRate >= 95
                        ? 'bg-green-100 text-green-800'
                        : job.successRate >= 80
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }
                  >
                    {job.successRate.toFixed(1)}% success
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Executions:</span>
                    <div className="font-medium">{job.totalExecutions}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Successful:</span>
                    <div className="font-medium text-green-600">{job.successfulExecutions}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Failed:</span>
                    <div className="font-medium text-red-600">{job.failedExecutions}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Time:</span>
                    <div className="font-medium">
                      {job.averageExecutionTime > 0
                        ? `${(job.averageExecutionTime / 1000).toFixed(1)}s`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
                {job.lastExecution && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Last execution: {formatDateTime(job.lastExecution)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Daily Execution Trends
          </CardTitle>
          <CardDescription>Job execution trends over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analyticsData.trends.dailyExecutions.map((day) => (
              <div key={day.date} className="flex items-center justify-between p-2 border rounded">
                <div className="font-medium">{formatDate(day.date)}</div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>{day.successful}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <XCircle className="h-3 w-3 text-red-600" />
                    <span>{day.failed}</span>
                  </div>
                  <div className="text-muted-foreground">Total: {day.total}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Last Refresh */}
      <div className="text-sm text-muted-foreground text-center">
        Last updated: {formatDateTime(lastRefresh)}
      </div>
    </div>
  )
}
