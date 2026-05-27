# AskMyDocs — Architecture Documentation

## What it does

AskMyDocs lets users upload any PDF and chat with it. Answers are grounded strictly in the document's content using a RAG (Retrieval Augmented Generation) pipeline — the LLM never guesses or hallucinates outside the document.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 + TypeScript | Full stack in one repo — API routes + frontend |
| Embeddings | Cohere `embed-english-v3.0` | Free tier, reliable, works globally |
| Vector DB | Upstash Vector | Serverless-friendly, persists across function calls |
| LLM | Groq + LLaMA 3.3 70B | Free, extremely fast inference |
| PDF Parsing | `pdf-parse` (Node.js) | No Python needed, works in serverless |
| Chunking | LangChain `RecursiveCharacterTextSplitter` | JS port of Python LangChain, identical API |
| Deployment | Vercel | Zero config, serverless, pairs perfectly with Upstash |

---

## RAG Pipeline

### Phase 1 — Indexing (runs once on upload)

```
User uploads PDF
       ↓
pdf-parse extracts raw text from buffer
       ↓
RecursiveCharacterTextSplitter splits into chunks
(chunkSize: 500 tokens, chunkOverlap: 50)
       ↓
Cohere embeddings API converts each chunk → vector [384 dimensions]
       ↓
Upstash Vector stores: { id, vector, metadata: { docId, fileName, text, chunkIndex } }
```

### Phase 2 — Query (runs on every user message)

```
User sends a question
       ↓
Cohere embeddings API converts question → query vector
       ↓
Upstash Vector similarity search (cosine) → top 4 matching chunks
filtered by docId so only this document's chunks are searched
       ↓
Prompt construction:
  System: "Answer only from the context below"
  Context: [chunk 1] [chunk 2] [chunk 3] [chunk 4]
  Question: [user query]
       ↓
Groq (LLaMA 3.3 70B) generates grounded answer
       ↓
Response returned with answer + source chunks
```

---

## Key Architecture Decisions

### Why TypeScript instead of Python?
Most RAG tutorials use Python (LangChain, FastAPI, sentence-transformers). This project is built entirely in TypeScript using LangChain JS — keeping the stack unified, deployment simple, and removing the need for a separate Python microservice. The heavy ML computation (embeddings, LLM inference) happens on Cohere and Groq's servers via API calls.

### Why Upstash Vector instead of in-memory storage?
The first implementation used LangChain's `MemoryVectorStore` — a simple in-memory Map. This worked locally but failed on Vercel because each serverless function invocation is stateless and isolated. The vector store saved during upload was gone by the time the chat request came in. Upstash Vector is a hosted vector database that persists across all serverless function calls, solving this completely.

### Why Groq instead of OpenAI?
OpenAI requires a paid account with credits. Groq provides free, extremely fast inference (LLaMA 3.3 70B runs at ~800 tokens/second on Groq) — perfect for a demo project. The API is OpenAI-compatible so switching later is trivial.

### Why Cohere instead of HuggingFace?
HuggingFace Inference API was initially used but `api-inference.huggingface.co` was unreachable on the development network (Indian ISP DNS issue). Cohere's API is reliably accessible globally and provides high-quality embeddings on a generous free tier.

### Why no streaming?
Streaming was implemented initially but caused token duplication bugs due to how Next.js Turbopack handles SSE (Server-Sent Events) in development. Since the LLM response time with Groq is already very fast (~1-2 seconds), streaming was removed in favor of a clean non-streaming response. Streaming can be added back cleanly in a future iteration.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page with PDF upload
│   ├── docs/[docId]/page.tsx     # Chat page per document
│   └── api/
│       ├── upload/route.ts       # POST: parse PDF → chunk → embed → store
│       ├── chat/route.ts         # POST: embed query → retrieve → LLM → answer
│       └── documents/route.ts   # GET: list uploaded documents
├── components/
│   ├── UploadZone.tsx            # Drag-drop PDF uploader
│   ├── ChatWindow.tsx            # Chat UI with message history
│   └── SourceCard.tsx            # Shows retrieved source chunks
└── lib/
    ├── store.ts                  # Upstash Vector client singleton
    ├── pdf/parser.ts             # PDF → raw text extraction
    └── rag/
        ├── ingest.ts             # Chunking + embedding + storing
        └── retrieval.ts          # Query embedding + similarity search + prompt builder
```

---

## Known Limitations

- **No authentication** — anyone with a document URL can chat with it. Adding NextAuth would fix this.
- **No multi-document chat** — each chat session is scoped to one document. Cross-document querying would require merging retrieval results.
- **No chat history sent to LLM** — each question is answered independently without conversation context. Adding message history to the prompt would enable follow-up questions.
- **Free tier limits** — Cohere free tier allows 1000 API calls/month, Upstash Vector free tier allows 10,000 vectors. Sufficient for demos, would need paid plans for production.

---

## Potential Improvements

- Add NextAuth for user authentication and per-user document scoping
- Store document metadata (fileName, uploadDate, pageCount) in PostgreSQL
- Add conversation history to the LLM prompt for follow-up questions
- Implement streaming responses properly using Vercel AI SDK
- Add a PDF viewer with highlighted source passages
- Support multiple file types (DOCX, TXT, web URLs)
