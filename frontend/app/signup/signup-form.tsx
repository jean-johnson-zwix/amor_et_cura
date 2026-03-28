'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/login/actions'
import { GoogleSignInButton } from '@/components/google-sign-in-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, null)

  if (state && 'success' in state) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a confirmation link to your inbox. Click it to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Sign up to start managing your cases</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <GoogleSignInButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-card px-2">or</span>
            </div>
          </div>

          <form action={action} className="space-y-4">
            {state?.error && (
              <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                required
                placeholder="Jane Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
