import { getSupabaseServer } from '@/lib/supabase-server'

export const metadata = { title: 'Rules' }

const DEFAULT_SETTINGS = {
  league_match_duration: 10,
  semi_match_duration:   12,
  final_match_duration:  15,
}

export default async function RulesPage() {
  const db = await getSupabaseServer()
  const { data } = await db
    .from('tournament_settings')
    .select('league_match_duration, semi_match_duration, final_match_duration')
    .eq('id', 1)
    .maybeSingle()

  const s = data ?? DEFAULT_SETTINGS

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-8">
      <h1 className="text-lg font-semibold text-text">Tournament Rules</h1>

      <Section title="Match Duration">
        <ul className="flex flex-col gap-1.5 text-sm text-text-muted">
          <li>League matches: <strong className="text-text tabular-nums">{s.league_match_duration} minutes</strong></li>
          <li>Semi-finals: <strong className="text-text tabular-nums">{s.semi_match_duration} minutes</strong></li>
          <li>Finals: <strong className="text-text tabular-nums">{s.final_match_duration} minutes</strong></li>
        </ul>
        <p className="text-xs text-text-faint mt-3">
          Set by admin. All matches use standard eFootball match conditions, balanced for home and away.
        </p>
      </Section>

      <Section title="Network Disconnection">
        <ul className="flex flex-col gap-3 text-sm text-text-muted">
          <li>
            If a match is cut off due to a network issue and the score is level at the time, the match is
            <strong className="text-text"> replayed in full</strong>.
          </li>
          <li>
            If one player was leading when the connection dropped, both players must agree on the result.
            If there is a dispute, the player whose network dropped is deemed to have lost — per the
            eFootball app notification. Report the agreed result to the admin.
          </li>
        </ul>
      </Section>

      <Section title="Match Abandonment">
        <p className="text-sm text-text-muted">
          If a match is abandoned for any reason other than a network disconnection, it results in a
          <strong className="text-text"> draw — points are split 1–1</strong>.
          Report to admin for recording.
        </p>
      </Section>

      <Section title="General">
        <ul className="flex flex-col gap-3 text-sm text-text-muted">
          <li>
            All match conditions must be set to default eFootball settings, balanced equally for home
            and away teams.
          </li>
          <li>
            Any disputes not covered above are resolved by the admin.{' '}
            <strong className="text-text">Admin decision is final.</strong>
          </li>
        </ul>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold text-accent uppercase tracking-wider">{title}</h2>
      <div className="bg-surface border border-border rounded-card px-5 py-4">
        {children}
      </div>
    </section>
  )
}
