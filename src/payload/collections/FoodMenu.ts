import type { AccessArgs } from 'payload'

const foodMenuAccess = {
  create: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string } | undefined
    return user?.role === 'admin' || user?.role === 'manager'
  },
  update: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string } | undefined
    return user?.role === 'admin' || user?.role === 'manager'
  },
  delete: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string } | undefined
    return user?.role === 'admin' || user?.role === 'manager'
  },
  read: () => true,
}
import type { CollectionConfig } from 'payload'

const FoodMenu: CollectionConfig = {
  slug: 'food-menu',
  admin: { useAsTitle: 'name' },
  access: foodMenuAccess,
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'description',
      type: 'richText',
      required: true,
    },
  ],
}

export default FoodMenu
