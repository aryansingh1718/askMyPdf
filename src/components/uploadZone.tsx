"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadZone() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFile(file: File) {
    if (!file.name.endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Upload failed."); return; }
      router.push(`/docs/${data.docId}?fileName=${encodeURIComponent(data.fileName)}`);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      onClick={() => !uploading && fileInputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      className="w-full cursor-pointer transition-all duration-200 rounded-2xl flex flex-col items-center gap-4 py-12 px-8"
      style={{
        background: dragging ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
        border: `1.5px dashed ${dragging ? "rgba(99,102,241,0.8)" : "rgba(99,102,241,0.35)"}`,
      }}
    >
      <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
        📄
      </div>

      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5">
            {[0, 150, 300].map((d) => (
              <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#6366f1", animationDelay: `${d}ms` }} />
            ))}
          </div>
          <p className="text-sm" style={{ color: "#94a3b8" }}>Processing your PDF...</p>
        </div>
      ) : (
        <>
          <div className="text-center">
            <p className="font-medium mb-1" style={{ color: "#e2e8f0" }}>Drop your PDF here</p>
            <p className="text-sm" style={{ color: "#64748b" }}>or click to browse files</p>
          </div>
          <button
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "#6366f1" }}
          >
            Choose PDF
          </button>
        </>
      )}

      {error && <p className="text-sm text-center" style={{ color: "#f87171" }}>{error}</p>}
    </div>
  );
}