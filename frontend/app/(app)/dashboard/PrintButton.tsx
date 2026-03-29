'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted print:hidden"
    >
      Print / Save PDF
    </button>
  )
}
