import UploadZone from "@/src/components/uploadZone";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ background: "#0f0f13" }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />
      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-lg">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-widest" style={{
          background: "rgba(99,102,241,0.15)",
          border: "1px solid rgba(99,102,241,0.3)",
          color: "#a5b4fc"
        }}>
          ✦ RAG POWERED
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white leading-tight mb-3">
            Chat with your<br />
            <span style={{ color: "#818cf8" }}>PDFs</span> instantly
          </h1>
          <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: "#94a3b8" }}>
            Upload any document and ask questions. Get answers grounded in your content — with sources.
          </p>
        </div>
        <UploadZone />
      </div>
    </main>
  );
}