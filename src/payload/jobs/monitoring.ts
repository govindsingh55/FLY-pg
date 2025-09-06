// Job Monitoring and Health Check System
// Following PayloadCMS v3 jobs monitoring documentation

import type { Payload } from 'payload'
import { PaymentJobScheduler } from './scheduling'

export interface JobHealthStatus {
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  message: string
  timestamp: Date
  details?: Record<string, any>
}

export interface JobExecutionMetrics {
  jobId: string
  jobName: string
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
}

export interface SystemHealthMetrics {
  totalJobs: number
  runningJobs: number
  completedJobs: number
  failedJobs: number
  averageExecutionTime: number
  successRate: number
  lastHealthCheck: Date
  systemStatus: 'healthy' | 'warning' | 'critical'
  issues: string[]
}

/**
 * Job Monitoring and Health Check System
 * Monitors job execution, performance, and system health
 */
export class JobMonitor {
  private static readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes
  private static readonly METRICS_RETENTION_DAYS = 30
  private static readonly MAX_EXECUTION_TIME = 30 * 60 * 1000 // 30 minutes
  private static readonly FAILURE_THRESHOLD = 0.8 // 80% success rate threshold

  /**
   * Perform comprehensive health check
   */
  static async performHealthCheck(payload: Payload): Promise<JobHealthStatus> {
    try {
      const startTime = Date.now()
      const issues: string[] = []
      let status: 'healthy' | 'warning' | 'critical' = 'healthy'

      // Check job schedules
      const scheduleStatus = PaymentJobScheduler.getJobScheduleStatus()
      if (scheduleStatus.disabled > 0) {
        issues.push(`${scheduleStatus.disabled} job schedules are disabled`)
        status = 'warning'
      }

      // Check system metrics
      const metrics = await this.getSystemMetrics(payload)
      if (metrics.successRate < this.FAILURE_THRESHOLD) {
        issues.push(`Low success rate: ${(metrics.successRate * 100).toFixed(1)}%`)
        status = 'critical'
      }

      if (metrics.runningJobs > 10) {
        issues.push(`High number of running jobs: ${metrics.runningJobs}`)
        status = status === 'critical' ? 'critical' : 'warning'
      }

      // Check for stuck jobs
      const stuckJobs = await this.getStuckJobs(payload)
      if (stuckJobs.length > 0) {
        issues.push(`${stuckJobs.length} jobs appear to be stuck`)
        status = 'critical'
      }

      // Check queue health
      const queueHealth = await this.checkQueueHealth(payload)
      if (!queueHealth.healthy) {
        issues.push(`Queue health issues: ${queueHealth.issues.join(', ')}`)
        status = status === 'critical' ? 'critical' : 'warning'
      }

      const duration = Date.now() - startTime
      const message =
        issues.length === 0
          ? 'All systems operational'
          : `Found ${issues.length} issue(s): ${issues.join(', ')}`

      return {
        status,
        message,
        timestamp: new Date(),
        details: {
          scheduleStatus,
          metrics,
          stuckJobs: stuckJobs.length,
          queueHealth,
          healthCheckDuration: duration,
        },
      }
    } catch (error) {
      console.error('Health check failed:', error)
      return {
        status: 'critical',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      }
    }
  }

