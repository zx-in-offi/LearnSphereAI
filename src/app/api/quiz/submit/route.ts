import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId, answers } = await req.json();
    const supabase = createServerSupabaseClient();

    // Get quiz questions
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("questions, question_count")
      .eq("id", quizId)
      .eq("user_id", session.user.id)
      .single();

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Grade answers
    const questions = quiz.questions as Array<{
      correctAnswer: string;
      type: string;
    }>;

    let correct = 0;
    const graded = questions.map((q, i) => {
      const userAnswer = answers[i] || "";
      const isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
      if (isCorrect) correct++;
      return { ...q, userAnswer, isCorrect };
    });

    const score = (correct / questions.length) * 100;

    // Save attempt
    await supabase.from("quiz_attempts").insert({
      quiz_id: quizId,
      user_id: session.user.id,
      answers: graded,
      score,
      total_questions: questions.length,
    });

    return NextResponse.json({ score, correct, total: questions.length, graded });
  } catch (error) {
    console.error("Quiz submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
