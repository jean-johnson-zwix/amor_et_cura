import Link from 'next/link'
import ClientRegistrationForm from './ClientRegistrationForm'

export default function NewClientPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/clients" className="hover:underline">Clients</Link>
          {' / '}
          <span>New</span>
        </nav>
        <h1 className="text-xl font-semibold">Register new client</h1>
      </div>
      <ClientRegistrationForm />
    </div>
  )
}
