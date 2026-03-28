import Link from 'next/link'
import CsvImporter from './CsvImporter'

export default function ImportClientsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/clients" className="hover:underline">Clients</Link>
          {' / '}
          <span>Import CSV</span>
        </nav>
        <h1 className="text-xl font-semibold">Import clients from CSV</h1>
      </div>
      <CsvImporter />
    </div>
  )
}
