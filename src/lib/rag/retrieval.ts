import { getVectorStore } from "./ingest";

export interface RetrievedChunk {
  text: string;
  chunkIndex: number;
  fileName: string;
}

export async function retrieveChunks(
  query: string,
  docId: string,
  topK: number = 4
): Promise<RetrievedChunk[]> {
  const store = getVectorStore(docId);

  if (!store) {
    return [];
  }

  const results = await store.similaritySearch(query, topK);

  return results.map((doc, i) => ({
    text: doc.pageContent,
    chunkIndex: i,
    fileName: doc.metadata?.fileName || "",
  }));
}

export function buildPrompt(
  query: string,
  chunks: RetrievedChunk[]
): string {
  const context = chunks
    .map((c, i) => `[Source ${i + 1}]\n${c.text}`)
    .join("\n\n");

  return `You are a helpful assistant. Answer the user's question using ONLY the context provided below. If the answer is not in the context, say "I couldn't find that in the document."

Context:
${context}

Question: ${query}`;
}