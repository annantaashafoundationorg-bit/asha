'use client'

import { SectionCard } from '../../components/SectionCard'
import { StatCard } from '../../components/StatCard'

const classProgress = [
  { student: 'S-1042', name: 'Priya', nodesCompleted: 12, avgScore: 84, coins: 34 },
  { student: 'S-1043', name: 'Arjun', nodesCompleted: 10, avgScore: 76, coins: 22 },
  { student: 'S-1044', name: 'Meena', nodesCompleted: 14, avgScore: 91, coins: 48 },
  { student: 'S-1045', name: 'Ravi', nodesCompleted: 8, avgScore: 62, coins: 10 },
  { student: 'S-1046', name: 'Sana', nodesCompleted: 11, avgScore: 79, coins: 28 },
]

export default function TeacherPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-aasha">Teacher view</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-text">Class Overview</h1>
        <p className="text-sm text-muted mt-1">Science Grade 7 · Aasha Centre-01 · 22 students</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Class avg score" value="78.4" />
        <StatCard label="Nodes completed" value="55" />
        <StatCard label="Needs remediation" value="4" />
        <StatCard label="Fully mastered" value="18" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Student progress" subtitle="Nodes completed · average score · coins">
          <div className="space-y-2">
            {classProgress.map((s) => (
              <div key={s.student} className="flex items-center justify-between rounded-xl border border-line p-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
                    {s.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{s.name}</p>
                    <p className="text-xs text-muted">{s.nodesCompleted} nodes · avg {s.avgScore}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-medium ${
                      s.avgScore >= 80 ? 'text-success' : s.avgScore >= 70 ? 'text-warning' : 'text-danger'
                    }`}
                  >
                    {s.avgScore >= 80 ? 'On track' : s.avgScore >= 70 ? 'Review' : 'Remediate'}
                  </span>
                  <p className="text-xs text-aasha">{s.coins} coins</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Weak areas in class" subtitle="Tags from assessment weakness reports">
          <div className="space-y-3">
            {[
              { tag: 'application', count: 6, pct: 27 },
              { tag: 'multi-step reasoning', count: 4, pct: 18 },
              { tag: 'unit conversion', count: 3, pct: 14 },
              { tag: 'diagram reading', count: 3, pct: 14 },
            ].map((item) => (
              <div key={item.tag}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted capitalize">{item.tag}</span>
                  <span className="text-text">{item.count} students ({item.pct}%)</span>
                </div>
                <div className="h-1.5 rounded-full bg-line overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
