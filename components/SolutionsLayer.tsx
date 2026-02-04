"use client";

import { Layer, Category, TechItem } from "@/types";
import {
  Edit2,
  Plus,
  Server,
  Database,
  Layout,
  Settings,
  Box,
} from "lucide-react";
import SolutionManager from "./SolutionManager";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

interface SolutionsLayerProps {
  layer: Layer;
  categories: Category[];
  techItems: TechItem[];
  onUpdate: () => void;
}

// 默认列配置，用于兼容旧数据
const DEFAULT_COLUMNS = [
  {
    id: "frontend",
    name: "前端",
    icon: "Layout",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    id: "backend",
    name: "后端",
    icon: "Server",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    id: "devops",
    name: "运维",
    icon: "Settings",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    id: "database",
    name: "数据库",
    icon: "Database",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
];

export default function SolutionsLayer({
  layer,
  categories,
  techItems,
  onUpdate,
}: SolutionsLayerProps) {
  // Group tech items by category
  const getCategoryItems = (categoryId: number) => {
    return techItems.filter((item) => item.category_id === categoryId);
  };

  // Filter items by domain based on tags
  const getDomainItems = (items: TechItem[], domain: string) => {
    return items.filter((item) => item.tags.includes(domain));
  };

  // Parse columns from category icon field (fallback to default)
  const getColumns = (category: Category) => {
    try {
      if (category.icon && category.icon.startsWith("{")) {
        const data = JSON.parse(category.icon);
        if (data.columns && Array.isArray(data.columns)) {
          return data.columns;
        }
      }
    } catch (e) {
      // ignore error
    }
    return DEFAULT_COLUMNS;
  };

  // Icon lookup
  const getIcon = (name: string) => {
    const map: any = { Layout, Server, Settings, Database, Box };
    return map[name] || Box;
  };

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [categories, searchTerm]);

  const { isAdmin } = useAuth();

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsManagerOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsManagerOpen(true);
  };

  return (
    <div className="layer-container rounded-2xl p-6 bg-slate-900/40 backdrop-blur-md border border-slate-800/50">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center text-2xl shadow-lg">
            {layer.icon || "🤖"}
          </span>
          <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {layer.name}
          </span>
        </h2>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索项目..."
              className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all w-64"
            />
          </div>

          {isAdmin && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors text-sm font-medium border border-blue-500/20 shadow-lg shadow-blue-500/5"
            >
              <Plus size={16} />
              新增解决方案
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredCategories.map((category) => {
          const items = getCategoryItems(category.id);
          const columns = getColumns(category);

          return (
            <div
              key={category.id}
              className="bg-slate-800/20 rounded-xl border border-slate-700/50 overflow-hidden"
            >
              <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/50 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-200">
                    {category.name}
                  </h3>
                  {category.icon && category.icon.startsWith("{") && (
                    <div className="text-xs text-slate-400 mt-1">
                      {JSON.parse(category.icon).description}
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                    title="编辑解决方案"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>

              {/* Dynamic Grid: Default 4 columns, auto wrap */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map((col: any) => {
                  const domainItems = getDomainItems(items, col.id);
                  const Icon = getIcon(col.icon);

                  // Use stored colors or defaults
                  const color = col.color || "text-slate-400";
                  const bg = col.bg || "bg-slate-500/10";

                  return (
                    <div key={col.id} className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`p-1.5 rounded-md ${bg} ${color}`}>
                          <Icon size={14} />
                        </div>
                        <span className="text-sm font-medium text-slate-400">
                          {col.name}
                        </span>
                      </div>

                      {domainItems.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {domainItems.map((item) => (
                            <div
                              key={item.id}
                              className={`
                                text-xs px-2.5 py-1 rounded-md border 
                                flex items-center gap-1 group transition-colors
                                ${item.is_new ? "border-blue-500/30 bg-blue-500/10 text-blue-200" : "border-slate-700/50 bg-slate-800/50 text-slate-300"}
                              `}
                            >
                              <span>{item.name}</span>
                              {item.status === "missing" && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full bg-slate-500"
                                  title="Missing"
                                ></span>
                              )}
                              {item.status === "active" && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                                  title="Active"
                                ></span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600 italic py-2 px-1 border border-dashed border-slate-800 rounded-lg">
                          暂无配置
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="text-center py-20 text-slate-500 bg-slate-800/10 rounded-xl border border-slate-800/50 border-dashed">
            {searchTerm
              ? "没有找到匹配的项目"
              : "暂无解决方案项目，请点击右上角新增。"}
          </div>
        )}
      </div>

      <SolutionManager
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        layerId={layer.id}
        category={editingCategory}
        allTechItems={techItems}
        onUpdate={onUpdate}
      />
    </div>
  );
}
