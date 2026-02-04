import { Stats } from '@/types';

interface StatsPanelProps {
  stats: Stats;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stats-card rounded-xl p-5 border border-slate-700/50 bg-slate-900/60 transition-transform hover:transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-emerald-400">{stats.active}</div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <span className="text-emerald-400 text-lg">✓</span>
            </div>
          </div>
          <div className="text-sm text-slate-400">已有技术栈</div>
          <div className="mt-2 text-xs text-emerald-500/70">基础扎实</div>
        </div>

        <div className="stats-card rounded-xl p-5 border border-slate-700/50 bg-slate-900/60 transition-transform hover:transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-amber-400">{stats.missing}</div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <span className="text-amber-400 text-lg">○</span>
            </div>
          </div>
          <div className="text-sm text-slate-400">待建设项</div>
          <div className="mt-2 text-xs text-amber-500/70">需要补充</div>
        </div>

        <div className="stats-card rounded-xl p-5 border border-slate-700/50 bg-slate-900/60 transition-transform hover:transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-blue-400">{stats.total}</div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <span className="text-blue-400 text-lg">📊</span>
            </div>
          </div>
          <div className="text-sm text-slate-400">总技术数</div>
          <div className="mt-2 text-xs text-blue-500/70">全栈覆盖</div>
        </div>

        <div className="stats-card rounded-xl p-5 border border-slate-700/50 bg-slate-900/60 transition-transform hover:transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-purple-400">{stats.coverage}%</div>
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <span className="text-purple-400 text-lg">📈</span>
            </div>
          </div>
          <div className="text-sm text-slate-400">当前成熟度</div>
          <div className="mt-2 text-xs text-purple-500/70">持续提升</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-emerald-600 to-emerald-500 border border-emerald-400"></div>
            <span>已有技术</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-slate-600 to-slate-500 border border-slate-400"></div>
            <span>缺失技术</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-red-500 rounded"></div>
            <span>高优先级 (P0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-amber-500 rounded"></div>
            <span>中优先级 (P1)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/30">NEW</span>
            <span>本次新增技术</span>
          </div>
        </div>
      </div>
    </div>
  );
}
