import { NextRequest, NextResponse } from "next/server";
import { parsePDFFromBuffer } from "@/src/lib/pdf/parser";
import { ingestDocument } from "@/src/lib/rag/ingest";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDFs allowed" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await parsePDFFromBuffer(buffer, file.name);

    if (!parsed.text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from PDF" },
        { status: 400 }
      );
    }

    const docId = randomUUID();

    const { chunksStored } = await ingestDocument(
      parsed.text,
      docId,
      file.name
    );

    return NextResponse.json({
      docId,
      fileName: file.name,
      numPages: parsed.numPages,
      chunksStored,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    );
  }
}