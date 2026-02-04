'use client';

import { useState, useEffect } from 'react';
import { TechItem, Category } from '@/types';

export default function AdminPage() {
  const [techItems, setTechItems] = useState<TechItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<TechItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category_id: 1,
    status: 'active' as 'active' | 'missing',
    priority: '' as 'high' | 'medium' | 'low' | '',
    is_new: 0,
    description: '',
    tags: '',
    display_order: 0,
  });

  const fetchData = async () => {
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        fetch('/api/tech-items'),
        fetch('/api/categories'),
      ]);
      setTechItems(await itemsRes.json());
      setCategories(await categoriesRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingItem) {
        // 更新
        await fetch('/api/tech-items', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingItem.id, ...formData }),
        });
      } else {
        // 新增
        await fetch('/api/tech-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      await fetchData();
      resetForm();
    } catch (error) {
      console.error('Failed to save tech item:', error);
      alert('保存失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: TechItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category_id: item.category_id,
      status: item.status,
      priority: item.priority,
      is_new: item.is_new,
      description: item.description,
      tags: item.tags,
      display_order: item.display_order,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除吗？')) return;

    try {
      await fetch(`/api/tech-items?id=${id}`, { method: 'DELETE' });
      await fetchData();
    } catch (error) {
      console.error('Failed to delete tech item:', error);
      alert('删除失败');
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category_id: 1,
      status: 'active',
      priority: '',
      is_new: 0,
      description: '',
      tags: '',
      display_order: 0,
    });
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            技术栈管理后台
          </h1>
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            返回首页
          </a>
        </div>

        {/* 表单 */}
        <div className="bg-slate-900/60 rounded-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">
            {editingItem ? '编辑技术项' : '新增技术项'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">技术名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">分类</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'missing' })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="active">已有</option>
                <option value="missing">缺失</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">优先级</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' | '' })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">无</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">是否新增</label>
              <select
                value={formData.is_new}
                onChange={(e) => setFormData({ ...formData, is_new: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value={0}>否</option>
                <option value={1}>是</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">排序</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">描述</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">标签 (逗号分隔)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="例如: frontend,backend"
              />
            </div>

            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
              >
                {isLoading ? '保存中...' : editingItem ? '更新' : '新增'}
              </button>
              {editingItem && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                >
                  取消
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 列表 */}
        <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">技术项列表</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4">名称</th>
                  <th className="text-left py-3 px-4">分类</th>
                  <th className="text-left py-3 px-4">状态</th>
                  <th className="text-left py-3 px-4">优先级</th>
                  <th className="text-left py-3 px-4">新增</th>
                  <th className="text-left py-3 px-4">描述</th>
                  <th className="text-right py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {techItems.map((item) => {
                  const category = categories.find((c) => c.id === item.category_id);
                  return (
                    <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{category?.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${item.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                          {item.status === 'active' ? '已有' : '缺失'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {item.priority && (
                          <span className={`px-2 py-1 rounded text-xs ${item.priority === 'high' ? 'bg-red-500/20 text-red-400' : item.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">{item.is_new ? '✓' : ''}</td>
                      <td className="py-3 px-4 text-sm text-slate-400">{item.description}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded mr-2 text-sm"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
