"use client";

import { useEffect, useState } from "react";
import { Layer, Category, TechItem, Stats } from "@/types";
import TechCard from "@/components/TechCard";
import FilterBar from "@/components/FilterBar";
import StatsPanel from "@/components/StatsPanel";
import LayerManager from "@/components/LayerManager";
import CategoryManager from "@/components/CategoryManager";
import TechItemManager from "@/components/TechItemManager";
import SolutionsLayer from "@/components/SolutionsLayer";
import LoginManager from "@/components/LoginManager";
import * as Icons from "lucide-react";

export default function Home() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [techItems, setTechItems] = useState<TechItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    active: 0,
    missing: 0,
    total: 0,
    coverage: "0.0",
  });
  const [filter, setFilter] = useState<string>("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchData = async () => {
    try {
      const [layersRes, categoriesRes, itemsRes, statsRes] = await Promise.all([
        fetch("/api/layers", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
        fetch("/api/tech-items", { cache: "no-store" }),
        fetch("/api/stats", { cache: "no-store" }),
      ]);

      setLayers(await layersRes.json());
      setCategories(await categoriesRes.json());
      setTechItems(await itemsRes.json());
      setStats(await statsRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const getFilteredItems = (item: TechItem) => {
    if (filter === "all") return true;
    if (filter === "active") return item.status === "active";
    if (filter === "missing") return item.status === "missing";
    return item.tags.includes(filter);
  };

  const getCategoryItems = (categoryId: number) => {
    return techItems.filter(
      (item) => item.category_id === categoryId && getFilteredItems(item),
    );
  };

  // Only used for passing all items to manager, ignoring filter
  const getAllCategoryItems = (categoryId: number) => {
    return techItems.filter((item) => item.category_id === categoryId);
  };

  const getLayerCategories = (layerId: number) => {
    return categories.filter((cat) => cat.layer_id === layerId);
  };

  const renderLayerIcon = (iconName: string) => {
    // @ts-ignore
    const Icon = Icons[iconName];
    if (Icon) return <Icon size={24} />;
    return iconName;
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200">
      {/* Header */}
      <header className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                云平台技术蓝图图谱
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                v2.0 | 全栈技术栈规划（前端+后端+运维+安全）
              </p>
            </div>

            <div className="flex items-center gap-4">
              <LayerManager layers={layers} onUpdate={handleRefresh} />

              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                  <span className="text-emerald-400 font-medium">
                    已有 {stats.active}项
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
                  <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                  <span className="text-slate-400">缺失 {stats.missing}项</span>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg">
                  覆盖率: {stats.coverage}%
                </div>
              </div>

              <div className="flex items-center gap-4">
                <LoginManager />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <FilterBar filter={filter} onFilterChange={setFilter} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {layers.map((layer) => {
          const layerCategories = getLayerCategories(layer.id);
          // Allow empty layers to be shown so they can be managed, or at least show the container

          if (layer.name === "场景解决方案") {
            return (
              <SolutionsLayer
                key={layer.id}
                layer={layer}
                categories={layerCategories}
                techItems={techItems} // Passing ALL items so SolutionsLayer can filter by category
                onUpdate={handleRefresh}
              />
            );
          }

          return (
            <div
              key={layer.id}
              className="layer-container rounded-2xl p-6 bg-slate-900/40 backdrop-blur-md border border-slate-800/50"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-lg shadow-lg">
                    {renderLayerIcon(layer.icon)}
                  </span>
                  <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    {layer.name}
                  </span>
                </h2>

                <CategoryManager
                  layerId={layer.id}
                  categories={layerCategories}
                  onUpdate={handleRefresh}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {layerCategories.map((category) => {
                  const categoryItems = getCategoryItems(category.id);
                  const allItems = getAllCategoryItems(category.id); // For manager

                  if (
                    categoryItems.length === 0 &&
                    filter !== "all" &&
                    allItems.length > 0
                  )
                    return null;

                  return (
                    <div
                      key={category.id}
                      className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition group/category"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                          {category.name}
                        </h3>
                        <TechItemManager
                          categoryId={category.id}
                          items={allItems}
                          onUpdate={handleRefresh}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {categoryItems.map((item) => (
                          <TechCard key={item.id} item={item} />
                        ))}
                        {categoryItems.length === 0 && filter === "all" && (
                          <div className="text-xs text-slate-600 italic py-2">
                            No items yet
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>

      {/* Stats Panel */}
      <StatsPanel stats={stats} />
    </div>
  );
}
