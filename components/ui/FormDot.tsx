// Form dots for the last-5 results strip in the standings table

interface FormDotProps {
  result: 'W' | 'D' | 'L'
}

const dotStyles = {
  W: 'bg-win',
  D: 'bg-draw',
  L: 'bg-loss',
}

const labels = { W: 'Win', D: 'Draw', L: 'Loss' }

export function FormDot({ result }: FormDotProps) {
  return (
    <span
      className={`inline-block size-2.5 rounded-full ${dotStyles[result]}`}
      title={labels[result]}
      aria-label={labels[result]}
    />
  )
}

interface FormStripProps {
  form: ('W' | 'D' | 'L')[]
}

export function FormStrip({ form }: FormStripProps) {
  // Always render 5 slots — pad left with empty if fewer than 5
  const padded: (('W' | 'D' | 'L') | null)[] = [
    ...Array(Math.max(0, 5 - form.length)).fill(null),
    ...form.slice(-5),
  ]

  return (
    <span className="flex items-center gap-1" aria-label={`Form: ${form.join(' ')}`}>
      {padded.map((r, i) =>
        r ? (
          <FormDot key={i} result={r} />
        ) : (
          <span key={i} className="inline-block size-2.5 rounded-full bg-border" aria-hidden />
        ),
      )}
    </span>
  )
}
