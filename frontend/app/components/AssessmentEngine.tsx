import React, { useState } from 'react';
import PdfViewer from './PdfViewer';

/**
 * AssessmentEngine – orchestrates PDF upload, generation of questions, and submission.
 * It uses the backend endpoints:
 *   POST /api/assessment/generate
 *   POST /api/assessment/submit
 */
export default function AssessmentEngine() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<any>(null);
  const [pdfHash, setPdfHash] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const generate = async () => {
    if (!pdfFile) return;
    const form = new FormData();
    form.append('pdf', pdfFile);
    const resp = await fetch('/api/assessment/generate', {
      method: 'POST',
      body: form,
      // Assuming auth header is injected elsewhere
    });
    const data = await resp.json();
    setQuestions(data);
    // simple hash for demo (base64 of file name + size)
    setPdfHash(btoa(`${pdfFile.name}-${pdfFile.size}`));
  };

  const submit = async () => {
    const payload = {
      pdf_hash: pdfHash,
      answers,
    };
    const resp = await fetch('/api/assessment/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    setResult(data);
  };

  const handleAnswer = (idx: number, value: string) => {
    setAnswers(prev => ({ ...prev, [idx]: value }));
  };

  return (
    <div className="glass-card">
      <h2>Upload PDF to generate interactive assessment</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={generate} disabled={!pdfFile}>Generate Questions</button>

      {pdfFile && <PdfViewer file={pdfFile} />}

      {questions.length > 0 && (
        <div className="questions">
          {questions.map((q, idx) => (
            <div key={idx} className="question-item">
              <p><strong>{q.text}</strong></p>
              {q.options.map((opt: string) => (
                <label key={opt} style={{ display: 'block' }}>
                  <input
                    type="radio"
                    name={`q-${idx}`}
                    value={opt}
                    onChange={() => handleAnswer(idx, opt)}
                  />{' '}{opt}
                </label>
              ))}
            </div>
          ))}
          <button onClick={submit}>Submit Answers</button>
        </div>
      )}

      {result && (
        <div className="result reward-badge">
          <p>Score: {result.score}/{result.max_score}</p>
          <p>Coins earned: {result.coins}</p>
          <p>XP earned: {result.xp}</p>
        </div>
      )}
    </div>
  );
}
