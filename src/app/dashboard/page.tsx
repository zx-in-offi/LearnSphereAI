"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquare,
  FileText,
  Brain,
  BookOpen,
  Upload,
  ArrowRight,
  Sparkles,
  BarChart3,
  Clock,
  TrendingUp,
} from "lucide-react";

const quickActions = [
  {
    href: "/dashboard/chat",
    label: "New Chat",
    description: "Ask questions from your materials",
    icon: MessageSquare,
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    href: "/dashboard/documents",
    label: "Upload Document",
    description: "Add new study materials",
    icon: Upload,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    href: "/dashboard/quiz",
    label: "Generate Quiz",
    description: "Test your knowledge with AI",
    icon: Brain,
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    href: "/dashboard/summarize",
    label: "Summarize",
    description: "Get concise summaries",
    icon: BookOpen,
    gradient: "from-orange-500 to-amber-500",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Student";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, <span className="gradient-text">{firstName}</span> 👋
            </h1>
            <p className="text-[var(--muted-fg)] mt-1">
              Ready to continue your learning journey? Here&apos;s your overview.
            </p>
          </div>
          <Link
            href="/dashboard/chat"
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Start Chatting
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial="initial"
        animate="animate"
        variants={{
          animate: { transition: { staggerChildren: 0.08 } },
        }}
      >
        {[
          { label: "Documents", value: "0", icon: FileText, color: "text-indigo-400" },
          { label: "Conversations", value: "0", icon: MessageSquare, color: "text-purple-400" },
          { label: "Quizzes Taken", value: "0", icon: Brain, color: "text-cyan-400" },
          { label: "Study Hours", value: "0h", icon: Clock, color: "text-amber-400" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            transition={{ duration: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-[var(--muted-fg)]">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href}>
              <motion.div
                className="card group cursor-pointer h-full"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}
                >
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{action.label}</h3>
                <p className="text-xs text-[var(--muted-fg)]">{action.description}</p>
                <ArrowRight className="w-4 h-4 text-[var(--muted-fg)] group-hover:text-[var(--primary)] mt-3 transition-colors" />
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Getting Started Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass rounded-2xl p-8 relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(circle at 80% 50%, rgba(99,102,241,0.1), transparent 50%)",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Getting Started</h3>
              <p className="text-sm text-[var(--muted-fg)]">Complete these steps to unlock all features</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Upload your first document", done: false },
              { label: "Start an AI conversation", done: false },
              { label: "Generate your first quiz", done: false },
              { label: "Check your progress dashboard", done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    step.done
                      ? "border-emerald-500 bg-emerald-500/20"
                      : "border-[var(--border-color)]"
                  }`}
                >
                  {step.done && (
                    <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${step.done ? "text-[var(--muted-fg)] line-through" : ""}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
