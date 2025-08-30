#!/usr/bin/env node

console.log('=== Environment Debug Script ===')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
console.log('VERCEL_URL:', process.env.VERCEL_URL)
console.log('VERCEL:', process.env.VERCEL)
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT)
console.log('RENDER:', process.env.RENDER)
console.log('PREVIEW_SECRET:', process.env.PREVIEW_SECRET ? '[SET]' : '[NOT SET]')
console.log('===================================')

// Import and test our functions
import('./src/payload/utilities/getUrl.js')
  .then(({ getServerSideURL }) => {
    console.log('getServerSideURL() returns:', getServerSideURL())
  })
  .catch((err) => {
    console.log('Error importing getUrl:', err.message)
  })
