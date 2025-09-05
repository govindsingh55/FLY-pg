'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Monitor,
  Clock,
  CheckCircle,
} from 'lucide-react'

// Import our custom components
import JobMonitoringDashboard from '@/components/admin/JobMonitoringDashboard'
import JobExecutionLogs from '@/components/admin/JobExecutionLogs'
import JobSchedulingManager from '@/components/admin/JobSchedulingManager'
import JobAnalyticsDashboard from '@/components/admin/JobAnalyticsDashboard'

export default function JobsAdminPage() {
  const [activeTab, setActiveTab] = useState('monitoring')

  const tabs = [
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: Monitor,
      description: 'Real-time system health and job status',
    },
    {
      id: 'logs',
      label: 'Execution Logs',
      icon: FileText,
      description: 'Detailed job execution history and logs',
    },
    {
      id: 'scheduling',
      label: 'Scheduling',
      icon: Calendar,
      description: 'Manage job schedules and cron expressions',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Performance metrics and payment analytics',
    },
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Payment System Jobs</h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive monitoring and management interface for payment processing jobs
        </p>
      </div>

      {/* Quick Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">All scheduled jobs active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Execution</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2m ago</div>
            <p className="text-xs text-muted-foreground">Health check job</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Tab Descriptions */}
        <div className="text-sm text-muted-foreground">
          {tabs.find((tab) => tab.id === activeTab)?.description}
        </div>

        {/* Tab Contents */}
        <TabsContent value="monitoring" className="space-y-4">
          <JobMonitoringDashboard />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <JobExecutionLogs />
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-4">
          <JobSchedulingManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <JobAnalyticsDashboard />
        </TabsContent>
      </Tabs>

      {/* Footer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium">Job System Version</div>
              <div className="text-muted-foreground">v1.0.0</div>
            </div>
            <div>
              <div className="font-medium">PayloadCMS Version</div>
              <div className="text-muted-foreground">v3.50.0</div>
            </div>
            <div>
              <div className="font-medium">Last System Update</div>
              <div className="text-muted-foreground">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
