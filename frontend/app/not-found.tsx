import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="text-center flex flex-col items-center gap-4">
        <p className="text-5xl font-semibold text-muted-foreground/40">404</p>
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/clients"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Go to Clients
        </Link>
      </div>
    </div>
  )
}
