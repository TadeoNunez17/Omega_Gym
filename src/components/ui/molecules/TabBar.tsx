'use client';

interface Tab {
  key: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

export function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div className="flex gap-1 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-3.5 py-2 rounded-sm text-xs font-medium whitespace-nowrap cursor-pointer font-sans transition-all duration-150
            ${active === tab.key
              ? 'bg-accent text-black'
              : 'bg-transparent text-text-2 border border-border hover:bg-surface2'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
