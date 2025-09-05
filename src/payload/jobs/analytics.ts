// Job Analytics and Reporting System
// Following PayloadCMS v3 jobs analytics documentation

import type { Payload } from 'payload'
import { PaymentJobScheduler } from './scheduling'
import { JobMonitor } from './monitoring'

export interface JobAnalyticsData {
  period: string
  totalJobs: number
  successfulJobs: number
  failedJobs: number
  successRate: number
  averageExecutionTime: number
  totalExecutionTime: number
  jobBreakdown: Record<
    string,
    {
      executions: number
      successRate: number
      averageTime: number
      totalTime: number
      failures: number
    }
  >
  hourlyDistribution: Record<string, number>
  dailyDistribution: Record<string, number>
  failureReasons: Record<string, number>
  performanceTrends: Array<{
    date: string
    successRate: number
    averageTime: number
    totalJobs: number
  }>
}

export interface PaymentSystemAnalytics {
  totalPaymentsGenerated: number
  totalRemindersSent: number
  totalOverdueNotifications: number
  totalAutoPayProcessed: number
  totalAutoPayFailed: number
  averagePaymentAmount: number
  totalPaymentAmount: number
  customerEngagement: {
    reminderOpenRate: number
    reminderClickRate: number
    overdueResponseRate: number
  }
  systemPerformance: {
    jobSuccessRate: number
    averageJobExecutionTime: number
    systemUptime: number
  }
}

export interface JobReport {
  reportId: string
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom'
  generatedAt: Date
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalJobs: number
    successRate: number
    averageExecutionTime: number
    criticalIssues: number
  }
  details: JobAnalyticsData
  recommendations: string[]
}

/**
 * Job Analytics and Reporting System
 * Generates comprehensive analytics and reports for job execution
 */
export class JobAnalytics {
  private static readonly REPORT_RETENTION_DAYS = 90
  private static readonly ANALYTICS_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Generate comprehensive job analytics
   */
  static async generateJobAnalytics(
    payload: Payload,
    startDate: Date,
    endDate: Date,
  ): Promise<JobAnalyticsData> {
    try {
      console.log(
        `Generating job analytics for period: ${startDate.toISOString()} to ${endDate.toISOString()}`,
      )

      // This would query actual job execution data
      // For now, return mock data
      const period = `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`

      return {
        period,
        totalJobs: 150,
        successfulJobs: 135,
        failedJobs: 15,
        successRate: 0.9,
        averageExecutionTime: 45000, // 45 seconds
        totalExecutionTime: 6750000, // 1.875 hours
        jobBreakdown: {
          'monthly-rent-payment': {
            executions: 1,
            successRate: 1.0,
            averageTime: 120000, // 2 minutes
            totalTime: 120000,
            failures: 0,
          },
          'payment-reminder-email': {
            executions: 30,
            successRate: 0.95,
            averageTime: 15000, // 15 seconds
            totalTime: 450000,
            failures: 1,
          },
          'overdue-payment-notification': {
            executions: 15,
            successRate: 0.93,
            averageTime: 20000, // 20 seconds
            totalTime: 300000,
            failures: 1,
          },
          'auto-pay-processing': {
            executions: 30,
            successRate: 0.87,
            averageTime: 30000, // 30 seconds
            totalTime: 900000,
            failures: 4,
          },
          'job-health-check': {
            executions: 72, // Every 5 minutes
            successRate: 1.0,
            averageTime: 5000, // 5 seconds
            totalTime: 360000,
            failures: 0,
          },
        },
        hourlyDistribution: this.generateHourlyDistribution(),
        dailyDistribution: this.generateDailyDistribution(startDate, endDate),
        failureReasons: {
          'Payment gateway timeout': 5,
          'Email service unavailable': 3,
          'Database connection error': 2,
          'Invalid customer data': 3,
          'System overload': 2,
        },
        performanceTrends: this.generatePerformanceTrends(startDate, endDate),
      }
    } catch (error) {
      console.error('Error generating job analytics:', error)
      throw error
    }
  }

