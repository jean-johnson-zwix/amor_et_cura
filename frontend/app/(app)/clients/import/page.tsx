import { Topbar } from '@/components/Topbar'
import CsvImporter from './CsvImporter'

export default function ImportClientsPage() {
  return (
    <>
      <Topbar crumbs={[{ label: 'Clients', href: '/clients' }, { label: 'Import CSV' }]} />
      <div className="p-6">
        <CsvImporter />
      </div>
    </>
  )
}
