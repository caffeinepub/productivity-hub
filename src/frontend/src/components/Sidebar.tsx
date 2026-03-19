import {
  Activity,
  CheckSquare,
  LayoutDashboard,
  Link2,
  Settings,
  StickyNote,
  Timer,
} from "lucide-react";
import type { View } from "../App";

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

const navItems: {
  id: View;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "My Tasks", icon: CheckSquare },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "habits", label: "Habit Tracker", icon: Activity },
  { id: "pomodoro", label: "Pomodoro", icon: Timer },
  { id: "links", label: "Quick Links", icon: Link2 },
];

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-white text-sm font-bold">
            P
          </div>
          <div>
            <h1 className="text-sidebar-foreground font-bold text-sm tracking-tight">
              ProductivePro
            </h1>
            <p className="text-[11px] text-sidebar-foreground/50">
              Your productivity hub
            </p>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sidebar-primary/30 flex items-center justify-center text-sidebar-foreground font-semibold text-sm">
            S
          </div>
          <div>
            <p className="text-sidebar-foreground text-sm font-medium">Sarah</p>
            <p className="text-[11px] text-sidebar-foreground/50">Free plan</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              data-ocid={`nav.${item.id}.link`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-sidebar-primary text-white"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 pb-4 border-t border-sidebar-border pt-4">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}
