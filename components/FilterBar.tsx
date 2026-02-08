interface FilterBarProps {
  filter: string;
  onFilterChange: (filter: string) => void;
  allTags: { tag: string; count: number }[]; // 标签及其关联的技术项数量
  onDeleteTag: (tag: string) => void; // 删除标签的回调
}

import { X } from "lucide-react";

export default function FilterBar({ filter, onFilterChange, allTags, onDeleteTag }: FilterBarProps) {
  const baseButtons = [
    { id: "all", label: "全部技术" },
    { id: "active", label: "✓ 已有技术" },
    { id: "missing", label: "○ 缺失技术" },
  ];

  // 将标签转换为按钮，显示标签名称和关联数量
  const tagButtons = allTags.map(({ tag, count }) => ({
    id: tag,
    label: `${tag} (${count})`
  }));

  const buttons = [...baseButtons, ...tagButtons];

  const handleDelete = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    if (confirm(`确定要删除标签"${tag}"吗？这将从所有技术项中移除此标签。`)) {
      onDeleteTag(tag);
    }
  };

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
            {buttons.map((btn) => {
              const isTagButton = !['all', 'active', 'missing'].includes(btn.id);
              return (
                <div key={btn.id} className="relative group">
                  <button
                    onClick={() => onFilterChange(btn.id)}
                    className={`
                    filter-btn px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${isTagButton ? 'pr-8' : ''}
                    ${
                      filter === btn.id
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                        : "bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300"
                    }
                  `}
                  >
                    {btn.label}
                  </button>
                  {isTagButton && (
                    <button
                      onClick={(e) => handleDelete(e, btn.id)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                      title="删除标签"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
