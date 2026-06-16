"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, FileText, ChevronDown, Loader2, CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy } from "lucide-react";

interface Document { id: string; title: string; status: string; }
interface Question {
  type: string; question: string; options?: string[];
  correctAnswer: string; explanation: string;
  userAnswer?: string; isCorrect?: boolean;
}

export default function QuizPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [showDocDropdown, setShowDocDropdown] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizId, setQuizId] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{ score: number; correct: number; total: number; graded: Question[] } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/documents").then(r => r.json()).then(d => {
      setDocuments((d.documents || []).filter((doc: Document) => doc.status === "ready"));
    }).catch(() => {});
  }, []);

  const generateQuiz = async () => {
    if (!selectedDocId) return;
    setGenerating(true); setError("");
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: selectedDocId, questionCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions);
      setQuizId(data.quizId);
      setAnswers(new Array(data.questions.length).fill(""));
      setCurrentQ(0);
      setSubmitted(false);
      setResults(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz");
    } finally { setGenerating(false); }
  };

  const submitQuiz = async () => {
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    }
  };

  const resetQuiz = () => {
    setQuestions([]); setQuizId(""); setAnswers([]); setCurrentQ(0);
    setSubmitted(false); setResults(null);
  };

  const selectedDoc = documents.find(d => d.id === selectedDocId);
  const q = questions[currentQ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold"><span className="gradient-text">Quiz Generator</span></h1>
        <p className="text-[var(--muted-fg)] mt-1">Test your knowledge with AI-generated questions</p>
      </motion.div>

      {/* Quiz Results */}
      {submitted && results && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">{Math.round(results.score)}%</h2>
          <p className="text-[var(--muted-fg)] mb-6">{results.correct} out of {results.total} correct</p>
          <div className="w-full bg-[var(--surface)] rounded-full h-3 mb-6">
            <div className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${results.score}%` }} />
          </div>
          {/* Graded questions */}
          <div className="space-y-4 text-left mt-8">
            {results.graded.map((gq, i) => (
              <div key={i} className={`card !p-4 border-l-4 ${gq.isCorrect ? "border-l-emerald-500" : "border-l-red-500"}`}>
                <div className="flex items-start gap-2 mb-2">
                  {gq.isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />}
                  <p className="text-sm font-medium">{gq.question}</p>
                </div>
                <p className="text-xs text-[var(--muted-fg)] ml-7">Your answer: <span className={gq.isCorrect ? "text-emerald-400" : "text-red-400"}>{gq.userAnswer || "(empty)"}</span></p>
                {!gq.isCorrect && <p className="text-xs text-emerald-400 ml-7">Correct: {gq.correctAnswer}</p>}
                <p className="text-xs text-[var(--muted-fg)] ml-7 mt-1">{gq.explanation}</p>
              </div>
            ))}
          </div>
          <button onClick={resetQuiz} className="btn-primary mt-6 inline-flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Generate New Quiz
          </button>
        </motion.div>
      )}

      {/* Quiz In Progress */}
      {questions.length > 0 && !submitted && q && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted-fg)]">Question {currentQ + 1} of {questions.length}</span>
            <span className="text-[var(--primary)] font-medium capitalize">{q.type.replace("_", "/")}</span>
          </div>
          <div className="w-full bg-[var(--surface)] rounded-full h-2">
            <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
          </div>

          <div className="card !p-6">
            <p className="text-lg font-medium mb-6">{q.question}</p>
            {q.type === "mcq" && q.options ? (
              <div className="space-y-3">
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => { const a = [...answers]; a[currentQ] = opt; setAnswers(a); }}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${answers[currentQ] === opt ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" : "border-[var(--border-color)] hover:border-[var(--primary)]/50"}`}>
                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                  </button>
                ))}
              </div>
            ) : q.type === "true_false" ? (
              <div className="flex gap-3">
                {["True", "False"].map(opt => (
                  <button key={opt} onClick={() => { const a = [...answers]; a[currentQ] = opt; setAnswers(a); }}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-all font-medium ${answers[currentQ] === opt ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" : "border-[var(--border-color)] hover:border-[var(--primary)]/50"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <input value={answers[currentQ] || ""} onChange={e => { const a = [...answers]; a[currentQ] = e.target.value; setAnswers(a); }}
                className="input-field" placeholder="Type your answer..." />
            )}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
              className="btn-secondary !py-2.5 disabled:opacity-50">Previous</button>
            {currentQ === questions.length - 1 ? (
              <button onClick={submitQuiz} className="btn-primary !py-2.5 flex items-center gap-2">
                Submit Quiz <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setCurrentQ(currentQ + 1)} className="btn-primary !py-2.5 flex items-center gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Setup */}
      {questions.length === 0 && !submitted && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card !p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-[var(--muted-fg)] mb-2 block">Select Document</label>
            <div className="relative">
              <button onClick={() => setShowDocDropdown(!showDocDropdown)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-all text-sm">
                <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-[var(--primary)]" />{selectedDoc ? selectedDoc.title : "Choose a document"}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showDocDropdown && (
                <div className="absolute left-0 right-0 top-full mt-2 glass rounded-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                  {documents.map(doc => (
                    <button key={doc.id} onClick={() => { setSelectedDocId(doc.id); setShowDocDropdown(false); }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--surface-hover)] transition-colors flex items-center gap-2">
                      <FileText className="w-4 h-4 flex-shrink-0" /><span className="truncate">{doc.title}</span>
                    </button>
                  ))}
                  {documents.length === 0 && <p className="px-4 py-3 text-sm text-[var(--muted-fg)]">Upload documents first</p>}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--muted-fg)] mb-2 block">Number of Questions</label>
            <div className="flex gap-2">
              {[3, 5, 10].map(n => (
                <button key={n} onClick={() => setQuestionCount(n)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${questionCount === n ? "bg-[var(--primary)] text-white" : "border border-[var(--border-color)] hover:border-[var(--primary)]/50"}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button onClick={generateQuiz} disabled={!selectedDocId || generating}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {generating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Brain className="w-5 h-5" /> Generate Quiz</>}
          </button>
        </motion.div>
      )}
    </div>
  );
}
