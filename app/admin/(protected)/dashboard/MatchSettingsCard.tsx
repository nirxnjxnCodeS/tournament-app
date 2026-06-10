'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateMatchSettings } from '@/actions/tournament'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'

interface MatchSettingsCardProps {
  leagueDuration: number
  semiDuration:   number
  finalDuration:  number
}

export function MatchSettingsCard({ leagueDuration, semiDuration, finalDuration }: MatchSettingsCardProps) {
  const router = useRouter()
  const [state, action, isPending] = useActionState(updateMatchSettings, null)

  useEffect(() => {
    if (state !== null && !state?.error) router.refresh()
  }, [state, router])

  return (
    <div className="bg-surface border border-border rounded-card px-5 py-5 flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-text">Match Settings</h2>

      <form action={action} className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'League',      name: 'league_match_duration', value: leagueDuration },
            { label: 'Semi-final',  name: 'semi_match_duration',   value: semiDuration   },
            { label: 'Final',       name: 'final_match_duration',  value: finalDuration  },
          ].map(({ label, name, value }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted">{label}</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  name={name}
                  defaultValue={value}
                  min={5}
                  max={30}
                  required
                  className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text tabular-nums focus:outline-none focus:border-accent"
                />
                <span className="text-xs text-text-faint shrink-0">min</span>
              </div>
            </div>
          ))}
        </div>

        {state?.error && <FormError message={state.error} />}

        {state !== null && !state?.error && (
          <p className="text-xs text-win">Settings saved</p>
        )}

        <Button type="submit" variant="secondary" size="sm" loading={isPending} className="self-start">
          Save settings
        </Button>
      </form>
    </div>
  )
}
