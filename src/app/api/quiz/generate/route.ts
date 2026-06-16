import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { auth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, questionCount = 5, questionType = "mixed" } = await req.json();
    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Get document chunks
    const { data: chunks } = await supabase
      .from("document_chunks")
      .select("content, page_number")
      .eq("document_id", documentId)
      .eq("user_id", session.user.id)
      .order("chunk_index")
      .limit(20);

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({ error: "No content found" }, { status: 404 });
    }

    const { data: doc } = await supabase
      .from("documents")
      .select("title")
      .eq("id", documentId)
      .single();

    const context = chunks.map(c => c.content).join("\n\n");

    const prompt = `Based on the following study material, generate exactly ${questionCount} quiz questions.
Question types: ${questionType === "mixed" ? "mix of MCQ, True/False, and short answer" : questionType}

Study Material:
${context}

Return a valid JSON array with this exact format:
[
  {
    "type": "mcq",
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "Why this is correct"
  },
  {
    "type": "true_false",
    "question": "Statement to evaluate",
    "correctAnswer": "True",
    "explanation": "Why"
  },
  {
    "type": "short_answer",
    "question": "Question requiring short answer",
    "correctAnswer": "Expected answer",
    "explanation": "Detailed explanation"
  }
]

Return ONLY the JSON array, no other text.`;

    const { text } = await generateText({
      model: google("gemini-2.0-flash-lite"),
      prompt,
    });

    // Parse the JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
    }

    const questions = JSON.parse(jsonMatch[0]);

    // Save quiz
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        user_id: session.user.id,
        document_id: documentId,
        title: `Quiz: ${doc?.title || "Untitled"}`,
        question_count: questions.length,
        questions,
      })
      .select("id")
      .single();

    if (quizError) {
      return NextResponse.json({ error: "Failed to save quiz" }, { status: 500 });
    }

    // Track study session
    await supabase.from("study_sessions").insert({
      user_id: session.user.id,
      document_id: documentId,
      activity_type: "quiz",
      duration_minutes: 1,
    });

    return NextResponse.json({ quizId: quiz!.id, questions });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
