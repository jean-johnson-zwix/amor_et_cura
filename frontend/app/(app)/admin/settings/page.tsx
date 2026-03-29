import Link from 'next/link'

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/admin" className="hover:underline">Admin</Link>
          {' / '}
          <span>Settings</span>
        </nav>
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Service type configuration coming in P1 (issue #9).
      </p>
    </div>
  )
}
