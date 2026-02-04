import { useState, useEffect } from "react";
import { Category, TechItem } from "@/types";
import { Modal } from "./Modal";
import {
  Plus,
  X,
  Layout,
  Server,
  Database,
  Settings,
  Box,
  Trash2,
} from "lucide-react";

interface SolutionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  layerId: number;
  category: Category | null;
  allTechItems: TechItem[];
  onUpdate: () => void;
}

interface TechItemDraft {
  id?: number;
  name: string;
  status: "active" | "missing";
  tags: string;
  is_new?: number; // Added
}

interface ColumnDef {
  id: string;
  name: string;
  icon: string;
  color?: string;
  bg?: string;
}

const DEFAULT_COLUMNS: ColumnDef[] = [
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

export default function SolutionManager({
  isOpen,
  onClose,
  layerId,
  category,
  allTechItems,
  onUpdate,
}: SolutionManagerProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState(""); // Added
  const [items, setItems] = useState<TechItemDraft[]>([]);
  const [deletedItemIds, setDeletedItemIds] = useState<number[]>([]);
  const [columns, setColumns] = useState<ColumnDef[]>(DEFAULT_COLUMNS);

  // State for new column input
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  // Input states for each domain
  const [inputs, setInputs] = useState<Record<string, string>>({});

  // Initialize
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name);

        // Parse columns from icon field
        try {
          if (category.icon && category.icon.startsWith("{")) {
            const data = JSON.parse(category.icon);
            if (Array.isArray(data.columns)) {
              setColumns(data.columns);
            } else {
              setColumns(DEFAULT_COLUMNS);
            }
            setDescription(data.description || ""); // Load description
          } else {
            setColumns(DEFAULT_COLUMNS);
            setDescription("");
          }
        } catch {
          setColumns(DEFAULT_COLUMNS);
          setDescription("");
        }

        // Filter items for this category
        const categoryItems = allTechItems
          .filter((i) => i.category_id === category.id)
          .map((i) => ({
            id: i.id,
            name: i.name,
            status: i.status || "active",
            tags: i.tags,
            is_new: i.is_new, // Load is_new
          }));
        setItems(categoryItems);
      } else {
        setName("");
        setDescription("");
        setItems([]);
        setColumns(DEFAULT_COLUMNS);
      }
      setDeletedItemIds([]);
      setInputs({});
      setIsAddingColumn(false);
      setNewColumnName("");
    }
  }, [isOpen, category, allTechItems]);

  // Icon helper
  const getIcon = (name: string) => {
    const map: any = { Layout, Server, Settings, Database, Box };
    return map[name] || Box;
  };

  const handleAddItem = (columnId: string) => {
    const val = (inputs[columnId] || "").trim();
    if (!val) return;

    setItems((prev) => [
      ...prev,
      {
        name: val,
        status: "active",
        tags: columnId,
      },
    ]);
    setInputs((prev) => ({ ...prev, [columnId]: "" }));
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    const newId = `col_${Date.now()}`;
    const newCol: ColumnDef = {
      id: newId,
      name: newColumnName.trim(),
      icon: "Box", // Default icon
      color: "text-slate-400",
      bg: "bg-slate-500/10",
    };
    setColumns((prev) => [...prev, newCol]);
    setNewColumnName("");
    setIsAddingColumn(false);
  };

  const handleDeleteColumn = (colId: string) => {
    if (
      !confirm(
        "确定要删除此列吗？该列下的技术项标签将失效（技术项保留，但不可见）。",
      )
    )
      return;
    setColumns((prev) => prev.filter((c) => c.id !== colId));
  };

  const handleRemoveItem = (index: number) => {
    const item = items[index];
    if (item.id) {
      setDeletedItemIds((prev) => [...prev, item.id!]);
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleStatus = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, status: item.status === "active" ? "missing" : "active" }
          : item,
      ),
    );
  };

  const toggleNew = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, is_new: item.is_new ? 0 : 1 } : item,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Save Category (with columns and description in icon field)
      const iconData = JSON.stringify({ columns, description });

      let categoryId = category?.id;
      const catMethod = categoryId ? "PUT" : "POST";
      const catBody = {
        id: categoryId,
        name,
        layer_id: layerId,
        display_order: category?.display_order || 0,
        icon: iconData, // Store columns config here
      };

      const catRes = await fetch("/api/categories", {
        method: catMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catBody),
      });

      if (!categoryId) {
        const newCat = await catRes.json();
        categoryId = newCat.id;
      }

      // 2. Process Tech Items
      // A. Delete removed items
      for (const id of deletedItemIds) {
        await fetch(`/api/tech-items?id=${id}`, { method: "DELETE" });
      }

      // B. Create/Update items
      for (const item of items) {
        const body = {
          ...item,
          category_id: categoryId,
          display_order: 0,
        };

        if (item.id) {
          await fetch("/api/tech-items", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        } else {
          await fetch("/api/tech-items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        }
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to save solution:", error);
      alert("保存失败，请重试");
    }
  };

  const handleDeleteCategory = async () => {
    if (!category?.id) return;
    if (!confirm("确定要删除整个解决方案吗？")) return;

    try {
      await fetch(`/api/categories?id=${category.id}`, { method: "DELETE" });
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? "编辑解决方案" : "新增解决方案"}
      className="max-w-5xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              解决方案名称
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
              placeholder="例如：机器人系统"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              项目描述
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
              placeholder="简要描述项目背景或目标"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            技术架构分层
          </h4>
          <button
            type="button"
            onClick={() => setIsAddingColumn(true)}
            className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/20 text-sm flex items-center gap-2 transition-all"
          >
            <Plus size={16} />
            添加分组
          </button>
        </div>

        {isAddingColumn && (
          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <input
              type="text"
              autoFocus
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none"
              placeholder="输入分组名称（如：硬件、嵌入式）"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddColumn();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddColumn}
              className="text-blue-400 text-sm font-medium hover:text-blue-300"
            >
              确认
            </button>
            <button
              type="button"
              onClick={() => setIsAddingColumn(false)}
              className="text-slate-500 text-sm hover:text-slate-300"
            >
              取消
            </button>
          </div>
        )}

        {/* Dynamic Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const domainItems = items.filter((i) => i.tags.includes(col.id));
            const Icon = getIcon(col.icon);
            // Default styling if missing
            const color = col.color || "text-slate-400";

            return (
              <div
                key={col.id}
                className="bg-slate-800/30 rounded-xl border border-slate-700/30 flex flex-col h-full relative group/col"
              >
                <div className="px-3 py-2 border-b border-slate-700/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={color} />
                    <span className="text-sm font-medium text-slate-300">
                      {col.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteColumn(col.id)}
                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover/col:opacity-100 transition-opacity"
                    title="删除此列"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="p-3 flex-1 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputs[col.id] || ""}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          [col.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddItem(col.id);
                        }
                      }}
                      className="flex-1 min-w-0 px-2 py-1 bg-slate-900/50 border border-slate-700/50 rounded text-xs text-white focus:border-blue-500/50 focus:outline-none"
                      placeholder="添加技术..."
                    />
                    <button
                      type="button"
                      onClick={() => handleAddItem(col.id)}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Tags List */}
                  <div className="flex flex-wrap gap-2 content-start overflow-y-auto max-h-[300px]">
                    {domainItems.map((item, idx) => {
                      const realIndex = items.indexOf(item);

                      return (
                        <div
                          key={idx}
                          className={`
                            group flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs
                            transition-colors select-none
                            ${
                              item.status === "active"
                                ? "bg-slate-800/80 border-slate-600/50 text-slate-200"
                                : "bg-slate-800/30 border-slate-700/30 text-slate-500 border-dashed"
                            }
                          `}
                        >
                          <span
                            className="cursor-pointer"
                            onClick={() => toggleStatus(realIndex)}
                            title="点击切换状态"
                          >
                            {item.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(realIndex)}
                            className="text-slate-500 hover:text-red-400 w-3 h-3 flex items-center justify-center opacity-0 group-hover:opacity-100"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between pt-4 border-t border-slate-700/50">
          {category?.id ? (
            <button
              type="button"
              onClick={handleDeleteCategory}
              className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
            >
              删除解决方案
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
