import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CohereEmbeddings } from "@langchain/cohere";
import { vectorIndex } from "../store";

export async function ingestDocument(
  text: string,
  docId: string,
  fileName: string
) {
  const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY,
    model: "embed-english-v3.0",
  });

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const chunks = await splitter.createDocuments([text], [{ docId, fileName }]);

  // Embed all chunks
  const vectors = await embeddings.embedDocuments(
    chunks.map((c) => c.pageContent)
  );

  // Store in Upstash
  const records = vectors.map((vector, i) => ({
    id: `${docId}_chunk_${i}`,
    vector,
    metadata: {
      docId,
      fileName,
      text: chunks[i].pageContent,
      chunkIndex: i,
    },
  }));

  await vectorIndex.upsert(records);

  return { chunksStored: chunks.length };
}