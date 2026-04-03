'use client'

import { use, useActionState } from 'react'
import Link from 'next/link'
import { signIn } from './actions'
import { GoogleSignInButton } from '@/components/google-sign-in-button'

export function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error: callbackError } = use(searchParams)
  const [state, action, pending] = useActionState(signIn, null)
  const error = state?.error ?? (callbackError ? 'Authentication failed. Please try again.' : null)

  const inputClass =
    'h-9 w-full rounded border border-[#E5E7EB] bg-white px-3 text-[13px] text-navy outline-none transition-all focus:border-teal focus:ring-2 focus:ring-teal/20'
  const labelClass = 'mb-1 block text-[11px] font-medium text-[#6B7280]'

  return (
    <div className="rounded border border-[#E5E7EB] bg-white p-8">
      <h2 className="text-[20px] font-bold text-navy">Welcome back</h2>
      <p className="mt-0.5 text-[13px] text-[#6B7280]">Sign in to Amor Et Cura</p>

      <div className="mt-6 space-y-4">
        <GoogleSignInButton />

        <div className="relative flex items-center gap-3">
          <div className="flex-1 border-t border-[#E5E7EB]" />
          <span className="text-[12px] text-[#6b7280]">or</span>
          <div className="flex-1 border-t border-[#E5E7EB]" />
        </div>

        <form action={action} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-[12px] text-red-700">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-9 w-full rounded-lg bg-teal text-[13px] font-medium text-white transition-colors hover:bg-[#D45228] disabled:opacity-60"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-[13px] text-[#6b7280]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-teal hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
