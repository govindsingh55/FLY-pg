import { NotificationCenter } from '@/components/dashboard/NotificationCenter'

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">Stay updated with your latest notifications and updates</p>
      </div>

      <NotificationCenter maxNotifications={100} />
    </div>
  )
}
