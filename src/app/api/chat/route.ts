import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/embeddings";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, documentId, conversationId } = await req.json();
    const userId = session.user.id;
    const supabase = createServerSupabaseClient();

    // Get the latest user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return new Response("Invalid message", { status: 400 });
    }

    // Extract text content from user message (which might be in parts format or content format)
    const lastMessageText = Array.isArray(lastMessage.parts)
      ? lastMessage.parts
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join("")
      : lastMessage.content || "";

    // RAG: Retrieve relevant document chunks
    let contextText = "";
    let citations: { content: string; pageNumber: number; documentId: string }[] = [];

    if (documentId) {
      try {
        const queryEmbedding = await generateEmbedding(lastMessageText);

        const { data: chunks } = await supabase.rpc("match_document_chunks", {
          query_embedding: JSON.stringify(queryEmbedding),
          match_threshold: 0.3,
          match_count: 5,
          filter_document_id: documentId,
          filter_user_id: userId,
        });

        if (chunks && chunks.length > 0) {
          contextText = chunks
            .map(
              (c: { content: string; page_number: number }, i: number) =>
                `[Source ${i + 1}, Page ${c.page_number}]: ${c.content}`
            )
            .join("\n\n");

          citations = chunks.map(
            (c: { content: string; page_number: number; document_id: string }) => ({
              content: c.content.slice(0, 200),
              pageNumber: c.page_number,
              documentId: c.document_id,
            })
          );
        }
      } catch (err) {
        console.error("RAG retrieval error:", err);
      }
    }

    // Build system prompt
    const systemPrompt = `You are LearnSphere AI, an intelligent study assistant. Your role is to help students learn effectively from their study materials.

Guidelines:
- Provide clear, accurate, and educational responses
- When referencing source material, cite the source numbers [Source X]
- Break down complex topics into understandable parts
- Use examples and analogies when helpful
- If asked about content not in the provided context, say so honestly
- Format responses with markdown for readability (headers, lists, bold, code blocks)
- Be encouraging and supportive in tone

${
  contextText
    ? `Here is relevant content from the student's study materials:\n\n${contextText}\n\nUse this context to answer the student's question. Always reference which sources you used.`
    : "No specific document context is available. Answer based on your general knowledge, but inform the student that selecting a document would provide more specific answers."
}`;

    // Save user message to database
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      const { data: conv } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          document_id: documentId || null,
          title: lastMessageText.slice(0, 80),
        })
        .select("id")
        .single();
      activeConversationId = conv?.id;
    }

    if (activeConversationId) {
      await supabase.from("messages").insert({
        conversation_id: activeConversationId,
        role: "user",
        content: lastMessageText,
      });
    }

    // Convert UIMessage[] (parts-based) to ModelMessage[] (content-based) for streamText
    const convertedMessages = messages.map((msg: any) => {
      // Extract text content from parts array (UIMessage format) or use content directly
      const content = Array.isArray(msg.parts)
        ? msg.parts
            .filter((p: any) => p.type === "text")
            .map((p: any) => p.text)
            .join("")
        : msg.content || "";
      return { role: msg.role, content };
    });

    // Stream AI response
    const result = streamText({
      model: google("gemini-2.0-flash-lite"),
      system: systemPrompt,
      messages: convertedMessages,
      onFinish: async ({ text }) => {
        // Save assistant message
        if (activeConversationId) {
          await supabase.from("messages").insert({
            conversation_id: activeConversationId,
            role: "assistant",
            content: text,
            citations: citations,
          });
        }

        // Track study session
        await supabase.from("study_sessions").insert({
          user_id: userId,
          document_id: documentId || null,
          activity_type: "chat",
          duration_minutes: 1,
        });
      },
    });

    return result.toUIMessageStreamResponse({
      headers: {
        "X-Conversation-Id": activeConversationId || "",
        "X-Citations": JSON.stringify(citations),
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
