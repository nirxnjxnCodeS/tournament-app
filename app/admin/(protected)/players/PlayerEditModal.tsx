'use client'

import { useActionState, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Player } from '@/types'
import { upsertPlayer } from '@/actions/players'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'

interface PlayerEditModalProps {
  player: Player | null  // null = creating new
  onClose: () => void
}

export function PlayerEditModal({ player, onClose }: PlayerEditModalProps) {
  const router = useRouter()
  const [state, action, isPending] = useActionState(upsertPlayer, null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(player?.badge_url ?? null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [colorValue, setColorValue] = useState(player?.primary_color ?? '#ffffff')

  // Close and refresh on success
  useEffect(() => {
    if (state && !state.error) {
      router.refresh()
      onClose()
    }
  }, [state, router, onClose])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 200 * 1024) {
      setPreviewError('Badge must be under 200 KB')
      e.target.value = ''
      return
    }

    setPreviewError(null)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  // Preview player for avatar component
  const previewPlayer: Player = {
    id: player?.id ?? 'preview',
    name: 'Preview',
    badge_url: previewUrl,
    primary_color: colorValue,
    created_at: '',
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={player ? 'Edit player' : 'Add player'}
    >
      <form action={action} className="flex flex-col gap-4">
        {player && <input type="hidden" name="id" value={player.id} />}

        {/* Badge upload */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-muted">Badge</span>
          <div className="flex items-center gap-4">
            <PlayerAvatar player={previewPlayer} size="xl" showRing />
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? 'Replace' : 'Upload'}
              </Button>
              <p className="text-xs text-text-faint">PNG, JPG · max 200 KB</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            name="badge"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="sr-only"
          />
          {previewError && <FormError message={previewError} />}
        </div>

        <Input
          label="Name"
          name="name"
          defaultValue={player?.name ?? ''}
          placeholder="Player name"
          required
          maxLength={50}
          error={state?.error?.includes('Name') ? state.error : undefined}
        />

        {/* Color picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-muted">
            Primary color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={colorValue}
              onChange={(e) => setColorValue(e.target.value)}
              className="size-9 rounded-lg border border-border bg-surface-raised cursor-pointer p-0.5"
              aria-label="Pick color"
            />
            <input
              type="text"
              name="primary_color"
              value={colorValue}
              onChange={(e) => setColorValue(e.target.value)}
              pattern="^#[0-9a-fA-F]{6}$"
              maxLength={7}
              className="flex-1 bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent"
              aria-label="Hex color value"
            />
          </div>
          {state?.error?.includes('color') && <FormError message={state.error} />}
        </div>

        {state?.error && !state.error.includes('Name') && !state.error.includes('color') && (
          <FormError message={state.error} />
        )}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isPending} className="flex-1">
            {player ? 'Save' : 'Add player'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
