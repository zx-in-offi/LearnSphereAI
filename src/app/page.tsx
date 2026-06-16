"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  MessageSquare,
  FileText,
  Brain,
  Search,
  BarChart3,
  BookOpen,
  Quote,
  ArrowRight,
  Upload,
  Zap,
  Shield,
  ChevronRight,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const features = [
  {
    icon: MessageSquare,
    title: "AI Chat with Materials",
    description: "Upload PDFs and ask questions directly from your study content. Get instant, contextual answers.",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    icon: FileText,
    title: "Smart Summarization",
    description: "Generate chapter-wise, topic-wise, or full document summaries for quick revision.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Brain,
    title: "Quiz Generator",
    description: "Auto-create MCQs, True/False, and short-answer assessments from your content.",
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Find information across all your documents instantly with AI-powered search.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Track study sessions, quiz scores, and learning milestones on your dashboard.",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    icon: BookOpen,
    title: "Study Recommendations",
    description: "Get personalized revision plans based on your quiz performance and interaction history.",
    gradient: "from-rose-500 to-red-500",
  },
];

const stats = [
  { value: "10x", label: "Faster Learning" },
  { value: "RAG", label: "Powered Answers" },
  { value: "AI", label: "Quiz Generation" },
  { value: "24/7", label: "Study Assistant" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* ===== Navigation ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-subtle">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">LearnSphere AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-medium text-[var(--muted-fg)] hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm !py-2.5 !px-5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== Hero Section ===== */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background */}
        <div className="absolute inset-0 grid-pattern" />
        <div
          className="glow-orb animate-float"
          style={{
            width: "800px",
            height: "800px",
            background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 60%)",
            top: "-300px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div
          className="glow-orb"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(139,92,246,0.08), transparent 60%)",
            bottom: "0",
            right: "10%",
          }}
        />
        <div
          className="glow-orb"
          style={{
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(6,182,212,0.08), transparent 60%)",
            top: "20%",
            left: "5%",
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-[var(--muted-fg)]">
                Powered by Google Gemini AI
              </span>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Transform Your Study{" "}
            <br />
            <span className="gradient-text">Materials with AI</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-[var(--muted-fg)] max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Upload your PDFs and learning resources, then chat with them using AI. 
            Generate quizzes, summaries, and get personalized study recommendations — all in one platform.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/register" className="btn-primary text-base flex items-center gap-2 !px-8 !py-3.5">
              <Upload className="w-5 h-5" />
              Start Learning Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#features"
              className="btn-secondary text-base flex items-center gap-2 !px-8 !py-3.5"
            >
              See How It Works
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Hero Preview Card */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="glass rounded-2xl p-6 md:p-8 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--border-color)]">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-sm text-[var(--muted-fg)] ml-2">LearnSphere AI Chat</span>
              </div>
              
              <div className="space-y-4 text-left">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
                    <p className="text-sm">Can you explain the concept of photosynthesis from Chapter 3?</p>
                  </div>
                </div>
                
                {/* AI Message */}
                <div className="flex justify-start">
                  <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-[var(--primary)]">LearnSphere AI</span>
                    </div>
                    <p className="text-sm text-[var(--muted-fg)]">
                      Based on your uploaded notes from <span className="text-[var(--accent)]">&quot;Biology Ch.3.pdf&quot;</span>, photosynthesis is the process by which plants convert light energy into chemical energy. The equation is: <code className="text-xs bg-[var(--muted)] px-1.5 py-0.5 rounded">6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂</code>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Quote className="w-3 h-3 text-[var(--accent)]" />
                      <span className="text-xs text-[var(--accent)]">Page 42, Chapter 3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative glow under card */}
            <div
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 rounded-full"
              style={{
                background: "radial-gradient(ellipse, rgba(99,102,241,0.15), transparent 70%)",
                filter: "blur(20px)",
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* ===== Stats Section ===== */}
      <section className="py-16 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="glass rounded-2xl p-6 text-center"
              >
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-[var(--muted-fg)]">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section id="features" className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-[var(--muted-fg)]">
                Everything you need to excel
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Powerful Features for{" "}
              <span className="gradient-text">Smarter Learning</span>
            </h2>
            <p className="text-[var(--muted-fg)] text-lg max-w-2xl mx-auto">
              LearnSphere AI combines cutting-edge AI with intuitive design to create the ultimate study companion.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="card group cursor-default"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--muted-fg)] text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section className="py-20 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How It <span className="gradient-text-accent">Works</span>
            </h2>
            <p className="text-[var(--muted-fg)] text-lg max-w-2xl mx-auto">
              Three simple steps to supercharge your study sessions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Materials",
                description: "Drag and drop your PDFs, notes, and study materials. We process them instantly.",
                icon: Upload,
              },
              {
                step: "02",
                title: "Ask & Learn",
                description: "Chat with your materials using natural language. Get accurate, cited answers.",
                icon: MessageSquare,
              },
              {
                step: "03",
                title: "Track Progress",
                description: "Take AI-generated quizzes, track your scores, and follow personalized study plans.",
                icon: BarChart3,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative"
              >
                <div className="glass rounded-2xl p-8 text-center h-full">
                  <div className="text-6xl font-bold gradient-text opacity-20 mb-4">{item.step}</div>
                  <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-[var(--muted-fg)] text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="glass rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: "radial-gradient(circle at 30% 50%, rgba(99,102,241,0.15), transparent 50%), radial-gradient(circle at 70% 50%, rgba(139,92,246,0.1), transparent 50%)",
              }}
            />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your{" "}
                <span className="gradient-text">Learning?</span>
              </h2>
              <p className="text-[var(--muted-fg)] text-lg mb-8 max-w-xl mx-auto">
                Join students who are already learning faster and smarter with AI-powered study tools.
              </p>
              <Link href="/register" className="btn-primary text-base inline-flex items-center gap-2 !px-8 !py-4">
                <Sparkles className="w-5 h-5" />
                Get Started for Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-[var(--border-color)] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold gradient-text">LearnSphere AI</span>
          </div>
          <p className="text-sm text-[var(--muted-fg)]">
            © {new Date().getFullYear()} LearnSphere AI. Built with Next.js & Gemini AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
