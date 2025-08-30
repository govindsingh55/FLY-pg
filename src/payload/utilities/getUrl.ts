import canUseDOM from './canUseDom'

export const getServerSideURL = () => {
  // Use NEXT_PUBLIC_SITE_URL if set
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // In production, avoid localhost fallback
  if (process.env.NODE_ENV === 'production') {
    // Try to get from Vercel environment variables
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }

    // Try to get from other common deployment environment variables
    if (process.env.SITE_URL) {
      return process.env.SITE_URL
    }

    // Last resort: log warning and return empty string to force dynamic resolution
    console.warn(
      'No site URL configured for production. Set NEXT_PUBLIC_SITE_URL environment variable.',
    )
    return ''
  }

  // Development fallback
  return 'http://localhost:3000'
}

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  return process.env.NEXT_PUBLIC_SITE_URL || ''
}
