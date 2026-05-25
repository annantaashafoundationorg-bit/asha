import { StatCard } from '../components/StatCard'
import { SectionCard } from '../components/SectionCard'
import { TLNNodeCard } from '../components/TLNNodeCard'
import Link from 'next/link'

const stats = [
  { label: 'TLN nodes generated', value: '5,600+' },
  { label: 'Asset reuse rate', value: '73%' },
  { label: 'Centres active', value: '4' },
  { label: 'Students supported', value: '1,280' },
  { label: 'Assessments completed', value: '9,400' },
  { label: 'Verified records', value: '7,200' },
]

const nodes = [
  { nodeId: 'tln-001', title: 'Newton\'s Second Law', subject: 'Physics', grade: '8', reused: true },
  { nodeId: 'tln-002', title: 'Cell Division (Mitosis)', subject: 'Biology', grade: '9', reused: true },
  { nodeId: 'tln-003', title: 'Fractions as Parts of a Whole', subject: 'Math', grade: '6', reused: true },
  { nodeId: 'tln-004', title: 'The Water Cycle', subject: 'Science', grade: '7', reused: false },
]

const pipeline = [
  { step: '01', label: 'Book upload', desc: 'Student arrives with textbook. Chapters are scanned or entered.' },
  { step: '02', label: 'TLN transform', desc: 'Chapters become reusable TLN concept nodes with structured data contracts.' },
  { step: '03', label: 'Asset reuse', desc: 'Visuals and simulations are matched from the semantic registry first.' },
  { step: '04', label: 'Learning path', desc: 'Adaptive sequence built per student level: beginner, standard, advanced.' },
  { step: '05', label: 'Assessment', desc: 'Combat-style mastery checks with remediation and verification.' },
  { step: '06', label: 'Impact record', desc: 'Every session feeds NGO analytics and verified learning records.' },
]

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 space-y-12">

      {/* Hero */}
      <section className="rounded-3xl border border-line bg-gradient-to-br from-panel via-panel to-bg p-10 shadow-panel relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-aasha/5 rounded-full blur-3xl pointer-events-none" />
        <p className="text-xs uppercase tracking-[0.35em] text-aasha font-medium">
          Annanth Aasha Foundation
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-tight text-text max-w-3xl">
          AASHA AI Learning &amp; Impact Ecosystem
        </h1>
        <p className="mt-5 max-w-2xl text-muted leading-relaxed">
          A centre-based AI platform where one student's textbook becomes reusable class-wide
          learning infrastructure — TLN nodes, simulations, adaptive assessments, and verified
          NGO impact records.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/dashboard"
            className="rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white shadow-glow hover:bg-accentGlow transition-colors"
          >
            Open dashboard →
          </Link>
          <Link
            href="/impact"
            className="rounded-xl border border-line px-6 py-3 text-sm font-medium text-muted hover:text-text hover:border-accent/40 transition-colors"
          >
            View impact
          </Link>
        </div>
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </section>

      {/* TLN nodes + pipeline */}
      <section className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="TLN Node Explorer" subtitle="Reusable concept units — live registry sample">
          <div className="space-y-3">
            {nodes.map((node) => (
              <TLNNodeCard key={node.nodeId} {...node} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Execution pipeline" subtitle="Ground-execution at the Aasha centre">
          <ol className="space-y-4">
            {pipeline.map((p) => (
              <li key={p.step} className="flex gap-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent">
                  {p.step}
                </span>
                <div>
                  <p className="text-sm font-medium text-text">{p.label}</p>
                  <p className="text-xs text-muted leading-relaxed">{p.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>
      </section>

      {/* Subsystem cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: 'Asset Reuse Engine',
            desc: 'Semantic registry search before any generation. Cached SVGs, Lottie animations, and simulation templates reused across nodes.',
            tag: 'Reuse-first',
            tagColor: 'text-success',
          },
          {
            title: 'Adaptive Learning',
            desc: 'Three-tier sequencing: beginner guided, standard simulation-first, advanced challenge mode. Memory-aware personalisation.',
            tag: 'Personalised',
            tagColor: 'text-accent',
          },
          {
            title: 'Combat Assessment',
            desc: '10-question rapid-fire checks per TLN node. Threshold 70. Automatic remediation routing and mastery verification.',
            tag: 'Assessment',
            tagColor: 'text-warning',
          },
          {
            title: 'Aasha Coins & XP',
            desc: 'Reward wallet per student. Coins awarded on assessment pass. XP unlocks Seedling → Learner → Scholar → Champion.',
            tag: 'Rewards',
            tagColor: 'text-aasha',
          },
          {
            title: 'Memory System',
            desc: 'Semantic event store per student. Weakness tags and mastery tags feed adaptive sequencing across sessions.',
            tag: 'Memory',
            tagColor: 'text-muted',
          },
          {
            title: 'NGO Impact Analytics',
            desc: 'Centre-level and foundation-level reporting. Reuse rate, node count, verified records — all auditable.',
            tag: 'Impact',
            tagColor: 'text-success',
          },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl border border-line bg-panel p-5 shadow-panel hover:border-accent/30 transition-colors">
            <span className={`text-xs font-medium uppercase tracking-wider ${card.tagColor}`}>
              {card.tag}
            </span>
            <h3 className="mt-2 font-display text-lg font-semibold text-text">{card.title}</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </section>

    </div>
  )
}
