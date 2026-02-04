interface FilterBarProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

export default function FilterBar({ filter, onFilterChange }: FilterBarProps) {
  const buttons = [
    { id: "all", label: "全部技术" },
    { id: "active", label: "✓ 已有技术" },
    { id: "missing", label: "○ 缺失技术" },
    { id: "frontend", label: "🎨 前端" },
    { id: "backend", label: "⚙️ 后端" },
    { id: "lang", label: "🔤 多语言" },
    { id: "deploy", label: "🚀 发布策略" },
    { id: "monitor", label: "📊 监控告警" },
    { id: "security", label: "🔒 安全合规" },
  ];

  return (
    <div className="bg-slate-900/30 border-b border-slate-800/50 py-4 sticky top-[73px] z-40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
              快速筛选
            </span>
            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {buttons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => onFilterChange(btn.id)}
                className={`
                filter-btn px-4 py-2 rounded-full text-sm font-medium transition-all
                ${
                  filter === btn.id
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                    : "bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300"
                }
              `}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