  /**
   * Get system metrics
   */
  static async getSystemMetrics(payload: Payload): Promise<SystemHealthMetrics> {
    try {
      // Get recent job logs (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

      const result = await payload.find({
        collection: 'job-execution-logs',
        where: {
          startTime: {
            greater_than_equal: oneDayAgo,
          },
        },
        limit: 10000,
      })

      const logs = result.docs as any[]
      const totalJobs = logs.length
      const runningJobs = logs.filter((log) => log.status === 'running').length
      const completedJobs = logs.filter((log) => log.status === 'completed' && log.success).length
      const failedJobs = logs.filter((log) => log.status === 'failed' || !log.success).length

      // Calculate average execution time
      const completedLogs = logs.filter((log) => log.duration !== undefined)
      const averageExecutionTime =
        completedLogs.length > 0
          ? completedLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / completedLogs.length
          : 0

      const successRate = totalJobs > 0 ? completedJobs / totalJobs : 0

      // Determine system status and issues
      const issues: string[] = []
      let systemStatus: 'healthy' | 'warning' | 'critical' = 'healthy'

      if (successRate < this.FAILURE_THRESHOLD) {
        issues.push('Low success rate')
        systemStatus = 'critical'
      }

      if (runningJobs > 10) {
        issues.push('High number of running jobs')
        systemStatus = systemStatus === 'healthy' ? 'warning' : systemStatus
      }

      if (averageExecutionTime > this.MAX_EXECUTION_TIME) {
        issues.push('High average execution time')
        systemStatus = systemStatus === 'healthy' ? 'warning' : systemStatus
      }

      return {
        totalJobs,
        runningJobs,
        completedJobs,
        failedJobs,
        averageExecutionTime,
        successRate,
        lastHealthCheck: new Date(),
        systemStatus,
        issues,
      }
    } catch (error) {
      console.error('Error getting system metrics:', error)
      return {
        totalJobs: 0,
        runningJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        averageExecutionTime: 0,
        successRate: 0,
        lastHealthCheck: new Date(),
        systemStatus: 'critical',
        issues: ['Failed to retrieve metrics'],
      }
    }
  }

  /**
   * Get stuck jobs (jobs running longer than expected)
   */
  static async getStuckJobs(payload: Payload): Promise<JobExecutionMetrics[]> {
    try {
      // This would query for jobs that have been running too long
      // For now, return empty array
      return []
    } catch (error) {
      console.error('Error getting stuck jobs:', error)
      return []
    }
  }

  /**
   * Check queue health
   */
  static async checkQueueHealth(payload: Payload): Promise<{
    healthy: boolean
    issues: string[]
    queueStats: Record<string, any>
  }> {
    try {
      const issues: string[] = []
      const queueStats: Record<string, any> = {}

      // Check each queue
      const queues = ['payment-jobs', 'system-jobs', 'analytics-jobs', 'email-jobs']

      for (const queue of queues) {
        // This would check actual queue health
        // For now, simulate healthy queues
        queueStats[queue] = {
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
          healthy: true,
        }
      }

      return {
        healthy: issues.length === 0,
        issues,
        queueStats,
      }
    } catch (error) {
      console.error('Error checking queue health:', error)
      return {
        healthy: false,
        issues: ['Failed to check queue health'],
        queueStats: {},
      }
    }
  }

  /**
   * Record job execution metrics
   */
  static async recordJobExecution(metrics: JobExecutionMetrics): Promise<void> {
    try {
      // This would store metrics in the database
      console.log('Recording job execution metrics:', {
        jobId: metrics.jobId,
        jobName: metrics.jobName,
        duration: metrics.duration,
        status: metrics.status,
        success: metrics.success,
      })
    } catch (error) {
      console.error('Error recording job execution metrics:', error)
    }
  }

  /**
   * Get job execution history
   */
  static async getJobExecutionHistory(
    payload: Payload,
    jobName?: string,
    limit: number = 100,
  ): Promise<JobExecutionMetrics[]> {
    try {
      const where: any = {}
      if (jobName) {
        where.jobName = { equals: jobName }
      }

      const result = await payload.find({
        collection: 'job-execution-logs',
        where,
        limit,
        sort: '-startTime', // Most recent first
      })

      return result.docs.map((log: any) => ({
        jobId: log.jobId,
        jobName: log.jobName,
        startTime: log.startTime,
        endTime: log.endTime,
        duration: log.duration,
        status: log.status,
        success: log.success,
        errorMessage: log.errorMessage,
        retryCount: log.retryCount,
        maxRetries: log.maxRetries,
        input: log.input,
        output: log.output,
      }))
    } catch (error) {
      console.error('Error getting job execution history:', error)
      return []
    }
  }

