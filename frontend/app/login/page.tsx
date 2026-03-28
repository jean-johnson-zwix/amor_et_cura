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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Amor et Cura</h1>
          <p className="mt-1 text-sm text-gray-500">Case management built for nonprofits that care</p>
        </div>
        <LoginForm searchParams={searchParams} />
      </div>
    </div>
  )
}
