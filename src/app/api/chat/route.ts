import { NextRequest, NextResponse } from "next/server";
import { retrieveChunks, buildPrompt } from "@/src/lib/rag/retrieval";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message, docId } = await req.json();

    if (!message || !docId) {
      return NextResponse.json(
        { error: "message and docId are required" },
        { status: 400 }
      );
    }

    const chunks = await retrieveChunks(message, docId);

    if (chunks.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find relevant information in this document.",
        sources: [],
      });
    }

    const prompt = buildPrompt(message, chunks);

    // Get full response without streaming to avoid duplication
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Answer clearly and concisely in plain English. Do not repeat words or phrases.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
      temperature: 0.3,
    });

    const answer =
      completion.choices[0]?.message?.content ||
      "I couldn't find an answer in the document.";

    return NextResponse.json({ answer, sources: chunks });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to get answer" },
      { status: 500 }
    );
  }
}