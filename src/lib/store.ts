import { MemoryVectorStore } from "langchain/vectorstores/memory";

declare global {
  var vectorStores: Map<string, MemoryVectorStore> | undefined;
}

if (!global.vectorStores) {
  global.vectorStores = new Map<string, MemoryVectorStore>();
}

export const vectorStores = global.vectorStores;