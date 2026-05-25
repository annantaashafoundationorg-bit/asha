'use client'

import { StatCard } from '../../components/StatCard'
import { SectionCard } from '../../components/SectionCard'

const centres = [
  { id: 'aasha-centre-01', name: 'Aasha Centre 01', students: 340, nodes: 1_450, reuse: '76%', status: 'active' },
  { id: 'aasha-centre-02', name: 'Aasha Centre 02', students: 280, nodes: 1_200, reuse: '71%', status: 'active' },
  { id: 'aasha-centre-03', name: 'Aasha Centre 03', students: 390, nodes: 1_680, reuse: '78%', status: 'active' },
  { id: 'aasha-centre-04', name: 'Aasha Centre 04', students: 270, nodes: 1_270, reuse: '68%', status: 'active' },
]

export default function ImpactPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-aasha">NGO Impact</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-text">
          Annanth Aasha Foundation — Impact Report
        </h1>
        <p className="text-sm text-muted mt-1">Real-time learning impact across all Aasha centres</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Students supported" value="1,280" />
        <StatCard label="TLN nodes generated" value="5,600+" />
        <StatCard label="Asset reuse rate" value="73%" />
        <StatCard label="Verified records" value="7,200" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Centre-level breakdown" subtitle="Active learning centres">
          <div className="space-y-3">
            {centres.map((c) => (
              <div key={c.id} className="rounded-xl border border-line p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text">{c.name}</p>
                  <span className="rounded-full bg-success/10 border border-success/20 px-2 py-0.5 text-xs text-success">
                    {c.status}
                  </span>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-muted">
                  <span>{c.students} students</span>
                  <span>{c.nodes.toLocaleString()} nodes</span>
                  <span>Reuse {c.reuse}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Impact metrics" subtitle="Foundation-wide aggregates">
          <div className="space-y-4">
            {[
              { label: 'Asset reuse rate', value: 73, unit: '%', color: 'bg-success' },
              { label: 'Simulation fallback rate', value: 8, unit: '%', color: 'bg-warning' },
              { label: 'Assessments passed on first attempt', value: 68, unit: '%', color: 'bg-accent' },
              { label: 'Nodes with verified records', value: 84, unit: '%', color: 'bg-aasha' },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">{m.label}</span>
                  <span className="text-text font-medium">{m.value}{m.unit}</span>
                </div>
                <div className="h-1.5 rounded-full bg-line overflow-hidden">
                  <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-aasha/20 bg-aasha/5 p-4">
            <p className="text-xs text-aasha uppercase tracking-wider font-medium">Impact statement</p>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Every TLN node generated at an Aasha centre is reusable by any other class, school,
              or visiting learner. One book creates infrastructure for many.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
