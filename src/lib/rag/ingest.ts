import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CohereEmbeddings } from "@langchain/cohere";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { vectorStores } from "../store";

export async function ingestDocument(
  text: string,
  docId: string,
  fileName: string
) {
  const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY,
    model: "embed-english-light-v3.0",
  });

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const chunks = await splitter.createDocuments([text], [{ docId, fileName }]);
  const store = await MemoryVectorStore.fromDocuments(chunks, embeddings);
  vectorStores.set(docId, store);

  return { chunksStored: chunks.length };
}

export function getVectorStore(docId: string): MemoryVectorStore | undefined {
  return vectorStores.get(docId);
}