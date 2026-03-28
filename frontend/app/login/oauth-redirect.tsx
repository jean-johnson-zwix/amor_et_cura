'use client'

import { useEffect } from 'react'
import { exchangeOAuthCode } from './actions'

export function OAuthRedirect({ code }: { code: string }) {
  useEffect(() => {
    exchangeOAuthCode(code)
  }, [code])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-500">Completing sign in…</p>
    </div>
  )
}
