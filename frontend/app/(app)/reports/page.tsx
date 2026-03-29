import ReportGenerator from './ReportGenerator'

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Funder Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-generated narrative reports from your service data — ready to paste into grant applications.
        </p>
      </div>
      <ReportGenerator />
    </div>
  )
}
