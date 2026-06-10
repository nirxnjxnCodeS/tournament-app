'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { startLeague } from '@/actions/tournament'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { FormError } from '@/components/ui/FormError'

const MIN_PLAYERS = 4

interface StartLeagueButtonProps {
  playerCount: number
}

export function StartLeagueButton({ playerCount }: StartLeagueButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const totalFixtures = Math.floor(playerCount * (playerCount - 1) / 2)

  if (playerCount < MIN_PLAYERS) {
    return (
      <div className="flex items-center gap-3 bg-surface border border-border rounded-card px-4 py-3">
        <span className="text-sm text-text-muted">
          {playerCount} {playerCount === 1 ? 'player' : 'players'} registered. Minimum {MIN_PLAYERS} required.
        </span>
      </div>
    )
  }

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await startLeague()
      if (result?.error) {
        setError(result.error)
      } else {
        setOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Start League
      </Button>

      <Modal
        open={open}
        onClose={() => !isPending && setOpen(false)}
        title="Start League?"
        persistent={isPending}
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-text-muted">
            This will generate all{' '}
            <strong className="text-text">{totalFixtures} fixtures</strong> for{' '}
            {playerCount} players. This cannot be undone.
          </p>

          {error && <FormError message={error} />}

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isPending}
              onClick={handleConfirm}
              className="flex-1"
            >
              Generate fixtures
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
