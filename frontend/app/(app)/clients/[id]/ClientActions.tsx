'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, PowerOff, Power } from 'lucide-react'
import { setClientActive } from './actions'

export default function ClientActions({
  clientId,
  isActive,
  canEdit,
  canDeactivate,
}: {
  clientId: string
  isActive: boolean
  canEdit: boolean
  canDeactivate: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <button
          onClick={() => router.push(`/clients/${clientId}/edit`)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] font-medium text-[#1f2937] transition-colors hover:bg-teal-tint"
        >
          <Pencil className="size-3.5" />
          Edit
        </button>
      )}
      {canDeactivate && (
        <button
          disabled={isPending}
          onClick={() => {
            if (
              confirm(
                isActive
                  ? 'Deactivate this client? They will no longer appear in the active client list.'
                  : 'Reactivate this client?'
              )
            ) {
              startTransition(() => setClientActive(clientId, !isActive))
            }
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-pink-light px-3 text-[13px] font-medium text-pink-accent transition-colors hover:bg-pink-200 disabled:opacity-50"
        >
          {isActive ? (
            <><PowerOff className="size-3.5" />Deactivate</>
          ) : (
            <><Power className="size-3.5" />Reactivate</>
          )}
        </button>
      )}
    </div>
  )
}
