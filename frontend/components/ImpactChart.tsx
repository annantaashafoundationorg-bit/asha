'use client'

// Lightweight bar chart — no external library required
interface ImpactChartProps {
  title: string
  data: { label: string; value: number; max?: number }[]
  color?: string
}

export function ImpactChart({ title, data, color = '#4f7dff' }: ImpactChartProps) {
  const maxVal = Math.max(...data.map((d) => d.max ?? d.value), 1)

  return (
    <div className="rounded-2xl border border-line bg-panel p-5">
      <p className="text-sm font-medium text-text mb-4">{title}</p>
      <div className="space-y-3">
        {data.map((item) => {
          const pct = ((item.value / maxVal) * 100).toFixed(1)
          return (
            <div key={item.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted">{item.label}</span>
                <span className="text-text font-medium">{item.value.toLocaleString()}</span>
              </div>
              <div className="h-1.5 rounded-full bg-line overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
