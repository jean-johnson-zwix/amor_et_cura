'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, PowerOff, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/clients/${clientId}/edit`)}
        >
          <Pencil className="size-3.5 mr-1.5" />
          Edit
        </Button>
      )}
      {canDeactivate && (
        <Button
          variant="outline"
          size="sm"
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
          className={isActive ? 'text-destructive hover:text-destructive' : ''}
        >
          {isActive ? (
            <><PowerOff className="size-3.5 mr-1.5" />Deactivate</>
          ) : (
            <><Power className="size-3.5 mr-1.5" />Reactivate</>
          )}
        </Button>
      )}
    </div>
  )
}
