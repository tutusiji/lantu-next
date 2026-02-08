"use client";

import { useEffect, useState, useMemo } from "react";
import { Layer, Category, TechItem, Stats } from "@/types";
import TechCard from "@/components/TechCard";
import StatsPanel from "@/components/StatsPanel";
import LayerManager from "@/components/LayerManager";
import CategoryManager from "@/components/CategoryManager";
import TechItemManager from "@/components/TechItemManager";
import SolutionsLayer from "@/components/SolutionsLayer";
import LoginManager from "@/components/LoginManager";
import { X, Sun, Moon } from "lucide-react";
import * as Icons from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { isAdmin } = useAuth();

  // 初始化主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // 使用 useMemo 对技术项进行分组，避免每次渲染都创建新引用
  const itemsByCategory = useMemo(() => {
    const map: Record<number, TechItem[]> = {};
    techItems.forEach((item) => {
      if (!map[item.category_id]) map[item.category_id] = [];
      map[item.category_id].push(item);
    });
    return map;
  }, [techItems]);

  // 提取所有唯一标签及其关联的技术项数量
  const allTags = useMemo(() => {
    const tagsMap = new Map<string, number>();
    techItems.forEach((item) => {
      if (item.tags) {
        // 按逗号分割标签，去除空格
        const tags = item.tags.split(',').map(t => t.trim()).filter(t => t);
        tags.forEach(tag => {
          tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
        });
      }
    });
    // 只返回有关联技术项的标签，并按数量降序排序
    return Array.from(tagsMap.entries())
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [techItems]);

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

      const [layersData, categoriesData, itemsData, statsData] = await Promise.all([
        layersRes.json(),
        categoriesRes.json(),
        itemsRes.json(),
        statsRes.json(),
      ]);

      // 批量更新状态以减少不必要的重渲染
      setLayers(layersData);
      setCategories(categoriesData);
      setTechItems(itemsData);
      setStats(statsData);
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

  const handleDeleteTag = async (tagToDelete: string) => {
    try {
      // 获取所有包含该标签的技术项
      const itemsWithTag = techItems.filter(item => 
        item.tags && item.tags.split(',').map(t => t.trim()).includes(tagToDelete)
      );

      // 更新每个技术项，移除该标签
      for (const item of itemsWithTag) {
        const tags = item.tags.split(',').map(t => t.trim()).filter(t => t !== tagToDelete);
        await fetch('/api/tech-items', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id,
            tags: tags.join(', ')
          })
        });
      }

      // 刷新数据
      handleRefresh();
    } catch (error) {
      console.error('删除标签失败:', error);
      alert('删除标签失败，请重试');
    }
  };

  const getFilteredItems = (item: TechItem) => {
    if (filter === "all") return true;
    if (filter === "active") return item.status === "active";
    if (filter === "missing") return item.status === "missing";
    return item.tags.includes(filter);
  };

  const getCategoryItems = (categoryId: number) => {
    const items = itemsByCategory[categoryId] || [];
    return items.filter((item: TechItem) => getFilteredItems(item));
  };

  const getAllCategoryItems = (categoryId: number) => {
    return itemsByCategory[categoryId] || [];
  };

  const getLayerCategories = (layerId: number) => {
    return categories.filter((cat) => cat.layer_id === layerId);
  };

  const renderLayerIcon = (iconName: string) => {
    // @ts-expect-error - 动态图标查找
    const Icon = Icons[iconName];
    if (Icon) return <Icon size={24} />;
    return iconName;
  };

  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-[#0b1120] text-slate-200' : 'min-h-screen bg-gray-50 text-gray-900'}>
      {/* Header */}
      <header className={theme === 'dark' ? 'bg-slate-900/80 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md' : 'bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md shadow-sm'}>
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                云平台技术蓝图图谱
              </h1>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                v2.0 | 全栈技术栈规划（前端+后端+运维+安全）
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* 主题切换按钮 */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <LayerManager layers={layers} onUpdate={handleRefresh} />

              <div className="flex flex-wrap gap-3 text-sm">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-slate-800/50 border border-slate-700'
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                  <span className="text-emerald-400 font-medium">
                    已有 {stats.active}项
                  </span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                  theme === 'dark'
                    ? 'bg-slate-800/50 border border-slate-700'
                    : 'bg-gray-100 border border-gray-300'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    theme === 'dark' ? 'bg-slate-500' : 'bg-gray-400'
                  }`}></div>
                  <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>缺失 {stats.missing}项</span>
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

      {/* Filters - 移动到主内容区域 */}
      <div className="flex gap-6 max-w-[1400px] mx-auto px-4">
        {/* 左侧主内容区 */}
        <main className="flex-1 py-8 space-y-6">
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
                        {categoryItems.map((item: TechItem) => (
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

        {/* 右侧标签栏 */}
        <aside className="w-80 py-8">
          <div className="sticky top-24">
            <div className={`backdrop-blur-md rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-slate-900/40 border border-slate-800/50'
                : 'bg-white border border-gray-200 shadow-lg'
            }`}>
              <div className="flex items-center gap-2 mb-6">
                <span className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>快速筛选</span>
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              
              {/* 基础筛选 */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : theme === 'dark'
                        ? 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 text-slate-300'
                        : 'bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  全部技术
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'active'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : theme === 'dark'
                        ? 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 text-slate-300'
                        : 'bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  ✓ 已有技术
                </button>
                <button
                  onClick={() => setFilter('missing')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'missing'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : theme === 'dark'
                        ? 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 text-slate-300'
                        : 'bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  ○ 缺失技术
                </button>
              </div>

              {/* 标签筛选 */}
              {allTags.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-semibold ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                    }`}>技术标签</span>
                    <span className={`text-xs ${
                      theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
                    }`}>{allTags.length} 个</span>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                    {allTags.map(({ tag, count }) => (
                      <div
                        key={tag}
                        className="group relative"
                      >
                        <button
                          onClick={() => setFilter(tag)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all pr-7 ${
                            filter === tag
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : theme === 'dark'
                                ? 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 text-slate-300'
                                : 'bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {tag} <span className={`text-xs ml-1 ${
                            filter === tag ? 'text-blue-200' : theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
                          }`}>({count})</span>
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteTag(tag)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                            title="删除标签"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Stats Panel */}
      <StatsPanel stats={stats} />
    </div>
  );
}
