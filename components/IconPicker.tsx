import { useState } from "react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
}

// Common icons suitable for tech layers and categories
const COMMON_ICONS = [
  "Activity",
  "Archive",
  "Award",
  "BarChart",
  "Box",
  "Brain",
  "Briefcase",
  "Bug",
  "Calendar",
  "CheckCircle",
  "Cloud",
  "Code",
  "Coffee",
  "Command",
  "Compass",
  "Cpu",
  "Database",
  "Disc",
  "Edit",
  "Eye",
  "FileCode",
  "Filter",
  "Flag",
  "Folder",
  "Globe",
  "Grid",
  "HardDrive",
  "Hash",
  "Heart",
  "Home",
  "Image",
  "Inbox",
  "Info",
  "Key",
  "Layers",
  "Layout",
  "LifeBuoy",
  "Link",
  "List",
  "Lock",
  "Map",
  "MessageCircle",
  "Monitor",
  "Moon",
  "MousePointer",
  "Music",
  "Package",
  "PieChart",
  "Play",
  "Power",
  "Printer",
  "Radio",
  "RefreshCcw",
  "Save",
  "Search",
  "Server",
  "Settings",
  "Share",
  "Shield",
  "ShoppingBag",
  "Sidebar",
  "Smartphone",
  "Speaker",
  "Star",
  "Sun",
  "Table",
  "Tag",
  "Target",
  "Terminal",
  "Tool",
  "Trash",
  "TrendingUp",
  "Truck",
  "Tv",
  "User",
  "Users",
  "Video",
  "Watch",
  "Wifi",
  "Zap",
];

export function IconPicker({ selectedIcon, onSelect }: IconPickerProps) {
  const [search, setSearch] = useState("");

  const filteredIcons = COMMON_ICONS.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
        />
      </div>

      <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
        {filteredIcons.map((iconName) => {
          // @ts-ignore
          const Icon = Icons[iconName];
          if (!Icon) return null;

          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onSelect(iconName)}
              className={cn(
                "flex items-center justify-center p-2 rounded-lg transition-all",
                selectedIcon === iconName
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-slate-800/30 text-slate-400 hover:bg-slate-700 hover:text-white",
              )}
              title={iconName}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>

      {/* Fallback display for custom emoji or icons not in the list but selected */}
      {selectedIcon && !COMMON_ICONS.includes(selectedIcon) && (
        <div className="text-xs text-slate-500 mt-2">
          Currently selected:{" "}
          <span className="text-white font-mono">{selectedIcon}</span>{" "}
          (Custom/Emoji)
        </div>
      )}
    </div>
  );
}
