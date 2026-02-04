"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { TechItem } from "@/types";
import { Modal } from "./Modal";
import { Edit2, Trash2, Plus, GripVertical, Settings2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

interface TechItemManagerProps {
  categoryId: number;
  items: TechItem[];
  onUpdate: () => void;
}

export default function TechItemManager({
  categoryId,
  items: initialItems,
  onUpdate,
}: TechItemManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<TechItem>>({});
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    // 深度比对 initialItems 和 items，确保所有字段变更都能同步到本地状态
    const serialize = (arr: TechItem[]) => 
      arr.map(i => `${i.id}-${i.status}-${i.name}-${i.display_order}-${i.is_new}`).join('|');
    
    if (serialize(items) !== serialize(initialItems)) {
      setItems(initialItems);
    }
  }, [initialItems, items]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex(
          (item) => item.id === active.id,
        );
        const newIndex = currentItems.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(currentItems, oldIndex, newIndex);

        const updates = newItems.map((item, index) => ({
          id: item.id,
          display_order: index + 1,
        }));

        fetch("/api/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "tech-item", updates }),
        }).then(() => onUpdate());

        return newItems;
      });
    }
  };

  const handleCreate = () => {
    setEditingItem({
      name: "",
      category_id: categoryId,
      status: "active",
      priority: "",
      is_new: 0,
      description: "",
      tags: "",
      display_order: items.length + 1,
    });
    setIsEditMode(true);
  };

  const handleEdit = (item: TechItem) => {
    setEditingItem(item);
    setIsEditMode(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个技术项吗?")) return;

    try {
      await fetch(`/api/tech-items?id=${id}`, { method: "DELETE" });
      onUpdate();
    } catch (error) {
      console.error("Failed to delete tech item:", error);
    }
  };

  const toggleStatus = async (item: TechItem) => {
    const newStatus = item.status === "active" ? "missing" : "active";

    // 更新本地状态（乐观更新）
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)),
    );

    try {
      const res = await fetch("/api/tech-items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      onUpdate(); // 仍然通知父组件，刷新统计信息
    } catch (error) {
      console.error("Failed to toggle status:", error);
      // 如果失败，强制重新从服务器拉取以确保一致性
      onUpdate();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingItem.id ? "PUT" : "POST";
      const res = await fetch("/api/tech-items", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });

      if (!res.ok) throw new Error("Failed to save");

      setIsEditMode(false);
      setEditingItem({});
      onUpdate(); // 触发父组件刷新数据
    } catch (error) {
      console.error("Failed to save tech item:", error);
      alert("保存失败，请重试");
    }
  };

  const getStatusColor = (status?: string) => {
    return status === "active" ? "text-emerald-400" : "text-slate-400";
  };

  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1 opacity-0 group-hover/category:opacity-100"
        title="管理技术项"
      >
        <Settings2 size={12} />
        管理
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setIsEditMode(false);
        }}
        title="管理技术项"
        className="max-w-2xl"
      >
        {isEditMode ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  技术项名称
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="例如: React"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  已有状态
                </label>
                <div
                  onClick={() =>
                    setEditingItem((prev) => ({
                      ...prev,
                      status: prev.status === "active" ? "missing" : "active",
                    }))
                  }
                  className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${editingItem.status === "active" ? "bg-emerald-500" : "bg-slate-700"}`}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${editingItem.status === "active" ? "translate-x-6" : "translate-x-0"}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  优先级
                </label>
                <select
                  value={editingItem.priority || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      priority: e.target.value as
                        | "high"
                        | "medium"
                        | "low"
                        | "",
                    }))
                  }
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">无</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  显示顺序
                </label>
                <input
                  type="number"
                  required
                  value={editingItem.display_order || 0}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      display_order: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.is_new === 1}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        is_new: e.target.checked ? 1 : 0,
                      }))
                    }
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-offset-slate-900"
                  />
                  <span className="text-sm text-slate-300">
                    标记为新技术/热门
                  </span>
                </label>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  描述
                </label>
                <input
                  type="text"
                  value={editingItem.description || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="简要描述..."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  标签 (逗号分隔)
                </label>
                <input
                  type="text"
                  value={editingItem.tags || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      tags: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="前端, 数据库, 等"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
              >
                {editingItem.id ? "保存更改" : "创建技术项"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors text-sm font-medium border border-blue-500/20"
              >
                <Plus size={16} />
                添加技术项
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {items.map((item) => (
                    <SortableItem key={item.id} id={item.id}>
                      {(listeners) => (
                        <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 group hover:border-slate-600/50 transition-all">
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              {...listeners}
                              className="text-slate-500 cursor-grab active:cursor-grabbing p-1 hover:text-slate-300 focus:outline-none"
                            >
                              <GripVertical size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-200 truncate">
                                {item.name}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                顺序: {item.display_order}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border transition-colors ${
                                  item.status === "active"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                }`}
                              >
                                {item.status === "active" ? "已有" : "缺失"}
                              </span>
                              <div
                                onClick={() => toggleStatus(item)}
                                className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${item.status === "active" ? "bg-emerald-500" : "bg-slate-700"}`}
                              >
                                <div
                                  className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${item.status === "active" ? "translate-x-5" : "translate-x-0"}`}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 border-l border-slate-700/50 pl-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id!)}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {items.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                该分类中暂无技术项。
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
