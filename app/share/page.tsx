import { getSupabaseServer } from '@/lib/supabase-server'
import { computeStandings } from '@/lib/standings'
import type { Match, Player } from '@/types'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'
import { CopyLinkButton } from './CopyLinkButton'

export const metadata = { title: 'Standings' }

export default async function SharePage() {
  const db = await getSupabaseServer()

  const [{ data: players }, { data: rawMatches }] = await Promise.all([
    db.from('players').select('*'),
    db.from('matches').select('*').eq('stage', 'league'),
  ])

  const playerList = (players ?? []) as Player[]
  const matchList  = (rawMatches ?? []) as Match[]
  const standings  = computeStandings(playerList, matchList)

  const now = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-dvh bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-card overflow-hidden shadow-modal">

        {/* Card header */}
        <div className="px-5 py-5 border-b border-border text-center">
          <p className="text-3xl mb-1">🏆</p>
          <h1 className="text-base font-bold text-text">PES Tournament</h1>
          <p className="text-xs text-text-muted mt-0.5">{now}</p>
        </div>

        {/* Standings table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-raised text-[10px] uppercase tracking-wider text-text-faint">
                <th className="w-1 py-2" />
                <th className="py-2 pr-2 text-right w-6">#</th>
                <th className="py-2 pr-3 text-left">Player</th>
                {['P','W','D','L','GD','PTS'].map((h) => (
                  <th key={h} className="py-2 px-1.5 text-right w-7">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {standings.map((s) => (
                <tr key={s.player.id} className="border-b border-border/40 last:border-0">
                  {/* Qualified accent bar */}
                  <td className="relative w-1 py-2.5">
                    {s.qualified && (
                      <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r-full" />
                    )}
                  </td>
                  <td className="py-2.5 pr-2 text-right text-text-faint tabular-nums">{s.position}</td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <PlayerAvatar player={s.player} size="sm" />
                      <span className="text-text font-medium truncate">{s.player.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-1.5 text-right text-text-muted tabular-nums">{s.played}</td>
                  <td className="py-2.5 px-1.5 text-right text-win tabular-nums">{s.won}</td>
                  <td className="py-2.5 px-1.5 text-right text-text-muted tabular-nums">{s.drawn}</td>
                  <td className="py-2.5 px-1.5 text-right text-loss tabular-nums">{s.lost}</td>
                  <td className={[
                    'py-2.5 px-1.5 text-right tabular-nums',
                    s.goal_difference > 0 ? 'text-win' : s.goal_difference < 0 ? 'text-loss' : 'text-text-muted',
                  ].join(' ')}>
                    {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-bold text-text tabular-nums">{s.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <span className="text-[10px] text-text-faint">pestourney.netlify.app</span>
          <CopyLinkButton />
        </div>
      </div>
    </div>
  )
}
