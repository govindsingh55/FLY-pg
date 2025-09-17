#!/usr/bin/env node

/**
 * Rent Reminder Notification Trigger Script
 *
 * This script triggers the rent reminder notification job by calling the API endpoint.
 * It can be used for automated scheduling (cron jobs) or manual execution.
 *
 * Usage:
 *   npm run rent-reminders
 *   npm run rent-reminders:dry-run
 *   node scripts/trigger-rent-reminders.js
 *   node scripts/trigger-rent-reminders.js --dry-run
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '..', '.env') })

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const API_TOKEN = process.env.JOB_TRIGGER_API_TOKEN
const API_ENDPOINT = `${BASE_URL}/api/custom/jobs/trigger-rent-reminder`

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run') || args.includes('-d')
const isVerbose = args.includes('--verbose') || args.includes('-v')
const isHelp = args.includes('--help') || args.includes('-h')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

// Logging functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  debug: (msg) => isVerbose && console.log(`${colors.cyan}🔍${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.magenta}🚀 ${msg}${colors.reset}\n`),
}

// Help text
const showHelp = () => {
  console.log(`
${colors.bright}Rent Reminder Notification Trigger Script${colors.reset}

${colors.bright}USAGE:${colors.reset}
  npm run rent-reminders              # Execute rent reminder job
  npm run rent-reminders:dry-run      # Test run without execution
  node scripts/trigger-rent-reminders.js [options]

${colors.bright}OPTIONS:${colors.reset}
  --dry-run, -d    Test the script without actually triggering the job
  --verbose, -v    Enable verbose logging
  --help, -h       Show this help message

${colors.bright}ENVIRONMENT VARIABLES:${colors.reset}
  JOB_TRIGGER_API_TOKEN    Required API token for authentication
  NEXT_PUBLIC_SITE_URL     Base URL (defaults to http://localhost:3000)

${colors.bright}EXAMPLES:${colors.reset}
  # Run the rent reminder job
  npm run rent-reminders

  # Test run (dry run)
  npm run rent-reminders:dry-run

  # Direct script execution with verbose logging
  node scripts/trigger-rent-reminders.js --verbose

  # Dry run with verbose logging
  node scripts/trigger-rent-reminders.js --dry-run --verbose
`)
  process.exit(0)
}

// Validation functions
const validateEnvironment = () => {
  const errors = []

  if (!API_TOKEN) {
    errors.push('JOB_TRIGGER_API_TOKEN environment variable is required')
  }

  if (!BASE_URL) {
    errors.push('NEXT_PUBLIC_SITE_URL environment variable is required')
  }

  if (errors.length > 0) {
    log.error('Environment validation failed:')
    errors.forEach((error) => log.error(`  • ${error}`))
    log.info('\nPlease check your .env file and ensure all required variables are set.')
    process.exit(1)
  }

  log.debug(`Using base URL: ${BASE_URL}`)
  log.debug(`Using API token: ${API_TOKEN.substring(0, 8)}...`)
}

// HTTP request function
const makeRequest = async (url, options) => {
  try {
    const response = await fetch(url, options)
    const data = await response.json()

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
    }
  } catch (error) {
    throw new Error(`Network error: ${error.message}`)
  }
}

// Main execution function
const triggerRentReminders = async () => {
  const startTime = Date.now()

  log.title('Rent Reminder Notification Trigger')

  if (isDryRun) {
    log.warning('Running in DRY RUN mode - no actual job will be executed')
  }

  log.info('Validating environment...')
  validateEnvironment()

  log.info('Preparing API request...')
  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'rent-reminder-script/1.0.0',
    },
    body: JSON.stringify({
      dryRun: isDryRun,
    }),
  }

  log.debug(`Request URL: ${API_ENDPOINT}`)
  log.debug(`Request method: POST`)
  log.debug(`Request headers: ${JSON.stringify(requestOptions.headers, null, 2)}`)
  log.debug(`Request body: ${requestOptions.body}`)

  try {
    log.info(`${isDryRun ? 'Testing' : 'Triggering'} rent reminder notification job...`)

    const result = await makeRequest(API_ENDPOINT, requestOptions)
    const duration = Date.now() - startTime

    if (result.ok) {
      log.success(`${isDryRun ? 'Dry run' : 'Job trigger'} completed successfully!`)

      if (result.data.success) {
        if (isDryRun) {
          log.info('✓ API endpoint is accessible')
          log.info('✓ Authentication is valid')
          log.info('✓ Request format is correct')
          log.info('✓ Job would be triggered successfully')
        } else {
          log.info(`✓ Job queued with ID: ${result.data.jobId || 'N/A'}`)
          log.info('✓ Rent reminder notifications will be processed')
          log.info('✓ Check application logs for detailed execution status')
        }
      } else {
        log.warning(`API responded with success=false: ${result.data.message}`)
      }

      if (isVerbose) {
        log.debug('API Response:')
        console.log(JSON.stringify(result.data, null, 2))
      }
    } else {
      log.error(`API request failed (${result.status} ${result.statusText})`)

      if (result.status === 401) {
        log.error('Authentication failed - please check your JOB_TRIGGER_API_TOKEN')
      } else if (result.status === 404) {
        log.error('API endpoint not found - please check your NEXT_PUBLIC_SITE_URL')
      } else if (result.status >= 500) {
        log.error('Server error - please check application logs')
      }

      if (result.data) {
        log.error(
          `Error details: ${result.data.message || result.data.error || 'No details available'}`,
        )

        if (isVerbose) {
          log.debug('Full error response:')
          console.log(JSON.stringify(result.data, null, 2))
        }
      }

      process.exit(1)
    }
  } catch (error) {
    log.error(`Failed to trigger rent reminders: ${error.message}`)

    if (error.message.includes('ECONNREFUSED')) {
      log.error('Connection refused - is your application running?')
      log.info(`Check that your application is running at: ${BASE_URL}`)
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      log.error('Host not found - please check your NEXT_PUBLIC_SITE_URL')
    }

    if (isVerbose) {
      log.debug('Full error details:')
      console.error(error)
    }

    process.exit(1)
  }

  const duration = Date.now() - startTime

  log.info(`\n${colors.bright}Summary:${colors.reset}`)
  log.info(`  • Mode: ${isDryRun ? 'Dry Run' : 'Live Execution'}`)
  log.info(`  • Duration: ${duration}ms`)
  log.info(`  • Status: ${colors.green}Success${colors.reset}`)

  if (!isDryRun) {
    log.info('\n💡 Monitor your application logs to track job execution progress.')
    log.info('💡 Check the Payload CMS admin panel for job status details.')
  }
}

// Script entry point
const main = async () => {
  // Handle help flag
  if (isHelp) {
    showHelp()
  }

  // Handle process signals
  process.on('SIGINT', () => {
    log.warning('\nReceived SIGINT, exiting...')
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    log.warning('\nReceived SIGTERM, exiting...')
    process.exit(0)
  })

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    log.error(`Uncaught exception: ${error.message}`)
    if (isVerbose) {
      console.error(error)
    }
    process.exit(1)
  })

  process.on('unhandledRejection', (reason, promise) => {
    log.error(`Unhandled rejection at ${promise}: ${reason}`)
    if (isVerbose) {
      console.error(reason)
    }
    process.exit(1)
  })

  // Execute main function
  try {
    await triggerRentReminders()
  } catch (error) {
    log.error(`Script execution failed: ${error.message}`)
    if (isVerbose) {
      console.error(error)
    }
    process.exit(1)
  }
}

// Run the script
main()
