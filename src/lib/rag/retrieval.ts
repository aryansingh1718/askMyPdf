import { CohereEmbeddings } from "@langchain/cohere";
import { vectorIndex } from "../store";

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
  const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY,
    model: "embed-english-v3.0",
  });

  const queryVector = await embeddings.embedQuery(query);

  const results = await vectorIndex.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
    filter: `docId = '${docId}'`,
  });

  return results
    .filter((r) => r.metadata)
    .map((r) => ({
      text: r.metadata!.text as string,
      chunkIndex: r.metadata!.chunkIndex as number,
      fileName: r.metadata!.fileName as string,
    }));
}

export function buildPrompt(query: string, chunks: RetrievedChunk[]): string {
  const context = chunks
    .map((c, i) => `[Source ${i + 1}]\n${c.text}`)
    .join("\n\n");

  return `You are a helpful assistant. Answer the user's question using ONLY the context provided below. If the answer is not in the context, say "I couldn't find that in the document."

Context:
${context}

Question: ${query}`;
}