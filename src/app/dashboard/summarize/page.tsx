"use client";

import { useState, useEffect } from "react";
import { useCompletion } from "@ai-sdk/react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, FileText, ChevronDown, Loader2, Copy, Check } from "lucide-react";

interface Document { id: string; title: string; status: string; }

export default function SummarizePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [showDocDropdown, setShowDocDropdown] = useState(false);
  const [summaryType, setSummaryType] = useState("full");
  const [copied, setCopied] = useState(false);

  const { completion, complete, isLoading } = useCompletion({
    api: "/api/summarize",
  });

  useEffect(() => {
    fetch("/api/documents").then(r => r.json()).then(d => {
      setDocuments((d.documents || []).filter((doc: Document) => doc.status === "ready"));
    }).catch(() => {});
  }, []);

  const handleSummarize = async () => {
    if (!selectedDocId) return;
    await complete("", { body: { documentId: selectedDocId, summaryType } });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold"><span className="gradient-text">Summarize</span></h1>
        <p className="text-[var(--muted-fg)] mt-1">Generate intelligent summaries of your documents</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card !p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--muted-fg)] mb-2 block">Document</label>
            <div className="relative">
              <button onClick={() => setShowDocDropdown(!showDocDropdown)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-all text-sm">
                <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-[var(--primary)]" />{selectedDoc ? selectedDoc.title : "Select document"}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showDocDropdown && (
                <div className="absolute left-0 right-0 top-full mt-2 glass rounded-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                  {documents.map(doc => (
                    <button key={doc.id} onClick={() => { setSelectedDocId(doc.id); setShowDocDropdown(false); }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--surface-hover)] transition-colors flex items-center gap-2">
                      <FileText className="w-4 h-4" /><span className="truncate">{doc.title}</span>
                    </button>
                  ))}
                  {documents.length === 0 && <p className="px-4 py-3 text-sm text-[var(--muted-fg)]">Upload documents first</p>}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--muted-fg)] mb-2 block">Summary Type</label>
            <div className="flex gap-2">
              {[
                { value: "full", label: "Full" },
                { value: "chapter", label: "By Topic" },
                { value: "key_points", label: "Key Points" },
              ].map(t => (
                <button key={t.value} onClick={() => setSummaryType(t.value)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${summaryType === t.value ? "bg-[var(--primary)] text-white" : "border border-[var(--border-color)] hover:border-[var(--primary)]/50"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleSummarize} disabled={!selectedDocId || isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
          {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><BookOpen className="w-5 h-5" /> Generate Summary</>}
        </button>
      </motion.div>

      {/* Summary Output */}
      {completion && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card !p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Summary</h2>
            <button onClick={copyToClipboard} className="flex items-center gap-1.5 text-sm text-[var(--muted-fg)] hover:text-[var(--primary)] transition-colors">
              {copied ? <><Check className="w-4 h-4 text-emerald-400" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
          <div className="prose-content text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{completion}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}
