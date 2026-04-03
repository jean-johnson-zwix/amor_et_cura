'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, X, ExternalLink, Sparkles } from 'lucide-react'
import { updateFollowUpStatus } from './follow-up-actions'

export type FollowUp = {
  id: string
  client_id: string
  visit_id: string
  description: string
  category: 'Referral' | 'Medical' | 'Document' | 'Financial' | 'Check-in'
  suggested_due_date: string | null
  created_at: string
  client_first_name: string
  client_last_name: string
  visit_date: string
}

const CATEGORY_STYLES: Record<FollowUp['category'], { bg: string; color: string }> = {
  Referral:   { bg: '#FFF7ED', color: '#C2400A' },  // primary orange
  Medical:    { bg: '#FEF2F2', color: '#DC2626' },  // danger red
  Document:   { bg: '#FFFBEB', color: '#D97706' },  // amber
  Financial:  { bg: '#FFF8E7', color: '#B58000' },  // gold
  'Check-in': { bg: '#F0ECE8', color: '#6B7280' },  // warm neutral
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PendingFollowUps({ initialFollowUps }: { initialFollowUps: FollowUp[] }) {
  const [followUps, setFollowUps] = useState<FollowUp[]>(initialFollowUps)
  const [isPending, startTransition] = useTransition()
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()

  function handleAction(id: string, status: 'accepted' | 'dismissed') {
    setProcessingId(id)
    startTransition(async () => {
      const result = await updateFollowUpStatus(id, status)
      if (!result.error) {
        setFollowUps((prev) => prev.filter((f) => f.id !== id))
        router.refresh()
      }
      setProcessingId(null)
    })
  }

  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white">
      <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-teal shrink-0" />
          <p className="text-base font-bold text-navy">Pending follow-ups</p>
          {followUps.length > 0 && (
            <span className="rounded-full bg-teal-light px-2 py-0.5 text-xs font-bold text-[#C2400A]">
              {followUps.length}
            </span>
          )}
        </div>
        <p className="text-sm text-[#6b7280]">AI-suggested from case notes</p>
      </div>

      {followUps.length === 0 ? (
        <p className="px-5 py-8 text-center text-base text-[#6b7280]">
          No pending follow-ups. Save a visit note to generate suggestions.
        </p>
      ) : (
        <div className="divide-y divide-[#f1f5f9]">
          {followUps.map((fu) => {
            const categoryStyle = CATEGORY_STYLES[fu.category] ?? CATEGORY_STYLES['Check-in']
            const isProcessing = processingId === fu.id && isPending

            return (
              <div key={fu.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Client name + visit date */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Link
                        href={`/clients/${fu.client_id}`}
                        className="text-sm font-bold text-navy hover:underline"
                      >
                        {fu.client_first_name} {fu.client_last_name}
                      </Link>
                      <span className="text-xs text-[#9ca3af]">·</span>
                      <span className="text-xs text-[#6b7280]">Visit on {formatDate(fu.visit_date)}</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[#374151] mb-2">{fu.description}</p>

                    {/* Category badge + due date */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ background: categoryStyle.bg, color: categoryStyle.color }}
                      >
                        {fu.category}
                      </span>
                      {fu.suggested_due_date && (
                        <span className="text-xs text-[#6b7280]">
                          Suggested by {formatDate(fu.suggested_due_date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction(fu.id, 'active')}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-teal px-3 text-sm font-semibold text-white hover:bg-[#D45228] disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle className="size-3.5" />
                    {isProcessing ? 'Saving…' : 'Accept'}
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction(fu.id, 'dismissed')}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm font-semibold text-[#6b7280] hover:bg-[#f9fafb] disabled:opacity-50 transition-colors"
                  >
                    <X className="size-3.5" />
                    Dismiss
                  </button>
                  <Link
                    href={`/clients/${fu.client_id}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-teal hover:underline"
                  >
                    <ExternalLink className="size-3.5" />
                    View client
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
