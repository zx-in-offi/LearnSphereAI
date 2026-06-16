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
    const { data: documents, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }

    return NextResponse.json({ documents: documents || [] });
  } catch (error) {
    console.error("Documents fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await req.json();
    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Verify ownership
    const { data: doc } = await supabase
      .from("documents")
      .select("id")
      .eq("id", documentId)
      .eq("user_id", session.user.id)
      .single();

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete document (cascades to chunks)
    await supabase.from("documents").delete().eq("id", documentId);

    return NextResponse.json({ message: "Document deleted" });
  } catch (error) {
    console.error("Document delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