  /**
   * Generate payment system analytics
   */
  static async generatePaymentSystemAnalytics(
    payload: Payload,
    startDate: Date,
    endDate: Date,
  ): Promise<PaymentSystemAnalytics> {
    try {
      console.log(
        `Generating payment system analytics for period: ${startDate.toISOString()} to ${endDate.toISOString()}`,
      )

      // Query payments created in the period
      const paymentsResult = await payload.find({
        collection: 'payments',
        where: {
          createdAt: {
            greater_than_equal: startDate,
            less_than_equal: endDate,
          },
        },
        limit: 10000,
      })

      const payments = paymentsResult.docs as any[]
      const totalPaymentsGenerated = payments.length
      const totalPaymentAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
      const averagePaymentAmount =
        totalPaymentsGenerated > 0 ? totalPaymentAmount / totalPaymentsGenerated : 0

      // Query job logs for payment-related jobs
      const jobLogsResult = await payload.find({
        collection: 'job-execution-logs',
        where: {
          startTime: {
            greater_than_equal: startDate,
            less_than_equal: endDate,
          },
          jobName: {
            in: [
              'monthly-rent-payment',
              'payment-reminder-email',
              'overdue-payment-notification',
              'auto-pay-processing',
            ],
          },
        },
        limit: 10000,
      })

      const jobLogs = jobLogsResult.docs as any[]

      // Count job executions
      const totalRemindersSent = jobLogs.filter(
        (log) => log.jobName === 'payment-reminder-email' && log.success,
      ).length
      const totalOverdueNotifications = jobLogs.filter(
        (log) => log.jobName === 'overdue-payment-notification' && log.success,
      ).length
      const totalAutoPayProcessed = jobLogs.filter(
        (log) => log.jobName === 'auto-pay-processing' && log.success,
      ).length
      const totalAutoPayFailed = jobLogs.filter(
        (log) => log.jobName === 'auto-pay-processing' && !log.success,
      ).length

      // Calculate system performance metrics
      const allJobLogsResult = await payload.find({
        collection: 'job-execution-logs',
        where: {
          startTime: {
            greater_than_equal: startDate,
            less_than_equal: endDate,
          },
        },
        limit: 10000,
      })

      const allJobLogs = allJobLogsResult.docs as any[]
      const successfulJobs = allJobLogs.filter((log) => log.success).length
      const totalJobs = allJobLogs.length
      const jobSuccessRate = totalJobs > 0 ? successfulJobs / totalJobs : 0

      const completedLogs = allJobLogs.filter((log) => log.duration !== undefined)
      const averageJobExecutionTime =
        completedLogs.length > 0
          ? completedLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / completedLogs.length
          : 0

      return {
        totalPaymentsGenerated,
        totalRemindersSent,
        totalOverdueNotifications,
        totalAutoPayProcessed,
        totalAutoPayFailed,
        averagePaymentAmount,
        totalPaymentAmount,
        customerEngagement: {
          reminderOpenRate: 0.85, // This would need email tracking data
          reminderClickRate: 0.45, // This would need email tracking data
          overdueResponseRate: 0.7, // This would need customer response tracking
        },
        systemPerformance: {
          jobSuccessRate,
          averageJobExecutionTime,
          systemUptime: 0.99, // This would need uptime monitoring
        },
      }
    } catch (error) {
      console.error('Error generating payment system analytics:', error)
      // Return empty analytics if database query fails
      return {
        totalPaymentsGenerated: 0,
        totalRemindersSent: 0,
        totalOverdueNotifications: 0,
        totalAutoPayProcessed: 0,
        totalAutoPayFailed: 0,
        averagePaymentAmount: 0,
        totalPaymentAmount: 0,
        customerEngagement: {
          reminderOpenRate: 0,
          reminderClickRate: 0,
          overdueResponseRate: 0,
        },
        systemPerformance: {
          jobSuccessRate: 0,
          averageJobExecutionTime: 0,
          systemUptime: 0,
        },
      }
    }
  }

