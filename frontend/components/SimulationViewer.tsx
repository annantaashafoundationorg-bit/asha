'use client'

interface SimulationViewerProps {
  simulationId: string
  nodeTitle: string
  interactionUrl?: string
  status: 'ready' | 'pending_generation' | 'loading'
}

export function SimulationViewer({
  simulationId,
  nodeTitle,
  interactionUrl,
  status,
}: SimulationViewerProps) {
  return (
    <div className="rounded-2xl border border-line bg-panel overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Simulation</p>
          <h3 className="text-sm font-medium text-text mt-0.5">{nodeTitle}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted">{simulationId}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${
              status === 'ready'
                ? 'text-success border-success/30 bg-success/5'
                : status === 'loading'
                ? 'text-warning border-warning/30 bg-warning/5'
                : 'text-muted border-line'
            }`}
          >
            {status === 'ready' ? 'Ready' : status === 'loading' ? 'Loading' : 'Pending'}
          </span>
        </div>
      </div>

      <div className="h-48 flex items-center justify-center bg-bg/50">
        {status === 'ready' && interactionUrl ? (
          <iframe
            src={interactionUrl}
            className="w-full h-full border-0"
            title={nodeTitle}
          />
        ) : (
          <div className="text-center">
            <p className="text-muted text-sm">
              {status === 'pending_generation'
                ? 'Simulation queued for generation'
                : 'Loading simulation…'}
            </p>
            <p className="text-xs text-muted/60 mt-1">
              {status === 'pending_generation' ? 'Reuse search found no match' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
