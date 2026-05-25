'use client'

import { useState } from 'react'
import { SectionCard } from '../../components/SectionCard'
import { StatCard } from '../../components/StatCard'

interface Student {
  id: string
  name: string
  school: string
  className: string
  subject: string
  activeChapter: string
  lessonsCompleted: number
  growthScore: number
  coins: number
}

// Initial mockup data matching the MVP criteria
const initialStudents: Student[] = [
  { id: 'S-101', name: 'Priya Kumari', school: 'Govt Girls School Sector 4', className: 'Class 5', subject: 'Science', activeChapter: 'Lifecycle of Plants', lessonsCompleted: 12, growthScore: 88, coins: 45 },
  { id: 'S-102', name: 'Arjun Das', school: 'Govt Boys School Sector 4', className: 'Class 5', subject: 'Mathematics', activeChapter: 'Parts and Wholes', lessonsCompleted: 10, growthScore: 74, coins: 25 },
  { id: 'S-103', name: 'Meena Sharma', school: 'Govt Girls School Sector 4', className: 'Class 5', subject: 'Science', activeChapter: 'Lifecycle of Plants', lessonsCompleted: 14, growthScore: 92, coins: 60 },
  { id: 'S-104', name: 'Ravi Kumar', school: 'Model Primary School Town', className: 'Class 5', subject: 'Mathematics', activeChapter: 'Parts and Wholes', lessonsCompleted: 7, growthScore: 65, coins: 15 },
]

// Mock alternate concept database
const conceptDatabase = [
  { term: 'Fractions', version: 'Bilingual Apple Sharing', level: 'Easy / Basic', desc: 'Explains halves and quarters by dividing an apple among children. Best for beginners.' },
  { term: 'Fractions', version: 'Chocolate Bar Model', level: 'Standard', desc: 'Uses grid-based block division showing numerator and denominator mapping.' },
  { term: 'Reproduction', version: 'Insect Friend Adventure', level: 'Easy / Basic', desc: 'Bilingual cartoon story explaining how bees carry pollen seeds. Best for visual learners.' },
  { term: 'Reproduction', version: 'Flower Cross-section Diagram', level: 'Standard', desc: 'Detailed diagram with labels in Hindi and English explaining reproductive parts.' }
]

// Mock center geophotos
interface GeoPhoto {
  id: string
  center: string
  school: string
  timestamp: string
  imageUrl: string
  status: 'pending' | 'approved'
}