  /**
   * Get job performance analytics
   */
  static async getJobPerformanceAnalytics(
    payload: Payload,
    timeRange: 'hour' | 'day' | 'week' | 'month' = 'day',
  ): Promise<{
    timeRange: string
    totalExecutions: number
    successRate: number
    averageExecutionTime: number
    failureReasons: Record<string, number>
    jobBreakdown: Record<
      string,
      {
        executions: number
        successRate: number
        averageTime: number
      }
    >
  }> {
    try {
      // This would generate performance analytics
      // For now, return mock data
      return {
        timeRange,
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 0,
        failureReasons: {},
        jobBreakdown: {},
      }
    } catch (error) {
      console.error('Error getting job performance analytics:', error)
      return {
        timeRange,
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 0,
        failureReasons: {},
        jobBreakdown: {},
      }
    }
  }

  /**
   * Clean up old metrics
   */
  static async cleanupOldMetrics(payload: Payload): Promise<{
    deletedCount: number
    error?: string
  }> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - this.METRICS_RETENTION_DAYS)

      // This would delete old metrics from the database
      // For now, return mock data
      return {
        deletedCount: 0,
      }
    } catch (error) {
      console.error('Error cleaning up old metrics:', error)
      return {
        deletedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send health check alerts
   */
  static async sendHealthCheckAlert(
    payload: Payload,
    healthStatus: JobHealthStatus,
  ): Promise<void> {
    try {
      if (healthStatus.status === 'critical') {
        // Send critical alert
        console.error('CRITICAL: Job system health check failed:', healthStatus.message)

        // This would send actual alerts (email, Slack, etc.)
        // For now, just log
      } else if (healthStatus.status === 'warning') {
        // Send warning alert
        console.warn('WARNING: Job system health check warning:', healthStatus.message)
      }
    } catch (error) {
      console.error('Error sending health check alert:', error)
    }
  }

  /**
   * Get job system status dashboard data
   */
  static async getDashboardData(payload: Payload): Promise<{
    healthStatus: JobHealthStatus
    systemMetrics: SystemHealthMetrics
    recentJobs: JobExecutionMetrics[]
    scheduleStatus: ReturnType<typeof PaymentJobScheduler.getJobScheduleStatus>
    performanceAnalytics: Awaited<ReturnType<typeof JobMonitor.getJobPerformanceAnalytics>>
  }> {
    try {
      const [healthStatus, systemMetrics, recentJobs, performanceAnalytics] = await Promise.all([
        this.performHealthCheck(payload),
        this.getSystemMetrics(payload),
        this.getJobExecutionHistory(payload, undefined, 10),
        this.getJobPerformanceAnalytics(payload, 'day'),
      ])

      const scheduleStatus = PaymentJobScheduler.getJobScheduleStatus()

      return {
        healthStatus,
        systemMetrics,
        recentJobs,
        scheduleStatus,
        performanceAnalytics,
      }
    } catch (error) {
      console.error('Error getting dashboard data:', error)
      throw error
    }
  }
}

/**
 * Job Health Check Job
 * This job runs the health check system
 */
export const jobHealthCheckJob = {
  name: 'job-health-check',
  description: 'Monitor job system health and performance',

  async run(payload: Payload, input: any) {
    const startTime = Date.now()

    try {
      console.log('Starting job health check...')

      // Perform health check
      const healthStatus = await JobMonitor.performHealthCheck(payload)

      // Send alerts if needed
      await JobMonitor.sendHealthCheckAlert(payload, healthStatus)

      // Clean up old metrics
      const cleanupResult = await JobMonitor.cleanupOldMetrics(payload)
      console.log(`Cleaned up ${cleanupResult.deletedCount} old metrics`)

      const duration = Date.now() - startTime

      return {
        success: true,
        message: `Health check completed in ${duration}ms`,
        data: {
          healthStatus,
          cleanupResult,
          duration,
        },
        executionTime: duration,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error('Job health check failed:', error)

      return {
        success: false,
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: duration,
      }
    }
  },
}
