import canUseDOM from './canUseDom'

export const getServerSideURL = () => {
  // Use NEXT_PUBLIC_SITE_URL or fallback to localhost for development
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
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
