#!/usr/bin/env node

/**
 * Simple Job Status Checker
 * Uses MongoDB directly to check job status
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { MongoClient } from 'mongodb'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '..', '.env') })

const DATABASE_URI = process.env.DATABASE_URI

if (!DATABASE_URI) {
  console.error('❌ DATABASE_URI not found in environment variables')
  process.exit(1)
}

async function checkJobs() {
  const client = new MongoClient(DATABASE_URI)

  try {
    console.log('🔍 Connecting to database...')
    await client.connect()
    console.log('✅ Connected to database')

    const db = client.db()

    // Check if jobs collection exists
    const collections = await db.listCollections().toArray()
    const jobsCollection = collections.find(
      (c) => c.name.includes('job') || c.name.includes('payload-job'),
    )

    if (!jobsCollection) {
      console.log('⚠️ No jobs collection found')
      console.log('Available collections:')
      collections.forEach((c) => console.log(`  - ${c.name}`))
      return
    }

    console.log(`📋 Found jobs collection: ${jobsCollection.name}`)

    // Get recent jobs
    const jobs = await db
      .collection(jobsCollection.name)
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    console.log(`\n📊 Found ${jobs.length} recent jobs:`)

    jobs.forEach((job, index) => {
      console.log(`\n${index + 1}. Job ID: ${job._id}`)
      console.log(`   Task: ${job.taskSlug || job.task || 'Unknown'}`)
      console.log(`   Status: ${job.taskStatus || job.status || 'Unknown'}`)
      console.log(
        `   Created: ${job.createdAt ? new Date(job.createdAt).toLocaleString() : 'Unknown'}`,
      )

      if (job.output) {
        console.log(`   Output: ${JSON.stringify(job.output, null, 4)}`)
      }

      if (job.error) {
        console.log(`   ❌ Error: ${job.error}`)
      }
    })

    // Check for rent reminder jobs specifically
    const rentJobs = await db
      .collection(jobsCollection.name)
      .find({
        $or: [
          { taskSlug: 'customer-rent-reminder-notification-task' },
          { task: 'customer-rent-reminder-notification-task' },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    console.log(`\n🎯 Rent reminder jobs: ${rentJobs.length}`)

    if (rentJobs.length > 0) {
      console.log('✅ Found rent reminder jobs!')
      rentJobs.forEach((job, index) => {
        console.log(`\n${index + 1}. Rent Job: ${job._id}`)
        console.log(`   Status: ${job.taskStatus || job.status || 'Unknown'}`)
        console.log(
          `   Created: ${job.createdAt ? new Date(job.createdAt).toLocaleString() : 'Unknown'}`,
        )
        if (job.output) {
          console.log(`   Result: ${JSON.stringify(job.output, null, 4)}`)
        }
      })
    }

    // Check customers
    const customersCount = await db.collection('customers').countDocuments()
    const activeCustomersCount = await db
      .collection('customers')
      .countDocuments({ status: 'active' })

    console.log(`\n👥 Customers in database:`)
    console.log(`   Total: ${customersCount}`)
    console.log(`   Active: ${activeCustomersCount}`)

    if (activeCustomersCount === 0) {
      console.log('\n💡 To test rent reminders:')
      console.log('   1. Create customers with status = "active"')
      console.log('   2. Add bookings to those customers')
      console.log('   3. Run: npm run rent-reminders')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.close()
  }
}

checkJobs()
