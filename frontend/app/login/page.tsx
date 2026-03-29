import { AuthLayout } from '@/components/AuthLayout'
import { LoginForm } from './login-form'
import { OAuthRedirect } from './oauth-redirect'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; code?: string }>
}) {
  const params = await searchParams

  if (params.code) {
    return <OAuthRedirect code={params.code} />
  }

  return (
    <AuthLayout>
      <LoginForm searchParams={searchParams} />
    </AuthLayout>
  )
}
