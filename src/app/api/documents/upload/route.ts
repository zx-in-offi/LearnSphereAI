import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { extractTextFromPDF, chunkText } from "@/lib/pdf-processor";
import { generateEmbeddings } from "@/lib/embeddings";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const userId = session.user.id;
    const fileName = file.name;
    const title = fileName.replace(/\.pdf$/i, "");

    // Create document record
    const { data: document, error: docError } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        title,
        file_name: fileName,
        file_size: file.size,
        status: "processing",
      })
      .select("id")
      .single();

    if (docError || !document) {
      console.error("Document creation error:", docError);
      return NextResponse.json(
        { error: "Failed to create document" },
        { status: 500 }
      );
    }

    // Process PDF in background (non-blocking)
    processPDF(file, document.id, userId).catch((err) => {
      console.error("PDF processing error:", err);
      // Update document status to error
      supabase
        .from("documents")
        .update({ status: "error" })
        .eq("id", document.id)
        .then();
    });

    return NextResponse.json({
      message: "Document uploaded successfully. Processing...",
      documentId: document.id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function processPDF(file: File, documentId: string, userId: string) {
  const supabase = createServerSupabaseClient();

  // Extract text from PDF
  const buffer = Buffer.from(await file.arrayBuffer());
  const { text, pageCount } = await extractTextFromPDF(buffer);

  // Update page count
  await supabase
    .from("documents")
    .update({ page_count: pageCount })
    .eq("id", documentId);

  // Chunk text
  const chunks = chunkText(text);

  if (chunks.length === 0) {
    await supabase
      .from("documents")
      .update({ status: "error" })
      .eq("id", documentId);
    return;
  }

  // Generate embeddings
  const chunkTexts = chunks.map((c) => c.content);
  const embeddings = await generateEmbeddings(chunkTexts);

  // Store chunks with embeddings
  const chunkRecords = chunks.map((chunk, i) => ({
    document_id: documentId,
    user_id: userId,
    content: chunk.content,
    page_number: chunk.pageNumber,
    chunk_index: chunk.chunkIndex,
    metadata: chunk.metadata,
    embedding: JSON.stringify(embeddings[i]),
  }));

  // Insert in batches
  const batchSize = 50;
  for (let i = 0; i < chunkRecords.length; i += batchSize) {
    const batch = chunkRecords.slice(i, i + batchSize);
    await supabase.from("document_chunks").insert(batch);
  }

  // Mark document as ready
  await supabase
    .from("documents")
    .update({ status: "ready" })
    .eq("id", documentId);
}
