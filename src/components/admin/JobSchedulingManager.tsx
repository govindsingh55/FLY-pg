'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar,
  Clock,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  Edit,
} from 'lucide-react'

// Import PayloadCMS client utilities
import { useConfig } from '@payloadcms/ui'
import { useAuth } from '@payloadcms/ui'

// Import date utilities for consistent formatting
import { formatDateTime } from '@/lib/date-utils'

interface JobSchedule {
  slug: string
  name: string
  description: string
  cron: string
  timezone: string
  enabled: boolean
  nextExecution?: string
  lastExecution?: string
}

interface ScheduleStatus {
  enabled: number
  disabled: number
  total: number
  schedules: JobSchedule[]
}

export default function JobSchedulingManager() {
  const [scheduleStatus, setScheduleStatus] = useState<ScheduleStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<JobSchedule | null>(null)
  const [cronExpression, setCronExpression] = useState('')
  const [cronValidation, setCronValidation] = useState<{
    valid: boolean
    error?: string
    nextExecution?: string
  } | null>(null)

  const config = useConfig()
  const { user } = useAuth()

  // Fetch schedule status using PayloadCMS client
  const fetchScheduleStatus = async () => {
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
        throw new Error(`Failed to fetch schedule status: ${response.statusText}`)
      }

      // For now, we'll use static schedule data since we don't have a schedules collection
      // In a real implementation, this would come from a schedules collection
      const schedules: JobSchedule[] = [
        {
          slug: 'monthly-rent-payment',
          name: 'Monthly Rent Payment',
          description: 'Creates monthly rent payments for all active customers',
          cron: '0 9 1 * *', // 9 AM on the 1st of every month
          timezone: 'Asia/Kolkata',
          enabled: true,
          nextExecution: '2024-10-01T09:00:00Z',
          lastExecution: '2024-09-01T09:00:00Z',
        },
        {
          slug: 'payment-reminder-email',
          name: 'Payment Reminder Email',
          description: 'Sends payment reminder emails to customers',
          cron: '0 10 * * *', // 10 AM every day
          timezone: 'Asia/Kolkata',
          enabled: true,
          nextExecution: '2024-09-05T10:00:00Z',
          lastExecution: '2024-09-04T10:00:00Z',
        },
        {
          slug: 'overdue-payment-notification',
          name: 'Overdue Payment Notification',
          description: 'Sends notifications for overdue payments',
          cron: '0 11 * * *', // 11 AM every day
          timezone: 'Asia/Kolkata',
          enabled: true,
          nextExecution: '2024-09-05T11:00:00Z',
          lastExecution: '2024-09-04T11:00:00Z',
        },
        {
          slug: 'auto-pay-processing',
          name: 'Auto Pay Processing',
          description: 'Processes automatic payments for customers with auto-pay enabled',
          cron: '0 12 * * *', // 12 PM every day
          timezone: 'Asia/Kolkata',
          enabled: true,
          nextExecution: '2024-09-05T12:00:00Z',
          lastExecution: '2024-09-04T12:00:00Z',
        },
        {
          slug: 'job-health-check',
          name: 'Job Health Check',
          description: 'Performs health checks on the job system',
          cron: '*/15 * * * *', // Every 15 minutes
          timezone: 'Asia/Kolkata',
          enabled: false,
          nextExecution: '2024-09-04T12:15:00Z',
          lastExecution: '2024-09-04T12:00:00Z',
        },
        {
          slug: 'payment-analytics',
          name: 'Payment Analytics',
          description: 'Generates payment analytics and reports',
          cron: '0 2 * * 1', // 2 AM every Monday
          timezone: 'Asia/Kolkata',
          enabled: false,
          nextExecution: '2024-09-09T02:00:00Z',
          lastExecution: '2024-09-02T02:00:00Z',
        },
      ]

      const status: ScheduleStatus = {
        enabled: schedules.filter((s) => s.enabled).length,
        disabled: schedules.filter((s) => !s.enabled).length,
        total: schedules.length,
        schedules,
      }

      setScheduleStatus(status)
    } catch (err) {
      console.error('Error fetching schedule status:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScheduleStatus()
  }, [])

  const toggleSchedule = async (slug: string, enabled: boolean) => {
    try {
      // In a real implementation, this would update the schedule in the database
      // For now, we'll just update the local state
      if (scheduleStatus) {
        const updatedSchedules = scheduleStatus.schedules.map((schedule) =>
          schedule.slug === slug ? { ...schedule, enabled } : schedule,
        )

        setScheduleStatus({
          ...scheduleStatus,
          schedules: updatedSchedules,
          enabled: updatedSchedules.filter((s) => s.enabled).length,
          disabled: updatedSchedules.filter((s) => !s.enabled).length,
        })
      }
    } catch (err) {
      console.error('Error toggling schedule:', err)
      setError(err instanceof Error ? err.message : 'Failed to toggle schedule')
    }
  }

  const validateCronExpression = (cron: string) => {
    // Basic cron validation
    const cronRegex =
      /^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3])) (\*|([012]?\d|3[01])) (\*|([0]?\d|1[0-2])) (\*|([0-6]))$/
    const valid = cronRegex.test(cron)

    if (valid) {
      // Calculate next execution time (simplified)
      const now = new Date()
      const nextExecution = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now
      return { valid: true, nextExecution: nextExecution.toISOString() }
    } else {
      return { valid: false, error: 'Invalid cron expression format' }
    }
  }

  const handleCronChange = (cron: string) => {
    setCronExpression(cron)
    const validation = validateCronExpression(cron)
    setCronValidation(validation)
  }

  const updateCronExpression = async (slug: string, newCron: string) => {
    try {
      // In a real implementation, this would update the schedule in the database
      // For now, we'll just update the local state
      if (scheduleStatus) {
        const updatedSchedules = scheduleStatus.schedules.map((schedule) =>
          schedule.slug === slug ? { ...schedule, cron: newCron } : schedule,
        )

        setScheduleStatus({
          ...scheduleStatus,
          schedules: updatedSchedules,
        })

        setEditingSchedule(null)
        setCronExpression('')
        setCronValidation(null)
      }
    } catch (err) {
      console.error('Error updating cron expression:', err)
      setError(err instanceof Error ? err.message : 'Failed to update cron expression')
    }
  }

  const formatCronExpression = (cron: string) => {
    // Convert cron to human readable format
    const parts = cron.split(' ')
    if (parts.length !== 5) return cron

    const [minute, hour, day, month, weekday] = parts

    if (minute === '0' && hour === '9' && day === '1' && month === '*' && weekday === '*') {
      return '9:00 AM on the 1st of every month'
    }
    if (minute === '0' && hour === '10' && day === '*' && month === '*' && weekday === '*') {
      return '10:00 AM every day'
    }
    if (minute === '0' && hour === '11' && day === '*' && month === '*' && weekday === '*') {
      return '11:00 AM every day'
    }
    if (minute === '0' && hour === '12' && day === '*' && month === '*' && weekday === '*') {
      return '12:00 PM every day'
    }
    if (minute === '*/15' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
      return 'Every 15 minutes'
    }
    if (minute === '0' && hour === '2' && day === '*' && month === '*' && weekday === '1') {
      return '2:00 AM every Monday'
    }

    return cron
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Job Scheduling Manager</h1>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>Loading...</CardTitle>
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
          <h1 className="text-3xl font-bold">Job Scheduling Manager</h1>
          <Button onClick={fetchScheduleStatus} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load schedule data: {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!scheduleStatus) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Scheduling Manager</h1>
          <p className="text-muted-foreground">
            Manage job schedules, cron expressions, and execution times
          </p>
        </div>
        <Button onClick={fetchScheduleStatus} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Schedule Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduleStatus.total}</div>
            <p className="text-xs text-muted-foreground">
              {scheduleStatus.enabled} enabled, {scheduleStatus.disabled} disabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduleStatus.enabled}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disabled Schedules</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduleStatus.disabled}</div>
            <p className="text-xs text-muted-foreground">Not running</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Job Schedules
          </CardTitle>
          <CardDescription>
            Manage individual job schedules and their execution times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduleStatus.schedules.map((schedule) => (
              <div key={schedule.slug} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{schedule.name}</h3>
                      <Badge
                        className={
                          schedule.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {schedule.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{schedule.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatCronExpression(schedule.cron)}</span>
                      </div>
                      {schedule.nextExecution && (
                        <div>Next: {formatDateTime(schedule.nextExecution)}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={(enabled) => toggleSchedule(schedule.slug, enabled)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingSchedule(schedule)
                        setCronExpression(schedule.cron)
                        setCronValidation(null)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Schedule Modal */}
      {editingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Schedule</CardTitle>
              <CardDescription>
                Update the cron expression for {editingSchedule.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cron">Cron Expression</Label>
                <Input
                  id="cron"
                  value={cronExpression}
                  onChange={(e) => handleCronChange(e.target.value)}
                  placeholder="0 9 1 * *"
                />
                {cronValidation && (
                  <div className="mt-2">
                    {cronValidation.valid ? (
                      <div className="text-sm text-green-600">
                        ✓ Valid cron expression
                        {cronValidation.nextExecution && (
                          <div>Next execution: {formatDateTime(cronValidation.nextExecution)}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">✗ {cronValidation.error}</div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingSchedule(null)
                    setCronExpression('')
                    setCronValidation(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateCronExpression(editingSchedule.slug, cronExpression)}
                  disabled={!cronValidation?.valid}
                >
                  Update Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