  /**
   * Generate comprehensive job report
   */
  static async generateJobReport(
    payload: Payload,
    reportType: 'daily' | 'weekly' | 'monthly' | 'custom',
    startDate?: Date,
    endDate?: Date,
  ): Promise<JobReport> {
    try {
      const now = new Date()
      let periodStart: Date
      let periodEnd: Date

      // Calculate period based on report type
      switch (reportType) {
        case 'daily':
          periodStart = new Date(now)
          periodStart.setHours(0, 0, 0, 0)
          periodEnd = new Date(now)
          periodEnd.setHours(23, 59, 59, 999)
          break
        case 'weekly':
          periodStart = new Date(now)
          periodStart.setDate(now.getDate() - 7)
          periodStart.setHours(0, 0, 0, 0)
          periodEnd = new Date(now)
          periodEnd.setHours(23, 59, 59, 999)
          break
        case 'monthly':
          periodStart = new Date(now)
          periodStart.setMonth(now.getMonth() - 1)
          periodStart.setHours(0, 0, 0, 0)
          periodEnd = new Date(now)
          periodEnd.setHours(23, 59, 59, 999)
          break
        case 'custom':
          if (!startDate || !endDate) {
            throw new Error('Custom report requires start and end dates')
          }
          periodStart = startDate
          periodEnd = endDate
          break
      }

      // Generate analytics data
      const analyticsData = await this.generateJobAnalytics(payload, periodStart, periodEnd)
      const paymentAnalytics = await this.generatePaymentSystemAnalytics(
        payload,
        periodStart,
        periodEnd,
      )

      // Generate recommendations
      const recommendations = this.generateRecommendations(analyticsData, paymentAnalytics)

      const report: JobReport = {
        reportId: `report-${reportType}-${now.getTime()}`,
        reportType,
        generatedAt: now,
        period: {
          start: periodStart,
          end: periodEnd,
        },
        summary: {
          totalJobs: analyticsData.totalJobs,
          successRate: analyticsData.successRate,
          averageExecutionTime: analyticsData.averageExecutionTime,
          criticalIssues: Object.keys(analyticsData.failureReasons).length,
        },
        details: analyticsData,
        recommendations,
      }

      // Store report (in production, this would be saved to database)
      console.log(`Generated ${reportType} report:`, report.reportId)

      return report
    } catch (error) {
      console.error('Error generating job report:', error)
      throw error
    }
  }

  /**
   * Get job performance metrics
   */
  static async getJobPerformanceMetrics(
    payload: Payload,
    jobName?: string,
    timeRange: 'hour' | 'day' | 'week' | 'month' = 'day',
  ): Promise<{
    jobName?: string
    timeRange: string
    metrics: {
      executions: number
      successRate: number
      averageExecutionTime: number
      failureRate: number
      trend: 'up' | 'down' | 'stable'
    }
  }> {
    try {
      // This would query actual performance metrics
      // For now, return mock data
      return {
        jobName,
        timeRange,
        metrics: {
          executions: 30,
          successRate: 0.9,
          averageExecutionTime: 45000,
          failureRate: 0.1,
          trend: 'stable',
        },
      }
    } catch (error) {
      console.error('Error getting job performance metrics:', error)
      throw error
    }
  }

  /**
   * Generate hourly distribution data
   */
  private static generateHourlyDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {}

    for (let hour = 0; hour < 24; hour++) {
      const hourKey = `${hour.toString().padStart(2, '0')}:00`
      // Simulate job distribution (more jobs during business hours)
      if (hour >= 6 && hour <= 18) {
        distribution[hourKey] = Math.floor(Math.random() * 10) + 5
      } else {
        distribution[hourKey] = Math.floor(Math.random() * 3) + 1
      }
    }

