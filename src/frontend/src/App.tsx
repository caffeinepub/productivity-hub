import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Dashboard from "./components/Dashboard";
import HabitTracker from "./components/HabitTracker";
import Notes from "./components/Notes";
import PomodoroTimer from "./components/PomodoroTimer";
import QuickLinks from "./components/QuickLinks";
import Sidebar from "./components/Sidebar";
import Tasks from "./components/Tasks";

const queryClient = new QueryClient();

export type View =
  | "dashboard"
  | "tasks"
  | "notes"
  | "habits"
  | "pomodoro"
  | "links";

function AppContent() {
  const [view, setView] = useState<View>("dashboard");

  const renderView = () => {
    switch (view) {
      case "tasks":
        return <Tasks />;
      case "notes":
        return <Notes />;
      case "habits":
        return <HabitTracker />;
      case "pomodoro":
        return <PomodoroTimer />;
      case "links":
        return <QuickLinks />;
      default:
        return <Dashboard onNavigate={setView} />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeView={view} onNavigate={setView} />
      <main className="flex-1 overflow-y-auto">
        {renderView()}
        <footer className="px-8 py-4 mt-auto border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()} ProductivePro — Your personal
            productivity hub
          </span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </footer>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
