'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/login/actions'
import { GoogleSignInButton } from '@/components/google-sign-in-button'

const inputClass =
  'h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] text-navy outline-none transition-all focus:border-teal focus:ring-2 focus:ring-teal/20'
const labelClass = 'mb-1 block text-[11px] text-[#6b7280]'

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, null)

  if (state && 'success' in state) {
    return (
      <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-8 text-center">
        <h2 className="text-[20px] font-semibold text-navy">Check your email</h2>
        <p className="mt-2 text-[13px] text-[#6b7280]">
          We sent a confirmation link to your inbox. Click it to activate your account.
        </p>
        <Link href="/login" className="mt-4 inline-block text-[13px] font-medium text-teal hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-[14px] border border-[#e2e8f0] bg-white p-8">
      <h2 className="text-[20px] font-semibold text-navy">Create your account</h2>
      <p className="mt-0.5 text-[13px] text-[#6b7280]">Join your team on Amor Et Cura</p>

      <div className="mt-6 space-y-4">
        <GoogleSignInButton />

        <div className="relative flex items-center gap-3">
          <div className="flex-1 border-t border-[#e2e8f0]" />
          <span className="text-[12px] text-[#6b7280]">or</span>
          <div className="flex-1 border-t border-[#e2e8f0]" />
        </div>

        <form action={action} className="space-y-4">
          {state?.error && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-[12px] text-red-700">
              {state.error}
            </div>
          )}
          <div>
            <label htmlFor="full_name" className={labelClass}>Full name</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              required
              placeholder="Jane Smith"
              className={inputClass}
            />
          </div>
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
              autoComplete="new-password"
              required
              placeholder="••••••••"
              minLength={8}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-9 w-full rounded-lg bg-teal text-[13px] font-medium text-white transition-colors hover:bg-[#D45228] disabled:opacity-60"
          >
            {pending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-[13px] text-[#6b7280]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-teal hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
