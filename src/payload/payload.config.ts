// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import Properties from './collections/Properties'
import Rooms from './collections/Rooms'
import Customers from './collections/Customers'
import VisitBookings from './collections/VisitBookings'
import Bookings from './collections/Bookings'
import FoodMenu from './collections/FoodMenu'
import SupportTickets from './collections/SupportTickets'
import SupportMedia from './collections/SupportMedia'
import Payments from './collections/Payments'
import Notifications from './collections/Notifications'
import Amenities from './collections/Amenities'
import Pages from './collections/PagesFixed'
import { resendAdapter } from '@payloadcms/email-resend'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: ['@/payload/components/BeforeDashboard'],
    },
  },
  collections: [
    Users,
    Media,
    Properties,
    Rooms,
    Customers,
    VisitBookings,
    Bookings,
    Payments,
    FoodMenu,
    SupportTickets,
    SupportMedia,
    Notifications,
    Amenities,
    Pages,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [],
  email: resendAdapter({
    defaultFromAddress: process.env.RESEND_FROM_ADDRESS || 'onboarding@resend.dev',
    defaultFromName: process.env.RESEND_FROM_NAME || 'FLY PG',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
})
