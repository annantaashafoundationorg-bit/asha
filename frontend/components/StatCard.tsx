export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4 shadow-panel hover:border-accent/30 transition-colors">
      <div className="text-xs text-muted leading-tight">{label}</div>
      <div className="mt-2 font-display text-2xl font-semibold text-text">{value}</div>
    </div>
  )
}
