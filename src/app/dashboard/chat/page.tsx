"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles, FileText, ChevronDown, Loader2, User } from "lucide-react";

interface Document { id: string; title: string; status: string; }

export default function ChatPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [showDocDropdown, setShowDocDropdown] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      body: { documentId: selectedDocId || undefined },
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  useEffect(() => {
    fetch("/api/documents").then(r => r.json()).then(d => {
      const ready = (d.documents || []).filter((doc: Document) => doc.status === "ready");
      setDocuments(ready);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-7rem)] flex flex-col">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-4">
        <div>
          <h1 className="text-2xl font-bold"><span className="gradient-text">AI Chat</span></h1>
          <p className="text-sm text-[var(--muted-fg)]">Ask questions about your study materials</p>
        </div>
        {/* Document Selector */}
        <div className="relative">
          <button onClick={() => setShowDocDropdown(!showDocDropdown)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-all text-sm">
            <FileText className="w-4 h-4 text-[var(--primary)]" />
            <span className="max-w-[200px] truncate">{selectedDoc ? selectedDoc.title : "Select Document"}</span>
            <ChevronDown className="w-4 h-4 text-[var(--muted-fg)]" />
          </button>
          {showDocDropdown && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-full mt-2 w-72 glass rounded-xl overflow-hidden z-50">
              <button onClick={() => { setSelectedDocId(""); setShowDocDropdown(false); }} className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--surface-hover)] transition-colors text-[var(--muted-fg)]">
                No document (general chat)
              </button>
              {documents.map(doc => (
                <button key={doc.id} onClick={() => { setSelectedDocId(doc.id); setShowDocDropdown(false); }} className={`w-full px-4 py-3 text-left text-sm hover:bg-[var(--surface-hover)] transition-colors flex items-center gap-2 ${selectedDocId === doc.id ? "text-[var(--primary)]" : ""}`}>
                  <FileText className="w-4 h-4 flex-shrink-0" /><span className="truncate">{doc.title}</span>
                </button>
              ))}
              {documents.length === 0 && <p className="px-4 py-3 text-sm text-[var(--muted-fg)]">No documents uploaded yet</p>}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Start a Conversation</h2>
            <p className="text-[var(--muted-fg)] text-sm max-w-md">
              {selectedDoc ? `Ask anything about "${selectedDoc.title}"` : "Select a document and ask questions about your study materials"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-lg w-full">
              {["Explain the key concepts", "Summarize this chapter", "What are the main topics?", "Create study notes"].map((suggestion, i) => (
                <button key={i} onClick={() => { const e = { target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>; handleInputChange(e); }} className="text-left text-sm px-4 py-3 rounded-xl border border-[var(--border-color)] hover:border-[var(--primary)]/50 hover:bg-[var(--surface)] transition-all text-[var(--muted-fg)]">
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const messageText = message.parts
            .filter((p) => p.type === "text")
            .map((p) => (p as { text: string }).text)
            .join("");

          return (
            <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user" ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 rounded-br-md" : "bg-[var(--surface)] border border-[var(--border-color)] rounded-bl-md"}`}>
                {message.role === "assistant" ? (
                  <div className="prose-content text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{messageText}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{messageText}</p>
                )}
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-[var(--muted-fg)]" />
                </div>
              )}
            </motion.div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="typing-indicator flex items-center gap-1"><span /><span /><span /></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-[var(--border-color)]">
        <form onSubmit={handleFormSubmit} className="flex gap-3">
          <input value={input} onChange={handleInputChange} placeholder={selectedDoc ? `Ask about "${selectedDoc.title}"...` : "Type your question..."} className="input-field flex-1" disabled={isLoading} />
          <button type="submit" disabled={isLoading || !input.trim()} className="btn-primary !p-3 !rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
