'use client'

import { useActionState, useEffect, useRef } from 'react'
import { login } from '@/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginForm() {
  const [state, action, isPending] = useActionState(login, null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!state?.error || !cardRef.current) return
    const el = cardRef.current
    // Remove then re-add so the animation replays on repeated wrong attempts
    el.classList.remove('animate-shake')
    void el.offsetWidth  // force reflow
    el.classList.add('animate-shake')
    const cleanup = () => el.classList.remove('animate-shake')
    el.addEventListener('animationend', cleanup, { once: true })
  }, [state?.error])

  return (
    <div
      ref={cardRef}
      className="bg-surface border border-border rounded-card px-8 py-10 flex flex-col gap-6"
    >
      <h1 className="text-xl font-bold text-accent text-center tracking-wide">
        PES Tournament
      </h1>

      <form action={action} className="flex flex-col gap-4">
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          error={state?.error}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isPending}
          className="w-full mt-1"
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  )
}
