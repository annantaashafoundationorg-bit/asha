'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SectionCard } from '../../components/SectionCard'
import { RewardBadge } from '../../components/RewardBadge'

interface Book {
  id: string
  title: string
  grade: string
  subject: string
  node_count: number
}

interface TLNNode {
  node_id: string
  book_id: string
  title: string
  concept: string
  grade: string
  subject: string
}

interface Wallet {
  student_id: string
  aasha_coins: number
  xp: number
  level: string
  badges: string[]
}

interface Session {
  student_id: string
  node_id: string
  level: string
  sequence: string[]
  next_action: string
  estimated_minutes: number
  simulation_id?: string
}

interface AssessmentResult {
  student_id: string
  node_id: string
  score: number
  passed: boolean
  weakness_tags: string[]
  recommendation: string
  coins_awarded: number
  xp_awarded: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const STUDENT_ID = 'S-1042'

export default function StudentPage() {
  const [wallet, setWallet] = useState<Wallet>({
    student_id: STUDENT_ID,
    aasha_coins: 0,
    xp: 0,
    level: 'Seedling',
    badges: [],
  })

  const [books, setBooks] = useState<Book[]>([])
  const [nodes, setNodes] = useState<TLNNode[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string>('')
  const [selectedNode, setSelectedNode] = useState<TLNNode | null>(null)
  
  // Learning session state
  const [session, setSession] = useState<Session | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const [sessionLevel, setSessionLevel] = useState<string>('standard')
  const [startingSession, setStartingSession] = useState(false)

  // Assessment state
  const [runningAssessment, setRunningAssessment] = useState(false)
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  const [completedNodes, setCompletedNodes] = useState<{nodeId: string, title: string, score: number, mastered: boolean}[]>([])

  // Fetch student wallet on load
  const fetchWallet = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rewards/${STUDENT_ID}`)
      if (res.ok) {
        const data = await res.json()
        setWallet(data)
      }
    } catch (err) {
      console.error('Error fetching wallet:', err)
    }
  }

  // Fetch all books
  const fetchBooks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/books`)
      if (res.ok) {
        const data = await res.json()
        setBooks(data)
        if (data.length > 0) {
          setSelectedBookId(data[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching books:', err)
    }
  }

  // Fetch nodes for selected book
  const fetchNodesForBook = async (bookId: string) => {
    if (!bookId) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/books/${bookId}/nodes`)
      if (res.ok) {
        const data = await res.json()
        setNodes(data)
        if (data.length > 0) {
          setSelectedNode(data[0])
        } else {
          setSelectedNode(null)
        }
      }
    } catch (err) {
      console.error('Error fetching nodes:', err)
    }
  }

  useEffect(() => {
    fetchWallet()
    fetchBooks()
  }, [])

  useEffect(() => {
    if (selectedBookId) {
      fetchNodesForBook(selectedBookId)
    }
  }, [selectedBookId])

  // Start Adaptive Learning Session
  const startSession = async () => {
    if (!selectedNode) return
    try {
      setStartingSession(true)
      setAssessmentResult(null)
      const res = await fetch(`${API_BASE_URL}/api/learn/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: STUDENT_ID,
          node_id: selectedNode.node_id,
          level: sessionLevel,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSession(data)
        setCurrentStepIndex(0)
      }
    } catch (err) {
      console.error('Error starting session:', err)
    } finally {
      setStartingSession(false)
    }
  }

  // Run Mastery Check Assessment
  const runMasteryAssessment = async () => {
    if (!selectedNode) return
    try {
      setRunningAssessment(true)
      const res = await fetch(`${API_BASE_URL}/api/assess/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: STUDENT_ID,
          node_id: selectedNode.node_id,
          assessment_type: 'combat',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setAssessmentResult(data)
        
        // Add to completed list
        setCompletedNodes(prev => [
          {
            nodeId: data.node_id,
            title: selectedNode.title,
            score: data.score,
            mastered: data.passed
          },
          ...prev.filter(n => n.nodeId !== data.node_id)
        ])

        // Refresh wallet
        fetchWallet()
      }
    } catch (err) {
      console.error('Error running assessment:', err)
    } finally {
      setRunningAssessment(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-aasha">Student dashboard</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-text">Welcome Back, Learner!</h1>
          <p className="text-sm text-muted mt-1">ID: {STUDENT_ID} · Annanth Aasha Foundation</p>
        </div>
        <RewardBadge coins={wallet.aasha_coins} xp={wallet.xp} level={wallet.level} />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Textbook Selection & Navigation */}
        <div className="lg:col-span-5 space-y-6">
          <SectionCard title="Select Textbook & Topic" subtitle="Choose what you want to study today">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Textbook</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-text focus:border-accent focus:outline-none transition-colors"
                >
                  <option value="" disabled>-- Select Textbook --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Topic / Node</label>
                {nodes.length === 0 ? (
                  <p className="text-xs text-muted">No topics available in this textbook.</p>
                ) : (
                  <div className="grid gap-2 max-h-60 overflow-y-auto pr-1">
                    {nodes.map((node) => (
                      <div
                        key={node.node_id}
                        onClick={() => {
                          setSelectedNode(node)
                          setSession(null)
                          setAssessmentResult(null)
                        }}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                          selectedNode?.node_id === node.node_id
                            ? 'border-accent bg-accent/5'
                            : 'border-line hover:border-accent/20'
                        }`}
                      >
                        <p className="text-xs font-mono text-accent">{node.node_id}</p>
                        <p className="text-sm font-semibold text-text mt-0.5">{node.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedNode && (
                <div className="pt-2 border-t border-line space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Personalisation Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['beginner', 'standard', 'advanced'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSessionLevel(lvl)}
                          className={`rounded-lg py-1.5 text-xs font-medium border capitalize ${
                            sessionLevel === lvl
                              ? 'border-accent bg-accent/10 text-text'
                              : 'border-line text-muted hover:border-line/60'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={startSession}
                    disabled={startingSession}
                    className="w-full rounded-xl bg-accent px-4 py-2.5 text-xs font-medium text-white shadow-glow hover:bg-accentGlow transition-all"
                  >
                    {startingSession ? 'Configuring Session...' : '📖 Start Personalised Session'}
                  </button>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Completed History */}
          <SectionCard title="Completed Topics" subtitle="Your learning records history">
            {completedNodes.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">No topics completed in this session yet.</p>
            ) : (
              <div className="space-y-2">
                {completedNodes.map((node) => (
                  <div
                    key={node.nodeId}
                    className="flex items-center justify-between rounded-xl border border-line p-3 bg-panel/30"
                  >
                    <div>
                      <p className="text-xs font-medium text-text">{node.title}</p>
                      <p className="text-[10px] text-muted">
                        Score {node.score} · {node.mastered ? 'Mastered' : 'Needs review'}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        node.mastered ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
                      }`}
                    >
                      {node.mastered ? 'Pass' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Column: Dynamic Adaptive Path & Stepper */}
        <div className="lg:col-span-7 space-y-6">
          {session ? (
            <SectionCard
              title={`Adaptive Path: ${selectedNode?.title}`}
              subtitle={`Sequenced for ${session.level} learner · ${session.estimated_minutes} min estimated`}
            >
              <div className="space-y-6">
                {/* Visual Stepper */}
                <div className="flex gap-2 flex-wrap">
                  {session.sequence.map((step, i) => (
                    <div
                      key={step}
                      onClick={() => setCurrentStepIndex(i)}
                      className={`rounded-full px-3 py-1 text-xs font-medium border cursor-pointer transition-all ${
                        i < currentStepIndex
                          ? 'bg-success/15 border-success/30 text-success'
                          : i === currentStepIndex
                          ? 'bg-aasha/20 border-aasha text-aasha shadow-aasha'
                          : 'border-line text-muted'
                      }`}
                    >
                      {i + 1}. {step.replace('_', ' ')}
                    </div>
                  ))}
                </div>

                {/* Step Content */}
                <div className="rounded-xl border border-line bg-panel p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <h4 className="text-sm font-semibold uppercase text-aasha">
                      Step {currentStepIndex + 1}: {session.sequence[currentStepIndex].replace('_', ' ')}
                    </h4>
                    <span className="text-[10px] text-muted">Active Learning Mode</span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-text leading-relaxed">
                      {currentStepIndex === 0 && 'Welcome to the warmup! Let us test some fundamental terms you already know.'}
                      {currentStepIndex === 1 && `Here is the main concept of ${selectedNode?.title}. Focus on the definition: ${selectedNode?.concept}`}
                      {currentStepIndex === 2 && 'Let\'s explore the interactive diagram and visual layout. Review how each part connects.'}
                      {currentStepIndex === 3 && 'Time to practice! Let\'s solve 2 quick interactive conceptual exercises.'}
                      {currentStepIndex === 4 && `Virtual Simulation: ${session.simulation_id}. Interact with the visual elements to test your understanding.`}
                      {currentStepIndex === session.sequence.length - 1 && 'You\'ve completed all preparation steps! You are ready to verify your knowledge.'}
                    </p>

                    {currentStepIndex === 4 && (
                      <div className="pt-4 border-t border-line flex flex-col items-center">
                        <p className="text-xs text-muted mb-3 text-center">Ready to enter the interactive experiment?</p>
                        <Link
                          href={`/student/simulation?node_id=${selectedNode?.node_id || ''}`}
                          className="rounded-xl bg-accent px-6 py-2.5 text-xs font-semibold text-white shadow-glow hover:bg-accentGlow transition-all"
                        >
                          🧪 Launch Interactive Simulation
                        </Link>
                      </div>
                    )}

                    {currentStepIndex === session.sequence.length - 1 && (
                      <div className="pt-4 border-t border-line flex flex-col items-center">
                        <p className="text-xs text-muted mb-3 text-center">Ready to verify mastery and earn Aasha Coins?</p>
                        <button
                          onClick={runMasteryAssessment}
                          disabled={runningAssessment}
                          className="rounded-xl bg-success px-6 py-2.5 text-xs font-medium text-bg shadow-glow hover:bg-success/90 transition-all font-semibold"
                        >
                          {runningAssessment ? 'Running assessment...' : '⚔️ Take Mastery Assessment'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assessment Result Banner */}
                {assessmentResult && (
                  <div className={`p-6 rounded-2xl border ${
                    assessmentResult.passed ? 'border-success bg-success/5' : 'border-danger bg-danger/5'
                  } space-y-3 animate-fadeIn`}>
                    <div className="flex justify-between items-center">
                      <h4 className={`text-md font-bold ${
                        assessmentResult.passed ? 'text-success' : 'text-danger'
                      }`}>
                        {assessmentResult.passed ? '🎉 Assessment Passed!' : '⚠️ Needs Review'}
                      </h4>
                      <span className="text-xl font-bold font-mono">{assessmentResult.score} / 100</span>
                    </div>

                    <p className="text-xs text-muted leading-relaxed">
                      Recommendation: <strong className="text-text">{assessmentResult.recommendation.replace(/_/g, ' ')}</strong>.
                    </p>

                    {assessmentResult.passed && (
                      <div className="flex gap-4 pt-2 border-t border-line text-xs">
                        <span className="text-aasha font-semibold">🪙 +{assessmentResult.coins_awarded} Aasha Coins</span>
                        <span className="text-accent font-semibold">✨ +{assessmentResult.xp_awarded} XP</span>
                      </div>
                    )}

                    {!assessmentResult.passed && (
                      <div className="pt-2 border-t border-line text-xs text-muted">
                        <p>Focus Areas: {assessmentResult.weakness_tags.join(', ')}</p>
                        <p className="mt-1">Try reviewing the concept steps and attempt the assessment again!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Stepper Navigation */}
                <div className="flex justify-between">
                  <button
                    disabled={currentStepIndex === 0}
                    onClick={() => setCurrentStepIndex(p => p - 1)}
                    className="px-4 py-2 rounded-lg border border-line text-xs hover:text-text disabled:opacity-30"
                  >
                    ← Previous Step
                  </button>
                  <button
                    disabled={currentStepIndex === session.sequence.length - 1}
                    onClick={() => setCurrentStepIndex(p => p + 1)}
                    className="px-4 py-2 rounded-lg bg-line text-xs hover:bg-line/80 text-text disabled:opacity-30"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            </SectionCard>
          ) : (
            <div className="rounded-2xl border border-line bg-panel/30 p-12 text-center text-muted">
              <span className="text-4xl">📚</span>
              <h3 className="mt-4 text-md font-semibold text-text">No active session</h3>
              <p className="mt-2 text-xs max-w-sm mx-auto leading-relaxed">
                Select a textbook and chapter node on the left, then click &ldquo;Start Personalised Session&rdquo; to begin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
