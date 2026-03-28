import { SignupForm } from './signup-form'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Amor et Cura</h1>
          <p className="mt-1 text-sm text-gray-500">Create your account</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
