// Job Execution Logging and Analytics System
// Following PayloadCMS v3 jobs logging documentation

import type { Payload } from 'payload'

export interface JobExecutionLog {
  id: string
  jobName: string
  jobId: string
  startTime: Date
  endTime?: Date
  duration?: number
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  success: boolean
  errorMessage?: string
  retryCount: number
  maxRetries: number
  input?: Record<string, any>
  output?: Record<string, any>
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface JobLogFilter {
  jobName?: string
  status?: 'running' | 'completed' | 'failed' | 'cancelled'
  startDate?: Date
  endDate?: Date
  success?: boolean
  limit?: number
  offset?: number
}

export interface JobLogStats {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  averageExecutionTime: number
  successRate: number
  failureRate: number
  mostCommonErrors: Array<{
    error: string
    count: number
    percentage: number
  }>
  jobBreakdown: Record<
    string,
    {
      executions: number
      successRate: number
      averageTime: number
    }
  >
}

/**
 * Job Execution Logging System
 * Provides comprehensive logging and analytics for job execution
 */
export class JobLogger {
  private static readonly LOG_RETENTION_DAYS = 90
  private static readonly MAX_LOG_ENTRIES = 10000

  /**
   * Log job execution start
   */
  static async logJobStart(
    payload: Payload,
    jobName: string,
    jobId: string,
    input?: Record<string, any>,
    queue?: string,
    priority?: number,
  ): Promise<JobExecutionLog> {
    try {
      const logEntry = await payload.create({
        collection: 'job-execution-logs',
        data: {
          jobName,
          jobId,
          startTime: new Date(),
          status: 'running',
          success: false,
          retryCount: 0,
          maxRetries: 3,
          input,
          queue,
          priority: priority || 0,
        },
      })

      console.log(`[JOB START] ${jobName} (${jobId}):`, {
        startTime: logEntry.startTime,
        input: logEntry.input,
      })

      return logEntry as JobExecutionLog
    } catch (error) {
      console.error('Error logging job start:', error)
      // Fallback to in-memory log if database fails
      return {
        id: `log-${jobId}-${Date.now()}`,
        jobName,
        jobId,
        startTime: new Date(),
        status: 'running',
        success: false,
        retryCount: 0,
        maxRetries: 3,
        input,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
  }

  /**
   * Log job execution completion
   */
  static async logJobCompletion(
    payload: Payload,
    logEntry: JobExecutionLog,
    success: boolean,
    output?: Record<string, any>,
    errorMessage?: string,
  ): Promise<JobExecutionLog> {
    try {
      const endTime = new Date()
      const duration = endTime.getTime() - logEntry.startTime.getTime()

      const updatedLog = await payload.update({
        collection: 'job-execution-logs',
        id: logEntry.id,
        data: {
          endTime,
          duration,
          status: success ? 'completed' : 'failed',
          success,
          output,
          errorMessage,
        },
      })

      console.log(
        `[JOB ${success ? 'COMPLETED' : 'FAILED'}] ${logEntry.jobName} (${logEntry.jobId}):`,
        {
          duration: `${duration}ms`,
          success,
          output: updatedLog.output,
          error: updatedLog.errorMessage,
        },
      )

      return updatedLog as JobExecutionLog
    } catch (error) {
      console.error('Error logging job completion:', error)
      // Fallback to in-memory update if database fails
      const endTime = new Date()
      const duration = endTime.getTime() - logEntry.startTime.getTime()
      return {
        ...logEntry,
        endTime,
        duration,
        status: success ? 'completed' : 'failed',
        success,
        output,
        errorMessage,
        updatedAt: new Date(),
      }
    }
  }

  /**
   * Log job retry
   */
  static async logJobRetry(
    payload: Payload,
    logEntry: JobExecutionLog,
    retryCount: number,
    errorMessage?: string,
  ): Promise<JobExecutionLog> {
    try {
      const updatedLog: JobExecutionLog = {
        ...logEntry,
        retryCount,
        errorMessage,
        updatedAt: new Date(),
      }

      console.log(`[JOB RETRY] ${logEntry.jobName} (${logEntry.jobId}):`, {
        retryCount,
        error: errorMessage,
      })

      return updatedLog
    } catch (error) {
      console.error('Error logging job retry:', error)
      throw error
    }
  }

  /**
   * Get job execution logs
   */
  static async getJobLogs(payload: Payload, filter: JobLogFilter = {}): Promise<JobExecutionLog[]> {
    try {
      // Build query conditions
      const where: any = {}

      if (filter.jobName) {
        where.jobName = { equals: filter.jobName }
      }

      if (filter.status) {
        where.status = { equals: filter.status }
      }

      if (filter.success !== undefined) {
        where.success = { equals: filter.success }
      }

      if (filter.startDate || filter.endDate) {
        where.startTime = {}
        if (filter.startDate) {
          where.startTime.greater_than_equal = filter.startDate
        }
        if (filter.endDate) {
          where.startTime.less_than_equal = filter.endDate
        }
      }

      // Query the database
      const result = await payload.find({
        collection: 'job-execution-logs',
        where,
        limit: filter.limit || 100,
        page: filter.offset ? Math.floor(filter.offset / (filter.limit || 100)) + 1 : 1,
        sort: '-startTime', // Most recent first
      })

      return result.docs as JobExecutionLog[]
    } catch (error) {
      console.error('Error getting job logs:', error)
      // Return empty array if database query fails
      return []
    }
  }

  /**
   * Get job execution statistics
   */
  static async getJobLogStats(
    payload: Payload,
    startDate?: Date,
    endDate?: Date,
  ): Promise<JobLogStats> {
    try {
      // Build date filter
      const where: any = {}
      if (startDate || endDate) {
        where.startTime = {}
        if (startDate) {
          where.startTime.greater_than_equal = startDate
        }
        if (endDate) {
          where.startTime.less_than_equal = endDate
        }
      }

      // Get all logs for the period
      const result = await payload.find({
        collection: 'job-execution-logs',
        where,
        limit: 10000, // Get all logs for stats calculation
      })

      const logs = result.docs as JobExecutionLog[]
      const totalExecutions = logs.length
      const successfulExecutions = logs.filter((log) => log.success).length
      const failedExecutions = logs.filter((log) => !log.success).length

      const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0
      const failureRate = totalExecutions > 0 ? failedExecutions / totalExecutions : 0

      // Calculate average execution time
      const completedLogs = logs.filter((log) => log.duration !== undefined)
      const averageExecutionTime =
        completedLogs.length > 0
          ? completedLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / completedLogs.length
          : 0

      // Get most common errors
      const errorCounts: Record<string, number> = {}
      logs.forEach((log) => {
        if (log.errorMessage) {
          errorCounts[log.errorMessage] = (errorCounts[log.errorMessage] || 0) + 1
        }
      })

      const mostCommonErrors = Object.entries(errorCounts)
        .map(([error, count]) => ({
          error,
          count,
          percentage: (count / failedExecutions) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Calculate job breakdown
      const jobBreakdown: Record<
        string,
        { executions: number; successRate: number; averageTime: number }
      > = {}
      const jobGroups: Record<string, JobExecutionLog[]> = {}

      logs.forEach((log) => {
        if (!jobGroups[log.jobName]) {
          jobGroups[log.jobName] = []
        }
        jobGroups[log.jobName].push(log)
      })

      Object.entries(jobGroups).forEach(([jobName, jobLogs]) => {
        const executions = jobLogs.length
        const successful = jobLogs.filter((log) => log.success).length
        const successRate = executions > 0 ? successful / executions : 0

        const completedLogs = jobLogs.filter((log) => log.duration !== undefined)
        const averageTime =
          completedLogs.length > 0
            ? completedLogs.reduce((sum, log) => sum + (log.duration || 0), 0) /
              completedLogs.length
            : 0

        jobBreakdown[jobName] = {
          executions,
          successRate,
          averageTime,
        }
      })

      return {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        averageExecutionTime,
        successRate,
        failureRate,
        mostCommonErrors,
        jobBreakdown,
      }
    } catch (error) {
      console.error('Error getting job log stats:', error)
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageExecutionTime: 0,
        successRate: 0,
        failureRate: 0,
        mostCommonErrors: [],
        jobBreakdown: {},
      }
    }
  }

  /**
   * Get job execution trends
   */
  static async getJobExecutionTrends(
    payload: Payload,
    timeRange: 'hour' | 'day' | 'week' | 'month' = 'day',
    jobName?: string,
  ): Promise<
    Array<{
      timestamp: string
      executions: number
      successes: number
      failures: number
      averageTime: number
    }>
  > {
    try {
      // In production, this would query the database
      // For now, return mock data
      const trends = []
      const now = new Date()
      const intervals =
        timeRange === 'hour' ? 24 : timeRange === 'day' ? 7 : timeRange === 'week' ? 4 : 12

      for (let i = intervals - 1; i >= 0; i--) {
        const timestamp = new Date(now)

        switch (timeRange) {
          case 'hour':
            timestamp.setHours(timestamp.getHours() - i)
            break
          case 'day':
            timestamp.setDate(timestamp.getDate() - i)
            break
          case 'week':
            timestamp.setDate(timestamp.getDate() - i * 7)
            break
          case 'month':
            timestamp.setMonth(timestamp.getMonth() - i)
            break
        }

        trends.push({
          timestamp: timestamp.toISOString(),
          executions: Math.floor(Math.random() * 20) + 5,
          successes: Math.floor(Math.random() * 18) + 4,
          failures: Math.floor(Math.random() * 3) + 1,
          averageTime: Math.floor(Math.random() * 30000) + 20000,
        })
      }

      return trends
    } catch (error) {
      console.error('Error getting job execution trends:', error)
      return []
    }
  }

  /**
   * Clean up old logs
   */
  static async cleanupOldLogs(payload: Payload): Promise<{
    deletedCount: number
    error?: string
  }> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - this.LOG_RETENTION_DAYS)

      // In production, this would delete old logs from the database
      // For now, return mock data
      console.log(`Cleaning up logs older than ${cutoffDate.toISOString()}`)

      return {
        deletedCount: 0,
      }
    } catch (error) {
      console.error('Error cleaning up old logs:', error)
      return {
        deletedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Export logs to CSV
   */
  static async exportLogsToCSV(
    logs: JobExecutionLog[],
    filename?: string,
  ): Promise<{
    filename: string
    data: string
    size: number
  }> {
    try {
      const csvFilename = filename || `job-logs-${new Date().toISOString().split('T')[0]}.csv`

      // Generate CSV headers
      const headers = [
        'ID',
        'Job Name',
        'Job ID',
        'Start Time',
        'End Time',
        'Duration (ms)',
        'Status',
        'Success',
        'Retry Count',
        'Error Message',
        'Input',
        'Output',
      ]

      // Generate CSV data
      const csvRows = logs.map((log) => [
        log.id,
        log.jobName,
        log.jobId,
        log.startTime.toISOString(),
        log.endTime?.toISOString() || '',
        log.duration || '',
        log.status,
        log.success,
        log.retryCount,
        log.errorMessage || '',
        JSON.stringify(log.input || {}),
        JSON.stringify(log.output || {}),
      ])

      const csvData = [headers.join(','), ...csvRows.map((row) => row.join(','))].join('\n')

      return {
        filename: csvFilename,
        data: csvData,
        size: csvData.length,
      }
    } catch (error) {
      console.error('Error exporting logs to CSV:', error)
      throw error
    }
  }

  /**
   * Get job performance metrics
   */
  static async getJobPerformanceMetrics(
    payload: Payload,
    jobName: string,
    timeRange: 'hour' | 'day' | 'week' | 'month' = 'day',
  ): Promise<{
    jobName: string
    timeRange: string
    metrics: {
      totalExecutions: number
      successRate: number
      averageExecutionTime: number
      failureRate: number
      retryRate: number
      trend: 'up' | 'down' | 'stable'
    }
  }> {
    try {
      // In production, this would query the database
      // For now, return mock data
      return {
        jobName,
        timeRange,
        metrics: {
          totalExecutions: 30,
          successRate: 0.9,
          averageExecutionTime: 45000,
          failureRate: 0.1,
          retryRate: 0.05,
          trend: 'stable',
        },
      }
    } catch (error) {
      console.error('Error getting job performance metrics:', error)
      throw error
    }
  }
}

/**
 * Job Logging Utilities
 */
export class JobLoggingUtils {
  /**
   * Format duration in human-readable format
   */
  static formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(1)}s`
    } else if (milliseconds < 3600000) {
      return `${(milliseconds / 60000).toFixed(1)}m`
    } else {
      return `${(milliseconds / 3600000).toFixed(1)}h`
    }
  }

  /**
   * Format success rate as percentage
   */
  static formatSuccessRate(successRate: number): string {
    return `${(successRate * 100).toFixed(1)}%`
  }

  /**
   * Get status color for UI
   */
  static getStatusColor(status: JobExecutionLog['status']): string {
    switch (status) {
      case 'completed':
        return '#28a745'
      case 'failed':
        return '#dc3545'
      case 'running':
        return '#007bff'
      case 'cancelled':
        return '#6c757d'
      default:
        return '#6c757d'
    }
  }

  /**
   * Get status icon for UI
   */
  static getStatusIcon(status: JobExecutionLog['status']): string {
    switch (status) {
      case 'completed':
        return '✓'
      case 'failed':
        return '❌'
      case 'running':
        return '⏳'
      case 'cancelled':
        return '⏹️'
      default:
        return '❓'
    }
  }
}
