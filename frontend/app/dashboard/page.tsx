'use client'

import { useState, useEffect } from 'react'
import { StatCard } from '../../components/StatCard'
import { SectionCard } from '../../components/SectionCard'

interface Book {
  id: string
  title: string
  grade: string
  subject: string
  language: string
  centre_id: string
  created_at: string
  node_count: number
}

interface TLNNode {
  node_id: string
  book_id: string
  title: string
  concept: string
  grade: string
  subject: string
  language: string
  asset_ids: string[]
  memory_tags: string[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function DashboardPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  
  // Form State
  const [title, setTitle] = useState('')
  const [grade, setGrade] = useState('')
  const [subject, setSubject] = useState('')
  const [language, setLanguage] = useState('en')
  const [complexFlag, setComplexFlag] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  // Selected State
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [selectedBookNodes, setSelectedBookNodes] = useState<TLNNode[]>([])
  const [loadingNodes, setLoadingNodes] = useState(false)
  const [selectedNode, setSelectedNode] = useState<TLNNode | null>(null)

  // Fetch all books
  const fetchBooks = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/books`)
      if (!res.ok) throw new Error('Failed to fetch books')
      const data = await res.json()
      setBooks(data)
    } catch (err: any) {
      console.error('Error fetching books:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  // Fetch nodes for selected book
  const selectBook = async (book: Book) => {
    setSelectedBook(book)
    setSelectedNode(null)
    try {
      setLoadingNodes(true)
      const res = await fetch(`${API_BASE_URL}/api/books/${book.id}/nodes`)
      if (!res.ok) throw new Error('Failed to fetch nodes for book')
      const data = await res.json()
      setSelectedBookNodes(data)
    } catch (err: any) {
      console.error(err)
      alert(err.message)
    } finally {
      setLoadingNodes(false)
    }
  }

  // Handle Book Upload Ingestion
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      alert('Please select a textbook file (PDF or Image) to parse')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('title', title)
      formData.append('grade', grade)
      formData.append('subject', subject)
      formData.append('language', language)
      formData.append('complex_flag', complexFlag ? 'true' : 'false')
      formData.append('file', file)

      const res = await fetch(`${API_BASE_URL}/api/transform/file`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || errorData.error || 'Parsing failed')
      }

      alert('🎉 Ingestion complete! Book transformed successfully.')
      
      // Reset form
      setTitle('')
      setGrade('')
      setSubject('')
      setComplexFlag(false)
      setFile(null)
      
      // Refresh book list
      fetchBooks()
    } catch (err: any) {
      console.error(err)
      alert(`Ingestion failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Calculate statistics
  const totalBooks = books.length
  const totalNodes = books.reduce((sum, b) => sum + (b.node_count || 0), 0)

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-aasha">Aasha Centre Dashboard</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-text">
            Learning Transformation Overview
          </h1>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <button 
            onClick={fetchBooks}
            className="rounded-xl border border-line bg-panel px-4 py-2 text-xs font-medium text-muted hover:text-text hover:border-accent/40 transition-colors"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Books Ingested" value={totalBooks.toString()} />
        <StatCard label="TLN Nodes Active" value={totalNodes.toString()} />
        <StatCard label="Students Supported" value="64" />
        <StatCard label="Asset Reuse Rate" value="73%" />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Form & Recent Books */}
        <div className="lg:col-span-5 space-y-8">
          {/* Document Ingestion Form */}
          <SectionCard title="Ingest Physical Textbook" subtitle="Upload PDF or Images to parse via Gemini">
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 8 Science Chapter 3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-text placeholder:text-muted/50 focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-text placeholder:text-muted/50 focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Grade / Class *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-text placeholder:text-muted/50 focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-text focus:border-accent focus:outline-none transition-colors"
                >
                  <option value="en">English (en)</option>
                  <option value="hi">Hindi (hi)</option>
                  <option value="ta">Tamil (ta)</option>
                  <option value="te">Telugu (te)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  id="complex"
                  checked={complexFlag}
                  onChange={(e) => setComplexFlag(e.target.checked)}
                  className="h-4 w-4 rounded border-line bg-bg text-accent focus:ring-accent"
                />
                <label htmlFor="complex" className="text-xs font-medium text-muted cursor-pointer select-none">
                  🧪 Contains Math / Complex Science (Uses Gemini 2.5 Pro)
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Textbook File (PDF/Image) *</label>
                <div className="relative border border-dashed border-line rounded-xl p-6 text-center hover:border-accent/40 transition-colors bg-bg/50">
                  <input
                    type="file"
                    required
                    accept="application/pdf,image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-text">
                      {file ? `📄 ${file.name}` : '📁 Drag & drop or click to choose file'}
                    </p>
                    <p className="text-xs text-muted">Supports PDF or textbook images up to 20MB</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white shadow-glow hover:bg-accentGlow transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Ingesting Textbook... (Gemini API)
                  </>
                ) : (
                  '🚀 Ingest & Generate TLN Nodes'
                )}
              </button>
            </form>
          </SectionCard>

          {/* Recent Book Transformations */}
          <SectionCard title="Transformed Textbooks" subtitle="Select a textbook to explore its generated concepts">
            {loading ? (
              <div className="flex justify-center py-6">
                <span className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full" />
              </div>
            ) : books.length === 0 ? (
              <p className="text-sm text-muted text-center py-6">No books transformed yet. Ingest your first textbook above!</p>
            ) : (
              <div className="space-y-3">
                {books.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => selectBook(book)}
                    className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                      selectedBook?.id === book.id
                        ? 'border-accent bg-accent/5 shadow-glow'
                        : 'border-line hover:border-accent/30 bg-panel/30'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-text">{book.title}</p>
                      <p className="text-xs text-muted">
                        Grade {book.grade} · {book.subject} · {book.node_count} nodes
                      </p>
                    </div>
                    <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                      ready
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Column: Node Explorer & Concept Details */}
        <div className="lg:col-span-7 space-y-8">
          {selectedBook ? (
            <SectionCard 
              title={`Concept Graph Explorer — ${selectedBook.title}`} 
              subtitle={`Detailed view of chapters and concept nodes generated by the ${selectedBook.subject.toLowerCase() === 'math' || selectedBook.subject.toLowerCase() === 'physics' ? 'Gemini 2.5 Pro' : 'Gemini 2.5 Flash'} dual-path pipeline`}
            >
              {loadingNodes ? (
                <div className="flex justify-center py-12">
                  <span className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
                </div>
              ) : selectedBookNodes.length === 0 ? (
                <p className="text-sm text-muted text-center py-12">No nodes found for this book.</p>
              ) : (
                <div className="grid gap-6">
                  {/* Visual Node Flow list */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Transformative Learning Nodes</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedBookNodes.map((node) => (
                        <div
                          key={node.node_id}
                          onClick={() => setSelectedNode(node)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedNode?.node_id === node.node_id
                              ? 'border-aasha bg-aasha/5 shadow-aasha'
                              : 'border-line bg-panel hover:border-aasha/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-bg text-aasha border border-aasha/20">
                              {node.node_id}
                            </span>
                            {node.asset_ids.length > 0 && (
                              <span className="text-[10px] bg-success/15 text-success px-2 py-0.5 rounded-full font-medium">
                                🎨 {node.asset_ids.length} Visuals
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-text line-clamp-1">{node.title}</h4>
                          <p className="text-xs text-muted mt-1 line-clamp-2">{node.concept}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selected Node Detail View */}
                  {selectedNode && (
                    <div className="rounded-2xl border border-line bg-panel/50 p-6 space-y-4 animate-fadeIn">
                      <div className="flex items-start justify-between border-b border-line pb-4">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-widest text-aasha">Node Details</span>
                          <h3 className="text-lg font-bold text-text mt-1">{selectedNode.title}</h3>
                        </div>
                        <span className="text-xs font-mono px-2 py-1 rounded bg-bg text-muted border border-line">
                          ID: {selectedNode.node_id}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h5 className="text-xs font-semibold uppercase text-muted mb-1">Concept Summary (Student View)</h5>
                          <p className="text-sm text-text leading-relaxed bg-bg/40 p-4 rounded-xl border border-line/40">
                            {selectedNode.concept}
                          </p>
                        </div>

                        {selectedNode.memory_tags && selectedNode.memory_tags.length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold uppercase text-muted mb-1.5">Cognitive Memory Tags</h5>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedNode.memory_tags.map((tag) => (
                                <span key={tag} className="text-xs bg-line/45 text-muted px-2.5 py-1 rounded-lg border border-line">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedNode.asset_ids && selectedNode.asset_ids.length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold uppercase text-muted mb-1.5">Matched Visual Assets (Aasha Registry)</h5>
                            <div className="flex flex-wrap gap-2">
                              {selectedNode.asset_ids.map((assetId) => (
                                <span key={assetId} className="text-xs bg-success/10 text-success border border-success/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                  <span>⚙️</span> {assetId}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>
          ) : (
            <SectionCard title="Centre Activity Feed" subtitle="Real-time execution log at Annanth Aasha Centre-01">
              <div className="space-y-4">
                {[
                  { time: '09:14', event: 'Book uploaded: Science Grade 7', actor: 'Centre staff' },
                  { time: '09:18', event: '12 TLN nodes generated (73% reuse)', actor: 'TLN Agent' },
                  { time: '09:45', event: 'Student S-1042 completed tln-003 (score 88)', actor: 'Assessment' },
                  { time: '10:02', event: 'Aasha Coin +5 awarded to S-1042', actor: 'Reward system' },
                  { time: '10:15', event: 'NGO impact record verified: 3 nodes', actor: 'Verification' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 text-sm items-start hover:bg-panel/20 p-2 rounded-lg transition-colors">
                    <span className="shrink-0 w-12 text-xs text-muted font-mono pt-0.5">{item.time}</span>
                    <div className="space-y-0.5">
                      <p className="text-text font-medium">{item.event}</p>
                      <p className="text-xs text-muted">{item.actor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  )
}