const initialGeoPhotos: GeoPhoto[] = [
  { id: 'P-901', center: 'Aasha Center 01', school: 'Govt Girls School Sector 4', timestamp: '2026-05-25 15:30', imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500&auto=format&fit=crop&q=60', status: 'pending' },
  { id: 'P-902', center: 'Aasha Center 02', school: 'Model Primary School Town', timestamp: '2026-05-25 16:15', imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop&q=60', status: 'pending' }
]

export default function TeacherPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [geophotos, setGeophotos] = useState<GeoPhoto[]>(initialGeoPhotos)
  
  // Form states
  const [newName, setNewName] = useState('')
  const [newSchool, setNewSchool] = useState('')
  const [newClass, setNewClass] = useState('Class 5')
  const [newSubject, setNewSubject] = useState('Science')
  const [newChapter, setNewChapter] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)

  // Assignment states
  const [assignSchool, setAssignSchool] = useState('Govt Girls School Sector 4')
  const [assignChapter, setAssignChapter] = useState('')
  const [assignSubject, setAssignSubject] = useState('Science')
  const [assignSuccess, setAssignSuccess] = useState(false)

  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<typeof conceptDatabase>([])

  // Student register handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newSchool || !newChapter) return

    const newStudent: Student = {
      id: `S-${Date.now().toString().slice(-4)}`,
      name: newName,
      school: newSchool,
      className: newClass,
      subject: newSubject,
      activeChapter: newChapter,
      lessonsCompleted: 0,
      growthScore: 100, // Starts fresh on track
      coins: 0
    }

    setStudents(prev => [...prev, newStudent])
    setNewName('')
    setNewSchool('')
    setNewChapter('')
    setFormSuccess(true)
    setTimeout(() => setFormSuccess(false), 3000)
  }

  // Assign Chapter handler
  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignChapter) return

    setStudents(prev => prev.map(s => {
      if (s.school === assignSchool) {
        return {
          ...s,
          subject: assignSubject,
          activeChapter: assignChapter,
          lessonsCompleted: s.lessonsCompleted,
          growthScore: s.growthScore
        }
      }
      return s
    }))

    setAssignChapter('')
    setAssignSuccess(true)
    setTimeout(() => setAssignSuccess(false), 3000)
  }

  // Search Database handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery) {
      setSearchResults([])
      return
    }
    const filtered = conceptDatabase.filter(c => 
      c.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.version.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setSearchResults(filtered)
  }

  // Approve Geophoto handler
  const approvePhoto = (id: string) => {
    setGeophotos(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p))
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8 text-slate-100">
      
      {/* 1. Header (No tech jargon, simple purpose) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-aasha px-3 py-1 bg-aasha/10 rounded-full">
            Teacher & Admin Workspace
          </span>
          <h1 className="mt-3 font-display text-3xl font-semibold text-text">Classroom Controller</h1>
          <p className="text-xs text-muted mt-1">
            Super Admin: <strong className="text-text">annantaashafoundationn.org@gmail.com</strong>
          </p>
        </div>
        
        {/* Simple count indicators */}
        <div className="flex gap-4">
          <div className="bg-panel border border-line rounded-2xl px-5 py-2.5 text-center">
            <span className="text-xs text-muted block">Registered Kids</span>
            <span className="text-xl font-bold text-text">{students.length}</span>
          </div>
          <div className="bg-panel border border-line rounded-2xl px-5 py-2.5 text-center">
            <span className="text-xs text-muted block">Pending Photos</span>
            <span className="text-xl font-bold text-warning">
              {geophotos.filter(p => p.status === 'pending').length}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Primary Layout Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Left Column: Registration and Assignments Forms */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Easy Kids Registration Form */}
          <SectionCard 
            title="Register New Student" 
            subtitle="Automatically verified upon addition"
          >
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Soni Kumari"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-2 text-text placeholder-slate-600 focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">School Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Govt Primary School"
                  value={newSchool}
                  onChange={e => setNewSchool(e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-2 text-text placeholder-slate-600 focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Class</label>
                  <select
                    value={newClass}
                    onChange={e => setNewClass(e.target.value)}
                    className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-text focus:border-accent focus:outline-none"
                  >
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-text focus:border-accent focus:outline-none"
                  >
                    <option value="Science">Science (EVS)</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Active Chapter (Lesson Block)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parts and Wholes"
                  value={newChapter}
                  onChange={e => setNewChapter(e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-2 text-text placeholder-slate-600 focus:border-accent focus:outline-none"
                />
              </div>

              {formSuccess && (
                <div className="p-3 bg-success/15 border border-success/30 rounded-xl text-success text-center">
                  🎉 Student registered & auto-verified!
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-accent px-4 py-2.5 font-bold text-white shadow-glow hover:bg-accentGlow transition-colors"
              >
                Register & Verify Kid
              </button>
            </form>
          </SectionCard>

          {/* Assign Chapters / Lessons by School */}
          <SectionCard 
            title="Assign Chapter to School" 
            subtitle="Sets active study chapter for all kids in a school"
          >
            <form onSubmit={handleAssign} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select School</label>
                <select
                  value={assignSchool}
                  onChange={e => setAssignSchool(e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-text focus:border-accent focus:outline-none"
                >
                  <option value="Govt Girls School Sector 4">Govt Girls School Sector 4</option>
                  <option value="Govt Boys School Sector 4">Govt Boys School Sector 4</option>
                  <option value="Model Primary School Town">Model Primary School Town</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Subject</label>
                  <select
                    value={assignSubject}
                    onChange={e => setAssignSubject(e.target.value)}
                    className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-text focus:border-accent focus:outline-none"
                  >
                    <option value="Science">Science (EVS)</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Chapter Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fractions basics"
                    value={assignChapter}
                    onChange={e => setAssignChapter(e.target.value)}
                    className="w-full rounded-xl border border-line bg-bg px-4 py-2 text-text placeholder-slate-600 focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              {assignSuccess && (
                <div className="p-3 bg-success/15 border border-success/30 rounded-xl text-success text-center">
                  📢 Assigned lesson chapter to all matching students!
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-purple-500 px-4 py-2.5 font-bold text-white shadow-glow hover:bg-purple-600 transition-colors"
              >
                Assign Chapter
              </button>
            </form>
          </SectionCard>

        </div>

        {/* Right Column: Growth reports, Geo-photo approval, Global DB search */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Kids Growth Reports */}
          <SectionCard 
            title="Children Growth & Action Log" 
            subtitle="Live tracking of lessons completed, coins earned, and mastery score"
          >
            <div className="space-y-4">
              {students.map(s => (
                <div 
                  key={s.id}
                  className="rounded-2xl border border-line bg-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white text-sm">
                      {s.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text">{s.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {s.school} · {s.className}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Active: <strong className="text-purple-400">{s.activeChapter}</strong> ({s.subject})
                      </p>
                    </div>
                  </div>

                  {/* Actions progress */}
                  <div className="flex items-center gap-6 text-xs text-right">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Lessons Done</span>
                      <strong className="text-text">{s.lessonsCompleted} Chapters</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Aasha Coins</span>
                      <strong className="text-yellow-400">🪙 {s.coins}</strong>
                    </div>
                    <div className="w-28 text-left md:text-right">
                      <span className="text-slate-400 block text-[10px] md:text-right">Growth Rate</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex-1">
                          <div 
                            className="bg-emerald-500 h-full rounded-full" 
                            style={{ width: `${s.growthScore}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-emerald-400">{s.growthScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Geophoto Verification Module */}
            <SectionCard 
              title="Geophoto Verification" 
              subtitle="Approve center coordinator photos from field execution"
            >
              <div className="space-y-4">
                {geophotos.map(photo => (
                  <div 
                    key={photo.id}
                    className="rounded-xl border border-line bg-panel overflow-hidden p-3.5 space-y-3"
                  >
                    <div className="flex justify-between items-start text-[11px]">
                      <div>
                        <strong className="text-text block">{photo.center}</strong>
                        <span className="text-slate-400">{photo.school}</span>
                      </div>
                      <span className="text-slate-500 text-[10px]">{photo.timestamp}</span>
                    </div>

                    <div className="relative h-28 w-full bg-slate-950 rounded-lg overflow-hidden border border-line">
                      <img 
                        src={photo.imageUrl} 
                        alt="Center verification placeholder" 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className={`text-[10px] font-bold uppercase ${
                        photo.status === 'approved' ? 'text-emerald-400' : 'text-yellow-500'
                      }`}>
                        {photo.status === 'approved' ? '✓ Verified' : '● Awaiting Approval'}
                      </span>
                      
                      {photo.status === 'pending' && (
                        <button
                          onClick={() => approvePhoto(photo.id)}
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-[10px] font-bold text-slate-900 transition-colors"
                        >
                          Approve Photo
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Global Concept Version Finder */}
            <SectionCard 
              title="Global Lesson Finder" 
              subtitle="Search alternative explanation methods for kids who need extra help"
            >
              <div className="space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Search e.g. Fractions, Reproduction"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 rounded-xl border border-line bg-bg px-3.5 py-2 text-text placeholder-slate-600 focus:border-accent focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl font-bold text-white transition-colors"
                  >
                    Search
                  </button>
                </form>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {searchResults.length > 0 ? (
                    searchResults.map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-3 rounded-xl border border-line bg-bg space-y-1"
                      >
                        <div className="flex justify-between items-center text-[10px]">
                          <strong className="text-text">{item.version}</strong>
                          <span className="bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-purple-300">
                            {item.level}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                          {item.desc}
                        </p>
                      </div>
                    ))
                  ) : searchQuery ? (
                    <p className="text-xs text-slate-500 italic text-center py-4">No alternative versions found for this concept.</p>
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center py-4">Type a concept above to search the lesson database.</p>
                  )}
                </div>
              </div>
            </SectionCard>

          </div>

        </div>

      </div>

    </div>
  )
}