    return distribution
  }

  /**
   * Generate daily distribution data
   */
  private static generateDailyDistribution(startDate: Date, endDate: Date): Record<string, number> {
    const distribution: Record<string, number> = {}
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0]
      distribution[dateKey] = Math.floor(Math.random() * 20) + 10
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return distribution
  }

  /**
   * Generate performance trends
   */
  private static generatePerformanceTrends(
    startDate: Date,
    endDate: Date,
  ): Array<{
    date: string
    successRate: number
    averageTime: number
    totalJobs: number
  }> {
    const trends: Array<{
      date: string
      successRate: number
      averageTime: number
      totalJobs: number
    }> = []

    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0]
      trends.push({
        date: dateKey,
        successRate: 0.85 + Math.random() * 0.15, // 85-100%
        averageTime: 30000 + Math.random() * 30000, // 30-60 seconds
        totalJobs: Math.floor(Math.random() * 20) + 10,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return trends
  }

  /**
   * Generate recommendations based on analytics
   */
  private static generateRecommendations(
    analytics: JobAnalyticsData,
    paymentAnalytics: PaymentSystemAnalytics,
  ): string[] {
    const recommendations: string[] = []

    // Success rate recommendations
    if (analytics.successRate < 0.95) {
      recommendations.push(
        'Job success rate is below 95%. Consider investigating failure reasons and improving error handling.',
      )
    }

    // Performance recommendations
    if (analytics.averageExecutionTime > 60000) {
      recommendations.push(
        'Average job execution time is high. Consider optimizing job performance or increasing resources.',
      )
    }

    // Auto-pay recommendations
    if (paymentAnalytics.totalAutoPayFailed > 0) {
      const failureRate =
        paymentAnalytics.totalAutoPayFailed /
        (paymentAnalytics.totalAutoPayProcessed + paymentAnalytics.totalAutoPayFailed)
      if (failureRate > 0.1) {
        recommendations.push(
          'Auto-pay failure rate is high. Consider reviewing payment method validation and retry logic.',
        )
      }
    }

    // Customer engagement recommendations
    if (paymentAnalytics.customerEngagement.reminderOpenRate < 0.8) {
      recommendations.push(
        'Email reminder open rate is low. Consider improving email subject lines and content.',
      )
    }

    // System performance recommendations
    if (paymentAnalytics.systemPerformance.systemUptime < 0.99) {
      recommendations.push(
        'System uptime is below 99%. Consider implementing better monitoring and failover mechanisms.',
      )
    }

    // Default recommendation if no issues found
    if (recommendations.length === 0) {
      recommendations.push(
        'System is performing well. Continue monitoring and consider implementing additional optimizations.',
      )
    }

    return recommendations
  }

  /**
   * Export analytics data to CSV
   */
  static async exportAnalyticsToCSV(
    analytics: JobAnalyticsData,
    filename?: string,
  ): Promise<{
    filename: string
    data: string
    size: number
  }> {
    try {
      const csvFilename = filename || `job-analytics-${new Date().toISOString().split('T')[0]}.csv`

      // Generate CSV headers
      const headers = [
        'Period',
        'Total Jobs',
        'Successful Jobs',
        'Failed Jobs',
        'Success Rate',
        'Average Execution Time (ms)',
        'Total Execution Time (ms)',
      ]

      // Generate CSV data
      const csvData = [
        headers.join(','),
        [
          analytics.period,
          analytics.totalJobs,
          analytics.successfulJobs,
          analytics.failedJobs,
          analytics.successRate,
          analytics.averageExecutionTime,
          analytics.totalExecutionTime,
        ].join(','),
      ].join('\n')

      return {
        filename: csvFilename,
        data: csvData,
        size: csvData.length,
      }
    } catch (error) {
      console.error('Error exporting analytics to CSV:', error)
      throw error
    }
  }
}

/**
 * Payment Analytics Job
 * This job generates daily payment analytics and reports
 */
export const paymentAnalyticsJob = {
  name: 'payment-analytics',
  description: 'Generate daily payment analytics and reports',

  async run(payload: Payload, input: any) {
    const startTime = Date.now()

    try {
      console.log('Starting payment analytics generation...')

      const reportDate = input.reportDate ? new Date(input.reportDate) : new Date()
      reportDate.setHours(0, 0, 0, 0)

      const endDate = new Date(reportDate)
      endDate.setHours(23, 59, 59, 999)

      // Generate daily report
      const report = await JobAnalytics.generateJobReport(payload, 'daily', reportDate, endDate)

      // Export to CSV
      const csvExport = await JobAnalytics.exportAnalyticsToCSV(report.details)

      const duration = Date.now() - startTime

      return {
        success: true,
        message: `Payment analytics generated successfully in ${duration}ms`,
        data: {
          reportId: report.reportId,
          summary: report.summary,
          recommendations: report.recommendations,
          csvExport,
        },
        executionTime: duration,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error('Payment analytics generation failed:', error)

      return {
        success: false,
        message: `Payment analytics generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: duration,
      }
    }
  },
}
