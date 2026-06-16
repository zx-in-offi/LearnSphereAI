import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/embeddings";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const queryEmbedding = await generateEmbedding(query);

    const { data: results } = await supabase.rpc("match_document_chunks", {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: 0.3,
      match_count: 10,
      filter_user_id: session.user.id,
    });

    // Enrich results with document titles
    if (results && results.length > 0) {
      const docIds = [...new Set(results.map((r: { document_id: string }) => r.document_id))];
      const { data: docs } = await supabase
        .from("documents")
        .select("id, title")
        .in("id", docIds);

      const docMap = new Map((docs || []).map(d => [d.id, d.title]));
      const enriched = results.map((r: { document_id: string; content: string; page_number: number; similarity: number }) => ({
        ...r,
        document_title: docMap.get(r.document_id) || "Untitled",
      }));

      // Track session
      await supabase.from("study_sessions").insert({
        user_id: session.user.id,
        activity_type: "search",
        duration_minutes: 1,
      });

      return NextResponse.json({ results: enriched });
    }

    return NextResponse.json({ results: [] });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
