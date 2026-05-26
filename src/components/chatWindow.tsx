"use client";

import { useState, useRef, useEffect } from "react";
import SourceCard from "./sourceCard";
import Link from "next/link";

interface Source { text: string; chunkIndex: number; fileName: string; }
interface Message { role: "user" | "assistant"; content: string; sources?: Source[]; }

export default function ChatWindow({ docId, fileName }: { docId: string; fileName: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `Hi! I've processed **${fileName}**. Ask me anything about it.` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "", sources: [] }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, docId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = data.answer;
        updated[updated.length - 1].sources = data.sources || [];
        return updated;
      });
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = "Something went wrong. Try again.";
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: "#0f0f13" }}>

      {/* Topbar */}
      <div className="flex items-center gap-3 px-5 py-3.5 shrink-0" style={{ background: "#16161d", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/" className="text-sm flex items-center gap-1.5 transition-colors hover:text-white" style={{ color: "#64748b" }}>
          ← Home
        </Link>
        <div className="w-px h-4 mx-1" style={{ background: "rgba(255,255,255,0.1)" }} />
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs" style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
          📄 {fileName}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#34d399" }} />
          <span className="text-xs" style={{ color: "#34d399" }}>RAG active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-5">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm mt-0.5" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc" }}>
                ✦
              </div>
            )}
            <div className="flex flex-col max-w-[78%]">
              <div
                className="px-4 py-3 text-sm leading-relaxed"
                style={msg.role === "user" ? {
                  background: "#6366f1",
                  color: "#fff",
                  borderRadius: "14px 4px 14px 14px",
                } : {
                  background: "#16161d",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#e2e8f0",
                  borderRadius: "4px 14px 14px 14px",
                }}
              >
                {msg.content || (loading && i === messages.length - 1 ? (
                  <span className="flex gap-1.5 items-center py-0.5">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#6366f1", animationDelay: `${d}ms` }} />
                    ))}
                  </span>
                ) : "")}
              </div>
              {msg.sources && msg.sources.length > 0 && <SourceCard sources={msg.sources} />}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 shrink-0" style={{ background: "#16161d", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex gap-3 items-center max-w-3xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask something about your document..."
            disabled={loading}
            className="flex-1 text-sm py-3 px-4 rounded-xl outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e2e8f0",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg transition-opacity disabled:opacity-40"
            style={{ background: "#6366f1" }}
          >
            ↑
          </button>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: "#334155" }}>
          Answers are grounded in your document via RAG
        </p>
      </div>

    </div>
  );
}