import ResetPasswordClientWrapper from './ResetPasswordClientWrapper'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }>
}) {
  const resolved = await searchParams
  const token = resolved?.token
  return <ResetPasswordClientWrapper token={token} />
}
