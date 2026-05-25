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
// KIDs SIMULATION WORKSPACE
// ==========================================
function KidsSimulationWorkspace({ data }: { data: SimulationContext }) {
  const router = useRouter()
  const isMath = data.subject?.toLowerCase() === 'mathematics' || data.subject?.toLowerCase() === 'math'

  // Navigation steps: 'map' (Overview) | 'study' (Glossary/Context) | 'lab' (Embedded Sim) | 'battle' (Boss Battle) | 'victory' (Rewards)
  const [currentFrame, setCurrentFrame] = useState<'map' | 'study' | 'lab' | 'battle' | 'victory'>('map')
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(0)
  
  // Custom states for Biology Pollination Game
  const [hoveredPart, setHoveredPart] = useState<string | null>(null)
  const [selectedPart, setSelectedPart] = useState<string | null>(null)
  const [bioGameStage, setBioGameStage] = useState<'intro' | 'anatomy' | 'pollination' | 'fruit' | 'success'>('intro')
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null)
  const [isDraggingPollen, setIsDraggingPollen] = useState(false)
  const [pollenPosition, setPollenPosition] = useState({ x: 0, y: 0 })
  const [fruitState, setFruitState] = useState<'growing' | 'closed' | 'open'>('growing')
  const carpelRef = useRef<HTMLDivElement>(null)
  const simulationContainerRef = useRef<HTMLDivElement>(null)

  // Math simulation options (Sliders)
  const [mathN, setMathN] = useState<number>(3)
  const [mathD, setMathD] = useState<number>(5)
  const [mathChecked, setMathChecked] = useState<boolean>(false)

  // Combat system (Boss Battle vs Misconception Imp)
  const [heroHp, setHeroHp] = useState<number>(100)
  const [impHp, setImpHp] = useState<number>(100)
  const [heroAnim, setHeroAnim] = useState<'idle' | 'attack' | 'hit'>('idle')
  const [impAnim, setImpAnim] = useState<'idle' | 'attack' | 'hit'>('idle')
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showingMCQFeedback, setShowingMCQFeedback] = useState(false)
  const [combatLogs, setCombatLogs] = useState<string[]>(['⚔️ The Imp (भ्रम दैत्य) has challenged you! Answer questions to strike.'])

  // Bilingual translation helper
  const translateTerm = (term: string) => {
    if (data.vocabulary_map && data.vocabulary_map[term]) {
      const vocab = data.vocabulary_map[term]
      return `${vocab.english} (${vocab.hindi})`
    }
    return term
  }

  // Trigger Socratic check feedback
  const triggerSocraticCheck = (text: string) => {
    setFeedback({ text, isError: true })
    setTimeout(() => {
      setFeedback(prev => prev?.text === text ? null : prev)
    }, 6000)
  }

  // Trigger Combat Damage
  const dealDamage = (amount: number, target: 'hero' | 'imp', logText: string) => {
    if (target === 'imp') {
      setImpHp(prev => Math.max(0, prev - amount))
      setImpAnim('hit')
      setTimeout(() => setImpAnim('idle'), 500)
    } else {
      setHeroHp(prev => Math.max(0, prev - amount))
      setHeroAnim('hit')
      setTimeout(() => setHeroAnim('idle'), 500)
    }
    setCombatLogs(prev => [logText, ...prev])
  }

  // Biology custom drag and drop
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
      setFeedback({ text: "🎉 Excellent! The pollen reached the Carpel (स्त्रीकेसर). It is fertilised!", isError: false })
      setTimeout(() => {
        setFeedback(null)
        setBioGameStage('fruit')
        setFruitState('closed')
      }, 2500)
    } else {
      const dropTarget = document.elementFromPoint(dropX, dropY)
      const isOverLeaf = dropTarget?.classList.contains('leaf-target') || dropY > carpelRect.bottom + 50
      
      if (isOverLeaf) {
        const mis = data.misconceptions.find(m => m.trigger === 'drop_pollen_on_root')
        triggerSocraticCheck(mis?.feedback || "Pollen must go to the Carpel, not the roots or leaves!")
      } else {
        triggerSocraticCheck("Try dragging the yellow pollen directly onto the center green tube (Carpel).")
      }
      setPollenPosition({ x: 0, y: 0 })
    }
  }

  // Combat MCQ Submission
  const handleAnswerSubmit = (optionIndex: number) => {
    setSelectedOption(optionIndex)
    setShowingMCQFeedback(true)
    
    const isCorrect = optionIndex === data.assessments[quizIndex].correct_index
    if (isCorrect) {
      setHeroAnim('attack')
      setTimeout(() => setHeroAnim('idle'), 400)
      dealDamage(35, 'imp', `💥 Hit! You dealt 35 damage to the Imp with a correct answer!`)
    } else {
      dealDamage(20, 'hero', `👹 Ouch! The Imp blocked and dealt 20 damage to you.`)
      triggerSocraticCheck(data.assessments[quizIndex].misconception)
    }
  }

  const handleNextQuiz = async () => {
    setShowingMCQFeedback(false)
    setSelectedOption(null)
    setFeedback(null)
    
    if (quizIndex < data.assessments.length - 1) {
      setQuizIndex(prev => prev + 1)
    } else {
      // End battle
      if (impHp <= 20) setImpHp(0)
      
      try {
        await fetch(`${API_BASE_URL}/api/assess/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: STUDENT_ID,
            node_id: isMath ? 'math_gr5_ch3_fractions' : 'sci_gr5_ch4_lifecycle',
            assessment_type: 'simulation-linked'
          })
        })
      } catch (err) {
        console.error('Error submitting simulation results:', err)
      }
      setCurrentFrame('victory')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between py-6 px-4 md:px-8">
      
      {/* 1. Header (Kid-friendly branding) */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl select-none">🚀</span>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
              AASHA Interactive Kids Academy
            </h1>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Grade 5 · {data.subject.toUpperCase()} · {data.book_title}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold text-yellow-400 shadow-sm">
            <span>🪙</span>
            <span>120 Coins</span>
          </div>
          <button
            onClick={() => router.push('/student')}
            className="px-4 py-1.5 border border-white/15 bg-white/5 rounded-xl text-xs font-semibold hover:bg-white/10 hover:border-white/30 transition-all"
          >
            Exit 🚪
          </button>
        </div>
      </div>

      {/* Stepper progress path indicator */}
      <div className="flex justify-center my-4">
        <div className="flex items-center gap-2 md:gap-4 bg-slate-900/60 border border-white/10 rounded-full px-5 py-2">
          {[
            { frame: 'map', label: '🗺️ Map (नक्शा)' },
            { frame: 'study', label: '📖 Learn (सीखें)' },
            { frame: 'lab', label: '🧪 Lab (प्रयोग)' },
            { frame: 'battle', label: '⚔️ Combat (लड़ाई)' },
          ].map((item, idx) => {
            const isActive = currentFrame === item.frame
            const isCompleted = ['map', 'study', 'lab', 'battle', 'victory'].indexOf(currentFrame) > ['map', 'study', 'lab', 'battle', 'victory'].indexOf(item.frame)
            return (
              <div key={item.frame} className="flex items-center gap-2">
                <button
                  disabled={currentFrame === 'victory'}
                  onClick={() => {
                    setFeedback(null)
                    setCurrentFrame(item.frame as any)
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg scale-105'
                      : isCompleted
                      ? 'text-emerald-400 hover:text-emerald-300'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {isCompleted ? '✅' : ''} {item.label}
                </button>
                {idx < 3 && <span className="text-slate-700 text-xs">➔</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Main Viewport Area */}
      <div className="grid lg:grid-cols-12 gap-6 my-4 flex-1 items-stretch">
        
        {/* Left Column: Visual sandbox or step workspace */}
        <div className="lg:col-span-8 bg-slate-900/50 border border-white/10 rounded-3xl p-6 flex flex-col justify-between relative shadow-xl min-h-[460px]">
          
          <div className="absolute top-4 right-4 flex gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 animate-pulse" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>

          <AnimatePresence mode="wait">
            {/* FRAME 1: Multi-node Map */}
            {currentFrame === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex-1 flex flex-col justify-between items-center text-center py-4"
              >
                <div className="max-w-md space-y-2">
                  <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                    Your Learning Path (आपका सीखने का रास्ता)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Complete nodes one-by-one to master the chapter and unlock the chest!
                  </p>
                </div>

                {/* Illustrated station map */}
                <div className="relative flex flex-col md:flex-row items-center gap-12 justify-center w-full my-8">
                  {/* Connected line background */}
                  <div className="absolute h-1 md:h-1.5 w-0.5 md:w-3/4 bg-slate-800 rounded-full -z-10" />

                  {data.concepts.map((node, index) => {
                    const isCurrent = activeNodeIndex === index
                    return (
                      <motion.div
                        key={node.node_id}
                        whileHover={{ scale: 1.08 }}
                        onClick={() => {
                          setActiveNodeIndex(index)
                          setCurrentFrame('study')
                        }}
                        className={`relative z-10 w-28 p-4 bg-slate-900 border rounded-2xl cursor-pointer text-center transition-all ${
                          isCurrent
                            ? 'border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] bg-purple-950/20'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <span className="text-3xl select-none block mb-2">
                          {isMath ? '🍰' : index === 0 ? '🌸' : index === 1 ? '🐝' : '🍅'}
                        </span>
                        <p className="text-[9px] font-mono text-purple-400 uppercase font-bold tracking-wide">
                          Node {index + 1}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-200 mt-1 truncate">
                          {node.title}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentFrame('study')}
                  className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-8 py-2.5 text-xs font-semibold shadow-glow hover:opacity-90 transition-all"
                >
                  Start Mission 🚀
                </button>
              </motion.div>
            )}

            {/* FRAME 2: Bilingual Learn Frame */}
            {currentFrame === 'study' && (
              <motion.div
                key="study"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block font-mono">
                      Active Node: {data.concepts[activeNodeIndex]?.node_id}
                    </span>
                    <h2 className="text-md font-bold text-slate-200 mt-1">
                      {data.concepts[activeNodeIndex]?.title}
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* English card */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                        <span>English Explanation</span>
                        <span>🇬🇧</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {isMath 
                          ? "Fractions represent equal parts of a whole. The top number (Numerator) tells how many parts we have. The bottom number (Denominator) tells the total equal parts."
                          : "Every flowering plant has specialized organs. The beautiful petals attract helpers like bees, sepals protect the bud, the stamen makes pollen, and the carpel grows the fruit and seeds."}
                      </p>
                    </div>

                    {/* Hindi translation card (60/40 Rule) */}
                    <div className="bg-purple-950/15 border border-purple-500/20 rounded-2xl p-5 space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-purple-400 font-bold uppercase">
                        <span>हिंदी अनुवाद (Hindi Translation)</span>
                        <span>🇮🇳</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {isMath
                          ? "भिन्न (Fraction) किसी पूर्ण वस्तु के बराबर भागों को दर्शाती है। ऊपर की संख्या (अंश) बताती है कि हमारे पास कितने भाग हैं। नीचे की संख्या (हर) बताती है कि कुल कितने बराबर भाग हैं।"
                          : "प्रत्येक फूल वाले पौधे में विशेष अंग होते हैं। सुंदर पंखुड़ियाँ मधुमक्खियों को आकर्षित करती हैं, सुरक्षा कवच (sepals) कली की रक्षा करता है, पुंकेसर पराग बनाता है, और स्त्रीकेसर फल और बीज विकसित करता है।"}
                      </p>
                    </div>
                  </div>

                  {/* Bilingual Glossary quick-reference */}
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2 tracking-wide">Key Terms (मुख्य शब्द):</span>
                    <div className="flex gap-2 flex-wrap">
                      {data.vocabulary.slice(0, 5).map((v) => (
                        <div
                          key={v.term}
                          onClick={() => setSelectedPart(v.term)}
                          className="text-[11px] bg-slate-900/80 border border-white/5 hover:border-purple-400/50 hover:bg-purple-950/20 rounded-xl px-3 py-1.5 cursor-pointer transition-colors"
                        >
                          <strong>{v.term}</strong> <span className="text-slate-500">({v.hindi})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5 mt-4">
                  <button
                    onClick={() => setCurrentFrame('lab')}
                    className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-2.5 text-xs font-semibold shadow-glow hover:opacity-90 transition-all flex items-center gap-1.5"
                  >
                    <span>Proceed to Interactive Lab</span>
                    <span>🧪</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* FRAME 3: Interactive Simulation Lab (Embedded Open-source PhET/GeoGebra) */}
            {currentFrame === 'lab' && (
              <motion.div
                key="lab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div className="flex-1 flex flex-col">
                  {/* Context and instructions */}
                  <div className="flex justify-between items-start gap-4 mb-3 border-b border-white/5 pb-2">
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-mono">Interactive Experiment Studio</span>
                      <h3 className="text-xs font-bold text-slate-300 mt-0.5">
                        {isMath ? '🍰 PhET Fraction Builder Sandbox' : '🌸 Custom Interactive Plant Lab'}
                      </h3>
                    </div>
                    
                    {/* Informative tips */}
                    <div className="text-[11px] bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-1 text-purple-300 max-w-xs leading-tight">
                      {isMath
                        ? '💡 Tip: Experiment with the sliders and match the visual pies below to learn fractions!'
                        : '💡 Tip: Hover parts to discover bilingual definitions, then drag the pollen to fertilize.'}
                    </div>
                  </div>

                  {/* Simulation container */}
                  <div className="flex-1 flex items-center justify-center relative min-h-[300px] bg-slate-950/80 border border-white/10 rounded-2xl overflow-hidden p-2">
                    
                    {isMath ? (
                      /* Embedding open source PhET Fractions Intro */
                      <iframe
                        src="https://phet.colorado.edu/sims/html/fractions-intro/latest/fractions-intro_all.html?screens=1"
                        className="w-full h-[320px] rounded-xl border-0 bg-white"
                        title="PhET Fractions Intro Simulation"
                        allowFullScreen
                      />
                    ) : (
                      /* Biology Simulation Custom Canvas */
                      <div ref={simulationContainerRef} className="w-full h-full flex flex-col justify-between items-center relative py-2">
                        {bioGameStage === 'intro' && (
                          <div className="text-center space-y-4 max-w-sm my-auto">
                            <span className="text-5xl select-none block animate-bounce">🌸</span>
                            <h4 className="text-sm font-bold">Flower Reproduction Simulator</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Learn structural anatomy, bilingual vocabulary terms, and trigger reproduction cycle stages.
                            </p>
                            <button
                              onClick={() => setBioGameStage('anatomy')}
                              className="px-5 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-xs font-semibold transition-colors"
                            >
                              Inspect Structure 🕵️‍♂️
                            </button>
                          </div>
                        )}

                        {bioGameStage === 'anatomy' && (
                          <div className="relative w-64 h-64 flex items-center justify-center">
                            <svg viewBox="0 0 200 200" className="w-full h-full">
                              {/* Sepals */}
                              <path
                                d="M 70,140 Q 60,110 80,120 Q 90,135 100,140 Q 110,135 120,120 Q 140,110 130,140 Z"
                                fill="#4ADE80"
                                className="cursor-pointer transition-all hover:brightness-110 leaf-target"
                                onMouseEnter={() => setHoveredPart('Sepals')}
                                onMouseLeave={() => setHoveredPart(null)}
                                onClick={() => setSelectedPart('Sepals')}
                              />
                              {/* Stem */}
                              <rect x="96" y="140" width="8" height="60" fill="#22C55E" />
                              {/* Petals */}
                              <ellipse
                                cx="60" cy="80" rx="30" ry="20"
                                fill="#F472B6"
                                className="cursor-pointer transition-all hover:scale-105"
                                onMouseEnter={() => setHoveredPart('Petals')}
                                onMouseLeave={() => setHoveredPart(null)}
                                onClick={() => setSelectedPart('Petals')}
                              />
                              <ellipse
                                cx="140" cy="80" rx="30" ry="20"
                                fill="#F472B6"
                                className="cursor-pointer transition-all hover:scale-105"
                                onMouseEnter={() => setHoveredPart('Petals')}
                                onMouseLeave={() => setHoveredPart(null)}
                                onClick={() => setSelectedPart('Petals')}
                              />
                              <ellipse
                                cx="100" cy="50" rx="25" ry="35"
                                fill="#EC4899"
                                className="cursor-pointer transition-all hover:scale-105"
                                onMouseEnter={() => setHoveredPart('Petals')}
                                onMouseLeave={() => setHoveredPart(null)}
                                onClick={() => setSelectedPart('Petals')}
                              />
                              {/* Carpel (Center green tube) */}
                              <path
                                d="M 92,140 L 94,80 Q 90,70 100,70 Q 110,70 106,80 L 108,140 Z"
                                fill="#16A34A"
                                className="cursor-pointer transition-all hover:brightness-105"
                                onMouseEnter={() => setHoveredPart('Carpel')}
                                onMouseLeave={() => setHoveredPart(null)}
                                onClick={() => setSelectedPart('Carpel')}
                              />
                              {/* Stamens */}
                              <path d="M 85,140 Q 75,90 85,85" stroke="#FBBF24" strokeWidth="3" fill="none" />
                              <ellipse
                                cx="85" cy="82" rx="6" ry="4"
                                fill="#D97706"
                                className="cursor-pointer transition-all hover:scale-110"
                                onMouseEnter={() => setHoveredPart('Stamen')}
                                onMouseLeave={() => setHoveredPart(null)}
                                onClick={() => setSelectedPart('Stamen')}
                              />
                              <path d="M 115,140 Q 125,90 115,85" stroke="#FBBF24" strokeWidth="3" fill="none" />
                              <ellipse
                                cx="115" cy="82" rx="6" ry="4"
                                fill="#D97706"
                                className="cursor-pointer transition-all hover:scale-110"
                                onMouseEnter={() => setHoveredPart('Stamen')}
                                onMouseLeave={() => setHoveredPart(null)}
                                onClick={() => setSelectedPart('Stamen')}
                              />
                            </svg>
                            <button
                              onClick={() => setBioGameStage('pollination')}
                              className="absolute bottom-2 bg-purple-500 hover:bg-purple-600 rounded-xl px-4 py-1.5 text-xs font-semibold transition-colors"
                            >
                              Ready to Fertilize 🐝
                            </button>
                          </div>
                        )}

                        {bioGameStage === 'pollination' && (
                          <div className="w-full flex flex-col justify-between items-center h-full max-h-[300px]">
                            <div className="relative w-56 h-48 flex justify-center items-center">
                              <svg viewBox="0 0 200 200" className="w-full h-full">
                                <rect x="96" y="140" width="8" height="60" fill="#22C55E" />
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
                                className={`absolute w-12 h-20 border-2 border-dashed rounded-full flex items-center justify-center transition-all ${
                                  isDraggingPollen ? 'border-emerald-400 bg-emerald-400/25 scale-110 shadow-lg animate-pulse' : 'border-purple-400/40 bg-purple-400/5'
                                }`}
                                style={{ top: '25%', left: '41%' }}
                              >
                                <span className="text-[9px] font-semibold text-slate-200 text-center uppercase tracking-wide">Carpel</span>
                              </div>
                            </div>
                            
                            <div className="bg-slate-900 border border-white/10 rounded-2xl p-3 w-64 flex flex-col items-center shadow-lg">
                              <span className="text-[10px] text-slate-400 mb-2">Drag the pollen (परागकण) onto the Carpel:</span>
                              <motion.div
                                drag
                                dragConstraints={simulationContainerRef}
                                dragElastic={0.2}
                                dragMomentum={false}
                                onDragStart={() => setIsDraggingPollen(true)}
                                onDragEnd={handlePollenDragEnd}
                                animate={pollenPosition}
                                className="w-8 h-8 rounded-full bg-yellow-400 border-4 border-yellow-600 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg"
                              >
                                <span className="text-[8px] font-bold text-yellow-950 font-mono">Pollen</span>
                              </motion.div>
                            </div>
                          </div>
                        )}

                        {bioGameStage === 'fruit' && (
                          <div className="flex flex-col items-center justify-center my-auto space-y-4">
                            {fruitState === 'closed' && (
                              <motion.div
                                initial={{ scale: 0.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={() => {
                                  setFruitState('open')
                                  setFeedback({ text: "Fruit splits open to reveal the Seeds (बीज) inside!", isError: false })
                                }}
                                className="w-40 h-40 bg-gradient-to-tr from-rose-500 to-red-400 border-4 border-red-700 rounded-full flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-glow"
                              >
                                <span className="text-4xl">🍅</span>
                                <span className="text-xs font-bold text-white mt-1">Fruit (फल)</span>
                                <span className="text-[9px] text-white/80">Click to split</span>
                              </motion.div>
                            )}

                            {fruitState === 'open' && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center space-y-4"
                              >
                                <div className="flex gap-4">
                                  <div className="w-24 h-40 bg-red-500 rounded-l-full border-y-4 border-l-4 border-red-700 p-3 flex flex-col items-end justify-center relative shadow-lg">
                                    <div className="w-3 h-3 bg-amber-800 rounded-full mr-2 my-1" />
                                    <div className="w-3 h-3 bg-amber-800 rounded-full mr-4 my-1" />
                                    <span className="absolute bottom-2 right-2 text-[9px] font-bold text-white/80">Seed (बीज)</span>
                                  </div>
                                  <div className="w-24 h-40 bg-red-500 rounded-r-full border-y-4 border-r-4 border-red-700 p-3 flex flex-col items-start justify-center relative shadow-lg">
                                    <div className="w-3 h-3 bg-amber-800 rounded-full ml-2 my-1" />
                                    <div className="w-3 h-3 bg-amber-800 rounded-full ml-4 my-1" />
                                    <span className="absolute bottom-2 left-2 text-[9px] font-bold text-white/80">Seed (बीज)</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setBioGameStage('success')}
                                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-semibold transition-colors"
                                >
                                  Complete Cycle 🔁
                                </button>
                              </motion.div>
                            )}
                          </div>
                        )}

                        {bioGameStage === 'success' && (
                          <div className="text-center space-y-4 my-auto">
                            <span className="text-5xl select-none block">🏆</span>
                            <h4 className="text-sm font-bold text-emerald-400">Reproduction Cycle Mastered!</h4>
                            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                              You successfully studied plant structures, completed pollination, and harvested seeds.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                  <button
                    onClick={() => setCurrentFrame('study')}
                    className="px-4 py-2 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/5 transition-all"
                  >
                    ← Back to Study
                  </button>
                  <button
                    onClick={() => setCurrentFrame('battle')}
                    className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-2.5 text-xs font-semibold shadow-glow hover:opacity-90 transition-all flex items-center gap-1.5 animate-pulse"
                  >
                    <span>Enter Combat Arena</span>
                    <span>⚔️</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* FRAME 4: Socratic Quiz Combat (Boss Battle vs Imp) */}
            {currentFrame === 'battle' && (
              <motion.div
                key="battle"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex-1 flex flex-col justify-between"
              >
                {/* PRODIGY-STYLE HP BARS */}
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-6 mb-4">
                  {/* Hero */}
                  <div className="flex items-center gap-3 w-1/3">
                    <motion.div animate={heroAnim === 'hit' ? { x: [-5, 5, -5, 5, 0] } : heroAnim === 'attack' ? { x: [0, 20, 0] } : {}} className="text-3xl">🧙‍♂️</motion.div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>Hero</span>
                        <span>{heroHp}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all" style={{ width: `${heroHp}%` }} />
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-purple-400 font-mono tracking-widest">VS</span>

                  {/* Imp */}
                  <div className="flex items-center gap-3 w-1/3 flex-row-reverse">
                    <motion.div animate={impAnim === 'hit' ? { x: [5, -5, 5, -5, 0] } : impAnim === 'attack' ? { x: [0, -20, 0] } : {}} className="text-3xl">👹</motion.div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold flex-row-reverse">
                        <span>Imp (दैत्य)</span>
                        <span>{impHp}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-rose-500 h-full transition-all float-right" style={{ width: `${impHp}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* MCQ Question Area */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 text-[10px] text-slate-400 font-bold uppercase">
                    <span>Question {quizIndex + 1} of {data.assessments.length}</span>
                    <span>Combat Mode</span>
                  </div>

                  <h3 className="text-sm font-semibold leading-relaxed text-slate-200">
                    {data.assessments[quizIndex]?.question}
                  </h3>

                  <div className="grid gap-3">
                    {data.assessments[quizIndex]?.options.map((opt, idx) => {
                      const isSelected = selectedOption === idx
                      const isCorrect = idx === data.assessments[quizIndex].correct_index
                      
                      let btnClass = 'border-white/10 hover:border-purple-400/40 bg-white/5 text-slate-200'
                      if (showingMCQFeedback) {
                        if (isCorrect) btnClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        else if (isSelected) btnClass = 'border-rose-500 bg-rose-500/10 text-rose-300 font-bold'
                        else btnClass = 'border-white/5 opacity-55'
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
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                  <button
                    onClick={() => setCurrentFrame('lab')}
                    className="px-4 py-2 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/5 transition-all"
                  >
                    ← Back to Lab
                  </button>

                  {showingMCQFeedback && (
                    <button
                      onClick={handleNextQuiz}
                      className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-2 text-xs font-bold shadow-glow hover:opacity-90 transition-all"
                    >
                      {quizIndex === data.assessments.length - 1 ? 'Finish Combat 🏁' : 'Next Question ➔'}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* FRAME 5: Victory reward showcase */}
            {currentFrame === 'victory' && (
              <motion.div
                key="victory"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="flex-1 flex flex-col justify-center items-center text-center space-y-6 py-12"
              >
                <motion.div
                  animate={{ rotate: [0, -5, 5, -5, 5, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                  className="text-6xl select-none"
                >
                  🎁
                </motion.div>
                
                <div className="space-y-2 max-w-sm">
                  <h2 className="text-xl font-black text-yellow-400 tracking-wide uppercase">
                    Mission Accomplished!
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    You defeated the Misconception Imp, resolved all conceptual traps, and gained learning mastery.
                  </p>
                </div>

                <div className="flex gap-6 justify-center bg-slate-900 border border-white/10 px-8 py-3.5 rounded-2xl shadow-inner text-sm font-bold text-slate-200">
                  <span className="text-yellow-400">🪙 +5 Aasha Coins</span>
                  <span className="text-purple-400">✨ +10 XP</span>
                </div>

                <button
                  onClick={() => router.push('/student')}
                  className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3 text-xs font-extrabold text-slate-900 shadow-glow hover:opacity-90 transition-all uppercase tracking-wider"
                >
                  Collect Rewards & Exit 🚪
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Socratic Helper Guideline status block */}
          <div className="mt-4 pt-4 border-t border-white/10 min-h-[50px] flex items-center bg-slate-950/20 px-4 rounded-xl">
            <AnimatePresence mode="wait">
              {feedback ? (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className={`text-xs leading-relaxed flex items-start gap-2 ${
                    feedback.isError ? 'text-amber-300' : 'text-emerald-300'
                  }`}
                >
                  <span className="text-sm select-none">{feedback.isError ? '💡' : '🎉'}</span>
                  <div>
                    <span className="font-extrabold block uppercase tracking-wide text-[8px] opacity-75">
                      {feedback.isError ? 'Socratic Check (सकारात्मक सुधार)' : 'Milestone achieved (सफलता)'}
                    </span>
                    {feedback.text}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[11px] text-slate-400 flex items-start gap-2 italic"
                >
                  <span className="select-none">💡</span>
                  <span>Socratic Guide: Complete tasks in the current stage to progress. Click terms on the right to read details.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Column: Information Dashboard & Stage Stepper */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          
          {/* Active node description and concepts */}
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Active Concepts
            </h3>
            
            <div className="space-y-3">
              {data.concepts.map((concept, index) => (
                <div
                  key={concept.node_id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    activeNodeIndex === index
                      ? 'border-purple-400 bg-purple-500/5'
                      : 'border-white/5 bg-white/2 opacity-70'
                  }`}
                >
                  <p className="text-[10px] font-mono text-purple-400 font-bold uppercase">Node {index + 1}</p>
                  <h4 className="text-xs font-bold text-slate-200 mt-0.5">{concept.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    {concept.concept}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* COMBAT FEED LOG */}
          {currentFrame === 'battle' && (
            <div className="bg-slate-950 border border-white/10 rounded-3xl p-4 h-32 flex flex-col justify-between shadow-inner">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block border-b border-white/5 pb-1">
                Combat Feed Log (लड़ाई लॉग)
              </span>
              <div className="flex-1 overflow-y-auto mt-2 space-y-1 pr-1 scrollbar-thin">
                {combatLogs.map((log, idx) => (
                  <p key={idx} className="text-[10px] font-mono leading-relaxed text-slate-400">
                    {log}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Bilingual Glossary sidebar */}
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Bilingual Glossary
            </h3>

            {selectedPart ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-2 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-purple-400">{translateTerm(selectedPart)}</h4>
                  <button onClick={() => setSelectedPart(null)} className="text-[9px] text-slate-500 hover:text-slate-300">Close</button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {data.vocabulary_map[selectedPart]?.definition || 'Definition details not found.'}
                </p>
              </div>
            ) : hoveredPart ? (
              <div className="p-4 rounded-xl bg-slate-950/30 border border-dashed border-white/10 space-y-1">
                <h4 className="text-xs font-bold text-purple-400">{translateTerm(hoveredPart)}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {data.vocabulary_map[hoveredPart]?.definition || 'Definition details not found.'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic leading-relaxed">
                Click glossary tags below or hover parts inside the simulation to read details.
              </p>
            )}

            <div className="pt-2 border-t border-white/5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block mb-2">Bilingual Glossary List:</span>
              <div className="flex gap-1.5 flex-wrap max-h-36 overflow-y-auto pr-1">
                {data.vocabulary.map((item) => (
                  <span
                    key={item.term}
                    onClick={() => setSelectedPart(item.term)}
                    className="text-[10px] bg-slate-950 border border-white/5 hover:border-purple-400/40 hover:bg-purple-950/20 rounded-lg px-2.5 py-1 text-slate-300 cursor-pointer transition-all"
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
// UNIVERSAL SIMULATION PAGE ORCHESTRATOR
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-950 to-slate-900 text-slate-100">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-slate-400">Orchestrating Multi-Node RAG Context...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-950 to-slate-900 text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-900/80 border border-rose-500/30 rounded-3xl p-6 text-center space-y-4 shadow-xl">
          <p className="text-4xl select-none">⚠️</p>
          <h2 className="text-lg font-bold text-slate-200">Failed to Load Simulation</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{error || 'Unable to fetch orchestrated parameters.'}</p>
          <button
            onClick={() => router.push('/student')}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg hover:opacity-90 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <KidsSimulationWorkspace data={data} />
}

export default function UniversalSimulationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-950 to-slate-900 text-slate-100">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto animate-pulse"></div>
          <p className="text-xs font-mono text-slate-400 animate-pulse">Loading Simulation Components...</p>
        </div>
      </div>
    }>
      <SimulationOrchestrator />
    </Suspense>
  )
}
