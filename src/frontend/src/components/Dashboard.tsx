import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, Plus, Sun, Timer, TrendingUp } from "lucide-react";
import type { View } from "../App";
import { Priority } from "../backend.d";
import {
  useHabits,
  useNotes,
  usePomodoroStats,
  useQuickLinks,
  useTasks,
  useToggleTask,
} from "../hooks/useQueries";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function getHabitWeeklyPct(completionDates: bigint[]) {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weekAgo = BigInt(now - weekMs) * 1000000n;
  const count = completionDates.filter((d) => d >= weekAgo).length;
  return Math.round((count / 7) * 100);
}

function formatFocusTime(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

interface Props {
  onNavigate: (v: View) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: notes, isLoading: notesLoading } = useNotes();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: links } = useQuickLinks();
  const { data: pomStats } = usePomodoroStats();
  const toggleTask = useToggleTask();

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const incompleteTasks = tasks?.filter((t) => !t.completed) ?? [];
  const completedTasks = tasks?.filter((t) => t.completed) ?? [];
  const focusMinutes = pomStats ? Number(pomStats.today) * 25 : 0;
  const dailyFocus =
    incompleteTasks.find((t) => t.priority === Priority.high) ??
    incompleteTasks[0];

  const todayStart = BigInt(new Date().setHours(0, 0, 0, 0)) * 1000000n;

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-foreground">
              {getGreeting()}, Sarah!
            </h1>
            <Sun className="w-7 h-7 text-warning" />
          </div>
          <p className="text-muted-foreground text-sm mt-1">{dateStr}</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-card border border-border rounded-xl px-5 py-3 shadow-card text-center">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <CheckSquare className="w-3.5 h-3.5" /> Tasks Today
            </div>
            <p className="text-xl font-bold text-foreground">
              {completedTasks.length}/{tasks?.length ?? 0}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl px-5 py-3 shadow-card text-center">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <Timer className="w-3.5 h-3.5" /> Focus
            </div>
            <p className="text-xl font-bold text-foreground">
              {formatFocusTime(focusMinutes)}
            </p>
          </div>
        </div>
      </div>

      {/* Top row */}
      <div className="grid grid-cols-4 gap-5 mb-5">
        {/* Daily Focus */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Daily Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : dailyFocus ? (
              <div>
                <p className="font-semibold text-foreground text-base leading-snug">
                  {dailyFocus.title}
                </p>
                <Badge
                  className="mt-2 text-[11px]"
                  variant={
                    dailyFocus.priority === Priority.high
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {dailyFocus.priority}
                </Badge>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No tasks yet!</p>
            )}
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card className="shadow-card border-border col-span-1">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">My Tasks</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onNavigate("tasks")}
              data-ocid="dashboard.tasks.link"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasksLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : incompleteTasks.length === 0 ? (
              <p
                className="text-xs text-muted-foreground"
                data-ocid="tasks.empty_state"
              >
                No tasks yet — add one!
              </p>
            ) : (
              incompleteTasks.slice(0, 4).map((task, i) => (
                <div
                  key={String(task.id)}
                  className="flex items-center gap-2"
                  data-ocid={`tasks.item.${i + 1}`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask.mutate(task.id)}
                    data-ocid={`tasks.checkbox.${i + 1}`}
                    id={`dash-task-${i}`}
                  />
                  <label
                    htmlFor={`dash-task-${i}`}
                    className="text-xs text-foreground cursor-pointer truncate flex-1"
                  >
                    {task.title}
                  </label>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pomodoro */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Pomodoro</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <p className="text-3xl font-extrabold tabular-nums text-foreground">
              25:00
            </p>
            <p className="text-xs text-muted-foreground">
              {pomStats ? `${pomStats.today} sessions today` : "Ready to focus"}
            </p>
            <Button
              size="sm"
              className="rounded-full w-full"
              onClick={() => onNavigate("pomodoro")}
              data-ocid="dashboard.pomodoro.link"
            >
              Start Session
            </Button>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Notes</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onNavigate("notes")}
              data-ocid="dashboard.notes.link"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {notesLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : !notes || notes.length === 0 ? (
              <p
                className="text-xs text-muted-foreground"
                data-ocid="notes.empty_state"
              >
                No notes yet — create one!
              </p>
            ) : (
              notes.slice(0, 3).map((note, i) => (
                <div
                  key={String(note.id)}
                  className="py-1 border-b border-border last:border-0"
                  data-ocid={`notes.item.${i + 1}`}
                >
                  <p className="text-xs font-medium text-foreground truncate">
                    {note.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Habit Tracker */}
        <Card className="shadow-card border-border col-span-2">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Habit Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => onNavigate("habits")}
              data-ocid="dashboard.habits.link"
            >
              <TrendingUp className="w-3 h-3 mr-1" /> View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {habitsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : !habits || habits.length === 0 ? (
              <p
                className="text-sm text-muted-foreground"
                data-ocid="habits.empty_state"
              >
                No habits yet — start tracking!
              </p>
            ) : (
              habits.slice(0, 4).map((habit, i) => {
                const pct = getHabitWeeklyPct(habit.completionDates);
                const doneToday = habit.completionDates.some(
                  (d) => d >= todayStart,
                );
                return (
                  <div
                    key={String(habit.id)}
                    className="flex items-center gap-3"
                    data-ocid={`habits.item.${i + 1}`}
                  >
                    <div className="w-28 text-xs font-medium text-foreground truncate">
                      {habit.name}
                    </div>
                    <Progress
                      value={pct}
                      className="flex-1 h-2"
                      style={
                        {
                          "--progress-color": habit.color,
                        } as React.CSSProperties
                      }
                    />
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {pct}%
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${doneToday ? "bg-success border-success" : "border-border"}`}
                    />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Quick Links</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onNavigate("links")}
              data-ocid="dashboard.links.link"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {!links || links.length === 0 ? (
              <p
                className="text-xs text-muted-foreground"
                data-ocid="links.empty_state"
              >
                No links yet — add one!
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {links.slice(0, 6).map((link, i) => (
                  <a
                    key={String(link.id)}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-ocid={`links.item.${i + 1}`}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted hover:bg-accent transition-colors text-center"
                  >
                    <span className="text-xl">{link.emoji}</span>
                    <span className="text-[10px] font-medium text-foreground truncate w-full text-center">
                      {link.title}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
