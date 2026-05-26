import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

const vectorStores = new Map<string, MemoryVectorStore>();

export async function ingestDocument(
  text: string,
  docId: string,
  fileName: string
) {
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