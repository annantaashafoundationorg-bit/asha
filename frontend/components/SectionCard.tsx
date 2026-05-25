export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-panel">
      <div className="mb-5">
        <h2 className="font-display text-xl font-semibold text-text">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
