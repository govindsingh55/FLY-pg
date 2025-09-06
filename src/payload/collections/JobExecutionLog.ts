import type { CollectionConfig } from 'payload'

export const JobExecutionLog: CollectionConfig = {
  slug: 'job-execution-logs',
  admin: {
    useAsTitle: 'jobName',
    defaultColumns: ['jobName', 'status', 'startTime', 'duration', 'success'],
    group: 'System',
  },
  access: {
    read: () => true, // Allow reading for monitoring
    create: () => true, // Allow creating logs
    update: () => false, // Logs should be immutable
    delete: () => false, // Logs should be immutable
  },
  fields: [
    {
      name: 'jobName',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'jobId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Running', value: 'running' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      index: true,
    },
    {
      name: 'success',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      index: true,
    },
    {
      name: 'startTime',
      type: 'date',
      required: true,
      index: true,
    },
    {
      name: 'endTime',
      type: 'date',
      index: true,
    },
    {
      name: 'duration',
      type: 'number',
      label: 'Duration (ms)',
    },
    {
      name: 'retryCount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'maxRetries',
      type: 'number',
      defaultValue: 3,
    },
    {
      name: 'errorMessage',
      type: 'textarea',
    },
    {
      name: 'input',
      type: 'json',
      label: 'Job Input Data',
    },
    {
      name: 'output',
      type: 'json',
      label: 'Job Output Data',
    },
    {
      name: 'queue',
      type: 'text',
      index: true,
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 0,
    },
  ],
  timestamps: true,
}
