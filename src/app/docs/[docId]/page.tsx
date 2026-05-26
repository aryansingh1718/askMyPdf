import ChatWindow from "@/src/components/chatWindow";

export default async function DocPage({
  params,
  searchParams,
}: {
  params: Promise<{ docId: string }>;
  searchParams: Promise<{ fileName?: string }>;
}) {
  const { docId } = await params;
  const { fileName = "Document" } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-3xl mx-auto mb-4">
        <h1 className="text-xl font-semibold text-slate-700">📄 {fileName}</h1>
        <p className="text-sm text-slate-400">Powered by RAG</p>
      </div>
      <ChatWindow docId={docId} fileName={fileName} />
    </main>
  );
}