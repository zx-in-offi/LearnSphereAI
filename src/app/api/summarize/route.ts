import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { auth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { documentId, summaryType = "full" } = await req.json();
    if (!documentId) {
      return new Response("Document ID required", { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { data: chunks } = await supabase
      .from("document_chunks")
      .select("content, page_number")
      .eq("document_id", documentId)
      .eq("user_id", session.user.id)
      .order("chunk_index")
      .limit(30);

    if (!chunks || chunks.length === 0) {
      return new Response("No content found", { status: 404 });
    }

    const { data: doc } = await supabase
      .from("documents")
      .select("title")
      .eq("id", documentId)
      .single();

    const context = chunks.map(c => c.content).join("\n\n");

    const prompts: Record<string, string> = {
      full: `Create a comprehensive summary of this document "${doc?.title || "Document"}". Include all key concepts, main arguments, and important details. Use markdown formatting with headers, bullet points, and bold text for emphasis.\n\nContent:\n${context}`,
      chapter: `Create a chapter-by-chapter or section-by-section summary of "${doc?.title || "Document"}". Organize by topic areas with clear headings. Use markdown formatting.\n\nContent:\n${context}`,
      key_points: `Extract the key points and takeaways from "${doc?.title || "Document"}". Present as a concise bulleted list of the most important concepts. Use markdown formatting.\n\nContent:\n${context}`,
    };

    const result = streamText({
      model: google("gemini-2.0-flash-lite"),
      prompt: prompts[summaryType] || prompts.full,
    });

    // Track study session
    await supabase.from("study_sessions").insert({
      user_id: session.user.id,
      document_id: documentId,
      activity_type: "summary",
      duration_minutes: 1,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Summarize error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
