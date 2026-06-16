import { google } from "@ai-sdk/google";
import { embedMany, embed } from "ai";

const embeddingModel = google.textEmbeddingModel("gemini-embedding-001");

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
    providerOptions: {
      google: {
        outputDimensionality: 768,
      },
    },
  });
  return embedding;
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  // Process in batches of 100 (API limit)
  const batchSize = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: batch,
      providerOptions: {
        google: {
          outputDimensionality: 768,
        },
      },
    });
    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}
