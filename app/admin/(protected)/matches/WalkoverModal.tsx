'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Match, Player } from '@/types'
import { declareWalkover } from '@/actions/matches'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'

interface WalkoverModalProps {
  match: Match & { player_a_data: Player; player_b_data: Player }
  onClose: () => void
}

export function WalkoverModal({ match, onClose }: WalkoverModalProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(declareWalkover, null)

  useEffect(() => {
    if (state !== null && !state?.error) {
      router.refresh()
      onClose()
    }
  }, [state, router, onClose])

  const players = [match.player_a_data, match.player_b_data]

  return (
    <Modal open onClose={onClose} title="Declare Walkover">
      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="id" value={match.id} />

        <p className="text-sm text-text-muted">Select the player who wins by walkover (3–0):</p>

        <div className="flex flex-col gap-2">
          {players.map((player) => (
            <label
              key={player.id}
              className="flex items-center gap-3 p-3 bg-surface-raised border border-border rounded-lg cursor-pointer hover:border-accent transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent/5"
            >
              <input
                type="radio"
                name="walkover_winner"
                value={player.id}
                required
                className="accent-accent"
              />
              <PlayerAvatar player={player} size="sm" />
              <span className="text-sm font-medium text-text">{player.name}</span>
            </label>
          ))}
        </div>

        {state?.error && <FormError message={state.error} />}

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={isPending} className="flex-1">
            Confirm Walkover
          </Button>
        </div>
      </form>
    </Modal>
  )
}
