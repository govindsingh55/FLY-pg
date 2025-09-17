import config from '@payload-config'
import { getPayload, Payload } from 'payload'

interface TriggerRentReminderRequest {
  force?: boolean
  dryRun?: boolean
}

// Helper function to validate admin access
const validateAdminAccess = (req: Request): boolean => {
  const authHeader = req.headers.get('authorization')
  const adminToken = process.env.JOB_TRIGGER_API_TOKEN

  if (!adminToken) {
    console.error('❌ [ROUTE] JOB_TRIGGER_API_TOKEN not configured')
    return false
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('⚠️ [ROUTE] Invalid authorization header format')
    return false
  }

  const token = authHeader.replace('Bearer ', '')
  if (token !== adminToken) {
    console.warn('⚠️ [ROUTE] Invalid API token provided')
    return false
  }

  return true
}

// Helper function to get payload instance
const getPayloadInstance = async () => {
  return await getPayload({ config })
}

// Core rent reminder notification logic
const executeRentReminderNotification = async (payload: Payload) => {
  try {
    console.log('🚀 [ROUTE] Starting customer rent reminder notification job scheduling...')
    console.log('📋 [ROUTE] Job details:', {
      task: 'customer-rent-reminder-notification-task',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    })

    const job = await payload.jobs.queue({
      task: 'customer-rent-reminder-notification-task',
      input: {},
    })

    console.log('✅ [ROUTE] Job queued successfully:', {
      jobId: job.id,
      queuedAt: new Date().toISOString(),
    })

    return {
      success: true,
      message: 'Customer rent reminder notification scheduled successfully',
      jobId: job.id,
    }
  } catch (error) {
    console.error('❌ [ROUTE] Error in customer rent reminder notification job:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })

    return {
      success: false,
      message: 'Customer rent reminder notification job failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  try {
    console.log(`🔐 [ROUTE-${requestId}] Validating admin access...`)

    // Validate admin access
    if (!validateAdminAccess(req)) {
      console.warn(`⚠️ [ROUTE-${requestId}] Unauthorized access attempt:`, {
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        timestamp: new Date().toISOString(),
      })

      return Response.json(
        {
          success: false,
          message: 'Unauthorized access. Admin privileges required.',
          error: 'INSUFFICIENT_PERMISSIONS',
        },
        { status: 401 },
      )
    }

    console.log(`✅ [ROUTE-${requestId}] Admin access validated successfully`)

    // Parse request body
    let requestBody: TriggerRentReminderRequest = {}
    try {
      requestBody = await req.json()
      console.log(`📝 [ROUTE-${requestId}] Request body parsed:`, requestBody)
    } catch (_error) {
      // If no body is provided, use defaults
      requestBody = {}
      console.log(`📝 [ROUTE-${requestId}] No request body provided, using defaults`)
    }

    const { dryRun = false } = requestBody
    console.log(`🎯 [ROUTE-${requestId}] Request parameters:`, { dryRun })

    // Get payload instance
    console.log(`🔧 [ROUTE-${requestId}] Initializing Payload instance...`)
    const payload = await getPayloadInstance()
    console.log(`✅ [ROUTE-${requestId}] Payload instance initialized successfully`)

    // If dry run, just return success without executing
    if (dryRun) {
      console.log(`🧪 [ROUTE-${requestId}] Dry run mode - skipping job execution`)
      return Response.json({
        success: true,
        message: 'Dry run completed. Job would be triggered successfully.',
      })
    }

    // Execute the rent reminder notification logic directly
    console.log(`🚀 [ROUTE-${requestId}] Executing rent reminder notification logic...`)
    const result = await executeRentReminderNotification(payload)

    const duration = Date.now() - startTime
    console.log(`✅ [ROUTE-${requestId}] Request completed successfully in ${duration}ms:`, {
      success: result.success,
      jobId: result.jobId,
      duration: `${duration}ms`,
    })

    return Response.json({
      success: true,
      message: 'Payment rent reminder notification task executed successfully.',
      result,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ [ROUTE-${requestId}] Error triggering rent reminder notification task:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })

    return Response.json(
      {
        success: false,
        message: 'Failed to trigger payment rent reminder notification task.',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    )
  }
}
