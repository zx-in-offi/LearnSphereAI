import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    const userId = session.user.id;

    // Get stats
    const [docs, convs, quizAttempts, sessions] = await Promise.all([
      supabase.from("documents").select("id", { count: "exact" }).eq("user_id", userId),
      supabase.from("conversations").select("id", { count: "exact" }).eq("user_id", userId),
      supabase.from("quiz_attempts").select("score, total_questions, completed_at").eq("user_id", userId).order("completed_at", { ascending: false }),
      supabase.from("study_sessions").select("duration_minutes, activity_type, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);

    const totalStudyMinutes = (sessions.data || []).reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const avgScore = quizAttempts.data && quizAttempts.data.length > 0
      ? quizAttempts.data.reduce((sum, a) => sum + (a.score || 0), 0) / quizAttempts.data.length
      : 0;

    // Activity by day (last 30 days)
    const activityMap: Record<string, number> = {};
    (sessions.data || []).forEach(s => {
      const day = new Date(s.created_at).toISOString().split("T")[0];
      activityMap[day] = (activityMap[day] || 0) + 1;
    });

    return NextResponse.json({
      stats: {
        totalDocuments: docs.count || 0,
        totalConversations: convs.count || 0,
        totalQuizAttempts: quizAttempts.data?.length || 0,
        totalStudyMinutes,
        averageQuizScore: Math.round(avgScore),
      },
      recentQuizScores: (quizAttempts.data || []).slice(0, 10).map(a => ({
        score: a.score, total: a.total_questions, date: a.completed_at,
      })),
      activityByDay: activityMap,
      recentSessions: (sessions.data || []).slice(0, 20),
    });
  } catch (error) {
    console.error("Progress error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
