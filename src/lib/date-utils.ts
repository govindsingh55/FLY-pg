/**
 * Date formatting utilities that are consistent between server and client
 * to prevent hydration mismatches
 */

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toISOString().split('T')[0] // YYYY-MM-DD format
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toISOString().replace('T', ' ').split('.')[0] // YYYY-MM-DD HH:MM:SS format
}

export function formatTime(date: string | Date): string {
  const d = new Date(date)
  return d.toISOString().split('T')[1].split('.')[0] // HH:MM:SS format
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return formatDate(d)
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}

