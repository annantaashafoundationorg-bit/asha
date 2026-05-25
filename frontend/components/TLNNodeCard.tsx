const SUBJECT_COLORS: Record<string, string> = {
  Physics: 'text-accent border-accent/20 bg-accent/5',
  Biology: 'text-success border-success/20 bg-success/5',
  Math: 'text-warning border-warning/20 bg-warning/5',
  Science: 'text-aasha border-aasha/20 bg-aasha/5',
  Chemistry: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
  Geography: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5',
}

interface TLNNodeCardProps {
  nodeId: string
  title: string
  subject: string
  grade?: string
  reused?: boolean
}

export function TLNNodeCard({ nodeId, title, subject, grade, reused }: TLNNodeCardProps) {
  const subjectStyle = SUBJECT_COLORS[subject] || 'text-muted border-line bg-panel'

  return (
    <div className="flex items-center justify-between rounded-xl border border-line p-4 hover:border-accent/30 hover:bg-panelHover transition-all group">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-mono text-muted">{nodeId}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-text group-hover:text-white transition-colors">
            {title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${subjectStyle}`}>
              {subject}
            </span>
            {grade && (
              <span className="text-[10px] text-muted">Grade {grade}</span>
            )}
            {reused !== undefined && (
              <span className={`text-[10px] font-medium ${reused ? 'text-success' : 'text-warning'}`}>
                {reused ? '↻ reused' : '✦ generated'}
              </span>
            )}
          </div>
        </div>
      </div>
      <button className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted hover:border-accent/40 hover:text-accent transition-colors">
        Open →
      </button>
    </div>
  )
}
