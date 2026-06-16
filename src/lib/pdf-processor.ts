import { PDFParse } from "pdf-parse";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import path from "path";
import { pathToFileURL } from "url";

// Set worker source for pdfjs-dist in Next.js server context
if (typeof window === "undefined") {
  try {
    const workerPath = path.resolve(
      process.cwd(),
      "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
    );
    pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
  } catch (err) {
    console.error("Failed to set PDF.js worker path:", err);
  }
}

export interface TextChunk {
  content: string;
  pageNumber: number;
  chunkIndex: number;
  metadata: {
    startChar: number;
    endChar: number;
  };
}

export async function extractTextFromPDF(buffer: Buffer): Promise<{
  text: string;
  pageCount: number;
  pages: string[];
}> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();

    const rawText = result.text;
    const pageCount = result.total;

    // Split text roughly into pages (approximate)
    const avgPageLength = Math.ceil(rawText.length / Math.max(pageCount, 1));
    const pages: string[] = [];
    for (let i = 0; i < pageCount; i++) {
      const start = i * avgPageLength;
      const end = Math.min(start + avgPageLength, rawText.length);
      pages.push(rawText.slice(start, end));
    }

    return {
      text: rawText,
      pageCount,
      pages,
    };
  } finally {
    try {
      await parser.destroy();
    } catch (destroyErr) {
      console.error("Error destroying PDFParse instance:", destroyErr);
    }
  }
}

export function chunkText(
  text: string,
  chunkSize: number = 600,
  overlap: number = 100
): TextChunk[] {
  const chunks: TextChunk[] = [];

  // Clean up the text
  const cleanText = text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (cleanText.length === 0) return chunks;

  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < cleanText.length) {
    let endIndex = startIndex + chunkSize;

    // Try to break at sentence boundaries
    if (endIndex < cleanText.length) {
      const searchRegion = cleanText.slice(endIndex - 50, endIndex + 50);
      const sentenceEnd = searchRegion.search(/[.!?]\s/);
      if (sentenceEnd !== -1) {
        endIndex = endIndex - 50 + sentenceEnd + 2;
      }
    } else {
      endIndex = cleanText.length;
    }

    const content = cleanText.slice(startIndex, endIndex).trim();

    if (content.length > 0) {
      // Estimate page number (rough approximation)
      const pageNumber = Math.floor(
        (startIndex / cleanText.length) * 100
      );

      chunks.push({
        content,
        pageNumber: Math.max(1, Math.ceil(pageNumber / 10)),
        chunkIndex,
        metadata: {
          startChar: startIndex,
          endChar: endIndex,
        },
      });
      chunkIndex++;
    }

    if (endIndex >= cleanText.length) {
      break;
    }

    const nextStartIndex = endIndex - overlap;
    if (nextStartIndex <= startIndex) {
      startIndex = endIndex;
    } else {
      startIndex = nextStartIndex;
    }
  }

  return chunks;
}
