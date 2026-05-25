interface RewardBadgeProps {
  coins: number
  xp: number
  level: string
}

const LEVEL_COLOR: Record<string, string> = {
  Seedling: 'text-muted border-muted/30 bg-muted/5',
  Learner: 'text-success border-success/30 bg-success/5',
  Explorer: 'text-accent border-accent/30 bg-accent/5',
  Scholar: 'text-warning border-warning/30 bg-warning/5',
  Champion: 'text-aasha border-aasha/30 bg-aasha/5',
}

export function RewardBadge({ coins, xp, level }: RewardBadgeProps) {
  const style = LEVEL_COLOR[level] || LEVEL_COLOR['Seedling']

  return (
    <div className={`rounded-2xl border px-5 py-4 text-right ${style}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-70">{level}</p>
      <p className="mt-1 text-2xl font-display font-semibold">{coins}</p>
      <p className="text-xs opacity-60">Aasha Coins · {xp} XP</p>
    </div>
  )
}
