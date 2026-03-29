import Link from 'next/link'

export default function AuditLogPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/admin" className="hover:underline">Admin</Link>
          {' / '}
          <span>Audit Log</span>
        </nav>
        <h1 className="text-xl font-semibold">Audit Log</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Audit log viewer coming in P1 (issue #10).
      </p>
    </div>
  )
}
