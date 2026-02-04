import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Layer } from "@/types";
import { Modal } from "./Modal";
import { IconPicker } from "./IconPicker";
import * as Icons from "lucide-react";
import { Edit2, Trash2, Plus, GripVertical } from "lucide-react";
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

interface LayerManagerProps {
  layers: Layer[];
  onUpdate: () => void;
}

export default function LayerManager({
  layers: initialLayers,
  onUpdate,
}: LayerManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLayer, setEditingLayer] = useState<Partial<Layer>>({});
  const [layers, setLayers] = useState(initialLayers);

  useEffect(() => {
    setLayers(initialLayers);
  }, [initialLayers]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLayers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Prepare updates for backend
        const updates = newItems.map((item, index) => ({
          id: item.id,
          display_order: index + 1,
        }));

        // Trigger backend update
        fetch("/api/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "layer", updates }),
        }).then(() => onUpdate());

        return newItems;
      });
    }
  };

  const handleCreate = () => {
    setEditingLayer({
      name: "",
      icon: "Box",
      display_order: layers.length + 1,
    });
    setIsEditMode(true);
  };

  const handleEdit = (layer: Layer) => {
    setEditingLayer(layer);
    setIsEditMode(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个层级吗？此操作无法撤销。")) return;

    try {
      await fetch(`/api/layers?id=${id}`, { method: "DELETE" });
      onUpdate();
    } catch (error) {
      console.error("Failed to delete layer:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingLayer.id ? "PUT" : "POST";
      await fetch("/api/layers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingLayer),
      });

      setIsEditMode(false);
      onUpdate();
    } catch (error) {
      console.error("Failed to save layer:", error);
    }
  };

  // Helper to render icon (Lucide or Emoji)
  const renderIcon = (iconName: string) => {
    // @ts-ignore
    const Icon = Icons[iconName];
    if (Icon) return <Icon size={20} />;
    return <span className="text-xl leading-none">{iconName}</span>;
  };

  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg border border-slate-700/50 transition-all flex items-center gap-2 text-sm font-medium"
      >
        <Icons.Settings size={16} />
        管理层级
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setIsEditMode(false);
        }}
        title="管理层级"
        className="max-w-2xl"
      >
        {isEditMode ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  层级名称
                </label>
                <input
                  type="text"
                  required
                  value={editingLayer.name || ""}
                  onChange={(e) =>
                    setEditingLayer((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="例如：前端"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  图标
                </label>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                    {editingLayer.icon && renderIcon(editingLayer.icon)}
                  </div>
                  <div className="text-xs text-slate-500">
                    从下方图标库中选择一个图标
                  </div>
                </div>
                <IconPicker
                  selectedIcon={editingLayer.icon || ""}
                  onSelect={(icon) =>
                    setEditingLayer((prev) => ({ ...prev, icon }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  显示顺序
                </label>
                <input
                  type="number"
                  required
                  value={editingLayer.display_order || 0}
                  onChange={(e) =>
                    setEditingLayer((prev) => ({
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
                {editingLayer.id ? "保存更改" : "创建层级"}
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
                添加新层级
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={layers.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {layers.map((layer) => (
                    <SortableItem
                      key={layer.id}
                      id={layer.id}
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
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                              {renderIcon(layer.icon)}
                            </div>
                            <div>
                              <div className="font-medium text-slate-200">
                                {layer.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                顺序: {layer.display_order}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(layer)}
                              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(layer.id)}
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

            {layers.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                暂无层级，请创建一个开始使用。
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
