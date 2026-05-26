interface Source {
  text: string;
  chunkIndex: number;
  fileName: string;
}

export default function SourceCard({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <p className="text-xs tracking-widest" style={{ color: "#475569" }}>SOURCES</p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, i) => (
          <div key={i} className="group relative">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all"
              style={{
                background: "rgba(15,15,19,0.8)",
                border: "1px solid rgba(99,102,241,0.25)",
                color: "#94a3b8",
              }}
            >
              <span className="px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
                {i + 1}
              </span>
              {source.fileName}
            </div>
            <div
              className="absolute bottom-full left-0 mb-2 w-72 p-3 rounded-xl text-xs leading-relaxed z-50 hidden group-hover:block"
              style={{
                background: "#1e1e2a",
                border: "1px solid rgba(99,102,241,0.2)",
                color: "#94a3b8",
              }}
            >
              {source.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}