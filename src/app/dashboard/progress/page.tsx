"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, FileText, MessageSquare, Brain, Clock, TrendingUp, Activity, Award } from "lucide-react";

interface ProgressData {
  stats: {
    totalDocuments: number; totalConversations: number;
    totalQuizAttempts: number; totalStudyMinutes: number; averageQuizScore: number;
  };
  recentQuizScores: { score: number; total: number; date: string }[];
  activityByDay: Record<string, number>;
  recentSessions: { duration_minutes: number; activity_type: string; created_at: string }[];
}

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress").then(r => r.json()).then(d => { setData(d); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="skeleton h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  const stats = data?.stats;

  const statCards = [
    { label: "Documents", value: stats?.totalDocuments || 0, icon: FileText, color: "text-indigo-400", bgColor: "from-indigo-500/20 to-blue-500/20" },
    { label: "Conversations", value: stats?.totalConversations || 0, icon: MessageSquare, color: "text-purple-400", bgColor: "from-purple-500/20 to-pink-500/20" },
    { label: "Quizzes Taken", value: stats?.totalQuizAttempts || 0, icon: Brain, color: "text-cyan-400", bgColor: "from-cyan-500/20 to-teal-500/20" },
    { label: "Study Minutes", value: stats?.totalStudyMinutes || 0, icon: Clock, color: "text-amber-400", bgColor: "from-orange-500/20 to-amber-500/20" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold"><span className="gradient-text">Learning Progress</span></h1>
        <p className="text-[var(--muted-fg)] mt-1">Track your study activity and performance</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" initial="initial" animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
        {statCards.map((stat, i) => (
          <motion.div key={i} variants={fadeInUp} transition={{ duration: 0.4 }} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-[var(--muted-fg)]">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Average Quiz Score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold">Quiz Performance</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface)" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="url(#scoreGradient)" strokeWidth="8"
                strokeDasharray={`${(stats?.averageQuizScore || 0) * 2.51} 251`} strokeLinecap="round" />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{stats?.averageQuizScore || 0}%</span>
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold">Average Score</p>
            <p className="text-sm text-[var(--muted-fg)]">Based on {stats?.totalQuizAttempts || 0} quiz attempts</p>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        {data?.recentSessions && data.recentSessions.length > 0 ? (
          <div className="space-y-3">
            {data.recentSessions.slice(0, 10).map((session, i) => {
              const icons: Record<string, typeof BarChart3> = { chat: MessageSquare, quiz: Brain, summary: FileText, search: BarChart3 };
              const Icon = icons[session.activity_type] || Activity;
              const colors: Record<string, string> = { chat: "text-purple-400", quiz: "text-cyan-400", summary: "text-amber-400", search: "text-indigo-400" };
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-[var(--border-color)] last:border-0">
                  <Icon className={`w-4 h-4 ${colors[session.activity_type] || "text-[var(--muted-fg)]"}`} />
                  <span className="text-sm capitalize flex-1">{session.activity_type} session</span>
                  <span className="text-xs text-[var(--muted-fg)]">{session.duration_minutes}m</span>
                  <span className="text-xs text-[var(--muted-fg)]">{new Date(session.created_at).toLocaleDateString()}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted-fg)] text-center py-8">No activity yet. Start studying to track your progress!</p>
        )}
      </motion.div>
    </div>
  );
}
