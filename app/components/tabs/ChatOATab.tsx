interface ChatOATabProps {
  matchedIntentId?: string | null;
}

export default function ChatOATab({ matchedIntentId }: ChatOATabProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-violet-600 bg-clip-text text-transparent">
        Phòng Đàm Phán
      </div>
      {matchedIntentId ? (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl px-6 py-3 text-sm text-purple-700 font-medium">
          🤝 Đang kết nối deal: <span className="font-mono text-xs">{matchedIntentId.slice(0, 8)}...</span>
        </div>
      ) : (
        <p className="text-gray-400">Dự kiến thiết kế giai đoạn tiếp theo.</p>
      )}
    </div>
  );
}

