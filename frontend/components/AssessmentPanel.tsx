'use client'

interface AssessmentPanelProps {
  nodeId: string
  nodeTitle: string
  score?: number
  passed?: boolean
  weaknessTags?: string[]
  recommendation?: string
}

export function AssessmentPanel({
  nodeId,
  nodeTitle,
  score,
  passed,
  weaknessTags = [],
  recommendation,
}: AssessmentPanelProps) {
  const hasResult = score !== undefined

  return (
    <div className="rounded-2xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Combat Assessment</p>
          <h3 className="text-sm font-medium text-text mt-0.5">{nodeTitle}</h3>
          <p className="text-[10px] font-mono text-muted">{nodeId}</p>
        </div>
        {hasResult && (
          <div
            className={`rounded-xl px-4 py-2 text-center border ${
              passed
                ? 'bg-success/10 border-success/30 text-success'
                : 'bg-danger/10 border-danger/30 text-danger'
            }`}
          >
            <p className="text-2xl font-display font-semibold">{score}</p>
            <p className="text-[10px] uppercase">{passed ? 'Pass' : 'Retry'}</p>
          </div>
        )}
      </div>

      {hasResult ? (
        <div className="space-y-3">
          {weaknessTags.length > 0 && (
            <div>
              <p className="text-xs text-muted mb-2">Weakness tags</p>
              <div className="flex gap-2 flex-wrap">
                {weaknessTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-warning/30 bg-warning/5 px-2 py-0.5 text-[10px] text-warning"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {recommendation && (
            <div className="rounded-lg border border-line bg-bg/50 px-3 py-2">
              <p className="text-xs text-muted">
                Recommendation:{' '}
                <span className="text-text">{recommendation.replace(/_/g, ' ')}</span>
              </p>
            </div>
          )}
        </div>
      ) : (
        <button className="w-full rounded-xl border border-accent/30 bg-accent/10 py-3 text-sm font-medium text-accent hover:bg-accent/15 transition-colors">
          Start combat assessment →
        </button>
      )}
    </div>
  )
}
