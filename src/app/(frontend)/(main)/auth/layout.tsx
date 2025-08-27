import { ReactNode } from 'react'

// Auth area layout: narrow column with natural scroll and generous vertical padding.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md flex flex-col py-12 px-4 md:px-0 gap-6">{children}</div>
  )
}
