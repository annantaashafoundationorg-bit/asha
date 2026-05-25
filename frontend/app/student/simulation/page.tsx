'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface VocabTerm {
  hindi: string
  english: string
  definition: string
}

interface ConceptNode {
  node_id: string
  title: string
  concept: string
}

interface Misconception {
  node_id: string
  element: string
  trigger?: string
  description: string
  feedback: string
}

interface AssessmentMCQ {
  question: string
  options: string[]
  correct_index: number
  misconception: string
}

interface VocabItem {
  term: string
  definition: string
  hindi: string
  category: string
}

interface SimulationContext {
  book_title: string
  grade: string
  subject: string
  node_ids: string[]
  concepts: ConceptNode[]
  vocabulary_map: Record<string, VocabTerm>
  vocabulary: VocabItem[]
  misconceptions: Misconception[]
  assessments: AssessmentMCQ[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const STUDENT_ID = 'S-1042'

// ==========================================
// 1. BIOLOGY (FLOWER) SIMULATION COMPONENT
// ==========================================
function BiologySimulation({ data }: { data: SimulationContext }) {
  const router = useRouter()
  
  // Interactive States
  const [activeStage, setActiveStage] = useState<'anatomy' | 'pollination' | 'fruit' | 'quiz' | 'complete'>('anatomy')
  const [hoveredPart, setHoveredPart] = useState<string | null>(null)
  const [selectedPart, setSelectedPart] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null)
  
  // Pollination dragging states
  const [isDraggingPollen, setIsDraggingPollen] = useState(false)
  const [pollenPosition, setPollenPosition] = useState({ x: 0, y: 0 })
  const stamenRef = useRef<HTMLDivElement>(null)
  const carpelRef = useRef<HTMLDivElement>(null)
  const simulationContainerRef = useRef<HTMLDivElement>(null)
  
  // Growth stage states
  const [fruitState, setFruitState] = useState<'growing' | 'closed' | 'open'>('growing')
  
  // MCQ state
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [quizScore, setQuizScore] = useState(0)
  const [showingMCQFeedback, setShowingMCQFeedback] = useState(false)

  // Term mapping helper
  const translateTerm = (term: string) => {
    if (data.vocabulary_map && data.vocabulary_map[term]) {
      const vocab = data.vocabulary_map[term]
      return `${vocab.english} (${vocab.hindi})`
    }
    return term
  }

  // Trigger Socratic misconception feedback
  const triggerMisconception = (feedbackText: string) => {
    setFeedback({ text: feedbackText, isError: true })
    setTimeout(() => {
      setFeedback(prev => prev?.text === feedbackText ? null : prev)
    }, 6000)
  }

  // Handle Pollen drag drop logic
  const handlePollenDragEnd = (event: any, info: any) => {
    setIsDraggingPollen(false)
    
    if (!carpelRef.current || !simulationContainerRef.current) return
    
    const carpelRect = carpelRef.current.getBoundingClientRect()
    const dropX = event.clientX
    const dropY = event.clientY
    
    const isOverCarpel = 
      dropX >= carpelRect.left && 
      dropX <= carpelRect.right && 
      dropY >= carpelRect.top && 
      dropY <= carpelRect.bottom

    if (isOverCarpel) {
      setFeedback({ text: "🎉 Successful Pollination! Pollen (परागकण) has reached the female organ Carpel (स्त्रीकेसर).", isError: false })
      setTimeout(() => {
        setFeedback(null)
        setActiveStage('fruit')
        setFruitState('closed')
      }, 2500)
    } else {
      const dropTarget = document.elementFromPoint(dropX, dropY)
      const isOverLeaf = dropTarget?.classList.contains('leaf-target') || dropY > carpelRect.bottom + 50
      
      if (isOverLeaf) {
        const mis = data.misconceptions.find(m => m.trigger === 'drop_pollen_on_root')
        triggerMisconception(mis?.feedback || "Pollen must land on the Carpel (स्त्रीकेसर) to fertilize it. It does not go to the roots or leaves!")
      } else {
        triggerMisconception("Pollen (परागकण) needs to go to the female reproductive organ, the Carpel (स्त्रीकेसर). Try dropping it on the green center tube!")
      }
      setPollenPosition({ x: 0, y: 0 })
    }
  }

  // Complete fruit growth stage
  const handleFruitClick = () => {
    if (fruitState === 'closed') {
      setFruitState('open')
      setFeedback({ text: "Fruit (फल) splits open to reveal the Seeds (बीज) inside. This completes the cycle!", isError: false })
      setTimeout(() => {
        setFeedback(null)
      }, 4000)
    }
  }

  // Handle MCQ Answer Submission
  const handleAnswerSubmit = async (optionIndex: number) => {
    setSelectedOption(optionIndex)
    setShowingMCQFeedback(true)
    
    const correct = optionIndex === data.assessments[quizIndex].correct_index
    if (correct) {
      setQuizScore(prev => prev + 1)
    }
  }

  const handleNextQuiz = async () => {
    setShowingMCQFeedback(false)
    setSelectedOption(null)
    
    if (quizIndex < data.assessments.length - 1) {
      setQuizIndex(prev => prev + 1)
    } else {
      // Done with quiz - submit results and reward coins
      try {
        await fetch(`${API_BASE_URL}/api/assess/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: STUDENT_ID,
            node_id: 'sci_gr5_ch4_lifecycle',
            assessment_type: 'simulation-linked'
          })
        })
      } catch (err) {
        console.error('Error submitting assessment:', err)
      }
      setActiveStage('complete')
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text py-10 px-6 max-w-6xl mx-auto flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-line pb-6">
        <div>
          <span className="text-[10px] font-bold font-mono tracking-widest text-aasha uppercase bg-aasha/10 px-3 py-1 rounded-full">
            AASHA Simulation Runtime
          </span>
          <h1 className="mt-2 text-2xl font-bold font-display">{data.book_title}</h1>
          <p className="text-xs text-muted mt-1">
            Aggregated Chapters: {data.node_ids.join(' · ')}
          </p>
        </div>
        <button
          onClick={() => router.push('/student')}
          className="px-4 py-2 border border-line rounded-xl text-xs font-medium hover:bg-panel/40 transition-colors"
        >
          ← Exit Simulator
        </button>
      </div>

      {/* Main Simulation Viewport */}
      <div className="grid lg:grid-cols-12 gap-8 my-8 flex-1 items-stretch">
        
        {/* Left Column: Visual Sandbox Canvas */}
        <div className="lg:col-span-7 bg-panel border border-line rounded-3xl overflow-hidden flex flex-col justify-between p-6 min-h-[450px] relative shadow-2xl">
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-muted">Virtual Experiment Field</span>
            <div className="flex gap-2">
              {['anatomy', 'pollination', 'fruit', 'quiz'].map((stg) => (
                <div
                  key={stg}
                  className={`w-2 h-2 rounded-full ${
                    activeStage === stg ? 'bg-accent shadow-glow' : 'bg-line'
                  }`}
                />
              ))}
            </div>
          </div>

          <div 
            ref={simulationContainerRef}
            className="flex-1 flex items-center justify-center relative overflow-hidden"
          >
            {activeStage === 'anatomy' && (
              <div className="relative w-72 h-72 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <path
                    d="M 70,140 Q 60,110 80,120 Q 90,135 100,140 Q 110,135 120,120 Q 140,110 130,140 Z"
                    fill="#4ADE80"
                    className="cursor-pointer transition-all hover:brightness-110 leaf-target"
                    onMouseEnter={() => setHoveredPart('Sepals')}
                    onMouseLeave={() => setHoveredPart(null)}
                    onClick={() => setSelectedPart('Sepals')}
                  />
                  <rect x="96" y="140" width="8" height="60" fill="#22C55E" />
                  
                  <ellipse
                    cx="60"
                    cy="80"
                    rx="30"
                    ry="20"
                    fill="#F472B6"
                    className="cursor-pointer transition-all hover:scale-105"
                    onMouseEnter={() => setHoveredPart('Petals')}
                    onMouseLeave={() => setHoveredPart(null)}
                    onClick={() => setSelectedPart('Petals')}
                  />
                  <ellipse
                    cx="140"
                    cy="80"
                    rx="30"
                    ry="20"
                    fill="#F472B6"
                    className="cursor-pointer transition-all hover:scale-105"
                    onMouseEnter={() => setHoveredPart('Petals')}
                    onMouseLeave={() => setHoveredPart(null)}
                    onClick={() => setSelectedPart('Petals')}
                  />
                  <ellipse
                    cx="100"
                    cy="50"
                    rx="25"
                    ry="35"
                    fill="#EC4899"
                    className="cursor-pointer transition-all hover:scale-105"
                    onMouseEnter={() => setHoveredPart('Petals')}
                    onMouseLeave={() => setHoveredPart(null)}
                    onClick={() => setSelectedPart('Petals')}
                  />

                  <path
                    d="M 92,140 L 94,80 Q 90,70 100,70 Q 110,70 106,80 L 108,140 Z"
                    fill="#16A34A"
                    className="cursor-pointer transition-all hover:brightness-105"
                    onMouseEnter={() => setHoveredPart('Carpel')}
                    onMouseLeave={() => setHoveredPart(null)}
                    onClick={() => setSelectedPart('Carpel')}
                  />
                  
                  <path d="M 85,140 Q 75,90 85,85" stroke="#FBBF24" strokeWidth="3" fill="none" />
                  <ellipse
                    cx="85"
                    cy="82"
                    rx="6"
                    ry="4"
                    fill="#D97706"
                    className="cursor-pointer transition-all hover:scale-110"
                    onMouseEnter={() => setHoveredPart('Stamen')}
                    onMouseLeave={() => setHoveredPart(null)}
                    onClick={() => setSelectedPart('Stamen')}
                  />
                  
                  <path d="M 115,140 Q 125,90 115,85" stroke="#FBBF24" strokeWidth="3" fill="none" />
                  <ellipse
                    cx="115"
                    cy="82"
                    rx="6"
                    ry="4"
                    fill="#D97706"
                    className="cursor-pointer transition-all hover:scale-110"
                    onMouseEnter={() => setHoveredPart('Stamen')}
                    onMouseLeave={() => setHoveredPart(null)}
                    onClick={() => setSelectedPart('Stamen')}
                  />
                </svg>

                <div className="absolute top-2 left-2 bg-accent/10 border border-accent/20 rounded-xl px-3 py-1.5 text-xs text-text backdrop-blur-md">
                  💡 Tap parts of the flower to inspect structures.
                </div>
              </div>
            )}

            {activeStage === 'pollination' && (
              <div className="relative w-full h-full flex flex-col justify-between items-center py-6">
                <div className="relative w-64 h-64 flex justify-center items-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <rect x="96" y="140" width="8" height="60" fill="#22C55E" className="leaf-target" />
                    <path d="M 70,140 Q 60,110 80,120 Q 90,135 100,140" fill="#4ADE80" className="leaf-target" />
                    
                    <ellipse cx="60" cy="80" rx="30" ry="20" fill="#F472B6" />
                    <ellipse cx="140" cy="80" rx="30" ry="20" fill="#F472B6" />
                    <ellipse cx="100" cy="50" rx="25" ry="35" fill="#EC4899" />

                    <path d="M 85,140 Q 75,90 85,85" stroke="#FBBF24" strokeWidth="2" fill="none" />
                    <ellipse cx="85" cy="82" rx="6" ry="4" fill="#D97706" />

                    <path d="M 115,140 Q 125,90 115,85" stroke="#FBBF24" strokeWidth="2" fill="none" />
                    <ellipse cx="115" cy="82" rx="6" ry="4" fill="#D97706" />
                  </svg>
                  
                  <div
                    ref={carpelRef}
                    className={`absolute w-12 h-24 border-2 border-dashed rounded-full flex items-center justify-center transition-all ${
                      isDraggingPollen ? 'border-success bg-success/15 scale-110 shadow-glow' : 'border-accent/40 bg-accent/5'
                    }`}
                    style={{ top: '30%', left: '41%' }}
                  >
                    <span className="text-[9px] font-semibold text-text text-center uppercase tracking-wide px-1">
                      Carpel
                    </span>
                  </div>
                </div>

                <div 
                  ref={stamenRef}
                  className="bg-panel border border-line rounded-2xl p-4 w-72 flex flex-col items-center shadow-lg"
                >
                  <p className="text-xs font-semibold text-muted mb-2">Drag the Yellow Pollen (परागकण) to the Carpel:</p>
                  <motion.div
                    drag
                    dragConstraints={simulationContainerRef}
                    dragElastic={0.2}
                    dragMomentum={false}
                    onDragStart={() => setIsDraggingPollen(true)}
                    onDragEnd={handlePollenDragEnd}
                    animate={pollenPosition}
                    className="w-10 h-10 rounded-full bg-amber-400 border-4 border-amber-600 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-glow"
                  >
                    <span className="text-[8px] font-extrabold text-amber-950 font-mono">Pollen</span>
                  </motion.div>
                </div>
              </div>
            )}

            {activeStage === 'fruit' && (
              <div className="relative w-80 h-80 flex flex-col justify-center items-center">
                {fruitState === 'closed' && (
                  <motion.div 
                    initial={{ scale: 0.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 80 }}
                    onClick={handleFruitClick}
                    className="w-48 h-48 bg-gradient-to-tr from-red-600 to-red-400 border-4 border-red-700 rounded-full flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-glow"
                  >
                    <span className="text-3xl">🍅</span>
                    <span className="text-sm font-bold text-white mt-1">Fruit (फल)</span>
                    <span className="text-[10px] text-white/77">Click to Open</span>
                  </motion.div>
                )}

                {fruitState === 'open' && (
                  <motion.div 
                    initial={{ opacity: 0, rotate: -10 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    className="flex gap-4"
                  >
                    <div className="w-28 h-48 bg-red-500 rounded-l-full border-y-4 border-l-4 border-red-700 p-4 flex flex-col items-end justify-center relative shadow-lg">
                      <div className="w-3 h-3 bg-amber-800 rounded-full mr-2 my-1 cursor-pointer hover:scale-125 transition-transform" />
                      <div className="w-3 h-3 bg-amber-800 rounded-full mr-4 my-1 cursor-pointer hover:scale-125 transition-transform" />
                      <span className="absolute bottom-2 right-2 text-[9px] font-bold text-white/80">Seed (बीज)</span>
                    </div>
                    <div className="w-28 h-48 bg-red-500 rounded-r-full border-y-4 border-r-4 border-red-700 p-4 flex flex-col items-start justify-center relative shadow-lg">
                      <div className="w-3 h-3 bg-amber-800 rounded-full ml-2 my-1 cursor-pointer hover:scale-125 transition-transform" />
                      <div className="w-3 h-3 bg-amber-800 rounded-full ml-4 my-1 cursor-pointer hover:scale-125 transition-transform" />
                      <span className="absolute bottom-2 left-2 text-[9px] font-bold text-white/80">Seed (बीज)</span>
                    </div>
                  </motion.div>
                )}
                
                <button
                  onClick={() => {
                    const mis = data.misconceptions.find(m => m.trigger === 'skip_fruit_stage')
                    triggerMisconception(mis?.feedback || 'Error')
                  }}
                  className="mt-6 text-[10px] font-medium text-muted hover:underline"
                >
                  (Test Lifecycle Misconception Trigger)
                </button>
              </div>
            )}

            {activeStage === 'quiz' && (
              <div className="w-full max-w-md bg-panel border border-line rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <span className="text-xs font-semibold text-accent">Question {quizIndex + 1} of {data.assessments.length}</span>
                  <span className="text-xs text-muted">Mastery Check</span>
                </div>
                
                <h3 className="text-sm font-semibold text-text leading-relaxed">
                  {data.assessments[quizIndex].question}
                </h3>
                
                <div className="grid gap-3">
                  {data.assessments[quizIndex].options.map((opt, idx) => {
                    const isSelected = selectedOption === idx
                    const isCorrect = idx === data.assessments[quizIndex].correct_index
                    
                    let btnClass = 'border-line hover:border-accent/40 bg-panel/30 text-text'
                    if (showingMCQFeedback) {
                      if (isCorrect) {
                        btnClass = 'border-success bg-success/10 text-success font-semibold'
                      } else if (isSelected) {
                        btnClass = 'border-danger bg-danger/10 text-danger font-semibold'
                      } else {
                        btnClass = 'border-line opacity-50'
                      }
                    }
                    
                    return (
                      <button
                        key={idx}
                        disabled={showingMCQFeedback}
                        onClick={() => handleAnswerSubmit(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${btnClass}`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
                
                {showingMCQFeedback && (
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    selectedOption === data.assessments[quizIndex].correct_index
                      ? 'border-success/30 bg-success/5 text-success'
                      : 'border-warning/30 bg-warning/5 text-warning'
                  }`}>
                    <strong>
                      {selectedOption === data.assessments[quizIndex].correct_index ? 'Correct!' : 'Incorrect Answer:'}
                    </strong>{' '}
                    {selectedOption !== data.assessments[quizIndex].correct_index && data.assessments[quizIndex].misconception}
                  </div>
                )}
              </div>
            )}

            {activeStage === 'complete' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 bg-success/20 border border-success/30 text-success rounded-full flex items-center justify-center text-3xl mx-auto shadow-glow">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-text">Simulation Completed!</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  You successfully verified parts of EVS-5 Chapter 4.
                </p>
                <div className="flex gap-4 justify-center py-2 text-xs font-semibold">
                  <span className="text-aasha">🪙 +5 Aasha Coins</span>
                  <span className="text-accent">✨ +10 XP</span>
                </div>
                <button
                  onClick={() => router.push('/student')}
                  className="px-6 py-2.5 bg-success text-bg font-bold text-xs rounded-xl shadow-glow hover:bg-success/90 transition-all"
                >
                  Collect Rewards & Back
                </button>
              </motion.div>
            )}

          </div>

          <div className="mt-4 pt-4 border-t border-line min-h-[50px] flex items-center">
            <AnimatePresence mode="wait">
              {feedback ? (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-xs leading-relaxed flex items-start gap-2 ${
                    feedback.isError ? 'text-warning' : 'text-success'
                  }`}
                >
                  <span className="text-sm">{feedback.isError ? '⚠️' : '🎉'}</span>
                  <div>
                    <span className="font-bold block uppercase tracking-wide text-[9px] mb-0.5">
                      {feedback.isError ? 'Socratic Check' : 'Milestone achieved'}
                    </span>
                    {feedback.text}
                  </div>
                </motion.div>
              ) : (
                <motion.p
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted italic"
                >
                  Interactive Guidance: Select components or perform actions in the field above to learn.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Column: Information Dashboard & Stage Stepper */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          
          <div className="bg-panel border border-line rounded-3xl p-6 space-y-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-aasha">Experiment Protocol</h3>
            
            <div className="grid gap-2">
              {[
                { key: 'anatomy', label: '1. Anatomy Inspection', desc: 'Identify floral components & bilingual definitions.' },
                { key: 'pollination', label: '2. Pollen Fertilization', desc: 'Transfer pollen from Stamen to Carpel.' },
                { key: 'fruit', label: '3. Lifecycle Evolution', desc: 'Watch the flower mature and grow into a Fruit.' },
                { key: 'quiz', label: '4. Mastery Verification', desc: 'Prove learning outcomes via conceptual MCQ.' }
              ].map((stg) => {
                const isActive = activeStage === stg.key
                const isPassed = ['anatomy', 'pollination', 'fruit', 'quiz', 'complete'].indexOf(activeStage) > ['anatomy', 'pollination', 'fruit', 'quiz', 'complete'].indexOf(stg.key)
                
                return (
                  <button
                    key={stg.key}
                    disabled={stg.key === 'quiz' && activeStage !== 'quiz' && activeStage !== 'complete'}
                    onClick={() => {
                      if (stg.key === 'anatomy') {
                        setActiveStage('anatomy')
                      } else if (stg.key === 'pollination') {
                        setActiveStage('pollination')
                      } else if (stg.key === 'fruit') {
                        if (activeStage === 'anatomy') {
                          triggerMisconception("Lifecycle Check: You cannot grow a Fruit (फल) before fertilization. Complete Pollination (परागण) first!")
                        } else {
                          setActiveStage('fruit')
                        }
                      }
                    }}
                    className={`text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isActive 
                        ? 'border-accent bg-accent/5' 
                        : isPassed 
                        ? 'border-success/30 bg-success/5 text-success/80' 
                        : 'border-line text-muted hover:border-line/60'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-text">{stg.label}</p>
                      <p className="text-[10px] text-muted/80 mt-0.5">{stg.desc}</p>
                    </div>
                    {isPassed && <span className="text-success text-xs">✓ Done</span>}
                  </button>
                )
              })}
            </div>
            
            {activeStage !== 'quiz' && activeStage !== 'complete' && (
              <button
                onClick={() => {
                  if (activeStage === 'anatomy') setActiveStage('pollination')
                  else if (activeStage === 'pollination') setActiveStage('fruit')
                  else if (activeStage === 'fruit') {
                    if (fruitState !== 'open') {
                      triggerMisconception("Lifecycle Warning: Ensure you split open the matured Fruit (फल) to discover the Seeds (बीज) before completing the loop!")
                    } else {
                      setActiveStage('quiz')
                    }
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accentGlow transition-all shadow-glow"
              >
                Proceed to Next Stage →
              </button>
            )}

            {activeStage === 'quiz' && showingMCQFeedback && (
              <button
                onClick={handleNextQuiz}
                className="w-full py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accentGlow transition-all shadow-glow"
              >
                {quizIndex === data.assessments.length - 1 ? 'Finish Assessment' : 'Next Question'}
              </button>
            )}
          </div>

          <div className="bg-panel border border-line rounded-3xl p-6 flex-1 flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-aasha mb-4">Semantic Vocabulary Bedrock</h3>
              
              {selectedPart ? (
                <div className="p-4 rounded-2xl bg-bg/50 border border-line space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-text">{translateTerm(selectedPart)}</h4>
                    <button onClick={() => setSelectedPart(null)} className="text-[10px] text-muted hover:text-text">Clear</button>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {data.vocabulary_map[selectedPart]?.definition || 'Definition unavailable.'}
                  </p>
                </div>
              ) : hoveredPart ? (
                <div className="p-4 rounded-2xl bg-bg/30 border border-dashed border-line space-y-2">
                  <h4 className="text-xs font-bold text-accent">{translateTerm(hoveredPart)}</h4>
                  <p className="text-[11px] text-muted leading-relaxed">
                    {data.vocabulary_map[hoveredPart]?.definition || 'Definition unavailable.'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted italic">Click/hover on components in the visual sandbox to display bilingual term definitions.</p>
              )}
            </div>

            <div className="pt-4 border-t border-line mt-4">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wide block mb-2">Bilingual Glossary (60/40 Rule)</span>
              <div className="flex gap-2 flex-wrap max-h-36 overflow-y-auto">
                {data.vocabulary.map((item, idx) => (
                  <span
                    key={idx}
                    onClick={() => setSelectedPart(item.term)}
                    className="text-[10px] bg-panel border border-line rounded-lg px-2.5 py-1 text-text cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-colors"
                  >
                    {item.term} ({item.hindi})
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

// ==========================================
// 2. MATHEMATICS (FRACTIONS) SIMULATION
// ==========================================
function MathSimulation({ data }: { data: SimulationContext }) {
  const router = useRouter()
  
  // Interactive Stages
  const [activeStage, setActiveStage] = useState<'anatomy' | 'pollination' | 'fruit' | 'quiz' | 'complete'>('anatomy')
  const [hoveredPart, setHoveredPart] = useState<string | null>(null)
  const [selectedPart, setSelectedPart] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null)
  
  // Sliders for fraction builder (N / D)
  const [mathN, setMathN] = useState<number>(3)
  const [mathD, setMathD] = useState<number>(5)
  const [stage2Success, setStage2Success] = useState<boolean>(false)
  
  // Comparison Choice (Stage 3)
  const [comparisonChoice, setComparisonChoice] = useState<'2/5' | '2/3' | null>(null)
  const [stage3Success, setStage3Success] = useState<boolean>(false)
  
  // Gamified HP States (Prodigy style)
  const [heroHp, setHeroHp] = useState<number>(100)
  const [impHp, setImpHp] = useState<number>(100)
  const [heroAnim, setHeroAnim] = useState<'idle' | 'attack' | 'hit'>('idle')
  const [impAnim, setImpAnim] = useState<'idle' | 'attack' | 'hit'>('idle')
  const [damageTexts, setDamageTexts] = useState<{ id: number; text: string; type: 'hero' | 'imp' }[]>([])
  const [combatLogs, setCombatLogs] = useState<string[]>(["⚔️ Battle began: Defeat the Misconception Imp!"])

  // MCQ state
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showingMCQFeedback, setShowingMCQFeedback] = useState(false)

  // Floating Damage Notification
  const triggerDamage = (amount: number, target: 'hero' | 'imp') => {
    const id = Date.now() + Math.random()
    const text = `-${amount} HP`
    
    if (target === 'imp') {
      setImpHp(prev => Math.max(0, prev - amount))
      setImpAnim('hit')
      setTimeout(() => setImpAnim('idle'), 500)
      setCombatLogs(prev => [`💥 Hero deals ${amount} DMG to Imp!`, ...prev])
    } else {
      setHeroHp(prev => Math.max(0, prev - amount))
      setHeroAnim('hit')
      setTimeout(() => setHeroAnim('idle'), 500)
      setCombatLogs(prev => [`👹 Imp deals ${amount} DMG to Hero!`, ...prev])
    }
    
    setDamageTexts(prev => [...prev, { id, text, type: target }])
    setTimeout(() => {
      setDamageTexts(prev => prev.filter(t => t.id !== id))
    }, 1000)
  }

  // Term mapping helper
  const translateTerm = (term: string) => {
    if (data.vocabulary_map && data.vocabulary_map[term]) {
      const vocab = data.vocabulary_map[term]
      return `${vocab.english} (${vocab.hindi})`
    }
    return term
  }

  // Trigger Socratic misconception feedback
  const triggerMisconception = (feedbackText: string) => {
    setFeedback({ text: feedbackText, isError: true })
  }

  // Stage 1 Action (Warmup Strike)
  const handleStage1Complete = () => {
    setHeroAnim('attack')
    setTimeout(() => {
      setHeroAnim('idle')
      triggerDamage(25, 'imp')
    }, 400)
    
    setFeedback({ text: "🎉 Great! You inspected the anatomy of a fraction. You dealt 25 DMG to the Imp!", isError: false })
    setTimeout(() => {
      setFeedback(null)
      setActiveStage('pollination')
    }, 2000)
  }

  // Stage 2 Action (Check target fraction)
  const handleCheckFraction = () => {
    // We want target 3/5
    if (mathN === 3 && mathD === 5) {
      setStage2Success(true)
      setFeedback({ text: "🎉 Correct! 3/5 (तीन बटा पांच) is successfully created. 3 equal parts selected out of 5 total.", isError: false })
      setHeroAnim('attack')
      setTimeout(() => {
        setHeroAnim('idle')
        triggerDamage(25, 'imp')
      }, 400)
      
      setTimeout(() => {
        setFeedback(null)
        setActiveStage('fruit') // Moving to stage 3
      }, 2500)
    } else if (mathN > mathD) {
      // Trigger improper misconception
      const mis = data.misconceptions.find(m => m.trigger === 'numerator_exceeds_denominator')
      triggerDamage(10, 'hero')
      triggerMisconception(mis?.feedback || "Improper Fraction: Numerator exceeds denominator.")
    } else if (mathN === 3 && mathD === 8) {
      // Comparison check
      triggerDamage(10, 'hero')
      triggerMisconception("Wait! 3/8 has a larger denominator (8) than 3/5. This splits the whole into MORE parts, making each part smaller! So 3/8 is smaller than 3/5. Adjust denominator to 5.")
    } else {
      triggerDamage(5, 'hero')
      triggerMisconception(`You constructed ${mathN}/${mathD}. Try to set the Numerator (अंश) to 3 and the Denominator (हर) to 5!`)
    }
  }

  // Stage 3 Action (Comparison battle)
  const handleCompareSelection = (choice: '2/5' | '2/3') => {
    setComparisonChoice(choice)
    if (choice === '2/3') {
      setStage3Success(true)
      setFeedback({ text: "🎉 Excellent! 2/3 is indeed larger than 2/5 because sharing among 3 people gives larger pieces than sharing among 5!", isError: false })
      setHeroAnim('attack')
      setTimeout(() => {
        setHeroAnim('idle')
        triggerDamage(25, 'imp')
      }, 400)
      
      setTimeout(() => {
        setFeedback(null)
        setActiveStage('quiz')
      }, 3000)
    } else {
      triggerDamage(15, 'hero')
      const mis = data.misconceptions.find(m => m.trigger === 'compare_denominators')
      triggerMisconception(mis?.feedback || "Whole Number Bias: Students think a larger denominator means a larger fraction.")
    }
  }

  // Stage 4 Action (Submit MCQ)
  const handleAnswerSubmit = (optionIndex: number) => {
    setSelectedOption(optionIndex)
    setShowingMCQFeedback(true)
    
    const correct = optionIndex === data.assessments[quizIndex].correct_index
    if (correct) {
      setHeroAnim('attack')
      setTimeout(() => {
        setHeroAnim('idle')
        triggerDamage(25, 'imp')
      }, 400)
      setHeroHp(prev => Math.min(100, prev + 10)) // Heal slightly
      setCombatLogs(prev => ["💚 Hero heals 10 HP on correct answer!", ...prev])
    } else {
      triggerDamage(15, 'hero')
      triggerMisconception(data.assessments[quizIndex].misconception)
    }
  }

  const handleNextQuiz = async () => {
    setShowingMCQFeedback(false)
    setSelectedOption(null)
    setFeedback(null)
    
    if (quizIndex < data.assessments.length - 1) {
      setQuizIndex(prev => prev + 1)
    } else {
      // Check if Imp is dead
      if (impHp <= 25) {
        // Force finish Imp
        setImpHp(0)
      }
      
      // Submit results to server
      try {
        await fetch(`${API_BASE_URL}/api/assess/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: STUDENT_ID,
            node_id: 'math_gr5_ch3_fractions',
            assessment_type: 'simulation-linked'
          })
        })
      } catch (err) {
        console.error('Error submitting assessment:', err)
      }
      
      // Proceed to complete
      setActiveStage('complete')
    }
  }

  // --- SVG Drawing Helpers (PhET standard) ---
  const renderPieSlices = (n: number, d: number) => {
    const slices = []
    const radius = 60
    const cx = 80
    const cy = 80
    
    for (let i = 0; i < d; i++) {
      const startAngle = (i * 2 * Math.PI) / d - Math.PI / 2
      const endAngle = ((i + 1) * 2 * Math.PI) / d - Math.PI / 2
      
      const x1 = cx + radius * Math.cos(startAngle)
      const y1 = cy + radius * Math.sin(startAngle)
      const x2 = cx + radius * Math.cos(endAngle)
      const y2 = cy + radius * Math.sin(endAngle)
      
      const largeArcFlag = d === 1 ? 1 : 0
      const isSelected = i < n
      
      const pathData = d === 1 
        ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
        
      slices.push(
        <path
          key={i}
          d={pathData}
          fill={isSelected ? 'url(#mathPieGrad)' : 'rgba(255, 255, 255, 0.05)'}
          stroke="#475569"
          strokeWidth="1.5"
          className="transition-all duration-300"
        />
      )
    }
    return slices
  }

  const renderPieModel = (n: number, d: number) => {
    if (d === 0) return null
    if (n <= d) {
      return (
        <div className="flex flex-col items-center gap-1.5">
          <svg viewBox="0 0 160 160" className="w-36 h-36">
            <defs>
              <linearGradient id="mathPieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            {renderPieSlices(n, d)}
          </svg>
          <span className="text-[10px] text-muted font-bold font-mono">Pie Model: {n}/{d}</span>
        </div>
      )
    } else {
      const remainder = n - d
      return (
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-4 items-center">
            <div className="flex flex-col items-center">
              <svg viewBox="0 0 160 160" className="w-24 h-24">
                <defs>
                  <linearGradient id="mathPieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                {renderPieSlices(d, d)}
              </svg>
              <span className="text-[9px] text-muted/80 mt-1">1 Whole ({d}/{d})</span>
            </div>
            <div className="flex flex-col items-center">
              <svg viewBox="0 0 160 160" className="w-24 h-24">
                {renderPieSlices(remainder, d)}
              </svg>
              <span className="text-[9px] text-muted/80 mt-1">Remainder ({remainder}/{d})</span>
            </div>
          </div>
          <span className="text-[10px] text-accent font-bold font-mono mt-1">Improper Pie: {n}/{d}</span>
        </div>
      )
    }
  }

  const renderStripSlices = (n: number, d: number) => {
    const blocks = []
    const width = 150
    const height = 30
    const blockWidth = width / d
    
    for (let i = 0; i < d; i++) {
      const isSelected = i < n
      blocks.push(
        <rect
          key={i}
          x={5 + i * blockWidth}
          y={5}
          width={blockWidth}
          height={height}
          fill={isSelected ? 'url(#mathStripGrad)' : 'rgba(255, 255, 255, 0.05)'}
          stroke="#475569"
          strokeWidth="1.5"
          className="transition-all duration-300"
        />
      )
    }
    return blocks
  }

  const renderStripModel = (n: number, d: number) => {
    if (d === 0) return null
    if (n <= d) {
      return (
        <div className="flex flex-col items-center gap-1.5 w-full">
          <svg viewBox="0 0 160 40" className="w-full max-w-[180px] h-10">
            <defs>
              <linearGradient id="mathStripGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            {renderStripSlices(n, d)}
          </svg>
          <span className="text-[10px] text-muted font-bold font-mono">Strip Model: {n}/{d}</span>
        </div>
      )
    } else {
      const remainder = n - d
      return (
        <div className="flex flex-col items-center gap-1 w-full">
          <div className="flex flex-col gap-1.5 w-full max-w-[180px]">
            <div className="flex items-center justify-between gap-2">
              <svg viewBox="0 0 160 40" className="w-32 h-8">
                <defs>
                  <linearGradient id="mathStripGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                {renderStripSlices(d, d)}
              </svg>
              <span className="text-[9px] text-muted">1 ({d}/{d})</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <svg viewBox="0 0 160 40" className="w-32 h-8">
                {renderStripSlices(remainder, d)}
              </svg>
              <span className="text-[9px] text-muted">+{remainder}/{d}</span>
            </div>
          </div>
          <span className="text-[10px] text-accent font-bold font-mono mt-1">Improper Strip: {n}/{d}</span>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text py-10 px-6 max-w-6xl mx-auto flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-line pb-6">
        <div>
          <span className="text-[10px] font-bold font-mono tracking-widest text-aasha uppercase bg-aasha/10 px-3 py-1 rounded-full">
            AASHA Math Combat Arena
          </span>
          <h1 className="mt-2 text-2xl font-bold font-display">{data.book_title}</h1>
          <p className="text-xs text-muted mt-1">
            Aggregated Chapters: {data.node_ids.join(' · ')}
          </p>
        </div>
        <button
          onClick={() => router.push('/student')}
          className="px-4 py-2 border border-line rounded-xl text-xs font-medium hover:bg-panel/40 transition-colors"
        >
          ← Exit Simulator
        </button>
      </div>

      {/* PRODIGY-STYLE BATTLE ARENA PANEL */}
      <div className="mt-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-2 border-accent/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Hero Character Column */}
          <div className="flex items-center gap-4 w-full md:w-1/3">
            <motion.div 
              animate={heroAnim === 'hit' ? { x: [-10, 10, -10, 10, 0], scale: [1, 0.95, 1.05, 1] } : heroAnim === 'attack' ? { x: [0, 40, 0], scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.4 }}
              className="text-5xl select-none"
            >
              🧙‍♂️
            </motion.div>
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-success-light">Aasha Hero (Level 5)</span>
                <span>{heroHp} / 100 HP</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${heroHp}%` }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                />
              </div>
            </div>
            
            {/* Float damage text */}
            <AnimatePresence>
              {damageTexts.filter(t => t.type === 'hero').map(t => (
                <motion.span
                  key={t.id}
                  initial={{ y: 20, opacity: 1, scale: 1.5 }}
                  animate={{ y: -50, opacity: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute text-red-500 font-extrabold text-lg drop-shadow-lg"
                  style={{ left: '20%' }}
                >
                  {t.text}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Central VS Banner */}
          <div className="text-center font-display font-extrabold text-2xl tracking-widest text-accent bg-accent/10 border border-accent/20 px-6 py-2.5 rounded-2xl backdrop-blur-md">
            VS
          </div>

          {/* Misconception Imp Column */}
          <div className="flex items-center gap-4 w-full md:w-1/3 flex-row-reverse md:flex-row">
            <div className="flex-1 space-y-1.5 text-right md:text-left">
              <div className="flex justify-between text-xs font-bold flex-row-reverse md:flex-row">
                <span className="text-red-400">Misconception Imp (भ्रम दैत्य)</span>
                <span>{impHp} / 100 HP</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${impHp}%` }}
                  className="bg-gradient-to-r from-red-500 to-rose-600 h-full rounded-full float-right md:float-none"
                />
              </div>
            </div>
            <motion.div 
              animate={impAnim === 'hit' ? { x: [10, -10, 10, -10, 0], scale: [1, 0.95, 1.05, 1] } : impAnim === 'attack' ? { x: [0, -40, 0], scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.4 }}
              className="text-5xl select-none"
            >
              👹
            </motion.div>
            
            {/* Float damage text */}
            <AnimatePresence>
              {damageTexts.filter(t => t.type === 'imp').map(t => (
                <motion.span
                  key={t.id}
                  initial={{ y: 20, opacity: 1, scale: 1.5 }}
                  animate={{ y: -50, opacity: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute text-orange-500 font-extrabold text-lg drop-shadow-lg"
                  style={{ right: '20%' }}
                >
                  {t.text}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* Main Simulation Viewport */}
      <div className="grid lg:grid-cols-12 gap-8 my-6 flex-1 items-stretch">
        
        {/* Left Column: Visual Sandbox Canvas */}
        <div className="lg:col-span-7 bg-panel border border-line rounded-3xl overflow-hidden flex flex-col justify-between p-6 min-h-[460px] relative shadow-2xl">
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-muted">Virtual Experiment Field</span>
            <div className="flex gap-2">
              {['anatomy', 'pollination', 'fruit', 'quiz'].map((stg) => (
                <div
                  key={stg}
                  className={`w-2 h-2 rounded-full ${
                    activeStage === stg ? 'bg-accent shadow-glow' : 'bg-line'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Dynamic Sandboxes depending on Stage */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden p-4">
            
            {/* STAGE 1: Fraction Anatomy */}
            {activeStage === 'anatomy' && (
              <div className="flex flex-col md:flex-row items-center gap-8 justify-around w-full">
                
                {/* Big Interactive Fraction */}
                <div className="flex flex-col items-center justify-center bg-slate-900/60 border border-line rounded-2xl p-6 w-48 shadow-lg select-none">
                  <span className="text-xs text-muted/60 uppercase tracking-widest block mb-2 font-mono">Interactive Fraction</span>
                  
                  {/* Numerator */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedPart('Numerator')}
                    className={`text-4xl font-extrabold cursor-pointer py-1 px-4 rounded-xl border ${
                      selectedPart === 'Numerator' ? 'border-accent bg-accent/15 text-accent' : 'border-transparent text-text hover:bg-slate-800'
                    }`}
                  >
                    3
                  </motion.div>
                  
                  {/* Division Bar */}
                  <div className="w-24 h-1.5 bg-text/80 rounded-full my-2" />
                  
                  {/* Denominator */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedPart('Denominator')}
                    className={`text-4xl font-extrabold cursor-pointer py-1 px-4 rounded-xl border ${
                      selectedPart === 'Denominator' ? 'border-accent bg-accent/15 text-accent' : 'border-transparent text-text hover:bg-slate-800'
                    }`}
                  >
                    5
                  </motion.div>
                  
                  <span className="text-[10px] text-muted mt-3">Click on numbers to inspect!</span>
                </div>

                {/* Live Static Display of Models */}
                <div className="flex flex-col gap-4 items-center">
                  {renderPieModel(3, 5)}
                  {renderStripModel(3, 5)}
                </div>

              </div>
            )}

            {/* STAGE 2: Fraction Builder Slider Sandbox (PhET Style) */}
            {activeStage === 'pollination' && (
              <div className="flex flex-col items-center gap-6 w-full">
                
                {/* Imp Challenge Banner */}
                <div className="bg-red-950/20 border border-red-900/30 rounded-xl px-4 py-2 text-center text-xs text-red-200">
                  👺 Imp Challenge: <strong>Make the fraction 3/5 (तीन बटा पांच)</strong> to break my defensive shield!
                </div>

                {/* Models Output side-by-side */}
                <div className="flex flex-col md:flex-row gap-8 items-center justify-center my-2">
                  {renderPieModel(mathN, mathD)}
                  {renderStripModel(mathN, mathD)}
                </div>

                {/* Sliders Container */}
                <div className="w-full max-w-sm space-y-4 bg-slate-900/60 p-4 border border-line rounded-2xl">
                  {/* Numerator Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-accent">Numerator (अंश): {mathN}</span>
                      <span className="text-[10px] text-muted">Selected Parts</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="12" 
                      value={mathN}
                      onChange={(e) => {
                        setMathN(parseInt(e.target.value))
                        setFeedback(null)
                      }}
                      className="w-full accent-accent bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Denominator Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-accent">Denominator (हर): {mathD}</span>
                      <span className="text-[10px] text-muted">Total Equal Parts</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="12" 
                      value={mathD}
                      onChange={(e) => {
                        setMathD(parseInt(e.target.value))
                        setFeedback(null)
                      }}
                      className="w-full accent-accent bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={handleCheckFraction}
                    className="w-full py-2 bg-accent hover:bg-accentGlow text-white text-xs font-bold rounded-xl transition-all shadow-glow"
                  >
                    Check Fraction & Strike ⚔️
                  </button>

                </div>

              </div>
            )}

            {/* STAGE 3: Fraction Comparison Battle */}
            {activeStage === 'fruit' && (
              <div className="flex flex-col items-center gap-6 w-full">
                
                <div className="bg-red-950/20 border border-red-900/30 rounded-xl px-4 py-2 text-center text-xs text-red-200">
                  👺 Imp: <strong>I bet 2/5 is larger than 2/3 because 5 is larger than 3!</strong> Prove me wrong!
                </div>

                {/* Compare Blocks Side-by-Side */}
                <div className="flex flex-col md:flex-row items-center gap-10 justify-center w-full my-2">
                  
                  {/* Block A */}
                  <div className="flex flex-col items-center gap-2 p-4 bg-slate-900/50 border border-line rounded-2xl w-40">
                    <span className="text-xs font-bold font-mono text-text">2/5</span>
                    <svg viewBox="0 0 160 160" className="w-24 h-24">
                      {renderPieSlices(2, 5)}
                    </svg>
                    <svg viewBox="0 0 160 40" className="w-28 h-6">
                      {renderStripSlices(2, 5)}
                    </svg>
                  </div>

                  <div className="text-xl font-bold font-display text-muted">VS</div>

                  {/* Block B */}
                  <div className="flex flex-col items-center gap-2 p-4 bg-slate-900/50 border border-line rounded-2xl w-40">
                    <span className="text-xs font-bold font-mono text-text">2/3</span>
                    <svg viewBox="0 0 160 160" className="w-24 h-24">
                      {renderPieSlices(2, 3)}
                    </svg>
                    <svg viewBox="0 0 160 40" className="w-28 h-6">
                      {renderStripSlices(2, 3)}
                    </svg>
                  </div>

                </div>

                {/* Interactive buttons */}
                <div className="flex gap-4 w-full max-w-sm">
                  <button
                    onClick={() => handleCompareSelection('2/5')}
                    disabled={stage3Success}
                    className={`flex-1 py-2.5 border text-xs font-bold rounded-xl transition-all ${
                      comparisonChoice === '2/5' ? 'border-danger bg-danger/10 text-danger' : 'border-line hover:border-accent/40 text-text'
                    }`}
                  >
                    2/5 is Larger
                  </button>
                  <button
                    onClick={() => handleCompareSelection('2/3')}
                    disabled={stage3Success}
                    className={`flex-1 py-2.5 border text-xs font-bold rounded-xl transition-all ${
                      comparisonChoice === '2/3' && stage3Success ? 'border-success bg-success/10 text-success' : 'border-line hover:border-accent/40 text-text'
                    }`}
                  >
                    2/3 is Larger
                  </button>
                </div>

              </div>
            )}

            {/* STAGE 4: MCQ Quiz Battle */}
            {activeStage === 'quiz' && (
              <div className="w-full max-w-md bg-panel border border-line rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <span className="text-xs font-semibold text-accent">Question {quizIndex + 1} of {data.assessments.length}</span>
                  <span className="text-xs text-muted">Concept Combat</span>
                </div>
                
                <h3 className="text-xs md:text-sm font-semibold text-text leading-relaxed">
                  {data.assessments[quizIndex].question}
                </h3>
                
                <div className="grid gap-2.5">
                  {data.assessments[quizIndex].options.map((opt, idx) => {
                    const isSelected = selectedOption === idx
                    const isCorrect = idx === data.assessments[quizIndex].correct_index
                    
                    let btnClass = 'border-line hover:border-accent/40 bg-panel/30 text-text'
                    if (showingMCQFeedback) {
                      if (isCorrect) {
                        btnClass = 'border-success bg-success/10 text-success font-semibold shadow-glow'
                      } else if (isSelected) {
                        btnClass = 'border-danger bg-danger/10 text-danger font-semibold'
                      } else {
                        btnClass = 'border-line opacity-50'
                      }
                    }
                    
                    return (
                      <button
                        key={idx}
                        disabled={showingMCQFeedback}
                        onClick={() => handleAnswerSubmit(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${btnClass}`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
                
                {showingMCQFeedback && (
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    selectedOption === data.assessments[quizIndex].correct_index
                      ? 'border-success/30 bg-success/5 text-success'
                      : 'border-warning/30 bg-warning/5 text-warning'
                  }`}>
                    <strong>
                      {selectedOption === data.assessments[quizIndex].correct_index ? 'Hero Strike hits! 💥' : 'Imp counter-attacked! 👹'}
                    </strong>{' '}
                    {selectedOption !== data.assessments[quizIndex].correct_index && data.assessments[quizIndex].misconception}
                  </div>
                )}
              </div>
            )}

            {/* STAGE 5: Finished Complete (Victory!) */}
            {activeStage === 'complete' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 bg-success/20 border border-success/30 text-success rounded-full flex items-center justify-center text-3xl mx-auto shadow-glow animate-bounce">
                  👑
                </div>
                <h3 className="text-lg font-bold text-text">Victory! Imp Defeated!</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  You successfully mastered the Fraction node &ldquo;Parts and Wholes&rdquo;!
                </p>
                <div className="flex gap-4 justify-center py-2 text-xs font-semibold">
                  <span className="text-aasha">🪙 +5 Aasha Coins</span>
                  <span className="text-accent">✨ +10 XP</span>
                </div>
                <button
                  onClick={() => router.push('/student')}
                  className="px-6 py-2.5 bg-success text-bg font-bold text-xs rounded-xl shadow-glow hover:bg-success/90 transition-all"
                >
                  Collect Rewards & Exit
                </button>
              </motion.div>
            )}

          </div>

          {/* Socratic Chat Guide Status */}
          <div className="mt-4 pt-4 border-t border-line min-h-[50px] flex items-center">
            <AnimatePresence mode="wait">
              {feedback ? (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-xs leading-relaxed flex items-start gap-2 ${
                    feedback.isError ? 'text-warning' : 'text-success'
                  }`}
                >
                  <span className="text-sm">{feedback.isError ? '⚠️' : '🎉'}</span>
                  <div>
                    <span className="font-bold block uppercase tracking-wide text-[9px] mb-0.5">
                      {feedback.isError ? 'Socratic Check' : 'Milestone achieved'}
                    </span>
                    {feedback.text}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted flex items-start gap-2 italic"
                >
                  <span>💡</span>
                  <span>Socratic Guide: Click fraction numbers or move sliders to experiment. Prove concepts to defeat the Imp!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Column: Information Dashboard, Stage Stepper, and Combat Logs */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* Stepper Card */}
          <div className="bg-panel border border-line rounded-3xl p-6 space-y-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-aasha">Combat Protocol</h3>
            
            <div className="grid gap-2">
              {[
                { key: 'anatomy', label: '1. Fraction Anatomy', desc: 'Click Numerator/Denominator definitions.' },
                { key: 'pollination', label: '2. Fraction Builder', desc: 'Use sliders to build 3/5 target fraction.' },
                { key: 'fruit', label: '3. Fraction Comparison', desc: 'Compare 2/5 vs 2/3 and break whole number bias.' },
                { key: 'quiz', label: '4. Mastery Quiz Battle', desc: 'Win final quiz to defeat the Imp.' }
              ].map((stg) => {
                const isActive = activeStage === stg.key
                const isPassed = ['anatomy', 'pollination', 'fruit', 'quiz', 'complete'].indexOf(activeStage) > ['anatomy', 'pollination', 'fruit', 'quiz', 'complete'].indexOf(stg.key)
                
                return (
                  <button
                    key={stg.key}
                    disabled={stg.key === 'quiz' && activeStage !== 'quiz' && activeStage !== 'complete'}
                    onClick={() => {
                      if (stg.key === 'anatomy') {
                        setActiveStage('anatomy')
                      } else if (stg.key === 'pollination') {
                        setActiveStage('pollination')
                      } else if (stg.key === 'fruit') {
                        if (activeStage === 'anatomy') {
                          triggerMisconception("Combat Check: You must learn fraction anatomy and strike once before building fractions!")
                        } else {
                          setActiveStage('fruit')
                        }
                      }
                    }}
                    className={`text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isActive 
                        ? 'border-accent bg-accent/5' 
                        : isPassed 
                        ? 'border-success/30 bg-success/5 text-success/80' 
                        : 'border-line text-muted hover:border-line/60'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-text">{stg.label}</p>
                      <p className="text-[10px] text-muted/80 mt-0.5">{stg.desc}</p>
                    </div>
                    {isPassed && <span className="text-success text-xs">✓ Win</span>}
                  </button>
                )
              })}
            </div>
            
            {activeStage !== 'quiz' && activeStage !== 'complete' && (
              <button
                onClick={() => {
                  if (activeStage === 'anatomy') handleStage1Complete()
                  else if (activeStage === 'pollination') handleCheckFraction()
                  else if (activeStage === 'fruit') {
                    if (!stage3Success) {
                      triggerMisconception("Combat Shield: You must select the correct larger fraction to proceed!")
                    } else {
                      setActiveStage('quiz')
                    }
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accentGlow transition-all shadow-glow"
              >
                {activeStage === 'anatomy' ? 'Strike & Proceed →' : 'Submit Check & Strike ⚔️'}
              </button>
            )}

            {activeStage === 'quiz' && showingMCQFeedback && (
              <button
                onClick={handleNextQuiz}
                className="w-full py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accentGlow transition-all shadow-glow"
              >
                {quizIndex === data.assessments.length - 1 ? 'Finish Combat' : 'Next Battle Question'}
              </button>
            )}
          </div>

          {/* COMBAT FEED LOG (Retro terminal style) */}
          <div className="bg-slate-950 border border-line rounded-3xl p-4 h-32 flex flex-col justify-between shadow-inner">
            <span className="text-[9px] font-bold text-muted uppercase tracking-wider block border-b border-line pb-1">Combat Logs (लड़ाई लॉग)</span>
            <div className="flex-1 overflow-y-auto mt-2 space-y-1 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {combatLogs.map((log, idx) => (
                <p key={idx} className="text-[10px] font-mono leading-relaxed text-slate-300">
                  {log}
                </p>
              ))}
            </div>
          </div>

          {/* Bilingual Glossary */}
          <div className="bg-panel border border-line rounded-3xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-aasha mb-3">Semantic Vocabulary Bedrock</h3>
              
              {selectedPart ? (
                <div className="p-3.5 rounded-2xl bg-bg/50 border border-line space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-text">{translateTerm(selectedPart)}</h4>
                    <button onClick={() => setSelectedPart(null)} className="text-[9px] text-muted hover:text-text">Clear</button>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {data.vocabulary_map[selectedPart]?.definition || 'Definition unavailable.'}
                  </p>
                </div>
              ) : hoveredPart ? (
                <div className="p-3.5 rounded-2xl bg-bg/30 border border-dashed border-line space-y-1">
                  <h4 className="text-xs font-bold text-accent">{translateTerm(hoveredPart)}</h4>
                  <p className="text-[10px] text-muted leading-relaxed">
                    {data.vocabulary_map[hoveredPart]?.definition || 'Definition unavailable.'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted italic">Click on fraction labels or slider output cards to inspect bilingual definitions.</p>
              )}
            </div>

            <div className="pt-3 border-t border-line mt-3">
              <span className="text-[9px] font-bold text-muted uppercase tracking-wide block mb-1.5">Bilingual Glossary (60/40 Rule)</span>
              <div className="flex gap-1.5 flex-wrap">
                {data.vocabulary.map((item, idx) => (
                  <span
                    key={idx}
                    onClick={() => setSelectedPart(item.term)}
                    className="text-[9px] bg-panel border border-line rounded-lg px-2 py-0.5 text-text cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-colors"
                  >
                    {item.term} ({item.hindi})
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

// ==========================================
// 3. MAIN ORCHESTRATOR CLIENT COMPONENT
// ==========================================
function SimulationOrchestrator() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [data, setData] = useState<SimulationContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrchestratedData = async () => {
      try {
        setLoading(true)
        const nodeId = searchParams.get('node_id') || 'sci_gr5_ch4_reproduction'
        
        // Decide node grouping for backend simulation orchestration
        const nodeIds = nodeId.startsWith('math_') 
          ? ['math_gr5_ch3_fractions']
          : ['sci_gr5_ch4_anatomy', 'sci_gr5_ch4_reproduction', 'sci_gr5_ch4_lifecycle']

        const res = await fetch(`${API_BASE_URL}/api/simulate/orchestrate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            node_ids: nodeIds
          })
        })

        if (!res.ok) {
          throw new Error('Failed to fetch orchestrated simulation context')
        }

        const payload = await res.json()
        setData(payload)
      } catch (err: any) {
        console.error('Error fetching orchestration data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrchestratedData()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-mono text-muted">Orchestrating Multi-Node RAG Context...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text p-6">
        <div className="max-w-md w-full bg-panel border border-danger/30 rounded-2xl p-6 text-center space-y-4">
          <p className="text-4xl">⚠️</p>
          <h2 className="text-lg font-bold text-text">Failed to Load Simulation</h2>
          <p className="text-sm text-muted">{error || 'Unable to fetch orchestrated parameters.'}</p>
          <button onClick={() => router.push('/student')} className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-semibold">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const subject = data.subject?.toLowerCase() || 'biology'
  
  if (subject === 'mathematics' || subject === 'math') {
    return <MathSimulation data={data} />
  }

  return <BiologySimulation data={data} />
}

export default function UniversalSimulationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg text-text">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-mono text-muted">Loading Simulation Components...</p>
        </div>
      </div>
    }>
      <SimulationOrchestrator />
    </Suspense>
  )
}
