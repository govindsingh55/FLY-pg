'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
} from 'lucide-react'

// Import PayloadCMS client utilities
import { useConfig } from '@payloadcms/ui'
import { useAuth } from '@payloadcms/ui'

// Import date utilities for consistent formatting
import { formatDateTime, formatDuration } from '@/lib/date-utils'

interface JobLog {
  id: string
  jobName: string
  jobId: string
  startTime: string
  endTime?: string
  duration?: number
  status: 'completed' | 'failed' | 'running'
  success: boolean
  errorMessage?: string
  retryCount: number
  maxRetries: number
  input?: Record<string, any>
  output?: Record<string, any>
  queue: string
  priority: number
}

interface LogFilters {
  jobName?: string
  status?: string
  dateRange?: string
  limit: number
  page: number
}

export default function JobExecutionLogs() {
  const [logs, setLogs] = useState<JobLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocs, setTotalDocs] = useState(0)
  const [selectedLog, setSelectedLog] = useState<JobLog | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const [filters, setFilters] = useState<LogFilters>({
    limit: 20,
    page: 1,
  })

  const config = useConfig()
  const { user } = useAuth()

  // Fetch logs using PayloadCMS client
  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams()
      params.append('limit', filters.limit.toString())
      params.append('page', filters.page.toString())
      params.append('sort', '-startTime')

      if (filters.jobName && filters.jobName !== 'all') {
        params.append('where[jobName][equals]', filters.jobName)
      }
      if (filters.status && filters.status !== 'all') {
        params.append('where[status][equals]', filters.status)
      }
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date()
        let startDate: Date
        switch (filters.dateRange) {
          case '1h':
            startDate = new Date(now.getTime() - 60 * 60 * 1000)
            break
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            break
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          default:
            startDate = new Date(0)
        }
        params.append('where[startTime][greater_than_equal]', startDate.toISOString())
      }

      // Use PayloadCMS client to fetch data directly
      const response = await fetch(`/api/job-execution-logs?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`)
      }

      const data = await response.json()
      setLogs(data.docs || [])
      setTotalPages(data.totalPages || 1)
      setTotalDocs(data.totalDocs || 0)
    } catch (err) {
      console.error('Error fetching logs:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [filters])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
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
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      case 'running':
        return <Clock className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A'
    if (duration < 1000) return `${duration}ms`
    return `${(duration / 1000).toFixed(1)}s`
  }

  const exportLogs = async () => {
    try {
      // Export logs as CSV
      const csvHeaders = [
        'Job Name',
        'Job ID',
        'Start Time',
        'End Time',
        'Duration (ms)',
        'Status',
        'Success',
        'Error Message',
        'Retry Count',
        'Queue',
        'Priority',
      ]

      const csvRows = logs.map((log) => [
        log.jobName,
        log.jobId,
        log.startTime,
        log.endTime || '',
        log.duration || '',
        log.status,
        log.success,
        log.errorMessage || '',
        log.retryCount,
        log.queue,
        log.priority,
      ])

      const csvContent = [csvHeaders, ...csvRows]
        .map((row) => row.map((field) => `"${field}"`).join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `job-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting logs:', err)
    }
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Job Execution Logs</h1>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Job Execution Logs</h1>
          <Button onClick={fetchLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load logs: {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Execution Logs</h1>
          <p className="text-muted-foreground">
            Detailed logs of all job executions and their results
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={fetchLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Job Name</label>
              <Select
                value={filters.jobName || 'all'}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    jobName: value === 'all' ? undefined : value,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All jobs</SelectItem>
                  <SelectItem value="monthly-rent-payment">Monthly Rent Payment</SelectItem>
                  <SelectItem value="payment-reminder-email">Payment Reminder Email</SelectItem>
                  <SelectItem value="overdue-payment-notification">
                    Overdue Payment Notification
                  </SelectItem>
                  <SelectItem value="auto-pay-processing">Auto Pay Processing</SelectItem>
                  <SelectItem value="job-health-check">Job Health Check</SelectItem>
                  <SelectItem value="payment-analytics">Payment Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value === 'all' ? undefined : value,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Date Range</label>
              <Select
                value={filters.dateRange || 'all'}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: value === 'all' ? undefined : value,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="1h">Last hour</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Results per page</label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, limit: parseInt(value), page: 1 }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
          <CardDescription>
            Showing {logs.length} of {totalDocs} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Name</TableHead>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.jobName.replace(/-/g, ' ')}</TableCell>
                    <TableCell className="font-mono text-sm">{log.jobId}</TableCell>
                    <TableCell>{formatDateTime(log.startTime)}</TableCell>
                    <TableCell>{formatDuration(log.duration)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(log.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(log.status)}
                          <span>{log.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.retryCount}/{log.maxRetries}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLog(log)
                          setShowDetails(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {filters.page} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader className="relative">
              <CardTitle className="text-foreground">Log Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(false)}
                className="absolute right-4 top-4 h-8 w-8 p-0"
              >
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Job Name</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedLog.jobName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Job ID</label>
                  <p className="text-sm text-muted-foreground font-mono mt-1">
                    {selectedLog.jobId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Start Time</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDateTime(selectedLog.startTime)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">End Time</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedLog.endTime ? formatDateTime(selectedLog.endTime) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Duration</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDuration(selectedLog.duration)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedLog.status)}>
                      {selectedLog.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Retry Count</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedLog.retryCount}/{selectedLog.maxRetries}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Queue</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedLog.queue}</p>
                </div>
              </div>

              {selectedLog.errorMessage && (
                <div>
                  <label className="text-sm font-medium text-foreground">Error Message</label>
                  <Alert className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-destructive">
                      {selectedLog.errorMessage}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {selectedLog.input && (
                <div>
                  <label className="text-sm font-medium text-foreground">Input</label>
                  <div className="mt-2 p-3 bg-muted border rounded-md">
                    <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                      {JSON.stringify(selectedLog.input, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {selectedLog.output && (
                <div>
                  <label className="text-sm font-medium text-foreground">Output</label>
                  <div className="mt-2 p-3 bg-muted border rounded-md">
                    <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                      {JSON.stringify(selectedLog.output, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
