"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Trash2, Check, Loader2, AlertCircle, File, X } from "lucide-react";
import { formatFileSize, formatRelativeTime } from "@/lib/utils";

interface Document {
  id: string;
  title: string;
  file_name: string;
  file_size: number;
  page_count: number;
  status: string;
  created_at: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.documents) setDocuments(data.documents);
    } catch { setError("Failed to load documents"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, [fetchDocuments]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true); setUploadProgress(0); setError("");
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 300);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/documents/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUploadProgress(100);
      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => { setUploading(false); setUploadProgress(0); }, 1000);
    }
  }, [fetchDocuments]);

  const handleDelete = async (documentId: string) => {
    if (!confirm("Delete this document?")) return;
    try {
      await fetch("/api/documents", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
      setDocuments(documents.filter((d) => d.id !== documentId));
    } catch { setError("Failed to delete document"); }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"] }, maxFiles: 1,
    maxSize: 10 * 1024 * 1024, disabled: uploading,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold"><span className="gradient-text">Documents</span></h1>
        <p className="text-[var(--muted-fg)] mt-1">Upload and manage your study materials</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragActive ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border-color)] hover:border-[var(--primary)]/50 hover:bg-[var(--surface)]"} ${uploading ? "pointer-events-none opacity-50" : ""}`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-[var(--primary)]" />
            </div>
            {isDragActive ? (
              <p className="text-[var(--primary)] font-medium">Drop your PDF here</p>
            ) : (
              <>
                <p className="font-medium">Drag & drop a PDF, or <span className="text-[var(--primary)]">click to browse</span></p>
                <p className="text-sm text-[var(--muted-fg)]">PDF files up to 10MB</p>
              </>
            )}
          </div>
        </div>
        <AnimatePresence>
          {uploading && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uploading & Processing...</span>
                <span className="text-sm text-[var(--muted-fg)]">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between">
            <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /><span className="text-sm">{error}</span></div>
            <button onClick={() => setError("")}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
        <h2 className="text-lg font-semibold">Your Documents</h2>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
        ) : documents.length === 0 ? (
          <div className="card text-center py-12">
            <File className="w-12 h-12 text-[var(--muted-fg)] mx-auto mb-3" />
            <p className="text-[var(--muted-fg)]">No documents yet. Upload your first PDF to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc, i) => (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card flex items-center gap-4 !p-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.title}</p>
                  <div className="flex items-center gap-3 text-xs text-[var(--muted-fg)] mt-0.5">
                    <span>{formatFileSize(doc.file_size)}</span>
                    {doc.page_count > 0 && <span>{doc.page_count} pages</span>}
                    <span>{formatRelativeTime(doc.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {doc.status === "ready" ? <Check className="w-4 h-4 text-emerald-400" /> : doc.status === "processing" ? <Loader2 className="w-4 h-4 text-amber-400 animate-spin" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                    <span className={`text-xs font-medium capitalize ${doc.status === "ready" ? "text-emerald-400" : doc.status === "processing" ? "text-amber-400" : "text-red-400"}`}>{doc.status}</span>
                  </div>
                  <button onClick={() => handleDelete(doc.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--muted-fg)] hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
