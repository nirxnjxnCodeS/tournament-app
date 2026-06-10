'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Match, Player } from '@/types'
import { resetMatch } from '@/actions/matches'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'

interface ResetMatchModalProps {
  match: Match & { player_a_data: Player; player_b_data: Player }
  onClose: () => void
}

export function ResetMatchModal({ match, onClose }: ResetMatchModalProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  async function handleReset() {
    setIsPending(true)
    setError(null)
    const result = await resetMatch(match.id)
    setIsPending(false)
    if (result?.error) {
      setError(result.error)
    } else {
      router.refresh()
      onClose()
    }
  }

  return (
    <Modal open onClose={onClose} title="Reset match" persistent={isPending}>
      <div className="flex flex-col gap-5">
        <p className="text-sm text-text-muted">
          Reset this match to unplayed? This will remove the score and return it to pending.
          This cannot be undone.
        </p>

        {error && <FormError message={error} />}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={isPending}
            onClick={handleReset}
            className="flex-1"
          >
            Reset match
          </Button>
        </div>
      </div>
    </Modal>
  )
}
