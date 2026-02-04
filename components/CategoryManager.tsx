import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Category } from "@/types";
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

interface CategoryManagerProps {
  layerId: number;
  categories: Category[];
  onUpdate: () => void;
}

export default function CategoryManager({
  layerId,
  categories: initialCategories,
  onUpdate,
}: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({});
  const [categories, setCategories] = useState(initialCategories);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        const updates = newItems.map((item, index) => ({
          id: item.id,
          display_order: index + 1,
        }));

        fetch("/api/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "category", updates }),
        }).then(() => onUpdate());

        return newItems;
      });
    }
  };

  const handleCreate = () => {
    setEditingCategory({
      name: "",
      layer_id: layerId,
      display_order: categories.length + 1,
      icon: "",
    });
    setIsEditMode(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsEditMode(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个分类吗？其中的所有技术项也将被删除。")) return;

    try {
      await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      onUpdate();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingCategory.id ? "PUT" : "POST";
      await fetch("/api/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory),
      });

      setIsEditMode(false);
      onUpdate();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
        title="管理分类"
      >
        <Settings2 size={16} />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setIsEditMode(false);
        }}
        title="管理分类"
        className="max-w-xl"
      >
        {isEditMode ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  分类名称
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ""}
                  onChange={(e) =>
                    setEditingCategory((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="例如：Web 框架"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  显示顺序
                </label>
                <input
                  type="number"
                  required
                  value={editingCategory.display_order || 0}
                  onChange={(e) =>
                    setEditingCategory((prev) => ({
                      ...prev,
                      display_order: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
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
                {editingCategory.id ? "保存更改" : "创建分类"}
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
                添加分类
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={categories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {categories.map((category) => (
                    <SortableItem
                      key={category.id}
                      id={category.id}
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 group hover:border-slate-600/50 transition-all"
                    >
                      {(listeners) => (
                        <>
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              {...listeners}
                              className="text-slate-500 cursor-grab active:cursor-grabbing p-1 hover:text-slate-300 focus:outline-none"
                            >
                              <GripVertical size={16} />
                            </div>
                            <div>
                              <div className="font-medium text-slate-200">
                                {category.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                顺序: {category.display_order}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {categories.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                该层级中暂无分类。
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
