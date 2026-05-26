import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { vectorStores } from "../store";

export async function ingestDocument(
  text: string,
  docId: string,
  fileName: string
) {
  // Initialize inside function so env vars are available at runtime
  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACE_API_KEY,
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const chunks = await splitter.createDocuments([text], [{ docId, fileName }]);

  const store = await MemoryVectorStore.fromDocuments(chunks, embeddings);
  vectorStores.set(docId, store);

  console.log(`Stored vector store for docId: ${docId}, total stores: ${vectorStores.size}`);

  return { chunksStored: chunks.length };
}

export function getVectorStore(docId: string): MemoryVectorStore | undefined {
  console.log(`Looking for docId: ${docId}, available: ${[...vectorStores.keys()]}`);
  return vectorStores.get(docId);
}