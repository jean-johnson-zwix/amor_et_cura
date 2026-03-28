import Link from 'next/link'

export default function AppNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-5xl font-semibold text-muted-foreground/40">404</p>
      <h1 className="text-xl font-semibold">Not found</h1>
      <p className="text-sm text-muted-foreground max-w-xs">
        This record does not exist or may have been removed.
      </p>
      <Link
        href="/clients"
        className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        Back to Clients
      </Link>
    </div>
  )
}
