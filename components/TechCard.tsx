import { TechItem } from '@/types';

interface TechCardProps {
  item: TechItem;
}

export default function TechCard({ item }: TechCardProps) {
  const isActive = item.status === 'active';
  const priorityClass = item.priority ? `priority-${item.priority}` : '';

  return (
    <div
      className={`
        tech-card px-3 py-2 rounded-lg text-xs font-medium relative group flex items-center
        transition-all duration-300 cursor-pointer
        ${isActive ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 border border-emerald-400' : 'bg-gradient-to-r from-slate-600 to-slate-500 border border-slate-400 opacity-60 hover:opacity-100'}
        ${priorityClass ? `border-l-4 ${item.priority === 'high' ? 'border-l-red-500' : item.priority === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500'}` : ''}
        hover:transform hover:scale-105 hover:shadow-lg hover:z-10
      `}
    >
      <span className="mr-1.5 text-sm">{isActive ? '✓' : '○'}</span>
      <span className="font-semibold">{item.name}</span>
      {item.is_new === 1 && (
        <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-300 border border-red-500/30">
          NEW
        </span>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none border border-slate-700 shadow-xl">
        <div className="font-semibold text-slate-200 mb-1">{item.name}</div>
        {item.description && <div className="text-slate-400">{item.description}</div>}
      </div>
    </div>
  );
}
